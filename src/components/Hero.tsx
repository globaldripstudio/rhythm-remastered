import { Button } from "@/components/ui/button";
import { Play, Headphones, Mic } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import studioHero from "@/assets/studio-hero.jpg";
import logoOrange from "@/assets/logo-orange.png";

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setTimeout(() => setShowContent(true), 300);
    };
    img.src = "/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png";
  }, []);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY * 0.4);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={heroRef} id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden">
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

      {/* Background Image with Parallax */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <img 
          src="/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png"
          alt="Global Drip Studio - Professional Recording Studio"
          className="w-full h-[120%] object-cover object-center opacity-40 will-change-transform"
          style={{ 
            transform: `translateY(${scrollY}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background/90" />
      </div>

      {/* Content */}
      <div className={`relative z-10 container mx-auto px-6 text-center transition-all duration-1000 flex flex-col justify-center min-h-screen ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="animate-fade-in flex flex-col items-center justify-center flex-1 pb-32">
          {/* Welcome Badge with Glassmorphism */}
          <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-card/40 backdrop-blur-md border border-primary/20 mb-6 shadow-lg shadow-primary/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse opacity-50" />
            <Headphones className="w-4 h-4 mr-2 text-primary relative z-10" />
            <span className="text-sm text-muted-foreground relative z-10">Bienvenue au Studio</span>
          </div>

          {/* BLOC 1: Title + Subtitle - Importance: Maximale */}
          <div className="mb-10 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-3 leading-tight">
              <span className="hero-text">GLOBAL DRIP</span>
              <br />
              <span className="text-foreground">STUDIO</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Magnifiez votre musique à nos côtés. Enregistrement, mixage, mastering et sound design professionnel
            </p>
          </div>

          {/* BLOC 2: Stats - Importance: Moyenne (crédibilité) */}
          <div className="flex flex-row justify-center items-center gap-6 sm:gap-8 md:gap-12 mb-10 sm:mb-12">
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

          {/* BLOC 3: CTA + Trust Indicators - Importance: Haute (conversion) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Button size="lg" className="studio-button text-base sm:text-lg px-7 sm:px-9 py-[1.35rem] sm:py-[1.6rem] w-full sm:w-auto" onClick={() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  const yOffset = 100;
                  const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
                setTimeout(() => window.dispatchEvent(new CustomEvent('highlight-phone')), 800);
              }}>
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Réserver une session
              </Button>
              <a href="/projets" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="text-base sm:text-lg px-7 sm:px-9 py-[1.35rem] sm:py-[1.6rem] border-border hover:bg-muted w-full">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Écouter nos réalisations
                </Button>
              </a>
            </div>
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
          </div>
        </div>
      </div>

      {/* Orange Logo with Animated Gradient - Fixed at bottom */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex justify-center">
        <div 
          className="h-24 sm:h-32 md:h-40 w-24 sm:w-32 md:w-40 opacity-40 animate-[gradient-shift_3s_ease-in-out_infinite]"
          style={{
            background: 'linear-gradient(135deg, hsl(18 100% 60%), hsl(180 35% 35%))',
            backgroundSize: '200% 200%',
            WebkitMaskImage: `url(${logoOrange})`,
            maskImage: `url(${logoOrange})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center'
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