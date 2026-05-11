import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type GuardResponse = {
  allowed?: boolean;
  ok?: boolean;
  blocked?: boolean;
  reason?: 'wrong_email' | 'burst' | 'repeated_failures';
  until?: string | null;
};

const reasonText = (r?: string) => {
  switch (r) {
    case 'wrong_email':
      return 'Adresse non autorisée. Cette IP est désormais bloquée définitivement.';
    case 'burst':
      return 'Trop de tentatives en peu de temps. Cette IP est bloquée définitivement.';
    case 'repeated_failures':
      return 'Trop d’échecs consécutifs. Accès bloqué temporairement.';
    default:
      return 'Accès bloqué.';
  }
};

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);
  const [permanentBlock, setPermanentBlock] = useState(false);
  const [blockReason, setBlockReason] = useState<string | undefined>();
  const [now, setNow] = useState(Date.now());
  const { signIn } = useAuth();
  const { toast } = useToast();

  // Tick pour mettre à jour le compte à rebours
  useEffect(() => {
    if (!blockedUntil || permanentBlock) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [blockedUntil, permanentBlock]);

  const remainingMs = blockedUntil ? blockedUntil.getTime() - now : 0;
  const isCurrentlyBlocked = permanentBlock || remainingMs > 0;

  const callGuard = async (
    action: 'check' | 'record_failure' | 'record_success',
    emailValue: string,
  ): Promise<GuardResponse | null> => {
    const { data, error } = await supabase.functions.invoke('admin-login-guard', {
      body: { action, email: emailValue },
    });
    if (error) {
      // Si le guard renvoie 403, l'erreur Functions encapsule le payload
      const ctx = (error as unknown as { context?: { body?: string } }).context;
      if (ctx?.body) {
        try {
          return JSON.parse(ctx.body) as GuardResponse;
        } catch {
          /* ignore */
        }
      }
      console.error('guard error', error);
      return null;
    }
    return (data as GuardResponse) ?? null;
  };

  const applyBlock = (resp: GuardResponse) => {
    setBlockReason(resp.reason);
    if (resp.until) {
      const until = new Date(resp.until);
      setBlockedUntil(until);
      setPermanentBlock(false);
    } else {
      setBlockedUntil(null);
      setPermanentBlock(true);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCurrentlyBlocked) return;
    setIsLoading(true);

    const normalized = email.trim().toLowerCase();

    // 1) Pré-check serveur (peut bloquer immédiatement si email étranger)
    const check = await callGuard('check', normalized);
    if (!check || check.allowed !== true) {
      if (check?.blocked) {
        applyBlock(check);
        toast({
          title: 'Accès bloqué',
          description: reasonText(check.reason),
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erreur',
          description: 'Service indisponible, réessayez plus tard.',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return;
    }

    // 2) Tentative de connexion réelle
    const { error } = await signIn(normalized, password);

    if (error) {
      const failResp = await callGuard('record_failure', normalized);
      if (failResp?.blocked) {
        applyBlock(failResp);
        toast({
          title: 'Accès bloqué',
          description: reasonText(failResp.reason),
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erreur de connexion',
          description: 'Identifiants invalides.',
          variant: 'destructive',
        });
      }
    } else {
      await callGuard('record_success', normalized);
    }

    setIsLoading(false);
  };

  const formatRemaining = () => {
    if (permanentBlock) return 'Permanent';
    const s = Math.max(0, Math.ceil(remainingMs / 1000));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Espace Admin</CardTitle>
          <CardDescription>
            Global Drip Studio - Dashboard privé
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCurrentlyBlocked && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 text-destructive" />
              <div className="text-sm">
                <p className="font-medium text-destructive">{reasonText(blockReason)}</p>
                <p className="text-muted-foreground mt-1">
                  Réessayez dans : <span className="font-mono">{formatRemaining()}</span>
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleSignIn} className="space-y-4">
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
                  disabled={isCurrentlyBlocked}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isCurrentlyBlocked}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full studio-button"
              disabled={isLoading || isCurrentlyBlocked}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
