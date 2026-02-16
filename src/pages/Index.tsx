import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import Services from "@/components/Services";
import AudioComparison from "@/components/AudioComparison";
import Equipment from "@/components/Equipment";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ServiceModal from "@/components/ServiceModal";

// Service data for footer modal triggers
const servicesData = [
  {
    id: "mixage-mastering",
    title: "Mixage + Mastering",
    description: "Service complet pour donner vie à vos créations musicales",
    price: "290€",
    icon: () => null,
    image: "/lovable-uploads/5974c219-5112-499f-b5dd-3c09bc04df1a.png",
    featured: true,
    category: "Production",
    duration: "3-5 jours",
    included: ["Mixage professionnel multi-pistes", "Mastering hybride analogique/numérique", "3 révisions incluses", "Livraison formats HD (WAV, MP3)"],
    process: "Analyse → Mixage → Mastering → Révisions → Livraison finale",
    details: "Notre service phare combine mixage professionnel et mastering de haute qualité. Nous utilisons une approche hybride combinant le meilleur de l'analogique et du numérique pour sublimer vos productions.",
    equipment: ["Dangerous Music 2Bus+", "Apollo Quad Converters", "EQP-KTs & EQP-2A3SS", "Moniteurs Adam A77x & RP6 Rokit G3"],
    deliverables: ["Fichier master WAV 24bit/96kHz", "Version MP3 320kbps", "Version streaming optimisée"]
  },
  {
    id: "mixage-mastering-express",
    title: "Mixage + Mastering Express",
    description: "Solution professionnelle full numérique pour les artistes travaillant sur instrumentales en .wav",
    price: "120€",
    icon: () => null,
    image: "/lovable-uploads/Image-10.jpg",
    featured: true,
    category: "Production",
    duration: "4 heures",
    included: ["Mixage professionnel instru + multipistes voix", "Mastering full numérique", "2 révisions incluses", "Livraison formats HD (WAV, MP3)"],
    process: "Analyse → Mixage → Mastering → Révisions → Livraison finale",
    details: "Notre service express s'adresse principalement aux artistes travaillant sur des instrumentales. Offrez vous le luxe d'un mixage et mastering professionnel tout numérique à coût réduit.",
    equipment: ["Apollo Quad Converters", "Plugins professionnels", "Monitoring Adam A77x"],
    deliverables: ["Fichier master WAV 24bit/96kHz", "Version MP3 320kbps"]
  },
  {
    id: "sound-design",
    title: "Sound Design",
    description: "Création sonore et design audio pour tous vos projets créatifs",
    price: "Sur devis",
    icon: () => null,
    image: "/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png",
    featured: true,
    category: "Création",
    duration: "Variable",
    included: ["Sound design pour films et jeux", "Création d'ambiances sonores", "Effets sonores sur mesure", "Post-production audio avancée"],
    process: "Brief créatif → Recherche sonore → Création → Synchronisation → Finalisation",
    details: "Spécialisé dans la création d'univers sonores uniques, nous donnons vie à vos projets audiovisuels avec des sons originaux et des ambiances immersives.",
    equipment: ["Banques de sons premium", "Synthétiseurs modulaires", "Microphones de terrain", "Logiciels spécialisés"],
    deliverables: ["Effets sonores isolés", "Stems multitracks", "Mix final synchronisé"]
  },
  {
    id: "composition",
    title: "Composition / Beatmaking",
    description: "Création musicale et production de beats personnalisés",
    price: "A partir de 300€",
    icon: () => null,
    image: "/lovable-uploads/64615fd6-368c-466a-a669-f5140677e476.png",
    featured: false,
    category: "Création",
    duration: "1-3 semaines",
    included: ["Composition originale", "Production complète", "Arrangements personnalisés", "Composition Exclusive"],
    process: "Brief artistique → Création → Arrangements → Production → Finalisation",
    details: "De l'idée à la réalisation complète, nous créons des compositions originales adaptées à votre style et vos besoins artistiques.",
    equipment: ["FL Studio", "VSTs", "Banques de sons Splice", "Instruments réels"],
    deliverables: ["Composition complète", "Version concert (PBO)", "Multistems négociable"]
  }
];

const Index = () => {
  const [footerModalService, setFooterModalService] = useState<typeof servicesData[0] | null>(null);
  const [footerModalOpen, setFooterModalOpen] = useState(false);

  const handleOpenServiceFromFooter = useCallback((serviceId: string) => {
    const service = servicesData.find(s => s.id === serviceId);
    if (service) {
      setFooterModalService(service);
      setFooterModalOpen(true);
    }
  }, []);

  const handleCloseFooterModal = useCallback(() => {
    setFooterModalOpen(false);
    setFooterModalService(null);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Partners />
        <Services />
        <AudioComparison />
        <Equipment />
        <Contact />
      </main>
      <Footer onOpenService={handleOpenServiceFromFooter} />
      
      {/* Modal for footer service links */}
      <ServiceModal 
        service={footerModalService}
        open={footerModalOpen}
        onClose={handleCloseFooterModal}
      />
    </div>
  );
};

export default Index;
