/**
 * POST /api/indexnow
 *
 * Submit one or many URLs to Bing/IndexNow + ping Google sitemap.
 *
 * Body: { urls: string[] }
 * Auth: Bearer token must match INDEXNOW_ADMIN_TOKEN env var (optional — skipped if not set)
 *
 * Called automatically by the backend searchIndexer service and
 * can also be triggered manually from the admin panel.
 */
import { NextResponse } from 'next/server';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'c4b0c79326e64467bd94b9122fb39a7b';
const SITE_HOST = 'manireader.online';
const SITE_URL = `https://${SITE_HOST}`;
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const ADMIN_TOKEN = process.env.INDEXNOW_ADMIN_TOKEN; // optional auth guard

export async function POST(req) {
  // Optional auth guard
  if (ADMIN_TOKEN) {
    const auth = req.headers.get('authorization') || '';
    if (auth.replace('Bearer ', '') !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let urls;
  try {
    const body = await req.json();
    urls = body.urls;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'urls must be a non-empty array' }, { status: 400 });
  }

  // Ensure all URLs are absolute
  const absoluteUrls = urls.map((u) =>
    u.startsWith('http') ? u : `${SITE_URL}${u.startsWith('/') ? u : '/' + u}`
  );

  const results = { indexnow: null, google: null, bing: null };

  // ── Bing / IndexNow ──────────────────────────────────────────────────────────
  try {
    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: absoluteUrls,
    };
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
    results.indexnow = { status: res.status, ok: res.ok };
  } catch (err) {
    results.indexnow = { error: err.message };
  }

  // ── Google sitemap ping ──────────────────────────────────────────────────────
  try {
    const encoded = encodeURIComponent(SITEMAP_URL);
    const res = await fetch(`https://www.google.com/ping?sitemap=${encoded}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    results.google = { status: res.status, ok: res.ok };
  } catch (err) {
    results.google = { error: err.message };
  }

  // ── Bing sitemap ping (separate from IndexNow) ───────────────────────────────
  try {
    const encoded = encodeURIComponent(SITEMAP_URL);
    const res = await fetch(`https://www.bing.com/ping?sitemap=${encoded}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    results.bing = { status: res.status, ok: res.ok };
  } catch (err) {
    results.bing = { error: err.message };
  }

  return NextResponse.json({ success: true, submitted: absoluteUrls.length, results });
}

// Also expose a GET for health-check / manual sitemap ping with no body
export async function GET() {
  try {
    const encoded = encodeURIComponent(SITEMAP_URL);
    const [g, b] = await Promise.allSettled([
      fetch(`https://www.google.com/ping?sitemap=${encoded}`, { signal: AbortSignal.timeout(5000) }),
      fetch(`https://www.bing.com/ping?sitemap=${encoded}`, { signal: AbortSignal.timeout(5000) }),
    ]);
    return NextResponse.json({
      sitemap: SITEMAP_URL,
      google: g.status === 'fulfilled' ? g.value.status : 'error',
      bing: b.status === 'fulfilled' ? b.value.status : 'error',
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}