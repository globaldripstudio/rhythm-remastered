import { Link } from "react-router-dom";
import { Drum, Gauge, KeyRound, Music2, Music4 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

type ToolKey = "loudness" | "keybpm" | "tempo" | "chords" | "audio2midi";

const TOOLS: Array<{ key: ToolKey; to: string; icon: typeof Gauge }> = [
  { key: "loudness", to: "/loudness", icon: Gauge },
  { key: "keybpm", to: "/key-bpm-finder", icon: KeyRound },
  { key: "tempo", to: "/tap-tempo-metronome", icon: Drum },
  { key: "chords", to: "/chord-progression", icon: Music2 },
  { key: "audio2midi", to: "/audio-to-midi", icon: Music4 },
];

interface ToolkitHeaderProps {
  current: ToolKey;
}

const ToolkitHeader = ({ current }: ToolkitHeaderProps) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    document.body.classList.add("lang-switching");
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
    setTimeout(() => document.body.classList.remove("lang-switching"), 500);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-3 sm:px-6 py-2.5 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar sm:gap-4">
            <Link to="/" className="flex shrink-0 items-center">
              <img
                src="/lovable-uploads/logo-blanc-sans-fond.png"
                alt="Global Drip Studio"
                className="h-6 sm:h-8 object-contain"
              />
            </Link>
            <Link to="/" className="shrink-0">
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs sm:px-4 sm:text-sm">
                <span className="hidden sm:inline">← {t("toolkit.backHome")}</span>
                <span className="sm:hidden">←</span>
              </Button>
            </Link>
            <div className="mx-1 hidden h-6 w-px shrink-0 bg-border/60 sm:block" />
            <nav className="flex flex-1 items-center justify-center gap-3 sm:gap-6">
              {TOOLS.filter((tool) => tool.key !== current).map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.key} to={tool.to} className="shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground sm:px-3 sm:text-sm"
                    >
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      <span className="hidden sm:inline">{t(`toolkit.tools.${tool.key}.long`)}</span>
                      <span className="sm:hidden">{t(`toolkit.tools.${tool.key}.short`)}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
          <button
            onClick={toggleLanguage}
            className="flex shrink-0 items-center gap-1 rounded-md border border-border/50 px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            aria-label="Switch language"
          >
            <span className={i18n.language === "fr" ? "font-bold text-foreground" : ""}>FR</span>
            <span className="text-muted-foreground/40">|</span>
            <span className={i18n.language === "en" ? "font-bold text-foreground" : ""}>EN</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ToolkitHeader;
