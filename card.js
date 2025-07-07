/* Card: parallax + flip + responsive */
(() => {
  const card  = document.getElementById('card');
  const inner = document.getElementById('inner');   // contenedor del flip
  const bg    = card.querySelector('.bg');
  const art   = card.querySelector('.art');

  const maxRot = 10;       // grados
  let maxPar   = 8;        // px (se recalcula con el tamaño)
  let rect, rx=0, ry=0, px=0, py=0, ticking=false;

  /* ---------- util ---------- */
  const clamp = (v,min,max)=>Math.min(Math.max(v,min),max);
  const flipped = () => inner.classList.contains('is-flipped');

  const recalc = () => {                 // llama en resize / enter
    rect = card.getBoundingClientRect();
    maxPar = rect.width * 0.02;          // 2 % del ancho → feel responsive
  };

  const reset = () => {                  // borra transform inline
    rx=ry=px=py=0;
    card.style.removeProperty('transform');
    bg  .style.removeProperty('transform');
    art .style.removeProperty('transform');
  };

  /* ---------- render loop ---------- */
  const render = () => {
    if (flipped()){ticking=false;return;}          // pausa parallax volteada
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    bg .style.transform = `translate(${px/2}px,${py/2}px)`;
    art.style.transform = `translateZ(30px) translate(${px}px,${py}px)`;
    ticking=false;
  };
  const tick = () => !ticking && (ticking=true, requestAnimationFrame(render));

  /* ---------- pointer / touch move ---------- */
  const move = e => {
    if (flipped()) return;
    const x = (e.touches?e.touches[0].clientX:e.clientX) - rect.left;
    const y = (e.touches?e.touches[0].clientY:e.clientY) - rect.top;

    const nx = clamp(x/rect.width ,0,1);
    const ny = clamp(y/rect.height,0,1);

    ry =  (nx-.5)*2*maxRot;
    rx = -(ny-.5)*2*maxRot;
    px = -(nx-.5)*2*maxPar;
    py = -(ny-.5)*2*maxPar;

    card.style.setProperty('--sx',nx);
    card.style.setProperty('--sy',ny);

    tick();
  };

  /* ---------- events ---------- */
  const throttle=(fn,ms)=>{
    let wait=false;return(...a)=>{if(wait)return;fn(...a);wait=true;setTimeout(()=>wait=false,ms);}
  };

  card.addEventListener('pointerenter',()=>{recalc();});
  card.addEventListener('pointermove',throttle(move,16));
  card.addEventListener('pointerleave',reset);

  card.addEventListener('touchstart',recalc,{passive:true});
  card.addEventListener('touchmove',throttle(move,16),{passive:true});
  card.addEventListener('touchend',reset);

  /* flip */
  card.addEventListener('click',()=>{
    inner.classList.toggle('is-flipped');
    reset();                           // centra antes de girar
  });

  /* responsive: reajusta en resize/orientationchange */
  window.addEventListener('resize',recalc);
})();
