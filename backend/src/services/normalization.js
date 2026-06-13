'use strict';
/**
 * NORMALIZATION ENGINE — CRITICAL CORE
 *
 * Rules:
 *  1. All chapters from external APIs must pass through here.
 *  2. Parse chapter numbers with parseFloat.
 *  3. Deduplicate by (mangaId, chapterNumber).
 *  4. Merge scanlation sources.
 *  5. Drop chapters where number is NaN (e.g. "?" specials that break sort).
 *  6. Return sorted ascending.
 *
 * No chapter data leaves the system without passing through normalize().
 */

/**
 * Parse a raw chapter string into a Float.
 * Handles: "12", "12.5", "12a" (strips trailing alpha), null/undefined → NaN.
 */
function parseChapterNumber(raw) {
  if (raw === null || raw === undefined) return NaN;
  const str = String(raw).trim();
  // Remove trailing non-numeric chars (e.g. "12a" → "12")
  const cleaned = str.replace(/[a-zA-Z]+$/, '');
  const num = parseFloat(cleaned);
  return num;
}

/**
 * Normalize a raw chapter object from Consumet into our internal shape.
 */
function normalizeChapter(raw, mangaId) {
  return {
    id: raw.id || raw.chapterId || null,
    mangaId,
    number: parseChapterNumber(raw.chapterNumber || raw.chapter || raw.number),
    title: raw.title || raw.chapterTitle || null,
    pages: raw.pages || [],
    releasedAt: raw.releasedAt || null,
    source: raw.source || 'unknown',
  };
}

/**
 * Main normalization function.
 *
 * @param {Array} chapters — Raw chapter array from Consumet
 * @param {string} mangaId — The canonical manga ID
 * @returns {Array} — Cleaned, deduplicated, sorted chapter list
 */
function normalize(chapters, mangaId) {
  if (!Array.isArray(chapters) || chapters.length === 0) return [];

  const map = new Map();

  for (const raw of chapters) {
    const ch = normalizeChapter(raw, mangaId);

    // Drop chapters with unparseable numbers
    if (isNaN(ch.number)) continue;

    // Drop chapters without an ID (unusable)
    if (!ch.id) continue;

    const key = `${mangaId}-${ch.number}`;

    if (!map.has(key)) {
      map.set(key, {
        ...ch,
        sources: [ch.source],
      });
    } else {
      const existing = map.get(key);
      // Merge source list, avoid duplicates
      if (!existing.sources.includes(ch.source)) {
        existing.sources.push(ch.source);
      }
      // Prefer the entry with a title over one without
      if (!existing.title && ch.title) {
        existing.title = ch.title;
      }
    }
  }

  // Sort ascending by chapter number
  return [...map.values()].sort((a, b) => a.number - b.number);
}

/**
 * Quick self-test — called via: node -e "require('./normalization').test()"
 */
module.exports = { normalize, parseChapterNumber };
