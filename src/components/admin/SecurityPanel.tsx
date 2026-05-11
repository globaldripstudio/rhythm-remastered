import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldAlert, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BlockEntry {
  ip_address: string;
  reason: string;
  blocked_until: string | null;
  created_at: string;
}

interface AttemptEntry {
  id: string;
  ip_address: string;
  email_attempted: string | null;
  success: boolean;
  created_at: string;
}

const reasonLabel = (r: string) => {
  switch (r) {
    case 'wrong_email':
      return 'Email non autorisé';
    case 'burst':
      return '10 échecs en 5 min';
    case 'repeated_failures':
      return '5 échecs en 15 min';
    default:
      return r;
  }
};

const SecurityPanel = () => {
  const [blocks, setBlocks] = useState<BlockEntry[]>([]);
  const [attempts, setAttempts] = useState<AttemptEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: b }, { data: a }] = await Promise.all([
      supabase
        .from('admin_ip_blocklist')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('admin_login_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);
    setBlocks((b as BlockEntry[]) ?? []);
    setAttempts((a as AttemptEntry[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const unblock = async (ip: string) => {
    const { error } = await supabase.from('admin_ip_blocklist').delete().eq('ip_address', ip);
    if (error) {
      toast.error('Échec du déblocage');
      return;
    }
    toast.success(`IP ${ip} débloquée`);
    load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              IP bloquées
            </CardTitle>
            <CardDescription>
              Tentatives de connexion bloquées par le pare-feu admin
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucune IP bloquée actuellement.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Bloquée</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((b) => {
                  const permanent = !b.blocked_until;
                  const active =
                    permanent || new Date(b.blocked_until!) > new Date();
                  return (
                    <TableRow key={b.ip_address}>
                      <TableCell className="font-mono text-sm">{b.ip_address}</TableCell>
                      <TableCell>
                        <Badge variant={permanent ? 'destructive' : 'secondary'}>
                          {reasonLabel(b.reason)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {permanent ? (
                          <span className="text-destructive font-medium">Permanent</span>
                        ) : (
                          <>
                            {new Date(b.blocked_until!).toLocaleString('fr-FR')}{' '}
                            {!active && <span className="text-muted-foreground">(expirée)</span>}
                          </>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        il y a{' '}
                        {formatDistanceToNow(new Date(b.created_at), { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unblock(b.ip_address)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Débloquer
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>50 dernières tentatives</CardTitle>
          <CardDescription>Historique court (purgé après 24h)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucune tentative récente.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Email essayé</TableHead>
                  <TableHead>Résultat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {new Date(a.created_at).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{a.ip_address}</TableCell>
                    <TableCell className="text-sm">{a.email_attempted ?? '—'}</TableCell>
                    <TableCell>
                      {a.success ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20">
                          Succès
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Échec</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPanel;
