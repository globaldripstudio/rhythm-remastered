import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import LegalPageHeader from "@/components/LegalPageHeader";

const MentionsLegales = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <SEO title={t('seo.mentionsLegales.title')} description={t('seo.mentionsLegales.description')} path="/mentions-legales" />
      <LegalPageHeader />

      <main className="container mx-auto px-6 py-16 sm:py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          {t('legalPages.mentions.pageTitle1')} <span className="hero-text">{t('legalPages.mentions.pageTitle2')}</span>
        </h1>

        <div className="prose prose-invert max-w-4xl space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.mentions.s1title')}</h2>
            <p className="text-muted-foreground">
              {t('legalPages.mentions.s1text')}<br /><br />
              <strong className="text-foreground">{t('legalPages.mentions.s1company')}</strong><br />
              {(t('legalPages.mentions.s1address') as string).split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}<br />
              {t('legalPages.mentions.s1phone')}<br />
              {t('legalPages.mentions.s1email')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.mentions.s2title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.mentions.s2text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.mentions.s3title')}</h2>
            <p className="text-muted-foreground">
              {t('legalPages.mentions.s3text')}<br /><br />
              <strong className="text-foreground">{t('legalPages.mentions.s3host')}</strong><br />
              {t('legalPages.mentions.s3hostDesc')}<br />
              {t('legalPages.mentions.s3hostContact')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.mentions.s4title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.mentions.s4text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.mentions.s5title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.mentions.s5text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.mentions.s6title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.mentions.s6text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.mentions.s7title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.mentions.s7text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.mentions.s8title')}</h2>
            <p className="text-muted-foreground">
              {t('legalPages.mentions.s8text')}<br /><br />
              {t('legalPages.mentions.s8email')}<br />
              {t('legalPages.mentions.s8phone')}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MentionsLegales;
