import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, TrendingDown, Clock, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const ComprendreCompression = () => {
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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/blog" className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/logo-blanc-sans-fond.png"
                alt="Global Drip Studio"
                className="h-8 object-contain"
              />
            </Link>
            <Link to="/blog">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au blog
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
              <Badge className="bg-secondary text-secondary-foreground mb-4">
                <Zap className="w-4 h-4 mr-2" />
                Techniques
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Comprendre la <span className="hero-text">compression</span> en 5 minutes
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              La compression démystifiée : maîtrisez cet outil indispensable pour contrôler la dynamique
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Global Drip Studio • 10 décembre 2024 • 5 min de lecture</span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-12 rounded-2xl overflow-hidden">
            <img 
              src="/lovable-uploads/5974c219-5112-499f-b5dd-3c09bc04df1a.png"
              alt="Compresseur audio professionnel"
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-gradient-hero rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-center">Qu'est-ce que la compression ?</h2>
              <p className="text-center text-muted-foreground">
                La compression réduit automatiquement le volume des signaux qui dépassent un seuil défini. Elle contrôle la dynamique en rapprochant les sons forts des sons faibles, créant un mixage plus cohérent et puissant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <TrendingDown className="w-8 h-8 text-primary mr-3" />
                    <h3 className="text-xl font-bold">Ratio</h3>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    <strong>Définit l'intensité de la compression</strong>
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 2:1 = Compression légère</li>
                    <li>• 4:1 = Compression moyenne</li>
                    <li>• 8:1 = Compression forte</li>
                    <li>• ∞:1 = Limiteur</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Settings className="w-8 h-8 text-secondary mr-3" />
                    <h3 className="text-xl font-bold">Threshold</h3>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    <strong>Seuil de déclenchement</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Niveau à partir duquel la compression s'active. Plus il est bas, plus de signal sera compressé.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-border">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-primary" />
                  Les paramètres temporels
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary">Attack (Attaque)</h3>
                    <p className="text-muted-foreground mb-3">
                      Vitesse de réaction du compresseur quand le signal dépasse le seuil.
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <strong>Rapide (0.1-10ms) :</strong> Contrôle des transitoires</li>
                      <li>• <strong>Lente (10-100ms) :</strong> Préserve le punch</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-secondary">Release (Relâchement)</h3>
                    <p className="text-muted-foreground mb-3">
                      Temps nécessaire pour revenir au volume normal.
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <strong>Court (10-100ms) :</strong> Son percutant</li>
                      <li>• <strong>Long (100ms-2s) :</strong> Son naturel</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-hero border-border">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Knee (Courbure)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Hard Knee</h3>
                    <p className="text-muted-foreground">
                      Compression immédiate et précise dès que le seuil est atteint. Idéal pour un contrôle strict de la dynamique.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Soft Knee</h3>
                    <p className="text-muted-foreground">
                      Compression progressive et naturelle. Plus musical, moins perceptible à l'oreille.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold mb-6 mt-12">Applications pratiques</h2>

            <div className="space-y-6 mb-12">
              <Card className="border-primary/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">🎤 Voix</h3>
                  <p className="text-muted-foreground">
                    <strong>Ratio :</strong> 3:1 à 6:1 • <strong>Attack :</strong> Lente (10-30ms) • <strong>Release :</strong> Moyenne (100-300ms)
                    <br />Pour contrôler les variations de niveau et maintenir l'intelligibilité.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-secondary/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">🥁 Batterie</h3>
                  <p className="text-muted-foreground">
                    <strong>Ratio :</strong> 4:1 à 10:1 • <strong>Attack :</strong> Rapide (1-5ms) • <strong>Release :</strong> Courte (50-200ms)
                    <br />Pour contrôler les transitoires tout en préservant le punch.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">🎸 Basse</h3>
                  <p className="text-muted-foreground">
                    <strong>Ratio :</strong> 3:1 à 8:1 • <strong>Attack :</strong> Moyenne (5-15ms) • <strong>Release :</strong> Longue (200ms-1s)
                    <br />Pour égaliser le niveau et maintenir la fondation rythmique.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">Le secret du Global Drip Studio</h3>
              <p className="text-muted-foreground mb-6">
                La compression n'est pas qu'une question de paramètres techniques. C'est un outil créatif qui donne du caractère à votre son. L'expérience et l'écoute critique sont essentielles pour maîtriser cet art.
              </p>
              <p className="text-muted-foreground mb-6 italic">
                "Une compression bien réglée, c'est comme un bon bassiste : on ne l'entend pas forcément, mais sans elle, il manque quelque chose d'essentiel."
              </p>
              <Link to="/#contact">
                <Button className="studio-button">
                  Découvrir nos services de mixage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ComprendreCompression;