/**
 * searchIndexer.js
 *
 * Pings Google and Bing sitemap endpoints whenever new content is published.
 * Also submits individual URLs to Google's Indexing API (for eligible pages).
 *
 * Usage:
 *   const { notifySearchEngines } = require('./searchIndexer');
 *   await notifySearchEngines('/manga/abc123');
 *
 * Set these env vars (all optional — falls back to fire-and-forget pings):
 *   SITE_URL            = https://manireader.online
 *   GOOGLE_INDEXING_KEY = path to service account JSON (for Indexing API)
 */

'use strict';

const https = require('https');

const SITE_URL = (process.env.SITE_URL || 'https://manireader.online').replace(/\/$/, '');
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

/**
 * Fire-and-forget HTTPS GET (no response body needed — just ping).
 */
function httpsGet(url) {
    return new Promise((resolve) => {
        https
            .get(url, (res) => {
                res.resume(); // drain
                resolve({ status: res.statusCode, url });
            })
            .on('error', (err) => {
                console.warn(`[SearchIndexer] ping failed: ${url} — ${err.message}`);
                resolve({ status: 0, url, error: err.message });
            });
    });
}

/**
 * Ping both Google and Bing sitemap submission endpoints.
 * This is always safe and free — no API key required.
 */
async function pingSitemaps() {
    const encoded = encodeURIComponent(SITEMAP_URL);
    const pings = [
        `https://www.google.com/ping?sitemap=${encoded}`,
        `https://www.bing.com/ping?sitemap=${encoded}`,
    ];

    const results = await Promise.allSettled(pings.map(httpsGet));
    results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
            console.log(`[SearchIndexer] Pinged ${pings[i]} → HTTP ${r.value.status}`);
        }
    });
}

/**
 * Submit a single URL to Google's Indexing API.
 * Requires GOOGLE_INDEXING_KEY env var pointing to a service account JSON file
 * with the "Cloud Search" or "Indexing API" scope.
 *
 * Free quota: 200 URLs/day.
 * Only works for pages with structured data (JobPosting, BroadcastEvent, etc.)
 * OR if your site is verified in Google Search Console.
 *
 * Silently skips if no credentials are configured.
 */
async function submitToGoogleIndexingApi(path) {
    const keyFile = process.env.GOOGLE_INDEXING_KEY;
    if (!keyFile) return; // skip gracefully — not configured

    try {
        // Dynamic require so the server doesn't crash if googleapis isn't installed
        const { google } = require('googleapis'); // npm install googleapis
        const auth = new google.auth.GoogleAuth({
            keyFile,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });
        const client = await auth.getClient();
        const indexing = google.indexing({ version: 'v3', auth: client });

        const url = `${SITE_URL}${path}`;
        const res = await indexing.urlNotifications.publish({
            requestBody: { url, type: 'URL_UPDATED' },
        });
        console.log(`[SearchIndexer] Google Indexing API → ${url} : ${res.status}`);
    } catch (err) {
        // Non-fatal — just log
        console.warn(`[SearchIndexer] Google Indexing API error: ${err.message}`);
    }
}

/**
 * Submit a URL to Bing's IndexNow protocol.
 * IndexNow is free, instant, and requires a key file served at:
 *   https://manireader.online/<BING_INDEXNOW_KEY>.txt
 *
 * Set BING_INDEXNOW_KEY in .env. To get a key:
 *   1. Go to https://www.bing.com/indexnow
 *   2. Generate a key
 *   3. Place <key>.txt in /frontend/public/
 *   4. Add BING_INDEXNOW_KEY=<key> to .env
 */
async function submitToBingIndexNow(path) {
    const key = process.env.BING_INDEXNOW_KEY;
    if (!key) return;

    const url = `${SITE_URL}${path}`;
    const apiUrl = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${key}`;
    const result = await httpsGet(apiUrl);
    console.log(`[SearchIndexer] IndexNow → ${url} : HTTP ${result.status}`);
}

/**
 * Main export — call this whenever new content is published.
 *
 * @param {string} path — e.g. '/manga/abc123', '/blog/best-action-manga', '/read/ch-001'
 */
async function notifySearchEngines(path) {
    // Always ping sitemaps (free, no keys needed)
    await pingSitemaps();

    // Optional: Google Indexing API (needs service account JSON)
    await submitToGoogleIndexingApi(path);

    // Optional: Bing IndexNow (needs a key file in /public/)
    await submitToBingIndexNow(path);
}

module.exports = { notifySearchEngines, pingSitemaps };