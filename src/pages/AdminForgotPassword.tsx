import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    // Réponse neutre pour éviter l'énumération d'emails
    setSent(true);
    if (error) {
      // On log silencieusement, on n'expose rien à l'utilisateur
      console.error('resetPasswordForEmail error:', error.message);
    }
    toast({
      title: 'Demande enregistrée',
      description: "Si un compte existe avec cette adresse, un email de réinitialisation vous a été envoyé.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Si un compte existe avec l'adresse <span className="font-medium text-foreground">{email}</span>, vous allez recevoir un email contenant un lien pour réinitialiser votre mot de passe.
              </p>
              <p className="text-xs text-muted-foreground">
                Pensez à vérifier vos courriers indésirables.
              </p>
              <Link to="/admin">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@globaldripstudio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full studio-button" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer le lien'
                )}
              </Button>

              <Link to="/admin" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-3 h-3 inline mr-1" />
                Retour à la connexion
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminForgotPassword;
