# Migración a iepp.pe — completada

**Estado verificado el 6 de noviembre de 2026, 12:34 (Lima):** migración completada. GitHub Pages informa el certificado como `approved` para `iepp.pe` y `www.iepp.pe`, con `https_enforced: true`. Ambos nombres funcionan con validación TLS correcta; HTTP y `www` redirigen a `https://iepp.pe/`. El usuario confirmó previamente una prueba correcta de envío y recepción de correo y sus registros conservan el proveedor anterior. El proyecto pasó `npm run check` y `npm run build` durante la migración (97 páginas). La incidencia HTTPS quedó resuelta después de eliminar el antiguo TXT ACME y reiniciar la solicitud; esa secuencia no permite atribuir con certeza la causa al TXT. Se conserva el historial de diagnóstico abajo.

## Configuración de destino: GitHub Pages + DNS en cPanel

GitHub Pages aloja la web para **iepp.pe**, con HTTPS activo y obligatorio. cPanel conserva la administración DNS y el proveedor actual conserva el correo. No se necesita cargar archivos ni el ZIP anterior en cPanel.

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

**Enforce HTTPS** ya está activo. Se verificaron `https://iepp.pe`, `https://www.iepp.pe`, la confesión de fe, la sede Motupe, robots y sitemap. Para futuras migraciones, la propagación y la disponibilidad de HTTPS pueden tardar hasta 24 horas; comprobar también envío y recepción del correo.

Una vez finalizada y verificada la migración, retira el registro DNS del antiguo `iepp.velifatech.com` si queda abandonado apuntando a GitHub; se administra en la zona de `velifatech.com`, no en esta zona.

## Historial de la incidencia HTTPS — resuelta

Los estados pendientes descritos a continuación corresponden a cada comprobación histórica; el estado actual es el indicado al inicio del documento y en el cierre del 6 de noviembre.

Comprobación del 4 de noviembre de 2026, 22:22 (Lima):

- GitHub informa `is_valid: true`, `is_https_eligible: true` y `caa_error: null` para `iepp.pe` y `www.iepp.pe`.
- Ambos nameservers tienen la misma zona. Cloudflare y Google devuelven las cuatro IP de GitHub; no aparece un A anterior ni un AAAA del dominio raíz. Las consultas CAA y DS responden sin errores; los CAA del destino de `www` autorizan a Let's Encrypt.
- `http://iepp.pe/` devuelve HTTP 200 desde GitHub. Las peticiones HTTPS a ambos dominios fallan porque el certificado servido no cubre sus nombres; no se ha omitido la validación TLS.
- El certificado permaneció en `authorization_pending` durante más de cuatro horas. A las 22:18 se retiró y restableció el dominio en Pages para reiniciar la solicitud siguiendo el procedimiento oficial. El dominio quedó restablecido; el estado sigue pendiente.
- Al intentar `https_enforced=true`, GitHub responde HTTP 404 con `The certificate has not finished being issued`. La exigencia de HTTPS sigue desactivada; no se modificaron DNS ni correo durante este diagnóstico.

No se ha demostrado una causa DNS del bloqueo. Cuando el certificado esté disponible, verificar HTTPS en ambos dominios, activar **Enforce HTTPS** y comprobar la redirección HTTP → HTTPS y `www` → dominio raíz.

### Seguimiento del 5 de noviembre de 2026, 10:20 (Lima)

El usuario publicó la [consulta #212162 en GitHub Community](https://github.com/orgs/community/discussions/212162). Un [comentario de g4lb](https://github.com/community/community/discussions/212162#discussioncomment-19420894) propone retirar un TXT ACME anterior y volver a registrar el dominio. Ambos nameservers confirman el siguiente registro, con el mismo valor visible en las capturas anteriores a la migración:

```text
Nombre: _acme-challenge.iepp.pe.
Tipo: TXT
TTL: 600
Valor: HVerXm50uHat44_2FnNnuBGo7BvXXlw1VZUrdQ6hZIw
```

Esta es la copia de respaldo del valor anterior. **La retirada está pospuesta:** el usuario desea preservar el correo y no se ha comprobado si AutoSSL usa este valor en una validación activa. Las capturas recibidas muestran el editor DNS, no el estado de AutoSSL. No se ha eliminado el TXT ni se ha vuelto a reiniciar la solicitud. Tampoco se ha confirmado que este registro sea la causa: [Let's Encrypt admite múltiples TXT de validación y recomienda limpiar los antiguos](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge).

Un [segundo comentario, de Tirthika](https://github.com/community/community/discussions/212162#discussioncomment-19421022), coincide con las comprobaciones DNS y propone que el equipo de Pages revise una posible autorización ACME atascada. Es una hipótesis, no una confirmación del equipo de GitHub. El comentario afirma que se borró el archivo CNAME del repositorio, pero eso no ocurrió: se reconfiguró el dominio mediante la API de Pages. Con el despliegue por GitHub Actions, ese archivo no controla la configuración del dominio. Se conserva el DNS actual mientras se aclara la causa.

### Seguimiento del 6 de noviembre de 2026

Han pasado más de 36 horas desde el último reinicio de la solicitud, realizado el 4 de noviembre a las 22:18 (Lima). La API de Pages sigue devolviendo `authorization_pending` para `iepp.pe` y `www.iepp.pe`, con `https_enforced: false`. La prueba actual de `https://iepp.pe/` falla por un certificado que no cubre ese nombre; no se omitió la validación TLS.

Cloudflare (`1.1.1.1`) sigue devolviendo los cuatro A de GitHub, `www` como CNAME de `hector295.github.io`, ningún AAAA ni CAA en el dominio raíz y el correo separado: `MX 0 mail.iepp.pe` y `mail.iepp.pe A 144.22.39.30`. GitHub Status informa Pages operativo y ninguna incidencia activa. La discusión sigue con los dos comentarios anteriores, sin respuesta aceptada. Las dos consultas actuales a `/pages/health` devolvieron `{}`; la validación positiva de ese endpoint corresponde a comprobaciones anteriores, no a esta revisión.

El siguiente paso recomendado es solicitar una revisión de la emisión a GitHub mediante la discusión existente o un ticket si la cuenta tiene acceso a soporte técnico. No se ha confirmado la causa del bloqueo. No se volvió a reiniciar el dominio ni se modificaron el DNS, el TXT ACME, el archivo CNAME o los registros de correo. Con GitHub Free, la documentación remite la mayoría de los problemas técnicos a Community; no presentar un ticket técnico como un problema de cuenta o seguridad.

### Prueba acordada del 6 de noviembre de 2026, 10:56–10:58 (Lima)

El usuario confirmó que eliminó únicamente el antiguo TXT `_acme-challenge.iepp.pe`. Ambos nameservers respondieron `NXDOMAIN`, con serial de zona `2026110600`; Google, Cloudflare y Quad9 también confirmaron su ausencia. El valor anterior permanece respaldado en el seguimiento del 5 de noviembre.

En las primeras consultas a Cloudflare (`1.1.1.1`) apareció `SERVFAIL` para el TXT eliminado y, posteriormente, para `iepp.pe A`, con este diagnóstico:

```text
EDE: 10 (RRSIGs Missing): (failed to verify signatures for iepp.pe. opt-out proof)
```

Las consultas posteriores a `1.1.1.1`, `1.0.0.1`, Google y Quad9 respondieron correctamente. Dos servidores autoritativos de `.pe` devolvieron la ausencia de DS con pruebas NSEC3 y sus RRSIG; no se cambió DNSSEC. Esto registra un fallo intermitente de validación, pero no demuestra que la eliminación del TXT lo causara ni que explique el bloqueo de GitHub. Si se repite, aportar esta evidencia al proveedor DNS y al registrador. [Let's Encrypt documenta que los errores DNSSEC/SERVFAIL pueden impedir la emisión](https://letsencrypt.org/docs/caa/#servfail).

Con las nuevas consultas correctas se ejecutó una sola secuencia de reinicio:

1. `PUT /repos/Hector295/iepp-web/pages` con `cname: null`.
2. GET confirmó `cname: null` y `https_certificate: null`.
3. PUT con `cname: iepp.pe`, completado a las **15:57:58 UTC / 10:57:58 Lima**.
4. GET confirmó el dominio restaurado, certificado `authorization_pending` para raíz y `www`, y `https_enforced: false`.
5. `http://iepp.pe/` respondió HTTP 200. MX y `mail` siguen en `mail.iepp.pe` y `144.22.39.30`; no se modificaron los registros de correo.

No se ha demostrado que retirar el TXT resuelva la incidencia. Evitar nuevos reinicios mientras se comprueba el resultado de esta solicitud.

**Comprobación posterior, 11:00:23 (Lima):** el certificado continúa en `authorization_pending` y la exigencia de HTTPS sigue desactivada. Las pruebas HTTPS realizadas después del reinicio fallaron por nombre de certificado tanto en el dominio raíz como en `www`; `/pages/health` volvió a devolver `{}`. El reinicio se completó, pero la incidencia todavía no está resuelta.

### Cierre del 6 de noviembre de 2026, 12:34 (Lima)

Tras el aviso del usuario de que HTTPS funciona, se verificó:

- API de Pages: `cname: iepp.pe`, `https_certificate.state: approved`, dominios `iepp.pe` y `www.iepp.pe`, `https_enforced: true`. El certificado actual expira el 4 de febrero de 2027.
- HTTPS raíz y `www`: respuesta final HTTP 200 en `https://iepp.pe/`, con `ssl_verify_result: 0` y sin omitir la verificación TLS.
- HTTP raíz y `www`: una redirección hasta `https://iepp.pe/`, con respuesta final HTTP 200.
- `/confesion-de-fe/` y `/sedes/motupe/`: HTTP 200 con certificado válido.
- `robots.txt`: permite la indexación y señala `https://iepp.pe/sitemap.xml`. El sitemap publicado contiene 97 URL, todas bajo HTTPS y el dominio `iepp.pe`.

No fue necesario activar HTTPS mediante otra modificación: ya estaba habilitado al consultar. No se cambiaron los registros del correo ni se publicó una respuesta en Community. La resolución ocurrió después de retirar el TXT y reiniciar la emisión, pero no identifica por sí sola la causa técnica del bloqueo ni explica el error DNSSEC transitorio.

### Borrador histórico para soporte — no enviado, incidencia ya resuelta

Se conserva como registro del diagnóstico anterior al cierre; no enviar como incidencia vigente.

Contacto: [GitHub Support](https://support.github.com/contact).

```text
Subject: GitHub Pages certificate stuck in authorization_pending for iepp.pe

Repository: https://github.com/Hector295/iepp-web
Custom domain: iepp.pe (alternate: www.iepp.pe)
Update: November 6, 2026. The certificate remained authorization_pending
for more than 36 hours after the November 5 reset. Following the suggestion
in this discussion, the old _acme-challenge.iepp.pe TXT was removed and its
absence confirmed on both authoritative servers and public resolvers.
We then reset the Pages custom domain once, restoring iepp.pe on November 6
at 15:57:58 UTC. The immediate post-reset state remains authorization_pending
for iepp.pe and www.iepp.pe; HTTP still serves the site.

GET /repos/Hector295/iepp-web/pages still returns:
  cname: iepp.pe
  build_type: workflow
  https_certificate.state: authorization_pending
  https_enforced: false

Current public DNS checks still show all four GitHub Pages A addresses,
www CNAME hector295.github.io, no apex AAAA and no apex CAA restriction.
HTTPS for iepp.pe still fails hostname verification.

Earlier /pages/health checks reported both domains valid and HTTPS-eligible;
the latest two calls returned an empty JSON object. A previous attempt to
enable HTTPS returned "The certificate has not finished being issued".

During pre-reset checks, Cloudflare 1.1.1.1 briefly returned SERVFAIL for
the removed TXT and then for iepp.pe A, with this extended DNS error:
"RRSIGs Missing: failed to verify signatures for iepp.pe. opt-out proof".
Subsequent queries to 1.1.1.1, 1.0.0.1, Google and Quad9 succeeded. We have
not established whether this intermittent DNSSEC error affects issuance.

For accuracy: we deploy through GitHub Actions. We reset the custom domain
in Pages settings but did not delete the repository's CNAME file.
Email remains hosted separately on cPanel.

Could the GitHub Pages team inspect the certificate provisioning job and
its authorization failure or retry status? We would like to resolve this
while preserving the domain and the existing mail configuration.
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
