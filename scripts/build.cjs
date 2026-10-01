const fs = require('node:fs');
const path = require('node:path');
const nunjucks = require('nunjucks');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src');
const site = JSON.parse(fs.readFileSync(path.join(source, 'data/site.json'), 'utf8'));
const publications = JSON.parse(fs.readFileSync(path.join(source, 'data/publications.json'), 'utf8'));
publications.searchUrl = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(publications.query)}&sort=date`;
const publicationYears = [...new Set(publications.articles.map(article => article.year))]
  .sort((a, b) => b - a)
  .map(year => ({ year, articles: publications.articles.filter(article => article.year === year) }));
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(source), {
  autoescape: true,
  throwOnUndefined: true,
  noCache: true
});
const check = process.argv.includes('--check');
const pages = fs.readdirSync(path.join(source, 'pages')).filter(name => name.endsWith('.njk')).sort();

// Render every page before writing anything, so a template error cannot cause a partial build.
const rendered = pages.map(template => {
  const slug = path.basename(template, '.njk');
  const filename = `${slug}.html`;
  const activeHref = slug.startsWith('root-health-') ? 'data.html' : filename;
  const html = env.render(`pages/${template}`, {
    site,
    publications,
    publicationYears,
    page: {
      filename,
      activeHref,
      contactHref: slug === 'index' ? '#contact' : 'index.html#contact'
    }
  });
  return { filename, html };
});

let stale = false;
for (const { filename, html } of rendered) {
  const target = path.join(root, filename);
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== html) {
      console.error(`Out of date: ${filename}. Run npm run build.`);
      stale = true;
    }
  } else {
    fs.writeFileSync(target, html, 'utf8');
  }
}
if (stale) process.exitCode = 1;
else console.log(`${check ? 'Checked' : 'Built'} ${rendered.length} HTML pages.`);
