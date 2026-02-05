import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Clock, Euro, Check, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: React.ElementType;
  image: string;
  featured: boolean;
  category: string;
  duration: string;
  included: string[];
  process: string;
  details: string;
  equipment: string[];
  deliverables: string[];
}

interface ServiceModalProps {
  service: Service | null;
  open: boolean;
  onClose: () => void;
}

// Styled close button component - orange bubble style
const CloseButton = ({ onClick, className = "" }: { onClick: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`absolute z-50 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-primary border-4 border-background rounded-full flex items-center justify-center hover:bg-primary/80 text-primary-foreground transition-all duration-300 shadow-xl hover:shadow-primary/50 hover:scale-110 group/close ${className}`}
    aria-label="Fermer"
  >
    <X className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover/close:rotate-90" />
  </button>
);

const ServiceModalContent = ({ service, onClose, isMobile = false }: { service: Service; onClose: () => void; isMobile?: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    // Show indicator if there's more content to scroll (not at bottom)
    const hasMoreContent = el.scrollHeight > el.clientHeight;
    const notAtBottom = el.scrollTop + el.clientHeight < el.scrollHeight - 20;
    setShowScrollIndicator(hasMoreContent && notAtBottom);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Check on mount
    const timer = setTimeout(checkScroll, 100);
    
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  return (
    <div className={`flex flex-col ${isMobile ? 'h-[calc(80vh-3rem)]' : 'h-[85vh] md:h-[80vh]'}`}>
      {/* Header Image */}
      <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden rounded-t-lg flex-shrink-0">
        <img 
          src={service.image}
          alt={service.title}
          className={`w-full h-full object-cover ${
            service.id === 'composition' ? 'object-center' :
            service.id === 'captation-sonore' ? 'object-[center_25%]' :  
            service.id === 'direction-artistique' ? 'object-bottom' :
            service.id === 'mixage-mastering' ? 'object-top' :
            service.id === 'mixage-mastering-express' ? 'object-center' :
            ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 md:bottom-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">{service.category}</Badge>
            {service.featured && <Badge className="bg-primary text-xs">Spécialité</Badge>}
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{service.title}</h2>
          <div className="flex items-center gap-3 sm:gap-4 text-white/80 text-xs sm:text-sm mt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              {service.duration}
            </div>
            <div className="flex items-center gap-1">
              <Euro className="w-3 h-3 sm:w-4 sm:h-4" />
              {service.price}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content with scroll indicator */}
      <div className="relative flex-1 min-h-0">
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto px-4 sm:px-6 pb-6 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent hover:scrollbar-thumb-primary/70"
        >
          <div className="space-y-4 sm:space-y-6 pt-4 pb-8">
          {/* Description */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Description</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-2">{service.description}</p>
            <p className="text-sm sm:text-base">{service.details}</p>
          </div>

          {/* Process */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Processus</h3>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              {service.process.split(' → ').map((step, index, array) => (
                <div key={index} className="flex items-center gap-1.5 sm:gap-2">
                  <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary/10 rounded-full whitespace-nowrap">{step}</span>
                  {index < array.length - 1 && <span>→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Included & Deliverables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-card/50">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base">Inclus</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <ul className="space-y-1.5 sm:space-y-2">
                  {service.included.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base">Livrables</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <ul className="space-y-1.5 sm:space-y-2">
                  {service.deliverables.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Equipment */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Équipement</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {service.equipment.map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs sm:text-sm">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sound Design Videos */}
          {service.id === "sound-design" && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Nos réalisations</h3>
              <div className="space-y-4">
                {[
                  { title: "THE HOLY LAND - Tomas Lemoine", desc: "Collaboration with Commencal - Post-production/sound design/global mixing", url: "https://www.youtube.com/embed/u44cDLJWeFc" },
                  { title: "To the next chapter - Tomas Lemoine", desc: "Collaboration with Canyon Bicycles - Chef opérateur son et post-prod", url: "https://www.youtube.com/embed/A7s0pP0D3Po" },
                  { title: "Théo Bachelier", desc: "Post production/sound design/global mixing", url: "https://www.youtube.com/embed/M-eW6rpRklU" },
                  { title: "Théo Pulsor", desc: "Young and successful entrepreneur (220k+ views) - Post production/sound design", url: "https://www.youtube.com/embed/kFEacVd-iMs" },
                  { title: "The Silver Coast - Type 7 Film", desc: "Collaboration with Type7 - Post-production/sound design/global mixing", url: "https://www.youtube.com/embed/W-GAqmI96ro" }
                ].map((video, index) => (
                  <div key={index}>
                    <h4 className="font-semibold text-sm mb-1">{video.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{video.desc}</p>
                    <div className="bg-card rounded-lg p-2 border border-border/50">
                      <iframe 
                        width="100%" 
                        height="150"
                        src={video.url}
                        title={video.title}
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Beatmaking/Composition Spotify Player */}
          {service.id === "composition" && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Nos productions</h3>
              <div className="bg-card rounded-lg p-2 border border-border/50">
                <iframe 
                  style={{ borderRadius: '12px' }}
                  src="https://open.spotify.com/embed/playlist/3zjaPFIW17OKA0XGhr2TQn?utm_source=generator" 
                  width="100%" 
                  height="352" 
                  frameBorder="0" 
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* CTA */}
          <Card className="bg-gradient-hero border-primary/20">
            <CardContent className="p-4 sm:pt-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">{service.price}</div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Prix {service.price.includes('devis') ? 'sur demande' : 'tout inclus'}
                </p>
                <Button 
                  className="w-full studio-button"
                  onClick={() => {
                    onClose();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Demander un devis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
        
        {/* Scroll indicator - fade at bottom when more content */}
        {showScrollIndicator && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent flex items-end justify-center pb-2"
            aria-hidden="true"
          >
            <div className="flex flex-col items-center animate-bounce">
              <div className="w-6 h-6 border-2 border-primary/60 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ServiceModal = ({ service, open, onClose }: ServiceModalProps) => {
  const isMobile = useIsMobile();

  if (!service) return null;

  // Mobile: use Drawer (bottom sheet)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()} dismissible={true}>
        <DrawerContent className="max-h-[80vh] animate-in slide-in-from-bottom duration-300 overflow-visible">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{service.title}</DrawerTitle>
            <DrawerDescription>{service.description}</DrawerDescription>
          </DrawerHeader>
          {/* Orange bubble close button - out of the box style */}
          <CloseButton onClick={onClose} className="absolute -top-5 right-4 sm:-top-6 sm:right-6 z-[60]" />
          <ServiceModalContent service={service} onClose={onClose} isMobile={true} />
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: use Dialog (modal) with custom animations
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-3xl w-[90vw] max-h-[90vh] p-0 overflow-visible rounded-lg !flex !flex-col !gap-0 [&>button]:hidden"
      >
        <div className="relative">
          {/* Orange bubble close button - positioned outside and above modal */}
          <CloseButton onClick={onClose} className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 md:-top-6 md:-right-6 z-[60]" />
          <DialogHeader className="sr-only">
            <DialogTitle>{service.title}</DialogTitle>
            <DialogDescription>{service.description}</DialogDescription>
          </DialogHeader>
          <ServiceModalContent service={service} onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceModal;
