(() => {
  const dialog = document.querySelector('[data-lightbox]');
  const links = [...document.querySelectorAll('[data-gallery] a')];
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('[data-lightbox-image]');
  const count = dialog.querySelector('[data-lightbox-count]');
  const prev = dialog.querySelector('[data-lightbox-prev]');
  const next = dialog.querySelector('[data-lightbox-next]');
  let index = 0;

  function show(i) {
    index = (i + links.length) % links.length;
    const link = links[index];
    image.src = link.dataset.full;
    image.width = Number(link.dataset.width);
    image.height = Number(link.dataset.height);
    image.alt = link.querySelector('img').alt;
    count.textContent = `Foto ${index + 1} de ${links.length}`;
    const hidden = links.length < 2;
    prev.hidden = hidden; next.hidden = hidden;
    // Precargar la siguiente para que el cambio sea inmediato.
    if (!hidden) new Image().src = links[(index + 1) % links.length].dataset.full;
  }

  links.forEach((link, i) => link.addEventListener('click', event => {
    event.preventDefault();
    show(i);
    dialog.showModal();
    document.body.classList.add('menu-open');
  }));
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.classList.remove('menu-open'); links[index].focus(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });
  let startX = null;
  dialog.addEventListener('touchstart', event => { startX = event.touches[0].clientX; }, {passive: true});
  dialog.addEventListener('touchend', event => {
    if (startX === null) return;
    const dx = event.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
