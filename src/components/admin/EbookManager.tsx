import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Users, Loader2, CheckCircle, AlertCircle, Link2, Copy, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";

const EbookManager = () => {
  const [uploading, setUploading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [fileExists, setFileExists] = useState(false);
  const [grantEmail, setGrantEmail] = useState("");
  const [granting, setGranting] = useState(false);
  const [privateLink, setPrivateLink] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [issued, setIssued] = useState<{ email: string; code: string } | null>(null);

  const buildLink = (email: string) =>
    `${window.location.origin}/ebook/login?email=${encodeURIComponent(email)}`;

  const copyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    toast.success("Lien copié !");
  };

  const grantAccess = async (rawEmail: string) => {
    const email = rawEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email invalide.");
      return;
    }
    setGranting(true);
    try {
      const { data, error } = await supabase.functions.invoke("ebook-grant", {
        body: { email, sendEmail },
      });
      if (error) {
        const ctx = (error as any).context;
        let msg = error.message;
        try { msg = (await ctx?.json?.())?.error ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      setPrivateLink(buildLink(email));
      setIssued({ email, code: data.code });
      await loadPurchases();
      if (data.emailed) toast.success("Code généré et envoyé par email.");
      else if (sendEmail) toast.warning("Code généré, mais l'email n'a pas pu partir : transmettez-le manuellement.");
      else toast.success("Code généré.");
    } catch (error: any) {
      toast.error("Erreur : " + (error.message || "Réessayez"));
    } finally {
      setGranting(false);
    }
  };

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    grantAccess(grantEmail);
  };

  const handleRevoke = async (id: string, email: string) => {
    if (!confirm(`Retirer l'accès de ${email} ?`)) return;
    const { error } = await supabase.from("ebook_purchases").delete().eq("id", id);
    if (error) {
      toast.error("Erreur : " + error.message);
      return;
    }
    toast.success("Accès retiré.");
    loadPurchases();
  };

  useEffect(() => {
    checkCurrentFile();
    loadPurchases();
  }, []);

  const checkCurrentFile = async () => {
    const { data } = await supabase.storage.from("ebook-files").list("", {
      search: "ebook.pdf",
    });
    if (data && data.length > 0) {
      const file = data.find((f) => f.name === "ebook.pdf");
      if (file) {
        setFileExists(true);
        setLastUpdate(file.updated_at || file.created_at);
      }
    }
  };

  const loadPurchases = async () => {
    const { data, error } = await supabase
      .from("ebook_purchases")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPurchases(data);
    }
    setLoadingPurchases(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Seuls les fichiers PDF sont acceptés.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 50 Mo.");
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase.storage
        .from("ebook-files")
        .upload("ebook.pdf", file, {
          upsert: true,
          contentType: "application/pdf",
        });

      if (error) throw error;

      toast.success("E-book mis à jour avec succès !");
      setFileExists(true);
      setLastUpdate(new Date().toISOString());
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Erreur lors de l'upload : " + (error.message || "Réessayez"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Gestion du PDF
          </CardTitle>
          <CardDescription>
            Uploadez ou remplacez le PDF de la formation. Les clients verront automatiquement la dernière version.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Upload en cours..." : "Cliquez pour uploader un PDF (max 50 Mo)"}
                  </span>
                </div>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm">
            {fileExists ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">
                  PDF en ligne — Dernière mise à jour :{" "}
                  {lastUpdate
                    ? new Date(lastUpdate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Inconnue"}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-muted-foreground">Aucun PDF uploadé. Uploadez le fichier de la formation.</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Private access link */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Accès privé
          </CardTitle>
          <CardDescription>
            Offrez l'accès sans paiement. Un compte client est créé avec un code d'accès unique (comme après un achat Stripe). Renvoyer un code pour un client existant remplace l'ancien.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleGrant} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="email@exemple.com"
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value)}
              maxLength={255}
            />
            <Button type="submit" disabled={granting}>
              {granting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Générer le code"}
            </Button>
          </form>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            Envoyer automatiquement le code par email
          </label>
          {issued && privateLink && (
            <div className="space-y-2 px-3 py-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-14">Code</span>
                <span className="font-mono text-sm text-foreground flex-1">{issued.code}</span>
                <Button size="sm" variant="outline" onClick={() => copyLink(issued.code)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-14">Lien</span>
                <span className="text-xs text-foreground break-all flex-1">{privateLink}</span>
                <Button size="sm" variant="outline" onClick={() => copyLink(privateLink)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchases List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Achats récents ({purchases.length})
          </CardTitle>
          <CardDescription>Liste des clients ayant acheté la formation</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPurchases ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun achat pour le moment.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {purchases.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <span className="text-sm font-medium text-foreground">{p.email}</span>
                  <div className="flex items-center gap-2">
                    {p.stripe_session_id === "admin-grant" && (
                      <span className="text-[10px] uppercase tracking-wide text-primary">Offert</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Générer et renvoyer un nouveau code" disabled={granting} onClick={() => { if (confirm(`Générer un nouveau code pour ${p.email} ? L'ancien ne fonctionnera plus.`)) grantAccess(p.email); }}>
                      <KeyRound className="w-3.5 h-3.5" />
                    </Button>
                    {p.stripe_session_id === "admin-grant" && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Retirer l'accès" onClick={() => handleRevoke(p.id, p.email)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EbookManager;
