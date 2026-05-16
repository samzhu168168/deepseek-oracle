/** Article list page — SEO content hub */
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const apiBase = import.meta.env.VITE_API_URL || "";

interface ArticleMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  published: string;
  reading_time_minutes: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  "bazi-guide": "BaZi Guides",
  "element-compatibility": "Element Compatibility",
  "element-guide": "Element Guides",
};

export default function ArticleListPage() {
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const url = activeCategory
      ? `${apiBase}/api/content/articles?category=${activeCategory}`
      : `${apiBase}/api/content/articles`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setArticles(data.articles);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, apiBase]);

  const categories = [...new Set(articles.map((a) => a.category))];

  return (
    <div className="landing-page fade-in" style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px" }}>
      <Helmet>
        <title>BaZi & Elemental Compatibility Articles | Elemental Bond</title>
        <meta name="description" content="Explore our library of BaZi astrology articles: Five Element compatibility guides, Day Master personality profiles, and relationship timing insights." />
        <meta property="og:title" content="BaZi & Elemental Compatibility Articles | Elemental Bond" />
        <meta property="og:description" content="Explore our library of BaZi astrology articles: Five Element compatibility guides, Day Master personality profiles, and relationship timing insights." />
        <meta property="og:url" content={`${SITE_URL}/articles`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BaZi & Elemental Compatibility Articles | Elemental Bond" />
        <meta name="twitter:description" content="Explore our library of BaZi astrology articles: Five Element compatibility guides, Day Master personality profiles, and relationship timing insights." />
        <link rel="canonical" href={`${SITE_URL}/articles`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "BaZi & Elemental Compatibility Articles",
            "description": "Library of BaZi astrology and Five Element compatibility articles.",
            "url": `${SITE_URL}/articles`,
          })}
        </script>
      </Helmet>

      <section className="oracle-hero" style={{ textAlign: "center", marginBottom: "32px" }}>
        <div className="oracle-symbol-hero">&#9674;</div>
        <h1 className="oracle-hero-title">BAZI WISDOM LIBRARY</h1>
        <p className="oracle-hero-subtitle">
          Deepen your understanding of the Five Elements, Four Pillars, and relationship patterns.
        </p>
      </section>

      {/* Category filter */}
      <div className="article-filters" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px", justifyContent: "center" }}>
        <button
          className={`oracle-button ${!activeCategory ? "" : "oracle-button--secondary"}`}
          onClick={() => setActiveCategory(null)}
          style={{ fontSize: "13px", padding: "6px 16px" }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`oracle-button ${activeCategory === cat ? "" : "oracle-button--secondary"}`}
            onClick={() => setActiveCategory(cat)}
            style={{ fontSize: "13px", padding: "6px 16px" }}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="oracle-loading" style={{ textAlign: "center", padding: "48px" }}>
          <span className="oracle-loading-icon">&#9674;</span>
          <p style={{ fontSize: "14px", color: "var(--oracle-muted)", marginTop: "12px" }}>
            Loading articles...
          </p>
        </div>
      ) : articles.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--oracle-muted)", padding: "48px" }}>
          No articles found.
        </p>
      ) : (
        <div className="article-grid" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {articles.map((article, i) => (
            <Link
              key={article.id}
              to={`/articles/${article.slug}`}
              className={`article-card fade-in-up fade-in-up--d${Math.min(i + 1, 5)}`}
              style={{
                display: "block",
                padding: "20px 24px",
                background: "rgba(196, 149, 106, 0.06)",
                border: "1px solid rgba(196, 149, 106, 0.15)",
                borderRadius: "10px",
                textDecoration: "none",
                color: "inherit",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(196, 149, 106, 0.12)";
                e.currentTarget.style.borderColor = "rgba(196, 149, 106, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(196, 149, 106, 0.06)";
                e.currentTarget.style.borderColor = "rgba(196, 149, 106, 0.15)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--oracle-accent)", margin: 0 }}>
                  {article.title}
                </h2>
                <span style={{ fontSize: "12px", color: "var(--oracle-muted)", whiteSpace: "nowrap" }}>
                  {article.reading_time_minutes} min read
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--oracle-muted)", margin: "8px 0 0", lineHeight: 1.5 }}>
                {article.description}
              </p>
              <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: "rgba(187, 143, 255, 0.1)",
                      color: "var(--oracle-muted)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
