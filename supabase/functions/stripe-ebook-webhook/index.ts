import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { provisionCustomer, sendAccessEmail } from "../_shared/ebook-access.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SERVICE_IDS = new Set(["mixage-mastering", "mixage-mastering-express", "stem-mastering", "mixage-hybride"]);
const hashToken = async (token: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));

async function sendServiceUploadEmail(email: string, serviceId: string, link: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY missing");
  const from = Deno.env.get("EBOOK_FROM_EMAIL") || "Global Drip Studio <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      reply_to: "globaldripstudio@gmail.com",
      subject: "Votre commande — envoi sécurisé de vos fichiers",
      html: `<!doctype html><html><body style="margin:0;background:#fff;font-family:Arial,sans-serif;color:#1f2937"><div style="max-width:560px;margin:0 auto;padding:24px"><div style="background:#0f0f10;color:#fff;padding:20px;border-radius:8px 8px 0 0"><h1 style="margin:0;font-size:20px">Paiement confirmé</h1><p style="margin:6px 0 0;color:#f97316">Global Drip Studio</p></div><div style="border:1px solid #e5e7eb;border-top:0;padding:20px;border-radius:0 0 8px 8px"><p>Merci pour votre commande <strong>${escapeHtml(serviceId)}</strong>.</p><p>Déposez vos fichiers directement dans votre espace privé. Aucun lien WeTransfer ou Drive n’est nécessaire.</p><p style="text-align:center;margin:24px 0"><a href="${escapeHtml(link)}" style="background:#f97316;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold">Déposer mes fichiers</a></p><p style="font-size:13px;color:#6b7280">Ce lien personnel donne accès uniquement à votre commande. Chaque fichier peut peser jusqu’à 2 Go. Pour un projet plus volumineux, répondez à cet e-mail.</p></div></div></body></html>`,
    }),
  });
  if (!res.ok) throw new Error(`Service email failed: ${res.status}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_EBOOK_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      console.error("Missing signature or webhook secret");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email || session.customer_email;

      if (!customerEmail) {
        console.error("No email found in checkout session");
        return new Response(JSON.stringify({ error: "No email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Use service role to bypass RLS
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const serviceId = session.metadata?.service_id ?? "";
      if (SERVICE_IDS.has(serviceId)) {
        const email = customerEmail.toLowerCase();
        const accessTokenHash = await hashToken(session.id);
        const { data: order, error: orderError } = await supabaseAdmin
          .from("service_orders")
          .upsert({ stripe_session_id: session.id, service_id: serviceId, customer_email: email, access_token_hash: accessTokenHash }, { onConflict: "stripe_session_id" })
          .select("id")
          .single();
        if (orderError || !order) throw orderError ?? new Error("Order creation failed");
        const link = `https://www.globaldripstudio.fr/service-files?order=${encodeURIComponent(order.id)}&token=${encodeURIComponent(session.id)}`;
        try { await sendServiceUploadEmail(email, serviceId, link); } catch (error) { console.error("Service email failed", error); }
        return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Insert purchase (upsert to handle duplicate emails)
      const { error: insertError } = await supabaseAdmin
        .from("ebook_purchases")
        .upsert(
          {
            email: customerEmail.toLowerCase(),
            stripe_session_id: session.id,
          },
          { onConflict: "email" }
        );

      if (insertError) {
        console.error("Error inserting purchase:", insertError);
        return new Response(JSON.stringify({ error: "Database error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Ebook purchase recorded for: ${customerEmail}`);

      // Provision the reader account with a fresh access code and email it.
      const email = customerEmail.toLowerCase();
      const provisioned = await provisionCustomer(supabaseAdmin, email);
      if ("error" in provisioned) {
        console.error("Provisioning failed:", provisioned.error);
      } else {
        try {
          await sendAccessEmail(email, provisioned.code, "https://www.globaldripstudio.fr");
        } catch (e) {
          console.error("Access email failed:", e);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
