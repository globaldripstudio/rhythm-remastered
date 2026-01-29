import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, phone, service, message }: ContactRequest = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      throw new Error("Champs requis manquants");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Format d'email invalide");
    }

    const serviceLabel = serviceLabels[service] || service || "Non spécifié";

    // Send email to studio
    const emailResponse = await resend.emails.send({
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
                <div class="value">${firstName} ${lastName}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">📞 Téléphone</div>
                <div class="value">${phone || "Non renseigné"}</div>
              </div>
              <div class="field">
                <div class="label">🎛️ Service souhaité</div>
                <div class="value">${serviceLabel}</div>
              </div>
              <div class="field">
                <div class="label">💬 Message</div>
                <div class="message-box">${message.replace(/\n/g, "<br>")}</div>
              </div>
            </div>
            <div class="footer">
              Envoyé depuis le formulaire de contact Global Drip Studio
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

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
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
