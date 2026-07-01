const fs = require('fs');
const path = require('path');

const TAGS_TO_INJECT = `
    <!-- ========== GOOGLE ANALYTICS ========== -->
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
    <link rel="dns-prefetch" href="https://www.googletagmanager.com">
`;

// Directories to ignore
const IGNORE_DIRS = ['node_modules', '.git', 'android', 'ios'];

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            if (filePath.endsWith('.html')) {
                callback(filePath, stat);
            }
        } else if (stat.isDirectory() && !IGNORE_DIRS.includes(name)) {
            walkSync(filePath, callback);
        }
    });
}

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Remove old Google Analytics blocks
    content = content.replace(/<!--\s*========== GOOGLE ANALYTICS ==========\s*-->[\s\S]*?(?=<!--|<\/head>)/gi, '');
    
    // 2. Remove old Google Adsense blocks
    content = content.replace(/<!--\s*========== GOOGLE ADSENSE ==========\s*-->[\s\S]*?(?=<!--|<\/head>)/gi, '');
    
    // 3. Remove individual scattered tags (in case they weren't under the block comment)
    content = content.replace(/<script[^>]*src=["']https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-8473875587893208["'][^>]*><\/script>/gi, '');
    content = content.replace(/<meta[^>]*name=["']google-adsense-account["'][^>]*>/gi, '');
    content = content.replace(/<meta[^>]*name=["']google-site-verification["'][^>]*>/gi, '');
    content = content.replace(/<script[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-QVFKTFQF4T["'][^>]*><\/script>/gi, '');
    content = content.replace(/<link[^>]*href=["']https:\/\/pagead2\.googlesyndication\.com["'][^>]*>/gi, '');
    content = content.replace(/<link[^>]*href=["']https:\/\/www\.googletagmanager\.com["'][^>]*>/gi, '');
    
    // 4. Inject the new block right before </head>
    if (content.includes('</head>')) {
        content = content.replace('</head>', TAGS_TO_INJECT + '\n</head>');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    } else {
        console.warn(`Warning: No </head> found in ${filePath}`);
    }
}

console.log("Starting to update HTML files...");
walkSync(__dirname, function(filePath) {
    updateFile(filePath);
});
console.log("Finished updating HTML files.");
