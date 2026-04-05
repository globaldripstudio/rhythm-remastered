import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user?.email) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify purchase using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("ebook_purchases")
      .select("id")
      .eq("email", user.email.toLowerCase())
      .maybeSingle();

    if (purchaseError || !purchase) {
      return new Response(JSON.stringify({ error: "Achat non trouvé" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch PDF from storage
    const { data: fileData, error: fileError } = await supabaseAdmin
      .storage
      .from("ebook-files")
      .download("ebook.pdf");

    if (fileError || !fileData) {
      console.error("File download error:", fileError);
      return new Response(JSON.stringify({ error: "Fichier non disponible" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine mode
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "view";
    const disposition = mode === "download"
      ? 'attachment; filename="Formation-Sound-Design.pdf"'
      : "inline";

    const arrayBuffer = await fileData.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Serve ebook error:", error);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
