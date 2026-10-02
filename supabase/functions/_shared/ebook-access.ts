// Shared provisioning for ebook customer accounts (Stripe webhook + admin grant).
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

export function generateAccessCode(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `GDS-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}

export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/**
 * Creates (or resets) the customer reader account with a fresh access code.
 * Refuses admin accounts: the reader space and the admin space never share credentials.
 */
export async function provisionCustomer(
  admin: SupabaseClient,
  email: string,
): Promise<{ code: string } | { error: string }> {
  const code = generateAccessCode();
  const { data: profile } = await admin
    .from("profiles")
    .select("user_id")
    .ilike("email", email)
    .maybeSingle();

  if (profile?.user_id) {
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: profile.user_id, _role: "admin" });
    if (isAdmin) return { error: "admin_account" };
    const { error } = await admin.auth.admin.updateUserById(profile.user_id, {
      password: code,
      email_confirm: true,
    });
    if (error) return { error: error.message };
  } else {
    const { error } = await admin.auth.admin.createUser({
      email,
      password: code,
      email_confirm: true,
      user_metadata: { source: "ebook" },
    });
    if (error) return { error: error.message };
  }
  return { code };
}

export async function sendAccessEmail(email: string, code: string, origin: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY missing");
  const from = Deno.env.get("EBOOK_FROM_EMAIL") || "Global Drip Studio <onboarding@resend.dev>";
  const link = `${origin}/ebook/login?email=${encodeURIComponent(email)}`;
  const safeCode = escapeHtml(code);
  const safeEmail = escapeHtml(email);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Vos accès à la formation — Global Drip Studio",
      html: `<!DOCTYPE html><html><body style="margin:0;background:#ffffff;font-family:Arial,sans-serif;color:#1f2937">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#0f0f10;color:#ffffff;padding:20px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:20px">Merci pour votre achat !</h1>
    <p style="margin:6px 0 0;color:#f97316;font-size:14px">Formation au Sound Design pour Vidéastes et Monteurs</p>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;padding:20px;border-radius:0 0 8px 8px">
    <p>Voici vos identifiants personnels pour accéder au lecteur de la formation :</p>
    <p style="margin:4px 0"><strong>Email :</strong> ${safeEmail}</p>
    <p style="margin:4px 0"><strong>Code d'accès :</strong></p>
    <p style="font-family:monospace;font-size:22px;letter-spacing:2px;background:#fff7ed;border:1px solid #fdba74;padding:12px;text-align:center;border-radius:6px">${safeCode}</p>
    <p style="text-align:center;margin:24px 0">
      <a href="${link}" style="background:#f97316;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">Accéder à ma formation</a>
    </p>
    <p style="font-size:13px;color:#6b7280">Ce code est strictement personnel. Toute nouvelle connexion déconnecte automatiquement les autres appareils.</p>
    <p style="font-size:13px;color:#6b7280">Un souci ? Répondez simplement à cet email ou écrivez à globaldripstudio@gmail.com.</p>
  </div>
</div></body></html>`,
      reply_to: "globaldripstudio@gmail.com",
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
