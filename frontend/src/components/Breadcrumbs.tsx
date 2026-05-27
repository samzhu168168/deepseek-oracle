/** Breadcrumbs — nav + JSON-LD BreadcrumbList structured data for SEO */
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");

export interface BreadcrumbItem {
  label: string;
  path?: string; // omit for current page (last item)
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.path ? { item: `${SITE_URL}${item.path}` } : {}),
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={i} className="breadcrumbs__item">
              {item.path && !isLast ? (
                <Link to={item.path} className="breadcrumbs__link">
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumbs__current" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className="breadcrumbs__sep" aria-hidden="true">/</span>}
            </span>
          );
        })}
      </nav>
    </>
  );
}
