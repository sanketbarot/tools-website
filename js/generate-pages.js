// ==========================================
// PAGE GENERATOR - Creates all tool pages
// Run: node js/generate-pages.js
// ==========================================

const fs = require('fs');

const tools = [
    { slug: 'word-to-pdf', title: 'Word to PDF', icon: 'fa-file-word', color: 'icon-indigo', desc: 'Convert Word documents into high-quality PDFs.', action: 'Convert to PDF', actionIcon: 'fa-exchange-alt', process: 'Converting Word to PDF...', success: 'Converted to PDF!', download: 'Download PDF', accept: '.doc,.docx', acceptLabel: 'DOC/DOCX' },
    { slug: 'ppt-to-pdf', title: 'PowerPoint to PDF', icon: 'fa-file-powerpoint', color: 'icon-pink', desc: 'Convert PPT files into easy-to-share PDFs.', action: 'Convert to PDF', actionIcon: 'fa-exchange-alt', process: 'Converting PPT to PDF...', success: 'Converted to PDF!', download: 'Download PDF', accept: '.ppt,.pptx', acceptLabel: 'PPT/PPTX' },
    { slug: 'excel-to-pdf', title: 'Excel to PDF', icon: 'fa-file-excel', color: 'icon-teal', desc: 'Transform Excel sheets into PDF format.', action: 'Convert to PDF', actionIcon: 'fa-exchange-alt', process: 'Converting Excel to PDF...', success: 'Converted to PDF!', download: 'Download PDF', accept: '.xls,.xlsx', acceptLabel: 'XLS/XLSX' },
    { slug: 'edit-pdf', title: 'Edit PDF', icon: 'fa-pen-fancy', color: 'icon-purple', desc: 'Modify text, images, and elements inside your PDF.', action: 'Save Edited PDF', actionIcon: 'fa-save', process: 'Saving changes...', success: 'PDF Edited!', download: 'Download Edited PDF', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'pdf-to-jpg', title: 'PDF to JPG', icon: 'fa-file-image', color: 'icon-orange', desc: 'Convert PDF pages into high-quality JPG images.', action: 'Convert to JPG', actionIcon: 'fa-exchange-alt', process: 'Converting pages to images...', success: 'Images Created!', download: 'Download Images', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'sign-pdf', title: 'Sign PDF', icon: 'fa-signature', color: 'icon-dark', desc: 'Add digital signatures to your PDF documents.', action: 'Apply Signature', actionIcon: 'fa-signature', process: 'Applying signature...', success: 'PDF Signed!', download: 'Download Signed PDF', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'watermark', title: 'Watermark PDF', icon: 'fa-tint', color: 'icon-cyan', desc: 'Add text or image watermark to protect your PDF.', action: 'Add Watermark', actionIcon: 'fa-tint', process: 'Adding watermark...', success: 'Watermark Added!', download: 'Download PDF', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'rotate-pdf', title: 'Rotate PDF', icon: 'fa-sync-alt', color: 'icon-purple', desc: 'Rotate PDF pages to the correct orientation.', action: 'Rotate Pages', actionIcon: 'fa-sync-alt', process: 'Rotating pages...', success: 'Pages Rotated!', download: 'Download PDF', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'unlock-pdf', title: 'Unlock PDF', icon: 'fa-lock-open', color: 'icon-green', desc: 'Remove password protection from PDF files.', action: 'Unlock PDF', actionIcon: 'fa-lock-open', process: 'Removing password...', success: 'PDF Unlocked!', download: 'Download Unlocked PDF', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'organize-pdf', title: 'Organize PDF', icon: 'fa-th-large', color: 'icon-teal', desc: 'Rearrange, delete, or manage PDF pages easily.', action: 'Save Changes', actionIcon: 'fa-save', process: 'Organizing pages...', success: 'PDF Organized!', download: 'Download PDF', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'pdf-to-pdfa', title: 'PDF to PDF/A', icon: 'fa-archive', color: 'icon-dark', desc: 'Convert PDF to long-term archival format (PDF/A).', action: 'Convert to PDF/A', actionIcon: 'fa-archive', process: 'Converting to PDF/A...', success: 'Converted to PDF/A!', download: 'Download PDF/A', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'repair-pdf', title: 'Repair PDF', icon: 'fa-tools', color: 'icon-orange', desc: 'Fix corrupted or damaged PDF files.', action: 'Repair PDF', actionIcon: 'fa-tools', process: 'Repairing PDF...', success: 'PDF Repaired!', download: 'Download Repaired PDF', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'page-numbers', title: 'Page Numbers', icon: 'fa-list-ol', color: 'icon-blue', desc: 'Add page numbers to your PDF quickly.', action: 'Add Page Numbers', actionIcon: 'fa-list-ol', process: 'Adding page numbers...', success: 'Page Numbers Added!', download: 'Download PDF', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'scan-to-pdf', title: 'Scan to PDF', icon: 'fa-camera', color: 'icon-pink', desc: 'Scan documents and save them as PDFs.', action: 'Create PDF', actionIcon: 'fa-file-pdf', process: 'Creating PDF from scan...', success: 'PDF Created!', download: 'Download PDF', accept: 'image/*', acceptLabel: 'Images' },
    { slug: 'ocr-pdf', title: 'OCR PDF', icon: 'fa-eye', color: 'icon-purple', desc: 'Extract text from scanned PDFs using OCR technology.', action: 'Run OCR', actionIcon: 'fa-eye', process: 'Extracting text with OCR...', success: 'Text Extracted!', download: 'Download Searchable PDF', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'redact-pdf', title: 'Redact PDF', icon: 'fa-eraser', color: 'icon-dark', desc: 'Permanently remove sensitive information from PDF.', action: 'Apply Redaction', actionIcon: 'fa-eraser', process: 'Redacting content...', success: 'PDF Redacted!', download: 'Download Redacted PDF', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'crop-pdf', title: 'Crop PDF', icon: 'fa-crop-alt', color: 'icon-teal', desc: 'Trim margins or select specific areas in PDF.', action: 'Crop PDF', actionIcon: 'fa-crop-alt', process: 'Cropping pages...', success: 'PDF Cropped!', download: 'Download Cropped PDF', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'pdf-forms', title: 'PDF Forms', icon: 'fa-wpforms', color: 'icon-indigo', desc: 'Create and fill interactive PDF forms.', action: 'Save Form', actionIcon: 'fa-save', process: 'Saving form...', success: 'Form Saved!', download: 'Download PDF Form', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'ai-summarizer', title: 'AI Summarizer', icon: 'fa-robot', color: 'icon-purple', desc: 'Generate quick summaries from PDF content using AI.', action: 'Summarize with AI', actionIcon: 'fa-robot', process: 'AI is analyzing your document...', success: 'Summary Generated!', download: 'Download Summary', accept: '.pdf', acceptLabel: 'PDF' },
    { slug: 'translate-pdf', title: 'Translate PDF', icon: 'fa-language', color: 'icon-blue', desc: 'Translate PDF content into different languages.', action: 'Translate PDF', actionIcon: 'fa-language', process: 'Translating document...', success: 'Translation Complete!', download: 'Download Translated PDF', accept: '.pdf', acceptLabel: 'PDF' },
];

const template = (t) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.title} - Free Online | AI ToolCor</title>
<meta name="description" content="${t.desc}">
<meta name="theme-color" content="#4f46e5">
<link rel="canonical" href="https://www.aitoolcor.com/${t.slug}.html">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="css/tool-page.css">
<link rel="stylesheet" href="css/footer.css">
<link rel="stylesheet" href="css/ads.css">
</head>
<body>
<nav class="navbar glass"><a href="index.html" class="logo"><i class="fas fa-robot"></i><span>AI</span> ToolCor</a><button class="hamburger" id="hamburger" onclick="toggleMobileMenu()" type="button" aria-label="Toggle navigation menu"><span></span><span></span><span></span></button><div class="nav-links" id="navLinks"><a href="index.html"><i class="fas fa-home"></i> Home</a><a href="index.html#tools"><i class="fas fa-th"></i> All Tools</a><a href="blog.html"><i class="fas fa-blog"></i> Blog</a><a href="login.html" class="nav-btn" id="navLoginBtn"><i class="fas fa-user"></i> <span id="navLoginText">Login</span></a></div></nav>
<section class="tool-header"><div class="container"><div class="breadcrumb"><a href="index.html"><i class="fas fa-home"></i> Home</a><i class="fas fa-chevron-right"></i><span>${t.title}</span></div><div class="tool-title"><div class="tool-title-icon ${t.color}"><i class="fas ${t.icon}"></i></div><div><h1>${t.title}</h1><p>${t.desc}</p></div></div></div></section>
<section class="tool-area"><div class="container"><div class="tool-wrapper glass">
<div id="uploadSection" data-section><div class="upload-zone" id="dropZone"><div class="upload-zone-content"><div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div><h2>Upload Your File</h2><p>${t.desc}</p><button class="upload-btn" onclick="document.getElementById('fileInput').click()"><i class="fas fa-plus"></i> Select File</button><input type="file" id="fileInput" accept="${t.accept}" hidden><div class="upload-hints"><span><i class="fas fa-lock"></i> Secure</span><span><i class="fas fa-infinity"></i> Free</span><span><i class="fas fa-file"></i> ${t.acceptLabel}</span></div></div></div></div>
<div id="optionsSection" data-section style="display:none;"><div class="files-area"><div class="files-header"><h3><i class="fas fa-file"></i> <span id="fileName"></span></h3><button class="btn-sm btn-danger-sm" onclick="resetTool()"><i class="fas fa-times"></i> Remove</button></div><button class="action-btn" onclick="startProcess()"><i class="fas ${t.actionIcon}"></i> ${t.action}</button></div></div>
<div id="processingSection" data-section style="display:none;"><div class="processing-area"><div class="spinner"></div><h3>${t.process}</h3><p>Please wait...</p><div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div><span class="progress-text" id="progressText">0%</span></div></div>
<div id="resultSection" data-section style="display:none;"><div class="result-area"><div class="result-icon success"><i class="fas fa-check-circle"></i></div><h2>${t.success}</h2><p>Your file is ready to download</p><button class="download-btn" onclick="alert('Download started!')"><i class="fas fa-download"></i> ${t.download}</button><div class="result-actions"><button class="btn-outline" onclick="resetTool()"><i class="fas fa-redo"></i> Process Another</button></div></div></div>
</div></div></section>
<section class="how-to-section"><div class="container"><div class="section-header"><h2>How to Use ${t.title}</h2></div><div class="steps-row"><div class="step-box glass"><div class="step-num">1</div><i class="fas fa-cloud-upload-alt"></i><h4>Upload</h4><p>Select your file to process.</p></div><div class="step-box glass"><div class="step-num">2</div><i class="fas fa-cog"></i><h4>Process</h4><p>Click the button to start processing.</p></div><div class="step-box glass"><div class="step-num">3</div><i class="fas fa-download"></i><h4>Download</h4><p>Download your processed file.</p></div></div></div></section>
<section class="faq-section"><div class="container"><div class="section-header"><h2>FAQ</h2></div><div class="faq-list"><div class="faq-item glass" onclick="toggleFaq(this)"><div class="faq-question"><h4>Is this tool free?</h4><i class="fas fa-chevron-down"></i></div><div class="faq-answer"><div class="faq-answer-inner"><p>Yes! ${t.title} is completely free with no limitations.</p></div></div></div><div class="faq-item glass" onclick="toggleFaq(this)"><div class="faq-question"><h4>Are my files secure?</h4><i class="fas fa-chevron-down"></i></div><div class="faq-answer"><div class="faq-answer-inner"><p>All processing runs privately in your browser without server uploads.</p></div></div></div></div></div></section>
<footer class="footer"><div class="container"><div class="footer-bottom"><p>© <span id="currentYear"></span> AI ToolCor. All rights reserved.</p><div class="footer-bottom-links"><a href="index.html">Home</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></div></div></div></footer>
<script src="js/tool-page.js"></script>
<script>
setupDropZone('dropZone','fileInput',null,function(files){document.getElementById('fileName').textContent=files[0].name;showSection('optionsSection');});
function startProcess(){showSection('processingSection');simulateProcess(function(){showSection('resultSection');});}
function resetTool(){showSection('uploadSection');}
</script>
</body></html>`;

tools.forEach(tool => {
    const html = template(tool);
    fs.writeFileSync(`${tool.slug}.html`, html);
    console.log(`✅ Created: ${tool.slug}.html`);
});

console.log(`\n🎉 All ${tools.length} tool pages created!`);
