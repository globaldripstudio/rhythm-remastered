import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Users, Calendar, 
  Target, Star, Eye, Globe
} from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns';

const PerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    pageViews30d: 0,
    uniqueVisitors30d: 0,
    countries: 0,
    buttonClicks30d: 0,
    clientsThisMonth: 0,
    clientsLastMonth: 0,
    eventsThisMonth: 0,
    eventsLastMonth: 0,
    totalClients: 0,
    avgEventsPerWeek: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) calculateMetrics();
  }, [user]);

  const calculateMetrics = async () => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const thirtyDaysAgo = subDays(now, 30);

    // Fetch site analytics (last 30 days)
    const { data: analytics } = await supabase
      .from('site_analytics')
      .select('event_type, session_id, country, button_name')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const pageViews30d = analytics?.filter(a => a.event_type === 'page_view').length || 0;
    const uniqueVisitors30d = new Set(analytics?.map(a => a.session_id).filter(Boolean)).size;
    const countries = new Set(analytics?.map(a => a.country).filter(Boolean)).size;
    const buttonClicks30d = analytics?.filter(a => a.event_type === 'button_click' || a.event_type === 'cta_click').length || 0;

    // Clients & events (secondary)
    const { data: clients } = await supabase.from('clients').select('created_at');
    const { data: events } = await supabase.from('events').select('start_time').gte('start_time', subMonths(now, 3).toISOString());

    const clientsThisMonth = clients?.filter(c => { const d = new Date(c.created_at); return d >= thisMonthStart && d <= thisMonthEnd; }).length || 0;
    const clientsLastMonth = clients?.filter(c => { const d = new Date(c.created_at); return d >= lastMonthStart && d <= lastMonthEnd; }).length || 0;
    const eventsThisMonth = events?.filter(e => { const d = new Date(e.start_time); return d >= thisMonthStart && d <= thisMonthEnd; }).length || 0;
    const eventsLastMonth = events?.filter(e => { const d = new Date(e.start_time); return d >= lastMonthStart && d <= lastMonthEnd; }).length || 0;
    const avgEventsPerWeek = Math.round((events?.length || 0) / 12);

    setMetrics({
      pageViews30d, uniqueVisitors30d, countries, buttonClicks30d,
      clientsThisMonth, clientsLastMonth, eventsThisMonth, eventsLastMonth,
      totalClients: clients?.length || 0, avgEventsPerWeek
    });
    setIsLoading(false);
  };

  const growth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '—';
    const g = Math.round(((current - previous) / previous) * 100);
    return g >= 0 ? `+${g}%` : `${g}%`;
  };

  if (isLoading) {
    return <Card className="border-primary/20"><CardContent className="py-8 text-center text-muted-foreground">Chargement...</CardContent></Card>;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Performance (30j)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary: Site metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-3 border border-primary/30">
            <Eye className="w-4 h-4 text-primary mb-1" />
            <p className="text-2xl font-bold">{metrics.pageViews30d}</p>
            <p className="text-xs text-muted-foreground">Pages vues</p>
          </div>
          <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-lg p-3 border border-secondary/30">
            <Globe className="w-4 h-4 text-secondary mb-1" />
            <p className="text-2xl font-bold">{metrics.uniqueVisitors30d}</p>
            <p className="text-xs text-muted-foreground">Visiteurs uniques</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Clics boutons</span>
            </div>
            <span className="font-bold">{metrics.buttonClicks30d}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Pays</span>
            </div>
            <span className="font-bold">{metrics.countries}</span>
          </div>
        </div>

        {/* Secondary: Manual data (smaller) */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Données manuelles</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 rounded bg-muted/20 text-sm">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Clients</span>
              </div>
              <div className="text-right">
                <span className="font-medium">{metrics.totalClients}</span>
                <Badge variant="outline" className="ml-1.5 text-[10px] px-1">
                  {growth(metrics.clientsThisMonth, metrics.clientsLastMonth)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted/20 text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">RDV/mois</span>
              </div>
              <div className="text-right">
                <span className="font-medium">{metrics.eventsThisMonth}</span>
                <Badge variant="outline" className="ml-1.5 text-[10px] px-1">
                  {growth(metrics.eventsThisMonth, metrics.eventsLastMonth)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
