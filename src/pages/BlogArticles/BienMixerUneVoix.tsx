import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Headphones, Volume2, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const BienMixerUneVoix = () => {
  useEffect(() => {
    document.title = "Bien mixer une voix : les 7 étapes essentielles | Global Drip Studio";
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = "Maîtrisez l'art du mixage vocal avec ces 7 étapes professionnelles. Techniques d'égalisation, compression et effets pour sublimer vos enregistrements vocaux.";
      document.head.appendChild(m);
    } else {
      meta.setAttribute('content', "Maîtrisez l'art du mixage vocal avec ces 7 étapes professionnelles. Techniques d'égalisation, compression et effets pour sublimer vos enregistrements vocaux.");
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
      <article className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <header className="mb-12">
            <div className="mb-6">
              <Badge className="bg-primary text-primary-foreground mb-4">
                <Headphones className="w-4 h-4 mr-2" />
                Mixage
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Bien mixer une voix : les <span className="hero-text">7 étapes essentielles</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Maîtrisez l'art du mixage vocal avec ces techniques professionnelles utilisées dans notre studio
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Global Drip Studio • 15 décembre 2024 • 6 min de lecture</span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-12 rounded-2xl overflow-hidden">
            <img 
              src="/lovable-uploads/_edited.jpg.png"
              alt="Console de mixage professionnel au Global Drip Studio"
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-8 italic">
              La voix est l'élément central de la plupart des productions musicales. Un mixage vocal réussi peut transformer une chanson ordinaire en hit mémorable. Voici les 7 étapes essentielles que nous appliquons au Global Drip Studio.
            </p>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-primary" />
                  1. Nettoyage et édition
                </h2>
                <p className="text-muted-foreground">
                  Avant tout traitement, supprimez les bruits parasites, les respirations indésirables et corrigez la synchronisation. Utilisez un noise gate pour éliminer les bruits de fond entre les phrases. Cette étape détermine la qualité de base de votre mixage.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">2. Égalisation (EQ)</h2>
                <p className="text-muted-foreground mb-4">
                  L'EQ est votre meilleur allié pour sculpter le timbre vocal :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>80-200 Hz :</strong> Coupez les fréquences graves inutiles</li>
                  <li><strong>200-800 Hz :</strong> Zone critique pour la chaleur et la boxiness</li>
                  <li><strong>2-5 kHz :</strong> Présence et intelligibilité</li>
                  <li><strong>8-12 kHz :</strong> Air et brillance</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">3. Compression</h2>
                <p className="text-muted-foreground">
                  La compression contrôle la dynamique et assure la consistance. Utilisez un ratio de 3:1 à 6:1, avec une attaque lente (10-30ms) pour préserver les transitoires et un release adapté au tempo (100-300ms). Visez 3-6 dB de réduction de gain.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">4. De-esser</h2>
                <p className="text-muted-foreground">
                  Atténuez les sibilantes (S, T, F) sans ternir la voix. Ciblez la plage 4-8 kHz avec un de-esser multiband ou un EQ dynamique. L'objectif : réduire les sifflements tout en préservant la clarté.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">5. Saturation harmonique</h2>
                <p className="text-muted-foreground">
                  Ajoutez de la couleur avec une saturation subtile. Une émulation de tube ou de ruban apporte chaleur et caractère. Restez subtil : 5-15% de saturation suffisent pour enrichir le timbre sans dénaturer la voix.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Volume2 className="w-6 h-6 mr-3 text-secondary" />
                  6. Effets temporels
                </h2>
                <p className="text-muted-foreground mb-4">
                  Créez l'espace et la profondeur :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Reverb :</strong> Hall, plate ou room selon l'ambiance souhaitée</li>
                  <li><strong>Delay :</strong> Echo subtil (1/8 ou 1/4 de note) pour l'épaisseur</li>
                  <li><strong>Chorus/Doubling :</strong> Élargissement stéréo avec modération</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">7. Placement dans le mix</h2>
                <p className="text-muted-foreground">
                  Positionnez la voix au centre du panorama stéréo et trouvez le niveau optimal par rapport aux instruments. Utilisez l'automation pour maintenir la présence constante et créer des variations d'intensité selon les sections de la chanson.
                </p>
              </CardContent>
            </Card>

            <div className="bg-gradient-hero rounded-2xl p-8 mt-12">
              <h3 className="text-2xl font-bold mb-4">Conseil pro du Global Drip Studio</h3>
              <p className="text-muted-foreground mb-4">
                Le mixage vocal est un art qui demande de l'expérience et des références de qualité. Chaque voix est unique et nécessite une approche personnalisée. N'hésitez pas à expérimenter et à faire confiance à vos oreilles.
              </p>
              <Link to="#contact">
                <Button className="studio-button">
                  Réserver une session de mixage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BienMixerUneVoix;