import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileAudio, HardDrive, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

type StoredFile = { id: string; file_name: string; size_bytes: number; status: string; uploaded_at: string | null };
type Order = { id: string; service_id: string; customer_email: string; status: string; created_at: string; service_order_files: StoredFile[] };
const size = (bytes: number) => bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} Go` : `${(bytes / 1024 ** 2).toFixed(1)} Mo`;

const OrderFilesManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [usedBytes, setUsedBytes] = useState(0);
  const [quotaBytes, setQuotaBytes] = useState(1);
  const [loading, setLoading] = useState(true);
  const invoke = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("service-order-files", { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await invoke({ action: "admin-list" });
      setOrders(data.orders ?? []);
      setUsedBytes(Number(data.usedBytes ?? 0));
      setQuotaBytes(Number(data.quotaBytes ?? 1));
    } catch { toast.error("Impossible de charger les fichiers clients."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const completeOrders = useMemo(() => orders.map((order) => ({ ...order, service_order_files: (order.service_order_files ?? []).filter((file) => file.status === "complete") })).filter((order) => order.service_order_files.length), [orders]);
  const usedPercent = Math.min(100, (usedBytes / quotaBytes) * 100);
  const download = async (file: StoredFile) => {
    try { const data = await invoke({ action: "admin-download", fileId: file.id }); window.open(data.url, "_blank", "noopener,noreferrer"); }
    catch { toast.error("Téléchargement impossible."); }
  };
  const remove = async (file: StoredFile) => {
    if (!confirm(`Supprimer définitivement « ${file.file_name} » ?`)) return;
    try { await invoke({ action: "admin-delete", fileId: file.id }); toast.success("Fichier supprimé."); await load(); }
    catch { toast.error("Suppression impossible."); }
  };
  return <div className="space-y-5"><Card><CardHeader className="flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><HardDrive className="h-5 w-5 text-primary" />Stockage des commandes</CardTitle><Button variant="outline" size="icon" onClick={() => void load()} aria-label="Actualiser"><RefreshCw className="h-4 w-4" /></Button></CardHeader><CardContent className="space-y-3"><div className="flex flex-wrap justify-between gap-2 text-sm"><span>{size(usedBytes)} utilisés</span><span>{size(Math.max(0, quotaBytes - usedBytes))} restants · {(100 - usedPercent).toFixed(1)} %</span></div><Progress value={usedPercent} /><p className="text-xs text-muted-foreground">Capacité de référence : {size(quotaBytes)}. Les fichiers restent privés.</p></CardContent></Card>{loading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> : completeOrders.length === 0 ? <p className="py-10 text-center text-muted-foreground">Aucun fichier client envoyé.</p> : completeOrders.map((order) => <Card key={order.id}><CardHeader><CardTitle className="text-base">{order.service_id}</CardTitle><p className="text-sm text-muted-foreground">{order.customer_email} · {new Date(order.created_at).toLocaleDateString("fr-FR")}</p></CardHeader><CardContent className="space-y-2">{order.service_order_files.map((file) => <div key={file.id} className="flex min-w-0 items-center gap-3 rounded-md border border-border/60 p-3"><FileAudio className="h-5 w-5 shrink-0 text-primary" /><span className="min-w-0 flex-1 truncate text-sm">{file.file_name}</span><span className="shrink-0 text-xs text-muted-foreground">{size(file.size_bytes)}</span><Button variant="outline" size="icon" onClick={() => void download(file)} aria-label={`Télécharger ${file.file_name}`}><Download className="h-4 w-4" /></Button><Button variant="destructive" size="icon" onClick={() => void remove(file)} aria-label={`Supprimer ${file.file_name}`}><Trash2 className="h-4 w-4" /></Button></div>)}</CardContent></Card>)}</div>;
};

export default OrderFilesManager;