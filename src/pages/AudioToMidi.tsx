import { Music4, Sparkles, Lock, Wand2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import ToolkitHeader from "@/components/tools/ToolkitHeader";
import AudioToMidiTool from "@/components/tools/AudioToMidi";
import Breadcrumbs from "@/components/Breadcrumbs";
import ToolResources from "@/components/tools/ToolResources";
import { breadcrumbSchema, softwareAppSchema } from "@/lib/seo/schemas";

const AudioToMidiPage = () => {
  const { t } = useTranslation();
  const crumbs = [
    { name: "Toolkit", path: "/loudness" },
    { name: "Audio → MIDI", path: "/audio-to-midi" },
  ];
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("chordTools.seoAudio2midi.title")}
        description={t("chordTools.seoAudio2midi.description")}
        path="/audio-to-midi"
        jsonLd={[
          softwareAppSchema({
            name: "Audio to MIDI Converter — Global Drip Studio",
            path: "/audio-to-midi",
            description: t("chordTools.seoAudio2midi.description"),
            features: [
              "Conversion polyphonique audio vers MIDI",
              "Détection multi-notes (accords, arpèges, mélodies)",
              "100% local dans le navigateur, aucune upload",
              "Export .mid standard prêt pour DAW",
              "Modèle Basic Pitch open source de Spotify",
            ],
          }),
          breadcrumbSchema(crumbs),
        ]}
      />


      <ToolkitHeader current="audio2midi" />

      <main className="py-8 sm:py-20">
        <section className="container mx-auto px-4 sm:px-6">
          <Breadcrumbs items={crumbs} className="mb-6" />
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:gap-8">
            <div className="space-y-4 animate-fade-in sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                <Music4 className="w-4 h-4 text-primary" />
                {t("audio2midi.badge")}
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl font-bold leading-tight sm:text-5xl md:text-6xl">
                  {t("audio2midi.titleStart")}<span className="hero-text">{t("audio2midi.titleAccent")}</span>
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-xl">
                  {t("audio2midi.subtitle")}
                </p>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-3">
                {(["polyphonic", "local", "export"] as const).map((item) => (
                  <div key={item} className="rounded-md border border-border bg-background/40 p-3">
                    <p className="font-semibold text-foreground">{t(`audio2midi.presentation.${item}.title`)}</p>
                    <p className="mt-1 leading-relaxed">{t(`audio2midi.presentation.${item}.description`)}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-md border border-border bg-background/40 p-3 text-sm leading-relaxed text-muted-foreground sm:p-4">
                {t("audio2midi.intro")}
              </div>
            </div>

            <AudioToMidiTool />
          </div>

          {/* Full-width MIDI player slot — populated after analysis */}
          <div id="audio2midi-player-slot" className="mt-8 empty:hidden" />

          {/* Bottom info boxes — user-friendly */}
          <section
            className="mt-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr]"
            aria-labelledby="audio2midi-seo-title"
          >
            <div className="rounded-md border border-border bg-background/40 p-4 sm:p-5">
              <h2 id="audio2midi-seo-title" className="text-xl font-bold sm:text-2xl">
                {t("audio2midi.seoBlock.title")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t("audio2midi.seoBlock.description")}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(["beatmaking", "compo", "reorchestration"] as const).map((item) => (
                  <div key={item} className="rounded-md bg-muted/25 p-3">
                    <h3 className="text-sm font-semibold text-foreground">{t(`audio2midi.seoBlock.topics.${item}.title`)}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(`audio2midi.seoBlock.topics.${item}.description`)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-border bg-background/40 p-4 sm:p-5">
              <h2 className="text-base font-bold text-foreground sm:text-lg">{t("audio2midi.seoBlock.tipsTitle")}</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {(["clean", "mono", "wav", "trim", "private"] as const).map((item) => (
                  <li key={item}>• <span dangerouslySetInnerHTML={{ __html: t(`audio2midi.seoBlock.tips.${item}`) }} /></li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Garanties">
            {([
              { key: "privacy", icon: Lock },
              { key: "polyphony", icon: Wand2 },
              { key: "free", icon: Sparkles },
            ] as const).map(({ key, icon: Icon }) => (
              <Card key={key} className="equipment-card">
                <CardContent className="flex items-start gap-3 p-4 sm:p-5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t(`audio2midi.guarantees.${key}.title`)}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(`audio2midi.guarantees.${key}.description`)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <ToolResources current="audio2midi" />
        </section>
      </main>
    </div>
  );
};

export default AudioToMidiPage;
