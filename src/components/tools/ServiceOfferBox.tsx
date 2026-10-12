import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import ServiceModal from "@/components/ServiceModal";
import BuyServiceButton from "@/components/BuyServiceButton";
import { servicesData } from "@/components/Services";

interface Props {
  /** i18n key under offers.* for the heading/intro. */
  context: "audio2midi" | "loudness" | "aisong" | "chords";
  serviceIds: string[];
  className?: string;
}

/**
 * Sober post-result block: shows relevant fixed-price studio offers with
 * "More info" (opens the service card with its audio examples) and "Buy".
 */
const ServiceOfferBox = ({ context, serviceIds, className = "" }: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<typeof servicesData[0] | null>(null);
  const services = serviceIds
    .map((id) => servicesData.find((s) => s.id === id))
    .filter(Boolean) as typeof servicesData;

  return (
    <section className={`rounded-md border border-border bg-background/40 p-4 sm:p-5 ${className}`} aria-labelledby={`offer-${context}`}>
      <h2 id={`offer-${context}`} className="text-lg font-bold text-foreground sm:text-xl">
        {t(`offers.${context}.title`)}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t(`offers.${context}.intro`)}</p>
      <div className={`mt-4 grid gap-3 ${services.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {services.map((s) => (
          <div key={s.id} className="flex flex-col rounded-md border border-border/60 bg-muted/20 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-foreground">{t(`services.data.${s.id}.title`, s.title)}</p>
              <p className="shrink-0 text-lg font-bold text-primary">{s.price}</p>
            </div>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
              {t(`services.data.${s.id}.description`, s.description)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(s)}>
                {t("services.moreInfo")}
              </Button>
              <BuyServiceButton size="sm" serviceId={s.id} source={context} />
            </div>
          </div>
        ))}
      </div>
      <ServiceModal service={open} open={!!open} onClose={() => setOpen(null)} />
    </section>
  );
};

export default ServiceOfferBox;
