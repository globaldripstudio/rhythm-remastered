import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Headphones, Mic } from "lucide-react";

// Spectrum analyzer component
const SpectrumAnalyzer = ({ audioRef, isPlaying }: { audioRef: React.RefObject<HTMLAudioElement>, isPlaying: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const audioContextRef = useRef<AudioContext>();

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize audio context and analyser
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaElementSource(audio);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Get computed colors from CSS variables
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--primary').trim();
    const bgColor = "#0a0a0b"; // Dark background fallback
    const mutedColor = "rgba(255, 255, 255, 0.3)";
    
    // Parse primary HSL and convert to usable format
    const primaryHsl = `hsl(${primaryColor})`;
    const primaryHsl70 = `hsla(${primaryColor} / 0.7)`;
    const primaryHsl40 = `hsla(${primaryColor} / 0.4)`;

    const draw = () => {
      if (!isPlaying) return;
      
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas with background
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

        // Create gradient for each bar with actual color values
        const gradient = ctx.createLinearGradient(x, canvas.height, x, y);
        gradient.addColorStop(0, primaryHsl);
        gradient.addColorStop(0.5, primaryHsl70);
        gradient.addColorStop(1, primaryHsl40);
        
        ctx.fillStyle = gradient;
        
        // Draw rounded bars
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
        ctx.fill();

        // Add glow effect
        ctx.shadowColor = primaryHsl;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      // Reset shadow
      ctx.shadowBlur = 0;
    };

    if (isPlaying) {
      draw();
    } else {
      // Draw static idle bars when not playing
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
  }, [isPlaying, audioRef]);

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
  const [selectedGenre, setSelectedGenre] = useState('hiphop');
  const [playingBefore, setPlayingBefore] = useState(false);
  const [playingAfter, setPlayingAfter] = useState(false);
  
  const beforeRef = useRef<HTMLAudioElement>(null);
  const afterRef = useRef<HTMLAudioElement>(null);

  const genres = [
    { 
      key: 'hiphop', 
      title: 'Hip-Hop',
      description: 'Punch et clarté pour le rap moderne',
      beforeSrc: '/audio/hef-no-mix.wav',
      afterSrc: '/audio/hef-mixed.wav',
      credits: '"HEFNER" by Tany, produit au Global Drip Studio et paru le 1er décembre 2023'
    },
    { 
      key: 'rock', 
      title: 'Rock',
      description: 'Puissance et dynamique pour le rock',
      beforeSrc: '/audio/excalibur-no-mix.wav',
      afterSrc: '/audio/excalibur-mixed.wav',
      credits: '"Excalibur" by Venin, édité/enregistré (voix)/mixé/masterisé au Global Drip Studio et paru le 15 mai 2025'
    },
    { 
      key: 'edm', 
      title: 'EDM',
      description: 'Impact et largeur pour l\'électronique',
      beforeSrc: '/audio/bigbass-no-mix.wav',
      afterSrc: '/audio/bigbass-mixed.wav',
      credits: '"BIG BASS" by Eddy de Mart, mixé et masterisé au Global Drip Studio, unreleased'
    }
  ];

  // Stop all audio when switching genres
  useEffect(() => {
    if (beforeRef.current) {
      beforeRef.current.pause();
      beforeRef.current.currentTime = 0;
    }
    if (afterRef.current) {
      afterRef.current.pause();
      afterRef.current.currentTime = 0;
    }
    setPlayingBefore(false);
    setPlayingAfter(false);
  }, [selectedGenre]);

  const handleBeforePlay = () => {
    if (afterRef.current) {
      afterRef.current.pause();
      setPlayingAfter(false);
    }
    
    if (beforeRef.current) {
      if (playingBefore) {
        beforeRef.current.pause();
        setPlayingBefore(false);
      } else {
        beforeRef.current.play();
        setPlayingBefore(true);
      }
    }
  };

  const handleAfterPlay = () => {
    if (beforeRef.current) {
      beforeRef.current.pause();
      setPlayingBefore(false);
    }
    
    if (afterRef.current) {
      if (playingAfter) {
        afterRef.current.pause();
        setPlayingAfter(false);
      } else {
        afterRef.current.play();
        setPlayingAfter(true);
      }
    }
  };

  const currentGenre = genres.find(g => g.key === selectedGenre);

  return (
    <section id="audio-comparison" className="py-16 sm:py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Écoutez la <span className="hero-text">Différence</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Comparez l'avant/après de notre travail sur différents styles
          </p>
        </div>

        {/* Genre Selection - More compact pills */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {genres.map((genre) => (
            <button
              key={genre.key}
              onClick={() => setSelectedGenre(genre.key)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                selectedGenre === genre.key
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
              }`}
            >
              {genre.title}
            </button>
          ))}
        </div>

        {/* Main Audio Comparison Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm">
            {/* Genre Info Header */}
            <div className="text-center py-4 sm:py-5 px-4 border-b border-border/30 bg-card/30">
              <h3 className="text-lg sm:text-xl font-semibold mb-1">{currentGenre?.title}</h3>
              <p className="text-sm text-muted-foreground">{currentGenre?.description}</p>
            </div>

            {/* Audio Players - Side by side on all screens */}
            <div className="grid grid-cols-2 divide-x divide-border/30">
              {/* Before */}
              <div className="p-4 sm:p-6">
                <div className="text-center mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground font-medium">Avant</span>
                </div>
                <audio
                  ref={beforeRef}
                  src={currentGenre?.beforeSrc}
                  onEnded={() => setPlayingBefore(false)}
                  onLoadStart={() => setPlayingBefore(false)}
                  crossOrigin="anonymous"
                />
                <SpectrumAnalyzer audioRef={beforeRef} isPlaying={playingBefore} />
                <Button
                  onClick={handleBeforePlay}
                  variant="outline"
                  className={`w-full mt-3 sm:mt-4 h-10 sm:h-12 transition-all duration-300 ${
                    playingBefore ? 'border-primary/50 bg-primary/10' : ''
                  }`}
                >
                  {playingBefore ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span className="ml-2 text-sm sm:text-base">{playingBefore ? 'Pause' : 'Original'}</span>
                </Button>
              </div>

              {/* After */}
              <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="text-center mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm uppercase tracking-wider text-primary font-medium">Après</span>
                </div>
                <audio
                  ref={afterRef}
                  src={currentGenre?.afterSrc}
                  onEnded={() => setPlayingAfter(false)}
                  onLoadStart={() => setPlayingAfter(false)}
                  crossOrigin="anonymous"
                />
                <SpectrumAnalyzer audioRef={afterRef} isPlaying={playingAfter} />
                <Button
                  onClick={handleAfterPlay}
                  className={`w-full mt-3 sm:mt-4 h-10 sm:h-12 studio-button transition-all duration-300 ${
                    playingAfter ? 'shadow-lg shadow-primary/30' : ''
                  }`}
                >
                  {playingAfter ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span className="ml-2 text-sm sm:text-base">{playingAfter ? 'Pause' : 'Mixé'}</span>
                </Button>
              </div>
            </div>

            {/* Credits Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border/30 bg-card/20">
              <p className="text-xs sm:text-sm text-muted-foreground/70 text-center italic">
                {currentGenre?.credits}
              </p>
            </div>
          </Card>

          {/* Listening Tip */}
          <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground/60">
            <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Casque recommandé</span>
          </div>

          {/* CTA */}
          <div className="text-center mt-8 sm:mt-10">
            <Button 
              size="lg" 
              className="studio-button"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Réserver une session
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudioComparison;