import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe, Eye, MousePointerClick, MapPin, Monitor,
  TrendingUp, BarChart3, Users, ArrowUpRight, Clock
} from 'lucide-react';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsRow {
  id: string;
  event_type: string;
  page_path: string;
  button_name: string | null;
  referrer: string | null;
  ip_address: string | null;
  city: string | null;
  country: string | null;
  country_code: string | null;
  session_id: string | null;
  created_at: string;
}

const COLORS = ['hsl(18, 100%, 60%)', 'hsl(180, 35%, 35%)', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8', '#a29bfe'];

const SiteAnalytics = () => {
  const [data, setData] = useState<AnalyticsRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    const since = subDays(new Date(), parseInt(period));
    
    const { data: rows, error } = await supabase
      .from('site_analytics')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000);

    if (!error) {
      setData(rows || []);
    }
    setIsLoading(false);
  };

  // Compute metrics
  const pageViews = data.filter(d => d.event_type === 'page_view');
  const buttonClicks = data.filter(d => d.event_type === 'button_click');
  const ctaClicks = data.filter(d => d.event_type === 'cta_click');
  const uniqueSessions = new Set(data.map(d => d.session_id).filter(Boolean)).size;
  const uniqueIPs = new Set(data.map(d => d.ip_address).filter(Boolean)).size;

  // Page views by day
  const days = eachDayOfInterval({
    start: subDays(new Date(), parseInt(period)),
    end: new Date()
  });

  const viewsByDay = days.map(day => {
    const dayStart = startOfDay(day);
    const nextDay = new Date(dayStart.getTime() + 86400000);
    const count = pageViews.filter(v => {
      const d = new Date(v.created_at);
      return d >= dayStart && d < nextDay;
    }).length;
    return {
      date: format(day, 'dd/MM', { locale: fr }),
      vues: count
    };
  });

  // Top pages
  const pageCounts: Record<string, number> = {};
  pageViews.forEach(v => {
    pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1;
  });
  const topPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([path, count]) => ({ path, count }));

  // Top locations
  const locationCounts: Record<string, number> = {};
  data.filter(d => d.city && d.country).forEach(v => {
    const loc = `${v.city}, ${v.country}`;
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const topLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([location, count]) => ({ location, count }));

  // Top countries for pie chart
  const countryCounts: Record<string, number> = {};
  data.filter(d => d.country).forEach(v => {
    countryCounts[v.country!] = (countryCounts[v.country!] || 0) + 1;
  });
  const countryData = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Button clicks breakdown
  const clickCounts: Record<string, number> = {};
  [...buttonClicks, ...ctaClicks].forEach(v => {
    const name = v.button_name || 'Inconnu';
    clickCounts[name] = (clickCounts[name] || 0) + 1;
  });
  const topClicks = Object.entries(clickCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Recent visitors
  const recentVisitors = data
    .filter(d => d.event_type === 'page_view')
    .slice(0, 15);

  const pageLabels: Record<string, string> = {
    '/': 'Accueil',
    '/services': 'Services',
    '/portfolio': 'Portfolio',
    '/projets': 'Projets',
    '/blog': 'Blog',
    '/ebook': 'E-book',
    '/mentions-legales': 'Mentions légales',
    '/cgv': 'CGV',
    '/politique-confidentialite': 'Politique',
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-8 text-center text-muted-foreground">
          Chargement des données analytics...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Analytics du site
        </h2>
        <div className="flex gap-2">
          {(['7', '30', '90'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {p}j
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-1">
              <Eye className="w-5 h-5 text-primary" />
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{pageViews.length}</p>
            <p className="text-xs text-muted-foreground">Pages vues</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-1">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl font-bold">{uniqueSessions}</p>
            <p className="text-xs text-muted-foreground">Visiteurs uniques</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-1">
              <Monitor className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{uniqueIPs}</p>
            <p className="text-xs text-muted-foreground">IPs uniques</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-1">
              <MousePointerClick className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold">{buttonClicks.length + ctaClicks.length}</p>
            <p className="text-xs text-muted-foreground">Clics boutons</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-1">
              <MapPin className="w-5 h-5 text-pink-400" />
            </div>
            <p className="text-2xl font-bold">{Object.keys(countryCounts).length}</p>
            <p className="text-xs text-muted-foreground">Pays</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="traffic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="traffic">Trafic</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="geo">Géographie</TabsTrigger>
          <TabsTrigger value="clicks">Clics</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Pages vues ({period} derniers jours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={viewsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="vues" name="Pages vues" stroke="hsl(18, 100%, 60%)" fill="hsl(18, 100%, 60%)" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Pages les plus visitées
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
              ) : (
                <div className="space-y-3">
                  {topPages.map((page, i) => (
                    <div key={page.path} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-6">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{pageLabels[page.path] || page.path}</span>
                          <span className="text-sm font-bold">{page.count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(page.count / topPages[0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geo">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Visiteurs par pays
                </CardTitle>
              </CardHeader>
              <CardContent>
                {countryData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune donnée géographique</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={countryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {countryData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Top villes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topLocations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune donnée</p>
                ) : (
                  <div className="space-y-2">
                    {topLocations.map((loc, i) => (
                      <div key={loc.location} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                          <span className="text-sm">{loc.location}</span>
                        </div>
                        <Badge variant="outline">{loc.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clicks">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MousePointerClick className="w-5 h-5" />
                  Clics par bouton
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topClicks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucun clic enregistré</p>
                ) : (
                  <div className="space-y-2">
                    {topClicks.map((click, i) => (
                      <div key={click.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-sm font-medium">{click.name}</span>
                        <Badge>{click.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Derniers visiteurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {recentVisitors.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucun visiteur</p>
                  ) : (
                    <div className="space-y-2">
                      {recentVisitors.map(v => (
                        <div key={v.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{pageLabels[v.page_path] || v.page_path}</span>
                            {v.city && <span className="text-muted-foreground ml-2">• {v.city}, {v.country_code}</span>}
                          </div>
                          <span className="text-muted-foreground shrink-0 ml-2">
                            {format(new Date(v.created_at), 'dd/MM HH:mm')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteAnalytics;
