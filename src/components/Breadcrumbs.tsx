import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Visible breadcrumbs. The matching JSON-LD must be injected separately via SEO
 * using `breadcrumbSchema(items)` from src/lib/seo/schemas.ts so Google ties them.
 */
const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  if (!items.length) return null;
  return (
    <nav
      aria-label="Fil d'Ariane"
      className={`flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm ${className}`}
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Accueil</span>
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={item.path} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
            {isLast ? (
              <span className="text-foreground" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link to={item.path} className="transition-colors hover:text-foreground">
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
