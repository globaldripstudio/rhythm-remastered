import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BlogArticleHeader from "@/components/blog/BlogArticleHeader";
import ShareButtons from "@/components/blog/ShareButtons";
import SEO from "@/components/SEO";

const LoudnessArticle = () => {
  const { t } = useTranslation();
  const toolItems = t("blog.articles.loudness.toolItems", { returnObjects: true }) as string[];
  const howItems = t("blog.articles.loudness.howItems", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("seo.loudnessArticle.title")}
        description={t("seo.loudnessArticle.description")}
        path="/blog/analyse-lufs-en-ligne-controle-master"
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": t("blog.articles.loudness.title"),
          "author": { "@type": "Organization", "name": "Global Drip Studio" },
          "datePublished": "2026-04-27",
          "image": "https://globaldripstudio.fr/lovable-uploads/Image-23.jpg",
          "publisher": { "@type": "Organization", "name": "Global Drip Studio", "logo": { "@type": "ImageObject", "url": "https://globaldripstudio.fr/lovable-uploads/logo-blanc-sans-fond.png" } }
        }}
      />
      <BlogArticleHeader />

      <article className="py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <header className="mb-8 sm:mb-12">
            <Badge className="bg-secondary text-secondary-foreground mb-4">
              <Gauge className="w-4 h-4 mr-2" />
              {t("blog.articles.loudness.badge")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              {t("blog.articles.loudness.title")}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-6">
              {t("blog.articles.loudness.subtitle")}
            </p>
            <div className="flex items-center text-sm text-muted-foreground mb-6">
              <span>{t("blog.articles.loudness.meta")}</span>
            </div>
            <ShareButtons url="https://globaldripstudio.fr/blog/analyse-lufs-en-ligne-controle-master" />
          </header>

          <div className="prose prose-lg max-w-none text-foreground">
            <p className="text-base sm:text-lg mb-6">{t("blog.articles.loudness.intro")}</p>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t("blog.articles.loudness.whyTitle")}</h2>
                <p className="text-muted-foreground mb-4">{t("blog.articles.loudness.whyP1")}</p>
                <p className="text-muted-foreground">{t("blog.articles.loudness.whyP2")}</p>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-border">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t("blog.articles.loudness.toolTitle")}</h2>
                <ul className="space-y-3 text-muted-foreground">
                  {toolItems.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </CardContent>
            </Card>

            <div className="bg-gradient-hero rounded-2xl p-6 sm:p-8 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">{t("blog.articles.loudness.localTitle")}</h2>
              <p className="text-muted-foreground">{t("blog.articles.loudness.localP")}</p>
            </div>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-secondary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{t("blog.articles.loudness.howTitle")}</h2>
                <ol className="space-y-3 text-muted-foreground list-decimal pl-5">
                  {howItems.map((item) => <li key={item}>{item}</li>)}
                </ol>
              </CardContent>
            </Card>

            <div className="bg-gradient-hero rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">{t("blog.articles.loudness.ctaTitle")}</h3>
              <p className="text-muted-foreground mb-6">{t("blog.articles.loudness.ctaDesc")}</p>
              <div className="flex justify-center">
                <Link to="/loudness">
                  <Button className="studio-button">{t("blog.articles.loudness.ctaButton")}</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border">
            <ShareButtons url="https://globaldripstudio.fr/blog/analyse-lufs-en-ligne-controle-master" />
          </div>
        </div>
      </article>
    </div>
  );
};

export default LoudnessArticle;
