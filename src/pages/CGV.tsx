import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CGV = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-24">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Button>

        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          Conditions Générales de <span className="hero-text">Vente</span>
        </h1>

        <div className="prose prose-invert max-w-4xl space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Objet</h2>
            <p className="text-muted-foreground">
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre 
              Global Drip Worldwide, ci-après dénommé « le Studio », et tout client, ci-après dénommé 
              « le Client », pour les prestations de services audio proposées par le Studio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Services proposés</h2>
            <p className="text-muted-foreground">
              Le Studio propose les services suivants :<br /><br />
              • Mixage audio<br />
              • Mixage + Mastering (Standard et Express)<br />
              • Mastering hybride analogique/numérique<br />
              • Sound design<br />
              • Enregistrement studio et captation terrain<br />
              • Composition et beatmaking<br />
              • Direction artistique et arrangement<br />
              • Formation MAO et mixage
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Tarifs et paiement</h2>
            <p className="text-muted-foreground">
              Les tarifs sont indiqués en euros TTC sur le site et les devis. Un acompte de 50% est demandé 
              à la commande pour les prestations de mixage et mastering. Le solde est dû à la livraison des 
              fichiers finaux.<br /><br />
              Moyens de paiement acceptés : virement bancaire, PayPal.<br /><br />
              Les tarifs « sur devis » font l'objet d'une proposition commerciale personnalisée envoyée par email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Commande et validation</h2>
            <p className="text-muted-foreground">
              Toute commande est considérée comme ferme et définitive après :<br /><br />
              • Réception et validation du devis par le Client<br />
              • Réception de l'acompte de 50%<br />
              • Réception des fichiers audio à traiter (le cas échéant)
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Délais de livraison</h2>
            <p className="text-muted-foreground">
              Les délais de livraison sont indicatifs et dépendent de la charge de travail du Studio :<br /><br />
              • Mixage + Mastering Standard : 3 à 5 jours ouvrés<br />
              • Mixage + Mastering Express : 4 heures<br />
              • Sound Design : selon la complexité du projet<br />
              • Autres prestations : délai communiqué dans le devis<br /><br />
              Le Studio s'engage à informer le Client de tout retard éventuel.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Révisions</h2>
            <p className="text-muted-foreground">
              Le nombre de révisions incluses dépend de la prestation choisie :<br /><br />
              • Mixage + Mastering Standard : 3 révisions incluses<br />
              • Mixage + Mastering Express : 2 révisions incluses<br /><br />
              Toute révision supplémentaire sera facturée selon un tarif communiqué au préalable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              Le Client reste propriétaire de ses œuvres originales. Le Studio conserve la propriété de ses 
              techniques, savoir-faire et méthodologies. Sauf accord contraire, le Studio peut utiliser les 
              projets réalisés à des fins de promotion (portfolio, réseaux sociaux) avec l'accord du Client.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Annulation</h2>
            <p className="text-muted-foreground">
              En cas d'annulation par le Client :<br /><br />
              • Avant le début des travaux : remboursement de l'acompte moins 20% de frais de dossier<br />
              • Après le début des travaux : aucun remboursement de l'acompte<br /><br />
              Le Studio se réserve le droit d'annuler une commande en cas de force majeure ou de circonstances 
              exceptionnelles, avec remboursement intégral des sommes versées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Responsabilité</h2>
            <p className="text-muted-foreground">
              Le Studio s'engage à fournir des prestations de qualité professionnelle. Sa responsabilité ne 
              saurait être engagée pour des dommages indirects ou immatériels. Le Client est responsable de 
              la qualité des fichiers sources fournis et de la détention des droits sur les œuvres.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Confidentialité</h2>
            <p className="text-muted-foreground">
              Le Studio s'engage à respecter la confidentialité des projets qui lui sont confiés et à ne pas 
              divulguer les œuvres du Client sans son autorisation préalable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">11. Litiges</h2>
            <p className="text-muted-foreground">
              En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, les 
              tribunaux français seront seuls compétents. Le droit français est applicable aux présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">12. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant les présentes CGV :<br /><br />
              Global Drip Worldwide<br />
              Email : globaldripstudio@gmail.com<br />
              Téléphone : +33 6 59 79 73 42<br />
              Adresse : 8 allée des ajoncs, 13500 Martigues, France
            </p>
          </section>

          <section>
            <p className="text-muted-foreground text-sm italic">
              Dernière mise à jour : Janvier 2025
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CGV;