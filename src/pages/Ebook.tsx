import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Check, Download, Play, FileText, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Ebook = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Erreur lors de la création du paiement. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <Card className="max-w-5xl mx-auto p-8 md:p-12 bg-card/50 backdrop-blur border-border/50">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image E-book */}
              <div className="relative">
                <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-2xl border border-primary/20">
                  <img 
                    src="/lovable-uploads/ebook-cover.png" 
                    alt="Formation au Sound Design pour Vidéastes et Monteurs"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              </div>

              {/* Détails */}
              <div>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Formation Premium
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  Formation au Sound Design pour Vidéastes et Monteurs
                </h1>

                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Ce livre a une ambition simple : vous donner des méthodes concrètes, des checklists minimalistes et des workflows pour hausser votre niveau dès cette semaine.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Manuel d'opérabilité</h4>
                      <p className="text-sm text-muted-foreground">5 semaines de formation pour devenir 100% autonome sur la partie audio</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Play className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Adapté tous logiciels</h4>
                      <p className="text-sm text-muted-foreground">Méthodes natives pour Premiere Pro, Final Cut Pro, DaVinci Resolve, CapCut</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Pas de jargon inutile</h4>
                      <p className="text-sm text-muted-foreground">Juste ce qu'il faut savoir, au bon moment</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-6 mb-6 border border-border/50">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-4xl font-bold text-foreground">59€</span>
                    <span className="text-sm text-muted-foreground">Accès immédiat</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4 text-primary" />
                      PDF téléchargeable
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4 text-primary" />
                      Mises à jour gratuites
                    </span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full studio-button text-lg h-14"
                  onClick={handlePurchase}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Chargement..."
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Acheter maintenant — 59€
                    </>
                  )}
                </Button>

                <p className="text-sm text-muted-foreground text-center mt-4">
                  Paiement sécurisé par Stripe • Livraison immédiate par email
                </p>
              </div>
            </div>
          </Card>

          {/* Section objectifs */}
          <div className="max-w-3xl mx-auto mt-16 text-center">
            <h2 className="text-2xl font-bold mb-6 text-foreground">L'objectif</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Monter vos vidéos plus vite, démystifier l'aspect sonore, devenir autonome et précis à ce sujet, et faire enfin sonner vos images.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Ebook;
