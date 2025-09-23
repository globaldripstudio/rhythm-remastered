import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Headphones, Mic } from "lucide-react";

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
    <section id="audio-comparison" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Écoutez la <span className="hero-text">Différence</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez l'impact de notre travail de mixage et mastering sur différents styles musicaux
          </p>
        </div>

        {/* Genre Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {genres.map((genre) => (
            <Button
              key={genre.key}
              variant={selectedGenre === genre.key ? "default" : "outline"}
              size="lg"
              onClick={() => setSelectedGenre(genre.key)}
              className="flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              {genre.title}
            </Button>
          ))}
        </div>

        {/* Audio Players */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border mb-4">
              <Volume2 className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm text-muted-foreground">Genre sélectionné</span>
            </div>
            <h3 className="text-3xl font-bold mb-3">{currentGenre?.title}</h3>
            <p className="text-lg text-muted-foreground mb-4">{currentGenre?.description}</p>
            <div className="text-sm text-muted-foreground italic bg-card/30 backdrop-blur-sm rounded-lg p-3 max-w-2xl mx-auto">
              {currentGenre?.credits}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Before */}
            <Card className="equipment-item p-8">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl text-muted-foreground">Avant</CardTitle>
                <p className="text-muted-foreground">Version originale non traitée</p>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <audio
                  ref={beforeRef}
                  src={currentGenre?.beforeSrc}
                  onEnded={() => setPlayingBefore(false)}
                  onLoadStart={() => setPlayingBefore(false)}
                />
                <Button
                  onClick={handleBeforePlay}
                  size="lg"
                  variant="outline"
                  className="w-full h-14 flex items-center justify-center gap-3 text-lg"
                >
                  {playingBefore ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  {playingBefore ? 'Pause' : 'Écouter l\'original'}
                </Button>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full bg-muted-foreground/40 rounded-full transition-all duration-300 ${playingBefore ? 'animate-pulse' : ''}`}></div>
                </div>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="equipment-item border-primary/30 bg-gradient-to-br from-card to-primary/5 p-8">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl hero-text">Après</CardTitle>
                <p className="text-muted-foreground">Mixé & masterisé par Global Drip Studio</p>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <audio
                  ref={afterRef}
                  src={currentGenre?.afterSrc}
                  onEnded={() => setPlayingAfter(false)}
                  onLoadStart={() => setPlayingAfter(false)}
                />
                <Button
                  onClick={handleAfterPlay}
                  size="lg"
                  className="w-full h-14 flex items-center justify-center gap-3 text-lg studio-button"
                >
                  {playingAfter ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  {playingAfter ? 'Pause' : 'Écouter le résultat'}
                </Button>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full bg-primary rounded-full transition-all duration-300 ${playingAfter ? 'animate-pulse' : ''}`}></div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Listening Recommendation */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Headphones className="w-4 h-4 mr-2" />
            Casque ou moniteurs recommandés pour une meilleure expérience
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Button size="lg" className="studio-button">
            <Mic className="w-5 h-5 mr-2" />
            Réserver une session de mixage
          </Button>
        </div>
        </div>
      </div>
    </section>
  );
};

export default AudioComparison;