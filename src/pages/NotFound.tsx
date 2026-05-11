import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { getLangFromPath } from "@/lib/localizedRoutes";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const lang = getLangFromPath(location.pathname);
  const homePath = lang === "en" ? "/en" : "/";

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <meta name="robots" content="noindex, nofollow" />
        <title>
          {lang === "en"
            ? "Page not found | Global Drip Studio"
            : "Page introuvable | Global Drip Studio"}
        </title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-primary">{t('notFound.title')}</h1>
          <p className="text-xl text-muted-foreground mb-6">{t('notFound.message')}</p>
          <Link
            to={homePath}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('notFound.back')}
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
