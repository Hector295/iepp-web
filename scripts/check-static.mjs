import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { Script } from 'node:vm';

const source = new URL('../out/', import.meta.url);
const origin = 'https://iepp.velifatech.com/';
const html = await readFile(new URL('index.html', source), 'utf8');
assert.equal((await readFile(new URL('CNAME', source), 'utf8')).trim(), 'iepp.velifatech.com');
await stat(new URL('.nojekyll', source));
assert.ok(!/<base\b/i.test(html), 'No se debe añadir un prefijo de repositorio a las rutas.');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'IDs HTML duplicados.');

// Comprobar el HTML publicado, no solo la configuración de Astro.
assert.ok(html.includes(`<link rel="canonical" href="${origin}">`), 'Canonical incorrecta.');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Debe haber un único título principal.');
for (const key of ['description', 'robots', 'og:title', 'og:description', 'og:url', 'og:image', 'twitter:card']) {
  const content = html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]+)"`))?.[1];
  assert.ok(content, `Falta el metadato ${key}.`);
  if (key === 'robots') assert.ok(!/noindex|nofollow/.test(content), 'La página debe permitir indexación.');
  if (key === 'og:url') assert.equal(content, origin);
  if (key === 'og:image') {
    const image = new URL(content);
    assert.equal(image.origin, new URL(origin).origin);
    await stat(new URL(image.pathname.slice(1), source));
  }
}
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] || 'null');
assert.equal(schema?.['@context'], 'https://schema.org');
for (const type of ['Organization', 'WebSite', 'WebPage']) {
  assert.equal(schema['@graph'].find(item => item['@type'] === type)?.url, origin, `Falta schema ${type}.`);
}
const organization = schema['@graph'].find(item => item['@type'] === 'Organization');
assert.ok(html.includes(`mailto:${organization.email}`), 'El correo de schema debe coincidir con el contacto visible.');
assert.ok(html.includes(`tel:${organization.telephone}`), 'El teléfono de schema debe coincidir con el contacto visible.');
assert.ok(/<section\b[^>]*id="noticias"[^>]*data-nosnippet/.test(html), 'Excluir noticias de muestra de los extractos.');
const robots = await readFile(new URL('robots.txt', source), 'utf8');
assert.ok(robots.includes(`Sitemap: ${origin}sitemap.xml`), 'Sitemap ausente de robots.txt.');
assert.ok(!/^Disallow:\s*\/\s*$/m.test(robots), 'robots.txt bloquea el sitio.');
const sitemap = await readFile(new URL('sitemap.xml', source), 'utf8');
assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]), [origin], 'El sitemap debe contener la página real, sin anclas ni prefijo de repositorio.');

async function checkReference(value, base = origin) {
  if (/^(?:https?:|data:|mailto:|tel:|\/\/)/i.test(value)) return;
  const url = new URL(value.replaceAll('&amp;', '&'), base);
  if (url.origin !== new URL(origin).origin) return;
  const path = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
  assert.ok(!path.startsWith('iepp-web/'), `Ruta con prefijo de repositorio: ${value}`);
  assert.ok((await stat(new URL(path, source))).isFile(), `Archivo inexistente: ${path}`);
  if (url.hash && path === 'index.html') assert.ok(ids.includes(decodeURIComponent(url.hash.slice(1))), `Ancla inexistente: ${value}`);
}
for (const match of html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)) await checkReference(match[1]);
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (!/\b(?:src|type)=/.test(match[1])) new Script(match[2], { filename: 'index.html (script)' });
}
async function checkDirectory(relative = '') {
  for (const entry of await readdir(new URL(relative, source), { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const name = `${relative}${entry.name}`;
    assert.ok(!entry.isSymbolicLink(), `GitHub Pages no admite enlaces simbólicos: ${name}`);
    if (entry.isDirectory()) await checkDirectory(`${name}/`);
    else if (entry.name.endsWith('.js')) new Script(await readFile(new URL(name, source), 'utf8'), { filename: name });
    else if (entry.name.endsWith('.css')) {
      const css = await readFile(new URL(name, source), 'utf8');
      for (const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
        if (!match[1].startsWith('#')) await checkReference(match[1], new URL(name, origin));
      }
    }
  }
}
await checkDirectory();
console.log('OK: JavaScript, assets, anclas, rutas, CNAME, metadatos SEO, JSON-LD, robots y sitemap.');
