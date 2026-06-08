// Fetch audio from external URL (YouTube / SoundCloud / direct file) and
// stream the audio bytes back to the browser so the local analyser can
// process them. Read-only proxy with strict size + duration caps and a
// per-IP rate limit (10 / hour).
//
// Legal note: clients should respect platform ToS. Lovable / Global Drip
// Studio operates this endpoint as a convenience for personal analysis.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import ytdl from "npm:@distube/ytdl-core@4.16.12";
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

    if (ytdl.validateURL(url)) {
      source = "youtube";
      const info = await ytdl.getInfo(url);
      const lengthSec = parseInt(info.videoDetails?.lengthSeconds || "0", 10);
      if (lengthSec > MAX_DURATION_SEC) {
        return json({ error: `Vidéo trop longue (max ${MAX_DURATION_SEC / 60} min).` }, 413);
      }
      title = info.videoDetails?.title || "youtube";
      const format = ytdl.chooseFormat(info.formats, { quality: "highestaudio", filter: "audioonly" });
      mime = (format.mimeType?.split(";")[0]) || "audio/mp4";
      const nodeStream = ytdl.downloadFromInfo(info, { format });
      stream = nodeReadableToWebStream(nodeStream);
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
