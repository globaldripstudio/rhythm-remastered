import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Loudness from "./Loudness";

/**
 * English-locked variant of /loudness.
 * Forces i18n to English while mounted; restores user preference on unmount.
 * Targets EN keywords ("Loudness Analyzer", "LUFS Meter") in Google EN SERPs.
 */
const LoudnessEn = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const previous = i18n.language;
    if (previous !== "en") {
      i18n.changeLanguage("en");
    }
    return () => {
      if (previous && previous !== "en") {
        i18n.changeLanguage(previous);
      }
    };
  }, [i18n]);

  return <Loudness />;
};

export default LoudnessEn;
