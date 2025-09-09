import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

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
      beforeSrc: '/audio/hiphop-before.mp3',
      afterSrc: '/audio/hiphop-after.mp3'
    },
    { 
      key: 'rock', 
      title: 'Rock',
      description: 'Puissance et dynamique pour le rock',
      beforeSrc: '/audio/rock-before.mp3',
      afterSrc: '/audio/rock-after.mp3'
    },
    { 
      key: 'edm', 
      title: 'EDM',
      description: 'Impact et largeur pour l\'électronique',
      beforeSrc: '/audio/edm-before.mp3',
      afterSrc: '/audio/edm-after.mp3'
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">{currentGenre?.title}</h3>
            <p className="text-muted-foreground">{currentGenre?.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before */}
            <Card className="equipment-item">
              <CardHeader className="text-center">
                <CardTitle className="text-lg text-muted-foreground">Avant</CardTitle>
                <p className="text-sm text-muted-foreground">Version originale</p>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
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
                  className="w-full flex items-center justify-center gap-2"
                >
                  {playingBefore ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {playingBefore ? 'Pause' : 'Écouter'}
                </Button>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div className="h-full bg-muted-foreground/30 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="equipment-item border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-lg hero-text">Après</CardTitle>
                <p className="text-sm text-muted-foreground">Mixé & masterisé par Global Drip</p>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <audio
                  ref={afterRef}
                  src={currentGenre?.afterSrc}
                  onEnded={() => setPlayingAfter(false)}
                  onLoadStart={() => setPlayingAfter(false)}
                />
                <Button
                  onClick={handleAfterPlay}
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                >
                  {playingAfter ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {playingAfter ? 'Pause' : 'Écouter'}
                </Button>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div className="h-full bg-primary rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Casque ou moniteurs recommandés pour une meilleure expérience
            </p>
            <Button size="lg" className="cta-button">
              Réserver une Session
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudioComparison;