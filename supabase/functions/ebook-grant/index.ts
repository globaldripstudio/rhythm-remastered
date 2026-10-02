// Admin-only: grant ebook access, generate an access code, optionally email it.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { adminClient, provisionCustomer, sendAccessEmail } from "../_shared/ebook-access.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!token) return json({ error: "Non authentifié" }, 401);
    const admin = adminClient();
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ error: "Non authentifié" }, 401);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Interdit" }, 403);

    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const sendEmail = body.sendEmail !== false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return json({ error: "Email invalide" }, 400);
    }

    const result = await provisionCustomer(admin, email);
    if ("error" in result) {
      return json({ error: result.error === "admin_account" ? "Compte administrateur : accès lecteur interdit" : result.error }, 400);
    }

    const { data: existing } = await admin.from("ebook_purchases").select("id").eq("email", email).maybeSingle();
    if (!existing) {
      const { error } = await admin.from("ebook_purchases").insert({ email, stripe_session_id: "admin-grant" });
      if (error) return json({ error: error.message }, 500);
    }

    let emailed = false;
    let emailError: string | null = null;
    if (sendEmail) {
      try {
        await sendAccessEmail(email, result.code, req.headers.get("origin") || "https://www.globaldripstudio.fr");
        emailed = true;
      } catch (e) {
        emailError = (e as Error).message;
        console.error("email error", e);
      }
    }
    return json({ code: result.code, emailed, emailError });
  } catch (e) {
    console.error(e);
    return json({ error: "Erreur interne" }, 500);
  }
});
