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
console.log('OK: sintaxis JavaScript, assets locales, anclas, rutas en raíz y CNAME.');
