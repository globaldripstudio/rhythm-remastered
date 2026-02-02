import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#accueil" className="nav-link">Accueil</a>
            <a href="#services" className="nav-link">Services</a>
            <a href="#equipement" className="nav-link">Équipement</a>
            <a href="#contact" className="nav-link">Contact</a>
            <span className="text-muted-foreground/50">|</span>
            <a href="/projets" className="nav-link text-muted-foreground">Projets</a>
            <span className="text-muted-foreground/50">|</span>
            <a href="/blog" className="nav-link text-muted-foreground">Blog</a>
            <span className="text-muted-foreground/50">|</span>
            <a href="/ebook" className="nav-link text-muted-foreground">Boutique</a>
          </nav>

          {/* Contact Info & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>+33 6 59 79 73 42</span>
            </div>
            <Button variant="default" className="studio-button" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              Réserver
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <a href="#accueil" className="py-2 nav-link" onClick={toggleMenu}>Accueil</a>
              <a href="#services" className="py-2 nav-link" onClick={toggleMenu}>Services</a>
              <a href="#equipement" className="py-2 nav-link" onClick={toggleMenu}>Équipement</a>
              <a href="#contact" className="py-2 nav-link" onClick={toggleMenu}>Contact</a>
              <div className="border-t border-border my-2"></div>
              <a href="/projets" className="py-2 nav-link text-muted-foreground" onClick={toggleMenu}>Projets</a>
              <a href="/blog" className="py-2 nav-link text-muted-foreground" onClick={toggleMenu}>Blog</a>
              <a href="/ebook" className="py-2 nav-link text-muted-foreground" onClick={toggleMenu}>Boutique</a>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                  <Phone className="w-4 h-4" />
                  <span>+33 6 59 79 73 42</span>
                </div>
                <Button variant="default" className="studio-button w-full" onClick={() => { toggleMenu(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  Réserver
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