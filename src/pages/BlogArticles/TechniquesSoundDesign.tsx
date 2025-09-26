import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Waves, Mic, Volume2, Layers, Zap, Sparkles, Radio, Target, Headphones, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const TechniquesSoundDesign = () => {
  useEffect(() => {
    document.title = "10 techniques de sound design pour créer des ambiances uniques | Global Drip Studio";
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = "Explorez 10 techniques avancées de sound design : field recording, granular synthesis, convolution reverb. Créez des univers sonores immersifs et uniques.";
      document.head.appendChild(m);
    } else {
      meta.setAttribute('content', "Explorez 10 techniques avancées de sound design : field recording, granular synthesis, convolution reverb. Créez des univers sonores immersifs et uniques.");
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
              <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground mb-4">
                <Waves className="w-4 h-4 mr-2" />
                Sound Design
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="hero-text">10 techniques</span> de sound design pour créer des ambiances uniques
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Explorez les techniques avancées de création sonore pour des univers immersifs et originaux
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Global Drip Studio • 5 décembre 2024 • 9 min de lecture</span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-12 rounded-2xl overflow-hidden">
            <img 
              src="/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png"
              alt="Setup de sound design au Global Drip Studio"
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          {/* Introduction */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-gradient-hero rounded-2xl p-8 mb-12">
              <p className="text-lg text-center italic mb-4">
                Le sound design ne se contente pas d'habiller une production : il crée des émotions, transporte l'auditeur et donne une identité unique à votre œuvre.
              </p>
              <p className="text-center text-muted-foreground">
                Voici 10 techniques professionnelles que nous utilisons au Global Drip Studio pour créer des univers sonores marquants.
              </p>
            </div>

            {/* Technique 1 */}
            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Mic className="w-8 h-8 text-primary mr-4" />
                  <h2 className="text-2xl font-bold">1. Field Recording & Sampling</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Capturer des sons du monde réel pour créer des textures authentiques et organiques.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Enregistrez des environnements naturels (forêt, océan, ville)</li>
                  <li>Exploitez les sons d'objets du quotidien transformés</li>
                  <li>Manipulez la vitesse de lecture pour des effets dramatiques</li>
                  <li>Layering de plusieurs prises pour enrichir la texture</li>
                </ul>
              </CardContent>
            </Card>

            {/* Technique 2 */}
            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Sparkles className="w-8 h-8 text-secondary mr-4" />
                  <h2 className="text-2xl font-bold">2. Granular Synthesis</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Décomposez et recomposez le son au niveau microscopique pour des textures évolutives.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <h4 className="font-semibold mb-2">Paramètres clés :</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Grain size (1-100ms)</li>
                      <li>Grain density</li>
                      <li>Position randomization</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Applications :</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Pads éthérés</li>
                      <li>Transitions organiques</li>
                      <li>Textures évolutives</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technique 3 */}
            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-border">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Volume2 className="w-8 h-8 text-primary mr-4" />
                  <h2 className="text-2xl font-bold">3. Convolution Reverb</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Utilisez des impulses responses d'espaces réels pour placer vos sons dans des environnements impossibles.
                </p>
                <div className="bg-background/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground italic">
                    "Imaginez faire résonner une voix dans une cathédralisée gothique, un hangar industriel ou même... un piano à queue !"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Technique 4 */}
            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Layers className="w-8 h-8 text-secondary mr-4" />
                  <h2 className="text-2xl font-bold">4. Spectral Processing</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Manipulez le contenu fréquentiel en temps réel pour des transformations radicales.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Spectral freeze :</strong> Figez des harmoniques dans le temps</li>
                  <li><strong>Spectral blur :</strong> Créez des fondus fréquentiels</li>
                  <li><strong>Spectral shift :</strong> Décalez les formants pour des voix aliénées</li>
                </ul>
              </CardContent>
            </Card>

            {/* Technique 5 */}
            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Radio className="w-8 h-8 text-primary mr-4" />
                  <h2 className="text-2xl font-bold">5. Modulation créative</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Utilisez des LFO, enveloppes et séquenceurs pour animer vos textures sonores.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <h4 className="font-semibold mb-2">LFO</h4>
                    <p className="text-muted-foreground">Oscillations lentes pour le mouvement</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <h4 className="font-semibold mb-2">S&H</h4>
                    <p className="text-muted-foreground">Sample & Hold pour la randomisation</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Enveloppes</h4>
                    <p className="text-muted-foreground">Contrôle précis des paramètres</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technique 6 */}
            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Zap className="w-8 h-8 text-secondary mr-4" />
                  <h2 className="text-2xl font-bold">6. Distortion créative</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Au-delà de la saturation classique, explorez les modes de distorsion alternatifs.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Bitcrushing :</strong> Réduction de résolution numérique</li>
                  <li><strong>Ring modulation :</strong> Multiplication de fréquences</li>
                  <li><strong>Waveshaping :</strong> Déformation mathématique du signal</li>
                </ul>
              </CardContent>
            </Card>

            {/* Technique 7 */}
            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-border">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Target className="w-8 h-8 text-primary mr-4" />
                  <h2 className="text-2xl font-bold">7. Spatial Audio & Binaural</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Créez des expériences immersives en 3D pour casques et systèmes surround.
                </p>
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Techniques avancées :</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>HRTF (Head-Related Transfer Function)</li>
                    <li>Ambisonic encoding/decoding</li>
                    <li>Distance modeling avec filtrage et délai</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Technique 8 */}
            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Headphones className="w-8 h-8 text-secondary mr-4" />
                  <h2 className="text-2xl font-bold">8. Psychoacoustique appliquée</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Exploitez les particularités de l'audition humaine pour créer des illusions sonores.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Masquage fréquentiel :</strong> Cachez des éléments dans d'autres</li>
                  <li><strong>Effet Haas :</strong> Illusion de largeur stéréo</li>
                  <li><strong>Tons de Shepard :</strong> Montée infinie apparente</li>
                </ul>
              </CardContent>
            </Card>

            {/* Technique 9 */}
            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Settings className="w-8 h-8 text-primary mr-4" />
                  <h2 className="text-2xl font-bold">9. Réinjection & Feedback</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Créez des boucles contrôlées pour générer des textures évolutives et complexes.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Applications créatives :</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>Délais résonnants</li>
                      <li>Filtres auto-oscillants</li>
                      <li>Boucles de traitement</li>
                    </ul>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground italic">
                      ⚠️ Attention : contrôlez toujours le gain pour éviter les saturations destructives !
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technique 10 */}
            <Card className="mb-12 bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Waves className="w-8 h-8 text-secondary mr-4" />
                  <h2 className="text-2xl font-bold">10. Morphing & Interpolation</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Transformez graduellement un son en un autre pour des transitions organiques.
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Méthodes de morphing :</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li><strong>Spectral morphing :</strong> Interpolation dans le domaine fréquentiel</li>
                      <li><strong>Cross-synthesis :</strong> Combinaison de deux sources</li>
                      <li><strong>Envelope following :</strong> Transfer de dynamique entre sources</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conclusion */}
            <div className="bg-gradient-hero rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">L'art du sound design au Global Drip Studio</h3>
              <p className="text-muted-foreground mb-6 text-center">
                Ces techniques ne sont que des outils. La véritable magie naît de l'expérimentation, de l'intuition créative et de l'écoute attentive. Au Global Drip Studio, nous combinons expertise technique et vision artistique pour créer des univers sonores qui marquent les esprits.
              </p>
              <div className="text-center space-y-4">
                <p className="text-muted-foreground italic">
                  "Le sound design, c'est peindre avec le son. Chaque texture raconte une histoire, chaque ambiance évoque une émotion."
                </p>
                <Link to="/#contact">
                  <Button className="studio-button">
                    Collaborer sur votre projet sound design
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default TechniquesSoundDesign;