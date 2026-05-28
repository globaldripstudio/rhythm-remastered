import { Helmet } from "react-helmet-async";

type JsonLd = Record<string, unknown>;

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
  jsonLd?: JsonLd | JsonLd[];
  /** Set true to mark the page noindex (404, login, payment-success, etc.) */
  noindex?: boolean;
  /** Override locale (defaults to fr_FR) */
  locale?: string;
  /** ISO datetime for article:published_time */
  publishedTime?: string;
  /** ISO datetime for article:modified_time */
  modifiedTime?: string;
  /** hreflang alternates: e.g. [{ hrefLang: "en", path: "/en/loudness" }] */
  alternates?: Array<{ hrefLang: string; path: string }>;
}

const BASE_URL = "https://www.globaldripstudio.fr";

const SEO = ({
  title,
  description,
  path = "",
  image = "/og-image.png",
  type = "website",
  jsonLd,
  noindex = false,
  locale = "fr_FR",
  publishedTime,
  modifiedTime,
  alternates,
}: SEOProps) => {
  const fullUrl = `${BASE_URL}${path}`;
  const fullImage = image.startsWith("http") ? image : `${BASE_URL}${image}`;
  const blocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      {alternates?.map((alt) => (
        <link
          key={alt.hrefLang}
          rel="alternate"
          hrefLang={alt.hrefLang}
          href={`${BASE_URL}${alt.path}`}
        />
      ))}
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="Global Drip Studio" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {blocks.map((block, idx) => (
        <script key={idx} type="application/ld+json">{JSON.stringify(block)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
