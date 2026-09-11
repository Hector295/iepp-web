(() => {
  const section = document.querySelector('#sedes');
  const search = section.querySelector('#location-search');
  const region = section.querySelector('#location-region');
  const status = section.querySelector('#location-count');
  const empty = section.querySelector('.locations-empty');
  const list = section.querySelector('.locations-directory');
  const canvas = section.querySelector('#church-map');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim();
  const entries = [...list.querySelectorAll('.location-entry')].map(element => ({
    element, ...element.dataset, text: normalize('Iglesia Evangélica de los Peregrinos del Perú ' + element.querySelector('h3').textContent + ' ' + element.querySelector('.location-city').textContent + ' ' + element.querySelector('address').textContent), marker: null
  }));
  let map, clusters;
  let view = 'peru';
  let visible = entries;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const peruBounds = [[-18.35, -81.42], [-.05, -68.65]];

  function select(entry, fromList = false) {
    entries.forEach(item => {
      const active = item === entry;
      item.element.classList.toggle('is-selected', active);
      item.element.querySelector('button').setAttribute('aria-pressed', String(active));
    });
    if (fromList) {
      initMap();
      if (!map) return;
      view = 'selected';
      map.setView(entry.marker.getLatLng(), entry.precision === 'APROX_LOCALIDAD' ? 13 : 17, {animate: false});
      clusters.zoomToShowLayer(entry.marker, () => entry.marker.openPopup());
      if (matchMedia('(max-width: 900px)').matches) canvas.scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth', block: 'center'});
    } else {
      list.scrollTop += entry.element.getBoundingClientRect().top - list.getBoundingClientRect().top;
    }
  }

  function fitResults() {
    view = 'results';
    if (map && visible.length) map.fitBounds(visible.map(item => [Number(item.lat), Number(item.lng)]), {padding: [45, 45], maxZoom: visible.length === 1 && visible[0].precision !== 'APROX_LOCALIDAD' ? 17 : 13, animate: false});
  }

  function initMap() {
    if (map) return;
    if (!window.L || !L.markerClusterGroup) {
      section.querySelector('#map-status').textContent = 'El mapa no está disponible. Puedes buscar una sede y abrir su dirección en Google Maps.';
      return;
    }
    map = L.map(canvas, {minZoom: 4, maxZoom: 18, scrollWheelZoom: false, zoomAnimation: !reducedMotion, fadeAnimation: !reducedMotion}).fitBounds(peruBounds, {padding: [12, 12]});
    L.geoJSON(JSON.parse(section.querySelector('#peru-geometry').textContent), {style: {color: '#b88a35', weight: 1.5, fillColor: '#e4b968', fillOpacity: .12}, interactive: false}).addTo(map);
    map.attributionControl.addAttribution('Contorno: Natural Earth');
    map.zoomControl.setPosition('bottomright');
    canvas.querySelector('.leaflet-control-zoom-in').setAttribute('aria-label', 'Acercar el mapa');
    canvas.querySelector('.leaflet-control-zoom-out').setAttribute('aria-label', 'Alejar el mapa');
    clusters = L.markerClusterGroup({showCoverageOnHover: false, maxClusterRadius: 60, animate: !reducedMotion,
      iconCreateFunction: cluster => L.divIcon({className: 'church-cluster', html: `<span aria-label="${cluster.getChildCount()} sedes, acercar">${cluster.getChildCount()}</span>`, iconSize: [42, 42]})
    }).addTo(map);
    entries.forEach(entry => {
      const title = entry.element.querySelector('h3').textContent;
      entry.marker = L.marker([Number(entry.lat), Number(entry.lng)], {
        title, alt: title, keyboard: true,
        icon: L.divIcon({className: `church-pin${entry.precision === 'APROX_LOCALIDAD' ? ' church-pin-approx' : ''}`, html: `<span>${entry.number}</span>`, iconSize: [30, 30], iconAnchor: [15, 15]})
      });
      const popup = document.createElement('div');
      popup.className = 'church-popup';
      const heading = document.createElement('strong'); heading.textContent = title; popup.append(heading);
      const address = document.createElement('p'); address.textContent = entry.element.querySelector('address').textContent; popup.append(address);
      const accuracy = document.createElement('p'); accuracy.className = 'church-popup-note';
      accuracy.textContent = entry.element.querySelector('.location-precision').textContent;
      popup.append(accuracy);
      const coordinates = document.createElement('p'); coordinates.className = 'church-popup-note';
      coordinates.textContent = `Latitud: ${Number(entry.lat).toFixed(6)} · Longitud: ${Number(entry.lng).toFixed(6)}`;
      popup.append(coordinates);
      const link = entry.element.querySelector('a').cloneNode(true); popup.append(link);
      entry.marker.bindPopup(popup, {maxWidth: 265});
      entry.marker.on('click', () => select(entry));
    });
    clusters.addLayers(visible.map(entry => entry.marker));
    if (visible.length !== entries.length) fitResults();
    map.on('dragstart', () => { view = 'manual'; });
    new ResizeObserver(() => {
      map.invalidateSize({pan: false});
      if (view === 'peru') map.fitBounds(peruBounds, {padding: [12, 12], animate: false});
      else if (view === 'results') fitResults();
    }).observe(canvas);
  }

  function filter() {
    const words = normalize(search.value).split(' ').filter(Boolean);
    visible = entries.filter(entry => {
      const matches = (!region.value || entry.region === region.value) && words.every(word => entry.text.includes(word));
      entry.element.hidden = !matches;
      entry.element.classList.remove('is-selected');
      entry.element.querySelector('button').setAttribute('aria-pressed', 'false');
      return matches;
    });
    status.textContent = `${visible.length} ${visible.length === 1 ? 'sede encontrada' : 'sedes encontradas'}${region.value ? ' · ' + region.value : ''}`;
    empty.hidden = visible.length > 0;
    list.scrollTop = 0;
    section.querySelector('[data-fit-locations]').disabled = !visible.length;
    if (map) {
      map.closePopup();
      clusters.clearLayers();
      clusters.addLayers(visible.map(entry => entry.marker));
      fitResults();
    }
  }

  entries.forEach(entry => entry.element.querySelector('button').addEventListener('click', () => select(entry, true)));
  search.addEventListener('input', filter);
  region.addEventListener('change', filter);
  section.querySelector('[data-clear-locations]').addEventListener('click', () => { search.value = ''; region.value = ''; filter(); search.focus(); });
  section.querySelector('[data-fit-locations]').addEventListener('click', () => { initMap(); fitResults(); });
  section.querySelector('[data-peru-view]').addEventListener('click', () => { initMap(); view = 'peru'; if (map) map.fitBounds(peruBounds, {padding: [12, 12], animate: false}); });
  section.querySelector('.locations-filters').hidden = false;
  section.querySelector('.map-toolbar').hidden = false;
  const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { initMap(); observer.disconnect(); } }, {rootMargin: '250px'});
  observer.observe(canvas);
})();
