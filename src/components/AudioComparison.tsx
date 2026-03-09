import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Headphones, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";

// Spectrum analyzer component
const SpectrumAnalyzer = ({ 
  audioRef, 
  isPlaying,
  sharedAudioContextRef
}: { 
  audioRef: React.RefObject<HTMLAudioElement>, 
  isPlaying: boolean,
  sharedAudioContextRef: React.MutableRefObject<AudioContext | undefined>
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const sourceConnectedRef = useRef(false);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!sourceConnectedRef.current && isPlaying) {
      try {
        if (!sharedAudioContextRef.current) {
          sharedAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (!analyserRef.current) {
          analyserRef.current = sharedAudioContextRef.current.createAnalyser();
          const source = sharedAudioContextRef.current.createMediaElementSource(audio);
          source.connect(analyserRef.current);
          analyserRef.current.connect(sharedAudioContextRef.current.destination);
          analyserRef.current.fftSize = 256;
          analyserRef.current.smoothingTimeConstant = 0.8;
          sourceConnectedRef.current = true;
        }
      } catch (error) {
        console.warn('AudioContext initialization failed:', error);
      }
    }

    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--primary').trim();
    const bgColor = "#0a0a0b";
    const mutedColor = "rgba(255, 255, 255, 0.3)";
    
    const primaryHsl = `hsl(${primaryColor})`;
    const primaryHsl70 = `hsla(${primaryColor} / 0.7)`;
    const primaryHsl40 = `hsla(${primaryColor} / 0.4)`;

    const draw = () => {
      if (!isPlaying || !analyserRef.current) return;
      
      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barCount = 48;
      const barWidth = (canvas.width / barCount) * 0.7;
      const gap = (canvas.width / barCount) * 0.3;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const dataIndex = i * step;
        const value = dataArray[dataIndex];
        const barHeight = (value / 255) * canvas.height * 0.9;
        
        const x = i * (barWidth + gap);
        const y = canvas.height - barHeight;

        const gradient = ctx.createLinearGradient(x, canvas.height, x, y);
        gradient.addColorStop(0, primaryHsl);
        gradient.addColorStop(0.5, primaryHsl70);
        gradient.addColorStop(1, primaryHsl40);
        
        ctx.fillStyle = gradient;
        
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
        ctx.fill();

        ctx.shadowColor = primaryHsl;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      ctx.shadowBlur = 0;
    };

    if (isPlaying && analyserRef.current) {
      draw();
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barCount = 48;
      const barWidth = (canvas.width / barCount) * 0.7;
      const gap = (canvas.width / barCount) * 0.3;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + gap);
        const idleHeight = 4 + Math.sin(i * 0.3) * 2;
        const y = canvas.height - idleHeight;
        
        ctx.fillStyle = mutedColor;
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, idleHeight, [radius, radius, 0, 0]);
        ctx.fill();
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioRef, sharedAudioContextRef]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={100}
      className="w-full h-24 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30"
    />
  );
};

const AudioComparison = () => {
  const { t } = useTranslation();
  const [selectedGenre, setSelectedGenre] = useState('hiphop');
  const [playingBefore, setPlayingBefore] = useState(false);
  const [playingAfter, setPlayingAfter] = useState(false);
  
  const beforeRef = useRef<HTMLAudioElement>(null);
  const afterRef = useRef<HTMLAudioElement>(null);

  const genres = [
    { 
      key: 'hiphop', 
      beforeSrc: '/audio/hef-no-mix.wav',
      afterSrc: '/audio/hef-mixed.wav',
    },
    { 
      key: 'rock', 
      beforeSrc: '/audio/excalibur-no-mix.wav',
      afterSrc: '/audio/excalibur-mixed.wav',
    },
    { 
      key: 'edm', 
      beforeSrc: '/audio/bigbass-no-mix.wav',
      afterSrc: '/audio/bigbass-mixed.wav',
    }
  ];

  useEffect(() => {
    if (beforeRef.current) { beforeRef.current.pause(); beforeRef.current.currentTime = 0; }
    if (afterRef.current) { afterRef.current.pause(); afterRef.current.currentTime = 0; }
    setPlayingBefore(false);
    setPlayingAfter(false);
  }, [selectedGenre]);

  const audioContextRef = useRef<AudioContext>();

  const handleBeforePlay = async () => {
    if (afterRef.current) { afterRef.current.pause(); setPlayingAfter(false); }
    if (beforeRef.current) {
      if (playingBefore) { beforeRef.current.pause(); setPlayingBefore(false); }
      else {
        try {
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
          await beforeRef.current.play(); setPlayingBefore(true);
        } catch (error) { console.error('Error playing audio:', error); }
      }
    }
  };

  const handleAfterPlay = async () => {
    if (beforeRef.current) { beforeRef.current.pause(); setPlayingBefore(false); }
    if (afterRef.current) {
      if (playingAfter) { afterRef.current.pause(); setPlayingAfter(false); }
      else {
        try {
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
          await afterRef.current.play(); setPlayingAfter(true);
        } catch (error) { console.error('Error playing audio:', error); }
      }
    }
  };

  const currentGenre = genres.find(g => g.key === selectedGenre);

  return (
    <section id="audio-comparison" className="py-16 sm:py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            {t('audio.title')} <span className="hero-text">{t('audio.titleHighlight')}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('audio.subtitle')}
          </p>
        </div>

        <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {genres.map((genre) => (
            <button
              key={genre.key}
              onClick={() => setSelectedGenre(genre.key)}
              className={`group relative px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 overflow-hidden ${
                selectedGenre === genre.key
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                  : 'bg-card/60 text-muted-foreground border border-border/50 hover:border-primary/50 hover:text-foreground hover:scale-105 hover:shadow-md hover:shadow-primary/10'
              }`}
            >
              <span className={`absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${selectedGenre === genre.key ? 'opacity-0' : ''}`} />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="relative z-10">{t(`audio.${genre.key}.title`)}</span>
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm">
            <div className="text-center py-4 sm:py-5 px-4 border-b border-border/30 bg-card/30">
              <h3 className="text-lg sm:text-xl font-semibold mb-1">{t(`audio.${selectedGenre}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`audio.${selectedGenre}.description`)}</p>
            </div>

            <div className="grid grid-cols-2 divide-x divide-border/30">
              <div className="p-4 sm:p-6">
                <div className="text-center mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground font-medium">{t('audio.before')}</span>
                </div>
                <audio ref={beforeRef} src={currentGenre?.beforeSrc} onEnded={() => setPlayingBefore(false)} onLoadStart={() => setPlayingBefore(false)} crossOrigin="anonymous" />
                <SpectrumAnalyzer audioRef={beforeRef} isPlaying={playingBefore} sharedAudioContextRef={audioContextRef} />
                <Button onClick={handleBeforePlay} variant="outline" className={`w-full mt-3 sm:mt-4 h-10 sm:h-12 transition-all duration-300 ${playingBefore ? 'border-primary/50 bg-primary/10' : ''}`}>
                  {playingBefore ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span className="ml-2 text-sm sm:text-base">{playingBefore ? t('audio.pause') : t('audio.original')}</span>
                </Button>
              </div>

              <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="text-center mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm uppercase tracking-wider text-primary font-medium">{t('audio.after')}</span>
                </div>
                <audio ref={afterRef} src={currentGenre?.afterSrc} onEnded={() => setPlayingAfter(false)} onLoadStart={() => setPlayingAfter(false)} crossOrigin="anonymous" />
                <SpectrumAnalyzer audioRef={afterRef} isPlaying={playingAfter} sharedAudioContextRef={audioContextRef} />
                <Button onClick={handleAfterPlay} className={`w-full mt-3 sm:mt-4 h-10 sm:h-12 studio-button transition-all duration-300 ${playingAfter ? 'shadow-lg shadow-primary/30' : ''}`}>
                  {playingAfter ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span className="ml-2 text-sm sm:text-base">{playingAfter ? t('audio.pause') : t('audio.mixed')}</span>
                </Button>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border/30 bg-card/20">
              <p className="text-xs sm:text-sm text-muted-foreground/70 text-center italic">{t(`audio.${selectedGenre}.credits`)}</p>
            </div>
          </Card>

          <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground/60">
            <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t('audio.headphones')}</span>
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <Button size="lg" className="studio-button" onClick={() => {
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              setTimeout(() => window.dispatchEvent(new Event('highlight-phone')), 800);
            }}>
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t('audio.bookSession')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudioComparison;
