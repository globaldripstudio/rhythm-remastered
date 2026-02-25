/**
 * Safe Spotify embed component that extracts and validates embed URLs
 * Uses the SpotifyEmbedPlayer for single-playback management
 */
import SpotifyEmbedPlayer from "@/components/SpotifyEmbedPlayer";

interface SpotifyEmbedProps {
  embedHtml: string;
  className?: string;
}

/**
 * Extracts and validates Spotify embed URL from iframe HTML string
 * Only allows URLs from open.spotify.com domain
 */
const extractSpotifySrc = (embedHtml: string): string | null => {
  const srcMatch = embedHtml.match(/src="(https:\/\/open\.spotify\.com\/embed\/[^"]+)"/);
  
  if (!srcMatch || !srcMatch[1]) {
    return null;
  }
  
  const url = srcMatch[1];
  
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'open.spotify.com') return null;
    if (!parsedUrl.pathname.startsWith('/embed/')) return null;
    return url;
  } catch {
    return null;
  }
};

const SpotifyEmbed = ({ embedHtml, className }: SpotifyEmbedProps) => {
  const spotifySrc = extractSpotifySrc(embedHtml);
  
  if (!spotifySrc) {
    return (
      <div className="text-muted-foreground text-sm p-4 text-center">
        Lecteur Spotify non disponible
      </div>
    );
  }
  
  return (
    <SpotifyEmbedPlayer
      embedUrl={spotifySrc}
      height={352}
      className={className}
    />
  );
};

export default SpotifyEmbed;
