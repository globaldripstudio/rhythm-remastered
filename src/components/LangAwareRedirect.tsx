import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Redirects to `to` (FR) or `enTo` (EN) depending on i18n language.
 * Used for legacy URLs so anglophone visitors land on the EN version.
 */
const LangAwareRedirect = ({ to, enTo }: { to: string; enTo: string }) => {
  const { i18n } = useTranslation();
  return <Navigate to={i18n.language === "en" ? enTo : to} replace />;
};

export default LangAwareRedirect;
