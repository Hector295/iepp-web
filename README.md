# IEPP · GitHub Pages

Sitio de la Iglesia Evangélica de los Peregrinos del Perú.

- Repositorio indicado: https://github.com/Hector295/iepp-web
- Dominio exclusivo de este proyecto: https://iepp.velifatech.com
- Rama de despliegue: `main`.

## Estado del proyecto

El proyecto utiliza **Astro 7.3.2** con salida estática (`output: 'static'`), Node.js 24 y TypeScript para comprobar los componentes. Conserva HTML, CSS y JavaScript nativo, con Leaflet 1.9.4 y Leaflet.markercluster 1.5.3 incluidos localmente. No usa React, SSR, Server Actions, rutas de API, middleware de servidor ni backend. Las secciones usan anclas, por ejemplo `/#historia` y `/#sedes`, por lo que no necesitan reescrituras ni prefijo de repositorio.

## Estructura

- `src/pages/index.astro`: página principal, composición y metadatos.
- `src/components/`: cabecera, pie, noticias, historia y directorio de sedes.
- `public/styles.css`: estilos conservados del sitio.
- `public/site.js`: menú y comportamiento de los videos.
- `public/locations.js`: búsqueda, filtros y mapa de las 42 sedes.
- `public/assets/`: imágenes, videos, fuentes, datos y bibliotecas locales.
- `public/CNAME` y `public/.nojekyll`: archivos incluidos en cada build.
- `out/`: resultado generado; no editar ni subir a Git.
- `astro.config.mjs`: dominio, salida estática y carpeta de build. No configura `base` ni adaptador de servidor.

`dist/` corresponde a la versión HTML anterior, queda ignorado por Git y ya no se utiliza para generar el sitio. Editar `src/` y `public/` en adelante.

## Desarrollo y build local

Requiere Node.js 24 (ver `.nvmrc`).

```sh
nvm use
npm ci --ignore-scripts
npm run dev
```

Para comprobar y generar el sitio:

```sh
npm run check
npm run build
npm run preview
```

`npm run check` ejecuta `astro check` para validar los componentes y tipos. `npm run build` genera HTML estático en `out/` y después verifica sintaxis JavaScript, assets, anclas y `CNAME`. No había un linter configurado y no se añadió uno. `npm run preview` sirve el resultado en `http://127.0.0.1:4321`. No hace falta ningún servidor Node.js en producción.

Las imágenes y los videos en `public/` se copian sin transformación, conservando su apariencia. Los scripts del mapa y del menú se sirven como archivos estáticos; no se añade React ni hidratación de componentes.

## Activación en GitHub

Hacer estos cambios **solo en Hector295/iepp-web**, nunca en el repositorio que publica `velifatech.com`:

1. Subir los archivos del proyecto, incluidos `.github/workflows/deploy-pages.yml` y los assets, a `main`.
2. En **Settings → Pages → Build and deployment → Source**, seleccionar **GitHub Actions**.
3. En **Custom domain**, guardar `iepp.velifatech.com` antes de crear el DNS. No poner el dominio raíz ni un prefijo de repositorio.
4. Crear el registro DNS indicado abajo.
5. Activar **Enforce HTTPS** cuando GitHub termine de validar el DNS y emitir el certificado.
6. Si el primer workflow falló porque Pages todavía no estaba configurado, ejecutarlo otra vez desde **Actions → Deploy IEPP to GitHub Pages → Run workflow**, rama `main`.

Cada push a `main` ejecuta checkout, Node.js, instalación, comprobación de tipos, build, configuración de Pages, comprobación del dominio, subida del artifact y deploy. También hay ejecución manual. El workflow solo se ejecuta en `Hector295/iepp-web` y se detiene si la configuración de Pages no tiene exactamente `iepp.velifatech.com`. No cambia dominios ni DNS mediante API.

**Dominio persistente:** con un workflow personalizado, la configuración efectiva del dominio está en Settings → Pages; GitHub ignora el archivo `CNAME` para configurar el dominio. Se incluye igualmente en el artifact para conservar la intención de despliegue. El workflow verifica la configuración real antes de publicar y nunca la reemplaza.

## Único registro DNS que se debe crear

En la zona DNS de `velifatech.com`:

| Tipo | Nombre/host | Destino |
| --- | --- | --- |
| CNAME | `iepp` | `hector295.github.io` |

Si el proveedor exige un nombre completo, usar `iepp.velifatech.com`. El destino no lleva `https://`, rutas ni el nombre del repositorio. Conservar todos los registros existentes de `@`, `www` y cualquier otro subdominio. No modificar la configuración del sitio `velifatech.com`.

El propietario se toma de la URL `Hector295/iepp-web` proporcionada por el usuario; se confirmó que la cuenta pública `Hector295` existe. La API pública devolvió 404 para el repositorio y su configuración de Pages, y esta copia local no contiene metadatos Git utilizables. Por eso no se ha podido confirmar si el repositorio es privado ni leer sus ajustes actuales. Para hospedarlo gratuitamente con GitHub Free, el repositorio debe ser público; Pages en repositorios privados requiere un plan compatible.

## Backend

No hay backend ni llamadas a una API en la aplicación actual. No se configura `api-iepp.velifatech.com` ni se añade una URL ficticia. Si se incorpora una API, deberá hospedarse por separado. Su URL pública podrá configurarse como `PUBLIC_API_URL` en Settings → Secrets and variables → Actions → Variables y exponerse en el paso de build mediante `env: PUBLIC_API_URL: ${{ vars.PUBLIC_API_URL }}`. En Astro se leerá con `import.meta.env.PUBLIC_API_URL`. Esa integración aún no existe: no se genera ni se consume una URL de backend. Nunca colocar secretos en variables `PUBLIC_*`, porque son visibles en el navegador.

## Referencias

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

- https://docs.astro.build/en/guides/deploy/github/
