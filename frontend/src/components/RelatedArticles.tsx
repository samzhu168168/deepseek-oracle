/** RelatedArticles — cross-linking section used on element personality and article pages */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  reading_time_minutes: number;
}

interface RelatedArticlesProps {
  slugs: string[];
  title?: string;
}

/** Hardcoded fallback articles for resilience (subset of backend metadata) */
const FALLBACK_ARTICLES: ArticleMeta[] = [
  { slug: "bazi-five-elements-guide", title: "The Complete Guide to the Five Elements in BaZi Astrology", description: "Everything you need to know about Wood, Fire, Earth, Metal, and Water in your birth chart.", reading_time_minutes: 10 },
  { slug: "wood-element-personality-bazi", title: "The Wood Element in BaZi — Personality, Relationships, and Life Path", description: "Wood-type personalities are visionary, growth-oriented, and expansive.", reading_time_minutes: 7 },
  { slug: "fire-element-personality-bazi", title: "The Fire Element in BaZi — Passion, Expression, and Relationship Dynamics", description: "Fire personalities radiate warmth, charisma, and creative power.", reading_time_minutes: 7 },
  { slug: "earth-element-personality-bazi", title: "The Earth Element in BaZi — Stability, Nurturing, and Relationship Harmony", description: "Earth personalities are grounded, reliable, and deeply nurturing.", reading_time_minutes: 7 },
  { slug: "metal-element-personality-bazi", title: "The Metal Element in BaZi — Structure, Determination, and Love", description: "Metal personalities are precise, strong-willed, and value integrity.", reading_time_minutes: 7 },
  { slug: "water-element-personality-bazi", title: "The Water Element in BaZi — Depth, Intuition, and Emotional Wisdom", description: "Water personalities are deep, intuitive, and emotionally intelligent.", reading_time_minutes: 7 },
  { slug: "wood-fire-compatibility-bazi", title: "Wood and Fire Element Compatibility in BaZi", description: "Discover how the Wood-Fire elemental dynamic creates passion and growth.", reading_time_minutes: 7 },
  { slug: "understanding-day-master-bazi", title: "Understanding Your Day Master in BaZi", description: "Your Day Master represents your core self in BaZi.", reading_time_minutes: 9 },
  { slug: "2026-snake-year-bazi-element-types", title: "2026 Snake Year: What Each BaZi Element Should Know", description: "Discover how the 2026 Snake Year affects each BaZi Element type.", reading_time_minutes: 7 },
];

export function RelatedArticles({ slugs, title = "Related Articles" }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<ArticleMeta[]>([]);

  useEffect(() => {
    const apiBase = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "");
    fetch(`${apiBase}/api/content/articles`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.articles?.length > 0) {
          const matched = data.articles.filter((a: ArticleMeta) => slugs.includes(a.slug));
          if (matched.length > 0) setArticles(matched);
          else setArticles(FALLBACK_ARTICLES.filter((a) => slugs.includes(a.slug)));
        } else {
          setArticles(FALLBACK_ARTICLES.filter((a) => slugs.includes(a.slug)));
        }
      })
      .catch(() => {
        setArticles(FALLBACK_ARTICLES.filter((a) => slugs.includes(a.slug)));
      });
  }, [slugs]);

  if (!articles.length) return null;

  return (
    <section className="related-articles" style={{ marginTop: "var(--space-2xl)" }}>
      <div className="related-articles__header">
        <span className="oracle-symbol" aria-hidden="true">◈</span>
        <h2 className="related-articles__title">{title}</h2>
      </div>
      <div className="related-articles__grid">
        {articles.slice(0, 4).map((article) => (
          <Link
            key={article.slug}
            to={`/articles/${article.slug}`}
            className="related-articles__card"
          >
            <h3 className="related-articles__card-title">{article.title}</h3>
            <p className="related-articles__card-desc">{article.description}</p>
            <span className="related-articles__card-meta">{article.reading_time_minutes} min read</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
