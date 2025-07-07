/* Card 3-D responsive + flip
   --------------------------------------------------------------- */
(() => {
  const card  = document.getElementById('card');   // exterior: tilt + sheen
  const inner = document.getElementById('inner');  // interior: hace el flip
  const bg    = card.querySelector('.bg');         // capa fondo
  const art   = card.querySelector('.art');        // capa frontal

  const maxRot = 10;   // grados máximo de inclinación
  let   maxPar = 8;    // px de parallax (se recalcula según tamaño)

  let rect, rx = 0, ry = 0, px = 0, py = 0, ticking = false;

  /* ---------- utilidades ---------- */
  const clamp   = (v, min, max) => Math.min(Math.max(v, min), max);
  const flipped = () => inner.classList.contains('is-flipped');

  /* recalcula bounding-box y parallax */
  function recalc() {
    rect   = card.getBoundingClientRect();
    maxPar = rect.width * 0.02;   // 2 % del ancho
  }

  /* limpia transforms inline */
  function reset() {
    rx = ry = px = py = 0;
    card.style.removeProperty('transform');
    bg  .style.removeProperty('transform');
    art .style.removeProperty('transform');
  }

  /* ---------- render loop ---------- */
  function render() {
    /* siempre inclina la carta (X / Y) */
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

    /* parallax sólo cuando la cara frontal mira al usuario */
    if (!flipped()) {
      bg .style.transform = `translate(${px / 2}px, ${py / 2}px)`;
      art.style.transform = `translateZ(30px) translate(${px}px, ${py}px)`;
    }

    ticking = false;
  }
  const tick = () =>
    !ticking && (ticking = true, requestAnimationFrame(render));

  /* ---------- pointer / touch move ---------- */
  function handleMove(e) {
    const evt = e.touches ? e.touches[0] : e;
    const x   = evt.clientX - rect.left;
    const y   = evt.clientY - rect.top;

    const nx = clamp(x / rect.width , 0, 1);
    const ny = clamp(y / rect.height, 0, 1);

    ry =  (nx - 0.5) * 2 * maxRot;   // izquierda-derecha
    rx = -(ny - 0.5) * 2 * maxRot;   // arriba-abajo
    px = -(nx - 0.5) * 2 * maxPar;   // parallax X
    py = -(ny - 0.5) * 2 * maxPar;   // parallax Y

    card.style.setProperty('--sx', nx);
    card.style.setProperty('--sy', ny);

    tick();
  }

  /* ---------- eventos ---------- */
  const throttle = (fn, ms) => {
    let wait = false;
    return (...args) => {
      if (wait) return;
      fn(...args);
      wait = true;
      setTimeout(() => (wait = false), ms);
    };
  };

  card.addEventListener('pointerenter', () => { recalc(); });
  card.addEventListener('pointermove',  throttle(handleMove, 16));
  card.addEventListener('pointerleave', reset);

  card.addEventListener('touchstart', recalc, { passive: true });
  card.addEventListener('touchmove',  throttle(handleMove, 16), { passive: true });
  card.addEventListener('touchend',   reset);

  /* ---------- flip ---------- */
  card.addEventListener('click', () => {
    inner.classList.toggle('is-flipped');
    reset();                 // centra antes / después del giro
    if (!flipped()) recalc(); // recalcula al volver al frente
  });

  /* responsive: se reajusta en resize / orientación */
  window.addEventListener('resize', recalc);
})();
