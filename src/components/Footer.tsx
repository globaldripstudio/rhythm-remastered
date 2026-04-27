import { Instagram, Facebook, Mail, Phone, MapPin, Gauge } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const footerServices = [
  { labelKey: "services.data.mixage-mastering.title", id: "mixage-mastering" },
  { labelKey: "services.data.mixage-mastering-express.title", id: "mixage-mastering-express" },
  { labelKey: "services.data.sound-design.title", id: "sound-design" },
  { labelKey: "services.data.composition.title", id: "composition" },
];

interface FooterProps {
  onOpenService?: (serviceId: string) => void;
}

const Footer = ({ onOpenService }: FooterProps) => {
  const { t } = useTranslation();

  const handleServiceClick = (e: React.MouseEvent, serviceId: string) => {
    e.preventDefault();
    if (onOpenService) {
      onOpenService(serviceId);
    } else {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-card border-t border-border" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <img src="/lovable-uploads/logo-blanc.png" alt="Global Drip Studio Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
              <div>
                <div className="text-base sm:text-lg font-bold">GLOBAL DRIP</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Worldwide</div>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex space-x-3 sm:space-x-4" role="list" aria-label="Réseaux sociaux">
              <a href="https://www.instagram.com/globaldripstudio/?hl=fr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61561645792033" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Services */}
          <nav aria-label="Services">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">{t('footer.servicesTitle')}</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-muted-foreground">
              {footerServices.map((service) => (
                <li key={service.id}>
                  <button onClick={(e) => handleServiceClick(e, service.id)} className="hover:text-primary transition-colors text-left">
                    {t(service.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('footer.pagesTitle')}>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">{t('footer.pagesTitle')}</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-muted-foreground">
              <li><Link to="/projets" className="hover:text-primary transition-colors">{t('nav.projects')}</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">{t('nav.blog')}</Link></li>
              <li>
                <Link to="/loudness" className="group mt-2 flex rounded-md border border-border bg-background/40 p-3 transition-colors hover:border-primary/60 hover:bg-muted/30">
                  <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="ml-2">
                    <span className="block font-semibold text-foreground group-hover:text-primary">{t('footer.loudnessTitle')}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{t('footer.loudnessDesc')}</span>
                  </span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <address className="not-italic">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">{t('footer.contactTitle')}</h3>
            <div className="space-y-2 sm:space-y-3 text-muted-foreground">
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-xs sm:text-sm">8 allée des ajoncs<br />13500 Martigues</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" aria-hidden="true" />
                <a href="tel:+33659797342" className="text-xs sm:text-sm hover:text-primary transition-colors">+33 6 59 79 73 42</a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" aria-hidden="true" />
                <a href="mailto:globaldripstudio@gmail.com" className="text-xs sm:text-sm hover:text-primary transition-colors">globaldripstudio@gmail.com</a>
              </div>
            </div>
          </address>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6 sm:pt-8 mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {t('footer.copyright')}
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <a href="/mentions-legales" className="hover:text-primary transition-colors">{t('footer.legal')}</a>
              <a href="/politique-confidentialite" className="hover:text-primary transition-colors">{t('footer.privacy')}</a>
              <a href="/cgv" className="hover:text-primary transition-colors">{t('footer.terms')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
