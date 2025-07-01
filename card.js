/* 3-D Pokémon card – vanilla JS
   --------------------------------------------------------------- */
(() => {
  const card   = document.getElementById('card');
  const bg     = card.querySelector('.bg');
  const art    = card.querySelector('.art');
  const maxRot = 10;        // deg
  const maxPar = 8;         // px parallax
  let rect, rx=0, ry=0, px=0, py=0, ticking=false;

  /* helpers ----------------------------------------------------- */
  const clamp = (v,min,max)=>Math.min(Math.max(v,min),max);

  const getPos = e => {
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return {x,y};
  };

  const update = () => {
    /* apply rotation */
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    /* parallax (art > bg) */
    bg .style.transform = `translateZ(0)      translate(${px/2}px,${py/2}px)`;
    art.style.transform = `translateZ(30px)   translate(${px}px,${py}px)`;
    ticking = false;
  };

  const requestTick = () => !ticking && (ticking = true, requestAnimationFrame(update));

  /* pointer move ----------------------------------------------- */
  const onMove = e => {
    rect = rect || card.getBoundingClientRect();
    const {x,y} = getPos(e);

    const percentX = clamp((x / rect.width),  0, 1);
    const percentY = clamp((y / rect.height), 0, 1);

    /* rotation: center = 0deg, edges = ±maxRot */
    ry =  (percentX - .5) * 2 * maxRot;   // left/right
    rx = -(percentY - .5) * 2 * maxRot;   // up/down

    /* parallax shift */
    px = -(percentX - .5) * 2 * maxPar;
    py = -(percentY - .5) * 2 * maxPar;

    /* feed custom props for sheen */
    card.style.setProperty('--sx', percentX);
    card.style.setProperty('--sy', percentY);

    requestTick();
  };

  /* enter / leave ---------------------------------------------- */
  const onEnter = () => {
    rect = card.getBoundingClientRect();
    card.classList.remove('is-out');
    card.style.transition = 'transform 0s';
  };

  const onLeave = () => {
    card.classList.add('is-out');
    card.style.transition = 'transform .4s ease-out';
    bg .style.transition  = art.style.transition = 'transform .4s ease-out';
    /* reset */
    rx = ry = px = py = 0;
    card.style.transform = '';
    bg .style.transform  = '';
    art.style.transform  = '';
  };

  /* events ------------------------------------------------------ */
  card.addEventListener('pointerenter', onEnter);
  card.addEventListener('pointermove',  throttle(onMove, 16)); // ~60 FPS
  card.addEventListener('pointerleave', onLeave);
  card.addEventListener('touchstart',   onEnter, {passive:true});
  card.addEventListener('touchmove',    throttle(onMove, 16), {passive:true});
  card.addEventListener('touchend',     onLeave);

  /* simple throttle (ms) */
  function throttle(fn, limit){
    let inThrottle;
    return function(...args){
      if(!inThrottle){
        fn.apply(this,args);
        inThrottle = true;
        setTimeout(()=>inThrottle=false, limit);
      }
    };
  }
})();
