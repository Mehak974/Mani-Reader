export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) return new Response('Missing URL', { status: 400 });

    // 🛡️ The Shield: Fetch and Cache
    const imageResponse = await fetch(targetUrl, {
      headers: { 
        'Referer': 'https://mangakatana.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const response = new Response(imageResponse.body, imageResponse);
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }
};
