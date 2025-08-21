import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Headphones, 
  Mic, 
  Settings, 
  Zap, 
  Monitor, 
  HardDrive,
  Cpu,
  Volume2 
} from "lucide-react";

const Equipment = () => {
  const equipmentCategories = [
    {
      title: "Consoles de Mixage",
      icon: Settings,
      items: [
        { name: "SSL AWS 948", type: "Console analogique", status: "premium" },
        { name: "Neve 88R", type: "Console large format", status: "premium" },
        { name: "API 1608-II", type: "Console boutique", status: "new" }
      ]
    },
    {
      title: "Microphones",
      icon: Mic,
      items: [
        { name: "Neumann U87 Ai", type: "Condensateur", status: "classic" },
        { name: "AKG C414 XLS", type: "Multi-pattern", status: "premium" },
        { name: "Shure SM7B", type: "Dynamique", status: "standard" }
      ]
    },
    {
      title: "Écoute de Référence",
      icon: Headphones,
      items: [
        { name: "Yamaha NS-10M", type: "Near-field", status: "classic" },
        { name: "Genelec 8351B", type: "Tri-amplifiées", status: "premium" },
        { name: "Barefoot MM27", type: "Main monitors", status: "new" }
      ]
    },
    {
      title: "Traitement Analogique",
      icon: Zap,
      items: [
        { name: "1176 Rev A", type: "Compresseur", status: "vintage" },
        { name: "Pultec EQP-1A", type: "Égaliseur", status: "vintage" },
        { name: "Lexicon 480L", type: "Reverb", status: "classic" }
      ]
    },
    {
      title: "Audio Numérique",
      icon: HardDrive,
      items: [
        { name: "Pro Tools HDX", type: "DAW System", status: "premium" },
        { name: "Antelope Galaxy 64", type: "Interface", status: "new" },
        { name: "Universal Audio Apollo", type: "Processing", status: "premium" }
      ]
    },
    {
      title: "Acoustique Studio",
      icon: Volume2,
      items: [
        { name: "Primacoustic", type: "Traitement acoustique", status: "standard" },
        { name: "Auralex Studiofoam", type: "Absorption", status: "standard" },
        { name: "GIK Acoustics", type: "Bass traps", status: "premium" }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "premium": return "bg-primary text-primary-foreground";
      case "vintage": return "bg-secondary text-secondary-foreground";
      case "new": return "bg-accent text-accent-foreground";
      case "classic": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "premium": return "Premium";
      case "vintage": return "Vintage";
      case "new": return "Nouveau";
      case "classic": return "Classique";
      default: return "Standard";
    }
  };

  return (
    <section id="equipement" className="py-24 bg-muted/10">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Notre <span className="hero-text">Équipement</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Un parc technique exceptionnel alliant le meilleur de l'analogique vintage 
            et les dernières innovations numériques
          </p>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {equipmentCategories.map((category, categoryIndex) => (
            <Card 
              key={category.title} 
              className="equipment-card group"
              style={{ animationDelay: `${categoryIndex * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center mr-3 animate-equipment-float">
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  {category.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div 
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors duration-300"
                    >
                      <div>
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.type}</div>
                      </div>
                      <Badge className={`${getStatusColor(item.status)} text-xs`}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technical Specs */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-hero border border-border">
          <h3 className="text-2xl font-bold text-center mb-8">Spécifications Techniques</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary mb-2">192 kHz</div>
              <div className="text-sm text-muted-foreground">Fréquence d'échantillonnage</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-secondary mb-2">32-Bit</div>
              <div className="text-sm text-muted-foreground">Résolution audio</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <HardDrive className="w-8 h-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary mb-2">128</div>
              <div className="text-sm text-muted-foreground">Pistes simultanées</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-secondary mb-2">-130dB</div>
              <div className="text-sm text-muted-foreground">Plancher de bruit</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Equipment;