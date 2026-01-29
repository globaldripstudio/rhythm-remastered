/**
 * Safe Spotify embed component that extracts and validates embed URLs
 * instead of using dangerouslySetInnerHTML with raw HTML
 */

interface SpotifyEmbedProps {
  embedHtml: string;
  className?: string;
}

/**
 * Extracts and validates Spotify embed URL from iframe HTML string
 * Only allows URLs from open.spotify.com domain
 */
const extractSpotifySrc = (embedHtml: string): string | null => {
  // Match src attribute from iframe tag
  const srcMatch = embedHtml.match(/src="(https:\/\/open\.spotify\.com\/embed\/[^"]+)"/);
  
  if (!srcMatch || !srcMatch[1]) {
    return null;
  }
  
  const url = srcMatch[1];
  
  // Validate URL is from Spotify domain only
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'open.spotify.com') {
      console.warn('Invalid Spotify embed URL - not from open.spotify.com');
      return null;
    }
    // Validate path starts with /embed/
    if (!parsedUrl.pathname.startsWith('/embed/')) {
      console.warn('Invalid Spotify embed URL - not an embed path');
      return null;
    }
    return url;
  } catch {
    console.warn('Invalid Spotify embed URL');
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
    <iframe
      src={spotifySrc}
      width="100%"
      height="352"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className={className}
      style={{ borderRadius: '12px' }}
      title="Spotify Player"
    />
  );
};

export default SpotifyEmbed;
