---
name: Iglesia Evangélica de los Peregrinos del Perú
description: Un santuario editorial que convierte identidad, memoria, comunión y destino en un peregrinaje visual.
colors:
  midnight-navy: "#031c2d"
  layered-navy: "#082d42"
  editorial-ink: "#0c2230"
  warm-ivory: "#f4efe3"
  heritage-paper: "#e9e1d1"
  matte-gold: "#e4b968"
  luminous-gold: "#f2cf88"
  fine-light-line: "rgba(244, 239, 227, 0.38)"
  ministry-ochre: "#b87b35"
  deep-location-navy: "#071f2c"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(4.5rem, 7.7vw, 8.2rem)"
    fontWeight: 500
    lineHeight: 0.82
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(3.2rem, 5.5vw, 6rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.85rem"
    fontWeight: 500
    lineHeight: 1
  body:
    fontFamily: "Manrope, Avenir Next, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, Avenir Next, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  editorial: "0"
  marker: "50%"
spacing:
  compact: "0.8rem"
  control-x: "1.7rem"
  content: "1.5rem"
  section: "7vw"
components:
  button-gold:
    backgroundColor: "{colors.luminous-gold}"
    textColor: "{colors.midnight-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.editorial}"
    padding: "0.95rem 1.7rem"
    height: "58px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.editorial-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.editorial}"
    padding: "0.95rem 1.7rem"
    height: "58px"
  button-dark:
    backgroundColor: "{colors.midnight-navy}"
    textColor: "{colors.warm-ivory}"
    typography: "{typography.label}"
    rounded: "{rounded.editorial}"
    padding: "0.95rem 1.7rem"
    height: "58px"
  nav-cta:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ivory}"
    typography: "{typography.label}"
    rounded: "{rounded.editorial}"
    padding: "0.86rem 1.45rem"
---

# Design System: Iglesia Evangélica de los Peregrinos del Perú

## Overview

**Creative North Star: "El Santuario Peregrino"**

El sistema presenta la fe como un recorrido contemplativo. Las superficies alternan entre azul noche, marfil y ocre para marcar etapas; la fotografía cinematográfica aporta humanidad, y la tipografía editorial convierte las declaraciones doctrinales en momentos de pausa y orientación.

La experiencia debe sentirse premium, reverente y acogedora. Su ritmo es amplio y procesional: texto monumental, bloques narrativos largos, líneas finas y controles rectos. La organización visual evita el lenguaje de catálogo y mantiene la historia como una secuencia continua de identidad, memoria, comunión y destino.

**Key Characteristics:**

- Narrativa vertical por capas, con cada cambio de color funcionando como un nuevo tramo del camino.
- Contraste entre Cormorant Garamond expresiva y Manrope sobria.
- Fotografía cálida, cinematográfica y comunitaria.
- Oro mate usado como guía, llamado y acento doctrinal.
- Controles rectos, líneas de un píxel y grandes reservas de espacio.

## Colors

La paleta combina noche profunda, papeles cálidos y oro mate; el ocre aparece como un campo narrativo excepcional, no como un color de interfaz rutinario.

### Primary

- **Oro luminoso** (`{colors.luminous-gold}`): llamado principal, palabras en cursiva y cierre de la experiencia.
- **Oro mate** (`{colors.matte-gold}`): bordes de acción, guías, marcas de recorrido y detalles del emblema.

### Secondary

- **Ocre ministerial** (`{colors.ministry-ochre}`): superficie completa para la etapa de participación y servicio.

### Neutral

- **Azul noche** (`{colors.midnight-navy}`): fondo dominante, texto sobre oro y base del hero.
- **Azul de capas** (`{colors.layered-navy}`): matiz secundario para citas y transiciones oscuras.
- **Azul de destino** (`{colors.deep-location-navy}`): superficie de sedes, apenas separada del fondo principal.
- **Tinta editorial** (`{colors.editorial-ink}`): texto y controles sobre marfil y ocre.
- **Marfil cálido** (`{colors.warm-ivory}`): texto sobre fondos oscuros y superficie luminosa de historia.
- **Papel de herencia** (`{colors.heritage-paper}`): superficie de identidad, memoria y doctrina.
- **Línea de luz** (`{colors.fine-light-line}`): divisores delicados sobre azul noche.

**The Golden Wayfinding Rule.** El oro indica camino, doctrina o acción; no llena contenedores decorativos sin función.

**The Layered Night Rule.** Los azules oscuros deben conservar diferencias sutiles entre etapas sin romper la continuidad nocturna.

## Typography

**Display Font:** Cormorant Garamond (con Georgia y serif como respaldo)
**Body Font:** Manrope (con Avenir Next y sans-serif como respaldo)

**Character:** Cormorant Garamond aporta solemnidad, memoria e intimidad mediante formas clásicas e itálicas doradas. Manrope sostiene la lectura, la navegación y las acciones con una voz clara y contemporánea.

### Hierarchy

- **Display** (`{typography.display}`): titular del hero y declaraciones finales; puede ocupar varias líneas con interlineado muy cerrado.
- **Headline** (`{typography.headline}`): encabezados de etapa; normalmente entre 10 y 14 caracteres de ancho visual por línea.
- **Title** (`{typography.title}`): nombres de hitos, principios y pasos del recorrido.
- **Body** (`{typography.body}`): párrafos narrativos; mantenerlos cerca de 55 caracteres por línea y nunca convertirlos en columnas densas.
- **Label** (`{typography.label}`): navegación y acciones; peso medio o fuerte, con texto breve y directo.

**The Italic Revelation Rule.** La itálica Cormorant Garamond se reserva para la frase que revela el sentido emocional o espiritual de un titular.

**The Monument and Whisper Rule.** Los titulares dominan la escena; el cuerpo permanece pequeño, calmo y con interlineado generoso.

## Layout

La composición es una peregrinación vertical de secciones a pantalla completa o casi completa. El hero ocupa al menos la altura visible y combina texto monumental a la izquierda con una escena fotográfica que respira hacia la derecha. Las secciones editoriales alternan composiciones asimétricas, divisiones 54/46 y 60/40, y grandes márgenes laterales basados en `{spacing.section}`.

El espacio entre etapas es amplio, con relleno vertical entre 6rem y 12rem. Las líneas finas conectan hitos y sustituyen contenedores. A 980px, las composiciones de dos columnas se apilan o simplifican y la navegación pasa a una vista de pantalla completa. A 680px, el contenido usa márgenes laterales de `{spacing.content}`, los recorridos se vuelven lineales y la imagen precede o sigue al texto según la secuencia narrativa.

**The Continuous Pilgrimage Rule.** Cada sección debe conducir visualmente a la siguiente; no fragmentar el recorrido en una cuadrícula de tarjetas independientes.

## Elevation & Depth

El sistema no usa sombras. La profundidad aparece mediante fotografía de alto rango tonal, gradientes oscuros sobre imagen, campos de color superpuestos, escalas tipográficas extremas y palabras de fondo delineadas. Las superficies permanecen planas y editoriales.

**The Shadowless Depth Rule.** Construir jerarquía con tono, escala, imagen y solapamiento; no elevar paneles con sombras.

## Shapes

La forma dominante es recta y precisa (`{rounded.editorial}`). Botones, navegación y marcos conservan esquinas cuadradas. Los círculos aparecen solo como marcadores de recorrido (`{rounded.marker}`), mientras rombos pequeños separan palabras en las cintas editoriales. Los bordes son finos y nunca forman cajas pesadas.

**The Straight Control Rule.** Los controles interactivos mantienen esquinas rectas y bordes de un píxel.

## Components

### Buttons

- **Shape:** rectángulos editoriales de esquina cuadrada, con altura mínima de 58px.
- **Primary:** fondo oro luminoso, tinta azul noche y relleno lateral amplio (`{components.button-gold}`).
- **Hover / Focus:** elevación cinética de 3px en 250ms; foco visible con contorno oro de 2px y separación de 5px.
- **Outline:** borde de tinta sobre ocre; al pasar el cursor se llena de tinta y el texto cambia a marfil (`{components.button-outline}`).
- **Dark:** fondo azul noche y texto marfil para superficies doradas (`{components.button-dark}`).

### Text Links

Los enlaces editoriales usan una línea inferior de un píxel. En hover o foco, la línea se contrae hacia la derecha durante 300ms; el texto permanece quieto.

### Navigation

La navegación de escritorio es ligera y horizontal, con subrayado dorado progresivo. `Visítanos` adopta un marco dorado y se invierte al interactuar (`{components.nav-cta}`). Bajo 980px, el menú se convierte en una superficie azul noche de pantalla completa con texto Manrope grande y una apertura vertical de 450ms.

### Pilgrimage Path

Una línea horizontal une cuatro hitos de organización. Un marcador dorado de 14px recorre la línea en 8s; bajo 980px se elimina el movimiento y los hitos pasan a dos columnas, luego a una sola columna bajo 680px.

### Ministry Ribbon

La cinta es una línea tipográfica Cormorant Garamond en cursiva, de una sola fila y ancho intrínseco. Rombos de tinta separan sus conceptos, y bordes finos superiores e inferiores la convierten en una corriente continua dentro del campo ocre.

### Brand Lockup

El emblema oficial conserva la cruz, el globo, la Biblia abierta y la llama de la referencia institucional. El nombre completo usa Manrope; mantener ambos elementos juntos y legibles.

## Do's and Don'ts

### Do:

- **Do** organizar nuevas superficies como una secuencia narrativa con transiciones de tono y espacio.
- **Do** usar el oro para orientar, revelar o invitar a actuar.
- **Do** mantener `Visítanos` visible en la primera vista de cualquier entrada pública principal.
- **Do** respetar foco visible, navegación por teclado y movimiento reducido.
- **Do** usar fotografía cinematográfica que muestre peregrinaje, comunión o servicio con dignidad.

### Don't:

- **Don't** convertir contenido narrativo en un catálogo repetitivo de tarjetas.
- **Don't** introducir esquinas redondeadas, sombras de panel o efectos brillantes ajenos al lenguaje editorial.
- **Don't** saturar la interfaz con oro; su rareza sostiene su función.
- **Don't** usar Cormorant Garamond para párrafos largos ni Manrope para reemplazar los grandes momentos editoriales.
- **Don't** confundir imágenes evocativas con documentación histórica o datos verificados.
