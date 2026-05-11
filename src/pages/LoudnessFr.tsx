import { useTranslation } from "react-i18next";
import Loudness from "./Loudness";

/**
 * French-locked variant of /loudness. Symmetric to LoudnessEn so that direct
 * URL access (or toggle navigation) forces FR before render.
 */
const LoudnessFr = () => {
  const { i18n } = useTranslation();
  if (i18n.language !== "fr") {
    i18n.changeLanguage("fr");
  }
  return <Loudness />;
};

export default LoudnessFr;
