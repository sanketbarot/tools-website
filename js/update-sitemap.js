/* ════════════════════════════════════════════════════
   AIToolCor - Sitemap Auto Updater
   File: update-sitemap.js
   
   USAGE:
   1. Page update કરો
   2. Terminal/CMD ખોલો
   3. Run: node update-sitemap.js
   4. Sitemap automatically update થશે!
════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

// ════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════
const CONFIG = {
    siteUrl: 'https://www.aitoolcor.com',
    sitemapFile: 'sitemap.xml',
    
    // ✅ Tamara actual folders
    scanFolders: [
        '.',                           // Root - compress-pdf.html etc.
        'tools/calculators',           // Age calc, BMI etc.
        'tools/text',                  // Word counter etc.
        'tools/image',                 // QR generator etc.
        'tools/developer'              // Password generator etc.
    ],
    
    // ✅ Skip these files
    excludeFiles: [
        '404.html',
        '500.html',
        'test.html',
        'login.html',
        'signup.html',
        'admin.html',
        'google768f32ab012d5135.html'  // ← tamari Google verification file
    ],
    
    // 720 hours = 30 days
    hoursWithin: 720
};

// ════════════════════════════════════════
// COLORS for console
// ════════════════════════════════════════
const colors = {
    reset:  '\x1b[0m',
    green:  '\x1b[32m',
    red:    '\x1b[31m',
    yellow: '\x1b[33m',
    blue:   '\x1b[34m',
    cyan:   '\x1b[36m',
    bold:   '\x1b[1m'
};

function log(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}

// ════════════════════════════════════════
// MAIN FUNCTION
// ════════════════════════════════════════
function updateSitemap() {
    log('\n╔════════════════════════════════════════╗', 'cyan');
    log('║   AIToolCor Sitemap Auto Updater      ║', 'cyan');
    log('╚════════════════════════════════════════╝\n', 'cyan');

    // 1. Check if sitemap exists
    if (!fs.existsSync(CONFIG.sitemapFile)) {
        log(`❌ Error: ${CONFIG.sitemapFile} not found!`, 'red');
        log('   Make sure sitemap.xml is in the same folder.\n', 'yellow');
        return;
    }

    // 2. Read current sitemap
    let sitemap = fs.readFileSync(CONFIG.sitemapFile, 'utf8');
    const today = new Date().toISOString().split('T')[0];
    log(`📅 Today's date: ${today}`, 'blue');
    log(`🔍 Scanning files modified within last ${CONFIG.hoursWithin} hours...\n`, 'blue');

    // 3. Get all HTML files from scan folders
    const allFiles = [];
    CONFIG.scanFolders.forEach(folder => {
        try {
            if (!fs.existsSync(folder)) {
                log(`⚠️  Folder not found: ${folder}`, 'yellow');
                return;
            }
            const files = fs.readdirSync(folder)
                .filter(f => f.endsWith('.html'))
                .filter(f => !CONFIG.excludeFiles.includes(f));
            
            files.forEach(file => {
                const fullPath = folder === '.' ? file : `${folder}/${file}`;
                allFiles.push({
                    name: file,
                    path: fullPath,
                    folder: folder
                });
            });
        } catch (err) {
            log(`⚠️  Error reading folder ${folder}: ${err.message}`, 'yellow');
        }
    });

    log(`📂 Total HTML files found: ${allFiles.length}\n`, 'blue');

    // 4. Check which files were modified recently
    const updatedFiles = [];
    const cutoffTime = Date.now() - (CONFIG.hoursWithin * 60 * 60 * 1000);

    allFiles.forEach(file => {
        try {
            const stats = fs.statSync(file.path);
            const modifiedTime = stats.mtime.getTime();
            
            if (modifiedTime >= cutoffTime) {
                const modifiedDate = stats.mtime.toISOString().split('T')[0];
                updatedFiles.push({
                    ...file,
                    modifiedDate: modifiedDate,
                    modifiedTime: stats.mtime
                });
            }
        } catch (err) {
            log(`⚠️  Error checking ${file.path}: ${err.message}`, 'yellow');
        }
    });

    if (updatedFiles.length === 0) {
        log('ℹ️  No files modified recently. Sitemap not updated.\n', 'yellow');
        return;
    }

    log(`✏️  Files to update in sitemap: ${updatedFiles.length}\n`, 'green');

    // 5. Update sitemap
    let updateCount = 0;
    updatedFiles.forEach(file => {
        // Build URL
        const url = file.folder === '.' 
            ? `${CONFIG.siteUrl}/${file.name}`
            : `${CONFIG.siteUrl}/${file.folder}/${file.name}`;
        
        // Special case for index.html → root URL
        const isHomepage = file.name === 'index.html' && file.folder === '.';
        const searchUrl = isHomepage ? `${CONFIG.siteUrl}/` : url;
        
        // Escape special regex characters
        const escapedUrl = searchUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Regex to find and update lastmod
        const regex = new RegExp(
            `(<loc>${escapedUrl}</loc>\\s*<lastmod>)([^<]+)(</lastmod>)`,
            'g'
        );
        
        if (sitemap.match(regex)) {
            const oldDateMatch = sitemap.match(regex)[0];
            const oldDate = oldDateMatch.match(/<lastmod>([^<]+)<\/lastmod>/)[1];
            
            if (oldDate !== today) {
                sitemap = sitemap.replace(regex, `$1${today}$3`);
                log(`  ✅ Updated: ${file.name}`, 'green');
                log(`     ${oldDate} → ${today}`, 'cyan');
                updateCount++;
            } else {
                log(`  ⏭️  Skipped: ${file.name} (already today)`, 'yellow');
            }
        } else {
            log(`  ⚠️  Not in sitemap: ${file.name}`, 'yellow');
            log(`     URL: ${searchUrl}`, 'yellow');
        }
    });

    // 6. Save updated sitemap
    if (updateCount > 0) {
        // Backup original
        const backupFile = `sitemap.backup.${Date.now()}.xml`;
        fs.copyFileSync(CONFIG.sitemapFile, backupFile);
        log(`\n💾 Backup created: ${backupFile}`, 'blue');
        
        // Save new sitemap
        fs.writeFileSync(CONFIG.sitemapFile, sitemap);
        
        log('\n╔════════════════════════════════════════╗', 'green');
        log(`║  🎉 SUCCESS! ${updateCount} pages updated         ║`, 'green');
        log('╚════════════════════════════════════════╝\n', 'green');
        
        log('📌 Next steps:', 'cyan');
        log('  1. Verify sitemap.xml manually', 'cyan');
        log('  2. Upload to your server', 'cyan');
        log('  3. Resubmit in Google Search Console:', 'cyan');
        log(`     https://search.google.com/search-console\n`, 'cyan');
    } else {
        log('\nℹ️  No updates needed. Sitemap unchanged.\n', 'yellow');
    }
}

// ════════════════════════════════════════
// RUN
// ════════════════════════════════════════
try {
    updateSitemap();
} catch (err) {
    log(`\n❌ Error: ${err.message}\n`, 'red');
    console.error(err);
}