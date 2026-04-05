import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const EbookLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has a purchase
        const { data: purchase } = await supabase
          .from("ebook_purchases")
          .select("id")
          .maybeSingle();
        
        if (purchase) {
          navigate("/ebook/reader", { replace: true });
          return;
        }
      }
      setCheckingSession(false);
    };
    checkExistingSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Sign out globally first to invalidate other sessions (anti-sharing)
        await supabase.auth.signOut({ scope: "global" });

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Check purchase
        const { data: purchase } = await supabase
          .from("ebook_purchases")
          .select("id")
          .maybeSingle();

        if (!purchase) {
          toast.error("Aucun achat trouvé pour cet email. Achetez la formation d'abord.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        navigate("/ebook/reader", { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/ebook/login" },
        });
        if (error) throw error;
        toast.success("Vérifiez votre email pour confirmer votre inscription.");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO title="Accès Formation | Global Drip Studio" description="Connectez-vous pour accéder à votre formation." path="/ebook/login" />
      
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 self-start">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <div className="mx-auto w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mb-3">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? "Accéder à ma formation" : "Créer mon compte"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Connectez-vous avec l'email utilisé lors de l'achat"
              : "Créez un compte avec l'email utilisé lors de l'achat"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full studio-button" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isLogin ? (
                <LogIn className="w-4 h-4 mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isLogin ? "Se connecter" : "Créer mon compte"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin
                ? "Première visite ? Créez un compte"
                : "Déjà un compte ? Connectez-vous"}
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Utilisez l'email avec lequel vous avez acheté la formation.
            <br />
            Pas encore acheté ?{" "}
            <Link to="/ebook" className="text-primary hover:underline">
              Voir la formation
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EbookLogin;
