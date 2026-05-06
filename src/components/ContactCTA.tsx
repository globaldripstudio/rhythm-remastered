import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ContactCTAProps {
  className?: string;
  title?: string;
  description?: string;
  cta?: string;
}

/**
 * Bicolor "Demander un devis" call-to-action box. Mirrors the Header's
 * behavior: scrolls smoothly to #contact when on the homepage, otherwise
 * navigates back to "/" then scrolls. Always triggers the phone highlight.
 */
const ContactCTA = ({
  className = "",
  title = "Vous aussi, donnez vie à votre projet au studio",
  description = "Enregistrement, mixage, mastering — contactez-nous pour discuter de votre projet et obtenir un devis personnalisé.",
  cta = "Demander un devis",
}: ContactCTAProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToContact = () => {
    const target = document.getElementById("contact");
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.pageYOffset - 100;
    window.scrollTo({ top: y, behavior: "smooth" });
    setTimeout(() => window.dispatchEvent(new CustomEvent("highlight-phone")), 800);
  };

  const handleClick = () => {
    if (location.pathname === "/") {
      scrollToContact();
    } else {
      navigate("/");
      setTimeout(scrollToContact, 500);
    }
  };

  return (
    <div className={`bg-gradient-hero rounded-2xl p-6 sm:p-8 border border-border ${className}`}>
      <h3 className="text-xl sm:text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <div className="flex justify-center">
        <Button className="studio-button" onClick={handleClick}>
          {cta}
        </Button>
      </div>
    </div>
  );
};

export default ContactCTA;
