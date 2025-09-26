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
      rightImage: "/lovable-uploads/WATERGATE_I.jpg",
      description: "Collaborations créatives avec un artiste hip-hop émergent aux flows authentiques.",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/6Ppunn0oij7cXSsQRefvrx?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
      collaborationDetails: "J'ai composé et enregistré 'JDAY', ainsi qu'enregistré 'J'DEVRAIS' et 'RARE' avec ZEU. Une collaboration créative intense qui a donné naissance à des tracks authentiques mêlant flows accrocheurs et productions soignées.",
      services: ["Composition", "Enregistrement"]
    },
    {
      id: "tany",
      name: "TANY",
      leftImage: "/lovable-uploads/IMG_3108.JPEG.png",
      rightImage: "/lovable-uploads/IMG_0902.JPG.png",
      description: "Partenariat privilégié et relation artistique forte avec direction artistique unique.",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/4w5z9GsBwZuzIxHr46SuIc?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
      collaborationDetails: "Partenariat privilégié avec Tany, nous avons développé une relation artistique forte et durable. Ensemble, nous construisons une direction artistique unique qui définit son identité musicale.",
      services: ["Production complète", "Enregistrement", "Mixage", "Mastering", "Direction artistique"]
    },
    {
      id: "lil-moine",
      name: "LIL MOINE",
      leftImage: "/lovable-uploads/image00010.jpeg.png",
      rightImage: "/lovable-uploads/image00016.jpeg.png",
      description: "Collaboration rapprochée depuis 2020, production quasi-exclusive de ses tracks et projets.",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/2TfrHGAo7z0KBG1XjJeSJq?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
      collaborationDetails: "Collaboration privilégiée depuis 2020 avec Lil Moine. Je produis presque chaque track et projet pour lui, créant un son cohérent et évolutif. Cette relation artistique durable nous permet d'explorer constamment de nouvelles sonorités tout en gardant son identité musicale forte.",
      services: ["Production", "Composition", "Enregistrement", "Mixage", "Mastering", "Direction artistique", "Ingénieur son live", "Sound Design"]
    },
    {
      id: "eddy-de-mart",
      name: "EDDY DE MART",
      leftImage: "/lovable-uploads/image00001.jpeg.png",
      rightImage: "/lovable-uploads/image00002.jpeg.png",
      description: "Mixage et mastering professionnel depuis 2022, apportant dimension technique à ses créations.",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/2MdVNVBxr9PxNWgu7bZee9?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
      collaborationDetails: "Depuis 2022, je m'occupe du mixage et mastering des projets d'Eddy de Mart. Notre collaboration se concentre sur l'obtention d'un son professionnel et impactant, mettant en valeur ses compositions avec une approche technique rigoureuse.",
      services: ["Mixage", "Mastering", "Post-production", "Arrangement"]
    },
    {
      id: "black-beanie-dub",
      name: "BLACK BEANIE DUB",
      leftImage: "/lovable-uploads/103047987_3574103359272409_4013686986738874573_n_edited_1.jpg",
      rightImage: "/lovable-uploads/69460379_2898404826842269_7605137112588877824_n.jpg",
      description: "Projet co-fondé avec Mathieu Battini en 2017, notre réalisation la plus reconnue.",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/1FfVZW1oMogo3tooMmLuG8?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
      collaborationDetails: "Black Beanie Dub est un projet que j'ai fondé avec Mathieu Battini en 2017. C'est devenu notre projet le plus réussi, explorant les territoires du dub et du roots reggae, de l'électronique et de l'expérimentation sonore, toujours en respectant les fondements traditionnels du genre. Une aventure artistique qui continue d'évoluer.",
      services: ["Co-fondateur", "Production", "Composition", "Sound Design"]
    },
    {
      id: "lofai",
      name: "LOFAI",
      leftImage: "/lovable-uploads/3.png",
      rightImage: "/lovable-uploads/PP_YT_LOFAI.png",
      description: "Projet collaboratif explorant l'intersection entre intelligence artificielle et musique lofi.",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/05Ss7BSPsb2HJNXIsbVWii?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
      collaborationDetails: "LOFAI est un projet collaboratif fascinant qui explore l'intersection entre l'intelligence artificielle et la musique lofi. Nous travaillons avec des musiciens talentueux et des jazzmen exceptionnels - LOFAI n'existerait pas sans eux. Nous expérimentons avec des outils d'IA pour créer des textures sonores uniques tout en gardant l'authenticité et la chaleur du lofi traditionnel.",
      services: ["Expérimentation IA", "Production", "Sound Design", "Mixage", "Mastering", "Direction artistique", "Management"]
    },
    {
      id: "ekzo",
      name: "EKZO",
      leftImage: "/lovable-uploads/Image-27.jpg",
      rightImage: "/lovable-uploads/Ekzo_-_b.png",
      description: "Mon alias de beatmaker/producteur depuis 2022 pour mes projets personnels créatifs.",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/4zVgcBTAWBxJW9WOfdEPDo?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
      collaborationDetails: "Ekzo est mon nom de beatmaker/producteur depuis 2022. Sous cet alias, je sors tous mes projets personnels, explorant différents styles et approches de production. C'est mon laboratoire créatif où j'exprime ma vision artistique personnelle.",
      services: ["Beatmaking", "Production personnelle", "Expérimentation"]
    },
    {
      id: "lave",
      name: "LAVÉ",
      leftImage: "/lovable-uploads/e1d703bb-6a51-4b79-bd5c-ef179a66d61d.jpg",
      rightImage: "/lovable-uploads/621cb864-8299-4a78-ae87-43786eb5f7ed.jpg",
      description: "Jeune talent prometteur, mixage et mastering du titre 'Bête noir'.",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/1O6r6usgwGKMsizB23L6dl?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
      collaborationDetails: "J'ai eu le plaisir de mixer et masteriser 'Bête noir' pour Lavé, un jeune artiste très talentueux. Le projet nécessitait une approche délicate pour préserver l'authenticité de sa voix tout en apportant la profondeur et l'impact nécessaires.",
      services: ["Mixage", "Mastering"]
    },
    {
      id: "mamood",
      name: "MAMOOD",
      leftImage: "/lovable-uploads/450172737_1233005707693009_8303727533697657373_n.jpg",
      rightImage: "/lovable-uploads/4CD5F5BC-16B6-4B48-8063-7422452F39C1.jpeg",
      description: "Collaboration sur l'enregistrement et mixage d'Adios et MPLPVP.",
      spotifyLink: "https://open.spotify.com/intl-fr/artist/2YkxhCLm6u50qBodau4R1z?si=VlQzbb3DQHmrPrhjui7_hg",
      collaborationDetails: "J'ai enregistré et mixé 'Adios' et 'MPLPVP' pour Mamood. Ces sessions ont été particulièrement enrichissantes, permettant d'explorer des sonorités urbaines contemporaines avec une approche technique précise pour capturer l'énergie de ses performances.",
      services: ["Enregistrement", "Mixage"]
    },
    {
      id: "theo-bachelier",
      name: "THÉO BACHELIER",
      leftImage: "/lovable-uploads/WhatsApp_Image_2025-03-19_à_17.13.14_25767dda.jpg",
      rightImage: "/lovable-uploads/ULTRACK.jpg",
      description: "Collaboration privilégiée autour du sound design, post-production et mixage créatif.",
      youtubeUrl: "https://www.youtube.com/@theobachelier",
      collaborationDetails: "Collaboration privilégiée avec Théo Bachelier autour du sound design. Je travaille sur la post-production, le sound design et le mixage de ses projets créatifs. Une synergie artistique qui nous permet d'explorer les limites de la création sonore contemporaine.",
      services: ["Sound Design", "Post-production", "Mixage", "Collaboration créative"]
    },
    {
      id: "timothe-chatenoud",
      name: "TIMOTHÉ CHATENOUD",
      leftImage: "/lovable-uploads/336901015_913434623316199_2830527649959552654_n.jpg",
      rightImage: "/lovable-uploads/Sans_titre13.png",
      description: "Artiste émergent, développement d'un son unique et identité musicale personnelle.",
      spotifyLink: "https://open.spotify.com/intl-fr/artist/1PWnN16t7B2Ee2GJd648og?si=pp6ocRAfRzqeDwKnTMoe3w",
      collaborationDetails: "Timothé Chatenoud est un artiste émergent avec qui nous travaillons pour développer son identité sonore unique. Nos sessions se concentrent sur la recherche créative et l'expérimentation pour créer un univers musical qui lui est propre.",
      services: ["Mastering"]
    },
    {
      id: "venin",
      name: "VENIN",
      leftImage: "/lovable-uploads/jean-marc-battini.jpg",
      rightImage: "/lovable-uploads/venin-album-cover.jpg",
      description: "Groupe de rock légendaire, édition/mixage/mastering de l'album 'Le Premier Sang'.",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/album/6RSIzijNFeHFmv4vLWhxgL?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
      collaborationDetails: "Pour leur album 'Le Premier Sang', j'ai eu l'honneur d'accueillir Venin au Global Drip Studio. J'ai assuré l'édition, le mixage et le mastering des 9 titres inédits, ainsi que l'enregistrement des voix, des parties solo, et quelques arrangements claviers. Un projet entièrement pensé pour sonner eighties avec une approche authentique sans copier-coller ni trig.",
      services: ["Édition", "Mixage", "Mastering", "Enregistrement voix et guitares", "Arrangements"]
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
                      className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out transform-gpu"
                      style={{ 
                        backgroundImage: `url(${project.leftImage})`,
                        backgroundAttachment: 'fixed',
                        transform: 'scale(1.1)',
                        filter: 'brightness(1.1)'
                      }}
                    />
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out opacity-0 group-hover:opacity-100"
                      style={{ 
                        backgroundImage: `url(${project.leftImage})`,
                        transform: 'scale(1.2)',
                        filter: 'brightness(1.2)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent group-hover:from-background/70 group-hover:via-background/30 transition-all duration-700" />
                    <div className="relative z-10 flex flex-col justify-end h-full p-8 transform group-hover:translate-y-[-10px] transition-transform duration-500">
                      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 transform group-hover:scale-105 transition-transform duration-300">
                        {project.name}
                      </h2>
                      <p className="text-muted-foreground mb-6 max-w-xl transform group-hover:text-foreground transition-all duration-300">
                        {project.description}
                      </p>
                      <Collapsible 
                        open={expandedProject === project.id}
                        onOpenChange={() => toggleProject(project.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-fit bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/25"
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
                  <div className="relative overflow-hidden group/right cursor-pointer">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform-gpu hover:scale-105 hover:rotate-1 hover:brightness-110 hover:saturate-110"
                      style={{ backgroundImage: `url(${project.rightImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent hover:from-background/40 transition-all duration-500" />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 hover:opacity-100 transition-all duration-500 shadow-inner" />
                    <div className="absolute inset-0 border-2 border-primary/20 opacity-0 hover:opacity-100 transition-all duration-300" />
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
                          {project.spotifyEmbed ? (
                            <div className="bg-card rounded-lg p-4 border border-border/50">
                              <div dangerouslySetInnerHTML={{ __html: project.spotifyEmbed }} />
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
                          ) : project.spotifyLink ? (
                            <div className="bg-card rounded-lg p-4 border border-border/50">
                              <a 
                                href={project.spotifyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-primary hover:underline text-lg"
                              >
                                Écouter sur Spotify
                                <ExternalLink className="w-4 h-4 ml-2" />
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