/* Card parallax + flip 3-D */
(() => {
  const card  = document.getElementById('card');
  const inner = document.getElementById('inner');
  const bg    = card.querySelector('.bg');
  const art   = card.querySelector('.art');

  const maxRot = 10, maxPar = 8;
  let rect, rx=0, ry=0, px=0, py=0, ticking=false;

  /* helpers */
  const clamp   = (v,min,max)=>Math.min(Math.max(v,min),max);
  const flipped = () => inner.classList.contains('is-flipped');

  /* ---------- render ---------- */
  function render(){
    /* siempre rotamos la tarjeta */
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

    /* parallax solo si está al frente */
    if(!flipped()){
      bg .style.transform = `translate(${px/2}px,${py/2}px)`;
      art.style.transform = `translateZ(30px) translate(${px}px,${py}px)`;
    }
    ticking = false;
  }
  const tick = () => !ticking && (ticking=true, requestAnimationFrame(render));

  /* ---------- movimiento ---------- */
  function handleMove(e){
    rect = rect || card.getBoundingClientRect();
    const pX = ( (e.touches?e.touches[0].clientX:e.clientX) - rect.left ) / rect.width;
    const pY = ( (e.touches?e.touches[0].clientY:e.clientY) - rect.top  ) / rect.height;

    ry =  (pX-.5)*2*maxRot;
    rx = -(pY-.5)*2*maxRot;

    px = -(pX-.5)*2*maxPar;
    py = -(pY-.5)*2*maxPar;

    card.style.setProperty('--sx',pX);
    card.style.setProperty('--sy',pY);

    tick();
  }

  /* ---------- reset ---------- */
  function reset(){
    rx=ry=px=py=0;
    card.style.removeProperty('transform');
    bg .style.removeProperty('transform');
    art.style.removeProperty('transform');
  }

  /* ---------- flip ---------- */
  card.addEventListener('click',()=>{
    inner.classList.toggle('is-flipped');
    reset();                  // limpia tilt/parallax al voltear
  });

  /* ---------- listeners ---------- */
  const throttle=(fn,ms)=>{let w=false;return(...a)=>{if(w)return;fn(...a);w=true;setTimeout(()=>w=false,ms);}};

  card.addEventListener('pointerenter',()=>{rect=card.getBoundingClientRect()});
  card.addEventListener('pointermove', throttle(handleMove,16));
  card.addEventListener('pointerleave', reset);

  card.addEventListener('touchmove', throttle(handleMove,16), {passive:true});
  card.addEventListener('touchend',  reset);
})();
