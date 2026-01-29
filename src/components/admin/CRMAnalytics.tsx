import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Calendar, TrendingUp, Clock, UserPlus, 
  CalendarCheck, BarChart3, Activity, Target
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, eachMonthOfInterval, subDays, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  color: string;
}

const COLORS = ['#ff6b35', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8', '#a29bfe'];

const CRMAnalytics = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch all clients
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch all events from last 12 months
    const twelveMonthsAgo = subMonths(new Date(), 12);
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .gte('start_time', twelveMonthsAgo.toISOString())
      .order('start_time', { ascending: false });

    setClients(clientsData || []);
    setEvents(eventsData || []);
    setIsLoading(false);
  };

  // Calculate KPIs
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Clients stats
  const totalClients = clients.length;
  const clientsThisMonth = clients.filter(c => 
    new Date(c.created_at) >= thisMonthStart && new Date(c.created_at) <= thisMonthEnd
  ).length;
  const clientsLastMonth = clients.filter(c => 
    new Date(c.created_at) >= lastMonthStart && new Date(c.created_at) <= lastMonthEnd
  ).length;
  const clientGrowth = clientsLastMonth > 0 
    ? Math.round(((clientsThisMonth - clientsLastMonth) / clientsLastMonth) * 100) 
    : clientsThisMonth > 0 ? 100 : 0;

  // Events stats
  const eventsThisMonth = events.filter(e => 
    new Date(e.start_time) >= thisMonthStart && new Date(e.start_time) <= thisMonthEnd
  ).length;
  const eventsLastMonth = events.filter(e => 
    new Date(e.start_time) >= lastMonthStart && new Date(e.start_time) <= lastMonthEnd
  ).length;
  const eventsThisWeek = events.filter(e => 
    new Date(e.start_time) >= thisWeekStart && new Date(e.start_time) <= thisWeekEnd
  ).length;
  const upcomingEvents = events.filter(e => new Date(e.start_time) >= now).length;

  // Clients with contact info
  const clientsWithEmail = clients.filter(c => c.email).length;
  const clientsWithPhone = clients.filter(c => c.phone).length;
  const clientsWithNotes = clients.filter(c => c.notes).length;
  const contactCompleteness = totalClients > 0 
    ? Math.round((((clientsWithEmail + clientsWithPhone) / 2) / totalClients) * 100)
    : 0;

  // Monthly clients chart data (last 6 months)
  const last6Months = eachMonthOfInterval({
    start: subMonths(now, 5),
    end: now
  });

  const clientsChartData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const count = clients.filter(c => {
      const date = new Date(c.created_at);
      return date >= monthStart && date <= monthEnd;
    }).length;
    
    return {
      month: format(month, 'MMM', { locale: fr }),
      clients: count
    };
  });

  // Monthly events chart data (last 6 months)
  const eventsChartData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const count = events.filter(e => {
      const date = new Date(e.start_time);
      return date >= monthStart && date <= monthEnd;
    }).length;
    
    return {
      month: format(month, 'MMM', { locale: fr }),
      events: count
    };
  });

  // Combined chart data
  const combinedChartData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const clientCount = clients.filter(c => {
      const date = new Date(c.created_at);
      return date >= monthStart && date <= monthEnd;
    }).length;
    
    const eventCount = events.filter(e => {
      const date = new Date(e.start_time);
      return date >= monthStart && date <= monthEnd;
    }).length;
    
    return {
      month: format(month, 'MMM', { locale: fr }),
      clients: clientCount,
      events: eventCount
    };
  });

  // Client completeness pie chart
  const completenessData = [
    { name: 'Avec email', value: clientsWithEmail, color: '#4ecdc4' },
    { name: 'Avec téléphone', value: clientsWithPhone, color: '#ff6b35' },
    { name: 'Avec notes', value: clientsWithNotes, color: '#45b7d1' },
  ];

  // Recent activity
  const recentClients = clients.slice(0, 5);
  const last30DaysClients = clients.filter(c => 
    differenceInDays(now, new Date(c.created_at)) <= 30
  ).length;

  // Average events per month
  const avgEventsPerMonth = events.length > 0 
    ? Math.round(events.length / Math.min(12, differenceInDays(now, subMonths(now, 12)) / 30))
    : 0;

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-8 text-center text-muted-foreground">
          Chargement des données...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{clientsThisMonth} ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Nouveaux clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clientsThisMonth}</div>
            <p className={`text-xs mt-1 ${clientGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {clientGrowth >= 0 ? '+' : ''}{clientGrowth}% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              RDV ce mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{eventsThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {eventsThisWeek} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" />
              RDV à venir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Planifiés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Complétude contacts</p>
                <p className="text-2xl font-bold">{contactCompleteness}%</p>
              </div>
              <Target className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clients (30j)</p>
                <p className="text-2xl font-bold">{last30DaysClients}</p>
              </div>
              <Activity className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moy. RDV/mois</p>
                <p className="text-2xl font-bold">{avgEventsPerMonth}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">RDV mois dernier</p>
                <p className="text-2xl font-bold">{eventsLastMonth}</p>
              </div>
              <Clock className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="completeness">Qualité données</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Évolution de l'activité (6 derniers mois)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="clients" 
                    name="Nouveaux clients"
                    stroke="#4ecdc4" 
                    fill="#4ecdc4" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="events" 
                    name="Rendez-vous"
                    stroke="#ff6b35" 
                    fill="#ff6b35" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Acquisition clients (6 derniers mois)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="clients" 
                    name="Clients"
                    fill="#4ecdc4" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completeness">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Qualité des données clients
              </CardTitle>
              <CardDescription>
                Répartition des informations renseignées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={completenessData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {completenessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span>Clients avec email</span>
                    <span className="font-bold">{clientsWithEmail} / {totalClients}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span>Clients avec téléphone</span>
                    <span className="font-bold">{clientsWithPhone} / {totalClients}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span>Clients avec notes</span>
                    <span className="font-bold">{clientsWithNotes} / {totalClients}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="font-medium">Score qualité global</span>
                    <span className="font-bold text-primary">{contactCompleteness}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Clients */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Derniers clients ajoutés
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentClients.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucun client</p>
          ) : (
            <div className="space-y-3">
              {recentClients.map(client => (
                <div 
                  key={client.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {client.email || client.phone || 'Pas de contact'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(client.created_at), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMAnalytics;
