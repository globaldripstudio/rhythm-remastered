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
    sommation: [
      { name: "Dangerous Music 2Bus+", type: "Sommation analogique", status: "premium" },
      { name: "Universal Audio Apollo (x2)", type: "Interface/Convertisseur", status: "premium" },
      { name: "Quad Core DSP Accelerator", type: "Processeur DSP", status: "premium" }
    ],
    daw: [
      { name: "Pro Tools", type: "DAW professionnel", status: "premium" },
      { name: "FL Studio", type: "DAW production", status: "standard" }
    ],
    ecoutes: [
      { name: "Adam A77x", type: "Monitoring near-field", status: "premium" },
      { name: "KRK Rp6 Rokit G3", type: "Monitoring near-field", status: "standard" },
      { name: "Beyerdynamic DT770-Pro 250ohm", type: "Casque studio", status: "classic" },
      { name: "Sony MDRV500", type: "Casque monitoring", status: "standard" },
      { name: "AKG K52 (x2)", type: "Casque studio", status: "standard" }
    ],
    microphones: [
      { name: "Griffon Microphones GMT12", type: "Condensateur", status: "premium" },
      { name: "Audio-Technica AT4050", type: "Condensateur multi-pattern", status: "premium" },
      { name: "Shure PG81", type: "Condensateur", status: "standard" },
      { name: "Shure SM57", type: "Dynamique polyvalent", status: "classic" },
      { name: "Sennheiser E906", type: "Dynamique guitare", status: "standard" },
      { name: "Melodynamic 75A", type: "Dynamique vintage", status: "vintage" },
      { name: "Shure CR80R", type: "Dynamique", status: "vintage" },
      { name: "Griffon Microphones Fuzzyphone", type: "Micro créatif", status: "premium" },
      { name: "Griffon Microphones Saturne (x2)", type: "Condensateur", status: "premium" },
      { name: "LOM Geofon", type: "Géophone contact", status: "creative" }
    ],
    preamps: [
      { name: "Neve 1073", type: "Préampli vintage légendaire", status: "vintage" },
      { name: "Unison Pre (x8)", type: "Préamplis UA", status: "premium" },
      { name: "DBX 286s", type: "Préampli/processeur voix", status: "standard" }
    ],
    equalizers: [
      { name: "Klark Teknik EQP-KT (x2)", type: "Égaliseur Pultec-style", status: "premium" },
      { name: "General Audio Research VAULTEC EQP-2A3SS", type: "Égaliseur passif", status: "premium" },
      { name: "Behringer Ultragraph Pro", type: "Égaliseur graphique", status: "standard" }
    ],
    compressors: [
      { name: "IGS S-Type 500VU Buss Compressor", type: "Compresseur bus", status: "premium" },
      { name: "General Audio Research Sonar 500", type: "Compresseur analogique", status: "premium" },
      { name: "DBX 160a (x2)", type: "Compresseur VCA", status: "classic" },
      { name: "Alesis 3630", type: "Compresseur/limiteur", status: "classic" },
      { name: "DBX 286s", type: "Processeur voix", status: "standard" },
      { name: "Klark Teknik 3rd Dimension BBD-320", type: "Chorus", status: "premium" },
      { name: "Behringer Virtualizer Pro", type: "Multi-effets", status: "standard" },
      { name: "tc.electronics Sentry", type: "Gate/Expander", status: "standard" },
      { name: "Digitech Whammy 5", type: "Effet guitare", status: "creative" }
    ],
    instruments: [
      { name: "ESP E-II Horizon", type: "Guitare électrique", status: "premium" },
      { name: "ESP Vintage Plus", type: "Guitare électrique", status: "premium" },
      { name: "LTD M7 Baritone Black Metal", type: "Guitare électrique", status: "premium" },
      { name: "Lag Roxane RR-1500", type: "Guitare électrique", status: "standard" },
      { name: "Fender Stratocaster Player Series", type: "Guitare électrique", status: "classic" },
      { name: "Ibanez Tod10n", type: "Guitare électro-classique", status: "signature" },
      { name: "Washburn D15", type: "Guitare folk", status: "standard" },
      { name: "Guitare classique Pro Natura", type: "Guitare classique", status: "standard" },
      { name: "Guitare manouche Di Mauro", type: "Guitare manouche", status: "vintage" },
      { name: "Fender Jazz Bass Special", type: "Basse électrique", status: "classic" },
      { name: "Nektar Impact LX49/LX49+", type: "Clavier MIDI", status: "standard" },
      { name: "Yamaha PSS-50", type: "Synthétiseur vintage", status: "vintage" },
      { name: "Melodica Hohner Student 32", type: "Mélodica", status: "standard" }
    ],
    backline: [
      { name: "EVH 5150 6l6 50w", type: "Tête d'amplificateur guitare", status: "premium" },
      { name: "Orange Rockerverb MkIII", type: "Tête d'amplificateur guitare", status: "premium" },
      { name: "ENGL 2x12 V30", type: "Baffle guitare", status: "premium" },
      { name: "EVH 2x12 G12-H", type: "Baffle guitare", status: "premium" },
      { name: "VOX V2x12C", type: "Baffle guitare", status: "classic" },
      { name: "Laney Linebacker KB80", type: "Amplificateur clavier", status: "standard" },
      { name: "Fender Bassman 100", type: "Amplificateur basse", status: "classic" },
      { name: "Marshall AS50D", type: "Amplificateur acoustique", status: "standard" },
      { name: "General Audio Research TU-DI MK1 / FE-DI MK3", type: "Boîte de direct", status: "premium" },
      { name: "Millenium DI-E DI Box (x2)", type: "Boîte de direct", status: "standard" }
    ],
    plugins: [
      { name: "Universal Audio Effects", type: "Suite d'effets premium", status: "premium" },
      { name: "Antares AutoTune", type: "Correction pitch", status: "industry" },
      { name: "Celemony Melodyne 5", type: "Éditeur audio avancé", status: "premium" },
      { name: "Arturia Fx & VST Collection 3", type: "Suite d'instruments", status: "creative" },
      { name: "Suite Waves 10", type: "Suite d'effets", status: "industry" },
      { name: "Suite FabFilter", type: "Suite d'effets", status: "premium" },
      { name: "Suite bx", type: "Suite d'effets", status: "premium" },
      { name: "Suite Acustica", type: "Émulations analogiques", status: "premium" },
      { name: "Soundtoys Effects Rack", type: "Effets créatifs", status: "creative" },
      { name: "Izotope Ozone 9 Suite", type: "Suite mastering", status: "industry" },
      { name: "Izotope RX 8 & 9", type: "Restauration audio", status: "premium" },
      { name: "Izotope VocalSynth", type: "Synthèse vocale", status: "creative" },
      { name: "Neural DSP Archetype Tim Henson X", type: "Amplificateur guitare", status: "signature" },
      { name: "Native Instruments Guitar Rig 7", type: "Amplificateur guitare", status: "standard" },
      { name: "NI Kontakt", type: "Sampler", status: "industry" },
      { name: "Klanghelm MJUC Compressor", type: "Compresseur vintage", status: "vintage" },
      { name: "Nicky Romero Kickstart", type: "Sidechain", status: "standard" },
      { name: "Drip Plugin", type: "Effet signature", status: "creative" },
      { name: "Nasty DLA Mk II", type: "Delay créatif", status: "creative" }
    ]
  };

  const [selectedCategory, setSelectedCategory] = useState('sommation');

  const categories = [
    { key: 'sommation', title: 'Sommation & Conversion', icon: HardDrive },
    { key: 'daw', title: 'Logiciels', icon: Cpu },
    { key: 'ecoutes', title: 'Écoutes', icon: Headphones },
    { key: 'microphones', title: 'Microphones', icon: Mic },
    { key: 'preamps', title: 'Préamplificateurs', icon: Settings },
    { key: 'equalizers', title: 'Égaliseurs', icon: Monitor },
    { key: 'compressors', title: 'Compresseurs & Effets', icon: Zap },
    { key: 'instruments', title: 'Instruments', icon: Volume2 },
    { key: 'backline', title: 'Backline', icon: Volume2 },
    { key: 'plugins', title: 'Plugins', icon: Cpu }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "premium": return "bg-orange-premium text-white";
      case "vintage": return "bg-secondary text-secondary-foreground"; 
      case "classic": return "bg-orange-classic text-white";
      case "industry": return "bg-gradient-to-r from-orange-premium to-secondary text-white";
      case "creative": return "bg-gradient-to-r from-orange-classic to-orange-premium text-white";
      case "signature": return "bg-gradient-to-r from-secondary to-orange-premium text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "premium": return "Premium";
      case "vintage": return "Vintage";
      case "classic": return "Classique";
      case "industry": return "Industry Standard";
      case "creative": return "Créatif";
      case "signature": return "Signature";
      default: return "Standard";
    }
  };

  return (
    <section id="equipement" className="py-16 sm:py-20 md:py-24 bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Notre <span className="hero-text">Équipement</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Un parc technique exceptionnel alliant le meilleur de l'analogique vintage 
            et les dernières innovations numériques
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-10 md:mb-12">
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.key)}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
            >
              <category.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">{category.title}</span>
              <span className="xs:hidden sm:hidden">{category.title.split(' ')[0]}</span>
            </Button>
          ))}
        </div>

        {/* Equipment List */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12 md:mb-16">
          {equipmentData[selectedCategory as keyof typeof equipmentData].map((item, index) => (
            <Card 
              key={item.name}
              className="equipment-item hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <Badge 
                    className={`${getStatusColor(item.status)} text-[10px] sm:text-xs`}
                    variant="secondary"
                  >
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>
                <h4 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 text-foreground">{item.name}</h4>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{item.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Equipment;