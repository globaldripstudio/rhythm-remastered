import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import LoginForm from '@/components/admin/LoginForm';
import Dashboard from '@/components/admin/Dashboard';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const UnauthorizedView = ({ onSignOut }: { onSignOut: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Accès non autorisé</CardTitle>
          <CardDescription>
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Seuls les administrateurs peuvent accéder au tableau de bord.
          </p>
          <div className="flex gap-2">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Retour à l'accueil
              </Button>
            </Link>
            <Button variant="destructive" onClick={onSignOut} className="flex-1">
              Déconnexion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminContent = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isLoading: roleLoading, error } = useAdminAuth();

  // Show loading while checking auth state
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />;
  }

  // Show error state if role check failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Erreur</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={signOut} className="w-full">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show unauthorized view if user is not admin
  if (!isAdmin) {
    return <UnauthorizedView onSignOut={signOut} />;
  }

  // User is authenticated AND has admin role - show dashboard
  return <Dashboard />;
};

const Admin = () => {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
};

export default Admin;
