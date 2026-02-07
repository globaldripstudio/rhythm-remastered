import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slug } = await req.json();

    if (!slug || typeof slug !== "string") {
      return new Response(
        JSON.stringify({ error: "Slug is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize slug
    const safeSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (safeSlug.length === 0 || safeSlug.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid slug" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to increment view count
    const { data: existingView, error: fetchError } = await supabase
      .from("blog_views")
      .select("view_count")
      .eq("slug", safeSlug)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching view:", fetchError);
      throw fetchError;
    }

    let newCount: number;

    if (existingView) {
      // Increment existing count
      const { data: updatedView, error: updateError } = await supabase
        .from("blog_views")
        .update({ view_count: existingView.view_count + 1 })
        .eq("slug", safeSlug)
        .select("view_count")
        .single();

      if (updateError) {
        console.error("Error updating view:", updateError);
        throw updateError;
      }
      newCount = updatedView.view_count;
    } else {
      // Create new entry starting at 101 (100 base + 1 view)
      const { data: newView, error: insertError } = await supabase
        .from("blog_views")
        .insert({ slug: safeSlug, view_count: 101 })
        .select("view_count")
        .single();

      if (insertError) {
        console.error("Error inserting view:", insertError);
        throw insertError;
      }
      newCount = newView.view_count;
    }

    return new Response(
      JSON.stringify({ success: true, view_count: newCount }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error in track-blog-view:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});