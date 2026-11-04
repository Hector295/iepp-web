# Iglesia Evangélica de los Peregrinos del Perú

Sitio web estático de la IEPP: historia, confesión de fe, organización, noticias y directorio de sedes.

## Publicación

La web está desplegada en **GitHub Pages** y los DNS de **iepp.pe** ya apuntan a GitHub. Falta emitir el certificado y activar HTTPS; consulta el estado y los pasos pendientes en [MIGRACION-IEPP-PE.md](MIGRACION-IEPP-PE.md).

- Repositorio: `Hector295/iepp-web`.
- Rama de publicación: `main`.
- GitHub → Settings → Pages → Source: **GitHub Actions**.
- Custom domain: **iepp.pe**.
- DNS administrados en cPanel; registros web y de correo detallados en el documento de migración.
- HTTPS: pendiente de emisión del certificado de `iepp.pe` y activación de su exigencia.

El flujo `.github/workflows/deploy-pages.yml` comprueba los tipos, genera `out/`, valida el sitio estático y lo publica con cada push a `main`. También comprueba que Pages tenga configurado el dominio `iepp.pe` antes de desplegar.

Astro y `public/CNAME` usan ese dominio. No se añade el prefijo `/iepp-web` a las rutas. Los metadatos, sitemap y robots corresponden al dominio actual; el correo institucional continúa siendo `iglesiadelosperegrinos@iepp.pe`.

## Desarrollo y comprobaciones

Se requiere Node.js 24, indicado en `.nvmrc`.

```sh
npm ci --ignore-scripts
npm run check
npm run build
npm run preview
```

Para desarrollar con recarga automática, usa `npm run dev`. La salida de producción se genera en `out/`.

## Sedes

Cada sede tiene su página en `/sedes/<slug>`, generada desde `src/data/sedes.json` (dirección, coordenadas, encargados, resumen, horarios, teléfono y Facebook). Las fotos, hasta 20 por sede, se copian en `src/assets/sedes/<slug>/` y se optimizan al construir; ver [src/assets/sedes/LEEME.md](src/assets/sedes/LEEME.md). El sitemap se genera automáticamente.

## Documentación

- [Migración a iepp.pe](MIGRACION-IEPP-PE.md): estado, DNS, correo y publicación.
- [Contenido institucional y fuentes](CONTENIDO.md).
