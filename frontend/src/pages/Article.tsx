/** Article detail page — full SEO article with Markdown rendering */
import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { RelatedArticles } from "../components/RelatedArticles";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const apiBase = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "");

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
      <div className="landing-page fade-in" style={{ padding: "48px 16px", textAlign: "center" }}>
        <div className="oracle-loading">
          <span className="oracle-loading-icon">&#9674;</span>
          <p className="bazi-loading-text">
            Loading article...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="landing-page fade-in" style={{ padding: "48px 16px", textAlign: "center" }}>
        <Helmet>
          <title>Article Not Found | Elemental Bond</title>
        </Helmet>
        <h1 style={{ fontSize: "24px", color: "var(--oracle-text)", marginBottom: "12px" }}>
          Article Not Found
        </h1>
        <p style={{ color: "var(--oracle-text-muted)", marginBottom: "24px" }}>
          This article may have been moved or does not exist.
        </p>
        <Link to="/articles" className="oracle-button oracle-cta-button article-cta-link">
          Browse All Articles
        </Link>
      </div>
    );
  }

  const { content } = article;
  const articleUrl = `${SITE_URL}/articles/${article.slug}`;

  return (
    <div className="landing-page fade-in">
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

      <Breadcrumbs items={[
        { label: "Home", path: "/" },
        { label: "Articles", path: "/articles" },
        { label: article.title },
      ]} />

      {/* Reading progress bar */}
      <div className="article-progress" style={{ width: `${progress}%` }} />

      {/* Article header */}
      <section className="oracle-hero">
        <div className="oracle-symbol-hero">&#9674;</div>
        <p className="article-meta-tag">
          {article.category.replace("-", " ").toUpperCase()} · {article.reading_time_minutes} MIN READ
        </p>
        <h1 className="oracle-hero-title" style={{ fontSize: "22px", lineHeight: 1.3 }}>{article.title}</h1>
        <p className="article-byline">
          By {article.author} · Published {article.published}
        </p>
        <div className="article-tags">
          {article.tags.map((tag) => (
            <span key={tag} className="article-tag">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Article body */}
      <div className="article-content">
        {/* Hook */}
        <p className="article-hook">
          {content.hook}
        </p>

        {/* Body sections */}
        {content.body_sections.map((section, i) => (
          <div key={i} className="article-section">
            <h2>{section.heading}</h2>
            <div className="oracle-reading">
              <MarkdownRenderer content={section.body} />
            </div>
          </div>
        ))}

        {/* Key insight */}
        <div className="article-insight">
          <p className="article-insight__label">KEY INSIGHT</p>
          <p className="article-insight__text">
            {content.key_insight}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="article-cta">
        <p className="article-cta-text">
          {content.cta}
        </p>
        <a href="/" className="oracle-button oracle-cta-button article-cta-link">
          &#10024; Get Your Free Reading
        </a>
      </div>

      {/* Related Articles */}
      <RelatedArticles slugs={article.related_articles} title="Related Articles" />

      {/* Back link */}
      <div className="article-back">
        <Link to="/articles">
          &larr; Back to all articles
        </Link>
      </div>
    </div>
  );
}
