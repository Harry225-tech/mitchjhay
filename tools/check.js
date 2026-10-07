// Simple site checker. Run from the project folder:  node tools/check.js
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.join(__dirname, '..');
const problems = [];
const warnings = [];

const htmlFiles = fs.readdirSync(root).filter(function (f) { return f.endsWith('.html'); });
htmlFiles.forEach(function (file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');

     const refs = html.match(/\s(?:src|href)="([^"]+)"/g) || [];
  refs.forEach(function (ref) {
    const url = ref.slice(ref.indexOf('"') + 1, -1);
    if (/^(https?:|mailto:|tel:|#|data:)/.test(url)) return;
    const clean = url.split('#')[0].split('?')[0];
    if (clean.indexOf('.') === -1 && clean.indexOf('/') === -1) return;
    if (clean && !fs.existsSync(path.join(root, clean))) problems.push(file + ': missing file ' + url);
  });

  const ids = (html.match(/\sid="([^"]+)"/g) || []).map(function (s) { return s.slice(5, -1); });
  const seen = {};
  ids.forEach(function (id) {
    if (seen[id]) problems.push(file + ': duplicate id "' + id + '"');
    seen[id] = true;
  });

  if (/\sstyle="/.test(html)) problems.push(file + ': inline style="" attribute');
  if (/<script(?![^>]*\ssrc=)(?![^>]*application\/ld\+json)[^>]*>/.test(html)) problems.push(file + ': inline <script>');
  if (html.indexOf('YOUR-DOMAIN') !== -1) warnings.push(file + ': still contains YOUR-DOMAIN');
});

const jsDir = path.join(root, 'js');
fs.readdirSync(jsDir).filter(function (f) { return f.endsWith('.js'); }).forEach(function (f) {
  try {
    cp.execFileSync(process.execPath, ['--check', path.join(jsDir, f)], { stdio: 'pipe' });
  } catch (e) {
    problems.push('js/' + f + ': syntax error');
  }
});

warnings.forEach(function (w) { console.log('WARN  ' + w); });
problems.forEach(function (p) { console.log('FAIL  ' + p); });
console.log(problems.length ? '\nFAIL: ' + problems.length + ' problem(s)' : '\nPASS');
process.exit(problems.length ? 1 : 0);   