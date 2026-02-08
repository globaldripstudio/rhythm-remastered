import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LogOut, Calendar, Users, Home, BarChart3, CreditCard, 
  LayoutDashboard, Settings, Bell, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WeeklyAgenda from './WeeklyAgenda';
import ClientsList from './ClientsList';
import CRMAnalytics from './CRMAnalytics';
import StripeAnalytics from './StripeAnalytics';
import TodayOverview from './TodayOverview';
import ActivityFeed from './ActivityFeed';
import PerformanceMetrics from './PerformanceMetrics';
import QuickActions from './QuickActions';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const clientsRef = useRef<{ openAddDialog?: () => void }>({});
  const agendaRef = useRef<{ openAddDialog?: () => void }>({});

  const handleAddClient = () => {
    setActiveTab('clients');
    // Small delay to ensure tab is rendered
    setTimeout(() => {
      const addButton = document.querySelector('[data-add-client]') as HTMLButtonElement;
      if (addButton) addButton.click();
    }, 100);
  };

  const handleAddEvent = () => {
    setActiveTab('calendar');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/lovable-uploads/logo-blanc-sans-fond.png" 
                alt="Global Drip Studio" 
                className="h-10"
              />
              <div className="hidden sm:block">
                <span className="font-semibold text-lg">Dashboard</span>
                <span className="text-xs text-muted-foreground block">Centre de pilotage</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification placeholder */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:inline text-sm max-w-[150px] truncate">
                    {user?.email}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer">
                    <Home className="w-4 h-4 mr-2" />
                    Retour au site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 h-auto p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
              <span className="sm:hidden">Accueil</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 py-3">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Statistiques</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2 py-3">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Paiements</span>
              <span className="sm:hidden">€</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 py-3">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Agenda</span>
              <span className="sm:hidden">RDV</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2 py-3">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clients</span>
              <span className="sm:hidden">CRM</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Command Center */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Today + Actions */}
              <div className="space-y-6">
                <TodayOverview />
                <QuickActions 
                  onAddClient={handleAddClient}
                  onAddEvent={handleAddEvent}
                />
              </div>

              {/* Middle Column - Activity */}
              <div className="space-y-6">
                <ActivityFeed />
              </div>

              {/* Right Column - Performance */}
              <div className="space-y-6">
                <PerformanceMetrics />
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <CRMAnalytics />
          </TabsContent>

          {/* Stripe Tab */}
          <TabsContent value="stripe">
            <StripeAnalytics />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <WeeklyAgenda />
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <ClientsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
