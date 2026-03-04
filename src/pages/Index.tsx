import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import Services from "@/components/Services";
import AudioComparison from "@/components/AudioComparison";
import Equipment from "@/components/Equipment";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ServiceModal from "@/components/ServiceModal";
import SEO from "@/components/SEO";
import { servicesData } from "@/components/Services";

const Index = () => {
  const { t } = useTranslation();
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
      <SEO title={t('seo.home.title')} description={t('seo.home.description')} path="/" />
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