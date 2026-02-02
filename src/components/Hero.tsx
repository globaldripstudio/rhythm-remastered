import { Button } from "@/components/ui/button";
import { Play, Headphones, Mic } from "lucide-react";
import { useState, useEffect } from "react";

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
        <div className="animate-fade-in flex flex-col items-center justify-center min-h-[80vh]">
          
          {/* Welcome Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border mb-8">
            <Headphones className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm text-muted-foreground">Bienvenue au Studio</span>
          </div>

          {/* Block 1: Title + Subtitle */}
          <div className="mb-16">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-3 leading-tight">
              <span className="hero-text">GLOBAL DRIP</span>
              <br />
              <span className="text-foreground">STUDIO</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Magnifiez votre musique avec notre expertise en enregistrement, mixage et mastering professionnel
            </p>
          </div>

          {/* Block 2: Stats */}
          <div className="flex justify-center items-center gap-8 sm:gap-12 md:gap-16 mb-16">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">200+</div>
              <div className="text-sm text-muted-foreground">Projets réalisés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-secondary">10+</div>
              <div className="text-sm text-muted-foreground">Années d'expérience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Artistes accompagnés</div>
            </div>
          </div>

          {/* Block 3: CTAs + Trust Indicators */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <Button size="lg" className="studio-button text-lg px-8 py-6" onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                const yOffset = 100;
                const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
              setTimeout(() => window.dispatchEvent(new CustomEvent('highlight-phone')), 800);
            }}>
              <Mic className="w-5 h-5 mr-2" />
              Réserver une session
            </Button>
            <a href="/projets">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-border hover:bg-muted">
                <Play className="w-5 h-5 mr-2" />
                Écouter nos réalisations
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
              Expertise depuis 2019
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

      {/* Animated Logo */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <img 
          src="/lovable-uploads/logo-blanc-sans-fond.png"
          alt="Global Drip Studio Logo"
          className="h-24 sm:h-32 md:h-40 w-auto opacity-40 animate-pulse"
          style={{
            maskImage: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
            WebkitMaskImage: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
          }}
        />
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center p-1 opacity-40">
          <div className="w-1.5 h-3 bg-gradient-to-b from-primary to-secondary rounded-full animate-bounce" />
        </div>
      </div>

    </section>
  );
};

export default Hero;