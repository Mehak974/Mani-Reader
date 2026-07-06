export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      if (url.pathname === '/') {
        return new Response('Mani Image Proxy is running!', { status: 200 });
      }
      return new Response('Missing URL', { status: 400 });
    }

    let referer = 'https://mangakatana.com/';
    try {
      const parsedTarget = new URL(targetUrl);
      if (parsedTarget.hostname.includes('mangadex.org')) {
        referer = 'https://mangadex.org/';
      } else if (parsedTarget.hostname.includes('mangakatana.com')) {
        referer = 'https://mangakatana.com/';
      } else {
        referer = parsedTarget.origin + '/';
      }
    } catch (e) {
      // Fallback
    }

    // 🛡️ The Shield: Fetch and Cache
    const imageResponse = await fetch(targetUrl, {
      headers: { 
        'Referer': referer,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const response = new Response(imageResponse.body, imageResponse);
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }
};
