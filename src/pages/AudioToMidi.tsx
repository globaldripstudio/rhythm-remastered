import { Link } from "react-router-dom";
import { ChevronLeft, Music4 } from "lucide-react";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import AudioToMidiTool from "@/components/tools/AudioToMidi";

const AudioToMidiPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Audio → MIDI gratuit & local — convertisseur polyphonique | Global Drip Studio"
        description="Convertis n'importe quel fichier audio (WAV, MP3, FLAC) en MIDI directement dans ton navigateur. Détection polyphonique via Spotify Basic Pitch. 100% gratuit et privé."
        path="/audio-to-midi"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Audio to MIDI Converter — Global Drip Studio",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        }}
      />

      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Accueil
          </Link>
          <Badge variant="outline" className="border-primary/40 text-primary">Toolkit</Badge>
        </div>

        <header className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Music4 className="h-3.5 w-3.5" /> Audio → MIDI
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">Convertisseur Audio vers MIDI</h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Glisse un fichier audio (voix, instrument, mélodie) et récupère un MIDI polyphonique exploitable
            dans ta DAW. Le traitement utilise le modèle open-source Spotify Basic Pitch et tourne entièrement
            dans ton navigateur — aucun upload, aucune limite, gratuit.
          </p>
        </header>

        <AudioToMidiTool />
      </div>
    </div>
  );
};

export default AudioToMidiPage;
