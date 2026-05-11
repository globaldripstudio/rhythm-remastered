import { ReactNode, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Lang } from "@/lib/localizedRoutes";

/**
 * Forces i18n to a specific language before paint. Used by EN/FR route
 * wrappers so the page never flashes in the wrong language.
 */
const LangLock = ({ lang, children }: { lang: Lang; children: ReactNode }) => {
  const { i18n } = useTranslation();

  // Synchronous before-paint update (avoids React 18 strict warnings while
  // still preventing a wrong-language flash on first render).
  useLayoutEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [i18n, lang]);

  // For first render, also set immediately if mismatched (prevents flash).
  if (i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }

  return <>{children}</>;
};

export default LangLock;
