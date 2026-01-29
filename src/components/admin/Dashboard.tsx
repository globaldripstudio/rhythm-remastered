import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Calendar, Users, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminCalendar from './AdminCalendar';
import ClientsList from './ClientsList';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img 
                src="/lovable-uploads/logo-blanc-sans-fond.png" 
                alt="Global Drip Studio" 
                className="h-8"
              />
            </Link>
            <span className="text-muted-foreground">|</span>
            <span className="font-semibold">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Site
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bienvenue 👋</h1>
          <p className="text-muted-foreground">
            Gérez vos rendez-vous et clients depuis cet espace privé.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <AdminCalendar />
          </div>

          {/* Clients */}
          <div className="lg:col-span-2">
            <ClientsList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
