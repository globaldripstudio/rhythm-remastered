import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const BUCKET = "service-order-files";
const MAX_FILE_BYTES = 2 * 1024 * 1024 * 1024;
const DISPLAY_QUOTA_BYTES = 100 * 1024 * 1024 * 1024;
const SERVICES = new Set(["mixage-mastering", "mixage-mastering-express", "stem-mastering", "mixage-hybride"]);
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});
const adminClient = () => createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);
const tokenHash = async (token: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
};
const safeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 180) || "audio-file";
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));

async function requireAdmin(req: Request) {
  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  if (!token) return null;
  const admin = adminClient();
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return null;
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
  return isAdmin ? admin : null;
}

async function sendUploadEmail(email: string, serviceId: string, link: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return;
  const from = Deno.env.get("EBOOK_FROM_EMAIL") || "Global Drip Studio <onboarding@resend.dev>";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      reply_to: "globaldripstudio@gmail.com",
      subject: "Votre commande — envoi sécurisé de vos fichiers",
      html: `<!doctype html><html><body style="margin:0;background:#fff;font-family:Arial,sans-serif;color:#1f2937"><div style="max-width:560px;margin:0 auto;padding:24px"><div style="background:#0f0f10;color:#fff;padding:20px;border-radius:8px 8px 0 0"><h1 style="margin:0;font-size:20px">Paiement confirmé</h1><p style="margin:6px 0 0;color:#f97316">Global Drip Studio</p></div><div style="border:1px solid #e5e7eb;border-top:0;padding:20px;border-radius:0 0 8px 8px"><p>Merci pour votre commande <strong>${escapeHtml(serviceId)}</strong>.</p><p>Déposez directement vos fichiers dans votre espace privé. Aucun lien WeTransfer ou Drive n’est nécessaire.</p><p style="text-align:center;margin:24px 0"><a href="${escapeHtml(link)}" style="background:#f97316;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold">Déposer mes fichiers</a></p><p style="font-size:13px;color:#6b7280">Ce lien est personnel et donne accès uniquement à votre commande. Chaque fichier peut peser jusqu’à 2 Go. Pour un projet plus volumineux, répondez à cet e-mail.</p></div></div></body></html>`,
    }),
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action : "";
    const admin = adminClient();

    if (action === "initialize") {
      const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
      const origin = typeof body.origin === "string" && /^https?:\/\//.test(body.origin) ? body.origin : "https://www.globaldripstudio.fr";
      if (!sessionId.startsWith("cs_")) return json({ error: "Commande invalide" }, 400);
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2025-08-27.basil" });
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const serviceId = session.metadata?.service_id ?? "";
      const email = session.customer_details?.email ?? session.customer_email ?? "";
      if (session.payment_status !== "paid" || !SERVICES.has(serviceId) || !email) return json({ error: "Paiement non confirmé" }, 403);
      const hash = await tokenHash(sessionId);
      const { data: existing } = await admin.from("service_orders").select("id,service_id,status").eq("stripe_session_id", sessionId).maybeSingle();
      let order = existing;
      if (!order) {
        const inserted = await admin.from("service_orders").insert({ stripe_session_id: sessionId, service_id: serviceId, customer_email: email.toLowerCase(), access_token_hash: hash }).select("id,service_id,status").single();
        if (inserted.error) return json({ error: "Impossible de préparer la commande" }, 500);
        order = inserted.data;
        const link = `${origin}/service-files?order=${encodeURIComponent(order.id)}&token=${encodeURIComponent(sessionId)}`;
        await sendUploadEmail(email, serviceId, link);
      }
      return json({ orderId: order?.id, token: sessionId, serviceId: order?.service_id, status: order?.status });
    }

    if (["order", "create-upload", "confirm-upload"].includes(action)) {
      const orderId = typeof body.orderId === "string" ? body.orderId : "";
      const token = typeof body.token === "string" ? body.token : "";
      const hash = await tokenHash(token);
      const { data: order } = await admin.from("service_orders").select("id,service_id,status").eq("id", orderId).eq("access_token_hash", hash).maybeSingle();
      if (!order) return json({ error: "Lien invalide ou expiré" }, 403);
      if (action === "order") {
        const { data: files } = await admin.from("service_order_files").select("id,file_name,size_bytes,status,uploaded_at").eq("order_id", orderId).eq("status", "complete").order("created_at");
        return json({ order, files: files ?? [], maxFileBytes: MAX_FILE_BYTES });
      }
      if (action === "create-upload") {
        const fileName = safeFileName(String(body.fileName ?? ""));
        const sizeBytes = Number(body.sizeBytes ?? 0);
        if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_FILE_BYTES) return json({ error: "Fichier invalide ou supérieur à 2 Go" }, 400);
        const path = `${orderId}/${crypto.randomUUID()}-${fileName}`;
        const signed = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
        if (signed.error) return json({ error: "Impossible de préparer l’envoi" }, 500);
        const inserted = await admin.from("service_order_files").insert({ order_id: orderId, storage_path: path, file_name: fileName, size_bytes: sizeBytes }).select("id").single();
        if (inserted.error) return json({ error: "Impossible d’enregistrer le fichier" }, 500);
        return json({ fileId: inserted.data.id, path, signedToken: signed.data.token });
      }
      const fileId = typeof body.fileId === "string" ? body.fileId : "";
      const { data: file } = await admin.from("service_order_files").select("id,storage_path,size_bytes").eq("id", fileId).eq("order_id", orderId).maybeSingle();
      if (!file) return json({ error: "Fichier inconnu" }, 404);
      const folder = file.storage_path.split("/").slice(0, -1).join("/");
      const name = file.storage_path.split("/").pop() ?? "";
      const listed = await admin.storage.from(BUCKET).list(folder, { search: name });
      if (!listed.data?.some((item) => item.name === name)) return json({ error: "Envoi non terminé" }, 409);
      await admin.from("service_order_files").update({ status: "complete", uploaded_at: new Date().toISOString() }).eq("id", fileId);
      await admin.from("service_orders").update({ status: "files_received" }).eq("id", orderId);
      return json({ complete: true });
    }

    const authedAdmin = await requireAdmin(req);
    if (!authedAdmin) return json({ error: "Interdit" }, 403);
    if (action === "admin-list") {
      const { data: orders, error } = await authedAdmin.from("service_orders").select("id,service_id,customer_email,status,created_at,service_order_files(id,file_name,size_bytes,status,uploaded_at)").order("created_at", { ascending: false });
      if (error) return json({ error: "Chargement impossible" }, 500);
      const usedBytes = (orders ?? []).flatMap((order) => order.service_order_files ?? []).filter((file) => file.status === "complete").reduce((sum, file) => sum + Number(file.size_bytes), 0);
      return json({ orders: orders ?? [], usedBytes, quotaBytes: DISPLAY_QUOTA_BYTES });
    }
    const fileId = typeof body.fileId === "string" ? body.fileId : "";
    const { data: file } = await authedAdmin.from("service_order_files").select("id,storage_path").eq("id", fileId).maybeSingle();
    if (!file) return json({ error: "Fichier inconnu" }, 404);
    if (action === "admin-download") {
      const signed = await authedAdmin.storage.from(BUCKET).createSignedUrl(file.storage_path, 300, { download: true });
      if (signed.error) return json({ error: "Téléchargement impossible" }, 500);
      return json({ url: signed.data.signedUrl });
    }
    if (action === "admin-delete") {
      const removed = await authedAdmin.storage.from(BUCKET).remove([file.storage_path]);
      if (removed.error) return json({ error: "Suppression impossible" }, 500);
      await authedAdmin.from("service_order_files").delete().eq("id", fileId);
      return json({ deleted: true });
    }
    return json({ error: "Action inconnue" }, 400);
  } catch (error) {
    console.error("service-order-files", error);
    return json({ error: "Erreur interne" }, 500);
  }
});