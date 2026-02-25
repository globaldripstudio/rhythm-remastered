import { useEffect, useRef, useId } from "react";
import { useSpotifyPlayer } from "@/contexts/SpotifyPlayerContext";

interface SpotifyEmbedPlayerProps {
  embedUrl: string;
  height?: number;
  className?: string;
}

/**
 * Extracts Spotify URI from an embed URL.
 * e.g. "https://open.spotify.com/embed/track/ABC123?..." → "spotify:track:ABC123"
 */
const extractUri = (embedUrl: string): string | null => {
  try {
    const url = new URL(embedUrl);
    // path like /embed/track/ABC123 or /embed/playlist/XYZ
    const match = url.pathname.match(/\/embed\/(track|album|playlist|artist)\/([^/?]+)/);
    if (match) {
      return `spotify:${match[1]}:${match[2]}`;
    }
  } catch {
    // ignore
  }
  return null;
};

const SpotifyEmbedPlayer = ({ embedUrl, height = 152, className }: SpotifyEmbedPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<any>(null);
  const uniqueId = useId();
  const { registerController, unregisterController, setPlaying, pauseAllExcept, iframeApiReady, getIFrameAPI } = useSpotifyPlayer();

  useEffect(() => {
    if (!iframeApiReady || !containerRef.current) return;

    const IFrameAPI = getIFrameAPI();
    if (!IFrameAPI) return;

    const uri = extractUri(embedUrl);
    if (!uri) return;

    // Clear container before creating
    containerRef.current.innerHTML = "";

    const options = {
      uri,
      height,
      width: "100%",
    };

    IFrameAPI.createController(containerRef.current, options, (controller: any) => {
      controllerRef.current = controller;
      registerController(uniqueId, controller);

      controller.addListener("playback_update", (e: any) => {
        const isPaused = e?.data?.isPaused;
        if (isPaused === false) {
          // This player started playing → pause all others
          setPlaying(uniqueId, true);
          pauseAllExcept(uniqueId);
        } else {
          setPlaying(uniqueId, false);
        }
      });
    });

    return () => {
      unregisterController(uniqueId);
      controllerRef.current = null;
    };
    // Only re-run if API readiness or embedUrl changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeApiReady, embedUrl]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ borderRadius: "12px", overflow: "hidden", minHeight: height }}
    />
  );
};

export default SpotifyEmbedPlayer;
