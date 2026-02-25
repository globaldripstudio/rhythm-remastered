import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Waves, Settings, Volume2, Mic, RefreshCw, Music, BookOpen, Speaker, Music2 } from "lucide-react";
import ServiceModal from "@/components/ServiceModal";

// Service data for both cards and modals
export const servicesData = [
{
  id: "mixage-mastering",
  title: "Mixage + Mastering",
  description: "Service premium hybride analogique/numérique pour un rendu professionnel haut de gamme",
  price: "250€",
  priceLabel: "/ titre",
  icon: Waves,
  image: "/lovable-uploads/5974c219-5112-499f-b5dd-3c09bc04df1a.png",
  featured: true,
  badgeText: "Premium",
  badgeColor: "bg-primary",
  category: "Production",
  duration: "3-5 jours",
  included: [
  "Mixage professionnel multi-pistes",
  "Mastering hybride analogique/numérique",
  "3 révisions incluses",
  "Livraison WAV + MP3"],
  antiMalentendu: true,
  process: "Analyse → Mixage → Mastering → Révisions → Livraison finale",
  details: "Notre service phare combine mixage professionnel et mastering de haute qualité. Nous utilisons une approche hybride combinant le meilleur de l'analogique et du numérique pour sublimer vos productions.",
  equipment: ["Dangerous Music 2Bus+", "Apollo Quad Converters", "IGS S-Type 500vu", "General Audio Research VAULTEC EQP-2A3SS", "DBX 160a", "Moniteurs Adam A77x & RP6 Rokit G3", "Plugins professionnels", "etc."],
  deliverables: ["Fichier master WAV 24bit/96kHz", "Version MP3 320kbps", "Version streaming optimisée"]
},
{
  id: "mixage-mastering-express",
  title: "Mixage + Mastering | Essentiel",
  description: "Solution professionnelle full numérique pour les artistes travaillant sur instrumentales en .wav",
  price: "140€",
  priceLabel: "/ titre",
  icon: Waves,
  image: "/lovable-uploads/Image-10.jpg",
  featured: true,
  badgeText: "Essentiel",
  badgeColor: "bg-emerald-500",
  category: "Production",
  duration: "4 heures",
  included: [
  "Mixage professionnel instru + multipistes voix",
  "Mastering full numérique",
  "2 révisions incluses",
  "Livraison WAV + MP3"],
  antiMalentendu: true,
  process: "Analyse → Mixage → Mastering → Révisions → Livraison finale",
  details: "Notre service essentiel s'adresse principalement aux artistes travaillant sur des instrumentales. Offrez vous le luxe d'un mixage et mastering professionnel tout numérique à coût réduit.",
  equipment: ["Apollo Quad Converters", "Plugins professionnels", "Monitoring Adam A77x", "etc."],
  deliverables: ["Fichier master WAV 24bit/96kHz", "Version MP3 320kbps"]
},
{
  id: "stem-mastering",
  title: "Stem Mastering",
  description: "Mastering hybride analogique/numérique à partir de vos stems (1 stem prod + 1 stem voix déjà mixées)",
  price: "60€",
  priceLabel: "/ titre",
  icon: Volume2,
  image: "/lovable-uploads/Image-12.jpg",
  featured: false,
  badgeText: "",
  badgeColor: "",
  category: "Production",
  duration: "24-48h",
  included: [
  "Stem mastering hybride analogique/numérique",
  "Pour : 1 stem prod + 1 stem voix (déjà mixées)",
  "2 révisions incluses",
  "Livraison Master WAV + MP3"],
  antiMalentendu: true,
  process: "Réception stems → Mastering hybride → Révisions → Livraison finale",
  details: "Service de stem mastering idéal si vous avez déjà mixé vos pistes. Envoyez-nous un stem production et un stem voix, et nous nous occupons du mastering avec notre chaîne hybride analogique/numérique.",
  equipment: ["Dangerous Music 2Bus+", "Apollo Quad Converters", "IGS S-Type 500vu", "Moniteurs Adam A77x & RP6 Rokit G3", "etc."],
  deliverables: ["Master WAV 24bit/96kHz", "Version MP3 320kbps"],
  spotifyEmbeds: [
  "https://open.spotify.com/embed/track/1vfFR4nBeRrkZW9dFVPCWQ?utm_source=generator",
  "https://open.spotify.com/embed/track/2XMFGOAU4ZH0SVX81DTvj4?utm_source=generator"
  ]
},
{
  id: "mixage-hybride",
  title: "Mixage hybride",
  description: "Mixage professionnel hybride analogique/numérique sans mastering",
  price: "190€",
  priceLabel: "/ titre",
  icon: Waves,
  image: "/lovable-uploads/Image-19.jpg",
  featured: false,
  badgeText: "",
  badgeColor: "",
  category: "Production",
  duration: "3-5 jours",
  included: [
  "Mixage hybride analogique/numérique",
  "Équilibre, dynamique, espace, automation",
  "Cohérence globale du mix",
  "3 révisions incluses"],
  antiMalentendu: true,
  process: "Analyse → Mixage hybride → Révisions → Livraison",
  details: "Service de mixage seul, sans mastering. Idéal si vous avez déjà un ingénieur de mastering ou si vous souhaitez un mixage hybride de qualité professionnelle.",
  equipment: ["Dangerous Music 2Bus+", "Apollo Quad Converters", "IGS S-Type 500vu", "Moniteurs Adam A77x & RP6 Rokit G3", "etc."],
  deliverables: ["Mix stéréo WAV 24bit", "Stems sur demande"]
},
{
  id: "captation-sonore",
  title: "Captation Sonore",
  description: "Captation audio professionnelle en studio, ou pour évènements et tournages",
  price: "40€/h",
  priceLabel: "",
  priceExtra: "3h minimum",
  priceDay: "350€/jour",
  icon: Mic,
  image: "/lovable-uploads/92466e48-6f78-46d4-bb9b-2bc8c6a50017.png",
  featured: false,
  badgeText: "",
  badgeColor: "",
  category: "Enregistrement",
  duration: "À la demande",
  included: [
  "Enregistrement studio professionnel",
  "Captation événementielle mobile",
  "Équipement haute qualité",
  "Post-production incluse"],
  antiMalentendu: false,
  process: "Préparation → Installation → Captation → Monitoring → Post-production",
  details: "Service complet d'enregistrement en studio ou en extérieur. Bloc minimum de 3 heures (soit 120€). Nous nous adaptons à tous vos besoins avec un équipement de qualité professionnelle.",
  equipment: ["ProTools Ultimate", "Microphones Griffon", "Préamplis Neve et Unison", "Monitoring professionnel", "etc."],
  deliverables: ["Pistes brutes multitrack", "Écoutes de travail", "Fichiers synchronisés"]
},
{
  id: "direction-artistique",
  title: "Direction Artistique / Arrangement",
  description: "Accompagnement artistique et arrangements musicaux sur mesure",
  price: "Sur devis",
  priceLabel: "",
  icon: Settings,
  image: "/lovable-uploads/35c8540d-ce59-433e-87fd-f1b8b1527941.png",
  featured: false,
  badgeText: "",
  badgeColor: "",
  category: "Conseil",
  duration: "Variable",
  included: [
  "Direction artistique sur mesure",
  "Arrangements instrumentaux",
  "Conseils créatifs personnalisés",
  "Management personnalisable"],
  antiMalentendu: false,
  process: "Analyse artistique → Conseil stratégique → Arrangements → Suivi → Optimisation",
  details: "Accompagnement complet de votre projet artistique, de la conception à la réalisation, avec une expertise technique et créative.",
  equipmentLabel: "Méthodes",
  equipment: ["Réalisation", "Recherche de signature sonore", "Réseau de musiciens et ingénieurs", "Références & benchmarks professionnels"],
  deliverables: ["Plan artistique détaillé", "Arrangements finalisés"]
},
{
  id: "composition",
  title: "Composition / Beatmaking",
  description: "Création musicale et production de beats personnalisés",
  price: "A partir de 300€",
  priceLabel: "",
  icon: Music2,
  image: "/lovable-uploads/64615fd6-368c-466a-a669-f5140677e476.png",
  imagePosition: "object-[center_60%]",
  featured: false,
  badgeText: "",
  badgeColor: "",
  category: "Création",
  duration: "1-3 semaines",
  included: [
  "Composition originale",
  "Production complète",
  "Arrangements personnalisés",
  "Composition Exclusive (cession de droits négociable)"],
  antiMalentendu: false,
  process: "Brief artistique → Création → Arrangements → Production → Finalisation",
  details: "De l'idée à la réalisation complète, nous créons des compositions originales adaptées à votre style et vos besoins artistiques.",
  equipment: ["FL Studio", "VSTs", "Banques de sons Splice", "Instruments réels", "etc."],
  deliverables: ["Composition complète", "Multistems négociable"]
},
{
  id: "sound-design",
  title: "Sound Design",
  description: "Création sonore et design audio pour tous vos projets créatifs",
  price: "Sur devis",
  priceLabel: "",
  icon: Speaker,
  image: "/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png",
  featured: true,
  badgeText: "Spécialité",
  badgeColor: "bg-primary",
  category: "Création",
  duration: "Variable",
  included: [
  "Sound design pour films et jeux",
  "Création d'ambiances sonores",
  "Effets sonores sur mesure",
  "Post-production audio avancée"],
  antiMalentendu: false,
  process: "Brief créatif → Recherche sonore → Création → Synchronisation → Mixage global → Finalisation",
  details: "Spécialisé dans la création d'univers sonores uniques, nous donnons vie à vos projets audiovisuels avec des sons originaux et des ambiances immersives.",
  equipment: ["Protools Perpetual", "Griffon Microphones Saturne", "LOM Geofon", "Synthétiseurs modulaires", "Banques de sons premium", "etc."],
  deliverables: ["Effets sonores isolés", "Stems multitracks", "Mix final synchronisé", "Master aux normes du support demandé"]
},
{
  id: "formation",
  title: "Formation MAO / Mixage",
  description: "Formations personnalisées en production musicale et techniques de mixage",
  price: "45€/h",
  priceLabel: "",
  icon: BookOpen,
  image: "/lovable-uploads/6ed6bc90-04bb-4040-9e0b-26b3c13bba5d.png",
  featured: false,
  badgeText: "",
  badgeColor: "",
  category: "Formation",
  duration: "Flexible",
  included: [
  "Cours particuliers ou en groupe",
  "Formation sur logiciels MAO",
  "Techniques de mixage avancées",
  "Support pédagogique inclus"],
  antiMalentendu: false,
  process: "Évaluation niveau → Programme personnalisé → Formation pratique → Suivi progression",
  details: "Formation complète aux techniques de production musicale moderne. Apprenez les secrets de la composition et du mixage, jusqu'au mastering avec un professionnel expérimenté.",
  equipment: ["Stations de travail dédiées", "Logiciels professionnels", "Supports de cours", "Exercices pratiques"],
  deliverables: ["Support de formation", "Projets d'exercice", "Fiches récapitulatives à chaque fin de séance"]
},
{
  id: "pack-single",
  title: "Pack \"Single\"",
  description: "Le pack complet : beat + enregistrement + mixage hybride + mastering",
  price: "690€",
  priceLabel: "/ titre",
  icon: Music,
  image: "/lovable-uploads/Image-33.jpg",
  featured: true,
  badgeText: "Pack complet",
  badgeColor: "bg-gradient-to-r from-red-800 to-rose-600",
  category: "Pack",
  duration: "2-3 semaines",
  included: [
  "Production / Beatmaking",
  "Direction artistique/Réalisation",
  "Session d'enregistrement (bloc 3h)",
  "Editing complet",
  "Réalisation",
  "Mix + Master hybride",
  "Livraison WAV + MP3"],
  antiMalentendu: true,
  process: "Composition → Enregistrement → Editing → Réalisation → Mixage → Mastering → Livraison",
  details: "Le pack Single complet : de la production à la livraison finale. Inclut la composition du beat, une session d'enregistrement de 3h, l'editing, la réalisation, le mixage hybride et le mastering. Tout ce qu'il faut pour sortir un single professionnel.",
  equipment: ["FL Studio", "Protools Perpetual", "Dangerous Music 2Bus+", "Apollo Quad Converters", "Griffon Microphones", "Préamplis Neve & Unison", "Instruments réels", "VSTs premium", "etc."],
  deliverables: ["Single master WAV 24bit/96kHz", "Version MP3 320kbps", "Version concert (PBO)"],
  spotifyEmbeds: [
  "https://open.spotify.com/embed/track/5bKc0p54jMp55SKrbHmymH?utm_source=generator",
  "https://open.spotify.com/embed/track/1jgiMQkxjzMOVbax5McyCr?utm_source=generator",
  "https://open.spotify.com/embed/track/1oRpEqMoiZqZHY13jKZ9gD?utm_source=generator"]
}];


// Layout: 3 rows
const row1Ids = ["mixage-mastering", "mixage-mastering-express"];
const row2Ids = ["captation-sonore", "direction-artistique", "composition"];
const row3Ids = ["sound-design", "formation", "pack-single"];

const Services = () => {
  const [showMixageHybride, setShowMixageHybride] = useState(false);
  const [selectedService, setSelectedService] = useState<typeof servicesData[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (service: typeof servicesData[0]) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedService(null);
  };

  const renderCard = (service: typeof servicesData[0], index: number) => {
    const isPackSingle = service.id === "pack-single";
    const isSoundDesign = service.id === "sound-design";
    const isMixMaster = service.id === "mixage-mastering";
    const isFeaturedWhite = isMixMaster || isSoundDesign;
    const isFeaturedCard = isFeaturedWhite || isPackSingle;

    return (
      <Card
        className={`service-card group cursor-pointer relative overflow-hidden transition-all duration-500 min-h-[440px] sm:min-h-[480px] md:min-h-[520px] flex flex-col ${
        isFeaturedWhite ? 'ring-2 ring-white/20 hover:ring-white/40' : ''} ${
        isPackSingle ? 'ring-0 hover:ring-0 hover:shadow-[0_0_40px_rgba(127,29,29,0.35),0_0_80px_rgba(153,27,27,0.15)]' : ''}`}
        onClick={() => handleOpenModal(service)}>

        {/* Service Image */}
        <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            (service as any).imagePosition ? (service as any).imagePosition :
            service.id === 'captation-sonore' ? 'object-[center_25%]' :
            service.id === 'direction-artistique' ? 'object-bottom' :
            service.id === 'mixage-mastering' ? 'object-top' :
            service.id === 'mixage-mastering-express' ? 'object-center' :
            ''}`
            } />

          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
              <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
          {/* Badge */}
          {service.badgeText &&
          <div className={`absolute top-3 left-3 sm:top-4 sm:left-4 ${service.badgeColor || 'bg-primary'} text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-lg`}>
              {service.badgeText}
            </div>
          }
        </div>

        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <CardTitle className="text-lg sm:text-xl font-bold">{service.title}</CardTitle>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-xl sm:text-2xl font-bold text-primary">{service.price}</div>
              {(service as any).priceLabel && <div className="text-xs text-muted-foreground">{(service as any).priceLabel}</div>}
              {(service as any).priceDay && <div className="text-xs text-muted-foreground mt-0.5">{(service as any).priceDay}</div>}
              {(service as any).priceExtra &&
              <div className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full mt-1 font-medium">
                  {(service as any).priceExtra}
                </div>
              }
            </div>
          </div>
          <CardDescription className="text-muted-foreground text-sm sm:text-base line-clamp-2">
            {service.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Features List */}
          <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 flex-1">
            {service.included.slice(0, 3).map((feature, featureIndex) =>
            <li key={featureIndex} className="flex items-center text-xs sm:text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 sm:mr-3 flex-shrink-0" />
                {feature}
              </li>
            )}
          </ul>

          <Button
            className="w-full group-hover:studio-button transition-all duration-300 text-sm sm:text-base"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(service);
            }}>

            Plus d'infos
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>

        {/* Glow Effect on Hover */}
        {isFeaturedCard && (
          <div className={`absolute inset-0 ${
            isPackSingle ? 'bg-gradient-to-br from-red-900/30 via-rose-800/15 to-transparent' : 
            'bg-gradient-accent'
          } opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />
        )}
      </Card>);

  };

  const stemMastering = servicesData.find((s) => s.id === "stem-mastering")!;
  const mixageHybride = servicesData.find((s) => s.id === "mixage-hybride")!;
  const currentSwitchService = showMixageHybride ? mixageHybride : stemMastering;

  return (
    <section id="services" className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-background to-muted/20" aria-labelledby="services-heading">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in">
          <h2 id="services-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Nos <span className="hero-text">Services</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Des prestations professionnelles adaptées à tous vos besoins musicaux, 
            du mixage/mastering haute fidélité à la composition, en passant par la formation
          </p>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
          {row1Ids.map((id, index) => {
            const service = servicesData.find((s) => s.id === id)!;
            return <div key={id} className="animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>{renderCard(service, index)}</div>;
          })}
          
          {/* Switch card: Stem Mastering / Mixage hybride */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMixageHybride(!showMixageHybride);
              }}
              className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 md:-top-8 md:-right-8 md:left-auto z-40 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-primary border-4 border-background rounded-full flex items-center justify-center hover:bg-primary/80 text-primary-foreground transition-all duration-300 shadow-xl hover:shadow-primary/50 hover:scale-110 group/switch"
              aria-label={showMixageHybride ? "Voir Stem Mastering" : "Voir Mixage hybride"}>

              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 group-hover/switch:rotate-180" />
            </button>
            {renderCard(currentSwitchService, 2)}
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
          {row2Ids.map((id, index) => {
            const service = servicesData.find((s) => s.id === id)!;
            return <div key={id} className="animate-fade-in" style={{ animationDelay: `${(index + 3) * 0.15}s` }}>{renderCard(service, index + 3)}</div>;
          })}
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12 md:mb-16">
          {row3Ids.map((id, index) => {
            const service = servicesData.find((s) => s.id === id)!;
            return <div key={id} className="animate-fade-in" style={{ animationDelay: `${(index + 6) * 0.15}s` }}>{renderCard(service, index + 6)}</div>;
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-gradient-hero border border-border">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Projet sur mesure ?</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Contactez-nous pour un devis personnalisé</p>
              <Button
                size="lg"
                className="studio-button text-sm sm:text-base"
                onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  setTimeout(() => window.dispatchEvent(new Event('highlight-phone')), 800);
                }}>

                Demander un devis gratuit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      <ServiceModal
        service={selectedService}
        open={modalOpen}
        onClose={handleCloseModal} />

    </section>);

};

export default Services;
