import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Music, Sparkles, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ChordHit, ChordGridResult } from "@/lib/chordRecognition";

interface Props {
  data: ChordGridResult;
}

const FN_STYLE: Record<"T" | "S" | "D", string> = {
  T: "bg-primary/15 text-primary border-primary/40",
  S: "bg-secondary/20 text-secondary border-secondary/40",
  D: "bg-destructive/15 text-destructive border-destructive/40",
};

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const confidenceDots = (conf: number) => {
  if (conf >= 0.55) return "●●●";
  if (conf >= 0.3) return "●●○";
  return "●○○";
};

const ChordTile = ({
  chord,
  label,
  showExtensions,
  compact,
}: {
  chord: ChordHit;
  label?: string;
  showExtensions: boolean;
  compact?: boolean;
}) => {
  const fnClass = chord.fn ? FN_STYLE[chord.fn] : "bg-muted/20 text-muted-foreground border-border/40";
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-md border bg-background/40 px-2 py-2 text-center transition-colors",
        "border-border/60 hover:border-primary/60",
        compact ? "min-w-[68px]" : "min-w-[88px]",
      )}
    >
      {label && (
        <span className="absolute left-1 top-1 text-[9px] uppercase tracking-wide text-muted-foreground/70">
          {label}
        </span>
      )}
      <span className={cn("font-bold text-foreground", compact ? "text-base" : "text-lg")}>
        {chord.symbol}
        {showExtensions && chord.extensions.length > 0 && (
          <span className="ml-0.5 align-super text-[9px] text-secondary opacity-80">
            ≈{chord.extensions.join("/")}
          </span>
        )}
      </span>
      <div className="mt-1 flex items-center gap-1">
        <span className={cn("rounded border px-1 text-[10px] font-mono", fnClass)}>
          {chord.roman}
        </span>
      </div>
      <span
        className="mt-1 font-mono text-[9px] text-muted-foreground/80"
        title={`Confiance ${Math.round(chord.confidence * 100)}%`}
      >
        {confidenceDots(chord.confidence)}
      </span>
    </div>
  );
};

export default function ChordGrid({ data }: Props) {
  const { t } = useTranslation();
  const [resolution, setResolution] = useState<"bar" | "beat">("bar");
  const [showExtensions, setShowExtensions] = useState(false);

  const hasData = data.bars.length > 0;

  const barRows = useMemo(() => {
    const ROW = 4; // 4 mesures par ligne
    const rows: ChordHit[][] = [];
    for (let i = 0; i < data.bars.length; i += ROW) {
      rows.push(data.bars.slice(i, i + ROW));
    }
    return rows;
  }, [data.bars]);

  const beatRows = useMemo(() => {
    const ROW = data.beatsPerBar * 2; // 2 mesures par ligne en mode beat
    const rows: ChordHit[][] = [];
    for (let i = 0; i < data.beats.length; i += ROW) {
      rows.push(data.beats.slice(i, i + ROW));
    }
    return rows;
  }, [data.beats, data.beatsPerBar]);

  if (!hasData) {
    return (
      <div className="rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
        {t("keybpm.chords.empty", { defaultValue: "Aucune grille détectée (fichier trop court ou silencieux)." })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header / contrôles */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            {t("keybpm.chords.title", { defaultValue: "Grille d'accords" })}
          </h3>
          <span className="rounded-full border border-secondary/50 bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary">
            beta
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="inline-flex overflow-hidden rounded-md border border-border">
            <Button
              type="button"
              variant={resolution === "bar" ? "default" : "ghost"}
              size="sm"
              className="h-7 rounded-none px-2 text-xs"
              onClick={() => setResolution("bar")}
            >
              {t("keybpm.chords.byBar", { defaultValue: "Par mesure" })}
            </Button>
            <Button
              type="button"
              variant={resolution === "beat" ? "default" : "ghost"}
              size="sm"
              className="h-7 rounded-none px-2 text-xs"
              onClick={() => setResolution("beat")}
            >
              {t("keybpm.chords.byBeat", { defaultValue: "Par temps" })}
            </Button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch checked={showExtensions} onCheckedChange={setShowExtensions} />
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {t("keybpm.chords.showExt", { defaultValue: "Extensions 9/11/13 (prédictif)" })}
            </span>
          </label>
        </div>
      </div>

      {/* Bandeau de prévention */}
      <div className="rounded-md border border-border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
        {t("keybpm.chords.disclaimer", {
          defaultValue:
            "La détection d'accords sur un mix final est imparfaite (~70-85% sur triades). Les extensions 9/11/13 sont indicatives et noyées dans les harmoniques d'une production complète : à prendre avec recul.",
        })}
      </div>

      {/* Légende fonctions */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="uppercase tracking-wide">{t("keybpm.chords.legend", { defaultValue: "Fonctions" })} :</span>
        <span className="inline-flex items-center gap-1">
          <span className="rounded border border-primary/40 bg-primary/15 px-1 text-[10px] text-primary">T</span> Tonique
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="rounded border border-secondary/40 bg-secondary/20 px-1 text-[10px] text-secondary">S</span> Sous-dominante
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="rounded border border-destructive/40 bg-destructive/15 px-1 text-[10px] text-destructive">D</span> Dominante
        </span>
        <span className="ml-auto font-mono text-[10px]">
          {t("keybpm.chords.confLegend", { defaultValue: "Confiance" })} : ●●● {t("keybpm.confidence.high")} · ●●○ {t("keybpm.confidence.medium")} · ●○○ {t("keybpm.confidence.low")}
        </span>
      </div>

      {/* Grille */}
      <div className="space-y-3">
        {resolution === "bar"
          ? barRows.map((row, ri) => (
              <div key={`bar-row-${ri}`} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-right font-mono text-[10px] text-muted-foreground/70">
                  {formatTime(ri * 4 * data.barDurationSec)}
                </span>
                <div className="flex flex-1 flex-wrap items-stretch gap-2">
                  {row.map((c, ci) => (
                    <ChordTile
                      key={`b-${ri}-${ci}`}
                      chord={c}
                      label={`M${ri * 4 + ci + 1}`}
                      showExtensions={showExtensions}
                    />
                  ))}
                </div>
              </div>
            ))
          : beatRows.map((row, ri) => (
              <div key={`beat-row-${ri}`} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-right font-mono text-[10px] text-muted-foreground/70">
                  {formatTime(ri * row.length * data.beatDurationSec)}
                </span>
                <div className="flex flex-1 flex-wrap items-stretch gap-1.5">
                  {row.map((c, ci) => (
                    <ChordTile
                      key={`bt-${ri}-${ci}`}
                      chord={c}
                      label={(ci % data.beatsPerBar === 0) ? `M${Math.floor((ri * row.length + ci) / data.beatsPerBar) + 1}` : undefined}
                      showExtensions={showExtensions}
                      compact
                    />
                  ))}
                </div>
              </div>
            ))}
      </div>

      {/* Vue séquence compacte */}
      <div className="rounded-md border border-border bg-background/40 p-3">
        <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
          {t("keybpm.chords.sequence", { defaultValue: "Séquence" })}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          {data.segments.map((seg, i) => (
            <span key={`seg-${i}`} className="inline-flex items-center gap-1">
              <span className="rounded border border-border bg-background px-2 py-0.5 font-semibold text-foreground">
                {seg.chord.symbol}
                {seg.beatLength > data.beatsPerBar && (
                  <span className="ml-1 font-mono text-[10px] text-muted-foreground">
                    ×{seg.beatLength / data.beatsPerBar}
                  </span>
                )}
              </span>
              {i < data.segments.length - 1 && (
                <ChevronsRight className="h-3 w-3 text-muted-foreground/60" />
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
