import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AudioComparison from "@/components/AudioComparison";
import { useEffect } from "react";

const Projets = () => {
  useEffect(() => {
    document.title = "Écouter nos réalisations | Global Drip Studio";
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = "Découvrez nos projets audio: avant/après en Hip-Hop, Rock et EDM, mixés et masterisés par Global Drip Studio.";
      document.head.appendChild(m);
    } else {
      meta.setAttribute('content', "Découvrez nos projets audio: avant/après en Hip-Hop, Rock et EDM, mixés et masterisés par Global Drip Studio.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28">
        <section className="container mx-auto px-6 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Écouter nos réalisations</h1>
          <p className="text-muted-foreground max-w-2xl">Page en cours de développement. Cette section sera bientôt disponible avec des exemples de nos réalisations.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Projets;
