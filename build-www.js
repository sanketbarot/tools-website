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
    'package.json', 
    'package-lock.json', 
    'update-seo.js', 
    'build-www.js',
    '.git'
];

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach(element => {
        // Skip ignored root items
        if (from === SOURCE_DIR && IGNORE_ROOT_ITEMS.includes(element)) {
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

console.log("Building www directory...");
// Clean www dir if it exists
if (fs.existsSync(DEST_DIR)) {
    fs.rmSync(DEST_DIR, { recursive: true, force: true });
}
copyFolderSync(SOURCE_DIR, DEST_DIR);
console.log("Built www directory successfully.");
