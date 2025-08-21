import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Euro, ArrowRight, Waves, Settings, Volume2 } from "lucide-react";
import mixingConsole from "@/assets/mixing-console.jpg";
import studioEquipment from "@/assets/studio-equipment.jpg";
import masteringSuite from "@/assets/mastering-suite.jpg";

const Services = () => {
  const services = [
    {
      id: "mixage-mastering",
      title: "Mixage + Mastering",
      description: "Service complet pour donner vie à vos créations musicales",
      duration: "10 h",
      price: "290",
      icon: Waves,
      image: mixingConsole,
      features: [
        "Mixage professionnel multi-pistes",
        "Mastering hybride analogique/numérique",
        "3 révisions incluses",
        "Formats de livraison multiples"
      ]
    },
    {
      id: "mastering-hybride",
      title: "Mastering Hybride",
      description: "Mastering professionnel avec traitement analogique et numérique",
      duration: "2 h",
      price: "60",
      icon: Settings,
      image: masteringSuite,
      features: [
        "Traitement analogique haute qualité",
        "Optimisation pour streaming",
        "Analyse spectrale complète",
        "Référence industrie"
      ]
    },
    {
      id: "mixage",
      title: "Mixage Studio",
      description: "Mixage professionnel de vos enregistrements",
      duration: "8 h",
      price: "230",
      icon: Volume2,
      image: studioEquipment,
      features: [
        "Console SSL ou Neve",
        "Processing analogique premium",
        "2 révisions incluses",
        "Stems disponibles"
      ]
    }
  ];

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Nos <span className="hero-text">Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Des prestations professionnelles adaptées à tous vos besoins musicaux,
            du simple mixage au mastering haute fidélité
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card 
              key={service.id} 
              className="service-card group cursor-pointer relative overflow-hidden"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Service Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <div className="absolute top-4 right-4">
                  <div className="w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{service.price}€</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {service.duration}
                    </div>
                  </div>
                </div>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <Button 
                  className="w-full group-hover:studio-button transition-all duration-300"
                  variant="outline"
                >
                  Plus d'infos
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>

              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-8 rounded-2xl bg-gradient-hero border border-border">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Projet sur mesure ?</h3>
              <p className="text-muted-foreground mb-4">Contactez-nous pour un devis personnalisé</p>
              <Button size="lg" className="studio-button">
                Demander un devis gratuit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;