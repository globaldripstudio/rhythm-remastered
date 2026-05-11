import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { Lang } from "@/lib/localizedRoutes";

/**
 * Forces i18n to a specific language synchronously BEFORE rendering its
 * children. Used by EN/FR route wrappers so the page never flashes in the
 * wrong language and avoids double-render bugs in third-party components.
 */
const LangLock = ({ lang, children }: { lang: Lang; children: ReactNode }) => {
  const { i18n } = useTranslation();
  if (i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }
  return <>{children}</>;
};

export default LangLock;
