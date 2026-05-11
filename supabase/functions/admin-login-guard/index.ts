// Anti-bruteforce guard pour /admin
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const ADMIN_EMAIL = "globaldripstudio@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  action: z.enum(["check", "record_failure", "record_success"]),
  email: z.string().email().max(255),
});

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return jsonResponse({ error: "Invalid input" }, 400);
  }

  const { action, email } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const ip = getClientIp(req);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Purge passive (≤1 ligne supprimée par appel en moyenne)
  await supabase.rpc("purge_old_login_attempts").catch(() => {});

  // Helper: vérifie si l'IP est actuellement bloquée
  const isBlocked = async (): Promise<{ blocked: boolean; reason?: string; until?: string | null }> => {
    const { data } = await supabase
      .from("admin_ip_blocklist")
      .select("reason, blocked_until")
      .eq("ip_address", ip)
      .maybeSingle();
    if (!data) return { blocked: false };
    if (data.blocked_until === null) {
      return { blocked: true, reason: data.reason, until: null };
    }
    if (new Date(data.blocked_until) > new Date()) {
      return { blocked: true, reason: data.reason, until: data.blocked_until };
    }
    // Expiré → on retire
    await supabase.from("admin_ip_blocklist").delete().eq("ip_address", ip);
    return { blocked: false };
  };

  const blockIp = async (
    reason: "wrong_email" | "burst" | "repeated_failures",
    until: Date | null,
  ) => {
    await supabase.from("admin_ip_blocklist").upsert(
      {
        ip_address: ip,
        reason,
        blocked_until: until ? until.toISOString() : null,
      },
      { onConflict: "ip_address" },
    );
  };

  const logAttempt = async (success: boolean) => {
    await supabase.from("admin_login_attempts").insert({
      ip_address: ip,
      email_attempted: normalizedEmail,
      success,
    });
  };

  // Évalue les seuils et bloque si dépassés. Retourne le verdict.
  const evaluateThresholds = async (): Promise<
    { blocked: boolean; reason?: string; until?: string | null }
  > => {
    // Compte des échecs par IP
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { count: burstCount } = await supabase
      .from("admin_login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .eq("success", false)
      .gte("created_at", fiveMinAgo);

    if ((burstCount ?? 0) >= 10) {
      await blockIp("burst", null);
      return { blocked: true, reason: "burst", until: null };
    }

    const { count: recentCount } = await supabase
      .from("admin_login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .eq("success", false)
      .gte("created_at", fifteenMinAgo);

    if ((recentCount ?? 0) >= 5) {
      const until = new Date(Date.now() + 15 * 60 * 1000);
      await blockIp("repeated_failures", until);
      return {
        blocked: true,
        reason: "repeated_failures",
        until: until.toISOString(),
      };
    }

    return { blocked: false };
  };

  try {
    // Vérifie d'abord la blocklist, quel que soit l'action
    const block = await isBlocked();
    if (block.blocked) {
      return jsonResponse(
        { allowed: false, blocked: true, reason: block.reason, until: block.until ?? null },
        403,
      );
    }

    if (action === "check") {
      // Email étranger → blocage permanent immédiat
      if (normalizedEmail !== ADMIN_EMAIL) {
        await logAttempt(false);
        await blockIp("wrong_email", null);
        return jsonResponse(
          { allowed: false, blocked: true, reason: "wrong_email", until: null },
          403,
        );
      }
      // Évalue seuils existants (au cas où)
      const verdict = await evaluateThresholds();
      if (verdict.blocked) {
        return jsonResponse({ allowed: false, ...verdict }, 403);
      }
      return jsonResponse({ allowed: true });
    }

    if (action === "record_failure") {
      await logAttempt(false);
      const verdict = await evaluateThresholds();
      if (verdict.blocked) {
        return jsonResponse({ ok: true, blocked: true, ...verdict });
      }
      return jsonResponse({ ok: true, blocked: false });
    }

    if (action === "record_success") {
      await logAttempt(true);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("admin-login-guard error", err);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
