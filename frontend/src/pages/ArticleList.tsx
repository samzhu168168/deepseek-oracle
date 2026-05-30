/** Article list page — SEO content hub */
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const apiBase = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "");

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

/** Fallback articles when API is unavailable */
const FALLBACK_ARTICLES: ArticleMeta[] = [
  {
    id: "bazi-five-elements-guide",
    slug: "bazi-five-elements-guide",
    title: "The Complete Guide to the Five Elements in BaZi Astrology",
    description: "Everything you need to know about Wood, Fire, Earth, Metal, and Water in your birth chart. Understand the generative and controlling cycles.",
    category: "bazi-guide",
    tags: ["bazi", "five-elements", "wu-xing", "beginners-guide", "elemental-theory"],
    published: "2026-05-04",
    reading_time_minutes: 10,
  },
  {
    id: "understanding-day-master-bazi",
    slug: "understanding-day-master-bazi",
    title: "Understanding Your Day Master in BaZi — The Core of Your Chart",
    description: "Your Day Master (日主) represents your core self in BaZi. Learn what each of the 10 Day Master types reveals about your personality and strengths.",
    category: "bazi-guide",
    tags: ["day-master", "bazi", "four-pillars", "personality", "self-discovery"],
    published: "2026-05-05",
    reading_time_minutes: 9,
  },
  {
    id: "four-pillars-bazi-explained",
    slug: "four-pillars-bazi-explained",
    title: "The Four Pillars of Destiny Explained — Your Complete BaZi Birth Chart",
    description: "The Four Pillars (Year, Month, Day, Hour) form your BaZi destiny code. Understand each pillar's role in shaping your personality, career, relationships, and life path.",
    category: "bazi-guide",
    tags: ["four-pillars", "bazi", "birth-chart", "destiny", "heavenly-stems", "earthly-branches"],
    published: "2026-05-13",
    reading_time_minutes: 11,
  },
  {
    id: "wood-fire-compatibility-bazi",
    slug: "wood-fire-compatibility-bazi",
    title: "Wood and Fire Element Compatibility in BaZi",
    description: "Discover how the Wood-Fire elemental dynamic creates passion, growth, and creative tension in relationships. A complete BaZi compatibility guide.",
    category: "element-compatibility",
    tags: ["wood", "fire", "bazi", "five-elements", "compatibility"],
    published: "2026-05-01",
    reading_time_minutes: 7,
  },
  {
    id: "wood-element-personality-bazi",
    slug: "wood-element-personality-bazi",
    title: "The Wood Element in BaZi — Personality, Relationships, and Life Path",
    description: "Wood-type personalities are visionary, growth-oriented, and expansive. Discover what makes a Wood Day Master tick, and who they match best with.",
    category: "element-guide",
    tags: ["wood", "bazi", "personality", "day-master", "jia-yi"],
    published: "2026-05-08",
    reading_time_minutes: 7,
  },
  {
    id: "2026-snake-year-bazi-element-types",
    slug: "2026-snake-year-bazi-element-types",
    title: "2026 Snake Year: What Each BaZi Element Should Know",
    description: "Discover how the 2026 Bing Wu Snake Year affects each BaZi Element type. Learn which Day Masters thrive and how to navigate the fire energy.",
    category: "bazi-guide",
    tags: ["2026 snake year", "bazi elements", "bing wu", "day master", "element luck", "five elements"],
    published: "2026-05-17",
    reading_time_minutes: 7,
  },
];

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
        if (data.success && data.articles?.length > 0) {
          setArticles(data.articles);
        } else {
          setArticles(FALLBACK_ARTICLES);
        }
      })
      .catch(() => {
        setArticles(FALLBACK_ARTICLES);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, apiBase]);

  const categories = [...new Set(articles.map((a) => a.category))];

  return (
    <div className="landing-page fade-in" style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px" }}>
      <Helmet>
        <title>BaZi & Elemental Compatibility Articles | Elemental Bond</title>
        <meta name="description" content="Explore our library of BaZi astrology articles: Five Element compatibility guides, Day Master personality profiles, and relationship timing insights." />
        <meta name="keywords" content="bazi articles, bazi compatibility calculator guide, five element compatibility, day master bazi, four pillars astrology, chinese astrology relationships, bazi 2026" />
        <link rel="canonical" href={`${SITE_URL}/articles`} />
        <meta property="og:title" content="BaZi & Elemental Compatibility Articles | Elemental Bond" />
        <meta property="og:description" content="Explore our library of BaZi astrology articles: Five Element compatibility guides, Day Master personality profiles, and relationship timing insights." />
        <meta property="og:url" content={`${SITE_URL}/articles`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Elemental Bond" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BaZi & Elemental Compatibility Articles | Elemental Bond" />
        <meta name="twitter:description" content="Explore our library of BaZi astrology articles: Five Element compatibility guides, Day Master personality profiles, and relationship timing insights." />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
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
