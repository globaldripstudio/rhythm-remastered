import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Headphones, Volume2, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import BlogArticleHeader from "@/components/blog/BlogArticleHeader";
import { useTranslation } from "react-i18next";

const BienMixerUneVoix = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Bien mixer une voix : les 7 étapes essentielles | Global Drip Studio";
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = "Maîtrisez l'art du mixage vocal avec ces 7 étapes professionnelles.";
      document.head.appendChild(m);
    } else {
      meta.setAttribute('content', "Maîtrisez l'art du mixage vocal avec ces 7 étapes professionnelles.");
    }
  }, []);

  const step2Items = t('blog.articles.voix.step2Items', { returnObjects: true }) as string[];
  const step6Items = t('blog.articles.voix.step6Items', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-background">
      <BlogArticleHeader />

      <article className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <header className="mb-12">
            <div className="mb-6">
              <Badge className="bg-primary text-primary-foreground mb-4">
                <Headphones className="w-4 h-4 mr-2" />
                {t('blog.articles.voix.badge')}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t('blog.articles.voix.title').split('7').map((part, i) => 
                i === 0 ? <span key={i}>{part}<span className="hero-text">7</span></span> : <span key={i}>{part}</span>
              )}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">{t('blog.articles.voix.subtitle')}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{t('blog.articles.voix.meta')}</span>
            </div>
          </header>

          <div className="mb-12 rounded-2xl overflow-hidden">
            <img src="/lovable-uploads/_edited.jpg.png" alt="Console de mixage professionnel" className="w-full h-64 md:h-96 object-cover" />
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-8 italic">{t('blog.articles.voix.intro')}</p>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-primary" />
                  {t('blog.articles.voix.step1Title')}
                </h2>
                <p className="text-muted-foreground">{t('blog.articles.voix.step1Desc')}</p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{t('blog.articles.voix.step2Title')}</h2>
                <p className="text-muted-foreground mb-4">{t('blog.articles.voix.step2Desc')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  {Array.isArray(step2Items) && step2Items.map((item, i) => <li key={i}><strong>{item.split(':')[0]} :</strong>{item.split(':').slice(1).join(':')}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{t('blog.articles.voix.step3Title')}</h2>
                <p className="text-muted-foreground">{t('blog.articles.voix.step3Desc')}</p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{t('blog.articles.voix.step4Title')}</h2>
                <p className="text-muted-foreground">{t('blog.articles.voix.step4Desc')}</p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{t('blog.articles.voix.step5Title')}</h2>
                <p className="text-muted-foreground">{t('blog.articles.voix.step5Desc')}</p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Volume2 className="w-6 h-6 mr-3 text-secondary" />
                  {t('blog.articles.voix.step6Title')}
                </h2>
                <p className="text-muted-foreground mb-4">{t('blog.articles.voix.step6Desc')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  {Array.isArray(step6Items) && step6Items.map((item, i) => <li key={i}><strong>{item.split(':')[0]} :</strong>{item.split(':').slice(1).join(':')}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{t('blog.articles.voix.step7Title')}</h2>
                <p className="text-muted-foreground">{t('blog.articles.voix.step7Desc')}</p>
              </CardContent>
            </Card>

            <div className="bg-gradient-hero rounded-2xl p-8 mt-12">
              <h3 className="text-2xl font-bold mb-4">{t('blog.articles.voix.proTipTitle')}</h3>
              <p className="text-muted-foreground mb-4">{t('blog.articles.voix.proTipDesc')}</p>
              <Link to="#contact">
                <Button className="studio-button">{t('blog.articles.voix.ctaButton')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BienMixerUneVoix;
