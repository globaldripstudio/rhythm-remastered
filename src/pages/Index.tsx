import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import Services from "@/components/Services";
import Equipment from "@/components/Equipment";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Partners />
        <Services />
        <Equipment />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
