const fs = require('fs');

const today = new Date().toISOString().split('T')[0];
let sitemap = fs.readFileSync('sitemap.xml', 'utf8');

// All <lastmod> dates → today
sitemap = sitemap.replace(
    /<lastmod>[^<]+<\/lastmod>/g,
    `<lastmod>${today}</lastmod>`
);

fs.writeFileSync('sitemap.xml', sitemap);
console.log(`✅ All dates updated to ${today}`);