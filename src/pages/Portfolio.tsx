import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Play, ExternalLink, Calendar, Music } from "lucide-react";

const Portfolio = () => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const projects = [
    {
      id: "excalibur",
      artist: "Excalibur",
      title: "Rock moderne",
      genre: "Rock/Metal",
      year: "2024",
      image: "/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png",
      image2: "/lovable-uploads/5974c219-5112-499f-b5dd-3c09bc04df1a.png",
      services: ["Mixage", "Mastering"],
      description: "Production complète d'un EP rock moderne avec sonorités contemporaines",
      details: {
        tracks: 4,
        duration: "18 minutes",
        equipment: ["Console SSL", "Compresseurs 1176", "Reverb Lexicon"],
        challenges: "Équilibrer la puissance des guitares avec la clarté vocale",
        result: "Un son moderne et impactant qui respecte l'énergie du groupe"
      },
      audioSample: "/audio/excalibur-mixed.wav"
    },
    {
      id: "urban-beats",
      artist: "Urban Flow",
      title: "Hip-Hop underground",
      genre: "Hip-Hop",
      year: "2024",
      image: "/lovable-uploads/64615fd6-368c-466a-a669-f5140677e476.png",
      image2: "/lovable-uploads/92466e48-6f78-46d4-bb9b-2bc8c6a50017.png",
      services: ["Beatmaking", "Mixage", "Mastering"],
      description: "Création complète de beats et mixage pour un artiste hip-hop émergent",
      details: {
        tracks: 6,
        duration: "22 minutes",
        equipment: ["MPC Live", "Moniteurs Yamaha", "Plugins Waves"],
        challenges: "Créer une identité sonore unique dans un style saturé",
        result: "Des productions originales qui se démarquent de la concurrence"
      }
    },
    {
      id: "electronic-fusion",
      artist: "Neon Dreams",
      title: "Électronique expérimentale",
      genre: "Electronic",
      year: "2023",
      image: "/lovable-uploads/35c8540d-ce59-433e-87fd-f1b8b1527941.png",
      image2: "/lovable-uploads/6ed6bc90-04bb-4040-9e0b-26b3c13bba5d.png",
      services: ["Sound Design", "Composition", "Mastering"],
      description: "Création d'univers sonores électroniques avec sound design avancé",
      details: {
        tracks: 8,
        duration: "35 minutes",
        equipment: ["Moog Synthesizers", "Ableton Live", "Reaktor"],
        challenges: "Fusionner musicalité et expérimentation sonore",
        result: "Un album concept immersif et innovant"
      }
    },
    {
      id: "acoustic-sessions",
      artist: "Luna Acoustic",
      title: "Sessions acoustiques",
      genre: "Folk/Acoustic",
      year: "2023",
      image: "/lovable-uploads/92466e48-6f78-46d4-bb9b-2bc8c6a50017.png",
      image2: "/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png",
      services: ["Enregistrement", "Mixage"],
      description: "Captation intimiste de performances acoustiques en studio",
      details: {
        tracks: 5,
        duration: "25 minutes",
        equipment: ["Microphones Neumann", "Préamplis Neve", "Reverb naturelle"],
        challenges: "Préserver l'intimité et la spontanéité des performances",
        result: "Des enregistrements chaleureux et authentiques"
      }
    }
  ];

  const toggleProject = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nos <span className="hero-text">Réalisations</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez une sélection de nos projets récents et l'expertise apportée à chaque collaboration
          </p>
        </div>

        {/* Projects Grid */}
        <div className="space-y-8">
          {projects.map((project, index) => (
            <Card key={project.id} className="overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Images */}
                <div className="grid grid-cols-2 gap-0 h-64 lg:h-auto">
                  <div className="relative overflow-hidden">
                    <img 
                      src={project.image}
                      alt={`${project.artist} - Image 1`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="relative overflow-hidden">
                    <img 
                      src={project.image2}
                      alt={`${project.artist} - Image 2`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="secondary">{project.genre}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {project.year}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2">{project.artist}</h3>
                    <p className="text-lg text-primary mb-4">{project.title}</p>
                    <p className="text-muted-foreground mb-6">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.services.map((service, serviceIndex) => (
                        <Badge key={serviceIndex} variant="outline">{service}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {project.audioSample && (
                      <Button variant="outline" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Écouter un extrait
                      </Button>
                    )}
                    
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between"
                          onClick={() => toggleProject(project.id)}
                        >
                          Plus d'infos
                          <ChevronDown className={`w-4 h-4 transition-transform ${expandedProject === project.id ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/20 rounded-lg">
                          <div>
                            <h4 className="font-semibold mb-2">Détails du projet</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              <li>• {project.details.tracks} titres</li>
                              <li>• Durée: {project.details.duration}</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Équipement utilisé</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {project.details.equipment.map((item, itemIndex) => (
                                <li key={itemIndex}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="md:col-span-2">
                            <h4 className="font-semibold mb-2">Défi technique</h4>
                            <p className="text-sm text-muted-foreground mb-3">{project.details.challenges}</p>
                            <h4 className="font-semibold mb-2">Résultat obtenu</h4>
                            <p className="text-sm text-muted-foreground">{project.details.result}</p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center justify-center p-8 rounded-2xl bg-gradient-hero border border-border">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Votre projet mérite le meilleur</h3>
              <p className="text-muted-foreground mb-4">Contactez-nous pour discuter de votre vision artistique</p>
              <Button size="lg" className="studio-button">
                <Music className="w-5 h-5 mr-2" />
                Démarrer votre projet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;