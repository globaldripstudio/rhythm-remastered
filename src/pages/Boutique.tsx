import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Check, Download, FileText, Play, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { getLangFromPath, mirrorPath } from "@/lib/localizedRoutes";
import EbookSellingBlocks from "@/components/EbookSellingBlocks";
import { breadcrumbSchema, ebookProductSchema } from "@/lib/seo/schemas";

const Boutique = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const homePath = lang === "en" ? "/en" : "/";
  const [isLoading, setIsLoading] = useState(false);

  const toggleLanguage = () => {
    document.body.classList.add("lang-switching");
    navigate(mirrorPath(pathname) ?? homePath);
    setTimeout(() => document.body.classList.remove("lang-switching"), 500);
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(t("boutique.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: FileText, title: t("boutique.meta1"), desc: t("boutique.meta1Desc") },
    { icon: Play, title: t("boutique.meta2"), desc: t("boutique.meta2Desc") },
    { icon: Zap, title: t("boutique.meta3"), desc: t("boutique.meta3Desc") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("boutique.seo.title")}
        description={t("boutique.seo.description")}
        path={lang === "en" ? "/en/shop" : "/boutique"}
        locale={lang === "en" ? "en_US" : "fr_FR"}
        alternates={[
          { hrefLang: "fr", path: "/boutique" },
          { hrefLang: "en", path: "/en/shop" },
          { hrefLang: "x-default", path: "/boutique" },
        ]}
        jsonLd={[
          ebookProductSchema({
            name: t("boutique.title"),
            description: t("boutique.seo.description"),
            path: lang === "en" ? "/en/shop" : "/boutique",
            price: "89",
            inLanguage: "fr",
          }),
          breadcrumbSchema([
            { name: lang === "en" ? "Home" : "Accueil", path: homePath },
            { name: lang === "en" ? "Shop" : "Boutique", path: lang === "en" ? "/en/shop" : "/boutique" },
          ]),
        ]}
      />
      {/* Header — same standalone style as the Ebook page */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link to={homePath} className="flex items-center space-x-2 sm:space-x-3">
                <img
                  src="/lovable-uploads/logo-blanc-sans-fond.png"
                  alt="Global Drip Studio"
                  className="h-6 sm:h-8 object-contain"
                />
              </Link>
              <Link to={homePath}>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">← {t("nav.backHome")}</span>
                  <span className="sm:hidden">← {t("nav.backHomeShort")}</span>
                </Button>
              </Link>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/50 hover:border-border"
              aria-label="Switch language"
            >
              <span className={i18n.language === "fr" ? "text-foreground font-bold" : ""}>FR</span>
              <span className="text-muted-foreground/40">|</span>
              <span className={i18n.language === "en" ? "text-foreground font-bold" : ""}>EN</span>
            </button>
          </div>
        </div>
      </header>

      <section className="pt-10 sm:pt-16 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
              <BookOpen className="w-4 h-4 mr-2" />
              {t("boutique.badge")}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">{t("boutique.title")}</h1>
            <p className="text-primary font-medium mb-3">{t("boutique.tagline")}</p>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl leading-relaxed">{t("boutique.subtitle")}</p>

            <Card className="p-6 md:p-10 bg-card/50 backdrop-blur border-border/50">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                {/* Couverture */}
                <div className="relative">
                  <div className="aspect-[3/4] max-w-sm mx-auto rounded-lg overflow-hidden shadow-2xl border border-primary/20">
                    <img
                      src="/lovable-uploads/ebook-cover.jpg"
                      alt={t("boutique.title")}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                </div>

                {/* Détails */}
                <div>
                  <div className="space-y-4 mb-8">
                    {features.map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{title}</h4>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted/30 rounded-xl p-6 mb-6 border border-border/50">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-4xl font-bold text-foreground">{t("boutique.price")}</span>
                      <span className="text-sm text-muted-foreground">{t("boutique.immediateAccess")}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Check className="w-4 h-4 text-primary" />
                        {t("boutique.feat1")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="w-4 h-4 text-primary" />
                        {t("boutique.feat2")}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full studio-button text-lg h-14"
                    onClick={handlePurchase}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      t("boutique.buying")
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        {t("boutique.buy")}
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center mt-4">{t("boutique.secure")}</p>
                </div>
              </div>
            </Card>
          </div>
          <EbookSellingBlocks />
          <div className="max-w-md mx-auto mt-12">
            <Button size="lg" className="w-full studio-button text-lg h-14" onClick={handlePurchase} disabled={isLoading}>
              {isLoading ? t("boutique.buying") : t("boutique.buy")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Boutique;
