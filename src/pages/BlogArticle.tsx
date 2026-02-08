import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User, Eye } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { trackBlogView } from "@/hooks/useBlogViews";
import ComprendreCompression from "./BlogArticles/ComprendreCompression";
const BlogArticle = () => {
  const {
    slug
  } = useParams();
  const [viewCount, setViewCount] = useState<number | null>(null);

  // Track view on mount
  useEffect(() => {
    if (slug && !["bien-mixer-une-voix", "10-techniques-sound-design"].includes(slug)) {
      trackBlogView(slug).then(count => {
        if (count) setViewCount(count);
      });
    }
  }, [slug]);

  // Article content based on slug
  const getArticle = () => {
    if (slug === "venin-le-premier-sang") {
      return {
        title: '"Le Premier Sang", le nouvel album du groupe Venin, est enfin disponible',
        author: "Global Drip Studio",
        date: "2024-12-20",
        readTime: "8 min",
        category: "Réalisations",
        content: <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <img src="/lovable-uploads/venin-album-cover.jpg" alt="Album Le Premier Sang de Venin" className="w-full max-w-none h-auto rounded-lg" />
              <p className="text-sm italic text-muted-foreground mt-2 text-center">
                Le double vinyl de l'album "Le Premier Sang" est disponible sur Bandcamp.
              </p>
            </div>

            <p className="mb-6">
              Venin est un groupe de rock français incontournable, né à Marseille en 1983. Alliant l'énergie brute du hard rock à des influences heavy en passant par le blues, Venin inscrit son nom sur la carte de la scène nationale grâce à ses textes chantés en français et son identité musicale singulière. Après une demo tape en 1984 et un premier single remarqué deux ans plus tard, le groupe enchaîne les concerts, partageant régulièrement l'affiche avec des acteurs majeurs du rock français.
            </p>

            <p className="mb-6">
              Malgré une pause à la fin de la décennie, Venin renaît dans les années 2010, retrouvant son public fidèle et une dynamique de création renouvelée. Leur discographie, empreinte d'authenticité et d'une énergie saisissante, fait d'eux une figure emblématique du hard rock hexagonal.
            </p>

            <p className="mb-6">
              Pour leur dernier album, "Le Premier Sang", j'ai eu le plaisir d'accueillir Venin au Global Drip Studio, où j'ai assuré l'édition, le mixage et le mastering des 9 titres inédits, ainsi que l'enregistrement des voix, des parties solo, et quelques arrangements claviers, notamment sur le titre "Dis moi si c'est beau".
            </p>

            <h3 className="text-2xl font-bold mb-4">L'album a été entièrement pensé pour sonner eighties :</h3>

            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Des compositions typiques des grandes années du hard/heavy metal. On y retrouve même une reprise du groupe français Slaughter, "Excalibur", œuvre originale parue en 1986.</li>
              <li>Tous les musiciens ont été enregistrés en même temps, en réseau dans la salle Simone Veil, à Châteauneuf-les-Martigues, par Mathieu Battini ; comme dit précédemment, seules les voix (et quelques solos) ont été enregistrées après, au Global Drip Studio.</li>
              <li>Aucune partie n'a été copiée/collée. Pas un refrain, pas un roulement de batterie, ni même une ligne de basse.</li>
              <li>Pas d'utilisation de trig. Suffisamment rare en 2025 pour avoir à le préciser, mais tel a été le choix du groupe, ce qui contribue grandement à la couleur du projet.</li>
              <li>Une utilisation de microphones allant du classique au haut de gamme. En effet, les guitares ont été enregistrées via des Shure SM57 et Senheiser e906, les voix à l'aide de Griffon Microphones, avec le déjà presque classique couple GMT12 (clone du légendaire AKG C12)/Fuzzyphone. La basse DI a été re-ampée dans une émulation Ampeg.</li>
            </ul>

            <p className="mb-4 font-semibold">La console utilisée pour piloter l'enregistrement est une Yamaha QL1.</p>

            <h4 className="text-xl font-bold mb-4">Concernant la batterie :</h4>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Kick Back (In) : Shure Beta 52A</li>
              <li>Kick Front (Out) : Audix f2</li>
              <li>Snare 1 (Top) : Shure Sm57</li>
              <li>Snare 1 (Bot) : Shure Sm57</li>
              <li>Snare 2 (Top) : Shure Sm 57</li>
              <li>HH : AKG SE 300B</li>
              <li>Tom 1 & 2 (Aigu) : Audix f2</li>
              <li>Tom 3 : Sennheiser E604</li>
              <li>Tom 4 Sennheiser E604</li>
              <li>Tom 5 : Sennheiser E604</li>
              <li>Tom Bass : Audix f6</li>
              <li>Cymbal Ride solo : AKG c535 EB</li>
              <li>OH L/R : 2x Shure Sm 81</li>
            </ul>

            <div className="mb-8">
              <img src="/lovable-uploads/jean-marc-battini.jpg" alt="Jean-Marc Battini en concert" className="w-full max-w-none h-auto rounded-lg" />
              <p className="text-sm italic text-muted-foreground mt-2 text-center">
                Jean-Marc Battini, fondateur de Venin
              </p>
            </div>

            <h4 className="text-xl font-bold mb-4">Voici quelques détails techniques supplémentaires concernant l'enregistrement :</h4>

            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Les guitares rythme ont été enregistrées via trois têtes d'ampli différentes : ENGL GigMaster pour Lionel, et Marshall JVM410H + Hughes&Kettner GranMeister pour Jean-Marc. Les parties solo ont été enregistrés en DI, puis émulées à travers Guitar Rig, afin d'asseoir facilement les lead parts dans des rythmiques puissantes.</li>
              <li>Le bonus track "Extraball", a été composé par Mathieu Battini (et interprétée par lui-même aux côtés de Lionel Bredenbach). Les guitares ont été enregistrées au Global Drip Studio, en double tracking.</li>
            </ul>

            <div className="pl-6 mb-6">
              <p className="mb-2">E-II Standard Horizon (EMG pickups) → Orange Rockerverb MkIII → Unison Pre → Senheiser e906</p>
              <p>E-II Standard Horizon (EMG pickups) → EVH III 5150 Ivory 50w → Neve 1073 Pre → Shure SM57</p>
            </div>

            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Concernant les voix, le GMT12 a été couplé à un Neve 1073 et une compression General Audio Research Sonar, le tout au format 500. Ajoutez-y le Griffon Microphones Fuzzyphone, quelques traitements in the box, et vous obtiendrez cette texture à la fois feutrée et trashy. Les chœurs de Jean-Marc ont aussi été enregistrés de cette manière, mais ceux d'Hélène ont seulement été enregistrés avec le T12 pour apporter un peu de clarté.</li>
              <li>Le kit batterie de Gerald est une Ludwig, et la caisse claire est une Gretsch 4"x6,5" Black Hammered Snare.</li>
            </ul>

            <p className="mb-6">
              Venin poursuit aujourd'hui son aventure musicale, toujours aussi passionné et indépendant, fidèle à l'esprit du rock français.
            </p>

            <p className="mb-6">
              L'album "Le Premier Sang", est disponible à l'écoute sur toutes les plateformes de streaming, mais également en CD et en vinyl, notamment sur le Bandcamp du groupe à l'adresse suivante : <a href="https://venin1.bandcamp.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://venin1.bandcamp.com/</a>
            </p>

            <div className="mb-8">
              <img src="/lovable-uploads/venin-logo.jpg" alt="Logo du groupe Venin" className="w-full max-w-none h-auto rounded-lg bg-black" />
              <p className="text-sm italic text-muted-foreground mt-2 text-center">
                L'emblématique logo du groupe Venin
              </p>
            </div>

            <div className="mb-8">
              
              <p className="text-sm italic text-muted-foreground mt-2 text-center">
            </p>
            </div>
          </div>
      };
    }
    if (slug === "comprendre-la-compression") {
      return {
        title: "Comprendre la compression en 5 minutes",
        author: "Global Drip Studio",
        date: "2024-12-10",
        readTime: "5 min",
        category: "Techniques",
        content: <ComprendreCompression />
      };
    }

    // Default article not found
    return null;
  };
  const article = getArticle();
  if (!article) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article non trouvé</h1>
          <Link to="/blog">
            <Button>Retourner au blog</Button>
          </Link>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header - matching other pages */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                <img src="/lovable-uploads/logo-blanc-sans-fond.png" alt="Global Drip Studio" className="h-6 sm:h-8 object-contain" />
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">← Retour à l'accueil</span>
                  <span className="sm:hidden">← Accueil</span>
                </Button>
              </Link>
            </div>
            <Link to="/blog">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Retour au blog</span>
                <span className="sm:hidden">Blog</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Article Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                {article.category}
              </span>
              {viewCount && <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Eye className="w-3 h-3" />
                  {viewCount} vues
                </span>}
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="text-foreground leading-relaxed">
            {article.content}
          </div>
        </div>
      </article>
    </div>;
};
export default BlogArticle;