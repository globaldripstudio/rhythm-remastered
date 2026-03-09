import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import LegalPageHeader from "@/components/LegalPageHeader";

const PolitiqueConfidentialite = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <SEO title={t('seo.politiqueConfidentialite.title')} description={t('seo.politiqueConfidentialite.description')} path="/politique-confidentialite" />
      <LegalPageHeader />

      <main className="container mx-auto px-6 py-16 sm:py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          {t('legalPages.privacy.pageTitle1')} <span className="hero-text">{t('legalPages.privacy.pageTitle2')}</span>
        </h1>

        <div className="prose prose-invert max-w-4xl space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.privacy.s1title')}</h2>
            <p className="text-muted-foreground">
              {t('legalPages.privacy.s1text')}<br /><br />
              {(t('legalPages.privacy.s1items') as string).split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.privacy.s2title')}</h2>
            <p className="text-muted-foreground">
              {t('legalPages.privacy.s2text')}<br /><br />
              {(t('legalPages.privacy.s2items') as string).split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.privacy.s3title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.privacy.s3text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.privacy.s4title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.privacy.s4text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.privacy.s5title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.privacy.s5text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.privacy.s6title')}</h2>
            <p className="text-muted-foreground">
              {t('legalPages.privacy.s6text')}<br /><br />
              {(t('legalPages.privacy.s6items') as string).split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
              <br />
              {t('legalPages.privacy.s6contact')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.privacy.s7title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.privacy.s7text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.privacy.s8title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.privacy.s8text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.privacy.s9title')}</h2>
            <p className="text-muted-foreground">
              {t('legalPages.privacy.s9text')}<br /><br />
              {t('legalPages.privacy.s9email')}<br />
              {t('legalPages.privacy.s9phone')}<br />
              {t('legalPages.privacy.s9address')}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PolitiqueConfidentialite;
