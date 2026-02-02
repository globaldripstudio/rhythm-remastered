import { Button } from "@/components/ui/button";
import { Play, Headphones, Mic } from "lucide-react";
import { useState, useEffect } from "react";
import studioHero from "@/assets/studio-hero.jpg";
import logoOrange from "@/assets/logo-orange.png";

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setTimeout(() => setShowContent(true), 300);
    };
    img.src = "/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png";
  }, []);

  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Loading Screen */}
      {!imageLoaded && (
        <div className="absolute inset-0 z-50 bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-8">
              {/* Complex loading animation */}
              <div className="relative w-32 h-32">
                {/* Outer ring */}
                <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                {/* Rotating elements */}
                <div className="absolute inset-0 border-4 border-primary border-t-transparent border-r-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-secondary border-b-transparent border-l-transparent rounded-full animate-spin animate-reverse" style={{ animationDuration: '1.5s' }}></div>
                <div className="absolute inset-4 border-4 border-primary/60 border-r-transparent border-t-transparent rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                {/* Center pulsing circle */}
                <div className="absolute inset-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
                {/* Sound waves */}
                <div className="absolute inset-6 border-2 border-primary/30 rounded-full animate-ping"></div>
                <div className="absolute inset-4 border-2 border-secondary/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.8s' }}></div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
                GLOBAL DRIP STUDIO
              </h3>
              <p className="text-muted-foreground animate-pulse">Initialisation du studio...</p>
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background Image */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <img 
          src="/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png"
          alt="Global Drip Studio - Professional Recording Studio"
          className="w-full h-full object-cover object-center opacity-40"
          style={{ aspectRatio: '16/9' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background/90" />
      </div>

      {/* Content */}
      <div className={`relative z-10 container mx-auto px-6 text-center transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="animate-fade-in">
          {/* Welcome Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border mb-6">
            <Headphones className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm text-muted-foreground">Bienvenue au Studio</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="hero-text">GLOBAL DRIP</span>
            <br />
            <span className="text-foreground">STUDIO</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Magnifiez votre musique à nos côtés. Enregistrement, mixage, mastering et sound design professionnel
          </p>

          {/* Stats */}
          <div className="flex flex-row justify-center items-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">200+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Projets réalisés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-secondary">10+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Années d'expérience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">50+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Artistes accompagnés</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-10 md:mb-12 px-4">
            <Button size="lg" className="studio-button text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Réserver une session
            </Button>
            <a href="/projets" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-border hover:bg-muted w-full">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Écouter nos réalisations
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-muted-foreground px-2">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mr-1.5 sm:mr-2 animate-glow-pulse" />
              Expertise depuis 2019
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-secondary rounded-full mr-1.5 sm:mr-2" />
              Équipement haut de gamme
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mr-1.5 sm:mr-2" />
              Ingénieur certifié
            </div>
          </div>

          {/* Orange Logo */}
          <div className="mt-24 sm:mt-32 mb-2 flex justify-center">
            <img 
              src={logoOrange} 
              alt="Global Drip Studio Logo" 
              className="w-auto h-12 sm:h-16 md:h-20 opacity-40 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-muted-foreground rounded-full flex justify-center">
          <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-muted-foreground rounded-full mt-1.5 sm:mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;