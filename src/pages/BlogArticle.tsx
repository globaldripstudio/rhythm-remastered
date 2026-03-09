import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { trackBlogView } from "@/hooks/useBlogViews";
import { useTranslation } from "react-i18next";
import ComprendreCompression from "./BlogArticles/ComprendreCompression";
import BlogArticleHeader from "@/components/blog/BlogArticleHeader";
import ShareButtons from "@/components/blog/ShareButtons";
import SEO from "@/components/SEO";

const BlogArticle = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [viewCount, setViewCount] = useState<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (slug && !["bien-mixer-une-voix", "10-techniques-sound-design"].includes(slug)) {
      trackBlogView(slug).then(count => {
        if (count) setViewCount(count);
      });
    }
  }, [slug]);

  const getArticle = () => {
    if (slug === "venin-le-premier-sang") {
      return {
        title: t('blog.cards.venin.title'),
        author: "Global Drip Studio",
        date: "2024-12-20",
        readTime: "8 min",
        category: t('blog.cards.venin.category'),
        content: <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <img src="/lovable-uploads/venin-album-cover.jpg" alt="Album Le Premier Sang de Venin" className="w-full max-w-none h-auto rounded-lg" />
              <p className="text-sm italic text-muted-foreground mt-2 text-center">
                {t('blog.articles.venin.coverCaption')}
              </p>
            </div>

            <p className="mb-6">{t('blog.articles.venin.intro1')}</p>
            <p className="mb-6">{t('blog.articles.venin.intro2')}</p>
            <p className="mb-6">{t('blog.articles.venin.intro3')}</p>

            <h3 className="text-2xl font-bold mb-4">{t('blog.articles.venin.eightiesTitle')}</h3>

            <ul className="list-disc pl-6 mb-6 space-y-3">
              <li>{t('blog.articles.venin.eighties1')}</li>
              <li>{t('blog.articles.venin.eighties2')}</li>
              <li>{t('blog.articles.venin.eighties3')}</li>
              <li>{t('blog.articles.venin.eighties4')}</li>
              <li>{t('blog.articles.venin.eighties5')}</li>
            </ul>

            <div className="mb-8">
              <img src="/lovable-uploads/jean-marc-battini.jpg" alt="Jean-Marc Battini" className="w-full max-w-none h-auto rounded-lg" />
              <p className="text-sm italic text-muted-foreground mt-2 text-center">{t('blog.articles.venin.battiniCaption')}</p>
            </div>

            <h3 className="text-2xl font-bold mb-4">{t('blog.articles.venin.technicalTitle')}</h3>

            <p className="mb-6">{t('blog.articles.venin.technicalP1')}</p>
            <p className="mb-6">{t('blog.articles.venin.technicalP2')}</p>

            <div className="bg-muted/30 rounded-lg p-4 mb-6 space-y-2 font-mono text-sm">
              <p>{t('blog.articles.venin.technicalChain1')}</p>
              <p>{t('blog.articles.venin.technicalChain2')}</p>
            </div>

            <p className="mb-6">{t('blog.articles.venin.technicalVocals')}</p>
            <p className="mb-6">{t('blog.articles.venin.technicalDrums')}</p>
            <p className="mb-6">{t('blog.articles.venin.outro')}</p>

            <div className="mb-8">
              <img src="/lovable-uploads/venin-logo-2.jpg" alt="Logo Venin" className="w-full max-w-none h-auto rounded-lg" />
              <p className="text-sm italic text-muted-foreground mt-2 text-center">{t('blog.articles.venin.logoCaption')}</p>
            </div>

            <p className="mb-6">
              {t('blog.articles.venin.availableOn')} <a href="https://venin1.bandcamp.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://venin1.bandcamp.com/</a>
            </p>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">{t('blog.articles.venin.listenOnSpotify')}</h3>
              <div className="rounded-xl overflow-hidden">
                <iframe style={{ borderRadius: '12px' }} src="https://open.spotify.com/embed/album/6RSIzijNFeHFmv4vLWhxgL?utm_source=generator" width="100%" height="352" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
              </div>
            </div>

            <div className="bg-gradient-hero rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">{t('blog.articles.venin.bringToLife')}</h3>
              <p className="text-muted-foreground mb-6">{t('blog.articles.venin.bringToLifeDesc')}</p>
              <div className="flex justify-center">
                <Button className="studio-button" onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      const formCard = contactSection.querySelector('.service-card');
                      if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      else contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    setTimeout(() => window.dispatchEvent(new Event('highlight-phone')), 800);
                  }, 500);
                }}>
                  {t('blog.articles.venin.getQuote')}
                </Button>
              </div>
            </div>
          </div>
      };
    }
    return null;
  };

  // Full-page article components that handle their own layout
  if (slug === "comprendre-la-compression") {
    return <ComprendreCompression />;
  }

  const article = getArticle();
  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t('blog.articles.venin.notFound')}</h1>
          <Link to="/blog"><Button>{t('blog.articles.venin.backToBlog')}</Button></Link>
        </div>
      </div>
    );
  }

  const seoKey = slug === "venin-le-premier-sang" ? "venin" : "compression";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t(`seo.${seoKey}.title`)}
        description={t(`seo.${seoKey}.description`)}
        path={`/blog/${slug}`}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": article.title,
          "author": { "@type": "Organization", "name": "Global Drip Studio" },
          "datePublished": article.date,
          "image": slug === "venin-le-premier-sang" ? "https://globaldripstudio.fr/lovable-uploads/venin-album-cover.jpg" : "https://globaldripstudio.fr/lovable-uploads/Image-23.jpg",
          "publisher": { "@type": "Organization", "name": "Global Drip Studio", "logo": { "@type": "ImageObject", "url": "https://globaldripstudio.fr/lovable-uploads/logo-blanc-sans-fond.png" } }
        }}
      />
      <BlogArticleHeader />

      <article className="py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">{article.category}</span>
              {viewCount && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Eye className="w-3 h-3" />
                  {viewCount} {t('blog.articles.venin.views')}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-muted-foreground text-sm mb-6">
              <span>{article.author}</span>
              <span>{article.date}</span>
              <span>{article.readTime}</span>
            </div>
            <ShareButtons url={`https://globaldripstudio.fr/blog/${slug}`} />
          </div>
          <div className="text-foreground leading-relaxed">{article.content}</div>
          <div className="mt-10 pt-6 border-t border-border">
            <ShareButtons title={article.title} url={`https://globaldripstudio.fr/blog/${slug}`} />
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogArticle;
