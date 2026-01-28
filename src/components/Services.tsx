import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Euro, ArrowRight, Waves, Settings, Volume2, Mic, RefreshCw } from "lucide-react";
import mixingConsole from "@/assets/mixing-console.jpg";
import studioEquipment from "@/assets/studio-equipment.jpg";
import masteringSuite from "@/assets/mastering-suite.jpg";

const Services = () => {
  const [showExpress, setShowExpress] = useState(false);

  const mixageMasteringStandard = {
    id: "mixage-mastering",
    title: "Mixage + Mastering",
    description: "Service complet pour donner vie à vos créations musicales",
    price: "290",
    icon: Waves,
    image: "/lovable-uploads/5974c219-5112-499f-b5dd-3c09bc04df1a.png",
    featured: true,
    badgeText: "Spécialité",
    badgeColor: "bg-primary",
    features: [
      "Mixage professionnel multi-pistes",
      "Mastering hybride analogique/numérique", 
      "3 révisions incluses"
    ]
  };

  const mixageMasteringExpress = {
    id: "mixage-mastering-express",
    title: "Mixage + Mastering Express",
    description: "Solution professionnelle full numérique pour les artistes travaillant sur instrumentales en .wav",
    price: "120",
    icon: Waves,
    image: "/lovable-uploads/Image-10.jpg",
    featured: true,
    badgeText: "Budget",
    badgeColor: "bg-emerald-500",
    features: [
      "Mixage professionnel instru + multipistes voix",
      "Mastering",
      "2 révisions incluses"
    ]
  };

  const currentMixageService = showExpress ? mixageMasteringExpress : mixageMasteringStandard;

  const services = [
    currentMixageService,
    {
      id: "sound-design",
      title: "Sound Design",
      description: "Création sonore et design audio pour tous vos projets créatifs",
      price: "Sur devis",
      icon: Settings,
      image: "/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png",
      featured: true,
      badgeText: "Spécialité",
      badgeColor: "bg-primary",
      features: [
        "Sound design pour films et jeux",
        "Création d'ambiances sonores",
        "Effets sonores sur mesure",
        "Post-production audio avancée"
      ]
    },
    {
      id: "captation-sonore",
      title: "Captation Sonore",
      description: "Captation audio professionnelle en studio, ou pour évènements et tournages",
      price: "30€/h - 350€/j",
      icon: Mic,
      image: "/lovable-uploads/_edited.jpg.png",
      featured: false,
      badgeText: "",
      badgeColor: "",
      features: [
        "Enregistrement studio professionnel",
        "Captation événementielle mobile",
        "Équipement haute qualité",
        "Post-production incluse"
      ]
    },
    {
      id: "composition",
      title: "Composition / Beatmaking",
      description: "Création musicale et production de beats personnalisés",
      price: "A partir de 300€",
      icon: Volume2,
      image: "/lovable-uploads/64615fd6-368c-466a-a669-f5140677e476.png",
      featured: false,
      badgeText: "",
      badgeColor: "",
      features: [
        "Composition originale",
        "Production complète",
        "Arrangements personnalisés",
        "Composition Exclusive"
      ]
    },
    {
      id: "direction-artistique",
      title: "Direction Artistique / Arrangement",
      description: "Accompagnement artistique et arrangements musicaux sur mesure",
      price: "Sur devis",
      icon: Settings,
      image: "/lovable-uploads/35c8540d-ce59-433e-87fd-f1b8b1527941.png",
      featured: false,
      badgeText: "",
      badgeColor: "",
      features: [
        "Direction artistique complète",
        "Arrangements instrumentaux",
        "Conseils créatifs personnalisés",
        "Suivi de projet personnalisable"
      ]
    },
    {
      id: "formation",
      title: "Formation MAO / Mixage",
      description: "Formations personnalisées en production musicale et techniques de mixage",
      price: "39€/h",
      icon: Volume2,
      image: "/lovable-uploads/6ed6bc90-04bb-4040-9e0b-26b3c13bba5d.png",
      featured: false,
      badgeText: "",
      badgeColor: "",
      features: [
        "Cours particuliers ou en groupe",
        "Formation sur logiciels MAO",
        "Techniques de mixage avancées",
        "Support pédagogique inclus"
      ]
    }
  ];

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Nos <span className="hero-text">Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Des prestations professionnelles adaptées à tous vos besoins musicaux, 
            du mixage/mastering haute fidélité à la composition, en passant par la formation
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const isMixageCard = service.id === "mixage-mastering" || service.id === "mixage-mastering-express";
            
            return (
              <div 
                key={service.id}
                className="relative"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Switch Button - Outside card frame */}
                {isMixageCard && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowExpress(!showExpress);
                    }}
                    className="absolute -top-8 -left-8 z-40 w-12 h-12 bg-primary border-4 border-background rounded-full flex items-center justify-center hover:bg-primary/80 text-primary-foreground transition-all duration-300 shadow-xl hover:shadow-primary/50 hover:scale-110 group/switch"
                    title={showExpress ? "Voir version Standard" : "Voir version Express"}
                  >
                    <RefreshCw className="w-5 h-5 transition-transform duration-500 group-hover/switch:rotate-180" />
                  </button>
                )}
                
                {/* Card with 3D flip animation */}
                <div 
                  className={`relative [perspective:1000px]`}
                >
                  <div
                    className={`relative transition-all duration-700 [transform-style:preserve-3d] ${
                      isMixageCard ? (showExpress ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]') : ''
                    }`}
                  >
                    <div className={`${isMixageCard ? '[backface-visibility:hidden]' : ''}`}>
                  <Card 
                    className={`service-card group cursor-pointer relative overflow-hidden transition-all duration-500 min-h-[520px] flex flex-col ${
                      service.featured ? 'ring-2 ring-primary ring-opacity-50' : ''
                    } ${isMixageCard ? 'animate-fade-in' : ''}`}
                  >
                    {/* Service Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={service.image}
                        alt={service.title}
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                          service.id === 'captation-sonore' ? 'object-bottom' :
                          service.id === 'direction-artistique' ? 'object-bottom' :
                          isMixageCard ? 'object-top' :
                          ''
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                      <div className="absolute top-4 right-4">
                        <div className="w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <service.icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      {/* Featured Badge - Top left of image */}
                      {service.featured && service.badgeText && (
                        <div className={`absolute top-4 left-4 ${service.badgeColor || 'bg-primary'} text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                          {service.badgeText}
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{/\d/.test(service.price) ? (service.price.includes('€') ? service.price : `${service.price}€`) : service.price}</div>
                        </div>
                      </div>
                      <CardDescription className="text-muted-foreground">
                        {service.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      {/* Features List */}
                      <ul className="space-y-2 mb-6 flex-1">
                        {service.features.slice(0, 4).map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button 
                        className="w-full group-hover:studio-button transition-all duration-300"
                        variant="outline"
                        onClick={() => window.location.href = `/services#${service.id}`}
                      >
                        Plus d'infos
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>

                    {/* Glow Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
                  </Card>
                    </div>
                    
                    {/* Back face for flip animation */}
                    {isMixageCard && (
                      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <Card 
                          className={`service-card group cursor-pointer relative overflow-hidden min-h-[520px] flex flex-col transition-all duration-500 ring-2 ring-primary ring-opacity-50`}
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={showExpress ? mixageMasteringExpress.image : mixageMasteringStandard.image}
                              alt={showExpress ? mixageMasteringExpress.title : mixageMasteringStandard.title}
                              className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                            <div className="absolute top-4 right-4">
                              <div className="w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Waves className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                            <div className={`absolute top-4 left-4 ${showExpress ? mixageMasteringExpress.badgeColor : mixageMasteringStandard.badgeColor} text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                              {showExpress ? mixageMasteringExpress.badgeText : mixageMasteringStandard.badgeText}
                            </div>
                          </div>

                          <CardHeader className="pb-4">
                            <div className="flex justify-between items-start mb-2">
                              <CardTitle className="text-xl font-bold">{showExpress ? mixageMasteringExpress.title : mixageMasteringStandard.title}</CardTitle>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{showExpress ? mixageMasteringExpress.price : mixageMasteringStandard.price}€</div>
                              </div>
                            </div>
                            <CardDescription className="text-muted-foreground">
                              {showExpress ? mixageMasteringExpress.description : mixageMasteringStandard.description}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="flex-1 flex flex-col">
                            <ul className="space-y-2 mb-6 flex-1">
                              {(showExpress ? mixageMasteringExpress.features : mixageMasteringStandard.features).slice(0, 4).map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-center text-sm">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>

                            <Button 
                              className="w-full group-hover:studio-button transition-all duration-300"
                              variant="outline"
                              onClick={() => window.location.href = `/services#${showExpress ? mixageMasteringExpress.id : mixageMasteringStandard.id}`}
                            >
                              Plus d'infos
                              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </CardContent>

                          <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-8 rounded-2xl bg-gradient-hero border border-border">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Projet sur mesure ?</h3>
              <p className="text-muted-foreground mb-4">Contactez-nous pour un devis personnalisé</p>
              <Button size="lg" className="studio-button">
                Demander un devis gratuit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;