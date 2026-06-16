// Browser-side YouTube audio extraction using youtubei.js (InnerTube).
//
// The library runs entirely in the user's browser: it negotiates with
// YouTube's InnerTube API and returns a signed googlevideo URL.
// Downloading bytes directly from googlevideo.com is blocked by CORS in
// the browser, so we route the final byte stream through our edge
// function (which acts as a dumb pass-through proxy — no scraping, no
// signature work, just a CORS-friendly HTTP GET).

import { Innertube, UniversalCache } from "youtubei.js/web";
import { supabase } from "@/integrations/supabase/client";

const MAX_DURATION_SEC = 600; // 10 min
const MAX_BYTES = 30 * 1024 * 1024; // 30 MB

export interface YoutubeExtractOptions {
  onProgress?: (loaded: number, total: number | null) => void;
  signal?: AbortSignal;
}

const YT_HOST_RE = /(?:youtube\.com|youtu\.be|youtube-nocookie\.com|music\.youtube\.com)/i;

export function isYoutubeUrl(url: string): boolean {
  return YT_HOST_RE.test(url);
}

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.pathname.startsWith("/shorts/")) {
      return u.pathname.split("/")[2] || null;
    }
    if (u.pathname.startsWith("/embed/")) {
      return u.pathname.split("/")[2] || null;
    }
    const v = u.searchParams.get("v");
    if (v) return v;
    return null;
  } catch {
    return null;
  }
}

let cachedInnertube: Innertube | null = null;
async function getInnertube(): Promise<Innertube> {
  if (cachedInnertube) return cachedInnertube;
  cachedInnertube = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });
  return cachedInnertube;
}

export interface YoutubeAudioResult {
  file: File;
  title: string;
  durationSec: number;
}

export async function extractYoutubeAudio(
  url: string,
  opts: YoutubeExtractOptions = {},
): Promise<YoutubeAudioResult> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Lien YouTube invalide.");
  }

  const yt = await getInnertube();

  let info;
  try {
    info = await yt.getBasicInfo(videoId);
  } catch (e) {
    const msg = (e as Error).message || "";
    if (/age|sign in|login/i.test(msg)) {
      throw new Error("Cette vidéo est restreinte (âge ou connexion requise). Utilise l'onglet Import.");
    }
    throw new Error("Impossible de récupérer la vidéo (privée, supprimée ou bloquée géographiquement).");
  }

  const details = info.basic_info;
  const duration = details.duration ?? 0;
  if (duration && duration > MAX_DURATION_SEC) {
    throw new Error(`Vidéo trop longue (max ${MAX_DURATION_SEC / 60} min).`);
  }

  // Pick the best audio-only format we can reach.
  let format;
  try {
    format = info.chooseFormat({ type: "audio", quality: "best" });
  } catch {
    throw new Error("Aucune piste audio disponible pour cette vidéo.");
  }

  const directUrl = format.decipher(yt.session.player);
  if (!directUrl) {
    throw new Error("URL audio introuvable (YouTube a peut-être changé son protocole).");
  }

  // Route through our edge function, which is a CORS-friendly proxy.
  // The browser CAN'T fetch googlevideo.com directly (CORS), but our
  // function can — and it just streams bytes through, no scraping.
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
  const anonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || "";
  const proxyUrl = `${supabaseUrl}/functions/v1/fetch-audio-from-url`;

  const resp = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": anonKey,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : { Authorization: `Bearer ${anonKey}` }),
    },
    body: JSON.stringify({ proxyUrl: directUrl, isYoutubeProxy: true }),
    signal: opts.signal,
  });

  if (!resp.ok || !resp.body) {
    let msg = `Téléchargement YouTube impossible (${resp.status}).`;
    try {
      const j = await resp.json();
      if (j?.error) msg = j.error;
    } catch { /* noop */ }
    throw new Error(msg);
  }

  const total = Number(resp.headers.get("content-length")) || null;
  const reader = resp.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.length;
    if (loaded > MAX_BYTES) {
      try { await reader.cancel(); } catch { /* noop */ }
      throw new Error(`Audio trop volumineux (>${MAX_BYTES / 1024 / 1024} Mo).`);
    }
    chunks.push(value);
    opts.onProgress?.(loaded, total);
  }

  const mime = format.mime_type?.split(";")[0] || resp.headers.get("content-type")?.split(";")[0] || "audio/webm";
  const ext = mime.includes("mp4") ? "m4a" : "webm";
  const title = (details.title || `youtube-${videoId}`).replace(/[^a-zA-Z0-9-_. ]/g, "_").slice(0, 80);
  const blob = new Blob(chunks, { type: mime });
  const file = new File([blob], `${title}.${ext}`, { type: mime });

  return { file, title, durationSec: duration };
}
