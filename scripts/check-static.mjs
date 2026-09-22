import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { Script } from 'node:vm';

const source = new URL('../out/', import.meta.url);
const origin = 'https://iepp.velifatech.com/';

// Descubrir todas las páginas publicadas (salida en formato directorio de Astro: cada ruta es un index.html).
async function findPages(dir = '') {
  const entries = await readdir(new URL(dir, source), { withFileTypes: true });
  const pages = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const relative = `${dir}${entry.name}`;
    if (entry.isDirectory()) pages.push(...(await findPages(`${relative}/`)));
    else if (entry.name === 'index.html') pages.push(relative);
  }
  return pages;
}
const pageFiles = (await findPages()).sort();
assert.ok(pageFiles.length > 0, 'No se encontró ninguna página publicada en out/.');

const fileToUrl = file => {
  const dir = file.slice(0, -'index.html'.length).replace(/\/$/, '');
  return dir ? new URL(dir, origin).href : origin;
};

const pageData = new Map();
for (const file of pageFiles) {
  const html = await readFile(new URL(file, source), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `IDs HTML duplicados en ${file}.`);
  pageData.set(file, { html, ids: new Set(ids), url: fileToUrl(file) });
}

assert.equal((await readFile(new URL('CNAME', source), 'utf8')).trim(), 'iepp.velifatech.com', 'El dominio de publicación debe ser iepp.velifatech.com.');
await stat(new URL('.nojekyll', source));

// GitHub Pages necesita archivos HTML reales para conservar las URLs antiguas.
const legacyRoutes = {
  'inicio.html': '/',
  'nosotros.html': '/#identidad',
  'nosotros/nuestra_historia.html': '/historia',
  'nosotros/confesiondefe.html': '/confesion-de-fe',
  'organizacion.html': '/organizacion',
  'contacto.html': '/#contacto',
};
for (const [file, destination] of Object.entries(legacyRoutes)) {
  const html = await readFile(new URL(file, source), 'utf8');
  const target = new URL(destination, origin);
  assert.ok(html.includes(`<meta http-equiv="refresh" content="0;url=${target.href}">`), `Redirección HTML ausente (${file}).`);
  assert.ok(html.includes(`<link rel="canonical" href="${target.href}">`), `Canonical incorrecta en redirección (${file}).`);
  assert.ok(html.includes(`<a href="${target.href}">`), `Falta un enlace alternativo en redirección (${file}).`);
  assert.equal(target.origin, new URL(origin).origin, 'Redirección fuera del dominio oficial.');
  const targetPath = decodeURIComponent(target.pathname).replace(/^\/+/, '').replace(/\/+$/, '');
  const targetFile = targetPath ? `${targetPath}/index.html` : 'index.html';
  assert.ok(pageData.has(targetFile), `Redirección a una página inexistente: ${target.href}`);
  if (target.hash) assert.ok(pageData.get(targetFile).ids.has(decodeURIComponent(target.hash.slice(1))), `Sección de destino inexistente: ${target.hash}`);
}

async function checkReference(value, base, file) {
  if (/^(?:https?:|data:|mailto:|tel:|\/\/)/i.test(value)) return;
  const target = new URL(value.replaceAll('&amp;', '&'), base);
  if (target.origin !== new URL(origin).origin) return;
  const rawPath = decodeURIComponent(target.pathname).replace(/^\/+/, '') || 'index.html';
  assert.ok(!rawPath.startsWith('iepp-web/'), `Ruta con prefijo de repositorio: ${value} (${file})`);
  const asPage = pageData.has(rawPath) ? rawPath : `${rawPath.replace(/\/$/, '')}/index.html`;
  if (pageData.has(asPage)) {
    if (target.hash) assert.ok(pageData.get(asPage).ids.has(decodeURIComponent(target.hash.slice(1))), `Ancla inexistente: ${value} (${file})`);
    return;
  }
  let fileStat;
  try { fileStat = await stat(new URL(rawPath, source)); } catch { /* se reporta abajo */ }
  assert.ok(fileStat?.isFile(), `Archivo inexistente: ${value} (${file})`);
}

for (const [file, { html, url }] of pageData) {
  assert.ok(!/<base\b/i.test(html), `No se debe añadir un prefijo de repositorio a las rutas (${file}).`);
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`), `Canonical incorrecta (${file}).`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `Debe haber un único título principal (${file}).`);
  const currentLinks = [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
  assert.equal(currentLinks.length, 1, `Debe identificarse una sola página activa en la cabecera (${file}).`);
  assert.equal(new URL(currentLinks[0][0].match(/href="([^"]+)"/)[1], origin).href, url, `El enlace activo debe corresponder a la página actual (${file}).`);

  for (const key of ['description', 'robots', 'og:title', 'og:description', 'og:url', 'og:image', 'twitter:card']) {
    const content = html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]+)"`))?.[1];
    assert.ok(content, `Falta el metadato ${key} (${file}).`);
    if (key === 'robots') assert.ok(!/noindex|nofollow/.test(content), `La página debe permitir indexación (${file}).`);
    if (key === 'og:url') assert.equal(content, url, `og:url debe ser la URL propia de la página (${file}).`);
    if (key === 'og:image') {
      const image = new URL(content);
      assert.equal(image.origin, new URL(origin).origin);
      await stat(new URL(image.pathname.slice(1), source));
    }
  }

  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] || 'null');
  assert.equal(schema?.['@context'], 'https://schema.org', `Falta JSON-LD (${file}).`);
  assert.equal(schema['@graph'].find(item => item['@type'] === 'Organization')?.url, origin, `Falta schema Organization (${file}).`);
  assert.equal(schema['@graph'].find(item => item['@type'] === 'WebSite')?.url, origin, `Falta schema WebSite (${file}).`);
  assert.equal(schema['@graph'].find(item => item['@type'] === 'WebPage')?.url, url, `El schema WebPage debe usar la URL propia de la página (${file}).`);
  const organization = schema['@graph'].find(item => item['@type'] === 'Organization');
  assert.ok(html.includes(`mailto:${organization.email}`), `El correo de schema debe coincidir con el contacto visible (${file}).`);
  assert.ok(html.includes(`tel:${organization.telephone}`), `El teléfono de schema debe coincidir con el contacto visible (${file}).`);
  assert.equal(organization.address.streetAddress, 'Ca. La Florida 678, Urb. San Eduardo');
  assert.ok(!/Contenido de muestra|news-preview-note/.test(html), `No publicar noticias ficticias (${file}).`);

  for (const match of html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)) await checkReference(match[1], url, file);
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!/\b(?:src|type)=/.test(match[1])) new Script(match[2], { filename: `${file} (script)` });
  }
}

// Contenido institucional propio de cada página.
const home = pageData.get('index.html')?.html ?? '';
const confesion = pageData.get('confesion-de-fe/index.html')?.html ?? '';
const organizacion = pageData.get('organizacion/index.html')?.html ?? '';
const noticias = pageData.get('noticias/index.html')?.html ?? '';
assert.ok(pageData.has('historia/index.html'), 'Falta la página /historia.');
assert.ok(pageData.has('confesion-de-fe/index.html'), 'Falta la página /confesion-de-fe.');
assert.ok(pageData.has('organizacion/index.html'), 'Falta la página /organizacion.');
assert.ok(pageData.has('noticias/index.html'), 'Falta la página /noticias.');
for (const text of ['Visión', 'Misión']) {
  assert.ok(home.includes(text), `Falta contenido institucional en la portada: ${text}.`);
}
const officialAddress = 'Ca. La Florida 678, Urb. San Eduardo';
assert.ok(home.includes(`<address>${officialAddress}</address>`), 'La sede nacional del directorio debe coincidir con la dirección oficial en la portada.');
for (const text of ['José Iván Rojas de la Cruz', 'Presbiterios', 'USJEPEP', 'USFEMIEP', 'Consejo Ministerial', 'Diaconía']) {
  assert.ok(organizacion.includes(text), `Falta contenido institucional en /organizacion: ${text}.`);
}
assert.equal((confesion.match(/class="faith-article"/g) || []).length, 18, 'Conservar los 18 artículos de fe en /confesion-de-fe.');
assert.equal((confesion.match(/<h2 id="articulo-\d+"/g) || []).length, 18, 'Los 18 artículos deben tener un destino de lectura completa.');
for (let article = 1; article <= 18; article++) {
  assert.equal((confesion.match(new RegExp(`href="#articulo-${article}"`, 'g')) || []).length, 2, `El índice y la tarjeta deben enlazar al artículo ${article}.`);
}
assert.ok(!/sepultado”|santos\)/.test(confesion), 'No reintroducir los signos de puntuación sueltos.');
assert.ok(noticias.includes('facebook.com/Iglesia.de.los.Peregrinos'), 'Falta el enlace a Facebook en /noticias.');

const allVideoSources = [...pageData.values()]
  .flatMap(({ html }) => [...html.matchAll(/<source src="([^"]+)" type="video\/mp4"/g)].map(match => match[1]))
  .sort();
assert.deepEqual(allVideoSources, ['/assets/jesus-peregrino-scroll.mp4'], 'El video de historia debe conservarse; el hero ahora usa el carrusel de fotos.');
assert.equal((home.match(/class="hero-slide/g) || []).length, 12, 'El carrusel del hero debe mostrar las 12 fotos de la comunidad.');

const robots = await readFile(new URL('robots.txt', source), 'utf8');
assert.ok(robots.includes(`Sitemap: ${origin}sitemap.xml`), 'Sitemap ausente de robots.txt.');
assert.ok(!/^Disallow:\s*\/\s*$/m.test(robots), 'robots.txt bloquea el sitio.');
const sitemap = await readFile(new URL('sitemap.xml', source), 'utf8');
const sitemapLocs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]).sort();
const expectedLocs = [...pageData.values()].map(page => page.url).sort();
assert.deepEqual(sitemapLocs, expectedLocs, 'El sitemap debe listar exactamente las páginas publicadas, sin anclas ni prefijo de repositorio.');

async function checkDirectory(relative = '') {
  for (const entry of await readdir(new URL(relative, source), { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const name = `${relative}${entry.name}`;
    assert.ok(!entry.isSymbolicLink(), `El paquete estático no debe contener enlaces simbólicos: ${name}`);
    if (entry.isDirectory()) await checkDirectory(`${name}/`);
    else if (entry.name.endsWith('.js')) new Script(await readFile(new URL(name, source), 'utf8'), { filename: name });
    else if (entry.name.endsWith('.css')) {
      const css = await readFile(new URL(name, source), 'utf8');
      for (const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
        if (!match[1].startsWith('#')) await checkReference(match[1], new URL(name, origin), name);
      }
    }
  }
}
await checkDirectory();
console.log(`OK: ${pageFiles.length} páginas, JavaScript, assets, anclas, rutas, metadatos SEO, JSON-LD, robots y sitemap para iepp.velifatech.com.`);
