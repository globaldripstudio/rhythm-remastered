import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bot, Drum, Gauge, KeyRound, Music2, Music4 } from "lucide-react";
import ContactCTA from "@/components/ContactCTA";

type ToolKey = "loudness" | "keybpm" | "tempo" | "chords" | "audio2midi" | "aisong";

const ALL_TOOLS: Record<ToolKey, { to: string; icon: typeof Gauge }> = {
  loudness: { to: "/loudness", icon: Gauge },
  keybpm: { to: "/key-bpm-finder", icon: KeyRound },
  tempo: { to: "/tap-tempo-metronome", icon: Drum },
  chords: { to: "/chord-progression", icon: Music2 },
  audio2midi: { to: "/audio-to-midi", icon: Music4 },
  aisong: { to: "/ai-song-checker", icon: Bot },
};

interface ToolResourcesProps {
  current: ToolKey;
  /** Heading title (defaults to the translated "Continue with the toolkit"). */
  title?: string;
}

/**
 * Cross-sell block placed at the bottom of every tool page. Boosts internal
 * linking + funnels visitors toward studio services.
 */
const ToolResources = ({ current, title }: ToolResourcesProps) => {
  const { t } = useTranslation();
  const others = (Object.keys(ALL_TOOLS) as ToolKey[]).filter((k) => k !== current);
  const navigate = useNavigate();
  const location = useLocation();

  const goToServices = (e: React.MouseEvent) => {
    e.preventDefault();
    const scroll = () => {
      const target = document.getElementById("services");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (location.pathname === "/") scroll();
    else {
      navigate("/");
      setTimeout(scroll, 500);
    }
  };

  return (
    <section
      aria-labelledby="tool-resources-title"
      className="mt-10 rounded-md border border-border bg-background/40 p-4 sm:p-6"
    >
      <div>
        <h2 id="tool-resources-title" className="text-xl font-bold sm:text-2xl">
          {title ?? t("toolkit.resources.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("toolkit.resources.introPre")}
          <a
            href="/#services"
            onClick={goToServices}
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("toolkit.resources.introLink")}
          </a>
          {t("toolkit.resources.introPost")}
        </p>
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
                  {t(`toolkit.resources.tools.${key}.title`)}
                </p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  {t(`toolkit.resources.tools.${key}.description`)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      <ContactCTA className="mt-6" />
    </section>
  );
};

export default ToolResources;
