import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Euro, Check, Star, Music, Settings, Volume2, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Open detail directly when URL hash is present
  useEffect(() => {
    const setFromHash = () => {
      const id = window.location.hash?.replace('#', '');
      if (id) setSelectedService(id);
    };
    setFromHash();
    window.addEventListener('hashchange', setFromHash);
    return () => window.removeEventListener('hashchange', setFromHash);
  }, []);

  const services = [
    {
      id: "mixage-mastering",
      title: "Mixage + Mastering",
      description: "Service complet pour donner vie à vos créations musicales",
      price: "290€",
      icon: Music,
      image: "/lovable-uploads/5974c219-5112-499f-b5dd-3c09bc04df1a.png",
      featured: true,
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
      id: "sound-design",
      title: "Sound Design",
      description: "Création sonore et design audio pour tous vos projets créatifs",
      price: "Sur devis",
      icon: Settings,
      image: "/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png",
      featured: true,
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
      price: "Sur devis",
      icon: Volume2,
      image: "/lovable-uploads/64615fd6-368c-466a-a669-f5140677e476.png",
      featured: false,
      category: "Création",
      duration: "1-3 semaines",
      included: [
        "Composition originale",
        "Production complète",
        "Arrangements personnalisés"
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
      icon: Volume2,
      image: "/lovable-uploads/6ed6bc90-04bb-4040-9e0b-26b3c13bba5d.png",
      featured: false,
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

  const service = selectedService ? services.find(s => s.id === selectedService) : null;

  if (selectedService && service) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-12">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/#services'}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la page principale
          </Button>

          <div className="max-w-4xl mx-auto">
            {/* Service Header */}
            <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
              <img 
                src={service.image}
                alt={service.title}
                className={`w-full h-full object-cover ${
                  service.id === 'composition' ? 'object-center' :
                  service.id === 'captation-sonore' ? 'object-bottom' :  
                  service.id === 'direction-artistique' ? 'object-bottom' :
                  service.id === 'mixage-mastering' ? 'object-top' :
                  ''
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-4 mb-3">
                  <Badge variant="secondary">{service.category}</Badge>
                  {service.featured && <Badge className="bg-primary">Spécialité</Badge>}
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">{service.title}</h1>
                <div className="flex items-center gap-4 text-white/80">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                    {service.price}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Description du service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-muted-foreground mb-6">{service.description}</p>
                    <p>{service.details}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Processus de travail</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {service.process.split(' → ').map((step, index, array) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-primary/10 rounded-full">{step}</span>
                          {index < array.length - 1 && <span>→</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

        {service.id === "sound-design" && (
          <Card>
            <CardHeader>
              <CardTitle>Plus d'infos - Nos réalisations Sound Design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">THE HOLY LAND - Tomas Lemoine</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Collaboration with Commencal - Post-production/sound design/global mixing
                </p>
                <div className="bg-card rounded-lg p-4 border border-border/50">
                  <iframe 
                    width="100%" 
                    height="200"
                    src="https://www.youtube.com/embed/u44cDLJWeFc"
                    title="THE HOLY LAND - Tomas Lemoine"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">To the next chapter - Tomas Lemoine</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Collaboration with Canyon Bicycles - Chef opérateur son sur place et en post-prod/sound design/global mixing
                </p>
                <div className="bg-card rounded-lg p-4 border border-border/50">
                  <iframe 
                    width="100%" 
                    height="200"
                    src="https://www.youtube.com/embed/A7s0pP0D3Po"
                    title="To the next chapter - Tomas Lemoine"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Théo Bachelier</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Post production/sound design/global mixing
                </p>
                <div className="bg-card rounded-lg p-4 border border-border/50">
                  <iframe 
                    width="100%" 
                    height="200"
                    src="https://www.youtube.com/embed/M-eW6rpRklU"
                    title="Théo Bachelier"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Théo Pulsor</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Young and successful entrepreneur (220k+ views in 4 months) - Post production/sound design/global mixing
                </p>
                <div className="bg-card rounded-lg p-4 border border-border/50">
                  <iframe 
                    width="100%" 
                    height="200"
                    src="https://www.youtube.com/embed/kFEacVd-iMs"
                    title="Théo Pulsor"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Inclus dans le service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {service.included.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Livrables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.deliverables.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-hero border-primary/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{service.price}</div>
                      <p className="text-sm text-muted-foreground mb-4">Prix {service.price.includes('devis') ? 'sur demande' : 'tout inclus'}</p>
                      <Button className="w-full studio-button">
                        Demander un devis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nos <span className="hero-text">Services</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Des prestations professionnelles adaptées à tous vos besoins musicaux, 
            du mixage/mastering haute fidélité à la composition, en passant par la formation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={service.id} 
              className={`service-card group cursor-pointer relative overflow-hidden hover:scale-105 transition-all duration-300 ${
                service.featured ? 'ring-2 ring-primary ring-opacity-50' : ''
              }`}
              onClick={() => setSelectedService(service.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <div className="absolute top-4 right-4">
                  <div className="w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{service.price}</div>
                  </div>
                </div>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 mb-6">
                  {service.included.slice(0, 3).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {service.included.length > 3 && (
                    <li className="text-sm text-muted-foreground">
                      +{service.included.length - 3} autres avantages
                    </li>
                  )}
                </ul>

                <Button 
                  className="w-full group-hover:studio-button transition-all duration-300"
                  variant="outline"
                >
                  Voir les détails
                </Button>
              </CardContent>

              {service.featured && (
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
                  Spécialité
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;