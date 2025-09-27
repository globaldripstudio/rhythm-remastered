import { Card } from "@/components/ui/card";

const Partners = () => {
  const partners = [
    { 
      name: "Porsche", 
      logo: "/lovable-uploads/8d7d8e6d-4601-4ace-9397-7e40b97799f7.png",
      url: "https://www.porsche.com"
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
      logo: "/lovable-uploads/ambit-new.png",
      url: "https://ambit-components.com/en/"
    },
    { 
      name: "Pulsor Agency", 
      logo: "/lovable-uploads/a2f9923a-a28c-46c2-b041-324fea7c7fd2.png",
      url: "https://www.pulsor.agency/"
    },
    { 
      name: "Ultrack Agency", 
      logo: "/lovable-uploads/ea14cd8f-e603-4737-8f61-3a6eb2dfac23.png",
      url: "https://ultrack.webflow.io/"
    }
  ];

  return (
    <section className="py-16 bg-muted/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Nous avons les <span className="hero-text">meilleurs partenaires</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <a 
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card 
                className="p-6 flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all duration-300 group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-full h-12 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                    <img 
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      className={`max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 ${
                        partner.name === "Pulsor Agency" ? "scale-90" : ""
                      }`}
                      style={{ maxHeight: '40px' }}
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