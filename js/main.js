// RIDE · interacciones de la página
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const mobile = matchMedia('(max-width: 760px)');
  const WA = 'https://wa.me/5492966404285?text=';

  /* ---------- loader ---------- */
  const bar = $('#loaderBar'), pct = $('#loaderPct');
  let p = 0, done = false;
  if (new URLSearchParams(location.search).has('x')) { p = 99; }
  const fake = setInterval(() => { p = Math.min(p + Math.random() * 9, done ? 100 : 92); bar.style.width = p + '%'; pct.textContent = String(Math.round(p)).padStart(2, '0'); if (p >= 100) { clearInterval(fake); finish(); } }, 70);
  function ready() { done = true; }
  // espera el motor 3D (o 4 s como máximo)
  const t0 = performance.now();
  (function wait() { if (document.documentElement.classList.contains('engine-ready') || performance.now() - t0 > 4000) ready(); else requestAnimationFrame(wait); })();
  function finish() { $('#loader').classList.add('done'); intro(); }

  /* ---------- intro del hero ---------- */
  function intro() {
    if (!window.gsap) { $$('.hero__title .ln>span').forEach(s => s.style.transform = 'none'); return; }
    gsap.to('.hero__title .ln>span', { y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.1 });
    gsap.from('.hero__copy .kicker, .hero__sub, .hero__ctas, .hero__hud', { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.35 });
    gsap.from('.nav', { opacity: 0, y: -20, duration: 0.8, delay: 0.3 });
  }

  /* ---------- nav ---------- */
  const nav = $('#nav'); let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hide', y > lastY && y > innerHeight * 0.8 && !document.body.classList.contains('menu-open'));
    lastY = y;
    $('.wa-float').classList.toggle('on', y > innerHeight * 0.6);
  }, { passive: true });
  $('#burger').addEventListener('click', () => document.body.classList.toggle('menu-open'));
  $$('#menu a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));

  /* ---------- brillo del carbono siguiendo el puntero ---------- */
  addEventListener('pointermove', e => {
    document.documentElement.style.setProperty('--lx', (e.clientX / innerWidth * 100).toFixed(1) + '%');
    document.documentElement.style.setProperty('--ly', (e.clientY / innerHeight * 100).toFixed(1) + '%');
  }, { passive: true });

  /* ---------- palabras que se encienden con el scroll ---------- */
  $$('.reveal-words').forEach(el => {
    const walk = n => {
      [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) frag.append(t); else { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.append(s); } });
          c.replaceWith(frag);
        } else if (c.nodeType === 1) walk(c);
      });
    };
    walk(el);
    const words = $$('.w', el);
    const upd = () => {
      const r = el.getBoundingClientRect();
      const prog = Math.min(Math.max((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), 0), 1);
      const n = Math.round(prog * words.length * 1.15);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  });

  /* ---------- reveal genérico ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: 0.2 });
  $$('.reveal-up, .step').forEach((el, i) => { if (el.classList.contains('step')) el.style.transitionDelay = (i % 4) * 0.15 + 's'; io.observe(el); });
  $$('.step').forEach((s, i) => s.style.setProperty('transition-delay', ''));
  const stepIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { $$('.step').forEach((s, i) => setTimeout(() => s.classList.add('on'), i * 220)); stepIO.disconnect(); } }), { threshold: 0.3 });
  stepIO.observe($('.steps'));

  /* ---------- servicios: paneles que se abren solos ---------- */
  const items = $$('.svc__item'); let cur = 0, auto;
  const open = i => { cur = i; items.forEach((it, k) => it.classList.toggle('is-open', k === i)); };
  const loop = () => { clearInterval(auto); auto = setInterval(() => open((cur + 1) % items.length), 4200); };
  items.forEach((it, i) => {
    it.addEventListener('click', () => { open(i); loop(); });
    it.addEventListener('mouseenter', () => { if (!mobile.matches) { open(i); loop(); } });
  });
  new IntersectionObserver(([e]) => e.isIntersecting ? loop() : clearInterval(auto), { threshold: 0.25 }).observe($('#svc'));

  /* ---------- ruta 3 ---------- */
  const route = $('#route');
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    const line = $('.route__line');
    line.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(.7,0,.2,1)';
    line.style.strokeDashoffset = '500'; // hasta Río Gallegos (mitad del recorrido)
    route.style.setProperty('--rp', '0%');
    let k = 0; const iv = setInterval(() => { k += 2; route.querySelector('.route__stops').style.setProperty('--rp', Math.min(k, 50) + '%'); if (k >= 50) clearInterval(iv); }, 30);
    $$('.stop', route).forEach((s, i) => { s.style.opacity = 0; s.style.transform = 'translateY(10px)'; s.style.transition = `opacity .6s ${0.2 + i * 0.25}s, transform .6s ${0.2 + i * 0.25}s`; requestAnimationFrame(() => { s.style.opacity = 1; s.style.transform = 'none'; }); });
  }, { threshold: 0.4 }).observe(route);

  /* ---------- tienda ---------- */
  const PRODUCTS = [
    { cat: 'herramientas', brand: 'Motion Pro', name: 'Llave de torque de precisión', img: 'herr-llave' },
    { cat: 'herramientas', brand: 'Motion Pro', name: 'Juego de tubos y crique para moto', img: 'herr-tubos' },
    { cat: 'herramientas', brand: 'Motion Pro', name: 'Organizador de tubos con encastre', img: 'herr-rojo' },
    { cat: 'generadores', brand: 'Grupos electrógenos', name: 'Generadores a nafta · varias potencias', img: 'generador-1' },
    { cat: 'generadores', brand: 'Grupos electrógenos', name: 'Motores de reemplazo y repuestos', img: 'generador-2' },
    { cat: 'repuestos', brand: 'Frenos', name: 'Pastillas, discos y líquido de freno', img: 'brembo-2' },
    { cat: 'repuestos', brand: 'Encendido', name: 'Bujías iridium y estándar', img: 'bujia' },
    { cat: 'repuestos', brand: 'Suspensión', name: 'Retenes, aceite de horquilla y rodamientos', img: 'suspension' },
  ];
  const rail = $('#rail');
  rail.innerHTML = PRODUCTS.map(p => `
    <article class="prod" data-cat="${p.cat}">
      <div class="prod__img"><img src="img/m/${p.img}.jpg" alt="${p.name}" loading="lazy" draggable="false"></div>
      <div class="prod__b"><span class="mono">${p.brand}</span><h4>${p.name}</h4>
        <a href="${WA + encodeURIComponent('Hola Ride! Quería consultar por: ' + p.name)}" target="_blank" rel="noopener">Consultar stock <b>»</b></a></div>
    </article>`).join('');
  const filter = f => {
    $$('.filters button').forEach(b => b.classList.toggle('is-on', b.dataset.f === f));
    $$('.prod').forEach(pr => pr.classList.toggle('hid', f !== 'all' && pr.dataset.cat !== f));
    rail.scrollTo({ left: 0, behavior: 'smooth' });
  };
  $$('.filters button').forEach(b => b.addEventListener('click', () => filter(b.dataset.f)));
  $$('.cat').forEach(c => c.addEventListener('click', () => filter(c.dataset.filter)));
  // arrastrar el riel con el mouse
  let down = false, sx = 0, sl = 0, moved = false;
  rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add('drag'); });
  addEventListener('pointerup', () => { down = false; rail.classList.remove('drag'); });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; rail.scrollLeft = sl - dx; });
  rail.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);

  /* ---------- parallax (GSAP) ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    $$('.parallax img').forEach(img => gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('.parallax-in img').forEach((img, i) => gsap.fromTo(img, { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('.parallax-in').forEach((f, i) => gsap.from(f, { clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'expo.out', delay: i * 0.12, scrollTrigger: { trigger: f, start: 'top 85%' } }));
    // el motor se aleja y se apaga al bajar del hero
    gsap.to('.hero__stage', { yPercent: 18, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__copy', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });
    gsap.from('.contact__big svg', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.contact', start: 'top 75%' } });
  }
})();
