import { createContext, useContext, useCallback, useRef, useEffect, useState, type ReactNode } from "react";

interface ControllerEntry {
  controller: any;
  isPlaying: boolean;
}

interface SpotifyPlayerContextType {
  registerController: (id: string, controller: any) => void;
  unregisterController: (id: string) => void;
  setPlaying: (id: string, playing: boolean) => void;
  pauseAllExcept: (id: string) => void;
  iframeApiReady: boolean;
  getIFrameAPI: () => any | null;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | null>(null);

export const useSpotifyPlayer = () => {
  const ctx = useContext(SpotifyPlayerContext);
  if (!ctx) throw new Error("useSpotifyPlayer must be used within SpotifyPlayerProvider");
  return ctx;
};

export const SpotifyPlayerProvider = ({ children }: { children: ReactNode }) => {
  const controllersRef = useRef<Map<string, ControllerEntry>>(new Map());
  const iframeAPIRef = useRef<any>(null);
  const [iframeApiReady, setIframeApiReady] = useState(false);

  useEffect(() => {
    if ((window as any).SpotifyIframeApi) {
      iframeAPIRef.current = (window as any).SpotifyIframeApi;
      setIframeApiReady(true);
      return;
    }

    (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
      iframeAPIRef.current = IFrameAPI;
      setIframeApiReady(true);
    };

    if (!document.querySelector('script[src*="spotify.com/embed/iframe-api"]')) {
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const registerController = useCallback((id: string, controller: any) => {
    controllersRef.current.set(id, { controller, isPlaying: false });
  }, []);

  const unregisterController = useCallback((id: string) => {
    controllersRef.current.delete(id);
  }, []);

  const setPlaying = useCallback((id: string, playing: boolean) => {
    const entry = controllersRef.current.get(id);
    if (entry) {
      entry.isPlaying = playing;
    }
  }, []);

  const pauseAllExcept = useCallback((id: string) => {
    controllersRef.current.forEach((entry, controllerId) => {
      if (controllerId !== id && entry.isPlaying) {
        try {
          entry.controller.togglePlay(); // toggles from playing to paused
          entry.isPlaying = false;
        } catch (e) {
          // ignore
        }
      }
    });
  }, []);

  const getIFrameAPI = useCallback(() => iframeAPIRef.current, []);

  return (
    <SpotifyPlayerContext.Provider value={{ registerController, unregisterController, setPlaying, pauseAllExcept, iframeApiReady, getIFrameAPI }}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
};
