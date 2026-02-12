import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe, Eye, MousePointerClick, MapPin, Monitor,
  TrendingUp, BarChart3, Users, ArrowUpRight, Clock,
  Search, Download, Mail
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

interface ContactLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string | null;
  created_at: string;
}

const COLORS = ['hsl(18, 100%, 60%)', 'hsl(180, 35%, 35%)', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8', '#a29bfe'];

const downloadCSV = (headers: string[], rows: string[][], filename: string) => {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const SiteAnalytics = () => {
  const [data, setData] = useState<AnalyticsRow[]>([]);
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    const since = subDays(new Date(), parseInt(period));
    
    const { data: rows, error } = await supabase
      .from('site_analytics')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000);

    if (!error) setData(rows || []);
    setIsLoading(false);
  };

  const fetchLeads = async () => {
    const { data: rows } = await supabase
      .from('contact_leads')
      .select('*')
      .order('created_at', { ascending: false });
    setLeads(rows || []);
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
    return { date: format(day, 'dd/MM', { locale: fr }), vues: count };
  });

  // Top pages
  const pageCounts: Record<string, number> = {};
  pageViews.forEach(v => { pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1; });
  const topPages = Object.entries(pageCounts).sort(([, a], [, b]) => b - a).slice(0, 8).map(([path, count]) => ({ path, count }));

  // Top locations
  const locationCounts: Record<string, number> = {};
  data.filter(d => d.city && d.country).forEach(v => {
    const loc = `${v.city}, ${v.country}`;
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const topLocations = Object.entries(locationCounts).sort(([, a], [, b]) => b - a).slice(0, 8).map(([location, count]) => ({ location, count }));

  // Top countries for pie chart
  const countryCounts: Record<string, number> = {};
  data.filter(d => d.country).forEach(v => { countryCounts[v.country!] = (countryCounts[v.country!] || 0) + 1; });
  const countryData = Object.entries(countryCounts).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, value]) => ({ name, value }));

  // Button clicks breakdown
  const clickCounts: Record<string, number> = {};
  [...buttonClicks, ...ctaClicks].forEach(v => {
    const name = v.button_name || 'Inconnu';
    clickCounts[name] = (clickCounts[name] || 0) + 1;
  });
  const topClicks = Object.entries(clickCounts).sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, count]) => ({ name, count }));

  // Referrer / search query analysis
  const referrerCounts: Record<string, number> = {};
  data.filter(d => d.referrer && d.referrer.trim() !== '').forEach(v => {
    try {
      const url = new URL(v.referrer!);
      // Extract search queries from Google, Bing, etc.
      const q = url.searchParams.get('q') || url.searchParams.get('query') || url.searchParams.get('p');
      const source = q ? `🔍 "${q}" (${url.hostname})` : url.hostname;
      referrerCounts[source] = (referrerCounts[source] || 0) + 1;
    } catch {
      referrerCounts[v.referrer!] = (referrerCounts[v.referrer!] || 0) + 1;
    }
  });
  const topReferrers = Object.entries(referrerCounts).sort(([, a], [, b]) => b - a).slice(0, 15).map(([source, count]) => ({ source, count }));

  // Recent visitors
  const recentVisitors = data.filter(d => d.event_type === 'page_view').slice(0, 15);

  const pageLabels: Record<string, string> = {
    '/': 'Accueil', '/services': 'Services', '/portfolio': 'Portfolio',
    '/projets': 'Projets', '/blog': 'Blog', '/ebook': 'E-book',
    '/mentions-legales': 'Mentions légales', '/cgv': 'CGV',
    '/politique-confidentialite': 'Politique',
  };

  const serviceLabels: Record<string, string> = {
    'mixage': 'Mixage', 'mixage-mastering': 'Mixage + Mastering',
    'sound-design': 'Sound Design', 'enregistrement-studio': 'Enregistrement Studio',
    'composition-beatmaking': 'Composition/Beatmaking', 'formation': 'Formation',
  };

  // CSV exports
  const exportAnalyticsCSV = () => {
    const headers = ['Date', 'Type', 'Page', 'Bouton', 'Referrer', 'IP', 'Ville', 'Pays', 'Session'];
    const rows = data.map(d => [
      format(new Date(d.created_at), 'dd/MM/yyyy HH:mm'),
      d.event_type, d.page_path, d.button_name || '', d.referrer || '',
      d.ip_address || '', d.city || '', d.country || '', d.session_id || ''
    ]);
    downloadCSV(headers, rows, `analytics-${period}j-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportLeadsCSV = () => {
    const headers = ['Date', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Service', 'Message'];
    const rows = leads.map(l => [
      format(new Date(l.created_at), 'dd/MM/yyyy HH:mm'),
      l.first_name, l.last_name, l.email, l.phone || '', serviceLabels[l.service || ''] || l.service || '', l.message || ''
    ]);
    downloadCSV(headers, rows, `leads-contact-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
      {/* Header with exports */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Analytics du site
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={exportAnalyticsCSV}>
            <Download className="w-4 h-4 mr-1" /> Analytics CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportLeadsCSV}>
            <Mail className="w-4 h-4 mr-1" /> Leads CSV ({leads.length})
          </Button>
          <div className="flex gap-1 ml-2">
            {(['7', '30', '90'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === p ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {p}j
              </button>
            ))}
          </div>
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
            <Users className="w-5 h-5 text-secondary mb-1" />
            <p className="text-2xl font-bold">{uniqueSessions}</p>
            <p className="text-xs text-muted-foreground">Visiteurs uniques</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3">
            <Monitor className="w-5 h-5 text-blue-400 mb-1" />
            <p className="text-2xl font-bold">{uniqueIPs}</p>
            <p className="text-xs text-muted-foreground">IPs uniques</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3">
            <MousePointerClick className="w-5 h-5 text-orange-400 mb-1" />
            <p className="text-2xl font-bold">{buttonClicks.length + ctaClicks.length}</p>
            <p className="text-xs text-muted-foreground">Clics boutons</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3">
            <Mail className="w-5 h-5 text-pink-400 mb-1" />
            <p className="text-2xl font-bold">{leads.length}</p>
            <p className="text-xs text-muted-foreground">Leads contact</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="traffic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="traffic">Trafic</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="geo">Géographie</TabsTrigger>
          <TabsTrigger value="clicks">Clics</TabsTrigger>
          <TabsTrigger value="referrers">Sources</TabsTrigger>
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
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(page.count / topPages[0].count) * 100}%` }} />
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
                <CardTitle className="text-lg flex items-center gap-2"><Globe className="w-5 h-5" /> Visiteurs par pays</CardTitle>
              </CardHeader>
              <CardContent>
                {countryData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune donnée géographique</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={countryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {countryData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><MapPin className="w-5 h-5" /> Top villes</CardTitle>
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
                <CardTitle className="text-lg flex items-center gap-2"><MousePointerClick className="w-5 h-5" /> Clics par bouton</CardTitle>
              </CardHeader>
              <CardContent>
                {topClicks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucun clic enregistré</p>
                ) : (
                  <div className="space-y-2">
                    {topClicks.map((click) => (
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
                <CardTitle className="text-lg flex items-center gap-2"><Clock className="w-5 h-5" /> Derniers visiteurs</CardTitle>
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
                          <span className="text-muted-foreground shrink-0 ml-2">{format(new Date(v.created_at), 'dd/MM HH:mm')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="referrers">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Search className="w-5 h-5" /> Sources de trafic & recherches</CardTitle>
                <CardDescription>Referrers et requêtes de recherche ayant mené au site</CardDescription>
              </CardHeader>
              <CardContent>
                {topReferrers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune donnée de source disponible</p>
                ) : (
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-2">
                      {topReferrers.map((ref, i) => (
                        <div key={ref.source} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                            <span className="text-sm truncate">{ref.source}</span>
                          </div>
                          <Badge variant="outline" className="shrink-0 ml-2">{ref.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Mail className="w-5 h-5" /> Derniers leads contact</CardTitle>
                <CardDescription>{leads.length} emails collectés via le formulaire</CardDescription>
              </CardHeader>
              <CardContent>
                {leads.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucun lead pour le moment</p>
                ) : (
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-2">
                      {leads.slice(0, 20).map(lead => (
                        <div key={lead.id} className="p-2.5 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{lead.first_name} {lead.last_name}</span>
                            <span className="text-xs text-muted-foreground">{format(new Date(lead.created_at), 'dd/MM/yy')}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{lead.email}</div>
                          {lead.service && <Badge variant="outline" className="mt-1 text-xs">{serviceLabels[lead.service] || lead.service}</Badge>}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteAnalytics;
