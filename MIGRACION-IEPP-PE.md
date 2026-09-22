# Plan pendiente: migrar IEPP a iepp.pe

**Estado: solo documentación; no ejecutar por ahora.** La web sigue alojada en GitHub Pages con **https://iepp.velifatech.com**. Este plan conserva los pasos para una migración futura a `iepp.pe`, con DNS en cPanel y el correo en su proveedor actual.

## Configuración futura: GitHub Pages + DNS en cPanel

Cuando se autorice la migración, GitHub Pages alojará la web en **https://iepp.pe**. cPanel conserva la administración DNS y el proveedor actual conserva el correo. No se necesita cargar archivos ni el ZIP anterior en cPanel.

El repositorio es `Hector295/iepp-web`. El flujo `.github/workflows/deploy-pages.yml` comprueba y publica `out/` con cada push a `main`. Utiliza Node.js 24, GitHub Actions y los permisos de Pages del repositorio; no necesita credenciales FTP.

### 1. Separar el correo del dominio de la web

La consulta DNS del 22 de septiembre de 2026 encontró:

- `iepp.pe A 144.22.39.30`.
- `iepp.pe MX 0 iepp.pe`.
- `mail.iepp.pe CNAME iepp.pe`.
- Nameservers `dns1.sorcierhosting.com` y `dns2.sorcierhosting.com`.

El MX y el nombre `mail` dependen de la IP de la web. Antes de moverla a GitHub, en cPanel → Editor de zonas cambia el correo para conservar su destino actual:

| Nombre | Tipo | Valor | Prioridad | TTL |
| --- | --- | --- | --- | --- |
| `mail.iepp.pe.` | A | `144.22.39.30` | — | 600 |
| `iepp.pe.` | MX | `mail.iepp.pe.` | 0 | 600 |

Sustituye el CNAME existente de `mail` por el A; no pueden coexistir bajo el mismo nombre. Conserva DKIM y DMARC. Si el correo se aloja en este cPanel, comprueba que Enrutamiento de correo permanezca como **Local Mail Exchanger**. Si los clientes usan `iepp.pe` como servidor SMTP/IMAP, usa el nombre de servidor con certificado válido indicado por el proveedor antes del cambio web.

El SPF consultado es `v=spf1 +a +mx +ip4:129.153.171.17 include:spf.sorcierhosting.com ~all`. Una vez separado el MX, su equivalente sin autorizar las nuevas IP de la web mediante `a` es:

```text
v=spf1 mx ip4:129.153.171.17 include:spf.sorcierhosting.com ~all
```

Edita el único registro SPF existente; conserva las autorizaciones adicionales si el proveedor lo ha actualizado. La IP autorizada explícitamente para enviar correo (`129.153.171.17`) no se sustituye por la IP a la que resuelve actualmente el MX (`144.22.39.30`).

Verifica el nuevo MX y `mail` antes de cambiar la web. Deja transcurrir al menos los 600 segundos del TTL anterior y comprueba envío y recepción de correo.

### 2. Preparar el proyecto, configurar GitHub y publicar

Antes de publicar, cambiar el dominio de `iepp.velifatech.com` a `iepp.pe` en `astro.config.mjs`, `public/CNAME`, `public/robots.txt`, `public/sitemap.xml`, la comprobación del dominio en `.github/workflows/deploy-pages.yml` y las expectativas de `scripts/check-static.mjs`. Actualizar README y PRODUCT para reflejar la migración. Los metadatos y redirecciones se generan a partir de `Astro.site`; el correo institucional continúa siendo `@iepp.pe`. Ejecutar `npm run check` y `npm run build`.

En [Settings → Pages](https://github.com/Hector295/iepp-web/settings/pages):

1. Mantén **Source: GitHub Actions**.
2. Sustituye el dominio anterior `iepp.velifatech.com` por **iepp.pe** en **Custom domain** y guarda. Hazlo antes de apuntar los DNS web a GitHub. La comprobación DNS puede quedar pendiente hasta el paso siguiente.
3. Guarda los cambios del proyecto con commit y push a `main`. En **Actions → Deploy IEPP to GitHub Pages**, espera a que terminen correctamente los trabajos `build` y `deploy`.

Tras adaptar el flujo, este deberá verificar que el dominio configurado en Pages sea `iepp.pe` y detenerse si todavía figura el dominio anterior. El archivo `public/CNAME` documenta el dominio del paquete; con GitHub Actions no sustituye a la configuración de **Custom domain**.

### 3. Apuntar la web a GitHub desde cPanel

Mantén los nameservers actuales. En el Editor de zonas sustituye el A de `iepp.pe` que apunta a `144.22.39.30` por estos cuatro registros y cambia el CNAME de `www`:

| Nombre | Tipo | Valor | TTL |
| --- | --- | --- | --- |
| `iepp.pe.` | A | `185.199.108.153` | 600 |
| `iepp.pe.` | A | `185.199.109.153` | 600 |
| `iepp.pe.` | A | `185.199.110.153` | 600 |
| `iepp.pe.` | A | `185.199.111.153` | 600 |
| `www.iepp.pe.` | CNAME | `hector295.github.io.` | 600 |

No conserves el A anterior junto a los de GitHub. No incluyas `/iepp-web` en el CNAME. La consulta realizada no devolvió registros AAAA para el dominio raíz; si aparecen antes del cambio, deben ser compatibles con GitHub Pages para evitar enviar parte de las visitas al servidor anterior. Los registros de correo, FTP y otros servicios conservan sus destinos propios.

Tras propagarse el DNS y emitirse el certificado, activa **Enforce HTTPS** en GitHub Pages. La propagación y la disponibilidad de HTTPS pueden tardar hasta 24 horas. Comprueba `https://iepp.pe`, `https://www.iepp.pe`, las cinco páginas y el correo.

Retira el registro DNS del antiguo `iepp.velifatech.com` si queda abandonado apuntando a GitHub; se administra en la zona de `velifatech.com`, no en esta zona.

## Desarrollo y comprobaciones

```sh
npm ci --ignore-scripts
npm run check
npm run build
npm run preview
```

Al ejecutar la migración, Astro usará `site: 'https://iepp.pe'`, sin prefijo `/iepp-web`, y genera `out/`. La compilación verifica assets, navegación, contenido, metadatos y sitemap. También genera seis archivos `.html` para que los enlaces del sitio anterior redirijan a las páginas actuales. Son redirecciones en el navegador con enlace alternativo y canonical; GitHub Pages no interpreta `.htaccess` ni emite nuestros antiguos 301 de Apache.

Los cambios posteriores se publican automáticamente al hacer push a `main`; no hay carga manual a cPanel.

Referencias: [dominios personalizados en GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [Astro en GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) y [enrutamiento de correo en cPanel](https://docs.cpanel.net/cpanel/email/email-routing/).

La procedencia y las limitaciones de la información institucional están documentadas en [CONTENIDO.md](CONTENIDO.md).
