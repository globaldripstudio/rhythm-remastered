import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import LegalPageHeader from "@/components/LegalPageHeader";

const CGV = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <SEO title={t('seo.cgv.title')} description={t('seo.cgv.description')} path="/cgv" />
      <LegalPageHeader />

      <main className="container mx-auto px-6 py-16 sm:py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          {t('legalPages.cgv.pageTitle1')} <span className="hero-text">{t('legalPages.cgv.pageTitle2')}</span>
        </h1>

        <div className="prose prose-invert max-w-4xl space-y-8">
          {/* 1. Objet */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s1title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.cgv.s1text')}</p>
          </section>

          {/* 2. Services */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s2title')}</h2>
            <p className="text-muted-foreground mb-4">{t('legalPages.cgv.s2intro')}</p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li><strong className="text-foreground">{t('legalPages.cgv.s2mixing')}</strong> {t('legalPages.cgv.s2mixingDesc')}</li>
              <li><strong className="text-foreground">{t('legalPages.cgv.s2mixmaster')}</strong> {t('legalPages.cgv.s2mixmasterDesc')}</li>
              <li><strong className="text-foreground">{t('legalPages.cgv.s2mastering')}</strong> {t('legalPages.cgv.s2masteringDesc')}</li>
              <li><strong className="text-foreground">{t('legalPages.cgv.s2sounddesign')}</strong> {t('legalPages.cgv.s2sounddesignDesc')}</li>
              <li><strong className="text-foreground">{t('legalPages.cgv.s2recording')}</strong> {t('legalPages.cgv.s2recordingDesc')}</li>
              <li><strong className="text-foreground">{t('legalPages.cgv.s2composition')}</strong> {t('legalPages.cgv.s2compositionDesc')}</li>
              <li><strong className="text-foreground">{t('legalPages.cgv.s2direction')}</strong> {t('legalPages.cgv.s2directionDesc')}</li>
              <li><strong className="text-foreground">{t('legalPages.cgv.s2training')}</strong> {t('legalPages.cgv.s2trainingDesc')}</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">{t('legalPages.cgv.s2notes')}</strong><br />
              • {t('legalPages.cgv.s2note1')}<br />
              • {t('legalPages.cgv.s2note2')}
            </p>
          </section>

          {/* 3. Tarifs */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s3title')}</h2>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              {(t('legalPages.cgv.s3items', { returnObjects: true }) as string[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          {/* 4. Commande */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s4title')}</h2>
            <p className="text-muted-foreground mb-4">{t('legalPages.cgv.s4intro')}</p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              {(t('legalPages.cgv.s4items', { returnObjects: true }) as string[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4">{t('legalPages.cgv.s4text')}</p>
          </section>

          {/* 5. Délais */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s5title')}</h2>
            <p className="text-muted-foreground mb-4">{t('legalPages.cgv.s5intro')}</p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li><strong className="text-foreground">{t('legalPages.cgv.s5standard')}</strong> {t('legalPages.cgv.s5standardDesc')}</li>
              <li><strong className="text-foreground">{t('legalPages.cgv.s5essential')}</strong> {t('legalPages.cgv.s5essentialDesc')}</li>
              <li><strong className="text-foreground">{t('legalPages.cgv.s5sounddesign')}</strong> {t('legalPages.cgv.s5sounddesignDesc')}</li>
              <li><strong className="text-foreground">{t('legalPages.cgv.s5other')}</strong> {t('legalPages.cgv.s5otherDesc')}</li>
            </ul>
            <p className="text-muted-foreground mt-4">{t('legalPages.cgv.s5text')}</p>
          </section>

          {/* 6. Révisions */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s6title')}</h2>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li><strong className="text-foreground">{t('legalPages.cgv.s6standard')}</strong> {t('legalPages.cgv.s6standardDesc')}</li>
              <li><strong className="text-foreground">{t('legalPages.cgv.s6essential')}</strong> {t('legalPages.cgv.s6essentialDesc')}</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">{t('legalPages.cgv.s6def')}</strong> {t('legalPages.cgv.s6defText')}
            </p>
            <p className="text-muted-foreground mt-2">
              <strong className="text-foreground">{t('legalPages.cgv.s6excluded')}</strong> {t('legalPages.cgv.s6excludedText')}
            </p>
            <p className="text-muted-foreground mt-2">{t('legalPages.cgv.s6extra')}</p>
          </section>

          {/* 7. Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s7title')}</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">{t('legalPages.cgv.s7_1title')}</h3>
            <p className="text-muted-foreground">{t('legalPages.cgv.s7_1text')}</p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">{t('legalPages.cgv.s7_2title')}</h3>
            <p className="text-muted-foreground">{t('legalPages.cgv.s7_2text')}</p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">{t('legalPages.cgv.s7_3title')}</h3>
            <p className="text-muted-foreground">{t('legalPages.cgv.s7_3text')}</p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">{t('legalPages.cgv.s7_4title')}</h3>
            <p className="text-muted-foreground">{t('legalPages.cgv.s7_4text')}</p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">{t('legalPages.cgv.s7_5title')}</h3>
            <p className="text-muted-foreground">{t('legalPages.cgv.s7_5text')}</p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6 mt-2">
              {(t('legalPages.cgv.s7_5items', { returnObjects: true }) as string[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4">{t('legalPages.cgv.s7_5extra')}</p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">{t('legalPages.cgv.s7_6title')}</h3>
            <p className="text-muted-foreground">{t('legalPages.cgv.s7_6text')}</p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">{t('legalPages.cgv.s7_7title')}</h3>
            <p className="text-muted-foreground">{t('legalPages.cgv.s7_7text')}</p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">{t('legalPages.cgv.s7_8title')}</h3>
            <p className="text-muted-foreground">{t('legalPages.cgv.s7_8text')}</p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">{t('legalPages.cgv.s7_9title')}</h3>
            <p className="text-muted-foreground">{t('legalPages.cgv.s7_9text')}</p>
          </section>

          {/* 8. Annulation */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s8title')}</h2>
            <p className="text-muted-foreground mb-2"><strong className="text-foreground">{t('legalPages.cgv.s8byClient')}</strong></p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              {(t('legalPages.cgv.s8clientItems', { returnObjects: true }) as string[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4 mb-2"><strong className="text-foreground">{t('legalPages.cgv.s8byStudio')}</strong></p>
            <p className="text-muted-foreground">{t('legalPages.cgv.s8studioText')}</p>
            <p className="text-muted-foreground mt-4">{t('legalPages.cgv.s8extra')}</p>
          </section>

          {/* 9. Responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s9title')}</h2>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              {(t('legalPages.cgv.s9items', { returnObjects: true }) as string[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          {/* 10. Confidentialité */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s10title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.cgv.s10text')}</p>
          </section>

          {/* 11. Litiges */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s11title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.cgv.s11text')}</p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s12title')}</h2>
            <p className="text-muted-foreground">
              <strong className="text-foreground">{t('legalPages.cgv.s12company')}</strong><br />
              {t('legalPages.cgv.s12email')}<br />
              {t('legalPages.cgv.s12phone')}<br />
              {t('legalPages.cgv.s12address')}
            </p>
          </section>

          {/* 13. RGPD */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s13title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.cgv.s13text')}</p>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">{t('legalPages.cgv.s13rights')}</strong> {t('legalPages.cgv.s13rightsText')}
            </p>
            <p className="text-muted-foreground mt-4">{t('legalPages.cgv.s13sub')}</p>
          </section>

          {/* 14. Sous-traitance */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s14title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.cgv.s14text')}</p>
          </section>

          {/* 15. Frais annexes */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s15title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.cgv.s15text')}</p>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">{t('legalPages.cgv.s15field')}</strong> {t('legalPages.cgv.s15fieldText')}
            </p>
          </section>

          {/* 16. Livrables */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s16title')}</h2>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              {(t('legalPages.cgv.s16items', { returnObjects: true }) as string[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
              <li><strong className="text-foreground">{t('legalPages.cgv.s16archive')}</strong> {t('legalPages.cgv.s16archiveText')}</li>
            </ul>
          </section>

          {/* 17. Communication */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s17title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.cgv.s17text')}</p>
          </section>

          {/* 18. Modification */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('legalPages.cgv.s18title')}</h2>
            <p className="text-muted-foreground">{t('legalPages.cgv.s18text')}</p>
          </section>

          <section>
            <p className="text-muted-foreground text-sm italic">{t('legalPages.cgv.lastUpdate')}</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CGV;
