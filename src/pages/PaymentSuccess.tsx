import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Mail, Home } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const STUDIO_EMAIL = "globaldripstudio@gmail.com";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const { t } = useTranslation();
  const service = params.get("service");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto p-8 md:p-12 text-center bg-card/50 backdrop-blur border-border/50">
            <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            {service ? (
              <>
                <h1 className="text-3xl font-bold mb-4 text-foreground">{t("paymentService.title")}</h1>
                <p className="text-lg text-muted-foreground mb-8">{t("paymentService.desc")}</p>
                <div className="space-y-4">
                  <a href={`mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(`Commande ${t(`services.data.${service}.title`, service)}`)}`}>
                    <Button className="studio-button w-full" size="lg">
                      <Mail className="w-4 h-4 mr-2" />
                      {t("paymentService.send")} — {STUDIO_EMAIL}
                    </Button>
                  </a>
                  <Link to="/">
                    <Button variant="outline">
                      <Home className="w-4 h-4 mr-2" />
                      {t("paymentService.home")}
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-4 text-foreground">Merci pour votre achat !</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Votre paiement a été traité avec succès. Vous allez recevoir un email avec votre code d'accès à la formation.
                </p>
                <div className="bg-muted/30 rounded-xl p-6 mb-8 border border-border/50">
                  <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <Mail className="w-5 h-5" />
                    <span>Vérifiez votre boîte de réception (et les spams)</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <Link to="/ebook/login">
                    <Button className="studio-button w-full" size="lg">Accéder à la formation</Button>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Vous n'avez pas reçu l'email ? Contactez-nous à{" "}
                    <a href={`mailto:${STUDIO_EMAIL}`} className="text-primary hover:underline">{STUDIO_EMAIL}</a>
                  </p>
                  <Link to="/">
                    <Button variant="outline"><Home className="w-4 h-4 mr-2" />Retour à l'accueil</Button>
                  </Link>
                </div>
              </>
            )}
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
