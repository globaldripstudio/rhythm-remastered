import { Button } from "@/components/ui/button";
import { Play, Headphones, Mic } from "lucide-react";
import studioHero from "@/assets/studio-hero.jpg";

const Hero = () => {
  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png"
          alt="Global Drip Studio - Professional Recording Studio"
          className="w-full h-full object-cover object-center opacity-40"
          style={{ aspectRatio: '16/9' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="animate-fade-in">
          {/* Welcome Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border mb-6">
            <Headphones className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm text-muted-foreground">Bienvenue au Studio</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="hero-text">GLOBAL DRIP</span>
            <br />
            <span className="text-foreground">STUDIO</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Magnifiez votre musique à nos côtés. Enregistrement, mixage, mastering et sound design professionnel
          </p>

          {/* Stats */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">200+</div>
              <div className="text-sm text-muted-foreground">Projets réalisés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">10+</div>
              <div className="text-sm text-muted-foreground">Années d'expérience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Support client</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="studio-button text-lg px-8 py-6">
              <Mic className="w-5 h-5 mr-2" />
              Réserver une session
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-border hover:bg-muted">
              <Play className="w-5 h-5 mr-2" />
              Écouter nos réalisations
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-glow-pulse" />
              Expertise reconnue depuis 2014
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-secondary rounded-full mr-2" />
              Équipement haut de gamme
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2" />
              Ingénieur certifié
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;