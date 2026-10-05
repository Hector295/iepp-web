import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import data from '../data/sedes.json';
import peru from '../data/peru.json';

export interface Encargado { nombre: string; cargo: string }
export interface Sede {
  id: number;
  slug: string;
  name: string;
  region: string;
  department: string;
  city: string;
  address: string;
  lat: number | null;
  lng: number | null;
  precision: string;
  encargados: Encargado[];
  resumen: string;
  horarios: string[];
  telefono: string;
  facebook: string;
  source: string;
}

export const sedes = data as Sede[];
export const regions = ['Norte', 'Sur', 'Nor Oriente', 'Oriente', 'Nor Andina', 'Ucayali'];
export const MAX_FOTOS = 20;

export const hasPin = (sede: Sede) => sede.lat !== null && sede.lng !== null;
export const isApprox = (sede: Sede) => sede.precision === 'APROX_LOCALIDAD' || sede.precision === 'APROX_DISTRITO';

// Explicación en lenguaje sencillo de qué tan exacto es el punto del mapa.
export function precisionNote(sede: Sede) {
  if (!hasPin(sede)) return 'Todavía no tenemos esta iglesia ubicada en el mapa. Usa la dirección o comunícate con la sede nacional.';
  if (sede.precision === 'APROX_DISTRITO') return 'El punto del mapa marca el distrito, no la puerta de la iglesia. Pregunta por la dirección al llegar.';
  if (sede.precision === 'APROX_LOCALIDAD') return 'El punto del mapa marca la localidad, no la puerta exacta de la iglesia.';
  return '';
}

export function directionsUrl(sede: Sede) {
  const destination = hasPin(sede)
    ? `${sede.lat!.toFixed(6)},${sede.lng!.toFixed(6)}`
    : [sede.address, sede.city, sede.department, 'Perú'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

// Las fotos se colocan en src/assets/sedes/<slug>/ y se optimizan al construir el sitio.
const photoFiles = import.meta.glob<{ default: ImageMetadata }>('/src/assets/sedes/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true });
const slugs = new Set(sedes.map(sede => sede.slug));
const photosBySlug = new Map<string, { file: string; image: ImageMetadata }[]>();
for (const [path, module] of Object.entries(photoFiles)) {
  const [, slug, file] = path.match(/\/src\/assets\/sedes\/([^/]+)\/([^/]+)$/)!;
  if (!slugs.has(slug)) throw new Error(`La carpeta de fotos "src/assets/sedes/${slug}" no corresponde a ninguna sede. Revisa el nombre en src/data/sedes.json.`);
  photosBySlug.set(slug, [...(photosBySlug.get(slug) ?? []), { file, image: module.default }]);
}
for (const [slug, list] of photosBySlug) {
  if (list.length > MAX_FOTOS) throw new Error(`La sede "${slug}" tiene ${list.length} fotos; el máximo es ${MAX_FOTOS}.`);
  list.sort((a, b) => a.file.localeCompare(b.file, 'es', { numeric: true }));
}

export interface Foto { thumb: string; full: string; width: number; height: number }
export async function fotos(slug: string): Promise<Foto[]> {
  return Promise.all((photosBySlug.get(slug) ?? []).map(async ({ image }) => {
    const [thumb, full] = await Promise.all([
      getImage({ src: image, width: Math.min(image.width, 640), format: 'webp', quality: 72 }),
      getImage({ src: image, width: Math.min(image.width, 1600), format: 'webp', quality: 80 }),
    ]);
    return { thumb: thumb.src, full: full.src, width: full.attributes.width as number, height: full.attributes.height as number };
  }));
}

// Silueta del Perú en SVG para indicar dónde queda cada sede, sin depender de mapas externos.
const [[minLng, minLat], [maxLng, maxLat]] = [[-81.45, -18.4], [-68.6, -0.02]];
export const PERU_WIDTH = 200;
export const PERU_HEIGHT = Math.round(PERU_WIDTH * (maxLat - minLat) / (maxLng - minLng));
export const project = (lat: number, lng: number) => [
  +((lng - minLng) / (maxLng - minLng) * PERU_WIDTH).toFixed(1),
  +((maxLat - lat) / (maxLat - minLat) * PERU_HEIGHT).toFixed(1),
];
export const peruPath = 'M' + (peru.coordinates[0] as number[][]).map(([lng, lat]) => project(lat, lng).join(' ')).join('L') + 'Z';
export const peruGeometry = JSON.stringify(peru);
