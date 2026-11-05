# Migración a iepp.pe — en curso

**Estado al 4 de noviembre de 2026, 22:22 (Lima):** código y DNS web migrados. El commit `dd8ba7b` se publicó correctamente mediante GitHub Actions y Pages tiene `iepp.pe` como dominio personalizado. Los dos nameservers, Cloudflare y Google confirman los cuatro A de GitHub y el CNAME de `www`; GitHub valida ambos dominios. El MX, `mail` y el SPF conservan los valores indicados abajo; el usuario confirmó una prueba correcta de envío y recepción de correo. El proyecto pasa `npm run check` y `npm run build` (97 páginas), y la portada, confesión de fe y sede Motupe responden correctamente en GitHub con sus nuevos canonical. HTTPS sigue sin funcionar: GitHub mantiene el certificado en `authorization_pending` y rechaza su activación porque no ha terminado de emitirlo. El diagnóstico y un borrador para soporte están al final del documento.

## Configuración de destino: GitHub Pages + DNS en cPanel

GitHub Pages aloja la web para **iepp.pe**; la activación de HTTPS está pendiente. cPanel conserva la administración DNS y el proveedor actual conserva el correo. No se necesita cargar archivos ni el ZIP anterior en cPanel.

El repositorio es `Hector295/iepp-web`. El flujo `.github/workflows/deploy-pages.yml` comprueba y publica `out/` con cada push a `main`. Utiliza Node.js 24, GitHub Actions y los permisos de Pages del repositorio; no necesita credenciales FTP.

### 1. Separar el correo del dominio de la web

Estado inicial consultado el 4 de noviembre de 2026, antes de los cambios:

- `iepp.pe A 144.22.39.30`.
- `iepp.pe MX 0 iepp.pe`.
- `mail.iepp.pe CNAME iepp.pe`.
- Nameservers `dns1.sorcierhosting.com` y `dns2.sorcierhosting.com`.

El MX y el nombre `mail` dependían de la IP de la web. Esta separación ya fue realizada en cPanel y verificada en DNS; conserva estos valores:

| Nombre | Tipo | Valor | Prioridad | TTL |
| --- | --- | --- | --- | --- |
| `mail.iepp.pe.` | A | `144.22.39.30` | — | 600 |
| `iepp.pe.` | MX | `mail.iepp.pe.` | 0 | 600 |

En el editor de `mail`, selecciona **A** en el desplegable de tipo antes de escribir la IP. Sustituye el CNAME existente por el A; no pueden coexistir bajo el mismo nombre. Conserva DKIM y DMARC. Si el correo se aloja en este cPanel, comprueba que Enrutamiento de correo permanezca como **Local Mail Exchanger**. Si los clientes usan `iepp.pe` como servidor SMTP/IMAP, usa el nombre de servidor con certificado válido indicado por el proveedor antes del cambio web.

El SPF anterior era `v=spf1 +a +mx +ip4:129.153.171.17 include:spf.sorcierhosting.com ~all`. Una vez separado el MX, se publicó y verificó este valor, que ya no autoriza las nuevas IP de la web mediante `a`:

```text
v=spf1 mx ip4:129.153.171.17 include:spf.sorcierhosting.com ~all
```

Edita el único registro SPF existente; conserva las autorizaciones adicionales si el proveedor lo ha actualizado. La IP autorizada explícitamente para enviar correo (`129.153.171.17`) no se sustituye por la IP a la que resuelve actualmente el MX (`144.22.39.30`).

Verifica el nuevo MX y `mail` antes de cambiar la web. Deja transcurrir al menos los 600 segundos del TTL anterior y comprueba envío y recepción de correo.

### 2. Preparar el proyecto, configurar GitHub y publicar

Se cambió el dominio de `iepp.velifatech.com` a `iepp.pe` en `astro.config.mjs`, `public/CNAME`, `public/robots.txt`, la comprobación del dominio en `.github/workflows/deploy-pages.yml` y las expectativas de `scripts/check-static.mjs`. Se actualizaron README y PRODUCT. El sitemap (`src/pages/sitemap.xml.ts`), los metadatos y las redirecciones se generan a partir de `Astro.site`; el correo institucional continúa siendo `@iepp.pe`. Pasaron `npm run check` y `npm run build`.

En [Settings → Pages](https://github.com/Hector295/iepp-web/settings/pages):

1. Mantén **Source: GitHub Actions**.
2. Sustituye el dominio anterior `iepp.velifatech.com` por **iepp.pe** en **Custom domain** y guarda. Hazlo antes de apuntar los DNS web a GitHub. La comprobación DNS puede quedar pendiente hasta el paso siguiente.
3. Guarda los cambios del proyecto con commit y push a `main`. En **Actions → Deploy IEPP to GitHub Pages**, espera a que terminen correctamente los trabajos `build` y `deploy`.

El flujo verifica que el dominio configurado en Pages sea `iepp.pe` y se detiene si figura otro dominio. El archivo `public/CNAME` documenta el dominio del paquete; con GitHub Actions no sustituye a la configuración de **Custom domain**.

### 3. Apuntar la web a GitHub desde cPanel

Los nameservers se conservan. En el Editor de zonas ya se sustituyó el A web anterior (`144.22.39.30`) por estos cuatro registros y se actualizó el CNAME de `www`. Todos fueron verificados en DNS:

| Nombre | Tipo | Valor | TTL |
| --- | --- | --- | --- |
| `iepp.pe.` | A | `185.199.108.153` | 600 |
| `iepp.pe.` | A | `185.199.109.153` | 600 |
| `iepp.pe.` | A | `185.199.110.153` | 600 |
| `iepp.pe.` | A | `185.199.111.153` | 600 |
| `www.iepp.pe.` | CNAME | `hector295.github.io.` | 600 |

No conserves el A anterior junto a los de GitHub. No incluyas `/iepp-web` en el CNAME. La consulta realizada no devolvió registros AAAA para el dominio raíz; si aparecen antes del cambio, deben ser compatibles con GitHub Pages para evitar enviar parte de las visitas al servidor anterior. Los registros de correo, FTP y otros servicios conservan sus destinos propios.

Tras propagarse el DNS y emitirse el certificado, activa **Enforce HTTPS** en GitHub Pages. La propagación y la disponibilidad de HTTPS pueden tardar hasta 24 horas. Comprueba `https://iepp.pe`, `https://www.iepp.pe`, las páginas principales, una sede y el correo.

Una vez finalizada y verificada la migración, retira el registro DNS del antiguo `iepp.velifatech.com` si queda abandonado apuntando a GitHub; se administra en la zona de `velifatech.com`, no en esta zona.

## Incidencia pendiente de HTTPS

Comprobación del 4 de noviembre de 2026, 22:22 (Lima):

- GitHub informa `is_valid: true`, `is_https_eligible: true` y `caa_error: null` para `iepp.pe` y `www.iepp.pe`.
- Ambos nameservers tienen la misma zona. Cloudflare y Google devuelven las cuatro IP de GitHub; no aparece un A anterior ni un AAAA del dominio raíz. Las consultas CAA y DS responden sin errores; los CAA del destino de `www` autorizan a Let's Encrypt.
- `http://iepp.pe/` devuelve HTTP 200 desde GitHub. Las peticiones HTTPS a ambos dominios fallan porque el certificado servido no cubre sus nombres; no se ha omitido la validación TLS.
- El certificado permaneció en `authorization_pending` durante más de cuatro horas. A las 22:18 se retiró y restableció el dominio en Pages para reiniciar la solicitud siguiendo el procedimiento oficial. El dominio quedó restablecido; el estado sigue pendiente.
- Al intentar `https_enforced=true`, GitHub responde HTTP 404 con `The certificate has not finished being issued`. La exigencia de HTTPS sigue desactivada; no se modificaron DNS ni correo durante este diagnóstico.

No se ha identificado un ajuste DNS adicional que resolver. Si la solicitud no avanza, pedir a GitHub que revise la autorización y emisión del certificado. Cuando esté disponible, verificar HTTPS en ambos dominios, activar **Enforce HTTPS** y comprobar la redirección HTTP → HTTPS y `www` → dominio raíz.

### Borrador para soporte de GitHub — no enviado

Contacto: [GitHub Support](https://support.github.com/contact).

```text
Subject: GitHub Pages certificate stuck in authorization_pending for iepp.pe

Repository: https://github.com/Hector295/iepp-web
Custom domain: iepp.pe (alternate: www.iepp.pe)
Last checked: 2026-11-04 22:22 UTC-05:00 (Lima)

The Pages certificate remained in authorization_pending for more than four
hours after the DNS change. Both authoritative nameservers, Cloudflare and
Google resolve the apex to the four GitHub Pages IPv4 addresses. www is a
CNAME to hector295.github.io. No conflicting apex AAAA record was found.

GET /repos/Hector295/iepp-web/pages/health reports is_valid=true,
is_https_eligible=true and caa_error=null for both domains. HTTP serves the
deployed site, but HTTPS fails hostname validation for both domains.

Removing and re-adding the custom domain has not resolved the issue.
The latest restart was at approximately 22:18 UTC-05:00 on November 4.
Attempting to enable https_enforced returns HTTP 404 with:
"The certificate has not finished being issued".

Please inspect the ACME authorization/certificate provisioning job and
retry or repair it if necessary. Please preserve the custom domain.
```

Referencia: [solución de problemas de certificados en GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https#troubleshooting-certificate-provisioning-certificate-not-yet-created-error).

## Desarrollo y comprobaciones

```sh
npm ci --ignore-scripts
npm run check
npm run build
npm run preview
```

Al ejecutar la migración, Astro usa `site: 'https://iepp.pe'`, sin prefijo `/iepp-web`, y genera `out/`. La compilación verifica assets, navegación, contenido, metadatos y sitemap. También genera seis archivos `.html` para que los enlaces del sitio anterior redirijan a las páginas actuales. Son redirecciones en el navegador con enlace alternativo y canonical; GitHub Pages no interpreta `.htaccess` ni emite nuestros antiguos 301 de Apache.

Los cambios posteriores se publican automáticamente al hacer push a `main`; no hay carga manual a cPanel.

Referencias: [dominios personalizados en GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [Astro en GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) y [enrutamiento de correo en cPanel](https://docs.cpanel.net/cpanel/email/email-routing/).

La procedencia y las limitaciones de la información institucional están documentadas en [CONTENIDO.md](CONTENIDO.md).
