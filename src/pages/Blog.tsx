import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useBlogViews } from "@/hooks/useBlogViews";

const Blog = () => {
  const { views, isLoading } = useBlogViews();

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
      slug: "venin-le-premier-sang",
      comingSoon: false
    },
    {
      id: 2,
      title: "Comprendre la compression en 5 minutes",
      excerpt: "La compression démystifiée : ratio, attack, release, knee. Apprenez à utiliser cet outil indispensable pour contrôler la dynamique de vos enregistrements.",
      author: "Global Drip Studio", 
      date: "2024-12-10",
      readTime: "5 min",
      category: "Techniques",
      image: "/lovable-uploads/Image-23.jpg",
      slug: "comprendre-la-compression",
      comingSoon: false
    },
    {
      id: 3,
      title: "Bien mixer une voix : les 7 étapes essentielles",
      excerpt: "Maîtrisez l'art du mixage vocal avec ces techniques professionnelles utilisées dans notre studio. De l'égalisation à la compression, découvrez nos secrets.",
      author: "Global Drip Studio",
      date: "2024-12-15",
      readTime: "6 min",
      category: "Mixage",
      image: "/lovable-uploads/_edited.jpg.png",
      slug: "bien-mixer-une-voix",
      comingSoon: true
    },
    {
      id: 4,
      title: "10 techniques de sound design pour créer des ambiances uniques",
      excerpt: "Explorez les techniques avancées de création sonore : field recording, granular synthesis, convolution reverb et manipulation spectrale pour des univers sonores immersifs.",
      author: "Global Drip Studio",
      date: "2024-12-05", 
      readTime: "9 min",
      category: "Sound Design",
      image: "/lovable-uploads/0865b2b6-7a37-44f1-8209-b10fd54aa3f1.png",
      slug: "10-techniques-sound-design",
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - matching Projets page style */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                <img 
                  src="/lovable-uploads/logo-blanc-sans-fond.png"
                  alt="Global Drip Studio"
                  className="h-6 sm:h-8 object-contain"
                />
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">← Retour à l'accueil</span>
                  <span className="sm:hidden">← Accueil</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-10 sm:py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Blog <span className="hero-text">Global Drip</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Conseils, techniques et actualités du monde de l'audio professionnel
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
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
                  {/* View counter - only for available articles */}
                  {!post.comingSoon && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      <span>{isLoading ? "..." : (views[post.slug] || 100)}</span>
                    </div>
                  )}
                </div>
                
                <CardHeader className="flex-grow">
                  <CardTitle className="text-base sm:text-lg leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {post.excerpt}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3" />
                      <span className="hidden sm:inline">{post.author}</span>
                      <span className="sm:hidden">GDS</span>
                    </div>
                    <div className="flex items-center space-x-3 sm:space-x-4">
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
                  {post.comingSoon ? (
                    <div className="relative">
                      <Button 
                        variant="outline" 
                        className="w-full opacity-60 cursor-not-allowed"
                        disabled
                      >
                        Lire l'article
                      </Button>
                      <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium">
                        bientôt
                      </span>
                    </div>
                  ) : (
                    <Link to={`/blog/${post.slug}`} className="block">
                      <Button variant="outline" className="w-full">
                        Lire l'article
                      </Button>
                    </Link>
                  )}
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