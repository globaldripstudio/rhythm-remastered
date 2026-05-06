import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { suggestNextDegrees, functionOf } from "@/lib/musicTheory/chords";
import { cn } from "@/lib/utils";

interface BuilderTreeProps {
  tokens: string[];
  mood: "major" | "minor";
  onPick: (deg: string) => void;
}

const FN_BADGE: Record<string, { label: string; cls: string }> = {
  T: { label: "T", cls: "bg-primary/15 text-primary border-primary/40" },
  S: { label: "S", cls: "bg-secondary/20 text-secondary border-secondary/40" },
  D: { label: "D", cls: "bg-destructive/15 text-destructive border-destructive/40" },
};

export function BuilderTree({ tokens, mood, onPick }: BuilderTreeProps) {
  const last = tokens.length === 0 ? null : tokens[tokens.length - 1];
  const level1 = useMemo(() => suggestNextDegrees(last, mood), [last, mood]);
  const [hovered, setHovered] = useState<string | null>(null);
  const level2 = useMemo(
    () => (hovered ? suggestNextDegrees(hovered, mood) : null),
    [hovered, mood],
  );

  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="uppercase tracking-wide">Arborescence</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <span className="rounded border border-primary/40 bg-primary/15 px-1 text-[10px] text-primary">T</span> Tonique
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="rounded border border-secondary/40 bg-secondary/20 px-1 text-[10px] text-secondary">S</span> Sous-dom.
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="rounded border border-destructive/40 bg-destructive/15 px-1 text-[10px] text-destructive">D</span> Dominante
        </span>
      </div>

      {/* Branche racine + niveau 1 */}
      <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto_1fr]">
        {/* Racine = dernier accord posé (ou "Départ") */}
        <div className="flex items-center">
          <div className="rounded-md border border-border/60 bg-background px-3 py-2 text-center min-w-[64px]">
            <div className="text-[10px] uppercase text-muted-foreground">{last ? "Dernier" : "Départ"}</div>
            <div className="text-base font-bold">{last ?? "—"}</div>
            {last && (
              <FunctionBadge fn={functionOf(last, mood)} />
            )}
          </div>
        </div>

        <div className="flex items-center">
          <ChevronRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
          <div className="flex flex-wrap gap-1.5">
            {level1.all.map((deg) => {
              const isGood = level1.good.has(deg);
              const reason = level1.reasons[deg];
              const fn = functionOf(deg, mood);
              return (
                <button
                  key={deg}
                  onClick={() => isGood && onPick(deg)}
                  onMouseEnter={() => setHovered(deg)}
                  onFocus={() => setHovered(deg)}
                  disabled={!isGood}
                  title={reason}
                  className={cn(
                    "group relative inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-all",
                    isGood
                      ? "border-primary/40 bg-primary/10 text-foreground hover:bg-primary/20 hover:border-primary cursor-pointer"
                      : "cursor-not-allowed border-border/40 bg-muted/20 text-muted-foreground/50",
                    hovered === deg && "ring-2 ring-primary/60",
                  )}
                  aria-label={`${deg} — ${reason}`}
                >
                  <span className={cn(!isGood && "line-through")}>{deg}</span>
                  <FunctionBadge fn={fn} muted={!isGood} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Niveau 2 (suggestions au-delà de l'accord survolé) */}
        <div className="flex items-center">
          <ChevronRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {level2 ? (
            level2.all.map((deg) => {
              const isGood = level2.good.has(deg);
              const fn = functionOf(deg, mood);
              return (
                <span
                  key={deg}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs",
                    isGood
                      ? "border-primary/30 bg-primary/5 text-foreground/80"
                      : "border-border/40 bg-muted/10 text-muted-foreground/40 line-through",
                  )}
                  title={level2.reasons[deg]}
                >
                  {deg}
                  <FunctionBadge fn={fn} muted={!isGood} small />
                </span>
              );
            })
          ) : (
            <span className="text-xs text-muted-foreground/70">
              Survole un accord à gauche pour voir les suites possibles.
            </span>
          )}
        </div>
      </div>

      {/* Légende des raisons (accord en cours de hover) */}
      {hovered && (
        <div className="mt-3 rounded-md border border-border/60 bg-background/50 p-2.5 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{hovered}</span> — {level1.reasons[hovered]}
        </div>
      )}
    </div>
  );
}

function FunctionBadge({ fn, muted, small }: { fn?: "T" | "S" | "D"; muted?: boolean; small?: boolean }) {
  if (!fn) return null;
  const conf = FN_BADGE[fn];
  return (
    <span
      className={cn(
        "rounded border px-1 leading-none",
        small ? "text-[9px]" : "text-[10px]",
        muted ? "border-border/40 bg-muted/20 text-muted-foreground/50" : conf.cls,
      )}
    >
      {conf.label}
    </span>
  );
}
