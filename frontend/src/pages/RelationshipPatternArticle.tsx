import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate, useParams } from "react-router-dom";

import { getRelationshipPatternArticle, RELATIONSHIP_PATTERN_ARTICLES } from "../content/relationshipPatterns";
import { trackFunnelEvent } from "../utils/analytics";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const DATE_PUBLISHED = "2026-08-24";

type RelationshipPatternArticlePageProps = { slug?: string };

export default function RelationshipPatternArticlePage({ slug: fixedSlug }: RelationshipPatternArticlePageProps) {
  const { slug: routeSlug = "" } = useParams();
  const slug = fixedSlug || routeSlug;
  const article = getRelationshipPatternArticle(slug);

  useEffect(() => {
    if (article) trackFunnelEvent("geo_page_view", { page_slug: article.slug });
  }, [article]);

  if (!article) return <Navigate to="/" replace />;

  const canonical = `${SITE_URL}/relationship-patterns/${article.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_PUBLISHED,
    mainEntityOfPage: canonical,
    publisher: { "@type": "Organization", name: "Elemental Bond", url: SITE_URL },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Free Reading", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Relationship Patterns" },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical },
    ],
  };

  return (
    <article className="funnel-page content-page geo-article" data-prerender-ready="relationship-pattern-article">
      <Helmet>
        <title>{article.metaTitle}</title>
        <meta name="description" content={article.metaDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.metaDescription} />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <nav className="geo-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Free Reading</Link><span aria-hidden="true">/</span><span>Relationship Patterns</span>
      </nav>
      <header className="geo-article__header">
        <p className="funnel-eyebrow">Relationship pattern reflection</p>
        <h1>{article.title}</h1>
        <p className="extract-summary">{article.directAnswer}</p>
      </header>

      {article.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.callout && <blockquote className="geo-screenshot-moment">{section.callout}</blockquote>}
          {section.bullets && <ul className="geo-observation-list">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
        </section>
      ))}

      <section className="geo-reading-cta">
        <p className="funnel-eyebrow">Try your personal relationship pattern</p>
        <h2>See which role you may repeat in relationships.</h2>
        <p>Start with a free birth-date reading. No email or account is required.</p>
        <Link
          className="oracle-button oracle-cta-button"
          to="/"
          onClick={() => trackFunnelEvent("geo_to_reading", { page_slug: article.slug, cta_location: "article_body" })}
        >
          Discover Your Relationship Pattern
        </Link>
      </section>

      <section>
        <h2>FAQ</h2>
        {article.faq.map((item) => <div className="geo-faq-item" key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}
      </section>

      <section>
        <h2>Sources and evidence boundary</h2>
        <p>Sources below support specific relationship concepts. The Five Elements sections are Elemental Bond editorial reflections based on a traditional symbolic framework, not conclusions drawn from these studies.</p>
        <ul className="geo-source-list">
          {article.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a><span>{source.note}</span></li>)}
        </ul>
      </section>

      <section>
        <h2>Related reading</h2>
        <div className="geo-related-links">
          {article.relatedSlugs.map((relatedSlug) => {
            const related = RELATIONSHIP_PATTERN_ARTICLES[relatedSlug];
            return <Link key={relatedSlug} to={`/relationship-patterns/${relatedSlug}`}>{related.title}</Link>;
          })}
          <Link to="/methodology">How Elemental Bond works</Link>
        </div>
      </section>
    </article>
  );
}
