import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fixed-price studio services → Stripe price ids (EUR).
const SERVICE_PRICES: Record<string, string> = {
  "mixage-mastering": "price_1UPcJhKdiXkFQk1fRxQ7RYpP",
  "mixage-mastering-express": "price_1UPcJmKdiXkFQk1fK2jwquSM",
  "stem-mastering": "price_1UPcJoKdiXkFQk1f9zF08Q1A",
  "mixage-hybride": "price_1UPcJoKdiXkFQk1fMJFKUY8H",
  "pack-single": "price_1UPcJpKdiXkFQk1fK1XbngfY",
};

const ALLOWED_ORIGINS = ["https://www.globaldripstudio.fr", "https://globaldripstudio.fr"];
const DEFAULT_ORIGIN = "https://www.globaldripstudio.fr";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    try {
      const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
      const { data } = await admin.rpc("check_rate_limit", { _key: `svcpay:${ip}`, _max_count: 15, _window_seconds: 3600 });
      if (data === false) return json({ error: "Trop de requêtes. Réessayez plus tard." }, 429);
    } catch (e) {
      console.error("rate limit error", e);
    }

    const body = await req.json().catch(() => ({}));
    const serviceId = typeof body?.serviceId === "string" ? body.serviceId : "";
    const lang = body?.lang === "en" ? "en" : "fr";
    const price = SERVICE_PRICES[serviceId];
    if (!price) return json({ error: "Service inconnu" }, 400);

    const origin = req.headers.get("origin") ?? "";
    const validOrigin =
      ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".lovable.app") || origin.startsWith("http://localhost")
        ? origin
        : DEFAULT_ORIGIN;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price, quantity: 1 }],
      mode: "payment",
      locale: lang,
      phone_number_collection: { enabled: true },
      metadata: { service_id: serviceId },
      success_url: `${validOrigin}/payment-success?service=${encodeURIComponent(serviceId)}`,
      cancel_url: `${validOrigin}${lang === "en" ? "/en" : "/"}#services`,
    });
    return json({ url: session.url });
  } catch (error) {
    console.error("service payment error", error);
    return json({ error: "Une erreur est survenue. Veuillez réessayer." }, 500);
  }
});
