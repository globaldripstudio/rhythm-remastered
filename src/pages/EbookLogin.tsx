import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2, LogIn, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const EbookLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(
    () => new URLSearchParams(window.location.search).get("email")?.slice(0, 255) ?? ""
  );
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        // Admin sessions stay out of the reader space.
        const { data: purchase } = adminRole
          ? { data: null }
          : await supabase
              .from("ebook_purchases")
              .select("id")
              .eq("email", (session.user.email ?? "").toLowerCase())
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
      // Sign out globally first to invalidate other sessions (anti-sharing)
      await supabase.auth.signOut({ scope: "global" });

      const { data: signIn, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      if (error) throw new Error("Email ou code d'accès incorrect.");

      // Reader space is sealed from the admin space.
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", signIn.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (adminRole) {
        await supabase.auth.signOut();
        throw new Error("Ce compte ne peut pas accéder à l'espace formation.");
      }

      const { data: purchase } = await supabase
        .from("ebook_purchases")
        .select("id")
        .eq("email", (signIn.user.email ?? "").toLowerCase())
        .maybeSingle();

      if (!purchase) {
        await supabase.auth.signOut();
        throw new Error("Aucun achat trouvé pour cet email.");
      }

      navigate("/ebook/reader", { replace: true });
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
          <CardTitle className="text-2xl">Accéder à ma formation</CardTitle>
          <CardDescription>
            Utilisez votre email de facturation et le code d'accès reçu par email après l'achat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email de facturation</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Code d'accès</Label>
              <Input
                id="password"
                type="text"
                autoComplete="one-time-code"
                placeholder="GDS-XXXX-XXXX-XXXX"
                value={password}
                onChange={(e) => setPassword(e.target.value.toUpperCase())}
                className="font-mono tracking-wider"
                required
                minLength={6}
                maxLength={64}
              />
            </div>
            <Button type="submit" className="w-full studio-button" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
              Se connecter
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Code perdu ou non reçu ? Vérifiez vos spams, puis écrivez à{" "}
            <a href="mailto:globaldripstudio@gmail.com" className="text-primary hover:underline">
              globaldripstudio@gmail.com
            </a>
            .
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
