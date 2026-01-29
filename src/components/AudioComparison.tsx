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
        <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Écoutez la <span className="hero-text">Différence</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Découvrez l'impact de notre travail de mixage et mastering sur différents styles musicaux
          </p>
        </div>

        {/* Genre Selection */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-10 md:mb-12">
          {genres.map((genre) => (
            <Button
              key={genre.key}
              variant={selectedGenre === genre.key ? "default" : "outline"}
              size="default"
              onClick={() => setSelectedGenre(genre.key)}
              className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-3 sm:px-4"
            >
              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
              {genre.title}
            </Button>
          ))}
        </div>

        {/* Audio Players */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border mb-3 sm:mb-4">
              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-primary" />
              <span className="text-xs sm:text-sm text-muted-foreground">Genre sélectionné</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">{currentGenre?.title}</h3>
            <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4">{currentGenre?.description}</p>
            <div className="text-xs sm:text-sm text-muted-foreground italic bg-card/30 backdrop-blur-sm rounded-lg p-2 sm:p-3 max-w-2xl mx-auto">
              {currentGenre?.credits}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* Before */}
            <Card className="equipment-item p-4 sm:p-6 md:p-8">
              <CardHeader className="text-center pb-4 sm:pb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-muted-foreground">Avant</CardTitle>
                <p className="text-sm sm:text-base text-muted-foreground">Version originale non traitée</p>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4 sm:space-y-6">
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
                  size="lg"
                  variant="outline"
                  className="w-full h-12 sm:h-14 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg"
                >
                  {playingBefore ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
                  {playingBefore ? 'Pause' : 'Écouter l\'original'}
                </Button>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="equipment-item border-primary/30 bg-gradient-to-br from-card to-primary/5 p-4 sm:p-6 md:p-8">
              <CardHeader className="text-center pb-4 sm:pb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <CardTitle className="text-xl sm:text-2xl hero-text">Après</CardTitle>
                <p className="text-sm sm:text-base text-muted-foreground">Mixé & masterisé par Global Drip Studio</p>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4 sm:space-y-6">
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
                  size="lg"
                  className="w-full h-12 sm:h-14 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg studio-button"
                >
                  {playingAfter ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
                  {playingAfter ? 'Pause' : 'Écouter le résultat'}
                </Button>
              </CardContent>
            </Card>
          </div>

        {/* Listening Recommendation */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 mt-6 sm:mt-8">
          <div className="flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
            <Headphones className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Casque ou moniteurs recommandés pour une meilleure expérience
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="studio-button text-sm sm:text-base"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            Réserver une session de mixage
          </Button>
        </div>
        </div>
      </div>
    </section>
  );
};

export default AudioComparison;