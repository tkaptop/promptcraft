import { LANGUAGE_CODES } from '../constants/translations';

function normalizeLang(lang) {
  const raw = String(lang || '').toLowerCase().trim();
  const primary = raw.split('-')[0];
  if (primary === 'cn') return 'zh';
  return primary || 'en';
}

function getSiteUrl(explicitSiteUrl) {
  const fallback = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
  const raw = (explicitSiteUrl || fallback || '').trim();
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function ensureLink(rel, attrs) {
  let el = document.querySelector(`link[rel="${rel}"]${attrs?.hreflang ? `[hreflang="${attrs.hreflang}"]` : ''}`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null) continue;
    el.setAttribute(k, String(v));
  }
  return el;
}

function ensureMeta(selector, attrs) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'content') continue;
      el.setAttribute(k, String(v));
    }
    document.head.appendChild(el);
  }
  if (attrs?.content != null) el.setAttribute('content', String(attrs.content));
  return el;
}

function setOrCreateMetaByName(name, content) {
  return ensureMeta(`meta[name="${name}"]`, { name, content });
}

function setOrCreateMetaByProperty(property, content) {
  return ensureMeta(`meta[property="${property}"]`, { property, content });
}

function getExplicitLangFromUrl() {
  if (typeof window === 'undefined') return '';
  const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
  const paramSource = window.location.search ? window.location.search : (hashQuery ? `?${hashQuery}` : '');
  if (!paramSource) return '';
  const params = new URLSearchParams(paramSource.startsWith('?') ? paramSource.slice(1) : paramSource);
  return normalizeLang(params.get('lang') || params.get('language') || params.get('locale'));
}

function buildCanonicalUrl({ siteUrl, language }) {
  const base = getSiteUrl(siteUrl);
  if (!base) return null;

  // Canonical 只保留 lang（避免分享/追踪参数污染索引）
  // - 如果 URL 没显式指定语言，则 canonical 保持为根路径（与静态 index.html 保持一致）
  // - 如果 URL 显式 ?lang=xx，则 canonical 指向对应语言入口，便于多语言收录
  const explicit = getExplicitLangFromUrl();
  const lang = explicit || normalizeLang(language);
  const u = new URL('/', base);
  if (explicit) u.searchParams.set('lang', lang);
  return u.toString();
}

function toAbsoluteUrl(siteUrl, maybePathOrUrl) {
  const base = getSiteUrl(siteUrl);
  const raw = String(maybePathOrUrl || '').trim();
  if (!raw) return '';
  try {
    return new URL(raw, base || undefined).toString();
  } catch {
    return raw;
  }
}

function normalizeHreflang(code) {
  const c = normalizeLang(code);
  // 这里按“语言”维度即可；如果你未来拆分 zh-CN / zh-TW 再扩展映射
  return c === 'zh' ? 'zh-CN' : c;
}

/**
 * 在 SPA 运行时同步 SEO Head：
 * - canonical / og:url / twitter:url
 * - og/twitter title/description/image
 * - hreflang alternates（多语言 query 入口：/?lang=xx）
 *
 * 说明：静态 SEO（首屏 HTML）仍以 index.html 为准；这里是运行时补强（语言/模板切换时保持一致）。
 */
export function applyRuntimeSEO({
  siteUrl,
  language,
  title,
  description,
  ogImage = '/og-image.png',
} = {}) {
  if (typeof document === 'undefined') return;

  const base = getSiteUrl(siteUrl || (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SITE_URL : ''));
  const canonical = buildCanonicalUrl({ siteUrl: base, language });

  if (title) document.title = title;

  if (description) {
    setOrCreateMetaByName('description', description);
    setOrCreateMetaByProperty('og:description', description);
    setOrCreateMetaByName('twitter:description', description);
  }

  if (title) {
    setOrCreateMetaByProperty('og:title', title);
    setOrCreateMetaByName('twitter:title', title);
  }

  if (canonical) {
    ensureLink('canonical', { href: canonical });
    setOrCreateMetaByProperty('og:url', canonical);
    setOrCreateMetaByName('twitter:url', canonical);
  }

  const absImage = toAbsoluteUrl(base, ogImage);
  if (absImage) {
    setOrCreateMetaByProperty('og:image', absImage);
    setOrCreateMetaByName('twitter:image', absImage);
  }

  // 基础 robots（防止意外被某些环境注入 noindex）
  setOrCreateMetaByName(
    'robots',
    'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
  );

  // hreflang：为每种语言提供一个稳定入口
  if (base) {
    // 先清理旧的 alternates（避免重复堆积）
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((n) => n.remove());
    ensureLink('alternate', { hreflang: 'x-default', href: `${base}/` });

    const codes = Array.from(new Set(LANGUAGE_CODES.map(normalizeLang))).filter(Boolean);
    for (const code of codes) {
      const href = `${base}/?lang=${encodeURIComponent(code)}`;
      ensureLink('alternate', { hreflang: normalizeHreflang(code), href });
    }
  }
}


