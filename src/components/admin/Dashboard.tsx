import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Calendar, Users, Home, BarChart3, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import WeeklyAgenda from './WeeklyAgenda';
import ClientsList from './ClientsList';
import CRMAnalytics from './CRMAnalytics';
import StripeAnalytics from './StripeAnalytics';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img 
                src="/lovable-uploads/logo-blanc-sans-fond.png" 
                alt="Global Drip Studio" 
                className="h-8"
              />
            </Link>
            <span className="text-muted-foreground hidden sm:inline">|</span>
            <span className="font-semibold hidden sm:inline">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">
              {user?.email}
            </span>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Site</span>
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bienvenue 👋</h1>
          <p className="text-muted-foreground">
            Gérez vos rendez-vous, clients et analysez votre activité.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Stripe</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <CRMAnalytics />
          </TabsContent>

          <TabsContent value="stripe">
            <StripeAnalytics />
          </TabsContent>

          <TabsContent value="calendar">
            <WeeklyAgenda />
          </TabsContent>

          <TabsContent value="clients">
            <ClientsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
