import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { NOTE_NAMES, type NoteName, tonicIndex, midiToName } from "@/lib/musicTheory/scales";
import { playNote } from "@/lib/musicTheory/audio";

interface GuitarFretboardProps {
  scalePcs: Set<number>;
  tonic: NoteName;
  highlightPcs?: Set<number>;
  frets?: number;
}

// Standard tuning (low to high), open string MIDI numbers
const TUNING_MIDI = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4
const STRING_LABELS = ["E", "A", "D", "G", "B", "e"];
const FRET_MARKERS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_MARKERS = new Set([12, 24]);

export function GuitarFretboard({
  scalePcs,
  tonic,
  highlightPcs,
  frets = 24,
}: GuitarFretboardProps) {
  const tonicPc = tonicIndex(tonic);

  const stringsOrdered = useMemo(() => [...TUNING_MIDI].reverse(), []);
  const labelsOrdered = useMemo(() => [...STRING_LABELS].reverse(), []);

  const cellW = `minmax(36px, 1fr)`;
  const gridTemplate = `48px repeat(${frets}, ${cellW})`;

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border/60 bg-card/40 p-3">
      <div className="min-w-[760px]">
        {/* Fret numbers */}
        <div className="mb-1 grid items-center text-[10px] text-muted-foreground sm:text-xs" style={{ gridTemplateColumns: gridTemplate }}>
          <div />
          {Array.from({ length: frets }).map((_, i) => {
            const fret = i + 1;
            const marker = FRET_MARKERS.has(fret) || DOUBLE_MARKERS.has(fret);
            return (
              <div key={fret} className={cn("text-center", marker && "text-primary font-semibold")}>
                {fret}
              </div>
            );
          })}
        </div>
        {/* Strings */}
        <div className="space-y-1">
          {stringsOrdered.map((openMidi, sIdx) => (
            <div
              key={sIdx}
              className="grid items-center"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {/* Open string */}
              <button
                type="button"
                onMouseDown={() => playNote(openMidi, "guitar", { durationMs: 1000 })}
                onTouchStart={(e) => {
                  e.preventDefault();
                  playNote(openMidi, "guitar", { durationMs: 1000 });
                }}
                aria-label={`Corde ${labelsOrdered[sIdx]} à vide`}
                className={cn(
                  "h-9 rounded-md border border-border/80 bg-muted/30 text-xs font-semibold transition-colors hover:bg-muted/60 active:translate-y-0.5",
                  scalePcs.has(openMidi % 12) && "bg-primary/20 hover:bg-primary/30",
                  openMidi % 12 === tonicPc && "ring-2 ring-primary text-primary",
                )}
              >
                {labelsOrdered[sIdx]}
              </button>
              {Array.from({ length: frets }).map((_, fi) => {
                const fret = fi + 1;
                const midi = openMidi + fret;
                const pc = midi % 12;
                const inScale = scalePcs.has(pc);
                const tonicHere = pc === tonicPc;
                const highlight = highlightPcs?.has(pc) ?? false;
                const showMarkerDot = sIdx === 2 && (FRET_MARKERS.has(fret) || DOUBLE_MARKERS.has(fret));
                const showMarkerDot2 = (sIdx === 1 || sIdx === 4) && DOUBLE_MARKERS.has(fret);
                return (
                  <div key={fret} className="relative h-9 border-l border-border/40">
                    {/* String line */}
                    <div className="pointer-events-none absolute inset-y-1/2 left-0 right-0 h-px -translate-y-1/2 bg-border/60" />
                    {(showMarkerDot || showMarkerDot2) && !inScale && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                      </div>
                    )}
                    {inScale && (
                      <button
                        type="button"
                        onMouseDown={() => playNote(midi, "guitar", { durationMs: 1000 })}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          playNote(midi, "guitar", { durationMs: 1000 });
                        }}
                        aria-label={midiToName(midi)}
                        className={cn(
                          "absolute inset-1 z-10 flex items-center justify-center rounded-full text-[10px] font-bold transition-transform hover:scale-110 active:scale-95",
                          tonicHere
                            ? "bg-primary text-primary-foreground ring-2 ring-primary/40"
                            : "bg-primary/30 text-foreground hover:bg-primary/50",
                          highlight && "bg-secondary text-secondary-foreground ring-2 ring-secondary/40",
                        )}
                      >
                        {NOTE_NAMES[pc]}
                      </button>
                    )}
                    {!inScale && (
                      <button
                        type="button"
                        onMouseDown={() => playNote(midi, "guitar", { durationMs: 1000 })}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          playNote(midi, "guitar", { durationMs: 1000 });
                        }}
                        aria-label={midiToName(midi)}
                        className="absolute inset-0 z-0 opacity-0 hover:opacity-100"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
