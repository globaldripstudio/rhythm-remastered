import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Phone, Mail, MapPin, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const ComprendreCompression = () => {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Comprendre la compression en 5 minutes | Global Drip Studio";
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = "La compression démystifiée : ratio, attack, release, knee. Guide complet pour maîtriser cet outil indispensable du mixage audio professionnel.";
      document.head.appendChild(m);
    } else {
      meta.setAttribute('content', "La compression démystifiée : ratio, attack, release, knee. Guide complet pour maîtriser cet outil indispensable du mixage audio professionnel.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - matching other blog articles */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                <img 
                  src="/lovable-uploads/logo-blanc-sans-fond.png"
                  alt="Global Drip Studio"
                  className="h-6 sm:h-8 object-contain"
                />
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

      {/* Article */}
      <article className="py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header */}
          <header className="mb-8 sm:mb-12">
            <div className="mb-4 sm:mb-6">
              <Badge className="bg-secondary text-secondary-foreground mb-4">
                <Zap className="w-4 h-4 mr-2" />
                Techniques
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Comprendre la <span className="hero-text">compression</span> en cinq minutes
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-6">
              La compression démystifiée : ratio, attack, release, knee. Apprenez à utiliser cet outil indispensable pour contrôler la dynamique de vos enregistrements.
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Global Drip Studio • 10 décembre 2024 • 5 min de lecture</span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-8 sm:mb-12 rounded-2xl overflow-hidden">
            <img 
              src="/lovable-uploads/Image-23.jpg"
              alt="Compresseur audio professionnel"
              className="w-full h-48 sm:h-64 md:h-96 object-cover"
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-foreground">
            <p className="text-base sm:text-lg mb-6">
              La compression fait partie des outils qui séparent un son simplement correct d'un son vraiment tenu, lisible et professionnel. En studio, elle sert à stabiliser une performance, à calmer les écarts de niveau, et à mettre une source à la bonne distance dans le mix. Elle peut être invisible quand elle est bien réglée, ou au contraire devenir un choix esthétique quand on veut assumer un caractère.
            </p>

            <div className="bg-gradient-hero rounded-2xl p-6 sm:p-8 mb-8">
              <p className="text-center text-muted-foreground font-medium">
                Si vous devez retenir une seule idée, c'est celle-ci : un compresseur ne rend pas un son meilleur par magie, il rend un son plus contrôlable. Et quand un signal est contrôlable, il se place mieux, il s'entend mieux, et il s'intègre mieux avec le reste.
              </p>
            </div>

            <p className="mb-6">
              Pour comprendre la compression rapidement, il faut arrêter de la voir comme un bloc mystérieux et la lire comme une phrase simple : à partir d'un certain niveau, le compresseur agit, plus ou moins fort, plus ou moins vite, et plus ou moins doucement.
            </p>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Le seuil, le point de départ</h2>
                <p className="text-muted-foreground mb-4">
                  Avant même de parler de ratio, il faut comprendre le seuil. Le seuil est le niveau à partir duquel la compression commence à travailler. Tant que le signal reste en dessous, le compresseur ne fait rien. Dès que le signal dépasse, il réduit le niveau selon les réglages.
                </p>
                <p className="text-muted-foreground">
                  Le seuil répond à une question très concrète : est-ce que vous voulez seulement tenir les pics qui dépassent, ou est-ce que vous voulez contrôler une bonne partie de la performance ? Plus le seuil est bas, plus le compresseur intervient souvent, et plus l'effet de contrôle devient présent.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Le ratio, la quantité de contrôle</h2>
                <p className="text-muted-foreground mb-4">
                  Le ratio dit à quel point le compresseur réduit ce qui dépasse le seuil. Un ratio doux donne un contrôle subtil. Un ratio plus élevé donne un contrôle plus ferme, avec un effet généralement plus évident.
                </p>
                <p className="text-muted-foreground">
                  Il faut le voir comme une promesse : une fois que le signal a franchi le seuil, le ratio décide de la sévérité. C'est un réglage de comportement, pas un réglage de volume. Si vous cherchez de la transparence, un ratio modéré est souvent plus facile à rendre musical. Si vous cherchez une source très tenue, un ratio plus élevé peut aider, mais il demande une écoute plus attentive pour éviter de figer la performance.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-border">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">L'attack, la manière d'attraper l'attaque</h2>
                <p className="text-muted-foreground mb-4">
                  L'attack, c'est la vitesse à laquelle le compresseur réagit quand le signal dépasse le seuil. C'est l'un des réglages les plus influents sur la sensation de punch et de précision.
                </p>
                <p className="text-muted-foreground mb-4">
                  Quand l'attack est rapide, le compresseur attrape immédiatement le début du son. Cela peut lisser les transitoires et donner une sensation plus serrée, parfois plus dense. Quand l'attack est plus lente, le tout début du son a le temps de passer avant que la réduction ne s'installe. Cela conserve davantage l'impact et la présence naturelle.
                </p>
                <p className="text-muted-foreground">
                  En studio, ce réglage se ressent plus qu'il ne se mesure. Si une source perd son énergie et son relief, l'attack est souvent trop rapide. Si au contraire les attaques restent trop agressives et sortent du mix, l'attack est peut-être trop lente, ou le seuil trop haut pour que le compresseur fasse réellement son travail.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Le release, la respiration du compresseur</h2>
                <p className="text-muted-foreground mb-4">
                  Le release, c'est la vitesse à laquelle le compresseur relâche la réduction après avoir compressé. C'est lui qui donne la sensation de respiration, de mouvement, ou parfois de pompage.
                </p>
                <p className="text-muted-foreground mb-4">
                  Un release trop court peut rendre le traitement nerveux et audible, surtout sur des sons riches en graves. Un release trop long peut retenir la source, comme si elle n'arrivait jamais à revenir à son niveau naturel, ce qui peut aplatir la musicalité.
                </p>
                <p className="text-muted-foreground">
                  Le bon release est celui qui suit le phrasé et la dynamique du morceau. Quand il est bien réglé, la compression paraît naturelle. Quand il est mal réglé, on entend une variation de niveau qui n'a rien à voir avec l'intention musicale.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Le knee, la douceur d'entrée en compression</h2>
                <p className="text-muted-foreground mb-4">
                  Le knee décrit comment la compression s'installe autour du seuil. Avec un knee doux, la transition est progressive, la compression arrive de manière plus discrète. Avec un knee plus dur, la transition est franche, ce qui peut donner un effet plus affirmé.
                </p>
                <p className="text-muted-foreground">
                  Pour une voix ou une source que vous voulez tenir sans attirer l'attention sur le traitement, un knee doux est souvent plus facile à intégrer. Pour un son qui doit être plus incisif et assumé, un knee plus dur peut être un choix pertinent. Là encore, il ne s'agit pas de mieux ou moins bien, mais d'intention.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-hero border-border">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Le bon réflexe en studio : comparer à niveau égal</h2>
                <p className="text-muted-foreground mb-4">
                  La compression donne souvent l'impression que c'est mieux simplement parce que c'est plus fort après traitement. Pour juger correctement, il faut comparer à niveau égal, en ajustant le gain de sortie.
                </p>
                <p className="text-muted-foreground">
                  À ce moment-là, vous entendez la vraie différence, celle qui compte : est-ce que la source est plus stable ? Est-ce qu'elle se place mieux ? Est-ce que la diction est plus lisible ? Est-ce que le jeu est plus cohérent ? Un compresseur bien réglé donne une sensation de maîtrise. Il réduit les surprises, sans enlever la vie.
                </p>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 sm:p-8 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Ce que vous savez maintenant faire en cinq minutes</h3>
              <p className="text-muted-foreground mb-4">
                Vous savez lire un compresseur comme une logique simple : le seuil décide quand il agit, le ratio décide combien il agit, l'attack décide s'il laisse passer l'attaque, le release décide comment il relâche, le knee décide comment il entre en action.
              </p>
              <p className="text-muted-foreground">
                À partir de là, la compression devient un outil de studio normal, au même titre qu'un bon gain staging, un placement dans la chaîne de traitement, ou une décision de bus. Et c'est exactement ce qu'elle doit être : un levier fiable pour contrôler la dynamique de vos enregistrements, de vos pistes et de votre mix.
              </p>
            </div>

            <div className="bg-gradient-hero rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Vous voulez un rendu studio sur vos prises ou votre mix ?</h3>
              <p className="text-muted-foreground mb-6">
                Si vous voulez aller plus vite et plus loin, le plus efficace reste de travailler sur de la matière réelle, dans un environnement de studio, avec une écoute fiable et des décisions assumées. Pour une session d'enregistrement, un mixage ou un mastering, vous pouvez réserver ou me contacter directement.
              </p>
              <Button 
                className="studio-button"
                onClick={() => setContactModalOpen(true)}
              >
                Demande de réservation
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Contact Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="max-w-lg p-0 overflow-visible bg-card border-border">
          <DialogTitle className="sr-only">Demande de réservation</DialogTitle>
          <button
            onClick={() => setContactModalOpen(false)}
            className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-[60] w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <img 
                src="/lovable-uploads/logo-blanc-sans-fond.png"
                alt="Global Drip Studio"
                className="h-10 sm:h-12 mx-auto mb-4"
              />
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Global Drip Studio</h3>
              <p className="text-sm sm:text-base text-muted-foreground italic">
                Passion audio & Innovation constante
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a 
                  href="tel:+33659797342" 
                  className="text-sm sm:text-base hover:text-primary transition-colors"
                >
                  +33 6 59 79 73 42
                </a>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a 
                  href="mailto:globaldripstudio@gmail.com" 
                  className="text-sm sm:text-base hover:text-primary transition-colors break-all"
                >
                  globaldripstudio@gmail.com
                </a>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base">
                  8 Allée des Ajoncs, 13500 Martigues
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <Link to="/#contact" onClick={() => setContactModalOpen(false)}>
                <Button className="w-full studio-button">
                  Accéder au formulaire de contact
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprendreCompression;
