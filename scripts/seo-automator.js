#!/usr/bin/env node
/**
 * AI ToolCor — Daily Automated SEO Engine & Theme Sync
 * ----------------------------------------------------
 * Usage:
 *   node scripts/seo-automator.js              (fix SEO + update sitemap + report)
 *   node scripts/seo-automator.js --audit-only (read-only SEO audit & score)
 *   node scripts/seo-automator.js --daily --ping --build
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const cheerio = require('cheerio');

const ROOT_DIR = path.resolve(__dirname, '..');
const SITE_URL = 'https://www.aitoolcor.com';
const SITE_NAME = 'AI ToolCor';
const THEME_COLOR = '#4f46e5';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-image.jpg`;
const CACHE_FILE = path.join(ROOT_DIR, '.seo-cache.json');
const REPORT_FILE = path.join(ROOT_DIR, 'SEO_REPORT.md');
const MANIFEST_FILE = path.join(ROOT_DIR, 'seo-manifest.json');
const SITEMAP_FILE = path.join(ROOT_DIR, 'sitemap.xml');
const ROBOTS_FILE = path.join(ROOT_DIR, 'robots.txt');

const IGNORE_DIRS = new Set(['node_modules', '.git', 'android', 'ios', 'www', 'admin', 'scripts', '.github']);
const NOINDEX_FILES = new Set(['login.html', '404.html', '500.html', 'google768f32ab012d5135.html']);
const EXCLUDE_FROM_SEO = new Set(['google768f32ab012d5135.html']);

const args = new Set(process.argv.slice(2));
const AUDIT_ONLY = args.has('--audit-only');
const SHOULD_PING = args.has('--ping');
const SHOULD_BUILD = args.has('--build');
const IS_DAILY = args.has('--daily');

const THEME_INIT_SCRIPT = `<script data-aitoolcor-theme>(function(){try{var t=localStorage.getItem('aitoolcor_theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();</script>`;

const ANALYTICS_ADSENSE_BLOCK = `    <!-- ========== GOOGLE ANALYTICS ========== -->
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QVFKTFQF4T', { page_path: window.location.pathname });
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-QVFKTFQF4T"></script>

    <!-- ========== GOOGLE ADSENSE ========== -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8473875587893208" crossorigin="anonymous"></script>
    <meta name="google-adsense-account" content="ca-pub-8473875587893208">
    <meta name="google-site-verification" content="gRWH_JtJqZdbeRny9sAHCQg-AFHd10tVOtADOhM_bC4">
    <link rel="preconnect" href="https://pagead2.googlesyndication.com">
    <link rel="dns-prefetch" href="https://www.googletagmanager.com">`;

function walkHtmlFiles(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!IGNORE_DIRS.has(entry.name)) {
                walkHtmlFiles(path.join(dir, entry.name), out);
            }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            const rel = path.relative(ROOT_DIR, path.join(dir, entry.name)).split(path.sep).join('/');
            if (!EXCLUDE_FROM_SEO.has(rel)) {
                out.push(rel);
            }
        }
    }
    return out.sort();
}

function toCanonicalUrl(relPath) {
    return relPath === 'index.html' ? `${SITE_URL}/` : `${SITE_URL}/${relPath}`;
}

function cleanBrand(str) {
    if (!str) return str;
    return str
        .replace(/\bPDFTools\b/g, SITE_NAME)
        .replace(/\bAIToolCor\b/g, SITE_NAME);
}

function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function computeContentHash(html) {
    const $ = cheerio.load(html);
    const title = $('title').text().trim();
    const desc = $('meta[name="description"]').attr('content') || '';
    const bodyText = $('main').text() || $('body').text() || '';
    const normalized = `${title}|${desc}|${bodyText.replace(/\s+/g, ' ').trim()}`;
    return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

function inferPageCategory(relPath) {
    if (relPath === 'index.html') return 'home';
    if (relPath.startsWith('blog/')) return 'blog-post';
    if (relPath === 'blog.html') return 'blog-index';
    if (relPath.startsWith('tools/')) return 'utility-tool';
    if (['about.html', 'contact.html', 'privacy.html', 'terms.html'].includes(relPath)) return 'info';
    if (NOINDEX_FILES.has(relPath)) return 'noindex';
    return 'pdf-tool';
}

function getSitemapMeta(relPath) {
    if (relPath === 'index.html') return { changefreq: 'daily', priority: '1.0' };
    if (relPath === 'blog.html' || relPath.startsWith('blog/')) return { changefreq: 'weekly', priority: '0.8' };
    if (['about.html', 'contact.html', 'privacy.html', 'terms.html'].includes(relPath)) return { changefreq: 'monthly', priority: '0.6' };
    if (['merge-pdf.html', 'compress-pdf.html', 'split-pdf.html', 'ocr-pdf.html', 'pdf-to-jpg.html', 'jpg-to-pdf.html', 'sign-pdf.html'].includes(relPath)) {
        return { changefreq: 'weekly', priority: '0.9' };
    }
    return { changefreq: 'weekly', priority: '0.85' };
}

function normalizeInlineStyles(html) {
    return html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_, open, css, close) => {
        const updatedCss = css
            .replace(/rgba\(\s*124\s*,\s*58\s*,\s*237\s*,/gi, 'rgba(79,70,229,')
            .replace(/rgba\(\s*99\s*,\s*102\s*,\s*241\s*,/gi, 'rgba(79,70,229,')
            .replace(/rgba\(\s*249\s*,\s*115\s*,\s*22\s*,/gi, 'rgba(16,185,129,')
            .replace(/#7c3aed/gi, 'var(--primary)')
            .replace(/#6d28d9/gi, 'var(--primary-dark)')
            .replace(/#f97316/gi, 'var(--accent)')
            .replace(/#ea580c/gi, 'var(--accent-dark)');
        return open + updatedCss + close;
    });
}

function fixJsonLd($head, relPath, canonicalUrl, title, description) {
    const isBlogPost = relPath.startsWith('blog/');
    const scripts = $head('script[type="application/ld+json"]');

    if (scripts.length === 0) {
        const pageName = title.split('|')[0].split('—')[0].trim() || SITE_NAME;
        const graph = [
            {
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                url: `${SITE_URL}/`,
                name: SITE_NAME,
                description: 'Free online PDF, AI, calculator and developer tools. No signup required.',
                inLanguage: 'en-US'
            },
            {
                '@type': 'WebPage',
                '@id': `${canonicalUrl}#webpage`,
                url: canonicalUrl,
                name: title,
                description: description,
                isPartOf: { '@id': `${SITE_URL}/#website` },
                breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
                inLanguage: 'en-US'
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${canonicalUrl}#breadcrumb`,
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
                    ...(relPath === 'index.html' ? [] : [{ '@type': 'ListItem', position: 2, name: pageName, item: canonicalUrl }])
                ]
            }
        ];

        if (isBlogPost) {
            graph.push({
                '@type': 'BlogPosting',
                headline: pageName,
                description: description,
                url: canonicalUrl,
                author: { '@type': 'Organization', name: SITE_NAME },
                publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` }
            });
        } else if (!['about.html', 'contact.html', 'privacy.html', 'terms.html', 'blog.html', 'index.html'].includes(relPath)) {
            graph.push({
                '@type': 'SoftwareApplication',
                name: pageName,
                applicationCategory: relPath.startsWith('tools/developer/') ? 'DeveloperApplication' : 'UtilitiesApplication',
                operatingSystem: 'Web Browser',
                url: canonicalUrl,
                description: description,
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
            });
        }

        $head('head').append(`\n    <script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)}\n    </script>\n`);
        return true;
    }

    let changed = false;
    scripts.each((_, el) => {
        const raw = $head(el).html();
        if (!raw) return;
        try {
            const data = JSON.parse(raw);
            let serialized = JSON.stringify(data);
            const cleaned = cleanBrand(serialized);
            let parsed = JSON.parse(cleaned);

            if (Array.isArray(parsed['@graph'])) {
                for (const node of parsed['@graph']) {
                    if (node['@type'] === 'WebPage') {
                        if (node.url !== canonicalUrl) { node.url = canonicalUrl; changed = true; }
                        if (node['@id'] && !node['@id'].startsWith(canonicalUrl)) { node['@id'] = `${canonicalUrl}#webpage`; changed = true; }
                    }
                    if (node['@type'] === 'BreadcrumbList' && Array.isArray(node.itemListElement)) {
                        const last = node.itemListElement[node.itemListElement.length - 1];
                        if (last && relPath !== 'index.html' && last.item !== canonicalUrl) {
                            last.item = canonicalUrl;
                            changed = true;
                        }
                    }
                    if (node['@type'] === 'SoftwareApplication' && node.url && node.url !== canonicalUrl) {
                        node.url = canonicalUrl;
                        changed = true;
                    }
                }
            }
            const nextStr = JSON.stringify(parsed, null, 2);
            if (cleaned !== serialized || changed) {
                $head(el).text(`\n${nextStr}\n`);
                changed = true;
            }
        } catch (_) {
            // Preserve non-JSON-LD edge content without crashing
        }
    });
    return changed;
}

function processPage(relPath, allExistingRelSet) {
    const absPath = path.join(ROOT_DIR, relPath);
    const originalHtml = fs.readFileSync(absPath, 'utf8');
    const canonicalUrl = toCanonicalUrl(relPath);
    const isNoindex = NOINDEX_FILES.has(relPath);
    const category = inferPageCategory(relPath);

    // Split head safely so body scripts remain untouched byte-for-byte
    const headMatch = originalHtml.match(/^([\s\S]*?<head\b[^>]*>)([\s\S]*?)(<\/head>[\s\S]*)$/i);
    if (!headMatch) {
        return { relPath, score: 0, warnings: ['Missing <head>...</head>'], changed: false, links: [] };
    }

    const [, prefixToHeadOpen, rawHeadInner, suffixFromHeadClose] = headMatch;
    const $h = cheerio.load(`<head>${rawHeadInner}</head>`, { decodeEntities: false });

    // 1. Title & Description
    let title = cleanBrand($h('title').text().trim());
    if (!title) title = `${SITE_NAME} — Free Online Tools`;
    if ($h('title').text().trim() !== title) $h('title').text(title);

    let descEl = $h('meta[name="description"]');
    let description = cleanBrand((descEl.attr('content') || '').trim());
    if (!description) {
        description = `Use ${title.split('|')[0].trim()} online for free on ${SITE_NAME}. Fast, secure, browser-based with no signup required.`;
        $h('head').append(`\n    <meta name="description" content="${description.replace(/"/g, '&quot;')}">`);
    } else if (descEl.attr('content') !== description) {
        descEl.attr('content', description);
    }

    // 2. Author, Robots, Theme Color
    const setMeta = (selector, attrName, attrVal, content) => {
        let el = $h(selector);
        if (el.length === 0) {
            $h('head').append(`\n    <meta ${attrName}="${attrVal}" content="${String(content).replace(/"/g, '&quot;')}">`);
        } else {
            el.attr('content', content);
        }
    };

    setMeta('meta[name="author"]', 'name', 'author', SITE_NAME);
    setMeta('meta[name="theme-color"]', 'name', 'theme-color', THEME_COLOR);
    setMeta(
        'meta[name="robots"]',
        'name',
        'robots',
        isNoindex
            ? 'noindex, nofollow, noarchive'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // 3. Canonical & hreflang
    if ($h('link[rel="canonical"]').length === 0) {
        $h('head').append(`\n    <link rel="canonical" href="${canonicalUrl}">`);
    } else {
        $h('link[rel="canonical"]').first().attr('href', canonicalUrl);
    }

    if (!isNoindex) {
        if ($h('link[rel="alternate"][hreflang="en"]').length === 0) {
            $h('head').append(`\n    <link rel="alternate" hreflang="en" href="${canonicalUrl}">`);
        } else {
            $h('link[rel="alternate"][hreflang="en"]').first().attr('href', canonicalUrl);
        }
    }

    // 4. Open Graph & Twitter Cards
    const ogType = category === 'blog-post' ? 'article' : 'website';
    setMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    if ($h('meta[property="og:image"]').length === 0) {
        setMeta('meta[property="og:image"]', 'property', 'og:image', DEFAULT_OG_IMAGE);
    }
    if ($h('meta[property="og:image:alt"]').length) {
        $h('meta[property="og:image:alt"]').attr('content', cleanBrand($h('meta[property="og:image:alt"]').attr('content')));
    }

    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    if ($h('meta[name="twitter:image"]').length === 0) {
        setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', DEFAULT_OG_IMAGE);
    }
    if ($h('meta[name="twitter:image:alt"]').length) {
        $h('meta[name="twitter:image:alt"]').attr('content', cleanBrand($h('meta[name="twitter:image:alt"]').attr('content')));
    }

    // 5. JSON-LD Structured Data
    if (!isNoindex) {
        fixJsonLd($h, relPath, canonicalUrl, title, description);
    }

    // 6. Pre-paint dark mode script (avoid flash of wrong theme)
    if ($h('script[data-aitoolcor-theme]').length === 0 && !rawHeadInner.includes('aitoolcor_theme')) {
        $h('head').append(`\n    ${THEME_INIT_SCRIPT}\n`);
    }

    // 7. Ensure Analytics & AdSense tags exist once on public pages
    if (!isNoindex && !rawHeadInner.includes('G-QVFKTFQF4T')) {
        $h('head').append(`\n${ANALYTICS_ADSENSE_BLOCK}\n`);
    }

    let nextHeadInner = $h('head').html();
    let nextHtml = prefixToHeadOpen + nextHeadInner + suffixFromHeadClose;

    // 8. Normalize legacy inline <style> palette colors to CSS variables / Indigo+Emerald
    nextHtml = normalizeInlineStyles(nextHtml);

    // 9. Fix missing alt attributes on <img> tags safely without reserializing <script>
    nextHtml = nextHtml.replace(/<img\b(?![^>]*\balt=)([^>]*?)>/gi, (match, attrs) => {
        const fallbackAlt = `${title.split('|')[0].trim()} - ${SITE_NAME}`.replace(/"/g, '&quot;');
        return `<img alt="${fallbackAlt}"${attrs}>`;
    });

    // 10. Audit checks
    const $full = cheerio.load(nextHtml);
    const warnings = [];
    let score = 100;

    const h1Count = $full('h1').length;
    if (h1Count === 0 && !isNoindex) { warnings.push('Missing <h1>'); score -= 10; }
    if (h1Count > 1) { warnings.push(`Multiple <h1> (${h1Count})`); score -= 5; }
    if (title.length < 25 || title.length > 70) { warnings.push(`Title length ${title.length} chars (ideal 30-65)`); score -= 4; }
    if (description.length < 70 || description.length > 170) { warnings.push(`Description length ${description.length} chars (ideal 80-160)`); score -= 4; }

    let missingAltCount = 0;
    $full('img').each((_, img) => {
        if ($full(img).attr('alt') === undefined) missingAltCount++;
    });
    if (missingAltCount > 0) { warnings.push(`${missingAltCount} image(s) missing alt`); score -= 5; }

    const brokenLinks = [];
    const dirOfFile = path.posix.dirname(relPath);
    $full('a[href]').each((_, a) => {
        const href = ($full(a).attr('href') || '').trim();
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
        const cleanHref = href.split('#')[0].split('?')[0];
        if (!cleanHref || cleanHref === '/') return;
        const resolved = cleanHref.startsWith('/')
            ? cleanHref.slice(1)
            : path.posix.normalize(dirOfFile === '.' ? cleanHref : `${dirOfFile}/${cleanHref}`);
        if (!allExistingRelSet.has(resolved) && resolved !== 'sitemap.xml') {
            brokenLinks.push(href);
        }
    });
    if (brokenLinks.length > 0) {
        warnings.push(`Broken internal links: ${[...new Set(brokenLinks)].slice(0, 5).join(', ')}`);
        score -= Math.min(15, brokenLinks.length * 5);
    }

    const changed = nextHtml !== originalHtml;
    if (changed && !AUDIT_ONLY) {
        fs.writeFileSync(absPath, nextHtml, 'utf8');
    }

    return {
        relPath,
        url: canonicalUrl,
        title,
        description,
        category,
        isNoindex,
        score: Math.max(0, score),
        warnings,
        changed,
        hash: computeContentHash(nextHtml)
    };
}

function generateSitemap(results, cache) {
    const today = new Date().toISOString().split('T')[0];
    const indexable = results.filter(r => !r.isNoindex);
    const changedUrls = [];

    // Sort homepage first, then root tools, then tools/*, then blog, then info
    const orderWeight = r => {
        if (r.relPath === 'index.html') return 0;
        if (r.category === 'pdf-tool') return 1;
        if (r.category === 'utility-tool') return 2;
        if (r.relPath === 'blog.html') return 3;
        if (r.category === 'blog-post') return 4;
        return 5;
    };
    indexable.sort((a, b) => orderWeight(a) - orderWeight(b) || a.relPath.localeCompare(b.relPath));

    const urlBlocks = indexable.map(page => {
        const prev = cache[page.relPath];
        let lastmod = prev && prev.lastmod ? prev.lastmod : today;
        if (!prev || prev.hash !== page.hash) {
            lastmod = today;
            changedUrls.push(page.url);
        }
        cache[page.relPath] = { hash: page.hash, lastmod };

        const meta = getSitemapMeta(page.relPath);
        return `  <url>\n    <loc>${escapeXml(page.url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${meta.changefreq}</changefreq>\n    <priority>${meta.priority}</priority>\n  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlBlocks.join('\n')}\n</urlset>\n`;

    if (!AUDIT_ONLY) {
        fs.writeFileSync(SITEMAP_FILE, xml, 'utf8');
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n', 'utf8');

        // Clean up legacy sitemap.backup.*.xml clutter
        for (const f of fs.readdirSync(ROOT_DIR)) {
            if (f.startsWith('sitemap.backup.') && f.endsWith('.xml')) {
                fs.unlinkSync(path.join(ROOT_DIR, f));
            }
        }
    }
    return { totalUrls: indexable.length, changedUrls };
}

function updateRobotsTxt() {
    const robotsContent = [
        'User-agent: *',
        'Allow: /',
        '',
        'Disallow: /admin/',
        'Disallow: /login.html',
        'Disallow: /404',
        'Disallow: /404.html',
        '',
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        ''
    ].join('\n');

    if (!AUDIT_ONLY) {
        fs.writeFileSync(ROBOTS_FILE, robotsContent, 'utf8');
    }
}

async function pingIndexNow(urls) {
    const key = (process.env.INDEXNOW_KEY || '').trim();
    if (!key) {
        console.log('ℹ️  IndexNow skipped (set INDEXNOW_KEY env var to auto-submit changed URLs).');
        return { skipped: true };
    }
    if (!urls.length) {
        console.log('ℹ️  IndexNow skipped (0 changed URLs since last run).');
        return { skipped: true, reason: 'no-changes' };
    }

    const keyFilePath = path.join(ROOT_DIR, `${key}.txt`);
    if (!fs.existsSync(keyFilePath)) {
        fs.writeFileSync(keyFilePath, key, 'utf8');
    }

    const payload = {
        host: 'www.aitoolcor.com',
        key,
        keyLocation: `${SITE_URL}/${key}.txt`,
        urlList: urls.slice(0, 10000)
    };

    try {
        const res = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload)
        });
        console.log(`📡 IndexNow ping status: ${res.status} (${urls.length} URLs submitted)`);
        return { status: res.status, count: urls.length };
    } catch (err) {
        console.warn(`⚠️  IndexNow ping failed: ${err.message}`);
        return { error: err.message };
    }
}

function writeReports(results, sitemapInfo) {
    const nowIso = new Date().toISOString();
    const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / Math.max(1, results.length));
    const pagesModified = results.filter(r => r.changed).length;
    const pagesWithWarnings = results.filter(r => r.warnings.length > 0);

    const manifest = {
        generatedAt: nowIso,
        siteUrl: SITE_URL,
        totalPages: results.length,
        indexablePages: sitemapInfo.totalUrls,
        averageSeoScore: avgScore,
        pages: results.map(r => ({
            path: r.relPath,
            url: r.url,
            category: r.category,
            title: r.title,
            score: r.score,
            warnings: r.warnings
        }))
    };

    const mdLines = [
        '# AI ToolCor — Automated SEO Health Report',
        '',
        `- **Last Run**: ${nowIso}`,
        `- **Mode**: ${AUDIT_ONLY ? 'Audit Only' : IS_DAILY ? 'Daily Automated Run' : 'Full SEO Sync'}`,
        `- **Total Pages Scanned**: ${results.length}`,
        `- **Indexable Pages in Sitemap**: ${sitemapInfo.totalUrls}`,
        `- **Pages Updated This Run**: ${pagesModified}`,
        `- **URLs Refreshed in Sitemap**: ${sitemapInfo.changedUrls.length}`,
        `- **Average SEO Score**: **${avgScore}/100**`,
        '',
        '## Warnings Summary',
        ''
    ];

    if (pagesWithWarnings.length === 0) {
        mdLines.push('All pages passed all automated SEO checks with zero warnings!');
    } else {
        mdLines.push('| Page | Score | Notes |');
        mdLines.push('|---|---:|---|');
        for (const p of pagesWithWarnings) {
            mdLines.push(`| \`${p.relPath}\` | ${p.score} | ${p.warnings.join('; ')} |`);
        }
    }

    if (!AUDIT_ONLY) {
        fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
        fs.writeFileSync(REPORT_FILE, mdLines.join('\n') + '\n', 'utf8');
    }

    return { avgScore, pagesModified, warningPages: pagesWithWarnings.length };
}

async function main() {
    console.log('\n🚀 AI ToolCor Automated SEO Engine');
    console.log('====================================');

    const htmlFiles = walkHtmlFiles(ROOT_DIR);
    const allExistingRelSet = new Set(htmlFiles);

    // Also allow root-level assets referenced by links
    for (const extra of ['robots.txt', 'sitemap.xml', 'site.webmanifest']) {
        allExistingRelSet.add(extra);
    }

    let cache = {};
    if (fs.existsSync(CACHE_FILE)) {
        try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch (_) { cache = {}; }
    }

    const results = htmlFiles.map(rel => processPage(rel, allExistingRelSet));
    const sitemapInfo = generateSitemap(results, cache);
    updateRobotsTxt();
    const summary = writeReports(results, sitemapInfo);

    console.log(`✅ Scanned ${results.length} HTML files (${sitemapInfo.totalUrls} indexable)`);
    console.log(`🛠️  HTML files updated: ${summary.pagesModified}`);
    console.log(`🗺️  Sitemap URLs: ${sitemapInfo.totalUrls} (${sitemapInfo.changedUrls.length} new/changed)`);
    console.log(`📊 Average SEO Score: ${summary.avgScore}/100 (${summary.warningPages} pages with notes)`);

    if (SHOULD_PING && !AUDIT_ONLY) {
        await pingIndexNow(sitemapInfo.changedUrls);
    }

    if (SHOULD_BUILD && !AUDIT_ONLY) {
        console.log('\n📦 Rebuilding www/ directory...');
        execSync('node build-www.js', { cwd: ROOT_DIR, stdio: 'inherit' });
    }
}

main().catch(err => {
    console.error('❌ SEO Automator failed:', err);
    process.exit(1);
});
