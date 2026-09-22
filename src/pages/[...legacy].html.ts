import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths: GetStaticPaths = () => Object.entries({
  inicio: '/',
  nosotros: '/#identidad',
  'nosotros/nuestra_historia': '/historia',
  'nosotros/confesiondefe': '/confesion-de-fe',
  organizacion: '/organizacion',
  contacto: '/#contacto',
}).map(([legacy, destination]) => ({ params: { legacy }, props: { destination } }));

// GitHub Pages sirve archivos estáticos y no interpreta las reglas de Apache.
export const GET: APIRoute = ({ props, site }) => {
  const destination = new URL(props.destination, site).href;
  return new Response(`<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0;url=${destination}">
  <meta name="robots" content="noindex">
  <link rel="canonical" href="${destination}">
  <title>Esta página ha cambiado de dirección | IEPP</title>
</head>
<body><p>Esta página ha cambiado de dirección. <a href="${destination}">Continuar al sitio de la IEPP</a>.</p></body>
</html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
