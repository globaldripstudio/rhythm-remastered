import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Loader2, RefreshCw, ShieldAlert, Activity, Clock } from 'lucide-react';

type AuditEntry = {
  id: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  row_id: string | null;
  actor_user_id: string | null;
  actor_role: string | null;
  old_data: unknown;
  new_data: unknown;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

const TABLES = [
  'all', 'user_roles', 'profiles', 'ebook_purchases',
  'contact_leads', 'clients', 'events', 'blog_views',
];
const ACTIONS = ['all', 'INSERT', 'UPDATE', 'DELETE'] as const;
const PAGE_SIZE = 50;

const actionVariant = (action: string) => {
  switch (action) {
    case 'INSERT': return 'default';
    case 'UPDATE': return 'secondary';
    case 'DELETE': return 'destructive';
    default: return 'outline';
  }
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

const AuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [counts, setCounts] = useState({ d1: 0, d7: 0, d30: 0 });
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    let query = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (tableFilter !== 'all') query = query.eq('table_name', tableFilter);
    if (actionFilter !== 'all') query = query.eq('action', actionFilter);

    const { data, error } = await query;
    if (!error && data) setEntries(data as AuditEntry[]);
    setLoading(false);
  };

  const fetchCounts = async () => {
    const now = Date.now();
    const since = (h: number) => new Date(now - h * 3600 * 1000).toISOString();
    const [d1, d7, d30] = await Promise.all([
      supabase.from('audit_log').select('id', { count: 'exact', head: true }).gte('created_at', since(24)),
      supabase.from('audit_log').select('id', { count: 'exact', head: true }).gte('created_at', since(24 * 7)),
      supabase.from('audit_log').select('id', { count: 'exact', head: true }).gte('created_at', since(24 * 30)),
    ]);
    setCounts({
      d1: d1.count ?? 0,
      d7: d7.count ?? 0,
      d30: d30.count ?? 0,
    });
  };

  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableFilter, actionFilter, page]);

  useEffect(() => {
    fetchCounts();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((e) =>
      [e.table_name, e.action, e.row_id, e.actor_user_id, e.actor_role, e.ip_address]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [entries, search]);

  const refresh = () => { setPage(0); fetchEntries(); fetchCounts(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Journal d'audit
          </h2>
          <p className="text-sm text-muted-foreground">
            Historique des actions sensibles sur la base — rétention 1 an
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: '24 dernières heures', value: counts.d1, icon: Clock },
          { label: '7 derniers jours', value: counts.d7, icon: Activity },
          { label: '30 derniers jours', value: counts.d30, icon: Activity },
        ].map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <c.icon className="w-4 h-4" />
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Select value={tableFilter} onValueChange={(v) => { setPage(0); setTableFilter(v); }}>
            <SelectTrigger><SelectValue placeholder="Table" /></SelectTrigger>
            <SelectContent>
              {TABLES.map((t) => (
                <SelectItem key={t} value={t}>{t === 'all' ? 'Toutes les tables' : t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={(v) => { setPage(0); setActionFilter(v); }}>
            <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              {ACTIONS.map((a) => (
                <SelectItem key={a} value={a}>{a === 'all' ? 'Toutes les actions' : a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Rechercher (id, IP, rôle...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:col-span-2"
          />
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Aucune entrée pour ces critères.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Acteur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="text-right">Détail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs">{formatDate(e.created_at)}</TableCell>
                    <TableCell><code className="text-xs">{e.table_name}</code></TableCell>
                    <TableCell>
                      <Badge variant={actionVariant(e.action) as any}>{e.action}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate font-mono text-xs">
                      {e.actor_user_id ?? '—'}
                    </TableCell>
                    <TableCell className="text-xs">{e.actor_role ?? '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{e.ip_address ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(e)}>
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Page {page + 1}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Précédent
          </Button>
          <Button variant="outline" size="sm"
            disabled={loading || entries.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}>
            Suivant
          </Button>
        </div>
      </div>

      {/* Détail */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant={actionVariant(selected?.action ?? '') as any}>
                {selected?.action}
              </Badge>
              <code className="text-sm">{selected?.table_name}</code>
              <span className="text-xs text-muted-foreground font-normal">
                {selected && formatDate(selected.created_at)}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Acteur</div>
                  <div className="font-mono text-xs break-all">{selected.actor_user_id ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Rôle</div>
                  <div>{selected.actor_role ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">IP</div>
                  <div className="font-mono text-xs">{selected.ip_address ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Ligne</div>
                  <div className="font-mono text-xs break-all">{selected.row_id ?? '—'}</div>
                </div>
              </div>
              {selected.user_agent && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">User-Agent</div>
                  <div className="text-xs break-all">{selected.user_agent}</div>
                </div>
              )}
              {selected.old_data != null && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Avant</div>
                  <pre className="bg-muted/50 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selected.old_data, null, 2)}
                  </pre>
                </div>
              )}
              {selected.new_data != null && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Après</div>
                  <pre className="bg-muted/50 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selected.new_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLog;
