import { Card } from "@/components/ui/card";
import { AlertTriangle, Check, Mail, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Shared sales sections for the ebook (Boutique + Ebook pages). */
const EbookSellingBlocks = () => {
  const { t } = useTranslation();
  const list = (key: string) => t(key, { returnObjects: true }) as string[];

  return (
    <div className="max-w-5xl mx-auto mt-16 space-y-12">
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
