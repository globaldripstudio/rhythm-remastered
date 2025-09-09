import { Card } from "@/components/ui/card";

const Partners = () => {
  const partners = [
    { name: "Porsche", logo: "https://upload.wikimedia.org/wikipedia/commons/1/17/Porsche_logo.svg" },
    { name: "Canyon Bicycles", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Canyon_bicycles_logo.svg" },
    { name: "Commencal", logo: "https://www.commencal.com/media/logo/default/commencal_logo_black.svg" },
    { name: "Ambit Components", logo: "/placeholder-logo.svg" },
    { name: "Pulsor Agency", logo: "/placeholder-logo.svg" },
    { name: "Ultrack Agency", logo: "/placeholder-logo.svg" }
  ];

  return (
    <section className="py-16 bg-muted/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Nous avons les <span className="hero-text">meilleurs partenaires</span>
          </h2>
          <p className="text-muted-foreground">
            Ils nous font confiance pour leurs projets audio
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <Card 
              key={partner.name}
              className="p-6 flex items-center justify-center hover:shadow-lg transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-full h-12 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                <img 
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  style={{ maxHeight: '40px' }}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;