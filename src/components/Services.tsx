import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Waves, Settings, Volume2, Mic, RefreshCw, Music, BookOpen } from "lucide-react";
import ServiceModal from "@/components/ServiceModal";

// Service data for both cards and modals
const servicesData = [
  {
    id: "mixage-mastering",
    title: "Mixage + Mastering",
    description: "Service complet pour donner vie à vos créations musicales",
    price: "290€",
    icon: Music,
    image: "/lovable-uploads/5974c219-5112-499f-b5dd-3c09bc04df1a.png",
    featured: true,
    badgeText: "Spécialité",
    badgeColor: "bg-primary",
    category: "Production",
    duration: "3-5 jours",
    included: [
      "Mixage professionnel multi-pistes",
      "Mastering hybride analogique/numérique",
      "3 révisions incluses",
      "Livraison formats HD (WAV, MP3)"
    ],
    process: "Analyse → Mixage → Mastering → Révisions → Livraison finale",
    details: "Notre service phare combine mixage professionnel et mastering de haute qualité. Nous utilisons une approche hybride combinant le meilleur de l'analogique et du numérique pour sublimer vos productions.",
    equipment: ["Dangerous Music 2Bus+", "Apollo Quad Converters", "EQP-KTs & EQP-2A3SS", "Moniteurs Adam A77x & RP6 Rokit G3"],
    deliverables: ["Fichier master WAV 24bit/96kHz", "Version MP3 320kbps", "Version streaming optimisée"]
  },
  {
    id: "mixage-mastering-express",
    title: "Mixage + Mastering Express",
    description: "Solution professionnelle full numérique pour les artistes travaillant sur instrumentales en .wav",
    price: "120€",
    icon: Music,
    image: "/lovable-uploads/Image-10.jpg",
    featured: true,
    badgeText: "Budget",
    badgeColor: "bg-emerald-500",
    category: "Production",
    duration: "4 heures",
    included: [
      "Mixage professionnel instru + multipistes voix",
      "Mastering full numérique",
      "2 révisions incluses",
      "Livraison formats HD (WAV, MP3)"
    ],
    process: "Analyse → Mixage → Mastering → Révisions → Livraison finale",
    details: "Notre service express s'adresse principalement aux artistes travaillant sur des instrumentales. Offrez vous le luxe d'un mixage et mastering professionnel tout numérique à coût réduit.",
    equipment: ["Apollo Quad Converters", "Plugins professionnels", "Monitoring Adam A77x"],
    deliverables: ["Fichier master WAV 24bit/96kHz", "Version MP3 320kbps"]
  },
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
    category: "Création",
    duration: "Variable",
    included: [
      "Sound design pour films et jeux",
      "Création d'ambiances sonores",
      "Effets sonores sur mesure",
      "Post-production audio avancée"
    ],
    process: "Brief créatif → Recherche sonore → Création → Synchronisation → Finalisation",
    details: "Spécialisé dans la création d'univers sonores uniques, nous donnons vie à vos projets audiovisuels avec des sons originaux et des ambiances immersives.",
    equipment: ["Banques de sons premium", "Synthétiseurs modulaires", "Microphones de terrain", "Logiciels spécialisés"],
    deliverables: ["Effets sonores isolés", "Stems multitracks", "Mix final synchronisé"]
  },
  {
    id: "captation-sonore",
    title: "Captation Sonore",
    description: "Captation audio professionnelle en studio, ou pour évènements et tournages",
    price: "30€/h - 350€/j",
    icon: Mic,
    image: "/lovable-uploads/92466e48-6f78-46d4-bb9b-2bc8c6a50017.png",
    featured: false,
    badgeText: "",
    badgeColor: "",
    category: "Enregistrement",
    duration: "À la demande",
    included: [
      "Enregistrement studio professionnel",
      "Captation événementielle mobile",
      "Équipement haute qualité",
      "Post-production incluse"
    ],
    process: "Préparation → Installation → Captation → Monitoring → Post-production",
    details: "Service complet d'enregistrement en studio ou en extérieur. Nous nous adaptons à tous vos besoins avec un équipement mobile de qualité professionnelle.",
    equipment: ["ProTools Ultimate", "Microphones Griffon", "Préamplis Neve et Unison", "Monitoring professionnel"],
    deliverables: ["Pistes brutes multitrack", "Écoutes de travail", "Fichiers synchronisés"]
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
    category: "Création",
    duration: "1-3 semaines",
    included: [
      "Composition originale",
      "Production complète",
      "Arrangements personnalisés",
      "Composition Exclusive"
    ],
    process: "Brief artistique → Création → Arrangements → Production → Finalisation",
    details: "De l'idée à la réalisation complète, nous créons des compositions originales adaptées à votre style et vos besoins artistiques.",
    equipment: ["FL Studio", "VSTs", "Banques de sons Splice", "Instruments réels"],
    deliverables: ["Composition complète", "Version concert (PBO)", "Multistems négociable"]
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
    category: "Conseil",
    duration: "Variable",
    included: [
      "Direction artistique complète",
      "Arrangements instrumentaux",
      "Conseils créatifs personnalisés",
      "Suivi de projet personnalisable"
    ],
    process: "Analyse artistique → Conseil stratégique → Arrangements → Suivi → Optimisation",
    details: "Accompagnement complet de votre projet artistique, de la conception à la réalisation, avec une expertise technique et créative.",
    equipment: ["Direction artistique stratégique", "Réseau de musiciens et ingénieurs", "Références & benchmarks professionnels", "Méthodologies de production"],
    deliverables: ["Plan artistique détaillé", "Arrangements finalisés", "Rapport de suivi"]
  },
  {
    id: "formation",
    title: "Formation MAO / Mixage",
    description: "Formations personnalisées en production musicale et techniques de mixage",
    price: "39€/h",
    icon: Music,
    image: "/lovable-uploads/6ed6bc90-04bb-4040-9e0b-26b3c13bba5d.png",
    featured: false,
    badgeText: "",
    badgeColor: "",
    category: "Formation",
    duration: "Flexible",
    included: [
      "Cours particuliers ou en groupe",
      "Formation sur logiciels MAO",
      "Techniques de mixage avancées",
      "Support pédagogique inclus"
    ],
    process: "Évaluation niveau → Programme personnalisé → Formation pratique → Suivi progression",
    details: "Formation complète aux techniques de production musicale moderne. Apprenez les secrets du mixage et du mastering avec un professionnel expérimenté.",
    equipment: ["Stations de travail dédiées", "Logiciels professionnels", "Supports de cours", "Exercices pratiques"],
    deliverables: ["Support de formation", "Projets d'exercice", "Certificat de formation"]
  }
];

const Services = () => {
  const [showExpress, setShowExpress] = useState(false);
  const [selectedService, setSelectedService] = useState<typeof servicesData[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Get display services (swap mixage-mastering based on toggle)
  const getDisplayServices = () => {
    const mixageStandard = servicesData.find(s => s.id === "mixage-mastering")!;
    const mixageExpress = servicesData.find(s => s.id === "mixage-mastering-express")!;
    const otherServices = servicesData.filter(s => !s.id.startsWith("mixage-mastering"));
    
    const currentMixage = showExpress ? mixageExpress : mixageStandard;
    return [currentMixage, ...otherServices];
  };

  const displayServices = getDisplayServices();

  const handleOpenModal = (service: typeof servicesData[0]) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedService(null);
  };

  return (
    <section id="services" className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Nos <span className="hero-text">Services</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Des prestations professionnelles adaptées à tous vos besoins musicaux, 
            du mixage/mastering haute fidélité à la composition, en passant par la formation
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12 md:mb-16">
          {displayServices.map((service, index) => {
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
                    className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 md:-top-8 md:-left-8 z-40 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-primary border-4 border-background rounded-full flex items-center justify-center hover:bg-primary/80 text-primary-foreground transition-all duration-300 shadow-xl hover:shadow-primary/50 hover:scale-110 group/switch"
                    title={showExpress ? "Voir version Standard" : "Voir version Express"}
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 group-hover/switch:rotate-180" />
                  </button>
                )}
                
                {/* Card with 3D flip animation */}
                <div className="relative [perspective:1000px]">
                  <div
                    className={`relative transition-all duration-700 [transform-style:preserve-3d] ${
                      isMixageCard ? (showExpress ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]') : ''
                    }`}
                  >
                    <div className={`${isMixageCard ? '[backface-visibility:hidden]' : ''}`}>
                      <Card 
                        className={`service-card group cursor-pointer relative overflow-hidden transition-all duration-500 min-h-[440px] sm:min-h-[480px] md:min-h-[520px] flex flex-col ${
                          service.featured ? 'ring-2 ring-primary ring-opacity-50' : ''
                        } ${isMixageCard ? 'animate-fade-in' : ''}`}
                        onClick={() => handleOpenModal(service)}
                      >
                        {/* Service Image */}
                        <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden">
                          <img 
                            src={service.image}
                            alt={service.title}
                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                              service.id === 'captation-sonore' ? 'object-[center_25%]' :
                              service.id === 'direction-artistique' ? 'object-bottom' :
                              service.id === 'mixage-mastering' ? 'object-top' :
                              service.id === 'mixage-mastering-express' ? 'object-center' :
                              ''
                            }`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                          </div>
                          {/* Featured Badge */}
                          {service.featured && service.badgeText && (
                            <div className={`absolute top-3 left-3 sm:top-4 sm:left-4 ${service.badgeColor || 'bg-primary'} text-primary-foreground px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-lg`}>
                              {service.badgeText}
                            </div>
                          )}
                        </div>

                        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                          <div className="flex justify-between items-start mb-1 sm:mb-2">
                            <CardTitle className="text-lg sm:text-xl font-bold">{service.title}</CardTitle>
                            <div className="text-right">
                              <div className="text-xl sm:text-2xl font-bold text-primary">{/\d/.test(service.price) ? (service.price.includes('€') ? service.price : `${service.price}€`) : service.price}</div>
                            </div>
                          </div>
                          <CardDescription className="text-muted-foreground text-sm sm:text-base line-clamp-2">
                            {service.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col px-4 sm:px-6 pb-4 sm:pb-6">
                          {/* Features List */}
                          <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 flex-1">
                            {service.included.slice(0, 3).map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center text-xs sm:text-sm">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 sm:mr-3 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>

                          <Button 
                            className="w-full group-hover:studio-button transition-all duration-300 text-sm sm:text-base"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(service);
                            }}
                          >
                            Plus d'infos
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform group-hover:translate-x-1" />
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
                          className={`service-card group cursor-pointer relative overflow-hidden min-h-[440px] sm:min-h-[480px] md:min-h-[520px] flex flex-col transition-all duration-500 ring-2 ring-primary ring-opacity-50`}
                          onClick={() => handleOpenModal(showExpress ? servicesData.find(s => s.id === "mixage-mastering-express")! : servicesData.find(s => s.id === "mixage-mastering")!)}
                        >
                          <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden">
                            <img 
                              src={showExpress ? servicesData.find(s => s.id === "mixage-mastering-express")!.image : servicesData.find(s => s.id === "mixage-mastering")!.image}
                              alt={showExpress ? "Mixage + Mastering Express" : "Mixage + Mastering"}
                              className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Waves className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                              </div>
                            </div>
                            <div className={`absolute top-3 left-3 sm:top-4 sm:left-4 ${showExpress ? 'bg-emerald-500' : 'bg-primary'} text-primary-foreground px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-lg`}>
                              {showExpress ? "Budget" : "Spécialité"}
                            </div>
                          </div>

                          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                            <div className="flex justify-between items-start mb-1 sm:mb-2">
                              <CardTitle className="text-lg sm:text-xl font-bold">{showExpress ? "Mixage + Mastering Express" : "Mixage + Mastering"}</CardTitle>
                              <div className="text-right">
                                <div className="text-xl sm:text-2xl font-bold text-primary">{showExpress ? "120€" : "290€"}</div>
                              </div>
                            </div>
                            <CardDescription className="text-muted-foreground text-sm sm:text-base line-clamp-2">
                              {showExpress ? servicesData.find(s => s.id === "mixage-mastering-express")!.description : servicesData.find(s => s.id === "mixage-mastering")!.description}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="flex-1 flex flex-col px-4 sm:px-6 pb-4 sm:pb-6">
                            <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 flex-1">
                              {(showExpress ? servicesData.find(s => s.id === "mixage-mastering-express")!.included : servicesData.find(s => s.id === "mixage-mastering")!.included).slice(0, 3).map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-center text-xs sm:text-sm">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 sm:mr-3 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>

                            <Button 
                              className="w-full group-hover:studio-button transition-all duration-300 text-sm sm:text-base"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(showExpress ? servicesData.find(s => s.id === "mixage-mastering-express")! : servicesData.find(s => s.id === "mixage-mastering")!);
                              }}
                            >
                              Plus d'infos
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform group-hover:translate-x-1" />
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
          <div className="inline-flex items-center justify-center p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-gradient-hero border border-border">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Projet sur mesure ?</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Contactez-nous pour un devis personnalisé</p>
              <Button 
                size="lg" 
                className="studio-button text-sm sm:text-base"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Demander un devis gratuit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      <ServiceModal 
        service={selectedService}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default Services;
