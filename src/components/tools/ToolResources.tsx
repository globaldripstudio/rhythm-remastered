import { Link } from "react-router-dom";
import { ArrowRight, Drum, Gauge, KeyRound, Music2, Music4 } from "lucide-react";

type ToolKey = "loudness" | "keybpm" | "tempo" | "chords" | "audio2midi";

const ALL_TOOLS: Record<ToolKey, { to: string; icon: typeof Gauge; title: string; description: string }> = {
  loudness: {
    to: "/loudness",
    icon: Gauge,
    title: "Loudness Analyzer LUFS",
    description: "Mesure LUFS, true peak et dynamique de votre master en ligne.",
  },
  keybpm: {
    to: "/key-bpm-finder",
    icon: KeyRound,
    title: "Key & BPM Finder",
    description: "Détection de tonalité, tempo et notation Camelot pour DJs et producteurs.",
  },
  tempo: {
    to: "/tap-tempo-metronome",
    icon: Drum,
    title: "Tap Tempo & Métronome",
    description: "Tap tempo, métronome et calculateur BPM/délais en un seul outil.",
  },
  chords: {
    to: "/chord-progression",
    icon: Music2,
    title: "Accords, gammes & modes",
    description: "Générateur de progressions, piano et manche de guitare interactifs.",
  },
  audio2midi: {
    to: "/audio-to-midi",
    icon: Music4,
    title: "Audio → MIDI",
    description: "Conversion polyphonique 100 % locale, prête à importer dans votre DAW.",
  },
};

interface ToolResourcesProps {
  current: ToolKey;
  /** Heading title (defaults to "Continuer avec le toolkit"). */
  title?: string;
}

/**
 * Cross-sell block placed at the bottom of every tool page. Boosts internal
 * linking + funnels visitors toward studio services.
 */
const ToolResources = ({ current, title = "Continuer avec le toolkit" }: ToolResourcesProps) => {
  const others = (Object.keys(ALL_TOOLS) as ToolKey[]).filter((k) => k !== current);
  return (
    <section
      aria-labelledby="tool-resources-title"
      className="mt-10 rounded-md border border-border bg-background/40 p-4 sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="tool-resources-title" className="text-xl font-bold sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tous les outils sont gratuits, fonctionnent dans le navigateur et complètent les{" "}
            <Link to="/services" className="text-primary underline-offset-4 hover:underline">
              services studio Global Drip
            </Link>{" "}
            (mixage, mastering, sound design).
          </p>
        </div>
        <Link
          to="/#contact"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 sm:text-sm"
        >
          Demander un devis <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {others.map((key) => {
          const tool = ALL_TOOLS[key];
          const Icon = tool.icon;
          return (
            <Link
              key={key}
              to={tool.to}
              className="group flex items-start gap-3 rounded-md border border-border/60 bg-muted/20 p-3 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                  {tool.title}
                </p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">{tool.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ToolResources;
