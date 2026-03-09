import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Phone, Mail, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SeuilDiagram, RatioDiagram, AttackReleaseKneeDiagram } from "@/components/blog/CompressionDiagrams";
import BlogArticleHeader from "@/components/blog/BlogArticleHeader";
import ShareButtons from "@/components/blog/ShareButtons";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";

const ComprendreCompression = () => {
  const navigate = useNavigate();
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t('seo.compression.title')}
        description={t('seo.compression.description')}
        path="/blog/comprendre-la-compression"
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": t('blog.articles.compression.title'),
          "author": { "@type": "Organization", "name": "Global Drip Studio" },
          "datePublished": "2024-12-10",
          "image": "https://globaldripstudio.fr/lovable-uploads/Image-23.jpg",
          "publisher": { "@type": "Organization", "name": "Global Drip Studio", "logo": { "@type": "ImageObject", "url": "https://globaldripstudio.fr/lovable-uploads/logo-blanc-sans-fond.png" } }
        }}
      />
      <BlogArticleHeader />

      <article className="py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <header className="mb-8 sm:mb-12">
            <div className="mb-4 sm:mb-6">
              <Badge className="bg-secondary text-secondary-foreground mb-4">
                <Zap className="w-4 h-4 mr-2" />
                {t('blog.articles.compression.badge')}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              {t('blog.articles.compression.title').split('compression').map((part, i) => 
                i === 0 ? <span key={i}>{part}<span className="hero-text">compression</span></span> : <span key={i}>{part}</span>
              )}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-6">
              {t('blog.articles.compression.subtitle')}
            </p>
            <div className="flex items-center text-sm text-muted-foreground mb-6">
              <span>{t('blog.articles.compression.meta')}</span>
            </div>
            <ShareButtons title={t('blog.articles.compression.title')} url="https://globaldripstudio.fr/blog/comprendre-la-compression" />
          </header>

          <div className="mb-8 sm:mb-12 rounded-2xl overflow-hidden">
            <img src="/lovable-uploads/Image-23.jpg" alt="Compresseur audio professionnel" className="w-full h-48 sm:h-64 md:h-96 object-cover" />
          </div>

          <div className="prose prose-lg max-w-none text-foreground">
            <p className="text-base sm:text-lg mb-6">{t('blog.articles.compression.intro')}</p>

            <div className="bg-gradient-hero rounded-2xl p-6 sm:p-8 mb-8">
              <p className="text-center text-muted-foreground font-medium">{t('blog.articles.compression.keyIdea')}</p>
            </div>

            <p className="mb-6">{t('blog.articles.compression.readAsPhrase')}</p>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('blog.articles.compression.thresholdTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('blog.articles.compression.thresholdP1')}</p>
                <p className="text-muted-foreground">{t('blog.articles.compression.thresholdP2')}</p>
              </CardContent>
            </Card>

            <SeuilDiagram />

            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('blog.articles.compression.ratioTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('blog.articles.compression.ratioP1')}</p>
                <p className="text-muted-foreground">{t('blog.articles.compression.ratioP2')}</p>
              </CardContent>
            </Card>

            <RatioDiagram />

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-border">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('blog.articles.compression.attackTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('blog.articles.compression.attackP1')}</p>
                <p className="text-muted-foreground mb-4">{t('blog.articles.compression.attackP2')}</p>
                <p className="text-muted-foreground">{t('blog.articles.compression.attackP3')}</p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('blog.articles.compression.releaseTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('blog.articles.compression.releaseP1')}</p>
                <p className="text-muted-foreground mb-4">{t('blog.articles.compression.releaseP2')}</p>
                <p className="text-muted-foreground">{t('blog.articles.compression.releaseP3')}</p>
              </CardContent>
            </Card>

            <AttackReleaseKneeDiagram />

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('blog.articles.compression.kneeTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('blog.articles.compression.kneeP1')}</p>
                <p className="text-muted-foreground">{t('blog.articles.compression.kneeP2')}</p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-hero border-border">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('blog.articles.compression.compareTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('blog.articles.compression.compareP1')}</p>
                <p className="text-muted-foreground">{t('blog.articles.compression.compareP2')}</p>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 sm:p-8 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">{t('blog.articles.compression.summaryTitle')}</h3>
              <p className="text-muted-foreground mb-4">{t('blog.articles.compression.summaryP1')}</p>
              <p className="text-muted-foreground">{t('blog.articles.compression.summaryP2')}</p>
            </div>

            <div className="bg-gradient-hero rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">{t('blog.articles.compression.ctaTitle')}</h3>
              <p className="text-muted-foreground mb-6">{t('blog.articles.compression.ctaDesc')}</p>
              <div className="flex justify-center">
                <Button className="studio-button" onClick={() => setContactModalOpen(true)}>
                  {t('blog.articles.compression.ctaButton')}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border">
            <ShareButtons title={t('blog.articles.compression.title')} url="https://globaldripstudio.fr/blog/comprendre-la-compression" />
          </div>
        </div>
      </article>

      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="max-w-lg p-0 overflow-visible bg-card border-border">
          <DialogTitle className="sr-only">{t('blog.articles.compression.contactModalTitle')}</DialogTitle>
          <button onClick={() => setContactModalOpen(false)} className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-[60] w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors" aria-label="Close">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <img src="/lovable-uploads/logo-blanc-sans-fond.png" alt="Global Drip Studio" className="h-10 sm:h-12 mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Global Drip Studio</h3>
              <p className="text-sm sm:text-base text-muted-foreground italic">{t('blog.articles.compression.contactTagline')}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+33659797342" className="text-sm sm:text-base hover:text-primary transition-colors">+33 6 59 79 73 42</a>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:globaldripstudio@gmail.com" className="text-sm sm:text-base hover:text-primary transition-colors break-all">globaldripstudio@gmail.com</a>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base">8 Allée des Ajoncs, 13500 Martigues</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <button className="w-full" onClick={() => {
                setContactModalOpen(false);
                setTimeout(() => {
                  navigate('/');
                  setTimeout(() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      const formCard = contactSection.querySelector('.service-card');
                      if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      else contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    setTimeout(() => window.dispatchEvent(new Event('highlight-phone')), 800);
                  }, 500);
                }, 100);
              }}>
                <Button className="w-full studio-button">{t('blog.articles.compression.contactFormButton')}</Button>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprendreCompression;
