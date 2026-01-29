import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    // Verify user is authenticated
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    // Verify this is the admin user
    if (userData.user.email !== "globaldripstudio@gmail.com") {
      throw new Error("Unauthorized access");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Fetch Stripe data in parallel
    const [customersResponse, paymentsResponse, productsResponse] = await Promise.all([
      stripe.customers.list({ limit: 20 }),
      stripe.paymentIntents.list({ limit: 20 }),
      stripe.products.list({ limit: 20 }),
    ]);

    return new Response(
      JSON.stringify({
        customers: customersResponse.data.map(c => ({
          id: c.id,
          email: c.email,
          name: c.name,
          created: c.created,
        })),
        payments: paymentsResponse.data.map(p => ({
          id: p.id,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          created: p.created,
          customer: p.customer,
        })),
        products: productsResponse.data.map(p => ({
          id: p.id,
          name: p.name,
          active: p.active,
        })),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching Stripe data:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        customers: [],
        payments: [],
        products: [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 with empty data so frontend doesn't break
      }
    );
  }
});
