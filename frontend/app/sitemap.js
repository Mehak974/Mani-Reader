export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://manireader.online';
  const rawApiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.manireader.online';
  const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/browse',
    '/library',
    '/auth/login',
    '/auth/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  // 2. Dynamic Manga Routes (Top 100 Popular)
  let popularManga = [];
  try {
    const res = await fetch(`${apiUrl}/api/manga/most-read`, { next: { revalidate: 3600 } });
    const data = await res.json();
    popularManga = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Sitemap fetch failed:', e);
  }

  const mangaRoutes = popularManga.map((m) => ({
    url: `${baseUrl}/manga/${m.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...mangaRoutes];
}
