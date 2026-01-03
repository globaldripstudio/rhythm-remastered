import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PolitiqueConfidentialite = () => {
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
          Politique de <span className="hero-text">Confidentialité</span>
        </h1>

        <div className="prose prose-invert max-w-4xl space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Collecte des données personnelles</h2>
            <p className="text-muted-foreground">
              Global Drip Studio collecte des données personnelles lorsque vous utilisez notre formulaire de 
              contact ou que vous nous contactez par email. Les données collectées peuvent inclure :<br /><br />
              • Nom et prénom<br />
              • Adresse email<br />
              • Numéro de téléphone<br />
              • Informations relatives à votre projet musical
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Utilisation des données</h2>
            <p className="text-muted-foreground">
              Les données collectées sont utilisées exclusivement pour :<br /><br />
              • Répondre à vos demandes de renseignements<br />
              • Vous proposer des devis personnalisés<br />
              • Gérer les réservations de sessions studio<br />
              • Vous informer sur nos services (avec votre consentement)
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Conservation des données</h2>
            <p className="text-muted-foreground">
              Vos données personnelles sont conservées pendant la durée nécessaire à la gestion de notre 
              relation commerciale et conformément aux obligations légales applicables. Les données relatives 
              aux prospects sont conservées pendant 3 ans à compter du dernier contact.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Partage des données</h2>
            <p className="text-muted-foreground">
              Global Drip Studio ne vend, ne loue et ne partage pas vos données personnelles avec des tiers 
              à des fins commerciales. Vos données peuvent être partagées uniquement avec nos prestataires 
              techniques dans le cadre strict de l'exécution de nos services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Sécurité des données</h2>
            <p className="text-muted-foreground">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour 
              protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou 
              destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Vos droits</h2>
            <p className="text-muted-foreground">
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits 
              suivants :<br /><br />
              • Droit d'accès à vos données personnelles<br />
              • Droit de rectification des données inexactes<br />
              • Droit à l'effacement de vos données<br />
              • Droit à la limitation du traitement<br />
              • Droit à la portabilité de vos données<br />
              • Droit d'opposition au traitement<br /><br />
              Pour exercer ces droits, contactez-nous à : globaldripstudio@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Cookies</h2>
            <p className="text-muted-foreground">
              Ce site peut utiliser des cookies techniques nécessaires à son bon fonctionnement. Ces cookies 
              ne collectent pas de données personnelles à des fins publicitaires.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Modifications</h2>
            <p className="text-muted-foreground">
              Global Drip Studio se réserve le droit de modifier la présente politique de confidentialité à 
              tout moment. Les modifications prendront effet dès leur publication sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant notre politique de confidentialité :<br /><br />
              Email : globaldripstudio@gmail.com<br />
              Téléphone : +33 6 59 79 73 42<br />
              Adresse : 8 allée des ajoncs, 13500 Martigues, France
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PolitiqueConfidentialite;