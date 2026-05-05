import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Calculator,
  Drum,
  Gauge,
  Hand,
  KeyRound,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import ToolkitHeader from "@/components/tools/ToolkitHeader";

/* ------------------------------------------------------------------ */
/* Tap Tempo                                                          */
/* ------------------------------------------------------------------ */

const TAP_RESET_MS = 2000;
const MAX_TAPS = 16;

const useTapTempo = () => {
  const [taps, setTaps] = useState<number[]>([]);
  const [bpm, setBpm] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0);

  const handleTap = useCallback(() => {
    const now = performance.now();
    setTaps((prev) => {
      const last = prev[prev.length - 1];
      const cleared = last && now - last > TAP_RESET_MS ? [] : prev;
      const next = [...cleared, now].slice(-MAX_TAPS);
      if (next.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < next.length; i += 1) intervals.push(next[i] - next[i - 1]);
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        setBpm(Math.round(60000 / avg));
      }
      return next;
    });
    setPulse((p) => p + 1);
  }, []);

  const reset = useCallback(() => {
    setTaps([]);
    setBpm(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleTap]);

  return { bpm, tapsCount: taps.length, handleTap, reset, pulse };
};

/* ------------------------------------------------------------------ */
/* Metronome (Web Audio scheduled clicks for sample accuracy)         */
/* ------------------------------------------------------------------ */

type Subdivision = 1 | 2 | 3 | 4;

const useMetronome = () => {
  const [bpm, setBpm] = useState(120);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [subdivision, setSubdivision] = useState<Subdivision>(1);
  const [volume, setVolume] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const stepRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const bpmRef = useRef(bpm);
  const subRef = useRef<Subdivision>(subdivision);
  const beatsRef = useRef(beatsPerBar);
  const volumeRef = useRef(volume);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { subRef.current = subdivision; }, [subdivision]);
  useEffect(() => { beatsRef.current = beatsPerBar; }, [beatsPerBar]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  const playClick = useCallback((time: number, accent: boolean, sub: boolean) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = accent ? 1500 : sub ? 800 : 1100;
    const peak = (accent ? 1 : sub ? 0.45 : 0.8) * volumeRef.current;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.06);
  }, []);

  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const lookahead = 0.1;
    while (nextNoteTimeRef.current < ctx.currentTime + lookahead) {
      const sub = subRef.current;
      const beats = beatsRef.current;
      const stepInBar = stepRef.current % (beats * sub);
      const isMainBeat = stepInBar % sub === 0;
      const beatIndex = Math.floor(stepInBar / sub);
      const accent = isMainBeat && beatIndex === 0;
      playClick(nextNoteTimeRef.current, accent, !isMainBeat);
      if (isMainBeat) {
        const currentBeatIdx = beatIndex;
        const when = nextNoteTimeRef.current - ctx.currentTime;
        window.setTimeout(() => setCurrentBeat(currentBeatIdx), Math.max(0, when * 1000));
      }
      const secondsPerStep = 60 / bpmRef.current / sub;
      nextNoteTimeRef.current += secondsPerStep;
      stepRef.current += 1;
    }
  }, [playClick]);

  const start = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctor();
    }
    void audioCtxRef.current.resume();
    stepRef.current = 0;
    nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.06;
    setCurrentBeat(0);
    setIsPlaying(true);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(scheduler, 25);
  }, [scheduler]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentBeat(0);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) stop();
    else start();
  }, [isPlaying, start, stop]);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    audioCtxRef.current?.close();
  }, []);

  return {
    bpm, setBpm,
    beatsPerBar, setBeatsPerBar,
    subdivision, setSubdivision,
    volume, setVolume,
    isPlaying, toggle, currentBeat,
  };
};

/* ------------------------------------------------------------------ */
/* BPM Calculator                                                     */
/* ------------------------------------------------------------------ */

type NoteRow = { key: string; labelKey: string; factor: number };

const NOTES: NoteRow[] = [
  { key: "1", labelKey: "tempoTools.notes.whole", factor: 4 },
  { key: "1/2", labelKey: "tempoTools.notes.half", factor: 2 },
  { key: "1/4", labelKey: "tempoTools.notes.quarter", factor: 1 },
  { key: "1/8", labelKey: "tempoTools.notes.eighth", factor: 0.5 },
  { key: "1/16", labelKey: "tempoTools.notes.sixteenth", factor: 0.25 },
  { key: "1/32", labelKey: "tempoTools.notes.thirtysecond", factor: 0.125 },
];

const computeMs = (bpm: number, factor: number, mode: "straight" | "dotted" | "triplet") => {
  const quarter = 60000 / bpm;
  const base = quarter * factor;
  if (mode === "dotted") return base * 1.5;
  if (mode === "triplet") return (base * 2) / 3;
  return base;
};

const computeHz = (ms: number) => 1000 / ms;

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

const TapTempoMetronome = () => {
  const { t, i18n } = useTranslation();
  const tap = useTapTempo();
  const metro = useMetronome();
  const [calcBpm, setCalcBpm] = useState(120);

  const toggleLanguage = () => {
    document.body.classList.add("lang-switching");
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
    setTimeout(() => document.body.classList.remove("lang-switching"), 500);
  };

  const useTapInMetronome = () => {
    if (tap.bpm) {
      metro.setBpm(Math.round(Math.min(300, Math.max(30, tap.bpm))));
    }
  };

  const useTapInCalc = () => {
    if (tap.bpm) setCalcBpm(Math.round(Math.min(300, Math.max(30, tap.bpm))));
  };

  const calcRows = useMemo(
    () =>
      NOTES.map((note) => ({
        ...note,
        straight: computeMs(calcBpm, note.factor, "straight"),
        dotted: computeMs(calcBpm, note.factor, "dotted"),
        triplet: computeMs(calcBpm, note.factor, "triplet"),
      })),
    [calcBpm]
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("seo.tempoTools.title")}
        description={t("seo.tempoTools.description")}
        path="/tap-tempo-metronome"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareApplication",
              name: "Tap Tempo, Metronome & BPM Calculator — Global Drip Studio",
              applicationCategory: "MultimediaApplication",
              applicationSubCategory: "Music Production Tool",
              operatingSystem: "Web browser (Chrome, Firefox, Safari, Edge)",
              url: "https://globaldripstudio.fr/tap-tempo-metronome",
              description: t("seo.tempoTools.description"),
              inLanguage: ["fr", "en"],
              isAccessibleForFree: true,
              browserRequirements: "Requires JavaScript and Web Audio API",
              offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
              featureList: [
                "Tap tempo BPM detection (spacebar or click)",
                "Online metronome with subdivisions and time signatures",
                "BPM to milliseconds calculator for delays and reverbs",
                "Triplet and dotted note timings",
                "100% in-browser, no upload, no signup",
              ],
              publisher: {
                "@type": "Organization",
                name: "Global Drip Studio",
                url: "https://globaldripstudio.fr",
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://globaldripstudio.fr/" },
                { "@type": "ListItem", position: 2, name: "Tap Tempo, Metronome & BPM Calculator", item: "https://globaldripstudio.fr/tap-tempo-metronome" },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How does tap tempo work?",
                  acceptedAnswer: { "@type": "Answer", text: "Tap a button or press the spacebar in time with the music. We average the intervals between your taps to compute the BPM in real time." },
                },
                {
                  "@type": "Question",
                  name: "Is the metronome accurate?",
                  acceptedAnswer: { "@type": "Answer", text: "Yes. It uses the Web Audio API with sample-accurate scheduling so clicks stay in time even if the browser tab is busy." },
                },
                {
                  "@type": "Question",
                  name: "How do I sync delays and reverbs to the BPM?",
                  acceptedAnswer: { "@type": "Answer", text: "Enter your tempo in the BPM calculator and read the millisecond value for the note duration you need (1/4, 1/8, dotted, triplet, etc.)." },
                },
              ],
            },
          ],
        }}
      />

      <ToolkitHeader current="tempo" />

      <main className="py-8 sm:py-16">
        <section className="container mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="max-w-3xl space-y-4 animate-fade-in sm:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:px-4 sm:text-sm">
              <Drum className="w-4 h-4 text-primary" />
              {t("tempoTools.badge")}
            </div>
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Tap Tempo, <span className="hero-text">Métronome</span> & BPM
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl">
              {t("tempoTools.subtitle")}
            </p>

            {/* Anchor nav */}
            <nav className="flex flex-wrap gap-2 pt-2" aria-label={t("tempoTools.anchorAria")}>
              <a href="#tap-tempo" className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs sm:text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
                <Hand className="h-3.5 w-3.5 text-primary" /> {t("tempoTools.sections.tap")}
              </a>
              <a href="#metronome" className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs sm:text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
                <Activity className="h-3.5 w-3.5 text-primary" /> {t("tempoTools.sections.metronome")}
              </a>
              <a href="#bpm-calculator" className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs sm:text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
                <Calculator className="h-3.5 w-3.5 text-primary" /> {t("tempoTools.sections.calculator")}
              </a>
            </nav>
          </div>

          {/* Tap Tempo */}
          <section id="tap-tempo" className="mt-10 scroll-mt-24">
            <Card className="equipment-card border-border/80">
              <CardContent className="p-5 sm:p-8">
                <div className="flex items-center gap-3">
                  <Hand className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold sm:text-2xl">{t("tempoTools.tap.title")}</h2>
                </div>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t("tempoTools.tap.description")}</p>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
                  <button
                    type="button"
                    onClick={tap.handleTap}
                    className="group relative flex h-48 sm:h-60 w-full items-center justify-center rounded-xl border border-primary/40 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent text-foreground transition-transform active:scale-[0.98]"
                    aria-label={t("tempoTools.tap.button")}
                  >
                    <span
                      key={tap.pulse}
                      className="pointer-events-none absolute inset-0 rounded-xl bg-primary/20 opacity-0 animate-[fade-in_0.05s_ease-out] [animation-direction:reverse] [animation-fill-mode:forwards]"
                      style={{ animation: "tap-pulse 0.35s ease-out" }}
                    />
                    <div className="relative text-center">
                      <Hand className="mx-auto h-10 w-10 text-primary transition-transform group-active:scale-90" />
                      <div className="mt-3 text-2xl sm:text-3xl font-bold">{t("tempoTools.tap.button")}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{t("tempoTools.tap.spaceHint")}</div>
                    </div>
                  </button>

                  <div className="rounded-xl border border-border bg-background/40 p-5 sm:p-6">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">BPM</div>
                    <div className="mt-2 text-6xl sm:text-7xl font-bold text-primary tabular-nums">
                      {tap.bpm ?? "—"}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {t("tempoTools.tap.tapsCount", { count: tap.tapsCount })}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={tap.reset} className="gap-2">
                        <RotateCcw className="h-3.5 w-3.5" /> {t("tempoTools.tap.reset")}
                      </Button>
                      <Button size="sm" disabled={!tap.bpm} onClick={useTapInMetronome} className="studio-button gap-2">
                        <Activity className="h-3.5 w-3.5" /> {t("tempoTools.tap.sendMetronome")}
                      </Button>
                      <Button variant="secondary" size="sm" disabled={!tap.bpm} onClick={useTapInCalc} className="gap-2">
                        <Calculator className="h-3.5 w-3.5" /> {t("tempoTools.tap.sendCalc")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Metronome */}
          <section id="metronome" className="mt-8 scroll-mt-24">
            <Card className="equipment-card border-border/80">
              <CardContent className="p-5 sm:p-8">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold sm:text-2xl">{t("tempoTools.metronome.title")}</h2>
                </div>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t("tempoTools.metronome.description")}</p>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
                  {/* Visual */}
                  <div className="rounded-xl border border-border bg-background/40 p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <label htmlFor="metro-bpm-display" className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">BPM</label>
                        <input
                          id="metro-bpm-display"
                          type="number"
                          inputMode="numeric"
                          min={30}
                          max={300}
                          value={metro.bpm}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            if (!Number.isNaN(n)) metro.setBpm(Math.min(300, Math.max(30, n)));
                          }}
                          aria-label={t("tempoTools.metronome.tempo")}
                          className="w-[3.5ch] bg-transparent text-4xl sm:text-6xl font-bold text-primary tabular-nums outline-none border-b border-transparent focus:border-primary/60 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <Button onClick={metro.toggle} size="lg" className="studio-button gap-2 min-w-[110px]">
                        {metro.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        {metro.isPlaying ? t("tempoTools.metronome.stop") : t("tempoTools.metronome.start")}
                      </Button>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCalcBpm(Math.round(Math.min(300, Math.max(30, metro.bpm))))}
                        className="gap-2 w-full sm:w-auto"
                      >
                        <Calculator className="h-3.5 w-3.5" /> {t("tempoTools.metronome.sendCalc")}
                      </Button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {Array.from({ length: metro.beatsPerBar }).map((_, i) => {
                        const active = metro.isPlaying && metro.currentBeat === i;
                        const accent = i === 0;
                        return (
                          <div
                            key={i}
                            className={`h-9 w-9 sm:h-12 sm:w-12 rounded-full border-2 transition-all duration-100 ${
                              active
                                ? accent
                                  ? "border-primary bg-primary scale-110 shadow-[0_0_24px_hsl(var(--primary)/0.6)]"
                                  : "border-secondary bg-secondary scale-110 shadow-[0_0_18px_hsl(var(--secondary)/0.5)]"
                                : accent
                                ? "border-primary/50 bg-primary/10"
                                : "border-border bg-muted/30"
                            }`}
                            aria-label={`Beat ${i + 1}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="space-y-5 rounded-xl border border-border bg-background/40 p-5 sm:p-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">{t("tempoTools.metronome.tempo")}</Label>
                        <span className="text-sm tabular-nums text-muted-foreground">{metro.bpm} BPM</span>
                      </div>
                      <Slider
                        className="mt-2"
                        min={30}
                        max={300}
                        step={1}
                        value={[metro.bpm]}
                        onValueChange={(v) => metro.setBpm(v[0])}
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => metro.setBpm(Math.max(30, metro.bpm - 1))}>−1</Button>
                        <Button variant="outline" size="sm" onClick={() => metro.setBpm(Math.min(300, metro.bpm + 1))}>+1</Button>
                        <Input
                          type="number"
                          min={30}
                          max={300}
                          value={metro.bpm}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            if (!Number.isNaN(n)) metro.setBpm(Math.min(300, Math.max(30, n)));
                          }}
                          className="h-9 w-24"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">{t("tempoTools.metronome.beatsPerBar")}</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[2, 3, 4, 5, 6, 7].map((n) => (
                          <Button
                            key={n}
                            type="button"
                            variant={metro.beatsPerBar === n ? "default" : "outline"}
                            size="sm"
                            onClick={() => metro.setBeatsPerBar(n)}
                          >
                            {n}/4
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">{t("tempoTools.metronome.subdivision")}</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {([
                          { v: 1, l: t("tempoTools.metronome.subQuarter") },
                          { v: 2, l: t("tempoTools.metronome.subEighth") },
                          { v: 3, l: t("tempoTools.metronome.subTriplet") },
                          { v: 4, l: t("tempoTools.metronome.subSixteenth") },
                        ] as { v: Subdivision; l: string }[]).map((opt) => (
                          <Button
                            key={opt.v}
                            type="button"
                            variant={metro.subdivision === opt.v ? "default" : "outline"}
                            size="sm"
                            onClick={() => metro.setSubdivision(opt.v)}
                          >
                            {opt.l}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">{t("tempoTools.metronome.volume")}</Label>
                        <span className="text-sm tabular-nums text-muted-foreground">{Math.round(metro.volume * 100)}%</span>
                      </div>
                      <Slider
                        className="mt-2"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[metro.volume]}
                        onValueChange={(v) => metro.setVolume(v[0])}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* BPM Calculator */}
          <section id="bpm-calculator" className="mt-8 scroll-mt-24">
            <Card className="equipment-card border-border/80">
              <CardContent className="p-5 sm:p-8">
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold sm:text-2xl">{t("tempoTools.calc.title")}</h2>
                </div>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t("tempoTools.calc.description")}</p>

                <div className="mt-6 flex flex-wrap items-end gap-4">
                  <div>
                    <Label htmlFor="calc-bpm" className="text-sm">BPM</Label>
                    <Input
                      id="calc-bpm"
                      type="number"
                      min={30}
                      max={300}
                      value={calcBpm}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (!Number.isNaN(n)) setCalcBpm(Math.min(300, Math.max(30, n)));
                      }}
                      className="mt-1 h-11 w-32 text-lg font-semibold"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <Slider
                      min={30}
                      max={300}
                      step={1}
                      value={[calcBpm]}
                      onValueChange={(v) => setCalcBpm(v[0])}
                    />
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2.5 text-left font-semibold">{t("tempoTools.calc.note")}</th>
                        <th className="px-3 py-2.5 text-right font-semibold">{t("tempoTools.calc.straight")}</th>
                        <th className="px-3 py-2.5 text-right font-semibold">{t("tempoTools.calc.dotted")}</th>
                        <th className="px-3 py-2.5 text-right font-semibold">{t("tempoTools.calc.triplet")}</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Hz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calcRows.map((row) => (
                        <tr key={row.key} className="border-t border-border/60">
                          <td className="px-3 py-2.5">
                            <span className="font-semibold text-foreground">{row.key}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{t(row.labelKey)}</span>
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{row.straight.toFixed(2)} ms</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{row.dotted.toFixed(2)} ms</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{row.triplet.toFixed(2)} ms</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{computeHz(row.straight).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">{t("tempoTools.calc.usage")}</p>
              </CardContent>
            </Card>
          </section>

          {/* SEO content */}
          <section className="mt-10 grid gap-4 md:grid-cols-[1.1fr_0.9fr]" aria-labelledby="tempo-seo-title">
            <div className="rounded-md border border-border bg-background/40 p-4 sm:p-5">
              <h2 id="tempo-seo-title" className="text-xl font-bold sm:text-2xl">{t("tempoTools.seo.title")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{t("tempoTools.seo.description")}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(["musicians", "producers", "djs"] as const).map((k) => (
                  <div key={k} className="rounded-md bg-muted/25 p-3">
                    <h3 className="text-sm font-semibold text-foreground">{t(`tempoTools.seo.topics.${k}.title`)}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(`tempoTools.seo.topics.${k}.description`)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-border bg-background/40 p-4 sm:p-5">
              <h3 className="text-base font-bold text-foreground sm:text-lg">{t("tempoTools.seo.howTitle")}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {(["tap", "metronome", "calc", "privacy"] as const).map((k) => (
                  <li key={k}>• {t(`tempoTools.seo.how.${k}`)}</li>
                ))}
              </ul>
            </div>
          </section>
        </section>
      </main>

      <style>{`
        @keyframes tap-pulse {
          0% { opacity: 0.5; transform: scale(0.98); }
          100% { opacity: 0; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};

export default TapTempoMetronome;
