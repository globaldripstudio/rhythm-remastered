import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, ExternalLink } from "lucide-react";

const partners = [
{
  name: "Type 7",
  logo: "/lovable-uploads/TYPE_7_white.png",
  url: "https://type7.com/",
  videos: [
  { title: "The Silver Coast", url: "https://www.youtube.com/embed/W-GAqmI96ro?si=3gD45YYFn39W3e82" }]

},
{
  name: "Canyon Bicycles",
  logo: "/lovable-uploads/canyon-new.png",
  url: "https://www.canyon.com/fr-fr/",
  videos: [
  { title: "To the next chapter - Tomas Lemoine", url: "https://www.youtube.com/embed/A7s0pP0D3Po?si=w9XhJHH8aejyIDYM" }]

},
{
  name: "Commencal",
  logo: "/lovable-uploads/fd1b44e8-bc02-4bd0-b187-ab685c182ccc.png",
  url: "https://www.commencal.com/",
  videos: [
  { title: "THE HOLY LAND - Tomas Lemoine", url: "https://www.youtube.com/embed/u44cDLJWeFc?si=_NWFed-j_1xE8oJ0" }]

},
{
  name: "Ambit Components",
  logo: "/lovable-uploads/ambit-inverted.png",
  url: "https://ambit-components.com/en/",
  videos: [
  { title: "Ambit Components", url: "https://www.youtube.com/embed/Kb9_SjMzdVc?si=8d6k4InZMOY3xgAZ" }]

},
{
  name: "Pulsor Agency",
  logo: "/lovable-uploads/pulsor-inverted.png",
  url: "https://www.pulsor.agency/",
  videos: [
  { title: "Théo Pulsor", url: "https://www.youtube.com/embed/kFEacVd-iMs?si=EQFXCN8usgWLzyxH" }]

},
{
  name: "Ultrack Agency",
  logo: "/lovable-uploads/ultrack-inverted.png",
  url: "https://ultrack.webflow.io/",
  videos: [
  { title: "Théo Bachelier", url: "https://www.youtube.com/embed/M-eW6rpRklU?si=XtzNzrdN3U58QyAB" },
  { title: "Ultrack", url: "https://www.youtube.com/embed/WDM-H839CYM?si=fUeQY879818PvYaY" }]

}];


const Partners = () => {
  const [selectedPartner, setSelectedPartner] = useState<typeof partners[0] | null>(null);

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-muted/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Nous avons les <span className="hero-text">meilleurs partenaires</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {partners.map((partner, index) =>
          <button
            key={partner.name}
            onClick={() => setSelectedPartner(partner)}
            className="block w-full">

              <Card
              className="p-3 sm:p-4 md:p-6 flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all duration-300 group cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}>

                <div className="w-full h-8 sm:h-10 md:h-12 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity overflow-hidden">
                    <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  className={`max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 ${
                  partner.name === "Type 7" ? "scale-[0.65]" :
                  partner.name === "Pulsor Agency" ? "scale-[3] translate-x-2 translate-y-0.5" :
                  partner.name === "Ultrack Agency" ? "scale-110" :
                  partner.name === "Ambit Components" ? "-translate-y-0.5" : ""}`
                  }
                  style={{ maxHeight: '32px' }} />

                </div>
              </Card>
            </button>
          )}
        </div>
      </div>

      {/* Partner Modal */}
      <Dialog open={!!selectedPartner} onOpenChange={(open) => !open && setSelectedPartner(null)}>
        <DialogContent className="max-w-lg p-0 overflow-visible bg-card border-border [&>button]:hidden">
          <DialogTitle className="sr-only">{selectedPartner?.name}</DialogTitle>
          <button
            onClick={() => setSelectedPartner(null)}
            className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-[60] w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors hover:scale-110"
            aria-label="Fermer">

            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {selectedPartner &&
          <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="h-12 sm:h-16 flex items-center justify-center mb-4">
                  <img
                  src={selectedPartner.logo}
                  alt={selectedPartner.name}
                  className={`max-h-full object-contain ${
                  selectedPartner.name === "Type 7" ? "scale-[0.8]" :
                  selectedPartner.name === "Pulsor Agency" ? "scale-[3.5]" :
                  selectedPartner.name === "Ultrack Agency" ? "scale-125" :
                  ""}`
                  }
                  style={{ maxHeight: '48px' }} />

                </div>
                
              </div>

              <div className="space-y-4 mb-6">
                {selectedPartner.videos.map((video, i) =>
              <div key={i}>
                    <p className="text-sm font-medium mb-2">{video.title}</p>
                    <div className="rounded-lg overflow-hidden">
                      <iframe
                    width="100%"
                    height="250"
                    src={video.url}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="rounded-lg" />

                    </div>
                  </div>
              )}
              </div>

              <a
              href={selectedPartner.url}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer">

                <Button className="w-full studio-button">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visiter le site du partenaire
                </Button>
              </a>
            </div>
          }
        </DialogContent>
      </Dialog>
    </section>);

};

export default Partners;