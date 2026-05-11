import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Persistent rate limiting via DB RPC.
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_S = 60 * 60;

async function isRateLimited(ip: string): Promise<boolean> {
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const { data, error } = await admin.rpc("check_rate_limit", {
      _key: `payment:${ip}`,
      _max_count: RATE_LIMIT_MAX,
      _window_seconds: RATE_LIMIT_WINDOW_S,
    });
    if (error) {
      console.error("rate_limit RPC error", error);
      return false;
    }
    return data === false;
  } catch (e) {
    console.error("rate_limit unexpected error", e);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    // Check rate limit
    if (await isRateLimited(clientIp)) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Trop de requêtes. Veuillez réessayer plus tard." }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429 
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get and validate origin for redirect URLs
    const origin = req.headers.get("origin");
    const allowedOrigins = [
      "https://rhythm-remastered.lovable.app",
      "https://id-preview--992e59f6-6d55-4c30-bbff-4dd104bca97d.lovable.app"
    ];
    
    const validOrigin = origin && allowedOrigins.some(allowed => 
      origin === allowed || origin.endsWith('.lovable.app')
    ) ? origin : "https://rhythm-remastered.lovable.app";

    // Create a one-time payment session (guest checkout supported)
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: "price_1SucrwKdiXkFQk1fjY6wQKti",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${validOrigin}/payment-success`,
      cancel_url: `${validOrigin}/ebook`,
    });

    console.log(`Payment session created for IP: ${clientIp}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(JSON.stringify({ error: "Une erreur est survenue. Veuillez réessayer." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
