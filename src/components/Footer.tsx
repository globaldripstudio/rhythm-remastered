import { Instagram, Facebook, Youtube, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/logo-blanc.png" 
                alt="Global Drip Studio Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <div className="text-lg font-bold">GLOBAL DRIP</div>
                <div className="text-sm text-muted-foreground">Worldwide</div>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Studio d'enregistrement professionnel spécialisé dans le mixage, mastering audio et sound design. 
              Plus de 10 années d'expérience au service de votre créativité.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/globaldripstudio/?hl=fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61561645792033" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#services" className="hover:text-primary transition-colors">Mixage Studio</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Mastering Hybride</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Mixage + Mastering</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Projet sur mesure</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm">8 allée des ajoncs<br />13500 Martigues</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm">+33 6 59 79 73 42</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm">globaldripstudio@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 Global Drip Worldwide. Tous droits réservés.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</a>
              <a href="/politique-confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</a>
              <a href="/cgv" className="hover:text-primary transition-colors">CGV</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;