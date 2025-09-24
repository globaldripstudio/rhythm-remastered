import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: '"Le Premier Sang", le nouvel album du groupe Venin, est enfin disponible',
      excerpt: "Découvrez l'album \"Le Premier Sang\" de Venin, entièrement enregistré, mixé et masterisé au Global Drip Studio.",
      author: "Global Drip Studio",
      date: "2024-12-20",
      readTime: "8 min",
      category: "Réalisations",
      image: "/lovable-uploads/venin-album-cover.jpg",
      slug: "venin-le-premier-sang"
    },
    {
      id: 2,
      title: "Les secrets d'un mixage professionnel",
      excerpt: "Découvrez les techniques avancées utilisées dans notre studio pour sublimer vos productions musicales.",
      author: "Global Drip Studio",
      date: "2024-03-15",
      readTime: "5 min",
      category: "Mixage",
      image: "/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png"
    },
    {
      id: 3,
      title: "Sound Design : créer l'univers sonore parfait",
      excerpt: "Comment nous créons des ambiances sonores uniques pour vos projets créatifs et audiovisuels.",
      author: "Global Drip Studio",
      date: "2024-03-10",
      readTime: "7 min",
      category: "Sound Design",
      image: "/lovable-uploads/5974c219-5112-499f-b5dd-3c09bc04df1a.png"
    },
    {
      id: 4,
      title: "Guide complet du mastering hybride",
      excerpt: "L'alliance parfaite entre l'analogique et le numérique pour un mastering de qualité studio.",
      author: "Global Drip Studio",
      date: "2024-03-05",
      readTime: "6 min",
      category: "Mastering",
      image: "/lovable-uploads/35c8540d-ce59-433e-87fd-f1b8b1527941.png"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/logo-blanc-sans-fond.png"
                alt="Global Drip Studio"
                className="h-8 object-contain"
              />
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Blog <span className="hero-text">Global Drip</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Conseils, techniques et actualités du monde de l'audio professionnel
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Link to={post.slug ? `/blog/${post.slug}` : "#"}>
                      Lire l'article
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coming Soon */}
          <div className="text-center mt-16 p-8 rounded-2xl bg-gradient-hero border border-border">
            <h3 className="text-2xl font-bold mb-4">Plus d'articles bientôt</h3>
            <p className="text-muted-foreground">
              Nous préparons du contenu exclusif sur les techniques d'enregistrement, 
              le sound design et les secrets du studio professionnel.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;