import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function normalizeSiteUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  const noTrailing = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  return noTrailing;
}

function readLocaleCodes() {
  const localesDir = path.join(rootDir, 'src', 'locales');
  if (!fs.existsSync(localesDir)) return [];
  const entries = fs.readdirSync(localesDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .map((n) => String(n).toLowerCase().trim())
    .map((n) => (n === 'cn' ? 'zh' : n))
    .filter(Boolean);
}

function uniqSorted(arr) {
  return Array.from(new Set(arr)).sort();
}

function buildSitemapXml({ siteUrl, urls, lastmod }) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for (const u of urls) {
    lines.push('  <url>');
    lines.push(`    <loc>${u}</loc>`);
    if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push('    <changefreq>daily</changefreq>');
    lines.push('    <priority>1.0</priority>');
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  lines.push('');
  return lines.join('\n');
}

function buildRobotsTxt({ siteUrl }) {
  const lines = [];
  lines.push('# https://www.robotstxt.org/robotstxt.html');
  lines.push('User-agent: *');
  lines.push('Allow: /');
  lines.push('');
  lines.push('# Sitemaps');
  if (siteUrl) lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);
  lines.push('');
  return lines.join('\n');
}

const siteUrl = normalizeSiteUrl(process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://www.bananaprompt.tech');
const localeCodes = uniqSorted(readLocaleCodes());

const urls = [];
urls.push(`${siteUrl}/`);
for (const code of localeCodes) {
  urls.push(`${siteUrl}/?lang=${encodeURIComponent(code)}`);
}

const today = new Date().toISOString().slice(0, 10);
const sitemapXml = buildSitemapXml({ siteUrl, urls: uniqSorted(urls), lastmod: today });
const robotsTxt = buildRobotsTxt({ siteUrl });

const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');

console.log(`✅ SEO files generated`);
console.log(`- SITE_URL: ${siteUrl}`);
console.log(`- Languages: ${localeCodes.join(', ') || '(none)'}`);
console.log(`- Wrote: public/sitemap.xml, public/robots.txt`);


