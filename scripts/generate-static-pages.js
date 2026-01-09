import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_TEMPLATES_CONFIG } from '../src/data/templates.js';
import { LEGAL_LAST_UPDATED, TERMS_SECTIONS, PRIVACY_SECTIONS } from '../src/content/legal.js';
import { ABOUT_CONTENT, FAQ_CONTENT } from '../src/content/marketing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function normalizeSiteUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

const SITE_URL = normalizeSiteUrl(process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://www.bananaprompt.tech');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function cleanText(str) {
  return String(str || '')
    .replace(/[#*`>_]/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // markdown links -> text
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(str, n) {
  const s = cleanText(str);
  if (s.length <= n) return s;
  return `${s.slice(0, n - 1).trim()}…`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripAppModuleScript(html) {
  // Keep JSON-LD scripts, remove Vite app bundle module script(s)
  return html.replace(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>\s*/gi, '');
}

function removeAllLdJson(html) {
  return html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi, '');
}

function replaceOrInsert(html, regex, replacement, insertBefore = '</head>') {
  if (regex.test(html)) return html.replace(regex, replacement);
  return html.replace(insertBefore, `${replacement}\n${insertBefore}`);
}

function ensureClarity(html) {
  // Avoid duplicate injection if dist/index.html already contains it
  if (/clarity\.ms\/tag\/uyndl07fss/i.test(html) || /\bwindow\.clarity\b/i.test(html)) return html;

  const script = `<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "uyndl07fss");
  </script>`;

  return html.replace('</head>', `${script}\n</head>`);
}

function setTitle(html, title) {
  return replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}

function setMetaName(html, name, content) {
  const tag = `<meta name="${name}" content="${escapeHtml(content)}" />`;
  return replaceOrInsert(html, new RegExp(`<meta\\s+name="${name}"[^>]*>`, 'i'), tag);
}

function setMetaProperty(html, property, content) {
  const tag = `<meta property="${property}" content="${escapeHtml(content)}" />`;
  return replaceOrInsert(html, new RegExp(`<meta\\s+property="${property}"[^>]*>`, 'i'), tag);
}

function setCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  return replaceOrInsert(html, /<link\s+rel="canonical"[^>]*>/i, tag);
}

function setHtmlLang(html, lang) {
  return html.replace(/<html\b([^>]*?)\blang="[^"]*"/i, `<html$1lang="${escapeHtml(lang)}"`);
}

function injectRootContent(html, innerHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${innerHtml}</div>`);
}

function addLdJson(html, obj) {
  // JSON-LD must be valid JSON, do NOT HTML-escape quotes
  const script = `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
  return html.replace('</head>', `${script}\n</head>`);
}

function basePageHtml() {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('dist/index.html not found. Run `npm run build` first.');
  }
  const raw = fs.readFileSync(indexPath, 'utf-8');
  // For SEO pages we prefer true static HTML (no SPA JS)
  return stripAppModuleScript(raw);
}

function layout({ pageTitle, subtitle, contentHtml, backHref = '/' }) {
  return `
    <main class="min-h-screen w-full mesh-gradient-bg text-gray-900">
      <div class="max-w-5xl mx-auto px-6 md:px-10 py-10">
        <header class="flex items-center justify-between gap-4 mb-10">
          <a href="${escapeHtml(backHref)}" class="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src="/Logo_icon.svg" alt="Banana Prompt" class="w-9 h-9" />
            <span class="font-extrabold tracking-tight text-lg">Banana Prompt</span>
          </a>
          <nav class="flex items-center gap-4 text-sm">
            <a class="text-gray-600 hover:text-orange-600" href="/showcase/">Showcase</a>
            <a class="text-gray-600 hover:text-orange-600" href="/faq/">FAQ</a>
            <a class="text-gray-600 hover:text-orange-600" href="/about/">About</a>
            <a class="text-gray-600 hover:text-orange-600" href="/terms/">Terms</a>
            <a class="text-gray-600 hover:text-orange-600" href="/privacy/">Privacy</a>
          </nav>
        </header>

        <section class="bg-white/80 border border-gray-200/70 rounded-3xl shadow-sm p-7 md:p-10">
          <h1 class="text-3xl md:text-4xl font-black tracking-tight">${escapeHtml(pageTitle)}</h1>
          ${subtitle ? `<p class="mt-3 text-sm text-gray-500">${escapeHtml(subtitle)}</p>` : ''}
          <div class="prose prose-slate max-w-none mt-7">
            ${contentHtml}
          </div>
        </section>

        <footer class="mt-10 text-xs text-gray-500">
          <p>© ${new Date().getFullYear()} Banana Prompt</p>
        </footer>
      </div>
    </main>
  `.trim();
}

function renderLegalSections(sections) {
  return sections
    .map((sec) => {
      const ps = (sec.paragraphs || [])
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join('\n');
      const bullets = (sec.bullets || [])
        .map((b) => {
          if (b.startsWith('Website:')) {
            return `<li>Website: <a href="https://nanobananapro.site" rel="noopener noreferrer">nanobananapro.site</a></li>`;
          }
          return `<li>${escapeHtml(b)}</li>`;
        })
        .join('\n');
      const ul = bullets ? `<ul>${bullets}</ul>` : '';
      return `<section><h2>${escapeHtml(sec.title)}</h2>${ps}${ul}</section>`;
    })
    .join('\n');
}

function templateName(tpl, lang = 'en') {
  const n = tpl?.name;
  if (!n) return tpl?.id || 'Template';
  if (typeof n === 'string') return n;
  return n[lang] || n.en || n.cn || tpl.id;
}

function templateContent(tpl, lang = 'en') {
  const c = tpl?.content;
  if (!c) return '';
  if (typeof c === 'string') return c;
  return c[lang] || c.en || c.cn || '';
}

function templateDetailHtml(tpl) {
  const name = templateName(tpl, 'en');
  const img = tpl.imageUrl || '/og-image.png';
  const content = templateContent(tpl, 'en');
  const openHref = `/?template=${encodeURIComponent(tpl.id)}`;

  return `
    <div class="not-prose">
      <div class="flex flex-col md:flex-row gap-6 items-start">
        <img src="${escapeHtml(img)}" alt="${escapeHtml(name)}" class="w-full md:w-[360px] rounded-2xl border border-gray-200 bg-white" loading="lazy" referrerpolicy="no-referrer"/>
        <div class="flex-1">
          <p class="text-sm text-gray-600">Template ID: <code>${escapeHtml(tpl.id)}</code></p>
          <div class="mt-4 flex flex-wrap gap-3">
            <a href="${escapeHtml(openHref)}" class="inline-flex items-center px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700">Open in App</a>
            <a href="/showcase/" class="inline-flex items-center px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Back to Showcase</a>
          </div>
        </div>
      </div>
    </div>

    <h2>Prompt</h2>
    <pre style="white-space: pre-wrap; word-break: break-word;">${escapeHtml(content)}</pre>
  `.trim();
}

function showcaseListHtml(templates) {
  return `
    <p>Browse curated AI prompt templates for Nano Banana. Click a template to view details and copy the prompt.</p>
    <div class="not-prose grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      ${templates
        .map((tpl) => {
          const name = templateName(tpl, 'en');
          const href = `/?tpl=${encodeURIComponent(tpl.id)}`;
          const img = tpl.imageUrl || '/og-image.png';
          const desc = truncate(templateContent(tpl, 'en'), 120);
          return `
            <a href="${escapeHtml(href)}" class="group block rounded-2xl border border-gray-200 bg-white/70 hover:bg-white transition-colors overflow-hidden">
              <div class="aspect-[4/3] bg-gray-50 overflow-hidden">
                <img src="${escapeHtml(img)}" alt="${escapeHtml(name)}" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" loading="lazy" referrerpolicy="no-referrer"/>
              </div>
              <div class="p-4">
                <div class="font-bold text-gray-900 truncate">${escapeHtml(name)}</div>
                <div class="mt-2 text-xs text-gray-600 line-clamp-3">${escapeHtml(desc)}</div>
              </div>
            </a>
          `.trim();
        })
        .join('\n')}
    </div>
  `.trim();
}

function renderSimpleSections({ sections }) {
  return (sections || [])
    .map((sec) => {
      const ps = (sec.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('\n');
      const bullets = (sec.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join('\n');
      const ul = bullets ? `<ul>${bullets}</ul>` : '';
      return `<section><h2>${escapeHtml(sec.title)}</h2>${ps}${ul}</section>`;
    })
    .join('\n');
}

function renderFaq({ items }) {
  return `
    ${(items || [])
      .map((it) => `<section><h2>${escapeHtml(it.q)}</h2><p>${escapeHtml(it.a)}</p></section>`)
      .join('\n')}
  `.trim();
}

function writePage({ outDir, outFile = 'index.html', html }) {
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, outFile), html, 'utf-8');
}

function makePage({ pathname, title, description, ogImage, bodyHtml, ldJson, lang = 'en' }) {
  const url = `${SITE_URL}${pathname}`;
  let html = basePageHtml();
  html = ensureClarity(html);
  html = setHtmlLang(html, lang);
  html = removeAllLdJson(html);
  html = setTitle(html, title);
  html = setMetaName(html, 'description', description);
  html = setCanonical(html, url);
  html = setMetaProperty(html, 'og:url', url);
  html = setMetaProperty(html, 'og:title', title);
  html = setMetaProperty(html, 'og:description', description);
  html = setMetaProperty(html, 'og:image', ogImage);
  html = setMetaName(html, 'twitter:url', url);
  html = setMetaName(html, 'twitter:title', title);
  html = setMetaName(html, 'twitter:description', description);
  html = setMetaName(html, 'twitter:image', ogImage);
  html = injectRootContent(html, bodyHtml);
  html = addLdJson(html, ldJson);
  return html;
}

function run() {
  if (!fs.existsSync(distDir)) throw new Error('dist/ not found. Run `npm run build` first.');

  // Note: We intentionally do NOT generate per-template showcase pages.
  // Reason: templates × languages can create excessive URL variants and duplicate content.
  // The app itself already provides a rich in-app modal/detail experience.
  const templates = (INITIAL_TEMPLATES_CONFIG || []).filter((t) => t?.id);

  // Terms page
  {
    const pathname = '/terms/';
    const title = 'Terms of Service - Banana Prompt';
    const description = 'Read Banana Prompt Terms of Service.';
    const contentHtml = renderLegalSections(TERMS_SECTIONS);
    const body = layout({
      pageTitle: 'Terms of Service',
      subtitle: `Last updated: ${LEGAL_LAST_UPDATED}`,
      contentHtml,
      backHref: '/',
    });
    const ldJson = { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Terms of Service', url: `${SITE_URL}${pathname}` };
    const html = makePage({
      pathname,
      title,
      description,
      ogImage: `${SITE_URL}/og-image.png`,
      bodyHtml: body,
      ldJson,
      lang: 'en',
    });
    writePage({ outDir: path.join(distDir, 'terms'), html });
  }

  // Privacy page
  {
    const pathname = '/privacy/';
    const title = 'Privacy Policy - Banana Prompt';
    const description = 'Read Banana Prompt Privacy Policy.';
    const contentHtml = renderLegalSections(PRIVACY_SECTIONS);
    const body = layout({
      pageTitle: 'Privacy Policy',
      subtitle: `Last updated: ${LEGAL_LAST_UPDATED}`,
      contentHtml,
      backHref: '/',
    });
    const ldJson = { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Privacy Policy', url: `${SITE_URL}${pathname}` };
    const html = makePage({
      pathname,
      title,
      description,
      ogImage: `${SITE_URL}/og-image.png`,
      bodyHtml: body,
      ldJson,
      lang: 'en',
    });
    writePage({ outDir: path.join(distDir, 'privacy'), html });
  }

  // Showcase (list page only)
  {
    const pathname = '/showcase/';
    const title = `Showcase - ${templates.length} AI Prompt Templates | Banana Prompt`;
    const description = `Browse ${templates.length} curated AI prompt templates for Nano Banana.`;
    const contentHtml = showcaseListHtml(templates);
    const body = layout({
      pageTitle: 'Showcase',
      subtitle: `${templates.length} templates`,
      contentHtml,
      backHref: '/',
    });
    const ldJson = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Showcase',
      url: `${SITE_URL}${pathname}`,
    };
    const html = makePage({
      pathname,
      title,
      description,
      ogImage: `${SITE_URL}/og-image.png`,
      bodyHtml: body,
      ldJson,
      lang: 'en',
    });
    writePage({ outDir: path.join(distDir, 'showcase'), html });
  }

  // FAQ
  {
    const pathname = '/faq/';
    const title = `FAQ - Banana Prompt`;
    const description = 'Frequently asked questions about Banana Prompt.';
    const contentHtml = renderFaq({ items: FAQ_CONTENT.items });
    const body = layout({
      pageTitle: FAQ_CONTENT.title,
      subtitle: FAQ_CONTENT.subtitle,
      contentHtml,
      backHref: '/',
    });
    const ldJson = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: (FAQ_CONTENT.items || []).map((it) => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: { '@type': 'Answer', text: it.a },
      })),
    };
    const html = makePage({
      pathname,
      title,
      description,
      ogImage: `${SITE_URL}/og-image.png`,
      bodyHtml: body,
      ldJson,
      lang: 'en',
    });
    writePage({ outDir: path.join(distDir, 'faq'), html });
  }

  // About
  {
    const pathname = '/about/';
    const title = `About - Banana Prompt`;
    const description = 'Learn what Banana Prompt is and how it works.';
    const contentHtml = renderSimpleSections({ sections: ABOUT_CONTENT.sections });
    const body = layout({
      pageTitle: ABOUT_CONTENT.title,
      subtitle: ABOUT_CONTENT.subtitle,
      contentHtml,
      backHref: '/',
    });
    const ldJson = {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About',
      url: `${SITE_URL}${pathname}`,
    };
    const html = makePage({
      pathname,
      title,
      description,
      ogImage: `${SITE_URL}/og-image.png`,
      bodyHtml: body,
      ldJson,
      lang: 'en',
    });
    writePage({ outDir: path.join(distDir, 'about'), html });
  }

  console.log('✅ Static SEO pages generated into dist/');
  console.log(`- SITE_URL: ${SITE_URL}`);
  console.log(`- Pages: /showcase /faq /about /terms /privacy (no per-template pages)`);
}

run();


