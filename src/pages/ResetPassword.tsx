import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // IMPORTANT : abonner AVANT de tester la session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryReady(true);
      }
    });

    // Si la session est déjà chargée en mode recovery (selon timing du listener)
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Si le hash contient type=recovery, le SDK déclenche PASSWORD_RECOVERY juste après
      const hash = window.location.hash;
      if (hash.includes('type=recovery') || session) {
        setRecoveryReady((prev) => prev === null ? true : prev);
      } else {
        setRecoveryReady(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        title: 'Mot de passe trop court',
        description: 'Le mot de passe doit contenir au moins 8 caractères.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Mots de passe différents',
        description: 'La confirmation ne correspond pas au mot de passe.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setSuccess(true);
    toast({
      title: 'Mot de passe mis à jour',
      description: 'Redirection vers la connexion admin...',
    });
    setTimeout(() => navigate('/admin'), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {success ? (
              <CheckCircle2 className="w-8 h-8 text-primary" />
            ) : (
              <KeyRound className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {success ? 'Mot de passe modifié' : 'Nouveau mot de passe'}
          </CardTitle>
          <CardDescription>
            {success
              ? 'Vous allez être redirigé vers la connexion.'
              : 'Choisissez un nouveau mot de passe sécurisé'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recoveryReady === null ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : recoveryReady === false ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Ce lien de réinitialisation est invalide ou a expiré.
              </p>
              <Link to="/admin/forgot-password">
                <Button variant="outline" className="w-full">
                  Demander un nouveau lien
                </Button>
              </Link>
            </div>
          ) : success ? (
            <Link to="/admin">
              <Button className="w-full studio-button">Aller à la connexion</Button>
            </Link>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Au moins 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full studio-button" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour le mot de passe'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
