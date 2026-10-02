import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/hooks/usePageTracking";

interface ContactCTAProps {
  className?: string;
  title?: string;
  description?: string;
  cta?: string;
}

/**
 * Bicolor "Demander un devis" call-to-action box. Always scrolls to the
 * #contact section (never #services). When called from another route, navigates
 * home and polls for the section to appear before scrolling, so the page never
 * "lands" on Services first.
 */
const ContactCTA = ({
  className = "",
  title,
  description,
  cta,
}: ContactCTAProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const resolvedTitle = title ?? t("toolkit.cta.title");
  const resolvedDescription = description ?? t("toolkit.cta.description");
  const resolvedCta = cta ?? t("toolkit.cta.button");

  const scrollToContact = () => {
    const target = document.getElementById("contact");
    if (!target) return false;
    const y = target.getBoundingClientRect().top + window.pageYOffset - 100;
    window.scrollTo({ top: y, behavior: "smooth" });
    setTimeout(() => window.dispatchEvent(new CustomEvent("highlight-phone")), 800);
    return true;
  };

  const waitAndScroll = () => {
    const start = Date.now();
    const tick = () => {
      if (scrollToContact()) return;
      if (Date.now() - start > 1500) return;
      requestAnimationFrame(tick);
    };
    tick();
  };

  const handleClick = () => {
    trackCTAClick(`devis_box:${location.pathname}`);
    if (location.pathname === "/") {
      scrollToContact();
    } else {
      navigate("/");
      waitAndScroll();
    }
  };

  return (
    <div className={`bg-gradient-hero rounded-2xl p-6 sm:p-8 border border-border ${className}`}>
      <h3 className="text-xl sm:text-2xl font-bold mb-4">{resolvedTitle}</h3>
      <p className="text-muted-foreground mb-6">{resolvedDescription}</p>
      <div className="flex justify-center">
        <Button className="studio-button" onClick={handleClick}>
          {resolvedCta}
        </Button>
      </div>
    </div>
  );
};

export default ContactCTA;
