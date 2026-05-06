// ==========================================
// LOREM IPSUM GENERATOR - COMPLETE WORKING
// ==========================================

// Lorem ipsum word bank
var LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem ut enim ad minima veniam quis nostrum exercitationem ullam corporis suscipit laboriosam nisi ut aliquid ex ea commodi consequatur quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur vel illum qui dolorem eum fugiat quo voluptas nulla pariatur at vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint obcaecati cupiditate non provident similique sunt in culpa qui officia deserunt mollitia animi id est laborum et dolorum fuga'.split(' ');

var FIRST_LINE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

// Defaults
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('countInput').value = 5;
    generateLorem();
});

// Generate
function generateLorem() {
    var count = parseInt(document.getElementById('countInput').value) || 5;
    var type = getActiveType();
    var startWithLorem = document.getElementById('startLorem').checked;
    var includeHTML = document.getElementById('includeHtml').checked;

    if (count < 1) { showE('Enter a number greater than 0!'); return; }
    if (count > 100) { showE('Maximum 100 allowed!'); return; }
    hideE();

    var result = '';
    var plainResult = '';

    switch (type) {
        case 'paragraphs':
            result = genParagraphs(count, startWithLorem, includeHTML);
            break;
        case 'sentences':
            result = genSentences(count, startWithLorem, includeHTML);
            break;
        case 'words':
            result = genWords(count, startWithLorem, includeHTML);
            break;
        case 'list':
            result = genList(count, startWithLorem, includeHTML);
            break;
    }

    // Display
    if (includeHTML) {
        document.getElementById('outputText').innerHTML = escH(result.html);
        document.getElementById('htmlPreview').innerHTML = result.html;
        document.getElementById('htmlCodeBlock').textContent = result.html;
        document.getElementById('htmlSection').style.display = 'block';
        plainResult = result.plain;
    } else {
        document.getElementById('outputText').textContent = result.plain || result;
        document.getElementById('htmlSection').style.display = 'none';
        plainResult = result.plain || result;
    }

    // Stats
    var words = plainResult.trim().split(/\s+/).length;
    var chars = plainResult.length;
    var sentences = plainResult.split(/[.!?]+/).filter(function(s) { return s.trim(); }).length;
    var paras = plainResult.split(/\n\n+/).filter(function(p) { return p.trim(); }).length;

    document.getElementById('sWords').textContent = words;
    document.getElementById('sChars').textContent = chars;
    document.getElementById('sSentences').textContent = sentences;
    document.getElementById('sParas').textContent = paras;

    document.getElementById('resultArea').style.display = 'block';
}

// Generate paragraphs
function genParagraphs(count, startLorem, html) {
    var paras = [];
    for (var i = 0; i < count; i++) {
        var sentCount = randInt(4, 8);
        var para = '';
        for (var j = 0; j < sentCount; j++) {
            if (i === 0 && j === 0 && startLorem) {
                para += FIRST_LINE + ' ';
            } else {
                para += makeSentence() + ' ';
            }
        }
        paras.push(para.trim());
    }

    var plain = paras.join('\n\n');
    if (html) {
        var htmlStr = paras.map(function(p) { return '<p>' + p + '</p>'; }).join('\n');
        return { plain: plain, html: htmlStr };
    }
    return { plain: plain };
}

// Generate sentences
function genSentences(count, startLorem, html) {
    var sents = [];
    for (var i = 0; i < count; i++) {
        if (i === 0 && startLorem) {
            sents.push(FIRST_LINE);
        } else {
            sents.push(makeSentence());
        }
    }

    var plain = sents.join(' ');
    if (html) {
        return { plain: plain, html: '<p>' + plain + '</p>' };
    }
    return { plain: plain };
}

// Generate words
function genWords(count, startLorem, html) {
    var words = [];
    if (startLorem) {
        var loremStart = 'lorem ipsum dolor sit amet'.split(' ');
        for (var i = 0; i < Math.min(count, loremStart.length); i++) {
            words.push(loremStart[i]);
        }
    }

    while (words.length < count) {
        words.push(randWord());
    }

    // Capitalize first word
    words[0] = capitalize(words[0]);

    var plain = words.join(' ') + '.';
    if (html) {
        return { plain: plain, html: '<p>' + plain + '</p>' };
    }
    return { plain: plain };
}

// Generate list
function genList(count, startLorem, html) {
    var items = [];
    for (var i = 0; i < count; i++) {
        if (i === 0 && startLorem) {
            items.push(FIRST_LINE);
        } else {
            items.push(makeSentence());
        }
    }

    var plain = items.map(function(item, idx) {
        return (idx + 1) + '. ' + item;
    }).join('\n');

    if (html) {
        var htmlStr = '<ul>\n';
        for (var i = 0; i < items.length; i++) {
            htmlStr += '  <li>' + items[i] + '</li>\n';
        }
        htmlStr += '</ul>';
        return { plain: plain, html: htmlStr };
    }
    return { plain: plain };
}

// Make a random sentence
function makeSentence() {
    var len = randInt(6, 15);
    var words = [];
    for (var i = 0; i < len; i++) {
        words.push(randWord());
    }
    words[0] = capitalize(words[0]);

    // Add comma sometimes
    if (len > 8) {
        var commaPos = randInt(3, len - 3);
        words[commaPos] = words[commaPos] + ',';
    }

    return words.join(' ') + '.';
}

// Random word from bank
function randWord() {
    return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

// Capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Random integer
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get active type
function getActiveType() {
    var active = document.querySelector('.type-btn.on');
    return active ? active.getAttribute('data-type') : 'paragraphs';
}

// Set type
function setType(type, el) {
    document.querySelectorAll('.type-btn').forEach(function(b) { b.classList.remove('on'); });
    el.classList.add('on');

    // Update label
    var labels = {
        paragraphs: 'Number of Paragraphs',
        sentences: 'Number of Sentences',
        words: 'Number of Words',
        list: 'Number of List Items'
    };
    document.getElementById('countLabel').textContent = labels[type] || 'Count';

    // Update default count
    var defaults = { paragraphs: 5, sentences: 10, words: 50, list: 8 };
    document.getElementById('countInput').value = defaults[type] || 5;
}

// Quick count buttons
function setCount(val) {
    document.getElementById('countInput').value = val;
}

// Copy text
function copyText() {
    var text = document.getElementById('outputText').textContent || document.getElementById('outputText').innerText;
    if (!text) return;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() { alert('Text copied! (' + text.split(/\s+/).length + ' words)'); });
    } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Copied!');
    }
}

// Copy HTML
function copyHTML() {
    var html = document.getElementById('htmlCodeBlock').textContent;
    if (!html) return;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(html).then(function() { alert('HTML copied!'); });
    } else { prompt('Copy:', html); }
}

// Download text
function downloadText() {
    var text = document.getElementById('outputText').textContent || document.getElementById('outputText').innerText;
    if (!text) return;
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    dlBlob(blob, 'lorem-ipsum.txt');
}

// Download HTML
function downloadHTML() {
    var html = document.getElementById('htmlCodeBlock').textContent;
    if (!html) return;
    var full = '<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8"><title>Lorem Ipsum</title></head>\n<body>\n' + html + '\n</body>\n</html>';
    var blob = new Blob([full], { type: 'text/html;charset=utf-8' });
    dlBlob(blob, 'lorem-ipsum.html');
}

function dlBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
}

// Escape HTML for display
function escH(s) {
    return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
}

// Helpers
function showE(m) {
    var el = document.getElementById('em'), t = document.getElementById('et');
    if (el && t) { t.textContent = m; el.style.display = 'block'; }
    setTimeout(hideE, 6000);
}
function hideE() {
    var el = document.getElementById('em');
    if (el) el.style.display = 'none';
}

console.log('Lorem Ipsum Generator loaded');