const fs = require('fs');
const path = require('path');

const SOURCE_DIR = __dirname;
const DEST_DIR = path.join(__dirname, 'www');

// Items to ignore at the root level
const IGNORE_ROOT_ITEMS = [
    'node_modules',
    'android',
    'ios',
    'www',
    'scripts',
    '.github',
    'package.json',
    'package-lock.json',
    'update-seo.js',
    'build-www.js',
    'seo-manifest.json',
    'SEO_REPORT.md',
    '.seo-cache.json',
    'tools-website.apk',
    '.git'
];

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach(element => {
        if (from === SOURCE_DIR && IGNORE_ROOT_ITEMS.includes(element)) {
            return;
        }
        if (element.startsWith('sitemap.backup.') && element.endsWith('.xml')) {
            return;
        }

        const sourcePath = path.join(from, element);
        const destPath = path.join(to, element);

        const stat = fs.statSync(sourcePath);
        if (stat.isFile()) {
            fs.copyFileSync(sourcePath, destPath);
        } else if (stat.isDirectory()) {
            copyFolderSync(sourcePath, destPath);
        }
    });
}

console.log('Building www directory...');
if (fs.existsSync(DEST_DIR)) {
    fs.rmSync(DEST_DIR, { recursive: true, force: true });
}
copyFolderSync(SOURCE_DIR, DEST_DIR);
console.log('Built www directory successfully.');
