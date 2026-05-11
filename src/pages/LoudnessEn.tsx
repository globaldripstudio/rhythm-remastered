import { useTranslation } from "react-i18next";
import Loudness from "./Loudness";

/**
 * English-locked variant of /loudness.
 * Forces i18n to English synchronously BEFORE first render to avoid a FR→EN
 * flash and a Radix Select infinite update loop on mount.
 */
const LoudnessEn = () => {
  const { i18n } = useTranslation();
  if (i18n.language !== "en") {
    i18n.changeLanguage("en");
  }
  return <Loudness />;
};

export default LoudnessEn;
