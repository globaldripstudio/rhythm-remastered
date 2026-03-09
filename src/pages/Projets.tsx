import { useState, useEffect, useRef } from "react";
import { ChevronDown, Play, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import SpotifyEmbed from "@/components/SpotifyEmbed";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";

const Projets = () => {
  const { t, i18n } = useTranslation();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setImageLoaded(true);
      setTimeout(() => setShowContent(true), 300);
    }, 500);
  }, []);

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
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const toggleLanguage = () => {
    document.body.classList.add('lang-switching');
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
    setTimeout(() => document.body.classList.remove('lang-switching'), 500);
  };

  const projects = [
    {
      id: "zeu",
      name: "ZEU",
      leftImage: "/lovable-uploads/maxresdefault.jpg.png",
      rightImage: "/lovable-uploads/WATERGATE_I.jpg",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/6Ppunn0oij7cXSsQRefvrx?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    },
    {
      id: "tany",
      name: "TANY",
      leftImage: "/lovable-uploads/IMG_3108.JPEG.png",
      rightImage: "/lovable-uploads/IMG_0902.JPG.png",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/4w5z9GsBwZuzIxHr46SuIc?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    },
    {
      id: "lil-moine",
      name: "LIL MOINE",
      leftImage: "/lovable-uploads/image00010.jpeg.png",
      rightImage: "/lovable-uploads/image00016.jpeg.png",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/2TfrHGAo7z0KBG1XjJeSJq?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    },
    {
      id: "eddy-de-mart",
      name: "EDDY DE MART",
      leftImage: "/lovable-uploads/image00001.jpeg.png",
      rightImage: "/lovable-uploads/image00002.jpeg.png",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/2MdVNVBxr9PxNWgu7bZee9?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    },
    {
      id: "black-beanie-dub",
      name: "BLACK BEANIE DUB",
      leftImage: "/lovable-uploads/103047987_3574103359272409_4013686986738874573_n_edited_1.jpg",
      rightImage: "/lovable-uploads/69460379_2898404826842269_7605137112588877824_n.jpg",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/1FfVZW1oMogo3tooMmLuG8?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    },
    {
      id: "lofai",
      name: "LOFAI",
      leftImage: "/lovable-uploads/3.png",
      rightImage: "/lovable-uploads/PP_YT_LOFAI.png",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/05Ss7BSPsb2HJNXIsbVWii?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    },
    {
      id: "ekzo",
      name: "EKZO",
      leftImage: "/lovable-uploads/Image-27.jpg",
      rightImage: "/lovable-uploads/Ekzo_-_b.png",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/playlist/3zjaPFIW17OKA0XGhr2TQn?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    },
    {
      id: "lave",
      name: "LAVÉ",
      leftImage: "/lovable-uploads/e1d703bb-6a51-4b79-bd5c-ef179a66d61d.jpg",
      rightImage: "/lovable-uploads/621cb864-8299-4a78-ae87-43786eb5f7ed.jpg",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/1O6r6usgwGKMsizB23L6dl?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    },
    {
      id: "mamood",
      name: "MAMOOD",
      leftImage: "/lovable-uploads/450172737_1233005707693009_8303727533697657373_n.jpg",
      rightImage: "/lovable-uploads/4CD5F5BC-16B6-4B48-8063-7422452F39C1.jpeg",
      spotifyLink: "https://open.spotify.com/intl-fr/artist/2YkxhCLm6u50qBodau4R1z?si=VlQzbb3DQHmrPrhjui7_hg",
    },
    {
      id: "theo-bachelier",
      name: "THÉO BACHELIER",
      leftImage: "/lovable-uploads/theo-bachelier-2.jpg",
      rightImage: "/lovable-uploads/ULTRACK.jpg",
      youtubeUrl: "https://www.youtube.com/@theobachelier",
    },
    {
      id: "timothe-chatenoud",
      name: "TIMOTHÉ CHATENOUD",
      leftImage: "/lovable-uploads/336901015_913434623316199_2830527649959552654_n.jpg",
      rightImage: "/lovable-uploads/Sans_titre13.png",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/1PWnN16t7B2Ee2GJd648og?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    },
    {
      id: "venin",
      name: "VENIN",
      leftImage: "/lovable-uploads/jean-marc-battini.jpg",
      leftImagePosition: "center 30%",
      rightImage: "/lovable-uploads/venin-album-cover.jpg",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/album/6RSIzijNFeHFmv4vLWhxgL?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    },
    {
      id: "ritualz",
      name: "RITUALZ",
      leftImage: "/lovable-uploads/ritualz-artist.jpeg",
      rightImage: "/lovable-uploads/ritualz-dust-cover.jpeg",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/778PygOgKQkIo0Ib8bLHj0?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    },
    {
      id: "jibbs-arenas",
      name: "JIBBS ARENAS",
      leftImage: "/lovable-uploads/jibbs-arenas.jpg",
      rightImage: "/lovable-uploads/jibbs-cadera.png",
      spotifyEmbed: `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/2st5NLdvOw9BKhFs9RCaQu?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t('seo.projets.title')} description={t('seo.projets.description')} path="/projets" />
      {/* Loading Screen */}
      {!imageLoaded && (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-secondary border-t-transparent rounded-full animate-spin animate-reverse" style={{ animationDuration: '1.5s' }}></div>
                <div className="absolute inset-4 bg-primary/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">{t('projects.title')} {t('projects.titleHighlight')}</h3>
            <p className="text-muted-foreground animate-pulse">{t('projects.loading')}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <a href="/" className="flex items-center space-x-2 sm:space-x-3">
                <img 
                  src="/lovable-uploads/logo-blanc-sans-fond.png"
                  alt="Global Drip Studio"
                  className="h-6 sm:h-8 object-contain"
                />
              </a>
              <a href="/">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">← {t('nav.backHome')}</span>
                  <span className="sm:hidden">← {t('nav.backHomeShort')}</span>
                </Button>
              </a>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/50 hover:border-border"
              aria-label="Switch language"
            >
              <span className={i18n.language === 'fr' ? 'text-foreground font-bold' : ''}>FR</span>
              <span className="text-muted-foreground/40">|</span>
              <span className={i18n.language === 'en' ? 'text-foreground font-bold' : ''}>EN</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-10 sm:py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            {t('projects.title')} <span className="hero-text">{t('projects.titleHighlight')}</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('projects.subtitle')}
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className={`py-6 sm:py-8 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
          {projects.map((project, projectIndex) => {
            // Calculate card position for parallax
            const cardRef = useRef<HTMLDivElement>(null);
            const [cardTop, setCardTop] = useState(0);
            const [isVisible, setIsVisible] = useState(false);
            
            useEffect(() => {
              if (cardRef.current) {
                const rect = cardRef.current.getBoundingClientRect();
                const scrollTop = window.scrollY;
                setCardTop(rect.top + scrollTop);
                setIsVisible(rect.top < window.innerHeight && rect.bottom > 0);
              }
            }, [scrollY]);

            // Calculate parallax only when card is visible
            const parallaxOffset = isVisible ? (scrollY - cardTop + window.innerHeight / 2) * 0.1 : 0;
            const clampedParallax = Math.max(-40, Math.min(40, parallaxOffset));
            
            // Horizontal slide for right images - alternating direction (one-way only, no return)
            const slideProgress = isVisible ? Math.min(1, Math.max(0, (scrollY - cardTop + window.innerHeight * 0.7) / (window.innerHeight * 1.2))) : 0;
            const slideDirection = projectIndex % 2 === 0 ? 1 : -1; // Even: left-to-right, Odd: right-to-left
            const maxSlide = 15; // Reduced amplitude: 15px max
            const horizontalOffset = slideProgress * maxSlide * slideDirection;

            return (
            <div key={project.id} ref={cardRef} className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              {/* Project Card */}
              <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[280px] sm:min-h-[350px] lg:h-[400px]">
                  {/* Left Image - Artist Photo with Vertical Parallax */}
                  <div 
                    className="lg:col-span-2 relative overflow-hidden group min-h-[200px] sm:min-h-[280px] lg:h-full"
                    onMouseEnter={() => setHoveredProject(project.id)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    <div 
                      className="absolute inset-[-10%] sm:inset-[-20%] w-[120%] sm:w-[140%] h-[120%] sm:h-[140%] transition-all duration-500 ease-out"
                      style={{
                        backgroundImage: `url(${project.leftImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: project.leftImagePosition || 'center',
                        transform: isVisible ? `translateY(${clampedParallax}px)` : 'translateY(0px)',
                      }}
                    />
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 transition-all duration-500 ${
                      hoveredProject === project.id 
                        ? 'bg-gradient-to-r from-background/50 via-background/20 to-transparent' 
                        : 'bg-gradient-to-r from-background/70 via-background/30 to-transparent'
                    }`} />
                    
                    {/* Content */}
                    <div className={`absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8 transition-all duration-500 ${
                      hoveredProject === project.id ? 'translate-y-[-8px]' : ''
                    }`}>
                      <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-4 transition-all duration-300 ${
                        hoveredProject === project.id ? 'scale-[1.02]' : ''
                      }`}>
                        {project.name}
                      </h2>
                      <p className={`mb-3 sm:mb-6 max-w-xl text-sm sm:text-base transition-all duration-300 ${
                        hoveredProject === project.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {t(`projects.cards.${project.id}.description`)}
                      </p>
                      <Collapsible 
                        open={expandedProjects.has(project.id)}
                        onOpenChange={() => toggleProject(project.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`w-fit bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-xs sm:text-sm ${
                              hoveredProject === project.id ? 'shadow-lg shadow-primary/25' : ''
                            }`}
                          >
                            {t('projects.learnMore', 'En savoir plus')}
                            <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 transition-transform duration-300 ${
                              expandedProjects.has(project.id) ? 'rotate-180' : ''
                            }`} />
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    </div>
                  </div>

                  {/* Right Image - Project Cover with Horizontal Slide - Hidden on mobile */}
                  <div className="hidden lg:block relative overflow-hidden group/right cursor-pointer h-full">
                    {/* Image sized precisely to cover the slide distance */}
                    <div 
                      className="absolute transition-all duration-700 ease-out"
                      style={{ 
                        // Extend only by the exact slide amount needed (15px each side = 30px total)
                        left: slideDirection === 1 ? `-${maxSlide}px` : '0',
                        right: slideDirection === -1 ? `-${maxSlide}px` : '0',
                        top: '0',
                        bottom: '0',
                        width: `calc(100% + ${maxSlide}px)`,
                        backgroundImage: `url(${project.rightImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: `translateX(${horizontalOffset}px)`,
                      }}
                    />
                    {/* Seamless gradient blend with left image */}
                    <div className="absolute left-0 top-0 bottom-0 w-[60px] bg-gradient-to-r from-card via-card/40 to-transparent pointer-events-none z-10" />
                    {/* Subtle vignette overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/20 group-hover/right:from-background/30 transition-all duration-500" />
                    {/* Interactive glow on hover */}
                    <div className="absolute inset-0 bg-primary/0 group-hover/right:bg-primary/10 transition-all duration-500" />
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.3)] group-hover/right:shadow-[inset_0_0_40px_rgba(0,0,0,0.2)] transition-all duration-500" />
                  </div>
                </div>

                {/* Expandable Content */}
                <Collapsible 
                  open={expandedProjects.has(project.id)}
                  onOpenChange={() => toggleProject(project.id)}
                >
                  <CollapsibleContent className="border-t border-border/50">
                    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-muted/20 to-background">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Details */}
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t('projects.ourCollaboration', 'Notre collaboration')}</h3>
                          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                            {t(`projects.cards.${project.id}.collaborationDetails`)}
                          </p>
                          
                          <div className="mb-4 sm:mb-6">
                            <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">{t('projects.servicesProvided')}</h4>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {(t(`projects.cards.${project.id}.services`, { returnObjects: true }) as string[]).map((service: string, index: number) => (
                                <span 
                                  key={index}
                                  className="px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/20 text-primary rounded-full text-xs sm:text-sm font-medium"
                                >
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Spotify/YouTube Player */}
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t('projects.listen', 'Écouter')}</h3>
                          {project.spotifyEmbed ? (
                            <div className="bg-card rounded-lg p-4 border border-border/50">
                              <SpotifyEmbed embedHtml={project.spotifyEmbed} />
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
                                {t('projects.listenOn', 'Écouter sur')} Spotify
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
          );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-10 sm:py-16 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
              {t('projects.readyToJoin', 'Prêt à rejoindre nos')} <span className="hero-text">{t('projects.collaborationsWord', 'collaborations')}</span> ?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
              {t('projects.readyDesc', 'Chaque projet est unique. Parlons de votre vision musicale et créons ensemble quelque chose d\'extraordinaire.')}
            </p>
            <a href="/#contact">
              <Button size="lg" className="studio-button text-sm sm:text-base">
                {t('projects.startProject', 'Démarrer un projet')}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projets;