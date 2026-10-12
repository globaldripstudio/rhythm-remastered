import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ShoppingCart, CalendarCheck, ShieldCheck } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/** Services that can be bought online at a fixed price. */
export const BUYABLE_SERVICE_IDS = [
  "mixage-mastering",
  "mixage-mastering-express",
  "stem-mastering",
  "mixage-hybride",
] as const;

/** Services booked through the contact form (second card button = "Réserver"). */
export const BOOKABLE_SERVICE_IDS = [
  "captation-sonore",
  "direction-artistique",
  "composition",
  "sound-design",
  "formation",
  "pack-single",
] as const;

export const isBuyableService = (id: string) => (BUYABLE_SERVICE_IDS as readonly string[]).includes(id);
export const isBookableService = (id: string) => (BOOKABLE_SERVICE_IDS as readonly string[]).includes(id);

/** Scrolls to the contact form and highlights the phone number (global CTA behaviour). */
export const scrollToContact = (delay = 0) => {
  setTimeout(() => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      const formCard = contactSection.querySelector(".service-card");
      (formCard ?? contactSection).scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => window.dispatchEvent(new Event("highlight-phone")), 800);
  }, delay);
};

export const BookServiceButton = ({ className, onBeforeScroll }: { className?: string; onBeforeScroll?: () => void }) => {
  const { t } = useTranslation();
  return (
    <Button
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        onBeforeScroll?.();
        scrollToContact(onBeforeScroll ? 300 : 0);
      }}
    >
      <CalendarCheck className="mr-2 h-4 w-4" />
      {t("buy.book")}
    </Button>
  );
};

interface Props extends Omit<ButtonProps, "onClick"> {
  serviceId: string;
  source?: string;
}

const BuyServiceButton = ({ serviceId, source, className, variant, children, ...rest }: Props) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleBuy = async () => {
    if (loading) return;
    setLoading(true);
    // Open the tab synchronously so popup blockers allow it.
    const tab = window.open("", "_blank");
    try {
      supabase.from("site_analytics").insert({
        event_type: "checkout_start",
        page_path: window.location.pathname,
        button_name: `${serviceId}${source ? `:${source}` : ""}`,
      }).then(() => {});
      const { data, error } = await supabase.functions.invoke("create-service-payment", {
        body: { serviceId, lang: i18n.language?.startsWith("en") ? "en" : "fr" },
      });
      if (error || !data?.url) throw error ?? new Error("no url");
      if (tab) tab.location.href = data.url;
      else window.location.href = data.url;
      setOpen(false);
    } catch (err) {
      tab?.close();
      console.error("checkout failed", err);
      toast({ title: t("buy.errorTitle"), description: t("buy.errorDesc"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const serviceTerms: Record<string, { turnaround: string; revisions: number }> = {
    "mixage-mastering": { turnaround: t("buy.turnarounds.threeToFiveDays"), revisions: 3 },
    "mixage-mastering-express": { turnaround: t("buy.turnarounds.oneToTwoDays"), revisions: 2 },
    "stem-mastering": { turnaround: t("buy.turnarounds.oneToTwoDays"), revisions: 2 },
    "mixage-hybride": { turnaround: t("buy.turnarounds.threeToFiveDays"), revisions: 2 },
  };
  const terms = serviceTerms[serviceId];
  const steps = [
    t("buy.step1"),
    t("buy.step2"),
    terms ? t("buy.step3", { turnaround: terms.turnaround, count: terms.revisions }) : t("buy.step3Fallback"),
  ];

  return (
    <>
      <Button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        variant={variant ?? "default"}
        className={className}
        {...rest}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {children ?? t("buy.cta")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{t("buy.confirmTitle")}</DialogTitle>
            <DialogDescription>{t("buy.confirmIntro")}</DialogDescription>
          </DialogHeader>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{i + 1}</span>
                <span className="text-muted-foreground">{s}</span>
              </li>
            ))}
          </ol>
          <div className="space-y-2 pt-2">
            <Button className="w-full" onClick={handleBuy} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              {t("buy.continue")}
            </Button>
            <Button variant="ghost" className="w-full text-xs sm:text-sm whitespace-normal h-auto py-2" onClick={() => { setOpen(false); scrollToContact(300); }}>
              {t("buy.question")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BuyServiceButton;
