import { Card } from "@/components/ui/card";

const Partners = () => {
  const partners = [
    { 
      name: "Type 7", 
      logo: "/lovable-uploads/TYPE_7_white.png",
      url: "https://type7.com/"
    },
    { 
      name: "Canyon Bicycles", 
      logo: "/lovable-uploads/canyon-new.png",
      url: "https://www.canyon.com/fr-fr/"
    },
    { 
      name: "Commencal", 
      logo: "/lovable-uploads/fd1b44e8-bc02-4bd0-b187-ab685c182ccc.png",
      url: "https://www.commencal.com/"
    },
    { 
      name: "Ambit Components", 
      logo: "/lovable-uploads/ambit-inverted.png",
      url: "https://ambit-components.com/en/"
    },
    { 
      name: "Pulsor Agency", 
      logo: "/lovable-uploads/pulsor-inverted.png",
      url: "https://www.pulsor.agency/"
    },
    { 
      name: "Ultrack Agency", 
      logo: "/lovable-uploads/ultrack-inverted.png",
      url: "https://ultrack.webflow.io/"
    }
  ];

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-muted/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Nous avons les <span className="hero-text">meilleurs partenaires</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {partners.map((partner, index) => (
            <a 
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="block"
            >
              <Card 
                className="p-3 sm:p-4 md:p-6 flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all duration-300 group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-full h-8 sm:h-10 md:h-12 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity overflow-hidden">
                    <img 
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      className={`max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 ${
                        partner.name === "Type 7" ? "scale-[0.65]" :
                        partner.name === "Pulsor Agency" ? "scale-[3] translate-x-2 translate-y-0.5" : 
                        partner.name === "Ultrack Agency" ? "scale-110" : 
                        partner.name === "Ambit Components" ? "-translate-y-0.5" : ""
                      }`}
                      style={{ maxHeight: '32px' }}
                    />
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;