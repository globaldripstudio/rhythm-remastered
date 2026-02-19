import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - matching Blog/Projets pages */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <img src="/lovable-uploads/logo-blanc-sans-fond.png" alt="Global Drip Studio" className="h-6 sm:h-8 object-contain" />
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Retour à l'accueil</span>
                <span className="sm:hidden">Accueil</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 sm:py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          Mentions <span className="hero-text">Légales</span>
        </h1>

        <div className="prose prose-invert max-w-4xl space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Éditeur du site</h2>
            <p className="text-muted-foreground">
              Le site internet Global Drip Studio est édité par :<br /><br />
              <strong className="text-foreground">Global Drip Worldwide</strong><br />
              8 allée des ajoncs<br />
              13500 Martigues, France<br /><br />
              Téléphone : +33 6 59 79 73 42<br />
              Email : globaldripstudio@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Directeur de la publication</h2>
            <p className="text-muted-foreground">
              Le directeur de la publication est le représentant légal de Global Drip Worldwide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Hébergeur</h2>
            <p className="text-muted-foreground">
              Ce site est hébergé par :<br /><br />
              <strong className="text-foreground">Lovable (GPT Engineer Inc.)</strong><br />
              Service d'hébergement web<br />
              Contact : support@lovable.dev
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes, etc.) est la propriété 
              exclusive de Global Drip Worldwide ou de ses partenaires. Toute reproduction, représentation, 
              modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le 
              moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Responsabilité</h2>
            <p className="text-muted-foreground">
              Global Drip Worldwide s'efforce d'assurer au mieux l'exactitude et la mise à jour des informations 
              diffusées sur ce site, dont elle se réserve le droit de corriger le contenu à tout moment et sans 
              préavis. Toutefois, Global Drip Worldwide ne peut garantir l'exactitude, la précision ou 
              l'exhaustivité des informations mises à disposition sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Liens hypertextes</h2>
            <p className="text-muted-foreground">
              Le site peut contenir des liens hypertextes vers d'autres sites. Global Drip Worldwide n'exerce 
              aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu et leur 
              fonctionnement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Droit applicable</h2>
            <p className="text-muted-foreground">
              Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux 
              français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :<br /><br />
              Email : globaldripstudio@gmail.com<br />
              Téléphone : +33 6 59 79 73 42
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MentionsLegales;
