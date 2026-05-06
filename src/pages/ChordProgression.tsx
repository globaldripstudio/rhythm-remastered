import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dice5,
  Download,
  Guitar,
  Music2,
  Pause,
  Piano,
  Play,
  RotateCcw,
  Undo2,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import {
  MODES,
  NOTE_NAMES,
  type ModeId,
  type NoteName,
  scalePitchClasses,
} from "@/lib/musicTheory/scales";
import {
  PROGRESSION_PRESETS,
  chordFromRoman,
  progressionFromRomans,
  randomProgression,
  suggestNextDegrees,
  type Chord,
} from "@/lib/musicTheory/chords";
import { playChord, getAudioContext, stopAllNotes } from "@/lib/musicTheory/audio";
import { chordsToMidiBlob, downloadBlob } from "@/lib/musicTheory/midiExport";
import { PianoKeyboard } from "@/components/music/PianoKeyboard";
import { GuitarFretboard } from "@/components/music/GuitarFretboard";
import ToolkitHeader from "@/components/tools/ToolkitHeader";

type ViewMode = "both" | "piano" | "guitar";
type Timbre = "piano" | "guitar";

const STORAGE_KEY = "chord-progression:settings";

interface PersistedSettings {
  tonic: NoteName;
  modeId: ModeId;
  view: ViewMode;
  bpm: number;
  beatsPerChord: number;
  timbre: Timbre;
  presetId: string;
}

const DEFAULTS: PersistedSettings = {
  tonic: "C",
  modeId: "ionian",
  view: "both",
  bpm: 90,
  beatsPerChord: 4,
  timbre: "piano",
  presetId: "pop-axis",
};

function loadSettings(): PersistedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

const ChordProgression = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const initial = useMemo(loadSettings, []);
  const [tonic, setTonic] = useState<NoteName>(initial.tonic);
  const [modeId, setModeId] = useState<ModeId>(initial.modeId);
  const [view, setView] = useState<ViewMode>(initial.view);
  const [bpm, setBpm] = useState(initial.bpm);
  const [beatsPerChord, setBeatsPerChord] = useState(initial.beatsPerChord);
  const [timbre, setTimbre] = useState<Timbre>(initial.timbre);
  const [tokens, setTokens] = useState<string[]>(
    PROGRESSION_PRESETS.find((p) => p.id === initial.presetId)?.tokens ?? PROGRESSION_PRESETS[0].tokens,
  );
  const [presetId, setPresetId] = useState<string>(initial.presetId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [progMode, setProgMode] = useState<"preset" | "builder">("preset");
  const stopRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const moodFromMode: "major" | "minor" =
    MODES[modeId].diatonicQualities?.[0] === "min" ? "minor" : "major";

  // Persist
  useEffect(() => {
    try {
      const data: PersistedSettings = { tonic, modeId, view, bpm, beatsPerChord, timbre, presetId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [tonic, modeId, view, bpm, beatsPerChord, timbre, presetId]);

  const scalePcs = useMemo(() => scalePitchClasses(tonic, modeId), [tonic, modeId]);

  const chords: Chord[] = useMemo(
    () => progressionFromRomans(tokens, tonic, modeId, 4),
    [tokens, tonic, modeId],
  );

  const highlightPcs = useMemo(() => {
    if (activeIndex === null) return undefined;
    const c = chords[activeIndex];
    if (!c) return undefined;
    return new Set(c.midi.map((m) => m % 12));
  }, [activeIndex, chords]);

  const handleApplyPreset = (id: string) => {
    const preset = PROGRESSION_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    setTokens([...preset.tokens]);
    // Auto-switch tonic family if needed
    if (preset.mood === "minor" && (modeId === "ionian" || modeId === "lydian")) {
      setModeId("aeolian");
    } else if (preset.mood === "major" && (modeId === "aeolian" || modeId === "phrygian")) {
      setModeId("ionian");
    }
  };

  const handlePlayProgression = async () => {
    if (isPlaying) {
      stopRef.current.cancelled = true;
      stopAllNotes();
      setIsPlaying(false);
      setActiveIndex(null);
      return;
    }
    // Couper toute lecture en cours pour éviter la cacophonie
    stopAllNotes();
    const ctx = getAudioContext();
    setIsPlaying(true);
    stopRef.current.cancelled = false;
    const beatSec = 60 / bpm;
    const chordSec = beatSec * beatsPerChord;
    let t0 = ctx.currentTime + 0.05;
    for (let i = 0; i < chords.length; i++) {
      if (stopRef.current.cancelled) break;
      const c = chords[i];
      const startAt = t0;
      playChord(c.midi, timbre, { durationMs: chordSec * 950, startAt, velocity: 0.75 });
      const indexNow = i;
      const delay = (startAt - ctx.currentTime) * 1000;
      window.setTimeout(() => {
        if (!stopRef.current.cancelled) setActiveIndex(indexNow);
      }, Math.max(0, delay));
      await new Promise((r) => setTimeout(r, chordSec * 1000));
      t0 += chordSec;
    }
    setIsPlaying(false);
    setActiveIndex(null);
  };

  const handlePlayChord = (idx: number) => {
    const c = chords[idx];
    if (!c) return;
    stopAllNotes();
    setActiveIndex(idx);
    playChord(c.midi, timbre, { durationMs: 1400, velocity: 0.8 });
    window.setTimeout(() => setActiveIndex((cur) => (cur === idx ? null : cur)), 1300);
  };

  const handleRandomize = () => {
    setTokens(randomProgression(moodFromMode));
    setPresetId("custom");
  };

  // ===== Builder guidé (arborescence) =====
  const builderSuggestions = useMemo(() => {
    if (tokens.length === 0) {
      return suggestNextDegrees("I", moodFromMode);
    }
    return suggestNextDegrees(tokens[tokens.length - 1], moodFromMode);
  }, [tokens, moodFromMode]);

  const handleBuilderPick = (deg: string) => {
    const next = [...tokens, deg];
    setTokens(next);
    setPresetId("custom");
    // Pré-écoute de l'accord choisi
    try {
      const c = chordFromRoman(deg, tonic, modeId, 4);
      stopAllNotes();
      playChord(c.midi, timbre, { durationMs: 900, velocity: 0.75 });
    } catch { /* noop */ }
  };

  const handleBuilderReset = () => {
    setTokens([]);
    setPresetId("custom");
  };

  const handleBuilderUndo = () => {
    if (tokens.length === 0) return;
    setTokens(tokens.slice(0, -1));
    setPresetId("custom");
  };

  const handleExport = () => {
    const blob = chordsToMidiBlob(chords, bpm, beatsPerChord);
    downloadBlob(blob, `progression-${tonic}-${modeId}.mid`);
  };

  const handleEditToken = (idx: number, value: string) => {
    const next = [...tokens];
    next[idx] = value;
    setTokens(next);
    setPresetId("custom");
  };

  const handleAddBar = () => {
    setTokens([...tokens, "I"]);
    setPresetId("custom");
  };

  const handleRemoveBar = (idx: number) => {
    if (tokens.length <= 1) return;
    setTokens(tokens.filter((_, i) => i !== idx));
    setPresetId("custom");
  };

  const groupedPresets = useMemo(() => {
    const map = new Map<string, typeof PROGRESSION_PRESETS>();
    PROGRESSION_PRESETS.forEach((p) => {
      const arr = map.get(p.genre) ?? [];
      arr.push(p);
      map.set(p.genre, arr);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("chordTools.seo.title")}
        description={t("chordTools.seo.description")}
        path="/chord-progression"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Chord Progression Generator — Global Drip Studio",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        }}
      />

      <ToolkitHeader current="chords" />

      <main className="py-8 sm:py-16">
        <section className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-4 animate-fade-in sm:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:px-4 sm:text-sm">
              <Music2 className="w-4 h-4 text-primary" />
              {t("chordTools.badge")}
            </div>
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl md:text-6xl">
              {t("chordTools.titleStart")}<span className="hero-text">{t("chordTools.titleAccent")}</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl">
              {t("chordTools.subtitle")}
            </p>
          </div>


        {/* Key + mode + view controls */}
        <Card className="mb-6 mt-10 border-border/60 sm:mt-12">
          <CardContent className="grid gap-4 p-4 sm:p-6 md:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("chordTools.controls.tonic")}</Label>
              <Select value={tonic} onValueChange={(v) => setTonic(v as NoteName)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NOTE_NAMES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("chordTools.controls.mode")}</Label>
              <Select value={modeId} onValueChange={(v) => setModeId(v as ModeId)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(MODES).map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("chordTools.controls.view")}</Label>
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant={view === "piano" ? "default" : "outline"} onClick={() => setView("piano")}>
                  <Piano className="mr-1.5 h-4 w-4" /> {t("chordTools.controls.piano")}
                </Button>
                <Button size="sm" variant={view === "guitar" ? "default" : "outline"} onClick={() => setView("guitar")}>
                  <Guitar className="mr-1.5 h-4 w-4" /> {t("chordTools.controls.guitar")}
                </Button>
                <Button size="sm" variant={view === "both" ? "default" : "outline"} onClick={() => setView("both")}>
                  {t("chordTools.controls.both")}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("chordTools.controls.timbre")}</Label>
              <Select value={timbre} onValueChange={(v) => setTimbre(v as Timbre)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="piano">{t("chordTools.controls.piano")}</SelectItem>
                  <SelectItem value="guitar">{t("chordTools.controls.guitar")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Progression builder */}
        <Card className="mb-6 border-border/60">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{t("chordTools.progression.title")}</h2>
                <p className="text-xs text-muted-foreground">
                  {progMode === "preset"
                    ? t("chordTools.progression.subtitle")
                    : t("chordTools.progression.builderHint")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-md border border-border/60 p-0.5">
                  <Button
                    size="sm"
                    variant={progMode === "preset" ? "default" : "ghost"}
                    className="h-7 px-2.5 text-xs"
                    onClick={() => setProgMode("preset")}
                  >
                    {t("chordTools.progression.modePreset")}
                  </Button>
                  <Button
                    size="sm"
                    variant={progMode === "builder" ? "default" : "ghost"}
                    className="h-7 px-2.5 text-xs"
                    onClick={() => setProgMode("builder")}
                  >
                    {t("chordTools.progression.modeBuilder")}
                  </Button>
                </div>
                {progMode === "preset" && (
                  <Button size="sm" variant="outline" onClick={handleRandomize}>
                    <Dice5 className="mr-1.5 h-4 w-4" /> {t("chordTools.progression.random")}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleExport}>
                  <Download className="mr-1.5 h-4 w-4" /> {t("chordTools.progression.midi")}
                </Button>
                <Button size="sm" onClick={handlePlayProgression}>
                  {isPlaying ? <Pause className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}
                  {isPlaying ? t("chordTools.progression.stop") : t("chordTools.progression.play")}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {progMode === "preset" ? (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("chordTools.progression.preset")}</Label>
                  <Select value={presetId} onValueChange={handleApplyPreset}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {presetId === "custom" && <SelectItem value="custom">{t("chordTools.progression.custom")}</SelectItem>}
                      {groupedPresets.map(([genre, presets]) => (
                        <div key={genre}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{genre}</div>
                          {presets.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <Button size="sm" variant="outline" onClick={handleBuilderUndo} disabled={tokens.length === 0}>
                    <Undo2 className="mr-1.5 h-4 w-4" /> {t("chordTools.progression.builderUndo")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBuilderReset} disabled={tokens.length === 0}>
                    <RotateCcw className="mr-1.5 h-4 w-4" /> {t("chordTools.progression.builderReset")}
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("chordTools.progression.tempo", { bpm })}</Label>
                  <Slider value={[bpm]} min={40} max={200} step={1} onValueChange={(v) => setBpm(v[0])} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("chordTools.progression.beats")}</Label>
                  <Slider value={[beatsPerChord]} min={1} max={8} step={1} onValueChange={(v) => setBeatsPerChord(v[0])} />
                </div>
              </div>
            </div>

            {/* Chord cards */}
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {chords.map((c, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-lg border p-3 transition-colors ${
                    activeIndex === idx
                      ? "border-secondary bg-secondary/15"
                      : "border-border/60 bg-card/40 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-2xl font-bold">{c.symbol}</div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{c.roman}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveBar(idx)}
                      className="text-xs text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label={t("chordTools.progression.removeAria")}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground">
                    {c.midi.map((m) => NOTE_NAMES[m % 12]).join(" · ")}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={tokens[idx]}
                      onChange={(e) => handleEditToken(idx, e.target.value)}
                      className="w-20 rounded border border-border/60 bg-background px-2 py-1 text-xs"
                      aria-label={t("chordTools.progression.romanAria")}
                    />
                    <Button size="sm" variant="ghost" onClick={() => handlePlayChord(idx)} className="ml-auto">
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {progMode === "preset" && (
                <button
                  onClick={handleAddBar}
                  className="flex min-h-[88px] items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {t("chordTools.progression.add")}
                </button>
              )}
            </div>

            {/* Builder palette */}
            {progMode === "builder" && (
              <div className="rounded-lg border border-border/60 bg-card/30 p-3 sm:p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t("chordTools.progression.builderNext")}
                  </Label>
                  {tokens.length === 0 && (
                    <span className="text-xs text-muted-foreground">{t("chordTools.progression.builderEmpty")}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {builderSuggestions.all.map((deg) => {
                    const isGood = builderSuggestions.good.has(deg);
                    return (
                      <button
                        key={deg}
                        onClick={() => handleBuilderPick(deg)}
                        disabled={!isGood}
                        className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-all ${
                          isGood
                            ? "border-primary/40 bg-primary/10 text-foreground hover:bg-primary/20 hover:border-primary"
                            : "cursor-not-allowed border-border/40 bg-muted/20 text-muted-foreground/40 line-through"
                        }`}
                      >
                        {deg}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Visualizers */}
        <div className="space-y-6">
          {(view === "piano" || view === "both") && (
            <Card className="border-border/60">
              <CardContent className="space-y-3 p-4 sm:p-6">
                <div className="flex items-center gap-2">
                  <Piano className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold">{t("chordTools.viz.pianoTitle", { tonic, mode: MODES[modeId].label })}</h3>
                </div>
                <PianoKeyboard scalePcs={scalePcs} tonic={tonic} highlightPcs={highlightPcs} />
                <p className="text-xs text-muted-foreground">{t("chordTools.viz.pianoHint")}</p>
              </CardContent>
            </Card>
          )}
          {(view === "guitar" || view === "both") && (
            <Card className="border-border/60">
              <CardContent className="space-y-3 p-4 sm:p-6">
                <div className="flex items-center gap-2">
                  <Guitar className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold">{t("chordTools.viz.guitarTitle", { tonic, mode: MODES[modeId].label })}</h3>
                </div>
                <GuitarFretboard scalePcs={scalePcs} tonic={tonic} highlightPcs={highlightPcs} />
                <p className="text-xs text-muted-foreground">{t("chordTools.viz.guitarHint")}</p>
              </CardContent>
            </Card>
          )}
          </div>

          {/* Bottom info boxes — user-friendly */}
          <section
            className="mt-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr]"
            aria-labelledby="chords-seo-title"
          >
            <div className="rounded-md border border-border bg-background/40 p-4 sm:p-5">
              <h2 id="chords-seo-title" className="text-xl font-bold sm:text-2xl">
                {t("chordTools.seoBlock.title")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t("chordTools.seoBlock.description")}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(["key", "mode", "preset"] as const).map((item) => (
                  <div key={item} className="rounded-md bg-muted/25 p-3">
                    <h3 className="text-sm font-semibold text-foreground">{t(`chordTools.seoBlock.topics.${item}.title`)}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(`chordTools.seoBlock.topics.${item}.description`)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-border bg-background/40 p-4 sm:p-5">
              <h2 className="text-base font-bold text-foreground sm:text-lg">{t("chordTools.seoBlock.howTitle")}</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {(["key", "preset", "play", "view", "export"] as const).map((item) => (
                  <li key={item}>• <span dangerouslySetInnerHTML={{ __html: t(`chordTools.seoBlock.how.${item}`) }} /></li>
                ))}
              </ul>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default ChordProgression;
