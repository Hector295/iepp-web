# Contenido institucional de IEPP

Revisión de las páginas públicas de `iepp.pe` realizada el 21 de septiembre de 2026 como fuente para esta versión, alojada en iepp.velifatech.com.

| Fuente | Integración en la nueva página |
| --- | --- |
| [Inicio](https://iepp.pe/) | Identidad wesleyana, contacto y Facebook institucional. |
| [Nosotros](https://iepp.pe/nosotros.html) | Síntesis de la visión y misión en `#identidad`. |
| [Historia](https://iepp.pe/nosotros/nuestra_historia.html) | La historia ya incorporada coincide con la fuente; se conserva en `/historia`. |
| [Confesión de fe](https://iepp.pe/nosotros/confesiondefe.html) | Texto de los 18 artículos en `/confesion-de-fe`, con índice y lectura completa. Las tarjetas muestran un extracto inicial. Se corrigen dos signos sueltos de la fuente: la comilla tras «sepultado» y el paréntesis tras «santos». |
| [Organización](https://iepp.pe/organizacion.html) | Concilio, seis presbiterios con responsables y territorios, órganos internos, Consejo Ministerial y cuatro departamentos. |
| [Contacto](https://iepp.pe/contacto.html) | Dirección, teléfono y correo en `#contacto`; dirección consistente en el directorio, JSON, CSV y metadatos. |

## Criterios y asuntos pendientes

- La organización (Concilio, presbíteros, órganos internos, departamentos y Consejo Ministerial) se actualizó con el documento «Organización de la IEPP» entregado en octubre de 2026.
- La dirección del pie oficial es **Ca. La Florida 678, Urb. San Eduardo, Chiclayo**. Sustituye el ambiguo `608/678` del proyecto y el error tipográfico «Floria» de la página antigua de contacto.
- La web consultada no contiene las noticias que aparecían como muestras en este proyecto. Se retiraron esos artículos y se conserva el acceso a Facebook, enlazado por la propia IEPP.
- La web antigua enlaza `http://sbp.iepp.pe`. El subdominio no resolvió durante la consulta; no se añade un acceso roto ni se inventa contenido del SBP.
- El directorio de sedes vive en `src/data/sedes.json` (91 sedes). La Región Norte (63 iglesias) proviene del documento «Dirección de iglesias – Norte 2026»; las demás regiones conservan el directorio anterior. No se publican los celulares de los pastores. Las iglesias nuevas se ubicaron con OpenStreetMap a nivel de localidad o distrito (`APROX_LOCALIDAD`, `APROX_DISTRITO`); seis no se encontraron y figuran sin punto en el mapa (`SIN_UBICACION`).
- Cutervo y Sócota pasan a la Región Norte, como indican la página institucional y el directorio Norte 2026. Puerto Eten y las dos sedes antiguas de Ferreñafe sin dirección no figuran en el directorio 2026 y se retiraron; Ferreñafe queda con Calle Sucre 107 y Pueblo Nuevo de Ferreñafe con Juan Gil Casiano 470.
- Se mantiene la indicación de imágenes ilustrativas y de coordenadas aproximadas. No se atribuyen las imágenes generadas a actividades históricas reales.
- Al publicar en GitHub Pages, se conservan las seis URLs antiguas mediante archivos HTML con redirección inmediata, enlace alternativo y canonical al destino actual. GitHub Pages no interpreta `.htaccess`; estas redirecciones se realizan en el navegador, no mediante respuestas HTTP 301.

El contenido fue recuperado directamente desde las páginas públicas. Algunos resultados del buscador devolvieron errores o copias antiguas; los nombres y datos se cotejaron con el HTML servido por el sitio.
