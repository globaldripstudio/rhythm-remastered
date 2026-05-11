import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Persistent rate limiting via DB RPC (shared across instances).
const RATE_LIMIT_MAX = 3; // Max 3 contact requests per hour per IP
const RATE_LIMIT_WINDOW_S = 60 * 60; // 1 hour
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "application/pdf", "audio/mpeg", "audio/wav", "audio/mp3", "audio/x-wav",
  "audio/aac", "audio/flac", "audio/ogg", "image/jpeg", "image/png",
  "image/gif", "application/zip", "application/x-zip-compressed"
];

async function isRateLimited(ip: string): Promise<boolean> {
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const { data, error } = await admin.rpc("check_rate_limit", {
      _key: `contact:${ip}`,
      _max_count: RATE_LIMIT_MAX,
      _window_seconds: RATE_LIMIT_WINDOW_S,
    });
    if (error) {
      console.error("rate_limit RPC error", error);
      return false; // fail-open to avoid locking out legitimate users on RPC failure
    }
    return data === false;
  } catch (e) {
    console.error("rate_limit unexpected error", e);
    return false;
  }
}

interface ContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  attachmentData?: string | null; // Base64 encoded file data
  attachmentName?: string | null;
  attachmentType?: string | null;
}

const serviceLabels: Record<string, string> = {
  "mixage": "Mixage",
  "mixage-mastering": "Mixage + Mastering",
  "mixage-mastering-express": "Mixage + Mastering Express",
  "sound-design": "Sound Design",
  "enregistrement-studio": "Enregistrement Studio",
  "enregistrement-terrain": "Enregistrement Terrain",
  "composition-beatmaking": "Composition/Beatmaking",
  "direction-artistique": "Direction Artistique/Arrangement",
  "formation": "Formation MAO/Mixage",
};

// Input length limits
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_PHONE_LENGTH = 30;
const MAX_MESSAGE_LENGTH = 2000;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    // Check rate limit BEFORE processing any data (including file uploads)
    if (await isRateLimited(clientIp)) {
      console.log(`Rate limit exceeded for contact form from IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ success: false, error: "Trop de requêtes. Veuillez réessayer plus tard." }),
        { 
          headers: { "Content-Type": "application/json", ...corsHeaders },
          status: 429 
        }
      );
    }

    const { firstName, lastName, email, phone, service, message, attachmentData, attachmentName, attachmentType }: ContactRequest = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Champs requis manquants" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate input lengths
    if (firstName.length > MAX_NAME_LENGTH || lastName.length > MAX_NAME_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: "Nom trop long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (email.length > MAX_EMAIL_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: "Email trop long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (phone && phone.length > MAX_PHONE_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: "Téléphone trop long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: "Message trop long (max 2000 caractères)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Format d'email invalide" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ success: false, error: "Configuration serveur manquante" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Save contact lead to database
    await supabaseAdmin.from('contact_leads').insert({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      service: service || null,
      message: message.trim(),
    });

    // Process attachment if present
    let attachmentUrl: string | null = null;
    let safeAttachmentName: string | null = null;

    if (attachmentData && attachmentName && attachmentType) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(attachmentType)) {
        return new Response(
          JSON.stringify({ success: false, error: "Type de fichier non supporté" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Decode base64 and validate size
      const binaryData = Uint8Array.from(atob(attachmentData), c => c.charCodeAt(0));
      
      if (binaryData.length > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({ success: false, error: "Fichier trop volumineux (max 10 Mo)" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const fileExt = attachmentName.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('contact-attachments')
        .upload(fileName, binaryData, { contentType: attachmentType, upsert: false });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return new Response(
          JSON.stringify({ success: false, error: "Erreur lors de l'upload du fichier" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { data: signedData, error: signedError } = await supabaseAdmin.storage
        .from('contact-attachments')
        .createSignedUrl(fileName, 60 * 60 * 24 * 7);

      if (!signedError) attachmentUrl = signedData?.signedUrl || null;
      safeAttachmentName = attachmentName;
    }

    // Sanitize inputs for HTML email (escape HTML entities)
    const escapeHtml = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const safeFirstName = escapeHtml(firstName.trim());
    const safeLastName = escapeHtml(lastName.trim());
    const safeEmail = escapeHtml(email.trim());
    const safePhone = escapeHtml((phone || "").trim());
    const safeMessage = escapeHtml(message.trim());
    const escapedAttachmentName = safeAttachmentName ? escapeHtml(safeAttachmentName) : null;

    const serviceLabel = serviceLabels[service] || escapeHtml(service || "Non spécifié");

    // Build attachment section if present
    const attachmentSection = attachmentUrl && escapedAttachmentName ? `
      <div class="field">
        <div class="label">📎 Pièce jointe</div>
        <div class="value"><a href="${attachmentUrl}" target="_blank" rel="noopener noreferrer">${escapedAttachmentName}</a></div>
      </div>
    ` : '';

    // Send email to studio
    await resend.emails.send({
      from: "Global Drip Studio <onboarding@resend.dev>",
      to: ["globaldripstudio@gmail.com"],
      replyTo: email,
      subject: `Nouvelle demande de réservation - ${serviceLabel}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #1f2937; margin-top: 4px; }
            .message-box { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 10px; }
            .footer { text-align: center; padding: 15px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎵 Nouvelle demande de réservation</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Nom complet</div>
                <div class="value">${safeFirstName} ${safeLastName}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email</div>
                <div class="value"><a href="mailto:${safeEmail}">${safeEmail}</a></div>
              </div>
              <div class="field">
                <div class="label">📞 Téléphone</div>
                <div class="value">${safePhone || "Non renseigné"}</div>
              </div>
              <div class="field">
                <div class="label">🎛️ Service souhaité</div>
                <div class="value">${serviceLabel}</div>
              </div>
              <div class="field">
                <div class="label">💬 Message</div>
                <div class="message-box">${safeMessage.replace(/\n/g, "<br>")}</div>
              </div>
              ${attachmentSection}
            </div>
            <div class="footer">
              Envoyé depuis le formulaire de contact Global Drip Studio
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Contact email sent successfully from IP: ${clientIp}`);

    return new Response(JSON.stringify({ success: true, message: "Email envoyé avec succès" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Une erreur est survenue. Veuillez réessayer." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
