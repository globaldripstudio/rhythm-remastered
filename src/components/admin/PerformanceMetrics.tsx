import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Users, Calendar, 
  Target, Award, Flame, Star, ArrowRight
} from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';

const PerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    clientsThisMonth: 0,
    clientsLastMonth: 0,
    eventsThisMonth: 0,
    eventsLastMonth: 0,
    totalClients: 0,
    avgEventsPerWeek: 0,
    streak: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      calculateMetrics();
    }
  }, [user]);

  const calculateMetrics = async () => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Fetch clients
    const { data: clients } = await supabase
      .from('clients')
      .select('created_at');

    // Fetch events
    const { data: events } = await supabase
      .from('events')
      .select('start_time')
      .gte('start_time', subMonths(now, 3).toISOString());

    const clientsThisMonth = clients?.filter(c => {
      const date = new Date(c.created_at);
      return date >= thisMonthStart && date <= thisMonthEnd;
    }).length || 0;

    const clientsLastMonth = clients?.filter(c => {
      const date = new Date(c.created_at);
      return date >= lastMonthStart && date <= lastMonthEnd;
    }).length || 0;

    const eventsThisMonth = events?.filter(e => {
      const date = new Date(e.start_time);
      return date >= thisMonthStart && date <= thisMonthEnd;
    }).length || 0;

    const eventsLastMonth = events?.filter(e => {
      const date = new Date(e.start_time);
      return date >= lastMonthStart && date <= lastMonthEnd;
    }).length || 0;

    // Calculate weekly average
    const weeks = 12;
    const totalEventsRecent = events?.length || 0;
    const avgEventsPerWeek = Math.round(totalEventsRecent / weeks);

    setMetrics({
      clientsThisMonth,
      clientsLastMonth,
      eventsThisMonth,
      eventsLastMonth,
      totalClients: clients?.length || 0,
      avgEventsPerWeek,
      streak: eventsThisMonth > 0 ? Math.min(eventsThisMonth, 10) : 0
    });
    setIsLoading(false);
  };

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const growth = Math.round(((current - previous) / previous) * 100);
    return growth >= 0 ? `+${growth}%` : `${growth}%`;
  };

  const isPositiveGrowth = (current: number, previous: number) => {
    return current >= previous;
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-8 text-center text-muted-foreground">
          Chargement...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-lg p-4 border border-secondary/30">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-secondary" />
              {isPositiveGrowth(metrics.clientsThisMonth, metrics.clientsLastMonth) ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-2xl font-bold">{metrics.clientsThisMonth}</p>
            <p className="text-xs text-muted-foreground">Clients ce mois</p>
            <Badge 
              variant="outline" 
              className={`mt-2 ${isPositiveGrowth(metrics.clientsThisMonth, metrics.clientsLastMonth) ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30'}`}
            >
              {getGrowthIndicator(metrics.clientsThisMonth, metrics.clientsLastMonth)}
            </Badge>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-4 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              {isPositiveGrowth(metrics.eventsThisMonth, metrics.eventsLastMonth) ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-2xl font-bold">{metrics.eventsThisMonth}</p>
            <p className="text-xs text-muted-foreground">RDV ce mois</p>
            <Badge 
              variant="outline" 
              className={`mt-2 ${isPositiveGrowth(metrics.eventsThisMonth, metrics.eventsLastMonth) ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30'}`}
            >
              {getGrowthIndicator(metrics.eventsThisMonth, metrics.eventsLastMonth)}
            </Badge>
          </div>
        </div>

        {/* Secondary metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Total clients</span>
            </div>
            <span className="font-bold">{metrics.totalClients}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Moy. RDV/semaine</span>
            </div>
            <span className="font-bold">{metrics.avgEventsPerWeek}</span>
          </div>

          {metrics.streak > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">Série active</span>
              </div>
              <Badge className="bg-orange-500">{metrics.streak} RDV</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
