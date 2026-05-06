/**
 * SEO schema factories. Keep all JSON-LD construction here so pages stay readable.
 * All URLs are absolute as required by schema.org.
 */

const SITE = "https://globaldripstudio.fr";
const ORG_NAME = "Global Drip Studio";
const ORG_LOGO = `${SITE}/lovable-uploads/493b7d12-09ef-4eb1-a8f1-6575bee3334a.png`;

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: ORG_NAME,
  url: SITE,
  logo: ORG_LOGO,
  email: "globaldripstudio@gmail.com",
  telephone: "+33659797342",
  sameAs: [
    "https://www.instagram.com/globaldripstudio",
  ],
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: SITE,
  name: ORG_NAME,
  inLanguage: "fr-FR",
  publisher: { "@id": `${SITE}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const localBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "MusicGroup"],
  "@id": `${SITE}/#localbusiness`,
  name: ORG_NAME,
  description:
    "Studio d'enregistrement professionnel à Martigues : mixage, mastering, production musicale et sound design. Sessions sur place ou à distance partout en France.",
  image: `${SITE}/og-image.png`,
  logo: ORG_LOGO,
  url: SITE,
  telephone: "+33659797342",
  email: "globaldripstudio@gmail.com",
  priceRange: "€€",
  paymentAccepted: ["Cash", "Credit Card", "Bank Transfer"],
  currenciesAccepted: "EUR",
  address: {
    "@type": "PostalAddress",
    streetAddress: "8 allée des ajoncs",
    addressLocality: "Martigues",
    postalCode: "13500",
    addressRegion: "Provence-Alpes-Côte d'Azur",
    addressCountry: "FR",
  },
  geo: { "@type": "GeoCoordinates", latitude: 43.4053, longitude: 5.0476 },
  areaServed: [
    { "@type": "Country", name: "France" },
    { "@type": "City", name: "Martigues" },
    { "@type": "City", name: "Marseille" },
    { "@type": "City", name: "Aix-en-Provence" },
    { "@type": "City", name: "Istres" },
    { "@type": "City", name: "Vitrolles" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "10:00",
      closes: "19:00",
    },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "10:00", closes: "17:00" },
  ],
  sameAs: ["https://www.instagram.com/globaldripstudio"],
  aggregateRating: { "@type": "AggregateRating", ratingValue: "5", reviewCount: "50" },
});

export const breadcrumbSchema = (items: Array<{ name: string; path: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: `${SITE}${it.path}`,
  })),
});

export interface ToolSchemaInput {
  name: string;
  path: string;
  description: string;
  features: string[];
  category?: string;
}

export const softwareAppSchema = (t: ToolSchemaInput) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: t.name,
  url: `${SITE}${t.path}`,
  applicationCategory: t.category ?? "MultimediaApplication",
  applicationSubCategory: "Music Production Tool",
  operatingSystem: "Web (Chrome, Firefox, Safari, Edge)",
  browserRequirements: "Requires JavaScript and Web Audio API",
  inLanguage: ["fr", "en"],
  isAccessibleForFree: true,
  description: t.description,
  featureList: t.features,
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  publisher: { "@id": `${SITE}/#organization` },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "37" },
});

export interface FaqEntry {
  q: string;
  a: string;
}

export const faqSchema = (entries: FaqEntry[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: entries.map((e) => ({
    "@type": "Question",
    name: e.q,
    acceptedAnswer: { "@type": "Answer", text: e.a },
  })),
});

export interface HowToStep {
  name: string;
  text: string;
}

export const howToSchema = (name: string, steps: HowToStep[]) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name,
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
});

export interface ArticleSchemaInput {
  title: string;
  description: string;
  path: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  section?: string;
  wordCount?: number;
}

export const articleSchema = (a: ArticleSchemaInput) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}${a.path}` },
  headline: a.title,
  description: a.description,
  image: a.image.startsWith("http") ? a.image : `${SITE}${a.image}`,
  datePublished: a.datePublished,
  dateModified: a.dateModified ?? a.datePublished,
  author: { "@type": "Organization", name: a.author ?? ORG_NAME },
  publisher: {
    "@type": "Organization",
    name: ORG_NAME,
    logo: { "@type": "ImageObject", url: ORG_LOGO },
  },
  articleSection: a.section,
  wordCount: a.wordCount,
  inLanguage: "fr-FR",
});
