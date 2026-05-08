// Shared helpers for audio file inputs across toolkit pages.
// Goal: make file picking work reliably on mobile (iOS Safari, Android Chrome)
// where `accept="audio/*"` either opens the music library only or filters out
// many valid files (e.g. those reported as application/octet-stream from
// Files / Drive / Dropbox).

export const AUDIO_ACCEPT =
  ".mp3,.wav,.m4a,.aac,.flac,.ogg,.oga,.aiff,.aif,.opus,.webm,audio/*";

const ALLOWED_EXTENSIONS = [
  "mp3", "wav", "m4a", "aac", "flac", "ogg", "oga",
  "aiff", "aif", "opus", "webm", "mp4",
];

/** Returns true if the file looks like an audio file by MIME or extension. */
export const isLikelyAudioFile = (file: File): boolean => {
  if (file.type && file.type.startsWith("audio/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTENSIONS.includes(ext);
};
