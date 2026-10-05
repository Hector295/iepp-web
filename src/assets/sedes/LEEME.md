# Fotos de las sedes

Cada sede puede tener hasta **20 fotos**.

1. Busca el identificador de la sede (`slug`) en `src/data/sedes.json`. Es la última parte de su dirección web: `iepp.velifatech.com/sedes/motupe` → `motupe`.
2. Crea una carpeta con ese nombre aquí: `src/assets/sedes/motupe/`.
3. Copia las fotos (`.jpg`, `.png` o `.webp`). Se muestran en orden por nombre: `1.jpg`, `2.jpg`, … `20.jpg`. La primera es la portada de la sede y aparece en el buscador.

No hace falta reducirlas: al construir el sitio se optimizan automáticamente. Si una carpeta tiene más de 20 fotos o su nombre no coincide con ninguna sede, el build falla con un mensaje que lo indica.

Los demás datos de la sede (resumen, encargados, horarios, teléfono, Facebook) se editan en `src/data/sedes.json`.
