import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Music, Sparkles, ChevronsRight, Play, Pencil, Download, KeyRound, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  buildPianoVoicing,
  symbolSuffixFor,
  type ChordGridResult,
  type ChordHit,
  type ChordQualityKey,
  type NoteName,
} from "@/lib/chordRecognition";
import { playChord, stopAllNotes } from "@/lib/musicTheory/audio";
import { chordGridToMidiBlob, downloadBlob } from "@/lib/musicTheory/midiExport";

interface Props {
  data: ChordGridResult;
}

const FN_STYLE: Record<"T" | "S" | "D", string> = {
  T: "bg-primary/15 text-primary border-primary/40",
  S: "bg-secondary/20 text-secondary border-secondary/40",
  D: "bg-destructive/15 text-destructive border-destructive/40",
};

const NOTES: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const QUALITIES: { value: ChordQualityKey; label: string }[] = [
  { value: "maj", label: "Maj" },
  { value: "min", label: "min" },
  { value: "dim", label: "dim" },
  { value: "aug", label: "aug" },
  { value: "sus4", label: "sus4" },
  { value: "maj7", label: "maj7" },
  { value: "m7", label: "m7" },
  { value: "7", label: "7" },
  { value: "m7b5", label: "ø" },
  { value: "dim7", label: "°7" },
];

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const confidenceDots = (conf: number) => {
  if (conf >= 0.65) return "●●●";
  if (conf >= 0.4) return "●●○";
  return "●○○";
};

const ChordTile = ({
  chord,
  label,
  showExtensions,
  compact,
  isPlaying,
  onPlay,
  onEdit,
}: {
  chord: ChordHit;
  label?: string;
  showExtensions: boolean;
  compact?: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onEdit?: () => void;
}) => {
  const fnClass = chord.fn ? FN_STYLE[chord.fn] : "bg-muted/20 text-muted-foreground border-border/40";
  return (
    <button
      type="button"
      onClick={onPlay}
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-md border bg-background/40 px-2 py-2 text-center transition-all cursor-pointer",
        "border-border/60 hover:border-primary hover:bg-primary/5",
        isPlaying && "border-primary bg-primary/10 ring-2 ring-primary/40",
        compact ? "min-w-[78px]" : "min-w-[102px]",
      )}
      title="Cliquer pour écouter"
    >
      {label && (
        <span className="absolute left-1 top-1 text-[9px] uppercase tracking-wide text-muted-foreground/70">
          {label}
        </span>
      )}
      {onEdit && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onEdit(); } }}
          className="absolute right-1 top-1 rounded p-0.5 text-muted-foreground/60 opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
        >
          <Pencil className="h-3 w-3" />
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
        <span className={cn("rounded border px-1 text-[10px] font-mono", fnClass)}>{chord.roman}</span>
      </div>
      <span
        className="mt-0.5 font-mono text-[9px] text-muted-foreground/80"
        title={`Confiance ${Math.round(chord.confidence * 100)}%`}
      >
        {confidenceDots(chord.confidence)}
      </span>
      <Play className={cn("absolute bottom-1 right-1 h-3 w-3 text-muted-foreground/40 group-hover:text-primary", isPlaying && "text-primary")} />
    </button>
  );
};

const ChordEditor = ({
  chord,
  onChange,
  onClose,
}: {
  chord: ChordHit;
  onChange: (root: NoteName, quality: ChordQualityKey) => void;
  onClose: () => void;
}) => {
  const [root, setRoot] = useState<NoteName>(chord.root);
  const [quality, setQuality] = useState<ChordQualityKey>(chord.quality);
  return (
    <div className="w-56 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">Corriger l'accord</p>
      <div className="grid grid-cols-2 gap-2">
        <Select value={root} onValueChange={(v) => setRoot(v as NoteName)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {NOTES.map((n) => (<SelectItem key={n} value={n} className="text-xs">{n}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={quality} onValueChange={(v) => setQuality(v as ChordQualityKey)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {QUALITIES.map((q) => (<SelectItem key={q.value} value={q.value} className="text-xs">{q.label}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div className="text-center text-sm font-bold text-foreground">
        {root}{symbolSuffixFor(quality)}
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onClose}>Annuler</Button>
        <Button size="sm" className="h-7 text-xs" onClick={() => { onChange(root, quality); onClose(); }}>Appliquer</Button>
      </div>
    </div>
  );
};

export default function ChordGrid({ data }: Props) {
  const { t } = useTranslation();
  const [resolution, setResolution] = useState<"bar" | "beat">("bar");
  const [showExtensions, setShowExtensions] = useState(false);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [edits, setEdits] = useState<Map<number, ChordHit>>(new Map());
  const [editingBar, setEditingBar] = useState<number | null>(null);
  const [exportRange, setExportRange] = useState<"full" | "custom">("full");
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(Math.min(8, data.bars.length));

  useEffect(() => {
    setEdits(new Map());
    setRangeFrom(1);
    setRangeTo(Math.min(8, data.bars.length));
  }, [data]);

  const bars = useMemo(() => data.bars.map((b, i) => edits.get(i) ?? b), [data.bars, edits]);

  const playChordHit = (chord: ChordHit, key: string) => {
    stopAllNotes();
    if (playingKey === key) {
      setPlayingKey(null);
      return;
    }
    const notes = buildPianoVoicing(chord, showExtensions);
    playChord(notes, "piano", { durationMs: 1400 });
    setPlayingKey(key);
    window.setTimeout(() => setPlayingKey((cur) => (cur === key ? null : cur)), 1500);
  };

  const handleEdit = (barIdx: number, root: NoteName, quality: ChordQualityKey) => {
    const original = data.bars[barIdx];
    const updated: ChordHit = {
      ...original,
      root,
      quality,
      symbol: `${root}${symbolSuffixFor(quality)}${original.bass ? `/${original.bass}` : ""}`,
      // Roman/fn become stale after edit — neutralise to avoid wrong info.
      roman: "—",
      fn: undefined,
      confidence: 1, // user-asserted
      extensions: [],
    };
    setEdits((m) => new Map(m).set(barIdx, updated));
  };

  const handleExportMidi = () => {
    const from = exportRange === "full" ? 0 : Math.max(0, rangeFrom - 1);
    const to = exportRange === "full" ? bars.length : Math.min(bars.length, rangeTo);
    if (to <= from) return;
    const voiced = bars.slice(from, to).map((c) => ({ midi: buildPianoVoicing(c, showExtensions) }));
    const blob = chordGridToMidiBlob(voiced, data.bpm, data.beatsPerBar);
    const tag = exportRange === "full" ? "full" : `m${from + 1}-${to}`;
    downloadBlob(blob, `chord-grid-${data.tonic}-${data.mode}-${data.bpm}bpm-${tag}.mid`);
  };

  const hasData = bars.length > 0;

  const barRows = useMemo(() => {
    const ROW = 4;
    const rows: ChordHit[][] = [];
    for (let i = 0; i < bars.length; i += ROW) rows.push(bars.slice(i, i + ROW));
    return rows;
  }, [bars]);

  const beatRows = useMemo(() => {
    const ROW = data.beatsPerBar * 2;
    const rows: ChordHit[][] = [];
    for (let i = 0; i < data.beats.length; i += ROW) rows.push(data.beats.slice(i, i + ROW));
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
      {/* Header / controls */}
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
            <Button type="button" variant={resolution === "bar" ? "default" : "ghost"} size="sm" className="h-7 rounded-none px-2 text-xs" onClick={() => setResolution("bar")}>
              {t("keybpm.chords.byBar", { defaultValue: "Par mesure" })}
            </Button>
            <Button type="button" variant={resolution === "beat" ? "default" : "ghost"} size="sm" className="h-7 rounded-none px-2 text-xs" onClick={() => setResolution("beat")}>
              {t("keybpm.chords.byBeat", { defaultValue: "Par temps" })}
            </Button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch checked={showExtensions} onCheckedChange={setShowExtensions} />
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {t("keybpm.chords.showExt", { defaultValue: "Extensions 9/11/13" })}
            </span>
          </label>
        </div>
      </div>

      {/* Hint */}
      <div className="rounded-md border border-border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Astuce :</span> clique sur n'importe quel accord pour l'écouter (piano). Survole une case pour l'éditer si la détection est fausse.
      </div>

      {/* Modulations badge */}
      {data.modulations.length > 0 && (
        <div className="rounded-md border border-secondary/40 bg-secondary/10 p-3 text-xs">
          <div className="mb-1 flex items-center gap-2 font-semibold text-secondary">
            <KeyRound className="h-3.5 w-3.5" /> Modulations détectées
          </div>
          <ul className="space-y-0.5 text-muted-foreground">
            {data.modulations.map((m, i) => (
              <li key={i}>
                Mesure {m.barIndex + 1} → <span className="font-mono text-foreground">{m.tonic} {m.mode === "major" ? "majeur" : "mineur"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="uppercase tracking-wide">{t("keybpm.chords.legend", { defaultValue: "Fonctions" })} :</span>
        <span className="inline-flex items-center gap-1"><span className="rounded border border-primary/40 bg-primary/15 px-1 text-[10px] text-primary">T</span> Tonique</span>
        <span className="inline-flex items-center gap-1"><span className="rounded border border-secondary/40 bg-secondary/20 px-1 text-[10px] text-secondary">S</span> Sous-dominante</span>
        <span className="inline-flex items-center gap-1"><span className="rounded border border-destructive/40 bg-destructive/15 px-1 text-[10px] text-destructive">D</span> Dominante</span>
        <span className="ml-auto font-mono text-[10px]">
          {t("keybpm.chords.confLegend", { defaultValue: "Confiance" })} : ●●● {t("keybpm.confidence.high")} · ●●○ {t("keybpm.confidence.medium")} · ●○○ {t("keybpm.confidence.low")}
        </span>
      </div>

      {/* Grid */}
      <div className="space-y-3">
        {resolution === "bar"
          ? barRows.map((row, ri) => (
              <div key={`bar-row-${ri}`} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-right font-mono text-[10px] text-muted-foreground/70">
                  {formatTime(ri * 4 * data.barDurationSec)}
                </span>
                <div className="flex flex-1 flex-wrap items-stretch gap-2">
                  {row.map((c, ci) => {
                    const barIdx = ri * 4 + ci;
                    const key = `bar-${barIdx}`;
                    return (
                      <Popover key={key} open={editingBar === barIdx} onOpenChange={(o) => setEditingBar(o ? barIdx : null)}>
                        <PopoverTrigger asChild>
                          <div>
                            <ChordTile
                              chord={c}
                              label={`M${barIdx + 1}`}
                              showExtensions={showExtensions}
                              isPlaying={playingKey === key}
                              onPlay={() => playChordHit(c, key)}
                              onEdit={() => setEditingBar(barIdx)}
                            />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent align="center" className="w-auto p-3">
                          <ChordEditor
                            chord={c}
                            onChange={(r, q) => handleEdit(barIdx, r, q)}
                            onClose={() => setEditingBar(null)}
                          />
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
              </div>
            ))
          : beatRows.map((row, ri) => (
              <div key={`beat-row-${ri}`} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-right font-mono text-[10px] text-muted-foreground/70">
                  {formatTime(ri * row.length * data.beatDurationSec)}
                </span>
                <div className="flex flex-1 flex-wrap items-stretch gap-1.5">
                  {row.map((c, ci) => {
                    const key = `beat-${ri}-${ci}`;
                    return (
                      <ChordTile
                        key={key}
                        chord={c}
                        label={ci % data.beatsPerBar === 0 ? `M${Math.floor((ri * row.length + ci) / data.beatsPerBar) + 1}` : undefined}
                        showExtensions={showExtensions}
                        compact
                        isPlaying={playingKey === key}
                        onPlay={() => playChordHit(c, key)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
      </div>

      {/* Compact sequence */}
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
                  <span className="ml-1 font-mono text-[10px] text-muted-foreground">×{seg.beatLength / data.beatsPerBar}</span>
                )}
              </span>
              {i < data.segments.length - 1 && (<ChevronsRight className="h-3 w-3 text-muted-foreground/60" />)}
            </span>
          ))}
        </div>
      </div>

      {/* MIDI export */}
      <div className="rounded-md border border-border bg-background/40 p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Download className="h-3.5 w-3.5 text-primary" /> Export MIDI
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label className="flex cursor-pointer items-center gap-1">
              <input type="radio" name="midi-range" checked={exportRange === "full"} onChange={() => setExportRange("full")} />
              <span>Morceau entier</span>
            </label>
            <label className="flex cursor-pointer items-center gap-1">
              <input type="radio" name="midi-range" checked={exportRange === "custom"} onChange={() => setExportRange("custom")} />
              <span>De la mesure</span>
            </label>
            <input
              type="number"
              min={1}
              max={bars.length}
              value={rangeFrom}
              disabled={exportRange !== "custom"}
              onChange={(e) => setRangeFrom(Math.max(1, Math.min(bars.length, Number(e.target.value) || 1)))}
              className="h-7 w-14 rounded border border-border bg-background px-1 text-xs disabled:opacity-50"
            />
            <span className="text-xs">à</span>
            <input
              type="number"
              min={1}
              max={bars.length}
              value={rangeTo}
              disabled={exportRange !== "custom"}
              onChange={(e) => setRangeTo(Math.max(1, Math.min(bars.length, Number(e.target.value) || 1)))}
              className="h-7 w-14 rounded border border-border bg-background px-1 text-xs disabled:opacity-50"
            />
          </div>
          <Button size="sm" className="ml-auto h-8 text-xs" onClick={handleExportMidi}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Télécharger .mid
          </Button>
        </div>
      </div>
    </div>
  );
}
