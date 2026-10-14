import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Compass, Languages, Mail, Target, User, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PREVIEW_PAGES = [1, 2, 3, 4, 5].map((n) => ({ n, src: `/ebook-preview/p-0${n}.jpg` }));

/** Shared sales sections for the ebook (Boutique + Ebook pages). */
const EbookSellingBlocks = () => {
  const { t } = useTranslation();
  const list = (key: string) => t(key, { returnObjects: true }) as string[];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-5xl mx-auto mt-16 space-y-12">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 border-primary/30">
          <h2 className="text-xl font-bold mb-3 text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t("ebookSell.promise.title")}
          </h2>
          <p className="text-foreground leading-relaxed">{t("ebookSell.promise.text")}</p>
        </Card>
        <Card className="p-6 bg-card/50 border-border/50">
          <h2 className="text-xl font-bold mb-3 text-foreground flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            {t("ebookSell.approach.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{t("ebookSell.approach.text")}</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 border-border/50">
          <h2 className="text-xl font-bold mb-4 text-foreground">{t("ebookSell.pains.title")}</h2>
          <ul className="space-y-3">
            {list("ebookSell.pains.items").map((item) => (
              <li key={item} className="flex gap-3 text-muted-foreground">
                <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6 bg-card/50 border-primary/30">
          <h2 className="text-xl font-bold mb-4 text-foreground">{t("ebookSell.includes.title")}</h2>
          <ul className="space-y-3">
            {list("ebookSell.includes.items").map((item) => (
              <li key={item} className="flex gap-3 text-foreground">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">{t("ebookSell.preview.title")}</h2>
        <p className="text-muted-foreground mb-6">{t("ebookSell.preview.subtitle")}</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {PREVIEW_PAGES.map(({ n, src }) => (
            <button
              key={n}
              onClick={() => setOpen(n)}
              className="rounded-md overflow-hidden border border-border/50 hover:border-primary/60 transition-colors"
            >
              <img src={src} alt={t("ebookSell.preview.alt", { n })} loading="lazy" className="w-full h-auto" />
            </button>
          ))}
        </div>
        <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
          <DialogContent
            className="max-w-3xl p-2 bg-card"
            onKeyDown={(e) => {
              if (open === null) return;
              if (e.key === "ArrowLeft") setOpen(open > 1 ? open - 1 : PREVIEW_PAGES.length);
              if (e.key === "ArrowRight") setOpen(open < PREVIEW_PAGES.length ? open + 1 : 1);
            }}
          >
            <DialogTitle className="sr-only">{t("ebookSell.preview.alt", { n: open ?? 1 })}</DialogTitle>
            {open !== null && (
              <div className="relative">
                <img
                  src={`/ebook-preview/p-0${open}.jpg`}
                  alt={t("ebookSell.preview.alt", { n: open })}
                  className="w-full h-auto max-h-[85vh] object-contain"
                />
                <button
                  onClick={() => setOpen(open > 1 ? open - 1 : PREVIEW_PAGES.length)}
                  aria-label={t("ebookSell.preview.prev")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground hover:bg-background transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setOpen(open < PREVIEW_PAGES.length ? open + 1 : 1)}
                  aria-label={t("ebookSell.preview.next")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground hover:bg-background transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-sm text-foreground tabular-nums">
                  {open} / {PREVIEW_PAGES.length}
                </span>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">{t("ebookSell.program.title")}</h2>
        <p className="text-muted-foreground mb-6">{t("ebookSell.program.subtitle")}</p>
        <ol className="grid sm:grid-cols-2 gap-3">
          {list("ebookSell.program.chapters").map((ch, i) => (
            <li key={ch} className="flex gap-3 items-start rounded-lg border border-border/50 bg-card/30 p-4">
              <span className="text-primary font-bold tabular-nums w-6 flex-shrink-0">{i + 1}</span>
              <span className="text-foreground">{ch}</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground mt-4">{t("ebookSell.program.annexes")}</p>
      </div>

      <Card className="p-6 bg-card/50 border-border/50">
        <h2 className="text-xl font-bold mb-3 text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          {t("ebookSell.author.title")}
        </h2>
        <p className="text-muted-foreground leading-relaxed">{t("ebookSell.author.text")}</p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 border-border/50">
          <h2 className="text-xl font-bold mb-3 text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {t("ebookSell.audience.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{t("ebookSell.audience.text")}</p>
        </Card>
        <Card className="p-6 bg-card/50 border-border/50">
          <h2 className="text-xl font-bold mb-3 text-foreground flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            {t("ebookSell.contact.title")}
          </h2>
          <p className="text-muted-foreground mb-2">{t("ebookSell.contact.text")}</p>
          <a href="mailto:globaldripstudio@gmail.com" className="text-primary hover:underline">
            globaldripstudio@gmail.com
          </a>
        </Card>
      </div>
    </div>
  );
};

export default EbookSellingBlocks;
