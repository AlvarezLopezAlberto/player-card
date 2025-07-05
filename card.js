/* Card 3-D + Flip — vanilla JS */
(() => {
  const card = document.getElementById('card');
  const bg   = card.querySelector('.bg');
  const art  = card.querySelector('.art');

  const maxRot = 10;      // ° inclinación
  const maxPar = 8;       // px parallax
  let rect, rx=0, ry=0, px=0, py=0, ticking=false;

  /* utilidades */
  const clamp = (v,min,max)=>Math.min(Math.max(v,min),max);
  const isFlipped = () => card.classList.contains('is-flipped');

  /* reset parallax y rotaciones */
  function resetTransforms(){
    rx=ry=px=py=0;
    bg .style.removeProperty('transform');
    art.style.removeProperty('transform');
    card.style.removeProperty('transform');   // deja que el CSS (.is-flipped) mande
  }

  /* ---- Render ----------------------------------------------- */
  const render = () => {
    if (isFlipped()){ ticking=false; return; }   // nada si está volteada
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    bg .style.transform = `translateZ(0)      translate(${px/2}px,${py/2}px)`;
    art.style.transform = `translateZ(30px)   translate(${px}px,${py}px)`;
    ticking=false;
  };
  const tick = () => !ticking && (ticking=true, requestAnimationFrame(render));

  /* ---- Movimiento ------------------------------------------- */
  function handleMove(e){
    if (isFlipped()) return;
    rect = rect || card.getBoundingClientRect();
    const x = (e.touches?e.touches[0].clientX:e.clientX) - rect.left;
    const y = (e.touches?e.touches[0].clientY:e.clientY) - rect.top;

    const nx = clamp(x / rect.width ,0,1);
    const ny = clamp(y / rect.height,0,1);

    ry =  (nx-.5)*2*maxRot;
    rx = -(ny-.5)*2*maxRot;
    px = -(nx-.5)*2*maxPar;
    py = -(ny-.5)*2*maxPar;

    card.style.setProperty('--sx',nx);
    card.style.setProperty('--sy',ny);

    tick();
  }

  /* ---- Hover enter / leave ---------------------------------- */
  function enter(){
    if (isFlipped()) return;
    rect = card.getBoundingClientRect();
    card.classList.remove('is-out');
    card.style.transition='transform 0s';
  }
  function leave(){
    card.classList.add('is-out');
    card.style.transition='transform .4s ease-out';
    bg .style.transition = art.style.transition = 'transform .4s ease-out';
    resetTransforms();
  }

  /* ---- Flip -------------------------------------------------- */
  card.addEventListener('click', () => {
    const nowFlipped = !isFlipped();          // estado después del toggle
    card.classList.toggle('is-flipped');

    if (nowFlipped){
      /* vamos a la contra-cara → congela parallax y centra */
      resetTransforms();
    }else{
      /* volvemos al frente → recalc rect y reactiva */
      rect = card.getBoundingClientRect();
    }
  });

  /* ---- Listeners (con throttle) ------------------------------ */
  const throttle = (fn,ms)=>{
    let wait=false;
    return (...a)=>{
      if(wait) return;
      fn(...a); wait=true; setTimeout(()=>wait=false,ms);
    };
  };

  card.addEventListener('pointerenter', enter);
  card.addEventListener('pointermove',  throttle(handleMove,16));
  card.addEventListener('pointerleave', leave);

  card.addEventListener('touchstart', enter,  {passive:true});
  card.addEventListener('touchmove',  throttle(handleMove,16), {passive:true});
  card.addEventListener('touchend',   leave);
})();
