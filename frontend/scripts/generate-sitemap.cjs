/** Generate sitemap.xml at build time.
 *
 * Reads article metadata and generates a sitemap with all known URLs.
 * Run as: node scripts/generate-sitemap.js
 */
const fs = require("fs");
const path = require("path");

const SITE_URL = "https://elemental.bond";
const ARTICLES_JSON = path.resolve(
  __dirname,
  "..",
  "..",
  "backend",
  "app",
  "data",
  "articles",
  "metadata.json",
);
const OUTPUT = path.resolve(__dirname, "..", "public", "sitemap.xml");

const SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

const STATIC_URLS = [
  { loc: "/", priority: "1.0" },
  { loc: "/result", priority: "0.8" },
  { loc: "/bazi", priority: "0.9" },
  { loc: "/articles", priority: "0.9" },
];

function main() {
  const urls = [];

  // Static pages
  for (const u of STATIC_URLS) {
    urls.push({
      loc: `${SITE_URL}${u.loc}`,
      lastmod: "2026-05-16",
      changefreq: "weekly",
      priority: u.priority,
    });
  }

  // Compatibility pages: 12 × 12 = 144 (remove duplicates like aries-aries)
  for (const s1 of SIGNS) {
    for (const s2 of SIGNS) {
      if (s1 === s2) continue;
      urls.push({
        loc: `${SITE_URL}/compatibility/${s1}-and-${s2}`,
        lastmod: "2026-05-16",
        changefreq: "monthly",
        priority: "0.8",
      });
    }
  }

  // Article pages
  try {
    const metadata = JSON.parse(fs.readFileSync(ARTICLES_JSON, "utf-8"));
    for (const article of metadata) {
      urls.push({
        loc: `${SITE_URL}/articles/${article.slug}`,
        lastmod: article.updated || "2026-05-16",
        changefreq: "monthly",
        priority: "0.7",
      });
    }
  } catch {
    console.warn("[sitemap] No article metadata found — skipping article URLs");
  }

  // Write XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

  fs.writeFileSync(OUTPUT, xml, "utf-8");
  console.log(`[sitemap] Generated ${urls.length} URLs → ${OUTPUT}`);
}

main();
