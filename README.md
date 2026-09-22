# Iglesia Evangélica de los Peregrinos del Perú

Sitio web estático de la IEPP: historia, confesión de fe, organización, noticias y directorio de sedes.

## Publicación actual

La web se aloja en **GitHub Pages**, en **https://iepp.velifatech.com**.

- Repositorio: `Hector295/iepp-web`.
- Rama de publicación: `main`.
- GitHub → Settings → Pages → Source: **GitHub Actions**.
- Custom domain: **iepp.velifatech.com**.
- DNS: `iepp.velifatech.com CNAME hector295.github.io`.
- HTTPS activado en GitHub Pages.

El flujo `.github/workflows/deploy-pages.yml` comprueba los tipos, genera `out/`, valida el sitio estático y lo publica con cada push a `main`. También comprueba que Pages conserve el dominio `iepp.velifatech.com` antes de desplegar.

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

## Documentación

- [Plan pendiente de migración a iepp.pe](MIGRACION-IEPP-PE.md): solo documentación; no modifica el alojamiento actual ni los DNS.
- [Contenido institucional y fuentes](CONTENIDO.md).
