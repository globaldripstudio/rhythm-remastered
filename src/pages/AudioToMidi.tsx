import { Music4, Sparkles, Lock, Wand2 } from "lucide-react";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import ToolkitHeader from "@/components/tools/ToolkitHeader";
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

      <ToolkitHeader current="audio2midi" />

      <main className="py-8 sm:py-20">
        <section className="container mx-auto px-4 sm:px-6">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:px-4 sm:text-sm">
              <Music4 className="w-4 h-4 text-primary" />
              Convertisseur Audio → MIDI
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl font-bold leading-tight sm:text-5xl md:text-6xl">
                Audio vers <span className="hero-text">MIDI</span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl">
                Glisse une voix, un instrument ou une mélodie : on extrait les notes en MIDI prêt à
                importer dans ta DAW. Polyphonique, 100% local, sans inscription.
              </p>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-3">
              <div className="rounded-md border border-border bg-background/40 p-3">
                <p className="font-semibold text-foreground">Polyphonique</p>
                <p className="mt-1 leading-relaxed">Détecte plusieurs notes simultanées (accords, arpèges).</p>
              </div>
              <div className="rounded-md border border-border bg-background/40 p-3">
                <p className="font-semibold text-foreground">100% local</p>
                <p className="mt-1 leading-relaxed">Aucun upload : tout tourne dans ton navigateur.</p>
              </div>
              <div className="rounded-md border border-border bg-background/40 p-3">
                <p className="font-semibold text-foreground">Export MIDI</p>
                <p className="mt-1 leading-relaxed">Téléchargement direct au format .mid standard.</p>
              </div>
            </div>

            <AudioToMidiTool />
          </div>

          {/* Bottom info boxes — user-friendly */}
          <section
            className="mt-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr]"
            aria-labelledby="audio2midi-seo-title"
          >
            <div className="rounded-md border border-border bg-background/40 p-4 sm:p-5">
              <h2 id="audio2midi-seo-title" className="text-xl font-bold sm:text-2xl">
                À quoi sert l'Audio → MIDI ?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Transforme une mélodie sifflée, une ligne de piano, une voix ou un instrument acoustique en
                notes MIDI éditables. Idéal pour reprendre un riff dans ta DAW, transposer, doubler avec un
                synthé ou ré-orchestrer une idée.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-muted/25 p-3">
                  <h3 className="text-sm font-semibold text-foreground">Beatmaking</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Récupère la mélodie d'un sample pour la reproduire avec tes propres sons.
                  </p>
                </div>
                <div className="rounded-md bg-muted/25 p-3">
                  <h3 className="text-sm font-semibold text-foreground">Compo</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Capture une idée chantée et édite-la note par note dans ton piano roll.
                  </p>
                </div>
                <div className="rounded-md bg-muted/25 p-3">
                  <h3 className="text-sm font-semibold text-foreground">Réorchestration</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Convertis une partie acoustique pour la jouer sur un autre instrument virtuel.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-border bg-background/40 p-4 sm:p-5">
              <h2 className="text-base font-bold text-foreground sm:text-lg">Conseils pour un meilleur résultat</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                <li>• Source <strong className="text-foreground">propre et isolée</strong> (pas de batterie ni de mix complet).</li>
                <li>• Une seule voix / un seul instrument à la fois donne les meilleurs résultats.</li>
                <li>• Préfère un fichier <strong className="text-foreground">WAV</strong> non compressé si possible.</li>
                <li>• Coupe le silence en début/fin pour accélérer le traitement.</li>
                <li>• Le fichier ne quitte jamais ton navigateur — totalement privé.</li>
              </ul>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Garanties">
            <Card className="equipment-card">
              <CardContent className="flex items-start gap-3 p-4 sm:p-5">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Confidentialité totale</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Tout est traité côté navigateur. Aucun fichier n'est envoyé sur un serveur.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="equipment-card">
              <CardContent className="flex items-start gap-3 p-4 sm:p-5">
                <Wand2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Détection polyphonique</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Reconnaît plusieurs notes simultanées : accords, harmonies, arpèges.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="equipment-card">
              <CardContent className="flex items-start gap-3 p-4 sm:p-5">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Gratuit & illimité</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Pas de quota, pas d'inscription. Utilise-le autant que tu veux.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </section>
      </main>
    </div>
  );
};

export default AudioToMidiPage;
