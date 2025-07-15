/* Parallax + flip + holo inspirado en simeydotme ---------------- */
(() => {
  const card  = document.getElementById('card');
  const inner = document.getElementById('inner');
  const bg    = card.querySelector('.bg');
  const art   = card.querySelector('.art');
  const foil  = card.querySelector('.foil');

  const maxRot = 10;          // °
  let maxPar   = 8;           // px (2 % width)

  let rect, rx=0, ry=0, px=0, py=0, ticking=false, moveTimer;

  /* ---------- helpers ---------- */
  const clamp   = (v,min,max)=>Math.min(Math.max(v,min),max);
  const flipped = () => inner.classList.contains('is-flipped');

  function recalc(){
    rect = card.getBoundingClientRect();
    maxPar = rect.width * 0.02;
  }

  function reset(){
    rx=ry=px=py=0;
    card.style.removeProperty('transform');
    bg  .style.removeProperty('transform');
    art .style.removeProperty('transform');
    foil.style.removeProperty('background-position');
    card.style.setProperty('--holo-opacity',0);
  }

  /* ---------- render ---------- */
  function render(){
    /* tilt siempre */
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

    /* parallax & holo solo frontal */
    if(!flipped()){
      bg .style.transform = `translate(${px/2}px,${py/2}px)`;
      art.style.transform = `translateZ(30px) translate(${px}px,${py}px)`;

      /* holo grad + sparks se desplazan */
      foil.style.backgroundPosition = `
        ${px *  4}px  ${py *  4}px,    /* sparks */
        ${px * -2}px  ${py * -2}px     /* gradient */
      `;
    }

    ticking=false;
  }
  const tick = ()=>!ticking&&(ticking=true,requestAnimationFrame(render));

  /* --------- move ---------- */
  function handleMove(evt){
    const e = evt.touches ? evt.touches[0] : evt;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nx = clamp(x/rect.width ,0,1);
    const ny = clamp(y/rect.height,0,1);

    ry =  (nx-.5)*2*maxRot;
    rx = -(ny-.5)*2*maxRot;
    px = -(nx-.5)*2*maxPar;
    py = -(ny-.5)*2*maxPar;

    card.style.setProperty('--sx',nx);
    card.style.setProperty('--sy',ny);
    card.style.setProperty('--holo-x',`${nx*100}%`);
    card.style.setProperty('--holo-y',`${ny*100}%`);

    /* intensidad del holo según desplazamiento */
    const strength = Math.min(1, Math.hypot(px,py)/maxPar);
    card.style.setProperty('--holo-opacity', strength);

    /* reinicia temporizador que apaga el holo */
    clearTimeout(moveTimer);
    moveTimer = setTimeout(()=> card.style.setProperty('--holo-opacity',0),200);

    tick();
  }

  /* -------- events ---------- */
  const throttle=(fn,ms)=>{
    let wait=false;return(...a)=>{if(wait)return;fn(...a);wait=true;setTimeout(()=>wait=false,ms);}
  };

  card.addEventListener('pointerenter', ()=>{recalc();});
  card.addEventListener('pointermove',  throttle(handleMove,16));
  card.addEventListener('pointerleave', reset);

  card.addEventListener('touchstart', recalc,{passive:true});
  card.addEventListener('touchmove',  throttle(handleMove,16),{passive:true});
  card.addEventListener('touchend',   reset);

  /* flip */
  card.addEventListener('click',()=>{
    inner.classList.toggle('is-flipped');
    reset();
    if(!flipped()) recalc();
  });

  window.addEventListener('resize',recalc);
})();
