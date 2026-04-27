import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gauge, Menu, Phone, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleLanguage = () => {
    document.body.classList.add('lang-switching');
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
    setTimeout(() => document.body.classList.remove('lang-switching'), 500);
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const yOffset = -100;
      const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('highlight-phone'));
      }, 800);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border" role="banner">
      <div className="container mx-auto px-4 py-4 xl:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/493b7d12-09ef-4eb1-a8f1-6575bee3334a.png" 
              alt="Global Drip Studio"
              className="w-12 h-12 object-contain"
            />
            <div>
              <div className="text-lg font-bold">GLOBAL DRIP</div>
              <div className="text-sm text-muted-foreground">Studio</div>
            </div>
          </div>

          {/* Desktop Navigation - Espacement normalisé */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-3 xl:space-x-4" aria-label="Navigation principale">
            <a href="#accueil" className="nav-link text-sm lg:text-base">{t('nav.home')}</a>
            <a href="#services" className="nav-link text-sm lg:text-base">{t('nav.services')}</a>
            <a href="#equipement" className="nav-link text-sm lg:text-base">{t('nav.equipment')}</a>
            <a href="#contact" className="nav-link text-sm lg:text-base">{t('nav.contact')}</a>
            <span className="text-muted-foreground/50">|</span>
            <a href="/projets" className="nav-link text-sm lg:text-base text-muted-foreground">{t('nav.projects')}</a>
            <a href="/blog" className="nav-link text-sm lg:text-base text-muted-foreground">{t('nav.blog')}</a>
            <span className="relative inline-flex items-center cursor-not-allowed mr-1">
              <span className="text-muted-foreground/50 text-sm lg:text-base">{t('nav.shop')}</span>
              <span className="absolute -top-3 -right-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium leading-none text-primary-foreground whitespace-nowrap">
                {t('nav.shopSoon')}
              </span>
            </span>
            <span className="text-muted-foreground/50">|</span>
            <a href="/loudness" className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/20 px-2 py-1 text-xs lg:text-sm font-medium text-muted-foreground transition-colors hover:border-primary/70 hover:bg-primary/10 hover:text-foreground lg:px-2.5 lg:py-1.5">
              <Gauge className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary transition-transform group-hover:rotate-12" aria-hidden="true" />
              {t('nav.loudness')}
            </a>
          </nav>

          {/* Contact Info & CTA & Language Switch */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            <a href="tel:+33659797342" className="hidden xl:flex items-center space-x-1.5 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground 2xl:text-sm">
              <Phone className="w-4 h-4" />
              <span>+33 6 59 79 73 42</span>
            </a>
            <Button variant="default" className="studio-button" onClick={scrollToContact}>
              {t('nav.book')}
            </Button>
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/50 hover:border-border"
              aria-label="Switch language"
            >
              <span className={i18n.language === 'fr' ? 'text-foreground font-bold' : ''}>FR</span>
              <span className="text-muted-foreground/40">|</span>
              <span className={i18n.language === 'en' ? 'text-foreground font-bold' : ''}>EN</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Language Switch */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/50"
              aria-label="Switch language"
            >
              <span className={i18n.language === 'fr' ? 'text-foreground font-bold' : ''}>FR</span>
              <span className="text-muted-foreground/40">|</span>
              <span className={i18n.language === 'en' ? 'text-foreground font-bold' : ''}>EN</span>
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 text-foreground hover:text-primary transition-colors"
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div id="mobile-navigation" className="md:hidden mt-4 py-4 border-t border-border animate-fade-in" role="navigation" aria-label="Navigation mobile">
            <nav className="flex flex-col space-y-4">
              <a href="#accueil" className="py-2 nav-link" onClick={toggleMenu}>{t('nav.home')}</a>
              <a href="#services" className="py-2 nav-link" onClick={toggleMenu}>{t('nav.services')}</a>
              <a href="#equipement" className="py-2 nav-link" onClick={toggleMenu}>{t('nav.equipment')}</a>
              <a href="#contact" className="py-2 nav-link" onClick={toggleMenu}>{t('nav.contact')}</a>
              <div className="border-t border-border my-2"></div>
              <a href="/projets" className="py-2 nav-link text-muted-foreground" onClick={toggleMenu}>{t('nav.projects')}</a>
              <a href="/blog" className="py-2 nav-link text-muted-foreground" onClick={toggleMenu}>{t('nav.blog')}</a>
              <span className="py-2 relative inline-flex items-center cursor-not-allowed">
                <span className="text-muted-foreground/50">{t('nav.shop')}</span>
                <span className="ml-2 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {t('nav.shopSoon')}
                </span>
              </span>
              <a href="/loudness" className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-3 text-muted-foreground transition-colors hover:border-primary/70 hover:text-foreground" onClick={toggleMenu}>
                <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>{t('nav.loudness')}</span>
              </a>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                  <Phone className="w-4 h-4" />
                  <span>+33 6 59 79 73 42</span>
                </div>
                <Button variant="default" className="studio-button w-full" onClick={() => { 
                  toggleMenu(); 
                  scrollToContact();
                }}>
                  {t('nav.book')}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
