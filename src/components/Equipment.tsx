import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
  const equipmentData = {
    microphones: [
      { name: "Neumann U87 Ai", type: "Condensateur large membrane", status: "premium" },
      { name: "AKG C414 XLS", type: "Condensateur multi-pattern", status: "premium" },
      { name: "Shure SM7B", type: "Dynamique broadcast", status: "classic" },
      { name: "Rode NTK", type: "Condensateur à lampe", status: "vintage" },
      { name: "Audio-Technica AT4050", type: "Condensateur multi-pattern", status: "standard" },
      { name: "Electro-Voice RE20", type: "Dynamique broadcast", status: "classic" },
      { name: "Coles 4038", type: "Ruban vintage", status: "vintage" },
      { name: "Royer R-121", type: "Ruban moderne", status: "premium" },
      { name: "Shure SM57", type: "Dynamique polyvalent", status: "standard" },
      { name: "Neumann TLM 103", type: "Condensateur compact", status: "premium" }
    ],
    preamps: [
      { name: "Neve 1073", type: "Préampli vintage", status: "vintage" },
      { name: "API 3124+", type: "Préampli 4 canaux", status: "premium" },
      { name: "Universal Audio 610", type: "Préampli à lampe", status: "vintage" },
      { name: "Focusrite ISA430", type: "Préampli/processeur", status: "premium" },
      { name: "Great River MP-500", type: "Préampli Neve-style", status: "premium" },
      { name: "Chandler Limited TG2", type: "Préampli EMI", status: "vintage" }
    ],
    compressors: [
      { name: "Universal Audio 1176", type: "Compresseur FET", status: "vintage" },
      { name: "Teletronix LA-2A", type: "Compresseur opto", status: "vintage" },
      { name: "DBX 160X", type: "Compresseur VCA", status: "classic" },
      { name: "Empirical Labs Distressor", type: "Compresseur multimode", status: "premium" },
      { name: "SSL G-Comp", type: "Compresseur bus", status: "premium" },
      { name: "Tube-Tech CL 1B", type: "Compresseur opto à lampe", status: "vintage" }
    ],
    equalizers: [
      { name: "Pultec EQP-1A", type: "Égaliseur passif", status: "vintage" },
      { name: "Neve 1081", type: "Égaliseur 4 bandes", status: "vintage" },
      { name: "API 550A", type: "Égaliseur proportionnel", status: "classic" },
      { name: "Maag EQ4", type: "Égaliseur air band", status: "premium" },
      { name: "Manley Massive Passive", type: "Égaliseur passif stéréo", status: "premium" }
    ],
    effects: [
      { name: "Lexicon 480L", type: "Reverb numérique", status: "classic" },
      { name: "AMS DMX 15-80S", type: "Delay numérique", status: "vintage" },
      { name: "Eventide H3000", type: "Harmonizer", status: "vintage" },
      { name: "TC Electronic System 6000", type: "Multi-effets", status: "premium" },
      { name: "Bricasti M7", type: "Reverb convolution", status: "premium" },
      { name: "Universal Audio EMT 140", type: "Émulation plaque", status: "classic" }
    ],
    monitors: [
      { name: "Yamaha NS-10M", type: "Near-field classiques", status: "classic" },
      { name: "Genelec 8351B", type: "3-voies actives", status: "premium" },
      { name: "Adam A7X", type: "Near-field ruban", status: "premium" },
      { name: "Focal Twin6 Be", type: "Mid-field actives", status: "premium" },
      { name: "Dynaudio BM15A", type: "3-voies passives", status: "classic" },
      { name: "KRK Rokit 8", type: "Near-field actives", status: "standard" }
    ],
    interfaces: [
      { name: "Universal Audio Apollo x16", type: "Interface Thunderbolt 16x22", status: "premium" },
      { name: "Antelope Galaxy 64", type: "Interface 64x64 Synergy Core", status: "new" },
      { name: "RME Fireface UFX+", type: "Interface USB/Firewire", status: "premium" },
      { name: "Focusrite Red 4Pre", type: "Interface Thunderbolt", status: "premium" },
      { name: "MOTU 828es", type: "Interface AVB", status: "standard" }
    ],
    daw: [
      { name: "Pro Tools HDX", type: "DAW professionnel", status: "premium" },
      { name: "Logic Pro X", type: "DAW Apple", status: "standard" },
      { name: "Ableton Live Suite", type: "DAW production", status: "premium" },
      { name: "Cubase Pro", type: "DAW Steinberg", status: "premium" },
      { name: "Reaper", type: "DAW polyvalent", status: "standard" }
    ]
  };

  const [selectedCategory, setSelectedCategory] = useState('microphones');

  const categories = [
    { key: 'microphones', title: 'Microphones', icon: Mic },
    { key: 'preamps', title: 'Préamplis', icon: Settings },
    { key: 'compressors', title: 'Compresseurs', icon: Zap },
    { key: 'equalizers', title: 'Égaliseurs', icon: Monitor },
    { key: 'effects', title: 'Effets', icon: Volume2 },
    { key: 'monitors', title: 'Écoute', icon: Headphones },
    { key: 'interfaces', title: 'Interfaces', icon: HardDrive },
    { key: 'daw', title: 'Logiciels', icon: Cpu }
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

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.key)}
              className="flex items-center gap-2"
            >
              <category.icon className="w-4 h-4" />
              {category.title}
            </Button>
          ))}
        </div>

        {/* Equipment List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-16">
          {equipmentData[selectedCategory as keyof typeof equipmentData].map((item, index) => (
            <Card 
              key={item.name}
              className="equipment-item hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    className={`${getStatusColor(item.status)} text-xs`}
                    variant="secondary"
                  >
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm mb-1 text-foreground">{item.name}</h4>
                <p className="text-xs text-muted-foreground">{item.type}</p>
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