/**
 * Vercel Serverless Function
 * Redirect `/` to `/?lang=xx` based on Accept-Language (and preserve existing query params).
 *
 * Notes:
 * - This project is a Vite SPA, so we can't use Next.js middleware.
 * - We do a server-side redirect on the entry route `/` for better first paint (no language flash).
 */

const SUPPORTED_LANGS = ["zh", "en", "ko", "ja", "es", "de", "fr", "ru", "ar", "pt", "it"];
const SUPPORTED_SET = new Set(SUPPORTED_LANGS);

function normalizeLangCode(lang) {
  const raw = String(lang || "").toLowerCase().trim();
  const primary = raw.split("-")[0];
  if (primary === "cn") return "zh";
  return primary;
}

/**
 * Parse Accept-Language into ordered candidates.
 * Example: "en-US,en;q=0.9,es;q=0.8"
 */
function parseAcceptLanguage(headerValue) {
  const value = String(headerValue || "").trim();
  if (!value) return [];

  return value
    .split(",")
    .map((part, index) => {
      const segment = part.trim();
      if (!segment) return null;

      const [tagRaw, ...params] = segment.split(";").map((s) => s.trim()).filter(Boolean);
      if (!tagRaw || tagRaw === "*") return null;

      let q = 1;
      for (const p of params) {
        const m = /^q=([0-9.]+)$/i.exec(p);
        if (m) {
          const n = Number(m[1]);
          if (!Number.isNaN(n)) q = n;
        }
      }

      const primary = normalizeLangCode(tagRaw);
      return { primary, q, index };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.q !== a.q) return b.q - a.q;
      return a.index - b.index;
    });
}

function pickBestLanguage(req) {
  // If caller explicitly passes lang, honor it (shouldn't happen for `/` due to rewrite condition).
  try {
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.url || "/", `${proto}://${host}`);
    const explicit = normalizeLangCode(url.searchParams.get("lang"));
    if (explicit && (explicit === "zh" || SUPPORTED_SET.has(explicit))) return explicit;
  } catch {
    // ignore
  }

  const header = req.headers["accept-language"];
  const candidates = parseAcceptLanguage(header);
  for (const c of candidates) {
    if (c.primary === "zh") return "zh";
    if (SUPPORTED_SET.has(c.primary)) return c.primary;
  }

  return "en";
}

export default function handler(req, res) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";

  // Try to recover original URL when invoked via rewrites (best-effort).
  const originalUrlLike =
    req.headers["x-vercel-original-url"] ||
    req.headers["x-original-uri"] ||
    req.headers["x-forwarded-uri"] ||
    req.url ||
    "/";

  const url = new URL(originalUrlLike, `${proto}://${host}`);
  const lang = pickBestLanguage(req);

  // Preserve existing query params, but set lang.
  url.searchParams.set("lang", lang);

  // Only ever redirect to the app entry path.
  url.pathname = "/";

  res.statusCode = 307;
  res.setHeader("Location", url.pathname + (url.search || ""));
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vary", "Accept-Language");
  res.end();
}


