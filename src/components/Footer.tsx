import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

// Service IDs mapping for footer links
const footerServices = [
  { label: "Mixage Studio", id: "mixage-mastering" },
  { label: "Mastering Hybride", id: "mixage-mastering" },
  { label: "Mixage + Mastering", id: "mixage-mastering" },
  { label: "Projet sur mesure", id: "direction-artistique" },
];

interface FooterProps {
  onOpenService?: (serviceId: string) => void;
}

const Footer = ({ onOpenService }: FooterProps) => {
  const handleServiceClick = (e: React.MouseEvent, serviceId: string) => {
    e.preventDefault();
    if (onOpenService) {
      onOpenService(serviceId);
    } else {
      // Fallback: scroll to services section
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand & Description */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <img 
                src="/lovable-uploads/logo-blanc.png" 
                alt="Global Drip Studio Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <div>
                <div className="text-base sm:text-lg font-bold">GLOBAL DRIP</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Worldwide</div>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md">
              Studio d'enregistrement professionnel spécialisé dans le mixage, mastering audio et sound design. 
              Plus de 10 années d'expérience au service de votre créativité.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3 sm:space-x-4">
              <a 
                href="https://www.instagram.com/globaldripstudio/?hl=fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61561645792033" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Services</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-muted-foreground">
              {footerServices.map((service) => (
                <li key={service.label}>
                  <button
                    onClick={(e) => handleServiceClick(e, service.id)}
                    className="hover:text-primary transition-colors text-left"
                  >
                    {service.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Contact</h3>
            <div className="space-y-2 sm:space-y-3 text-muted-foreground">
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm">8 allée des ajoncs<br />13500 Martigues</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm">+33 6 59 79 73 42</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm">globaldripstudio@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6 sm:pt-8 mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              © 2024 Global Drip Worldwide. Tous droits réservés.
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <a href="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</a>
              <a href="/politique-confidentialite" className="hover:text-primary transition-colors">Confidentialité</a>
              <a href="/cgv" className="hover:text-primary transition-colors">CGV</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
