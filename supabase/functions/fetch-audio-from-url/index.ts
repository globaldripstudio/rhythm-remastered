// Fetch audio from external URL and stream bytes back to the browser.
//
// Two modes:
//   1) { url }                — fetches SoundCloud or a direct audio file
//   2) { proxyUrl, isYoutubeProxy: true }
//                             — pure pass-through proxy for a googlevideo URL
//                               already negotiated by youtubei.js in the
//                               user's browser. No scraping here.
//
// Hard caps: 30 MB, 10 min, 10 requests / hour / IP.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import scdl from "npm:soundcloud-downloader@1.0.0";

const MAX_BYTES = 30 * 1024 * 1024; // 30 MB
const MAX_DURATION_SEC = 600; // 10 min

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9-_.]/g, "_").slice(0, 80);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function nodeReadableToWebStream(nodeStream: any): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      nodeStream.on("data", (chunk: Uint8Array) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err: Error) => controller.error(err));
    },
    cancel() {
      try { nodeStream.destroy?.(); } catch { /* noop */ }
    },
  });
}

function capStream(src: ReadableStream<Uint8Array>, maxBytes: number): ReadableStream<Uint8Array> {
  const reader = src.getReader();
  let total = 0;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await reader.read();
      if (done) { controller.close(); return; }
      total += value.length;
      if (total > maxBytes) {
        controller.error(new Error(`Fichier trop volumineux (>${maxBytes / 1024 / 1024} MB).`));
        try { await reader.cancel(); } catch { /* noop */ }
        return;
      }
      controller.enqueue(value);
    },
    cancel() { reader.cancel(); },
  });
}

async function rateLimitOk(req: Request): Promise<boolean> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      _key: `fetch-audio:${ip}`,
      _max_count: 10,
      _window_seconds: 3600,
    });
    return allowed !== false;
  } catch (e) {
    console.warn("rate limit check failed", e);
    return true;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non supportée." }, 405);

  let body: { url?: string; proxyUrl?: string; isYoutubeProxy?: boolean };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Corps de requête invalide." }, 400);
  }

  if (!(await rateLimitOk(req))) {
    return json({ error: "Trop de requêtes — réessayez dans une heure." }, 429);
  }

  // ============ Mode 2: pure proxy for a googlevideo URL ============
  if (body.isYoutubeProxy && body.proxyUrl) {
    const proxyUrl = body.proxyUrl.trim();
    let host: string;
    try { host = new URL(proxyUrl).hostname; } catch { return json({ error: "URL proxy invalide." }, 400); }
    if (!/\.googlevideo\.com$/i.test(host)) {
      return json({ error: "Le proxy YouTube n'accepte que les URLs googlevideo.com." }, 400);
    }
    try {
      const r = await fetch(proxyUrl, { redirect: "follow" });
      if (!r.ok || !r.body) {
        return json({ error: `YouTube a refusé le téléchargement (${r.status}).` }, 502);
      }
      const mime = r.headers.get("content-type")?.split(";")[0] || "audio/webm";
      const length = r.headers.get("content-length");
      const capped = capStream(r.body, MAX_BYTES);
      const headers: Record<string, string> = {
        ...corsHeaders,
        "Content-Type": mime,
        "X-Source": "youtube",
        "Cache-Control": "no-store",
      };
      if (length) headers["Content-Length"] = length;
      return new Response(capped, { headers });
    } catch (e) {
      const msg = (e as Error).message || "Erreur proxy YouTube";
      console.error("youtube proxy error", msg);
      return json({ error: msg }, 502);
    }
  }

  // ============ Mode 1: SoundCloud / direct file ============
  const url = (body.url || "").trim();
  if (!url || !/^https?:\/\//i.test(url) || url.length > 2048) {
    return json({ error: "URL invalide." }, 400);
  }

  // YouTube via direct URL is no longer accepted here — the client
  // negotiates with InnerTube itself and posts back via isYoutubeProxy.
  if (/youtube\.com|youtu\.be/i.test(url)) {
    return json({
      error: "Lien YouTube détecté côté serveur — c'est le navigateur qui doit l'extraire. Recharge la page.",
    }, 400);
  }

  try {
    let stream: ReadableStream<Uint8Array>;
    let title = "audio";
    let mime = "audio/mpeg";
    let source = "direct";

    if (/soundcloud\.com/i.test(url)) {
      source = "soundcloud";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const info: any = await scdl.getInfo(url).catch(() => null);
      if (info?.duration && info.duration / 1000 > MAX_DURATION_SEC) {
        return json({ error: `Piste trop longue (max ${MAX_DURATION_SEC / 60} min).` }, 413);
      }
      title = info?.title || "soundcloud";
      const nodeStream = await scdl.download(url);
      mime = "audio/mpeg";
      stream = nodeReadableToWebStream(nodeStream);
    } else {
      const r = await fetch(url, { redirect: "follow" });
      if (!r.ok || !r.body) {
        return json({ error: "Téléchargement direct impossible." }, 502);
      }
      mime = r.headers.get("content-type")?.split(";")[0] || "application/octet-stream";
      if (!/^audio\//i.test(mime)) {
        return json({ error: `Le lien ne pointe pas vers un fichier audio (${mime}).` }, 415);
      }
      stream = r.body;
      try {
        const u = new URL(url);
        title = decodeURIComponent(u.pathname.split("/").pop() || "audio").replace(/\.[^.]+$/, "");
      } catch { /* noop */ }
    }

    const capped = capStream(stream, MAX_BYTES);
    return new Response(capped, {
      headers: {
        ...corsHeaders,
        "Content-Type": mime,
        "X-Source": source,
        "X-Title": encodeURIComponent(title),
        "Cache-Control": "no-store",
        "Content-Disposition": `inline; filename="${sanitize(title)}"`,
      },
    });
  } catch (e) {
    const msg = (e as Error).message || "Erreur inconnue";
    console.error("fetch-audio-from-url error", msg);
    return json({ error: msg }, 500);
  }
});
