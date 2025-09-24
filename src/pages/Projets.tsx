import { useState } from "react";
import { ChevronDown, Play, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEffect } from "react";

const Projets = () => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Nos Projets | Global Drip Studio - Collaborations Artistiques";
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = "Découvrez nos collaborations artistiques avec Zeu, Tany, Lil Moine, Eddy de Mart, Black Beanie Dub et plus encore. Productions, mixage et mastering professionnels.";
      document.head.appendChild(m);
    } else {
      meta.setAttribute('content', "Découvrez nos collaborations artistiques avec Zeu, Tany, Lil Moine, Eddy de Mart, Black Beanie Dub et plus encore. Productions, mixage et mastering professionnels.");
    }
  }, []);

  const toggleProject = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const projects = [
    {
      id: "zeu",
      name: "ZEU",
      leftImage: "/lovable-uploads/maxresdefault.jpg.png",
      rightImage: "/lovable-uploads/WATERGATE I.jpg.png",
      description: "Artiste hip-hop émergent avec qui nous avons collaboré sur plusieurs titres marquants.",
      spotifyUri: "spotify:track:6Ppunn0oij7cXSsQRefvrx",
      collaborationDetails: "J'ai composé et enregistré 'JDAY', ainsi qu'enregistré 'J'DEVRAIS' et 'RARE' avec ZEU. Une collaboration créative intense qui a donné naissance à des tracks authentiques mêlant flows accrocheurs et productions soignées.",
      services: ["Composition", "Enregistrement", "Mixage", "Mastering"]
    },
    {
      id: "tany",
      name: "TANY",
      leftImage: "/lovable-uploads/IMG_3108.JPEG.png",
      rightImage: "/lovable-uploads/IMG_0902.JPG.png",
      description: "Collaboration étroite depuis plusieurs années, toutes ses sorties sont labellisées Global Drip Records.",
      spotifyUri: "spotify:artist:4w5z9GsBwZuzIxHr46SuIc",
      collaborationDetails: "Partenariat privilégié avec Tany depuis plusieurs années. Je produis pratiquement tout pour lui car nous travaillons en étroite collaboration. Ses releases sont labellisées 'Global Drip Records', témoignant de notre relation artistique forte et durable.",
      services: ["Production complète", "Enregistrement", "Mixage", "Mastering", "Direction artistique"]
    },
    {
      id: "lil-moine",
      name: "LIL MOINE",
      leftImage: "/lovable-uploads/image00010.jpeg.png",
      rightImage: "/lovable-uploads/image00016.jpeg.png",
      description: "Collaboration rapprochée depuis 2020, je produis quasiment tous ses tracks et projets.",
      spotifyUri: "spotify:artist:2TfrHGAo7z0KBG1XjJeSJq",
      collaborationDetails: "Collaboration privilégiée depuis 2020 avec Lil Moine. Je produis presque chaque track et projet pour lui, créant un son cohérent et évolutif. Cette relation artistique durable nous permet d'explorer constamment de nouvelles sonorités tout en gardant son identité musicale forte.",
      services: ["Production", "Composition", "Enregistrement", "Mixage", "Mastering"]
    },
    {
      id: "eddy-de-mart",
      name: "EDDY DE MART",
      leftImage: "/lovable-uploads/image00001.jpeg.png",
      rightImage: "/lovable-uploads/image00002.jpeg.png",
      description: "Je mixe et masterise ses projets depuis 2022, apportant une dimension professionnelle à ses créations.",
      spotifyUri: "spotify:artist:2MdVNVBxr9PxNWgu7bZee9",
      collaborationDetails: "Depuis 2022, je m'occupe du mixage et mastering des projets d'Eddy de Mart. Notre collaboration se concentre sur l'obtention d'un son professionnel et impactant, mettant en valeur ses compositions avec une approche technique rigoureuse.",
      services: ["Mixage", "Mastering", "Post-production"]
    },
    {
      id: "black-beanie-dub",
      name: "BLACK BEANIE DUB",
      leftImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      rightImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      description: "Projet que j'ai co-fondé avec Mathieu Battini en 2017, devenu notre projet le plus reconnu.",
      spotifyUri: "spotify:artist:1FfVZW1oMogo3tooMmLuG8",
      collaborationDetails: "Black Beanie Dub est un projet que j'ai fondé avec Mathieu Battini en 2017. C'est devenu notre projet le plus réussi, explorant les territoires du dub, de l'électronique et de l'expérimentation sonore. Une aventure artistique qui continue d'évoluer.",
      services: ["Co-fondateur", "Production", "Composition", "Sound Design"]
    },
    {
      id: "lofai",
      name: "LOFAI",
      leftImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      rightImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      description: "Projet collaboratif explorant l'intersection entre intelligence artificielle et musique lofi.",
      spotifyUri: "spotify:artist:05Ss7BSPsb2HJNXIsbVWii",
      collaborationDetails: "LOFAI est un projet collaboratif fascinant qui explore l'intersection entre l'intelligence artificielle et la musique lofi. Nous expérimentons avec des outils d'IA pour créer des textures sonores uniques tout en gardant l'authenticité et la chaleur du lofi traditionnel.",
      services: ["Expérimentation IA", "Production", "Sound Design", "Mixage"]
    },
    {
      id: "ekzo",
      name: "EKZO",
      leftImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      rightImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      description: "Mon alias de beatmaker/producteur depuis 2022 pour mes projets personnels.",
      spotifyUri: "spotify:artist:4zVgcBTAWBxJW9WOfdEPDo",
      collaborationDetails: "Ekzo est mon nom de beatmaker/producteur depuis 2022. Sous cet alias, je sors tous mes projets personnels, explorant différents styles et approches de production. C'est mon laboratoire créatif où j'exprime ma vision artistique personnelle.",
      services: ["Beatmaking", "Production personnelle", "Expérimentation"]
    },
    {
      id: "lave",
      name: "LAVÉ",
      leftImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      rightImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      description: "Jeune artiste talentueux pour qui j'ai mixé et masterisé 'Bête noir'.",
      spotifyUri: "spotify:artist:5mv54dQlKqcU3RQbzRkqMK",
      collaborationDetails: "J'ai eu le plaisir de mixer et masteriser 'Bête noir' pour Lavé, un jeune artiste très talentueux. Le projet nécessitait une approche délicate pour préserver l'authenticité de sa voix tout en apportant la profondeur et l'impact nécessaires.",
      services: ["Mixage", "Mastering"]
    },
    {
      id: "mamood",
      name: "MAMOOD",
      leftImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      rightImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      description: "Collaboration sur l'enregistrement et le mixage d'Adios et MPLPVP.",
      spotifyUri: "spotify:artist:2YkxhCLm6u50qBodau4R1z",
      collaborationDetails: "J'ai enregistré et mixé 'Adios' et 'MPLPVP' pour Mamood. Ces sessions ont été particulièrement enrichissantes, permettant d'explorer des sonorités urbaines contemporaines avec une approche technique précise pour capturer l'énergie de ses performances.",
      services: ["Enregistrement", "Mixage"]
    },
    {
      id: "theo-bachelier",
      name: "THÉO BACHELIER",
      leftImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      rightImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      description: "Collaboration étroite autour du sound design, post-production et mixage de projets créatifs.",
      youtubeUrl: "https://www.youtube.com/@theobachelier",
      collaborationDetails: "Collaboration privilégiée avec Théo Bachelier autour du sound design. Je travaille sur la post-production, le sound design et le mixage de ses projets créatifs. Une synergie artistique qui nous permet d'explorer les limites de la création sonore contemporaine.",
      services: ["Sound Design", "Post-production", "Mixage", "Collaboration créative"]
    },
    {
      id: "timothe-chatenoud",
      name: "TIMOTHÉ CHATENOUD",
      leftImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      rightImage: "/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png",
      description: "Artiste émergent avec qui nous développons un son unique et personnel.",
      spotifyUri: "spotify:artist:placeholder",
      collaborationDetails: "Timothé Chatenoud est un artiste émergent avec qui nous travaillons pour développer son identité sonore unique. Nos sessions se concentrent sur la recherche créative et l'expérimentation pour créer un univers musical qui lui est propre.",
      services: ["Développement artistique", "Production", "Mixage"]
    },
    {
      id: "venin",
      name: "VENIN",
      leftImage: "/lovable-uploads/jean-marc-battini.jpg",
      rightImage: "/lovable-uploads/venin-album-cover.jpg",
      description: "Groupe de rock légendaire pour qui j'ai assuré l'édition, mixage et mastering de l'album 'Le Premier Sang'.",
      spotifyUri: "spotify:album:6RSIzijNFeHFmv4vLWhxgL",
      collaborationDetails: "Pour leur album 'Le Premier Sang', j'ai eu l'honneur d'accueillir Venin au Global Drip Studio. J'ai assuré l'édition, le mixage et le mastering des 9 titres inédits, ainsi que l'enregistrement des voix, des parties solo, et quelques arrangements claviers. Un projet entièrement pensé pour sonner eighties avec une approche authentique sans copier-coller ni trig.",
      services: ["Édition", "Mixage", "Mastering", "Enregistrement voix", "Arrangements"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/logo-blanc-sans-fond.png"
                alt="Global Drip Studio"
                className="h-8 object-contain"
              />
            </a>
            <a href="/">
              <Button variant="outline" size="sm">
                ← Retour à l'accueil
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            NOS <span className="hero-text">PROJETS</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Les artistes et projets avec lesquels nous sommes fiers d'avoir collaboré
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="py-8">
        <div className="container mx-auto px-6 space-y-8">
          {projects.map((project) => (
            <div key={project.id} className="mb-12">
              {/* Project Card */}
              <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[400px]">
                  {/* Left Image - Artist Photo */}
                  <div className="lg:col-span-2 relative overflow-hidden group">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ 
                        backgroundImage: `url(${project.leftImage})`,
                        backgroundAttachment: 'fixed'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
                    <div className="relative z-10 flex flex-col justify-end h-full p-8">
                      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        {project.name}
                      </h2>
                      <p className="text-muted-foreground mb-6 max-w-xl">
                        {project.description}
                      </p>
                      <Collapsible 
                        open={expandedProject === project.id}
                        onOpenChange={() => toggleProject(project.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-fit bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                          >
                            En savoir plus
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                              expandedProject === project.id ? 'rotate-180' : ''
                            }`} />
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    </div>
                  </div>

                  {/* Right Image - Project Cover */}
                  <div className="relative overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                      style={{ backgroundImage: `url(${project.rightImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  </div>
                </div>

                {/* Expandable Content */}
                <Collapsible 
                  open={expandedProject === project.id}
                  onOpenChange={() => toggleProject(project.id)}
                >
                  <CollapsibleContent className="border-t border-border/50">
                    <div className="p-8 bg-gradient-to-b from-muted/20 to-background">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Details */}
                        <div>
                          <h3 className="text-xl font-bold mb-4">Notre collaboration</h3>
                          <p className="text-muted-foreground mb-6 leading-relaxed">
                            {project.collaborationDetails}
                          </p>
                          
                          <div className="mb-6">
                            <h4 className="font-semibold mb-3">Services fournis :</h4>
                            <div className="flex flex-wrap gap-2">
                              {project.services.map((service, index) => (
                                <span 
                                  key={index}
                                  className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
                                >
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Spotify/YouTube Player */}
                        <div>
                          <h3 className="text-xl font-bold mb-4">Écouter</h3>
                          {project.spotifyUri && project.id !== "theo-bachelier" ? (
                            <div className="bg-card rounded-lg p-4 border border-border/50">
                              <iframe 
                                src={`https://open.spotify.com/embed/${project.spotifyUri.replace('spotify:', '')}`}
                                width="100%" 
                                height="352" 
                                frameBorder="0" 
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                                loading="lazy"
                                className="rounded-lg"
                              />
                            </div>
                          ) : project.id === "theo-bachelier" && project.youtubeUrl ? (
                            <div className="space-y-4">
                              <div className="bg-card rounded-lg p-4 border border-border/50">
                                <iframe 
                                  width="100%" 
                                  height="200"
                                  src="https://www.youtube.com/embed/M-eW6rpRklU"
                                  title="Théo Bachelier - Projet 1"
                                  frameBorder="0" 
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                  allowFullScreen
                                  className="rounded-lg"
                                />
                                <p className="text-sm text-muted-foreground mt-2">
                                  Projet créatif avec sound design et mixage complet
                                </p>
                              </div>
                              <div className="bg-card rounded-lg p-4 border border-border/50">
                                <iframe 
                                  width="100%" 
                                  height="200"
                                  src="https://www.youtube.com/embed/kFEacVd-iMs"
                                  title="Théo Bachelier - Projet 2"
                                  frameBorder="0" 
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                  allowFullScreen
                                  className="rounded-lg"
                                />
                                <p className="text-sm text-muted-foreground mt-2">
                                  Post-production et sound design avancé
                                </p>
                              </div>
                              <a 
                                href={project.youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-primary hover:underline"
                              >
                                Voir plus sur YouTube
                                <ExternalLink className="w-4 h-4 ml-1" />
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Prêt à rejoindre nos <span className="hero-text">collaborations</span> ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Chaque projet est unique. Parlons de votre vision musicale et créons ensemble quelque chose d'extraordinaire.
            </p>
            <a href="/#contact">
              <Button size="lg" className="studio-button">
                Démarrer un projet
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projets;