/**
 * Central FR ↔ EN route mirror map. Used by:
 *  - language toggles (Header / BlogArticleHeader / ToolkitHeader)
 *  - in-page <a href> rewriting when the user is on an EN route
 *  - SEO `alternates` resolution
 */
export type Lang = "fr" | "en";

/** FR path → EN path. EN path → FR path is computed by reverse lookup. */
export const FR_TO_EN: Record<string, string> = {
  "/": "/en",
  "/projets": "/en/projects",
  "/ebook": "/en/ebook",
  "/blog": "/en/blog",
  "/loudness": "/en/loudness",
};

export const EN_TO_FR: Record<string, string> = Object.fromEntries(
  Object.entries(FR_TO_EN).map(([fr, en]) => [en, fr]),
);

export const getLangFromPath = (pathname: string): Lang =>
  pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";

/** Returns the mirrored path (other language) or null if no mirror exists. */
export const mirrorPath = (pathname: string): string | null => {
  if (FR_TO_EN[pathname]) return FR_TO_EN[pathname];
  if (EN_TO_FR[pathname]) return EN_TO_FR[pathname];
  return null;
};

/** Localizes a FR path to the requested language (no-op if already correct). */
export const localizePath = (frPath: string, lang: Lang): string => {
  if (lang === "fr") return frPath;
  return FR_TO_EN[frPath] ?? frPath;
};
