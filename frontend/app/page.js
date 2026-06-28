import HomeClient from './HomeClient';

export const metadata = {
  title: 'ManiReader — Discover Your Next Hidden Gem',
  description: 'ManiReader — Read manga and manhwa online. Premium manga sanctuary with libraries, bookmarks, and offline gems.',
  alternates: {
    canonical: 'https://manireader.online',
  },
  openGraph: {
    title: 'ManiReader — Read manga and manhwa online',
    description: 'Read manga and manhwa online in a premium gemstone-themed sanctuary.',
    url: 'https://manireader.online',
    siteName: 'ManiReader',
    images: [
      {
        url: 'https://manireader.online/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mani Reader',
    url: 'https://manireader.online',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://manireader.online/browse?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const rawApiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.manireader.online';
  const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
  
  let initialData = {
    fantasy: [],
    action: [],
    romance: [],
    recent: [],
    recentTotalPages: 1,
  };

  try {
    const [fantasyRes, action1Res, action2Res, romance1Res, romance2Res, recentRes] = await Promise.all([
      fetch(`${apiUrl}/api/manga/browse/popular?page=1&genre=fantasy`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => null),
      fetch(`${apiUrl}/api/manga/browse/popular?page=1&genre=action`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => null),
      fetch(`${apiUrl}/api/manga/browse/popular?page=2&genre=action`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => null),
      fetch(`${apiUrl}/api/manga/browse/popular?page=1&genre=romance`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => null),
      fetch(`${apiUrl}/api/manga/browse/popular?page=2&genre=romance`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => null),
      fetch(`${apiUrl}/api/manga/browse/recent?page=1`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => null),
    ]);

    const filterManga = (mangaList) => {
      if (!Array.isArray(mangaList)) return [];
      const _BLACKLIST = [
        '18+', 'adult', 'smut', 'erotica', 'sexual-violence', 'sexual violence',
        'harem', 'yaoi', 'yuri', 'incest', 'gore', 'mature', 'ecchi',
        'hentai', 'pornographic', 'loli', 'shota'
      ];
      const _BAD_WORDS = ['sexy', 'sex', 'thot', 'nude', 'porn', 'hentai', 'uncensored', 'sexual', 'unfiltered', 'erotic', 'smut', 'harem'];
      return mangaList.filter(m => {
        if (m.nsfw) return false;
        const genres = (m.genres || []).map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase());
        const desc = (m.description || '').toLowerCase();
        const title = (m.title || '').toLowerCase();
        
        const hasBlacklistedTag = genres.some(tag =>
          _BLACKLIST.some(bad => tag === bad || tag.includes(bad) || bad.includes(tag))
        );
        const hasBadWord = _BAD_WORDS.some(word => desc.includes(word) || title.includes(word));
        
        return !hasBlacklistedTag && !hasBadWord;
      });
    };

    const processGenre = (responses, limit) => {
      const seen = new Set();
      const results = [];
      for (const res of responses) {
        const raw = res?.data?.results || res?.data || res?.results || (Array.isArray(res) ? res : []);
        for (const m of filterManga(raw)) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            results.push(m);
            if (results.length >= limit) break;
          }
        }
        if (results.length >= limit) break;
      }
      return results;
    };

    initialData.fantasy = processGenre([fantasyRes], 16);
    initialData.action = processGenre([action1Res, action2Res], 16);
    initialData.romance = processGenre([romance1Res, romance2Res], 16);
    initialData.recent = filterManga(recentRes?.data?.results || recentRes?.results || []).slice(0, 30);
    initialData.recentTotalPages = recentRes?.data?.totalPages || recentRes?.totalPages || 1;
  } catch (e) {
    console.error('Home server-side fetch failed:', e);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient initialData={initialData} />
    </>
  );
}
