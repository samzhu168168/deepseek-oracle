/** Article detail page — full SEO article with Markdown rendering */
import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const apiBase = import.meta.env.VITE_API_URL || "";

interface ArticleContent {
  hook: string;
  body_sections: { heading: string; body: string }[];
  key_insight: string;
  cta: string;
}

interface ArticleData {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  published: string;
  updated: string;
  author: string;
  reading_time_minutes: number;
  meta: { title: string; description: string; keywords: string };
  content: ArticleContent;
  related_articles: string[];
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetch(`${apiBase}/api/content/articles/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setArticle(data.article);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    // Scroll to top on new article
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug, apiBase]);

  // Track reading progress
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      setProgress(Math.min(scrollTop / docHeight * 100, 100));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (loading) {
    return (
      <div className="landing-page fade-in" style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 16px", textAlign: "center" }}>
        <div className="oracle-loading">
          <span className="oracle-loading-icon">&#9674;</span>
          <p style={{ fontSize: "14px", color: "var(--oracle-muted)", marginTop: "12px" }}>
            Loading article...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="landing-page fade-in" style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 16px", textAlign: "center" }}>
        <Helmet>
          <title>Article Not Found | Elemental Bond</title>
        </Helmet>
        <h1 style={{ fontSize: "24px", color: "var(--oracle-accent)", marginBottom: "12px" }}>
          Article Not Found
        </h1>
        <p style={{ color: "var(--oracle-muted)", marginBottom: "24px" }}>
          This article may have been moved or does not exist.
        </p>
        <Link to="/articles" className="oracle-button oracle-cta-button" style={{ textDecoration: "none", display: "inline-block" }}>
          Browse All Articles
        </Link>
      </div>
    );
  }

  const { content } = article;
  const articleUrl = `${SITE_URL}/articles/${article.slug}`;

  return (
    <div className="landing-page fade-in" style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px" }}>
      <Helmet>
        <title>{article.meta.title}</title>
        <meta name="description" content={article.meta.description} />
        <meta name="keywords" content={article.meta.keywords} />
        <meta property="og:title" content={article.meta.title} />
        <meta property="og:description" content={article.meta.description} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Elemental Bond" />
        <meta property="og:locale" content="en_US" />
        <meta property="article:published_time" content={article.published} />
        <meta property="article:author" content={article.author} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.meta.title} />
        <meta name="twitter:description" content={article.meta.description} />
        <link rel="canonical" href={articleUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.description,
            "author": { "@type": "Person", "name": article.author },
            "datePublished": article.published,
            "dateModified": article.updated,
            "mainEntityOfPage": { "@type": "WebPage", "@id": articleUrl },
            "publisher": {
              "@type": "Organization",
              "name": "Elemental Bond",
              "url": SITE_URL,
            },
          })}
        </script>
      </Helmet>

      {/* Reading progress bar */}
      <div className="article-progress" style={{ width: `${progress}%` }} />

      {/* Article header */}
      <section className="oracle-hero" style={{ textAlign: "center", marginBottom: "32px" }}>
        <div className="oracle-symbol-hero">&#9674;</div>
        <p style={{ fontSize: "12px", color: "var(--oracle-muted)", letterSpacing: "0.1em", marginBottom: "8px" }}>
          {article.category.replace("-", " ").toUpperCase()} · {article.reading_time_minutes} MIN READ
        </p>
        <h1 className="oracle-hero-title font-display" style={{ fontSize: "22px", lineHeight: 1.3 }}>{article.title}</h1>
        <p style={{ fontSize: "13px", color: "var(--oracle-muted)", marginTop: "8px" }}>
          By {article.author} · Published {article.published}
        </p>
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "12px", flexWrap: "wrap" }}>
          {article.tags.map((tag) => (
            <span key={tag} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: "rgba(187, 143, 255, 0.1)", color: "var(--oracle-muted)" }}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Article body */}
      <div className="article-content">
        {/* Hook */}
        <p className="article-hook" style={{ fontSize: "16px", lineHeight: 1.6, color: "var(--oracle-accent)", fontStyle: "italic", marginBottom: "24px", padding: "16px", borderLeft: "3px solid var(--oracle-accent)", background: "rgba(187, 143, 255, 0.04)" }}>
          {content.hook}
        </p>

        {/* Body sections */}
        {content.body_sections.map((section, i) => (
          <div key={i} className="article-section" style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 600, color: "var(--oracle-accent)", marginBottom: "10px" }}>
              {section.heading}
            </h2>
            <div className="oracle-reading">
              <MarkdownRenderer content={section.body} />
            </div>
          </div>
        ))}

        {/* Key insight */}
        <div className="article-insight" style={{ margin: "32px 0", padding: "20px", background: "rgba(249, 115, 22, 0.06)", border: "1px solid rgba(249, 115, 22, 0.2)", borderRadius: "10px" }}>
          <p style={{ fontSize: "12px", color: "var(--oracle-score)", letterSpacing: "0.1em", marginBottom: "8px" }}>KEY INSIGHT</p>
          <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--oracle-muted)", fontStyle: "italic" }}>
            {content.key_insight}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "24px 0", borderTop: "1px solid rgba(196, 149, 106, 0.2)", marginTop: "32px" }}>
        <p style={{ color: "var(--oracle-muted)", fontSize: "14px", marginBottom: "16px" }}>
          {content.cta}
        </p>
        <a href="/" className="oracle-button oracle-cta-button" style={{ textDecoration: "none", display: "inline-block" }}>
          &#10024; Get Your Free Reading
        </a>
      </div>

      {/* Back link */}
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <Link to="/articles" style={{ color: "var(--oracle-muted)", fontSize: "13px", textDecoration: "underline" }}>
          &larr; Back to all articles
        </Link>
      </div>
    </div>
  );
}
