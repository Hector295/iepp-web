(() => {
  const section = document.querySelector('#sedes');
  const search = section.querySelector('#location-search');
  const clearSearch = section.querySelector('[data-clear-search]');
  const regionButtons = [...section.querySelectorAll('.finder-regions [data-region]')];
  const status = section.querySelector('#location-count');
  const empty = section.querySelector('.locations-empty');
  const list = section.querySelector('.locations-directory');
  const more = section.querySelector('[data-more]');
  const nearButton = section.querySelector('[data-near]');
  const resetOrder = section.querySelector('[data-reset-order]');
  const canvas = section.querySelector('#church-map');
  const PAGE = 12;
  const normalize = value => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim();
  const entries = [...list.querySelectorAll('.location-entry')].map((element, order) => {
    const text = normalize(element.dataset.search);
    return {
      element, order, text, tokens: text.split(' '), marker: null, distance: null,
      number: element.dataset.number, region: element.dataset.region,
      lat: element.dataset.lat ? Number(element.dataset.lat) : null, lng: element.dataset.lng ? Number(element.dataset.lng) : null,
      approx: 'approx' in element.dataset, name: element.querySelector('h3').textContent,
      href: element.querySelector('h3 a').getAttribute('href'),
    };
  });
  const pinned = entries.filter(entry => entry.lat !== null);
  let map, clusters, userMarker;
  let view = 'peru';
  let region = '';
  let visible = entries;
  let shown = PAGE;
  let sortedByDistance = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const peruBounds = [[-18.35, -81.42], [-.05, -68.65]];
  const scrollTo = element => element.scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth', block: 'center'});

  // Tolerar errores de escritura: «chiclaio», «inkahuasi» o «mutupe» también encuentran la iglesia.
  function close(word, token) {
    if (word.length < 4) return false;
    const limit = word.length >= 7 ? 2 : 1;
    const target = token.slice(0, word.length + limit);
    if (Math.abs(target.length - word.length) > limit) return false;
    let prev = Array.from({length: target.length + 1}, (_, i) => i);
    for (let i = 1; i <= word.length; i++) {
      const row = [i];
      for (let j = 1; j <= target.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (word[i - 1] === target[j - 1] ? 0 : 1));
      prev = row;
    }
    return Math.min(...prev.slice(Math.max(0, word.length - limit))) <= limit;
  }

  function select(entry, fromList = false) {
    entries.forEach(item => {
      const active = item === entry;
      item.element.classList.toggle('is-selected', active);
      item.element.querySelector('.location-map-button')?.setAttribute('aria-pressed', String(active));
    });
    if (fromList) {
      initMap();
      if (!map) return;
      view = 'selected';
      map.setView(entry.marker.getLatLng(), entry.approx ? 13 : 17, {animate: false});
      clusters.zoomToShowLayer(entry.marker, () => entry.marker.openPopup());
      if (matchMedia('(max-width: 900px)').matches) scrollTo(canvas);
    } else if (entry.element.hidden) {
      shown = visible.indexOf(entry) + 1;
      render();
      scrollTo(entry.element);
    }
  }

  function fitResults() {
    view = 'results';
    const points = visible.filter(entry => entry.lat !== null).map(entry => [entry.lat, entry.lng]);
    if (sortedByDistance && userMarker) points.splice(4, Infinity, userMarker.getLatLng());
    if (map && points.length) map.fitBounds(points, {padding: [45, 45], maxZoom: points.length === 1 ? 15 : 13, animate: false});
  }

  function popupFor(entry) {
    const popup = document.createElement('div');
    popup.className = 'church-popup';
    const heading = document.createElement('strong'); heading.textContent = entry.name; popup.append(heading);
    const city = document.createElement('p'); city.textContent = entry.element.querySelector('.location-city').textContent; popup.append(city);
    if (entry.approx) { const note = document.createElement('p'); note.className = 'church-popup-note'; note.textContent = 'Ubicación aproximada'; popup.append(note); }
    const link = document.createElement('a'); link.href = entry.href; link.className = 'church-popup-link'; link.textContent = 'Ver esta iglesia'; popup.append(link);
    return popup;
  }

  function initMap() {
    if (map) return;
    if (!window.L || !L.markerClusterGroup) {
      section.querySelector('#map-status').textContent = 'El mapa no está disponible en este momento. Puedes buscar tu iglesia en la lista.';
      return;
    }
    map = L.map(canvas, {minZoom: 4, maxZoom: 18, scrollWheelZoom: false, zoomAnimation: !reducedMotion, fadeAnimation: !reducedMotion}).fitBounds(peruBounds, {padding: [12, 12]});
    L.geoJSON(JSON.parse(section.querySelector('#peru-geometry').textContent), {style: {color: '#b88a35', weight: 1.5, fillColor: '#e4b968', fillOpacity: .12}, interactive: false}).addTo(map);
    map.attributionControl.addAttribution('Contorno: Natural Earth');
    map.zoomControl.setPosition('bottomright');
    canvas.querySelector('.leaflet-control-zoom-in').setAttribute('aria-label', 'Acercar el mapa');
    canvas.querySelector('.leaflet-control-zoom-out').setAttribute('aria-label', 'Alejar el mapa');
    clusters = L.markerClusterGroup({showCoverageOnHover: false, maxClusterRadius: 60, animate: !reducedMotion,
      iconCreateFunction: cluster => L.divIcon({className: 'church-cluster', html: `<span aria-label="${cluster.getChildCount()} iglesias, acercar">${cluster.getChildCount()}</span>`, iconSize: [46, 46]})
    }).addTo(map);
    pinned.forEach(entry => {
      entry.marker = L.marker([entry.lat, entry.lng], {
        title: entry.name, alt: entry.name, keyboard: true,
        icon: L.divIcon({className: `church-pin${entry.approx ? ' church-pin-approx' : ''}`, html: `<span>${entry.number}</span>`, iconSize: [34, 34], iconAnchor: [17, 17]})
      });
      entry.marker.bindPopup(popupFor(entry), {maxWidth: 265});
      entry.marker.on('click', () => select(entry));
    });
    clusters.addLayers(visible.filter(entry => entry.marker).map(entry => entry.marker));
    if (visible.length !== entries.length) fitResults();
    map.on('dragstart', () => { view = 'manual'; });
    new ResizeObserver(() => {
      map.invalidateSize({pan: false});
      if (view === 'peru') map.fitBounds(peruBounds, {padding: [12, 12], animate: false});
      else if (view === 'results') fitResults();
    }).observe(canvas);
  }

  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const km = meters => meters < 1000 ? 'A menos de 1 km de ti' : `A ${(meters / 1000).toLocaleString('es-PE', {maximumFractionDigits: meters < 10000 ? 1 : 0})} km de ti`;

  function render() {
    entries.forEach(entry => { entry.element.hidden = true; });
    visible.forEach((entry, index) => {
      entry.element.hidden = index >= shown;
      list.append(entry.element);
    });
    const remaining = visible.length - Math.min(shown, visible.length);
    more.hidden = remaining <= 0;
    more.textContent = `Ver ${plural(Math.min(remaining, PAGE), 'iglesia más', 'iglesias más')} (quedan ${remaining})`;
  }

  function filter({keepPage = false, fuzzyNote = true} = {}) {
    const query = search.value.trim();
    const words = normalize(query).split(' ').filter(Boolean);
    const inRegion = entries.filter(entry => !region || entry.region === region);
    let fuzzy = false;
    visible = inRegion.filter(entry => words.every(word => entry.text.includes(word)));
    if (!visible.length && words.length) {
      visible = inRegion.filter(entry => words.every(word => entry.text.includes(word) || entry.tokens.some(token => close(word, token))));
      fuzzy = visible.length > 0;
    }
    visible.sort((a, b) => sortedByDistance ? (a.distance ?? Infinity) - (b.distance ?? Infinity) : a.order - b.order);
    if (!keepPage) shown = PAGE;
    entries.forEach(entry => {
      entry.element.classList.remove('is-selected');
      entry.element.querySelector('.location-map-button')?.setAttribute('aria-pressed', 'false');
    });
    render();

    const where = region ? ` en la región ${region}` : '';
    let message = query
      ? `${visible.length ? 'Encontramos ' + plural(visible.length, 'iglesia', 'iglesias') : 'No encontramos iglesias'} para «${query}»${where}`
      : `Mostrando ${visible.length === entries.length ? 'las ' + entries.length + ' iglesias' : plural(visible.length, 'iglesia', 'iglesias') + where}`;
    if (fuzzy && fuzzyNote) message += '. Te mostramos nombres parecidos';
    if (sortedByDistance && visible.length) message += '. Ordenadas de la más cercana a la más lejana';
    status.textContent = message + '.';
    empty.hidden = visible.length > 0;
    clearSearch.hidden = !search.value;
    section.querySelector('[data-fit-locations]').disabled = !visible.some(entry => entry.lat !== null);
    if (map) {
      map.closePopup();
      clusters.clearLayers();
      clusters.addLayers(visible.filter(entry => entry.marker).map(entry => entry.marker));
      fitResults();
    }
  }

  function setRegion(value) {
    region = value;
    regionButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.region === value)));
    filter();
  }

  function locate() {
    const label = nearButton.lastChild;
    const original = label.textContent;
    if (!navigator.geolocation) {
      status.textContent = 'Tu equipo no permite conocer tu ubicación. Escribe el nombre de tu ciudad en el buscador.';
      return;
    }
    nearButton.disabled = true;
    label.textContent = ' Buscando tu ubicación…';
    navigator.geolocation.getCurrentPosition(position => {
      nearButton.disabled = false;
      label.textContent = original;
      const {latitude, longitude} = position.coords;
      const rad = Math.PI / 180;
      entries.forEach(entry => {
        const distanceEl = entry.element.querySelector('.location-distance');
        if (entry.lat === null) { entry.distance = null; distanceEl.hidden = true; return; }
        const a = Math.sin((entry.lat - latitude) * rad / 2) ** 2 + Math.cos(latitude * rad) * Math.cos(entry.lat * rad) * Math.sin((entry.lng - longitude) * rad / 2) ** 2;
        entry.distance = 12742000 * Math.asin(Math.sqrt(a));
        distanceEl.textContent = km(entry.distance) + (entry.approx ? ' (aproximado)' : '');
        distanceEl.hidden = false;
      });
      sortedByDistance = true;
      resetOrder.hidden = false;
      search.value = '';
      region = '';
      regionButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.region === '')));
      initMap();
      if (map) {
        if (userMarker) userMarker.remove();
        userMarker = L.marker([latitude, longitude], {title: 'Tu ubicación', alt: 'Tu ubicación', icon: L.divIcon({className: 'user-pin', html: '<span>Tú</span>', iconSize: [40, 40], iconAnchor: [20, 20]})}).addTo(map);
      }
      filter();
      scrollTo(status);
    }, error => {
      nearButton.disabled = false;
      label.textContent = original;
      status.textContent = error.code === error.PERMISSION_DENIED
        ? 'No diste permiso para usar tu ubicación. Puedes escribir el nombre de tu ciudad en el buscador.'
        : 'No pudimos conocer tu ubicación. Inténtalo de nuevo o escribe el nombre de tu ciudad en el buscador.';
    }, {enableHighAccuracy: false, timeout: 15000, maximumAge: 300000});
  }

  entries.forEach(entry => entry.element.querySelector('.location-map-button')?.addEventListener('click', () => select(entry, true)));
  search.addEventListener('input', () => filter());
  search.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); search.blur(); scrollTo(status); } });
  clearSearch.addEventListener('click', () => { search.value = ''; filter(); search.focus(); });
  regionButtons.forEach(button => button.addEventListener('click', () => setRegion(button.dataset.region)));
  more.addEventListener('click', () => {
    const first = visible[shown];
    shown += PAGE;
    render();
    first?.element.querySelector('h3 a').focus({preventScroll: true});
  });
  nearButton.addEventListener('click', locate);
  resetOrder.addEventListener('click', () => {
    sortedByDistance = false;
    resetOrder.hidden = true;
    entries.forEach(entry => { entry.distance = null; entry.element.querySelector('.location-distance').hidden = true; });
    userMarker?.remove(); userMarker = null;
    filter();
  });
  section.querySelector('[data-clear-locations]').addEventListener('click', () => { search.value = ''; setRegion(''); search.focus(); });
  section.querySelector('[data-fit-locations]').addEventListener('click', () => { initMap(); fitResults(); });
  section.querySelector('[data-peru-view]').addEventListener('click', () => { initMap(); view = 'peru'; if (map) map.fitBounds(peruBounds, {padding: [12, 12], animate: false}); });
  section.querySelector('[data-finder]').hidden = false;
  section.querySelector('.map-toolbar').hidden = false;
  render();
  const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { initMap(); observer.disconnect(); } }, {rootMargin: '250px'});
  observer.observe(canvas);
})();
