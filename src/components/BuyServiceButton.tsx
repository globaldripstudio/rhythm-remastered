import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/** Services that can be bought online at a fixed price. */
export const BUYABLE_SERVICE_IDS = [
  "mixage-mastering",
  "mixage-mastering-express",
  "stem-mastering",
  "mixage-hybride",
] as const;

export const isBuyableService = (id: string) => (BUYABLE_SERVICE_IDS as readonly string[]).includes(id);

interface Props extends Omit<ButtonProps, "onClick"> {
  serviceId: string;
  source?: string;
}

const BuyServiceButton = ({ serviceId, source, className, variant, children, ...rest }: Props) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleBuy = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    } catch (err) {
      tab?.close();
      console.error("checkout failed", err);
      toast({ title: t("buy.errorTitle"), description: t("buy.errorDesc"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleBuy} disabled={loading} variant={variant ?? "default"} className={className} {...rest}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
      {children ?? t("buy.cta")}
    </Button>
  );
};

export default BuyServiceButton;
