import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Gauge, KeyRound, Drum, Music2, Music4 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BlogArticleHeader from "@/components/blog/BlogArticleHeader";
import ShareButtons from "@/components/blog/ShareButtons";
import ContactCTA from "@/components/ContactCTA";
import SEO from "@/components/SEO";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schemas";
import { getLangFromPath } from "@/lib/localizedRoutes";

const TOOL_KEYS = [
  { icon: Gauge, to: "/loudness", key: "loudness" },
  { icon: KeyRound, to: "/key-bpm-finder", key: "keybpm" },
  { icon: Drum, to: "/tap-tempo-metronome", key: "tempo" },
  { icon: Music2, to: "/chord-progression", key: "chords" },
  { icon: Music4, to: "/audio-to-midi", key: "audio2midi" },
] as const;

const ToolkitArticle = () => {
  const { t } = useTranslation();
  const slug = "toolkit-audio-gratuit-en-ligne";
  const enSlug = "free-online-audio-toolkit";
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const frPath = `/blog/${slug}`;
  const enPath = `/en/blog/${enSlug}`;
  const canonicalPath = lang === "en" ? enPath : frPath;
  const title = t("blog.articles.toolkit.title");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("seo.toolkitArticle.title")}
        description={t("seo.toolkitArticle.description")}
        path={canonicalPath}
        type="article"
        locale={lang === "en" ? "en_US" : "fr_FR"}
        publishedTime="2026-05-06"
        modifiedTime="2026-05-06"
        alternates={[
          { hrefLang: "fr", path: frPath },
          { hrefLang: "en", path: enPath },
          { hrefLang: "x-default", path: frPath },
        ]}
        jsonLd={[
          articleSchema({
            title,
            description: t("seo.toolkitArticle.description"),
            path: canonicalPath,
            image: "/lovable-uploads/toolkit-article-cover.jpg",
            datePublished: "2026-05-06",
            section: "Toolkit",
          }),
          breadcrumbSchema([
            { name: "Blog", path: lang === "en" ? "/en/blog" : "/blog" },
            { name: title, path: canonicalPath },
          ]),
        ]}
      />
      <BlogArticleHeader />

      <article className="py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <header className="mb-8 sm:mb-12">
            <Badge className="bg-secondary text-secondary-foreground mb-4">
              <Wrench className="w-4 h-4 mr-2" />
              {t("blog.articles.toolkit.badge")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-6">
              {t("blog.articles.toolkit.subtitle")}
            </p>
            <div className="flex items-center text-sm text-muted-foreground mb-6">
              <span>{t("blog.articles.toolkit.meta")}</span>
            </div>
            <ShareButtons url={`https://globaldripstudio.fr${canonicalPath}`} />
          </header>

          <div className="prose prose-lg max-w-none text-foreground">
            <p
              className="text-base sm:text-lg mb-6"
              dangerouslySetInnerHTML={{ __html: t("blog.articles.toolkit.intro") }}
            />

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  {t("blog.articles.toolkit.whyTitle")}
                </h2>
                <p
                  className="text-muted-foreground mb-3"
                  dangerouslySetInnerHTML={{ __html: t("blog.articles.toolkit.whyP1") }}
                />
                <p className="text-muted-foreground">{t("blog.articles.toolkit.whyP2")}</p>
              </CardContent>
            </Card>

            <h2 className="text-2xl sm:text-3xl font-bold mb-6 mt-10">
              {t("blog.articles.toolkit.toolsTitle")}
            </h2>

            <div className="space-y-6 mb-10">
              {TOOL_KEYS.map(({ icon: Icon, to, key }) => (
                <Card key={to} className="bg-gradient-to-r from-secondary/10 to-primary/10 border-border">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="rounded-lg bg-primary/15 p-2.5 shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                          <Link to={to} className="hover:text-primary transition-colors">
                            {t(`blog.articles.toolkit.tools.${key}.name`)}
                          </Link>
                        </h3>
                      </div>
                    </div>
                    <p
                      className="text-muted-foreground mb-3"
                      dangerouslySetInnerHTML={{ __html: t(`blog.articles.toolkit.tools.${key}.short`) }}
                    />
                    <p className="text-sm text-muted-foreground/90">
                      <strong className="text-foreground">
                        {t("blog.articles.toolkit.useCaseLabel")}
                      </strong>{" "}
                      {t(`blog.articles.toolkit.tools.${key}.use`)}
                    </p>
                    <div className="mt-4">
                      <Link
                        to={to}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                      >
                        {t("blog.articles.toolkit.openTool")}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-8 bg-gradient-to-r from-primary/15 to-primary/5 border-primary/30">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  {t("blog.articles.toolkit.loudnessSpotlightTitle")}
                </h2>
                <p
                  className="text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: t("blog.articles.toolkit.loudnessSpotlightP") }}
                />
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-secondary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  {t("blog.articles.toolkit.philosophyTitle")}
                </h2>
                <p
                  className="text-muted-foreground mb-3"
                  dangerouslySetInnerHTML={{ __html: t("blog.articles.toolkit.philosophyP1") }}
                />
                <p
                  className="text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: t("blog.articles.toolkit.philosophyP2") }}
                />
              </CardContent>
            </Card>

            <ContactCTA />
          </div>

          <div className="mt-10 pt-6 border-t border-border">
            <ShareButtons url={`https://globaldripstudio.fr${canonicalPath}`} />
          </div>
        </div>
      </article>
    </div>
  );
};

export default ToolkitArticle;
