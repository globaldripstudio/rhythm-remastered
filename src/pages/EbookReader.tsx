import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Download, Printer, LogOut, Loader2, Maximize,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Menu, X
} from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const EbookReader = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const checkAccessAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/ebook/login", { replace: true });
        return;
      }

      // Check purchase
      const { data: purchase } = await supabase
        .from("ebook_purchases")
        .select("id")
        .maybeSingle();

      if (!purchase) {
        toast.error("Aucun achat trouvé pour cet email.");
        await supabase.auth.signOut();
        navigate("/ebook/login", { replace: true });
        return;
      }

      // Fetch PDF via edge function
      try {
        const { data, error: fnError } = await supabase.functions.invoke("serve-ebook", {
          method: "GET",
        });

        if (fnError) throw fnError;

        // data is already a Blob from the function response
        let blob: Blob;
        if (data instanceof Blob) {
          blob = data;
        } else if (data instanceof ArrayBuffer) {
          blob = new Blob([data], { type: "application/pdf" });
        } else {
          throw new Error("Format de réponse inattendu");
        }

        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err: any) {
        console.error("Error loading ebook:", err);
        setError("Impossible de charger la formation. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    checkAccessAndLoad();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [navigate]);

  // Auto-hide toolbar
  const resetToolbarTimer = useCallback(() => {
    setToolbarVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setToolbarVisible(false), 4000);
  }, []);

  useEffect(() => {
    resetToolbarTimer();
    const handleMove = () => resetToolbarTimer();
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchstart", handleMove);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchstart", handleMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [resetToolbarTimer]);

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("serve-ebook?mode=download", {
        method: "GET",
      });
      if (error) throw error;

      let blob: Blob;
      if (data instanceof Blob) {
        blob = data;
      } else if (data instanceof ArrayBuffer) {
        blob = new Blob([data], { type: "application/pdf" });
      } else {
        throw new Error("Format inattendu");
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Formation-Sound-Design.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Téléchargement lancé !");
    } catch {
      toast.error("Erreur lors du téléchargement.");
    }
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/ebook/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <SEO title="Formation | Global Drip Studio" description="" path="/ebook/reader" />
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement de la formation...</p>
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 p-4">
        <p className="text-destructive text-lg">{error || "Erreur inattendue"}</p>
        <Button variant="outline" onClick={() => navigate("/ebook/login")}>
          Retour à la connexion
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-screen w-screen bg-black relative overflow-hidden">
      <SEO title="Formation | Global Drip Studio" description="" path="/ebook/reader" />

      {/* PDF Viewer - Full screen iframe with built-in PDF controls */}
      <iframe
        ref={iframeRef}
        src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
        className="w-full h-full border-0"
        title="Formation Sound Design"
      />

      {/* Floating toolbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          toolbarVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="bg-card/90 backdrop-blur-md border-b border-border/50 px-4 py-2">
          <div className="flex items-center justify-between max-w-screen-xl mx-auto">
            <div className="flex items-center gap-2">
              <img
                src="/lovable-uploads/logo-blanc-sans-fond.png"
                alt="Global Drip Studio"
                className="h-7"
              />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Formation Sound Design
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                title="Télécharger"
                className="text-foreground"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Télécharger</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrint}
                title="Imprimer"
                className="text-foreground"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Imprimer</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreen}
                title="Plein écran"
                className="text-foreground"
              >
                <Maximize className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border/50 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                title="Déconnexion"
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Quitter</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbookReader;
