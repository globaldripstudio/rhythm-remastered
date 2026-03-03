import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BlogArticleHeader = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    document.body.classList.add('lang-switching');
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
    setTimeout(() => document.body.classList.remove('lang-switching'), 500);
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/lovable-uploads/logo-blanc-sans-fond.png"
                alt="Global Drip Studio"
                className="h-6 sm:h-8 object-contain"
              />
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">← {t('nav.backHome')}</span>
                <span className="sm:hidden">← {t('nav.backHomeShort')}</span>
              </Button>
            </Link>
            <Link to="/blog">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('nav.backBlog')}</span>
                <span className="sm:hidden">{t('nav.backBlogShort')}</span>
              </Button>
            </Link>
          </div>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/50 hover:border-border"
            aria-label="Switch language"
          >
            <span className={i18n.language === 'fr' ? 'text-foreground font-bold' : ''}>FR</span>
            <span className="text-muted-foreground/40">|</span>
            <span className={i18n.language === 'en' ? 'text-foreground font-bold' : ''}>EN</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default BlogArticleHeader;
