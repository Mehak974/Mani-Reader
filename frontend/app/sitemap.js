/**
 * sitemap.js — Next.js App Router dynamic sitemap
 *
 * Covers:
 *  - Static pages
 *  - ALL manga pages (paginated browse)
 *  - Chapter reader pages (for top manga)
 *  - Blog post pages
 *  - Blog category pages
 *
 * Revalidates every hour so newly added content appears quickly.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manireader.online';

function getApiUrl() {
  const raw =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://api.manireader.online';
  const cleaned = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  return cleaned.endsWith('/api') ? cleaned.slice(0, -4) : cleaned;
}

async function safeFetch(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch ALL manga by paginating /api/manga/browse/filter */
async function fetchAllManga(apiUrl) {
  const all = [];
  let page = 1;
  while (true) {
    const data = await safeFetch(
      `${apiUrl}/api/manga/browse/filter?include=&status=0&order=0&page=${page}`
    );
    // API returns { results: [], total, page, totalPages } or similar
    const items = Array.isArray(data) ? data : data?.results || data?.data || [];
    if (!items.length) break;
    all.push(...items);
    const totalPages = data?.totalPages || data?.total_pages || 1;
    if (page >= totalPages || page >= 50) break; // cap at 50 pages (2500 manga)
    page++;
  }
  return all;
}

/** Fetch chapters for a manga */
async function fetchChapters(apiUrl, mangaId) {
  const data = await safeFetch(`${apiUrl}/api/chapters/${mangaId}`);
  return Array.isArray(data) ? data : data?.chapters || [];
}

export default async function sitemap() {
  const apiUrl = getApiUrl();

  // ─── 1. Static routes ───────────────────────────────────────────────────────
  const staticRoutes = [
    { path: '', priority: 1.0, freq: 'daily' },
    { path: '/browse', priority: 0.9, freq: 'daily' },
    { path: '/blog', priority: 0.8, freq: 'weekly' },
    { path: '/library', priority: 0.7, freq: 'weekly' },
    { path: '/about', priority: 0.5, freq: 'monthly' },
    { path: '/contact', priority: 0.5, freq: 'monthly' },
    { path: '/faq', priority: 0.5, freq: 'monthly' },
    { path: '/privacy', priority: 0.3, freq: 'monthly' },
    { path: '/terms', priority: 0.3, freq: 'monthly' },
    { path: '/disclaimer', priority: 0.3, freq: 'monthly' },
    { path: '/auth/login', priority: 0.4, freq: 'monthly' },
    { path: '/auth/register', priority: 0.4, freq: 'monthly' },
  ].map(({ path, priority, freq }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));

  // ─── 2. All manga pages ─────────────────────────────────────────────────────
  const allManga = await fetchAllManga(apiUrl);
  const mangaRoutes = allManga.map((m) => ({
    url: `${BASE_URL}/manga/${m.id}`,
    lastModified: m.updatedAt ? new Date(m.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // ─── 3. Chapter reader pages (top 200 manga only to keep sitemap lean) ──────
  const topManga = allManga.slice(0, 200);
  const chapterRouteArrays = await Promise.allSettled(
    topManga.map(async (m) => {
      const chapters = await fetchChapters(apiUrl, m.id);
      return chapters.map((ch) => ({
        url: `${BASE_URL}/read/${ch.id}`,
        lastModified: ch.updatedAt ? new Date(ch.updatedAt) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
    })
  );
  const chapterRoutes = chapterRouteArrays.flatMap((r) =>
    r.status === 'fulfilled' ? r.value : []
  );

  // ─── 4. Blog posts ──────────────────────────────────────────────────────────
  let blogRoutes = [];
  const blogData = await safeFetch(`${apiUrl}/api/blog`);
  const blogPosts = Array.isArray(blogData) ? blogData : blogData?.data || blogData?.posts || [];
  blogRoutes = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug || post.id}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // ─── 5. Blog category pages ─────────────────────────────────────────────────
  const blogCategories = [
    'action', 'romance', 'isekai', 'historical', 'fantasy',
    'horror', 'sports', 'slice-of-life', 'comedy', 'drama',
  ];
  const blogCategoryRoutes = blogCategories.map((cat) => ({
    url: `${BASE_URL}/blog/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...mangaRoutes,
    ...chapterRoutes,
    ...blogRoutes,
    ...blogCategoryRoutes,
  ];
}