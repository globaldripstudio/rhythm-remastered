import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { NOTE_NAMES, midiToName, type NoteName, tonicIndex } from "@/lib/musicTheory/scales";
import { playNote } from "@/lib/musicTheory/audio";

interface PianoKeyboardProps {
  startMidi?: number; // C3 = 48
  octaves?: number;
  scalePcs: Set<number>;
  tonic: NoteName;
  /** Pitch classes (0..11) of the currently sounded chord (highlighted teal) */
  highlightPcs?: Set<number>;
}

const WHITE_OFFSETS = [0, 2, 4, 5, 7, 9, 11];
const BLACK_OFFSETS = [1, 3, 6, 8, 10];

export function PianoKeyboard({
  startMidi = 48,
  octaves = 3,
  scalePcs,
  tonic,
  highlightPcs,
}: PianoKeyboardProps) {
  const tonicPc = tonicIndex(tonic);

  const whiteKeys = useMemo(() => {
    const keys: { midi: number; pc: number }[] = [];
    for (let o = 0; o < octaves; o++) {
      WHITE_OFFSETS.forEach((off) => {
        const midi = startMidi + o * 12 + off;
        keys.push({ midi, pc: midi % 12 });
      });
    }
    return keys;
  }, [startMidi, octaves]);

  const blackKeys = useMemo(() => {
    const keys: { midi: number; pc: number; whiteIndex: number }[] = [];
    // Map each black key to position relative to white keys
    // Pattern within an octave (white index 0..6): black after 0,1,3,4,5
    const blackAfter = [0, 1, 3, 4, 5];
    const blackOffs = [1, 3, 6, 8, 10];
    for (let o = 0; o < octaves; o++) {
      blackOffs.forEach((off, i) => {
        const midi = startMidi + o * 12 + off;
        keys.push({ midi, pc: midi % 12, whiteIndex: o * 7 + blackAfter[i] });
      });
    }
    return keys;
  }, [startMidi, octaves]);

  const totalWhite = whiteKeys.length;
  const whiteWidthPct = 100 / totalWhite;
  const blackWidthPct = whiteWidthPct * 0.6;

  const handlePlay = (midi: number) => playNote(midi, "piano", { durationMs: 800 });

  const isInScale = (pc: number) => scalePcs.has(pc);
  const isHighlight = (pc: number) => highlightPcs?.has(pc) ?? false;
  const isTonic = (pc: number) => pc === tonicPc;

  return (
    <div className="w-full">
      <div className="relative w-full overflow-x-auto rounded-lg border border-border/60 bg-card/40 p-2">
        <div className="relative h-44 sm:h-56 min-w-[680px] select-none">
          {/* White keys */}
          <div className="absolute inset-0 flex">
            {whiteKeys.map((k) => {
              const inScale = isInScale(k.pc);
              const tonicHere = isTonic(k.pc);
              const highlight = isHighlight(k.pc);
              return (
                <button
                  key={k.midi}
                  type="button"
                  onMouseDown={() => handlePlay(k.midi)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handlePlay(k.midi);
                  }}
                  aria-label={midiToName(k.midi)}
                  className={cn(
                    "relative flex h-full flex-col items-center justify-end border-r border-border/60 pb-2 transition-colors active:translate-y-0.5",
                    "bg-background hover:bg-muted/40",
                    inScale && "bg-primary/15 hover:bg-primary/25",
                    highlight && "bg-secondary/40 hover:bg-secondary/50",
                    tonicHere && "ring-2 ring-inset ring-primary",
                  )}
                  style={{ width: `${whiteWidthPct}%` }}
                >
                  <span
                    className={cn(
                      "text-[10px] font-medium text-muted-foreground sm:text-xs",
                      tonicHere && "text-primary font-bold",
                    )}
                  >
                    {NOTE_NAMES[k.pc]}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Black keys */}
          <div className="absolute inset-0 pointer-events-none">
            {blackKeys.map((k) => {
              const left = whiteWidthPct * (k.whiteIndex + 1) - blackWidthPct / 2;
              const inScale = isInScale(k.pc);
              const tonicHere = isTonic(k.pc);
              const highlight = isHighlight(k.pc);
              return (
                <button
                  key={k.midi}
                  type="button"
                  onMouseDown={() => handlePlay(k.midi)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handlePlay(k.midi);
                  }}
                  aria-label={midiToName(k.midi)}
                  className={cn(
                    "pointer-events-auto absolute top-0 h-[62%] rounded-b-md border border-border/80 shadow-md transition-colors active:translate-y-0.5",
                    "bg-foreground/90 hover:bg-foreground",
                    inScale && "bg-primary hover:bg-primary/90",
                    highlight && "bg-secondary hover:bg-secondary/90",
                    tonicHere && "ring-2 ring-inset ring-primary-foreground",
                  )}
                  style={{ left: `${left}%`, width: `${blackWidthPct}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
