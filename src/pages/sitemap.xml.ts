import type { APIRoute } from 'astro';
import { sedes } from '../lib/sedes';

// Se genera al construir para incluir automáticamente la página de cada sede.
export const GET: APIRoute = ({ site }) => {
  const paths = ['/', '/historia', '/confesion-de-fe', '/organizacion/', '/noticias', ...sedes.map(sede => `/sedes/${sede.slug}`)];
  const urls = paths.map(path => `  <url>\n    <loc>${new URL(path, site).href}</loc>\n  </url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
