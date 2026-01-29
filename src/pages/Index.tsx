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
    id: "direction-artistique",
    title: "Direction Artistique / Arrangement",
    description: "Accompagnement artistique et arrangements musicaux sur mesure",
    price: "Sur devis",
    icon: () => null,
    image: "/lovable-uploads/35c8540d-ce59-433e-87fd-f1b8b1527941.png",
    featured: false,
    category: "Conseil",
    duration: "Variable",
    included: ["Direction artistique complète", "Arrangements instrumentaux", "Conseils créatifs personnalisés", "Suivi de projet personnalisable"],
    process: "Analyse artistique → Conseil stratégique → Arrangements → Suivi → Optimisation",
    details: "Accompagnement complet de votre projet artistique, de la conception à la réalisation, avec une expertise technique et créative.",
    equipment: ["Direction artistique stratégique", "Réseau de musiciens et ingénieurs", "Références & benchmarks professionnels", "Méthodologies de production"],
    deliverables: ["Plan artistique détaillé", "Arrangements finalisés", "Rapport de suivi"]
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
