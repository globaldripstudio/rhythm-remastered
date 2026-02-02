import { Button } from "@/components/ui/button";
import { Play, Headphones, Mic, Star, Shield, Clock, CheckCircle2 } from "lucide-react";
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
      <div className={`relative z-10 container mx-auto px-6 text-center transition-all duration-1000 flex flex-col justify-center min-h-screen ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="animate-fade-in flex flex-col items-center justify-center flex-1 pb-32">
          
          {/* PATTERN INTERRUPT - Urgency Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/30 mb-4 animate-pulse">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm text-primary font-medium">2 créneaux disponibles cette semaine</span>
          </div>

          {/* BLOC 1: ATTENTION + INTEREST - Pain Point → Solution */}
          <div className="mb-8 sm:mb-10">
            {/* Pre-headline - Pattern interrupt */}
            <p className="text-xs sm:text-sm uppercase tracking-widest text-muted-foreground mb-3">
              Pour artistes exigeants uniquement
            </p>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-3 leading-tight">
              <span className="hero-text">GLOBAL DRIP</span>
              <br />
              <span className="text-foreground">STUDIO</span>
            </h1>
            
            {/* Value Proposition - Benefit-focused */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2 mb-4">
              Transformez votre musique en <span className="text-primary font-semibold">hit professionnel</span> grâce à notre expertise en enregistrement, mixage et mastering
            </p>

            {/* Micro-benefits list */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-primary" />
                Son broadcast-ready
              </div>
              <div className="flex items-center text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-primary" />
                Livraison 48-72h
              </div>
              <div className="flex items-center text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-primary" />
                Révisions illimitées
              </div>
            </div>
          </div>

          {/* BLOC 2: SOCIAL PROOF - Authority + Trust */}
          <div className="mb-8 sm:mb-10">
            {/* Stats with emotional anchoring */}
            <div className="flex flex-row justify-center items-center gap-6 sm:gap-8 md:gap-12 mb-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">200+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Projets livrés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-secondary">10 ans</div>
                <div className="text-xs sm:text-sm text-muted-foreground">D'expertise</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">98%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Clients satisfaits</div>
              </div>
            </div>

            {/* Trust badges - Authority signals */}
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-muted-foreground/70">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/50">
                <Shield className="w-3.5 h-3.5 text-secondary" />
                Ingénieur certifié
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/50">
                <Star className="w-3.5 h-3.5 text-primary" />
                5★ sur 50+ avis
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/50">
                <Headphones className="w-3.5 h-3.5 text-secondary" />
                Équipement premium
              </div>
            </div>
          </div>

          {/* BLOC 3: DESIRE + ACTION - CTA with risk reversal */}
          <div className="space-y-4">
            {/* Primary CTA - High contrast, action-oriented */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Button size="lg" className="studio-button text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto group" onClick={() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  const yOffset = 100;
                  const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
                setTimeout(() => window.dispatchEvent(new CustomEvent('highlight-phone')), 800);
              }}>
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-pulse" />
                Réserver ma session gratuite
              </Button>
              
              {/* Secondary CTA - Lower commitment */}
              <a href="/projets" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-border hover:bg-muted w-full">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Écouter avant/après
                </Button>
              </a>
            </div>

            {/* Risk reversal + Micro-commitment */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground/70">
                ✓ Appel découverte offert • ✓ Devis sous 24h • ✓ Sans engagement
              </p>
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