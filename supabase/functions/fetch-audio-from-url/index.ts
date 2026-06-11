// Fetch audio from external URL (YouTube / SoundCloud / direct file) and
// stream the audio bytes back to the browser so the local analyser can
// process them. Read-only proxy with strict size + duration caps and a
// per-IP rate limit (10 / hour).
//
// YouTube branch uses youtubei.js (InnerTube) — more resilient than
// ytdl-core, which is regularly broken by YouTube signature changes.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Innertube } from "npm:youtubei.js@10.5.0";
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

const YT_RE = /(?:youtube\.com\/(?:watch\?[^ ]*v=|shorts\/|embed\/|v\/)|youtu\.be\/|music\.youtube\.com\/watch\?[^ ]*v=)([A-Za-z0-9_-]{11})/i;

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non supportée." }, 405);

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Corps de requête invalide." }, 400);
  }

  const url = (body.url || "").trim();
  if (!url || !/^https?:\/\//i.test(url) || url.length > 2048) {
    return json({ error: "URL invalide." }, 400);
  }

  // Per-IP rate limit: 10 requests / hour.
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
    if (allowed === false) {
      return json({ error: "Trop de requêtes — réessayez dans une heure." }, 429);
    }
  } catch (e) {
    console.warn("rate limit check failed", e);
  }

  try {
    let stream: ReadableStream<Uint8Array>;
    let title = "audio";
    let mime = "audio/mpeg";
    let source = "direct";

    const ytMatch = url.match(YT_RE);
    if (ytMatch) {
      source = "youtube";
      const videoId = ytMatch[1];
      try {
        // Custom fetch that forces gzip/identity to avoid the Deno node
        // brotli decompression bug ("Failed to decompress").
        const ytFetch: typeof fetch = (input, init = {}) => {
          const headers = new Headers(init.headers || (input as Request).headers || {});
          headers.set("accept-encoding", "gzip");
          return fetch(input, { ...init, headers });
        };
        const yt = await Innertube.create({ retrieve_player: true, fetch: ytFetch });
        const info = await yt.getInfo(videoId);
        const duration = info.basic_info?.duration ?? 0;
        if (duration && duration > MAX_DURATION_SEC) {
          return json({ error: `Vidéo trop longue (max ${MAX_DURATION_SEC / 60} min).` }, 413);
        }
        title = info.basic_info?.title || "youtube";
        // youtubei.js download() returns a web ReadableStream<Uint8Array>.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ytStream: any = await yt.download(videoId, {
          type: "audio",
          quality: "best",
          format: "any",
        });
        stream = ytStream as ReadableStream<Uint8Array>;
        // Best-effort MIME — most YouTube audio-only streams are m4a or webm.
        mime = "audio/mp4";
      } catch (e) {
        const msg = (e as Error).message || "erreur inconnue";
        console.error("youtube fetch failed", msg);
        return json({
          error: "Récupération YouTube temporairement indisponible — utilise l'upload de fichier ou un lien direct.",
          detail: msg,
        }, 502);
      }
    } else if (/soundcloud\.com/i.test(url)) {
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
      // Direct audio file (Dropbox direct link, S3, CDN, etc.)
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
