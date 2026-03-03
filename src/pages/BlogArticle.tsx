import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { trackBlogView } from "@/hooks/useBlogViews";
import { useTranslation } from "react-i18next";
import ComprendreCompression from "./BlogArticles/ComprendreCompression";
import BlogArticleHeader from "@/components/blog/BlogArticleHeader";

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
                Le double vinyl de l'album "Le Premier Sang" est disponible sur Bandcamp.
              </p>
            </div>

            <p className="mb-6">
              Venin est un groupe de rock français incontournable, né à Marseille en 1983. Alliant l'énergie brute du hard rock à des influences heavy en passant par le blues, Venin inscrit son nom sur la carte de la scène nationale grâce à ses textes chantés en français et son identité musicale singulière.
            </p>

            <p className="mb-6">
              Malgré une pause à la fin de la décennie, Venin renaît dans les années 2010, retrouvant son public fidèle et une dynamique de création renouvelée.
            </p>

            <p className="mb-6">
              Pour leur dernier album, "Le Premier Sang", j'ai eu le plaisir d'accueillir Venin au Global Drip Studio, où j'ai assuré l'édition, le mixage et le mastering des 9 titres inédits, ainsi que l'enregistrement des voix, des parties solo, et quelques arrangements claviers.
            </p>

            <h3 className="text-2xl font-bold mb-4">L'album a été entièrement pensé pour sonner eighties :</h3>

            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Des compositions typiques des grandes années du hard/heavy metal.</li>
              <li>Tous les musiciens ont été enregistrés en même temps, en réseau.</li>
              <li>Aucune partie n'a été copiée/collée.</li>
              <li>Pas d'utilisation de trig.</li>
            </ul>

            <div className="mb-8">
              <img src="/lovable-uploads/jean-marc-battini.jpg" alt="Jean-Marc Battini" className="w-full max-w-none h-auto rounded-lg" />
              <p className="text-sm italic text-muted-foreground mt-2 text-center">Jean-Marc Battini, fondateur de Venin</p>
            </div>

            <p className="mb-6">
              L'album "Le Premier Sang" est disponible sur toutes les plateformes : <a href="https://venin1.bandcamp.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://venin1.bandcamp.com/</a>
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
    if (slug === "comprendre-la-compression") {
      return {
        title: t('blog.cards.compression.title'),
        author: "Global Drip Studio",
        date: "2024-12-10",
        readTime: "5 min",
        category: t('blog.cards.compression.category'),
        content: <ComprendreCompression />
      };
    }
    return null;
  };

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

  return (
    <div className="min-h-screen bg-background">
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
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-muted-foreground text-sm">
              <span>{article.author}</span>
              <span>{article.date}</span>
              <span>{article.readTime}</span>
            </div>
          </div>
          <div className="text-foreground leading-relaxed">{article.content}</div>
        </div>
      </article>
    </div>
  );
};

export default BlogArticle;
