import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, FileAudio, Loader2, UploadCloud } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type OrderFile = { id: string; file_name: string; size_bytes: number; status: string; uploaded_at: string | null };
const MAX_BYTES = 2 * 1024 * 1024 * 1024;
const formatSize = (bytes: number) => bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} Go` : `${(bytes / 1024 ** 2).toFixed(1)} Mo`;

const ServiceFiles = () => {
  const [params] = useSearchParams();
  const orderId = params.get("order") ?? "";
  const token = params.get("token") ?? "";
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const invoke = useCallback(async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("service-order-files", { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await invoke({ action: "order", orderId, token });
      setFiles(data.files ?? []);
      setServiceId(data.order?.service_id ?? "");
    } catch {
      toast.error("Ce lien de dépôt n’est pas valide.");
    } finally {
      setLoading(false);
    }
  }, [invoke, orderId, token]);

  useEffect(() => { void load(); }, [load]);

  const upload = async (selected: FileList | null) => {
    const selectedFiles = Array.from(selected ?? []);
    if (!selectedFiles.length) return;
    if (selectedFiles.some((file) => file.size > MAX_BYTES)) {
      toast.error("Chaque fichier doit peser au maximum 2 Go. Contactez le studio pour un projet plus volumineux.");
      return;
    }
    setUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setProgress(Math.round((i / selectedFiles.length) * 100));
        const prepared = await invoke({ action: "create-upload", orderId, token, fileName: file.name, sizeBytes: file.size });
        const result = await supabase.storage.from("service-order-files").uploadToSignedUrl(prepared.path, prepared.signedToken, file, { contentType: file.type || "application/octet-stream" });
        if (result.error) throw result.error;
        await invoke({ action: "confirm-upload", orderId, token, fileId: prepared.fileId });
        setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }
      toast.success("Vos fichiers ont bien été déposés.");
      await load();
    } catch (error) {
      console.error(error);
      toast.error("L’envoi n’a pas abouti. Vous pouvez réessayer sans renvoyer les fichiers déjà affichés.");
    } finally {
      setUploading(false);
    }
  };

  return <div className="min-h-screen bg-background"><Header /><main className="container mx-auto px-4 pb-20 pt-32"><Card className="mx-auto max-w-2xl border-border/60"><CardHeader><CardTitle className="flex items-center gap-2"><UploadCloud className="h-6 w-6 text-primary" />Dépôt privé de votre commande</CardTitle><p className="text-sm text-muted-foreground">{serviceId ? `Commande ${serviceId} — ` : ""}vos fichiers sont accessibles uniquement pour cette commande et par le studio.</p></CardHeader><CardContent className="space-y-5">{loading ? <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" /> : <><label className="block cursor-pointer rounded-md border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/60"><input className="sr-only" type="file" multiple disabled={uploading} onChange={(event) => void upload(event.target.files)} /><UploadCloud className="mx-auto mb-3 h-8 w-8 text-primary" /><span className="font-medium">Choisir les fichiers à envoyer</span><span className="mt-1 block text-xs text-muted-foreground">WAV, stems, archives et documents — 2 Go maximum par fichier</span></label>{uploading && <div className="space-y-2"><Progress value={progress} /><p className="text-center text-xs text-muted-foreground">Envoi sécurisé en cours — {progress}%</p></div>}<div className="space-y-2">{files.map((file) => <div key={file.id} className="flex items-center gap-3 rounded-md border border-border/60 p-3"><FileAudio className="h-5 w-5 text-primary" /><span className="min-w-0 flex-1 truncate text-sm">{file.file_name}</span><span className="text-xs text-muted-foreground">{formatSize(file.size_bytes)}</span><CheckCircle2 className="h-4 w-4 text-primary" /></div>)}</div><p className="text-xs leading-relaxed text-muted-foreground">Pour un ensemble dépassant cette capacité, contactez directement le studio afin que nous préparions une solution adaptée.</p></>}</CardContent></Card></main><Footer /></div>;
};

export default ServiceFiles;