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

/**
 * Blog article slug mirror (FR canonical ↔ EN slug).
 * Add new entries here when localizing a new article.
 * Only published articles are listed; coming-soon ones are added later.
 */
export const ARTICLE_SLUGS: ReadonlyArray<{ fr: string; en: string }> = [
  { fr: "toolkit-audio-gratuit-en-ligne", en: "free-online-audio-toolkit" },
  { fr: "venin-le-premier-sang", en: "venin-the-first-blood" },
  { fr: "comprendre-la-compression", en: "understanding-compression" },
];

export const articleEnSlug = (frSlug: string): string | undefined =>
  ARTICLE_SLUGS.find((s) => s.fr === frSlug)?.en;

export const articleFrSlug = (enSlug: string): string | undefined =>
  ARTICLE_SLUGS.find((s) => s.en === enSlug)?.fr;

export const getLangFromPath = (pathname: string): Lang =>
  pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";

/** Returns the mirrored path (other language) or null if no mirror exists. */
export const mirrorPath = (pathname: string): string | null => {
  if (FR_TO_EN[pathname]) return FR_TO_EN[pathname];
  if (EN_TO_FR[pathname]) return EN_TO_FR[pathname];

  // /blog/:slug ↔ /en/blog/:slug
  const frArticle = pathname.match(/^\/blog\/([^/]+)$/);
  if (frArticle) {
    const en = articleEnSlug(frArticle[1]);
    return en ? `/en/blog/${en}` : null;
  }
  const enArticle = pathname.match(/^\/en\/blog\/([^/]+)$/);
  if (enArticle) {
    const fr = articleFrSlug(enArticle[1]);
    return fr ? `/blog/${fr}` : null;
  }

  return null;
};

/** Localizes a FR path to the requested language (no-op if already correct). */
export const localizePath = (frPath: string, lang: Lang): string => {
  if (lang === "fr") return frPath;
  if (FR_TO_EN[frPath]) return FR_TO_EN[frPath];
  const m = frPath.match(/^\/blog\/([^/]+)$/);
  if (m) {
    const en = articleEnSlug(m[1]);
    if (en) return `/en/blog/${en}`;
  }
  return frPath;
};
