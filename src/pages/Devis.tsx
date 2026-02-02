import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calculator, Music, Mic2, Headphones, Sparkles, GraduationCap, Film, Send } from "lucide-react";
import { Link } from "react-router-dom";

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: React.ReactNode;
  category: string;
  perTrack?: boolean;
}

const services: ServiceOption[] = [
  {
    id: "mixage-mastering",
    name: "Mixage + Mastering",
    description: "Service complet pour sublimer vos productions",
    basePrice: 290,
    icon: <Headphones className="w-5 h-5" />,
    category: "Production",
    perTrack: true,
  },
  {
    id: "mixage-mastering-express",
    name: "Mixage + Mastering Express",
    description: "Workflow 100% digital, livraison rapide",
    basePrice: 120,
    icon: <Sparkles className="w-5 h-5" />,
    category: "Production",
    perTrack: true,
  },
  {
    id: "sound-design",
    name: "Sound Design",
    description: "Création sonore sur mesure pour vos projets",
    basePrice: 150,
    icon: <Music className="w-5 h-5" />,
    category: "Création",
  },
  {
    id: "captation-studio",
    name: "Captation Sonore (Studio)",
    description: "Enregistrement professionnel en studio",
    basePrice: 80,
    icon: <Mic2 className="w-5 h-5" />,
    category: "Enregistrement",
  },
  {
    id: "captation-event",
    name: "Captation Sonore (Événement)",
    description: "Captation live et événementielle",
    basePrice: 350,
    icon: <Film className="w-5 h-5" />,
    category: "Enregistrement",
  },
  {
    id: "composition",
    name: "Composition / Beatmaking",
    description: "Création musicale originale",
    basePrice: 200,
    icon: <Music className="w-5 h-5" />,
    category: "Création",
  },
  {
    id: "direction-artistique",
    name: "Direction Artistique",
    description: "Accompagnement et conseil créatif",
    basePrice: 100,
    icon: <Sparkles className="w-5 h-5" />,
    category: "Conseil",
  },
  {
    id: "formation",
    name: "Formation MAO/Mixage",
    description: "Cours personnalisés (tarif horaire)",
    basePrice: 50,
    icon: <GraduationCap className="w-5 h-5" />,
    category: "Formation",
  },
];

const Devis = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [trackCount, setTrackCount] = useState(1);
  const [formationHours, setFormationHours] = useState(1);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const totalEstimate = useMemo(() => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      if (!service) return total;
      
      if (service.perTrack) {
        return total + (service.basePrice * trackCount);
      }
      if (service.id === "formation") {
        return total + (service.basePrice * formationHours);
      }
      return total + service.basePrice;
    }, 0);
  }, [selectedServices, trackCount, formationHours]);

  const hasTrackBasedService = selectedServices.some(id => 
    services.find(s => s.id === id)?.perTrack
  );

  const hasFormation = selectedServices.includes("formation");

  const categories = [...new Set(services.map(s => s.category))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au site</span>
          </Link>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <span className="font-semibold">Simulateur de Devis</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              Version Test
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="hero-text">Estimez votre projet</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sélectionnez les services dont vous avez besoin pour obtenir une estimation instantanée. 
              Ce simulateur vous donne une idée du budget, le devis final sera adapté à votre projet.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Services Selection */}
            <div className="lg:col-span-2 space-y-8">
              {categories.map(category => (
                <div key={category}>
                  <h2 className="text-lg font-semibold mb-4 text-muted-foreground">{category}</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {services.filter(s => s.category === category).map(service => (
                      <Card 
                        key={service.id}
                        className={`cursor-pointer transition-all duration-300 hover:border-primary/50 ${
                          selectedServices.includes(service.id) 
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                            : 'border-border'
                        }`}
                        onClick={() => toggleService(service.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              checked={selectedServices.includes(service.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-primary">{service.icon}</span>
                                <span className="font-medium">{service.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {service.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {service.basePrice}€
                                  {service.perTrack && " / titre"}
                                  {service.id === "formation" && " / heure"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

              {/* Track Count Slider */}
              {hasTrackBasedService && (
                <Card className="border-secondary/50 bg-secondary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Music className="w-4 h-4 text-secondary" />
                      Nombre de titres
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Slider
                        value={[trackCount]}
                        onValueChange={(value) => setTrackCount(value[0])}
                        min={1}
                        max={12}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>1 titre</span>
                        <span className="font-semibold text-foreground">{trackCount} titre{trackCount > 1 ? 's' : ''}</span>
                        <span>12 titres</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Formation Hours Slider */}
              {hasFormation && (
                <Card className="border-secondary/50 bg-secondary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-secondary" />
                      Heures de formation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Slider
                        value={[formationHours]}
                        onValueChange={(value) => setFormationHours(value[0])}
                        min={1}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>1 heure</span>
                        <span className="font-semibold text-foreground">{formationHours} heure{formationHours > 1 ? 's' : ''}</span>
                        <span>20 heures</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Summary Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-primary/30 bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Récapitulatif
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedServices.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      Sélectionnez des services pour voir l'estimation
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {selectedServices.map(serviceId => {
                          const service = services.find(s => s.id === serviceId);
                          if (!service) return null;
                          
                          let price = service.basePrice;
                          let quantity = "";
                          
                          if (service.perTrack) {
                            price = service.basePrice * trackCount;
                            quantity = ` × ${trackCount}`;
                          }
                          if (service.id === "formation") {
                            price = service.basePrice * formationHours;
                            quantity = ` × ${formationHours}h`;
                          }
                          
                          return (
                            <div key={serviceId} className="flex justify-between items-start text-sm">
                              <div className="flex-1">
                                <span>{service.name}</span>
                                {quantity && (
                                  <span className="text-muted-foreground">{quantity}</span>
                                )}
                              </div>
                              <span className="font-medium">{price}€</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Estimation totale</span>
                        <span className="text-2xl font-bold text-primary">{totalEstimate}€</span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        * Prix indicatifs. Le devis final sera établi après étude de votre projet.
                      </p>
                      
                      <Button className="w-full studio-button" size="lg">
                        <Send className="w-4 h-4 mr-2" />
                        Demander un devis personnalisé
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Devis;
