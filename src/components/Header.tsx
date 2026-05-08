import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Drum, Gauge, KeyRound, Menu, Music2, Music4, Phone, Wrench, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trackCTAClick } from "@/hooks/usePageTracking";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (!isMenuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isMenuOpen]);

  const toggleLanguage = () => {
    document.body.classList.add('lang-switching');
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
    setTimeout(() => document.body.classList.remove('lang-switching'), 500);
  };

  const scrollToContact = () => {
    trackCTAClick('devis_header');
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
            {/* Toolkit dropdown — opens on hover, no click needed */}
            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/20 px-2 py-1 text-xs lg:text-sm font-medium text-muted-foreground transition-colors group-hover:border-primary/70 group-hover:bg-primary/10 group-hover:text-foreground lg:px-2.5 lg:py-1.5"
                aria-haspopup="menu"
                aria-expanded="false"
              >
                <Wrench className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary transition-transform group-hover:rotate-12" aria-hidden="true" />
                {t('nav.toolkit')}
                <ChevronDown className="h-3 w-3 lg:h-3.5 lg:w-3.5 transition-transform group-hover:rotate-180" aria-hidden="true" />
              </button>
              {/* Invisible bridge so the cursor can travel from button to menu without flicker */}
              <div className="absolute left-0 right-0 top-full h-2" aria-hidden="true" />
              <div
                role="menu"
                className="invisible absolute left-1/2 top-[calc(100%+0.5rem)] z-50 w-64 -translate-x-1/2 translate-y-1 rounded-xl border border-border bg-card/95 p-2 opacity-0 shadow-xl backdrop-blur-lg transition-all duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
              >
                <a
                  href="/loudness"
                  role="menuitem"
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
                >
                  <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{t('nav.loudness')}</span>
                    <span className="block text-xs text-muted-foreground">{t('nav.loudnessDesc')}</span>
                  </span>
                </a>
                <a
                  href="/key-bpm-finder"
                  role="menuitem"
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
                >
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{t('nav.keybpm')}</span>
                    <span className="block text-xs text-muted-foreground">{t('nav.keybpmDesc')}</span>
                  </span>
                </a>
                <a
                  href="/tap-tempo-metronome"
                  role="menuitem"
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
                >
                  <Drum className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{t('nav.tempoTools')}</span>
                    <span className="block text-xs text-muted-foreground">{t('nav.tempoToolsDesc')}</span>
                  </span>
                </a>
                <a
                  href="/chord-progression"
                  role="menuitem"
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
                >
                  <Music2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Accords & gammes</span>
                    <span className="block text-xs text-muted-foreground">Progressions, piano & guitare interactifs</span>
                  </span>
                </a>
                <a
                  href="/audio-to-midi"
                  role="menuitem"
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
                >
                  <Music4 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Audio → MIDI</span>
                    <span className="block text-xs text-muted-foreground">Conversion polyphonique locale</span>
                  </span>
                </a>
              </div>
            </div>
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

      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-x-0 top-[72px] bottom-0 z-40"
          onClick={closeMenu}
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-fade-in" />
          <div
            id="mobile-navigation"
            role="navigation"
            aria-label="Navigation mobile"
            onClick={(e) => e.stopPropagation()}
            className="relative mx-3 mt-2 max-h-[calc(100vh-100px)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-lg animate-fade-in"
          >
            <nav className="flex flex-col p-4 space-y-1">
              <a href="#accueil" className="py-2.5 px-2 rounded-md nav-link hover:bg-primary/10" onClick={closeMenu}>{t('nav.home')}</a>
              <a href="#services" className="py-2.5 px-2 rounded-md nav-link hover:bg-primary/10" onClick={closeMenu}>{t('nav.services')}</a>
              <a href="#equipement" className="py-2.5 px-2 rounded-md nav-link hover:bg-primary/10" onClick={closeMenu}>{t('nav.equipment')}</a>
              <a href="#contact" className="py-2.5 px-2 rounded-md nav-link hover:bg-primary/10" onClick={closeMenu}>{t('nav.contact')}</a>

              <div className="border-t border-border my-2" />

              <a href="/projets" className="py-2.5 px-2 rounded-md nav-link text-muted-foreground hover:bg-primary/10" onClick={closeMenu}>{t('nav.projects')}</a>
              <a href="/blog" className="py-2.5 px-2 rounded-md nav-link text-muted-foreground hover:bg-primary/10" onClick={closeMenu}>{t('nav.blog')}</a>
              <span className="py-2.5 px-2 relative inline-flex items-center cursor-not-allowed">
                <span className="text-muted-foreground/50">{t('nav.shop')}</span>
                <span className="ml-2 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {t('nav.shopSoon')}
                </span>
              </span>

              <div className="mt-2 rounded-xl border border-border bg-muted/20 p-2">
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Wrench className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {t('nav.toolkit')}
                </div>
                <a href="/loudness" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" onClick={closeMenu}>
                  <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>{t('nav.loudness')}</span>
                </a>
                <a href="/key-bpm-finder" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" onClick={closeMenu}>
                  <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>{t('nav.keybpm')}</span>
                </a>
                <a href="/tap-tempo-metronome" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" onClick={closeMenu}>
                  <Drum className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>{t('nav.tempoTools')}</span>
                </a>
                <a href="/chord-progression" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" onClick={closeMenu}>
                  <Music2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>Accords & gammes</span>
                </a>
                <a href="/audio-to-midi" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" onClick={closeMenu}>
                  <Music4 className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>Audio → MIDI</span>
                </a>
              </div>

              <div className="pt-4 mt-2 border-t border-border">
                <a href="tel:+33659797342" className="flex items-center space-x-2 text-sm text-muted-foreground mb-3 px-2">
                  <Phone className="w-4 h-4" />
                  <span>+33 6 59 79 73 42</span>
                </a>
                <Button variant="default" className="studio-button w-full" onClick={() => {
                  closeMenu();
                  scrollToContact();
                }}>
                  {t('nav.book')}
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
