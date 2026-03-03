import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Waves, Mic, Volume2, Layers, Zap, Sparkles, Radio, Target, Headphones, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import BlogArticleHeader from "@/components/blog/BlogArticleHeader";
import { useTranslation } from "react-i18next";

const TechniquesSoundDesign = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "10 techniques de sound design | Global Drip Studio";
  }, []);

  const t1Items = t('blog.articles.sounddesign.t1Items', { returnObjects: true }) as string[];
  const t2ParamItems = t('blog.articles.sounddesign.t2ParamItems', { returnObjects: true }) as string[];
  const t2AppItems = t('blog.articles.sounddesign.t2AppItems', { returnObjects: true }) as string[];
  const t4Items = t('blog.articles.sounddesign.t4Items', { returnObjects: true }) as string[];
  const t6Items = t('blog.articles.sounddesign.t6Items', { returnObjects: true }) as string[];
  const t7Items = t('blog.articles.sounddesign.t7Items', { returnObjects: true }) as string[];
  const t8Items = t('blog.articles.sounddesign.t8Items', { returnObjects: true }) as string[];
  const t9AppItems = t('blog.articles.sounddesign.t9AppItems', { returnObjects: true }) as string[];
  const t10Items = t('blog.articles.sounddesign.t10Items', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-background">
      <BlogArticleHeader />

      <article className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <header className="mb-12">
            <div className="mb-6">
              <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground mb-4">
                <Waves className="w-4 h-4 mr-2" />
                {t('blog.articles.sounddesign.badge')}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="hero-text">{t('blog.articles.sounddesign.title').substring(0, 14)}</span>{t('blog.articles.sounddesign.title').substring(14)}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">{t('blog.articles.sounddesign.subtitle')}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{t('blog.articles.sounddesign.meta')}</span>
            </div>
          </header>

          <div className="mb-12 rounded-2xl overflow-hidden">
            <img src="/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png" alt="Sound design setup" className="w-full h-64 md:h-96 object-cover" />
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-gradient-hero rounded-2xl p-8 mb-12">
              <p className="text-lg text-center italic mb-4">{t('blog.articles.sounddesign.intro')}</p>
              <p className="text-center text-muted-foreground">{t('blog.articles.sounddesign.introSub')}</p>
            </div>

            {/* Technique 1 */}
            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Mic className="w-8 h-8 text-primary mr-4" />
                  <h2 className="text-2xl font-bold">{t('blog.articles.sounddesign.t1Title')}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{t('blog.articles.sounddesign.t1Desc')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  {Array.isArray(t1Items) && t1Items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </CardContent>
            </Card>

            {/* Technique 2 */}
            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Sparkles className="w-8 h-8 text-secondary mr-4" />
                  <h2 className="text-2xl font-bold">{t('blog.articles.sounddesign.t2Title')}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{t('blog.articles.sounddesign.t2Desc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <h4 className="font-semibold mb-2">{t('blog.articles.sounddesign.t2Params')}</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {Array.isArray(t2ParamItems) && t2ParamItems.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('blog.articles.sounddesign.t2Apps')}</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {Array.isArray(t2AppItems) && t2AppItems.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technique 3 */}
            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-border">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Volume2 className="w-8 h-8 text-primary mr-4" />
                  <h2 className="text-2xl font-bold">{t('blog.articles.sounddesign.t3Title')}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{t('blog.articles.sounddesign.t3Desc')}</p>
                <div className="bg-background/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground italic">{t('blog.articles.sounddesign.t3Quote')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Technique 4 */}
            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Layers className="w-8 h-8 text-secondary mr-4" />
                  <h2 className="text-2xl font-bold">{t('blog.articles.sounddesign.t4Title')}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{t('blog.articles.sounddesign.t4Desc')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  {Array.isArray(t4Items) && t4Items.map((item, i) => <li key={i}><strong>{item.split(':')[0]} :</strong>{item.split(':').slice(1).join(':')}</li>)}
                </ul>
              </CardContent>
            </Card>

            {/* Technique 5 */}
            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Radio className="w-8 h-8 text-primary mr-4" />
                  <h2 className="text-2xl font-bold">{t('blog.articles.sounddesign.t5Title')}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{t('blog.articles.sounddesign.t5Desc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <h4 className="font-semibold mb-2">{t('blog.articles.sounddesign.t5Lfo')}</h4>
                    <p className="text-muted-foreground">{t('blog.articles.sounddesign.t5LfoDesc')}</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <h4 className="font-semibold mb-2">{t('blog.articles.sounddesign.t5Sh')}</h4>
                    <p className="text-muted-foreground">{t('blog.articles.sounddesign.t5ShDesc')}</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <h4 className="font-semibold mb-2">{t('blog.articles.sounddesign.t5Env')}</h4>
                    <p className="text-muted-foreground">{t('blog.articles.sounddesign.t5EnvDesc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technique 6 */}
            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Zap className="w-8 h-8 text-secondary mr-4" />
                  <h2 className="text-2xl font-bold">{t('blog.articles.sounddesign.t6Title')}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{t('blog.articles.sounddesign.t6Desc')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  {Array.isArray(t6Items) && t6Items.map((item, i) => <li key={i}><strong>{item.split(':')[0]} :</strong>{item.split(':').slice(1).join(':')}</li>)}
                </ul>
              </CardContent>
            </Card>

            {/* Technique 7 */}
            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-border">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Target className="w-8 h-8 text-primary mr-4" />
                  <h2 className="text-2xl font-bold">{t('blog.articles.sounddesign.t7Title')}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{t('blog.articles.sounddesign.t7Desc')}</p>
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{t('blog.articles.sounddesign.t7Techniques')}</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {Array.isArray(t7Items) && t7Items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Technique 8 */}
            <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Headphones className="w-8 h-8 text-secondary mr-4" />
                  <h2 className="text-2xl font-bold">{t('blog.articles.sounddesign.t8Title')}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{t('blog.articles.sounddesign.t8Desc')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  {Array.isArray(t8Items) && t8Items.map((item, i) => <li key={i}><strong>{item.split(':')[0]} :</strong>{item.split(':').slice(1).join(':')}</li>)}
                </ul>
              </CardContent>
            </Card>

            {/* Technique 9 */}
            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Settings className="w-8 h-8 text-primary mr-4" />
                  <h2 className="text-2xl font-bold">{t('blog.articles.sounddesign.t9Title')}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{t('blog.articles.sounddesign.t9Desc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">{t('blog.articles.sounddesign.t9Apps')}</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      {Array.isArray(t9AppItems) && t9AppItems.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground italic">{t('blog.articles.sounddesign.t9Warning')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technique 10 */}
            <Card className="mb-12 bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Waves className="w-8 h-8 text-secondary mr-4" />
                  <h2 className="text-2xl font-bold">{t('blog.articles.sounddesign.t10Title')}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{t('blog.articles.sounddesign.t10Desc')}</p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{t('blog.articles.sounddesign.t10Methods')}</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {Array.isArray(t10Items) && t10Items.map((item, i) => <li key={i}><strong>{item.split(':')[0]} :</strong>{item.split(':').slice(1).join(':')}</li>)}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conclusion */}
            <div className="bg-gradient-hero rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">{t('blog.articles.sounddesign.conclusionTitle')}</h3>
              <p className="text-muted-foreground mb-6 text-center">{t('blog.articles.sounddesign.conclusionDesc')}</p>
              <div className="text-center space-y-4">
                <p className="text-muted-foreground italic">{t('blog.articles.sounddesign.conclusionQuote')}</p>
                <Link to="/#contact">
                  <Button className="studio-button">{t('blog.articles.sounddesign.ctaButton')}</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default TechniquesSoundDesign;
