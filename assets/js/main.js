/* ==========================================================================
   Waviprint — interactie & beweging
   GSAP + ScrollTrigger + Lenis. Alles respecteert prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";
  window.__wvReady = true;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = !!window.gsap;
  const root = document.documentElement;

  /* ---------- Gedeelde data: catalogus metalen dozen ---------- */
  const MODELS = [
    { id: "rond-s", name: "Ronde doos S", shape: "rond_s", vorm: "rond", size: "Ø 100 × 45 mm", colors: ["zilver", "goud", "wit", "zwart"], art: "bakkerij", use: "Koekjes, snoep, kaarsen" },
    { id: "rond-l", name: "Ronde doos L", shape: "rond", vorm: "rond", size: "Ø 150 × 70 mm", colors: ["goud", "zilver", "wit", "inkt"], art: "confetti", use: "Koekjes, chocolade, geschenken" },
    { id: "rechthoek", name: "Rechthoekige doos", shape: "rechthoek", vorm: "rechthoekig", size: "160 × 110 × 50 mm", colors: ["zilver", "goud", "zwart", "wit"], art: "strepen", use: "Pralines, relatiegeschenken" },
    { id: "plat", name: "Platte doos", shape: "plat", vorm: "rechthoekig", size: "190 × 60 × 20 mm", colors: ["zwart", "zilver", "inkt"], art: "cadeau", use: "Chocoladerepen, pennen, accessoires" },
    { id: "vierkant", name: "Vierkante doos", shape: "vierkant", vorm: "vierkant", size: "120 × 120 × 70 mm", colors: ["wit", "zilver", "goud", "koraal"], art: "thee", use: "Thee, koffie, cosmetica" },
    { id: "hart", name: "Hartvormige doos", shape: "hart", vorm: "hart", size: "140 × 130 × 45 mm", colors: ["koraal", "zilver", "goud", "wit"], art: "cadeau", use: "Pralines, huwelijk, Valentijn" },
    { id: "koker", name: "Hoge koker", shape: "hoog", vorm: "rond", size: "Ø 75 × 120 mm", colors: ["inkt", "zilver", "zwart", "goud"], art: "thee", use: "Thee, koffie, kruiden" },
    { id: "scharnier", name: "Scharnierdoos", shape: "scharnier", vorm: "rechthoekig", size: "95 × 60 × 20 mm", colors: ["zilver", "zwart", "wit", "koraal"], art: "strepen", use: "Pepermunt, balsem, kleine accessoires" }
  ];
  const COLOR_LABEL = { zilver: "Zilver", goud: "Goud", wit: "Wit", zwart: "Zwart", inkt: "Inktblauw", koraal: "Koraal" };
  const COLOR_HEX = { zilver: "#D3D7DE", goud: "#D9B661", wit: "#FFFFFF", zwart: "#2B2F3B", inkt: "#1D2560", koraal: "#F9423A" };
  window.WAVI_MODELS = MODELS;

  const ICON_ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>`;
  const btnIcon = () => `<span class="btn-icon">${ICON_ARROW}${ICON_ARROW}</span>`;

  /* ---------- Lenis (zacht scrollen) ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGsap) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  } else if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Navigatie ---------- */
  const nav = $(".nav");
  const toggle = $(".nav-toggle");
  let menuOpen = false;
  function setMenu(open) {
    menuOpen = open;
    document.body.classList.toggle("menu-open", open);
    toggle && toggle.setAttribute("aria-expanded", String(open));
    toggle && toggle.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
    $(".menu") && $(".menu").setAttribute("aria-hidden", String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open) nav.classList.remove("is-hidden");
  }
  toggle && toggle.addEventListener("click", () => setMenu(!menuOpen));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) { setMenu(false); toggle.focus(); } });
  $$(".menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // Verbergen bij naar beneden scrollen, tonen bij omhoog
  // Pas wisselen na een duidelijke beweging in één richting (geen geflikker bij trage scroll)
  let lastY = window.scrollY, dir = 0, travel = 0;
  const onScroll = () => {
    if (!nav) return;
    const y = window.scrollY, d = y - lastY;
    nav.classList.toggle("is-solid", y > 40);
    lastY = y;
    if (menuOpen || y < 120) { nav.classList.remove("is-hidden"); dir = 0; travel = 0; return; }
    if (d === 0) return;
    const s = Math.sign(d);
    if (s !== dir) { dir = s; travel = 0; }
    travel += Math.abs(d);
    if (travel < 40) return;
    if (dir > 0) nav.classList.add("is-hidden"); else nav.classList.remove("is-hidden");
  };
  if (lenis) lenis.on("scroll", onScroll); else window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Pagina-overgang: inktgordijn met golven ---------- */
  const curtain = $(".curtain");
  const sheet = curtain && $(".sheet", curtain);
  function curtainIn(href) {
    if (!curtain || reduce || !hasGsap) { window.location.href = href; return; }
    curtain.style.visibility = "visible";
    try { sessionStorage.setItem("wv-curtain", "1"); } catch (e) {}
    gsap.fromTo(sheet, { yPercent: 105 }, { yPercent: 0, duration: .75, ease: "expo.inOut", onComplete: () => { window.location.href = href; } });
    gsap.to($(".mark", curtain), { opacity: 1, duration: .3, delay: .5 });
  }
  function curtainOut() {
    let flag = null;
    try { flag = sessionStorage.getItem("wv-curtain"); sessionStorage.removeItem("wv-curtain"); } catch (e) {}
    if (!curtain || !flag || reduce || !hasGsap) return;
    curtain.style.visibility = "visible";
    gsap.set(sheet, { yPercent: 0 });
    gsap.set($(".mark", curtain), { opacity: 1 });
    gsap.to($(".mark", curtain), { opacity: 0, duration: .25 });
    gsap.to(sheet, { yPercent: -110, duration: .9, ease: "expo.inOut", delay: .05, onComplete: () => { curtain.style.visibility = "hidden"; } });
  }
  curtainOut();
  window.addEventListener("pageshow", (e) => { if (e.persisted && curtain) { curtain.style.visibility = "hidden"; hasGsap && gsap.set(sheet, { yPercent: 105 }); } });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    e.preventDefault();
    curtainIn(url.href);
  });

  /* ---------- Knoppen: button-in-button pijl + magnetisch ---------- */
  $$(".btn[data-arrow]").forEach((b) => b.insertAdjacentHTML("beforeend", btnIcon()));
  if (fine && !reduce && hasGsap) {
    $$(".btn[data-magnetic]").forEach((b) => {
      const xTo = gsap.quickTo(b, "x", { duration: .6, ease: "elastic.out(1, .5)" });
      const yTo = gsap.quickTo(b, "y", { duration: .6, ease: "elastic.out(1, .5)" });
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .18);
        yTo((e.clientY - r.top - r.height / 2) * .28);
      });
      b.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Beweging ---------- */
  function motion() {
    if (!hasGsap) { root.classList.remove("js"); return; }
    if (reduce) {
      gsap.set("[data-reveal], .split-line > span", { opacity: 1, y: 0, yPercent: 0, clearProps: "transform" });
      gsap.set(".ps-plain", { opacity: 0 });
      gsap.set(".ps-gold, .uv-stage .tins-scope", { "--print": 1 });
      $$(".print-step").forEach((s) => s.classList.add("is-active"));
      return;
    }

    // Titels: regel per regel omhoog uit een masker
    $$("[data-split]").forEach((h, i) => {
      const inHero = !!h.closest(".hero, .page-hero");
      gsap.to($$(".split-line > span", h), {
        yPercent: 0, y: 0, duration: 1.25, ease: "expo.out", stagger: .09, delay: inHero ? .15 : 0,
        scrollTrigger: inHero ? null : { trigger: h, start: "top 85%", once: true }
      });
    });

    // Elementen die binnenkomen (hero meteen, de rest bij het scrollen)
    gsap.set("[data-reveal]", { y: 40, opacity: 0 });
    const vh = window.innerHeight * .92;
    const heroReveals = $$("[data-reveal]").filter((el) => el.closest(".hero, .page-hero") || el.getBoundingClientRect().top < vh);
    gsap.to(heroReveals, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: .09, delay: .45 });
    ScrollTrigger.batch($$("[data-reveal]").filter((el) => !heroReveals.includes(el)), {
      start: "top 88%", once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: .08, overwrite: true })
    });

    // Golven: lichte parallax per laag
    $$(".waves[data-parallax]").forEach((w) => {
      $$(".wave", w).forEach((p, i) => {
        gsap.to(p.querySelector("path"), { x: (i % 2 ? 1 : -1) * (60 + i * 40), ease: "none", scrollTrigger: { trigger: w, start: "top bottom", end: "bottom top", scrub: 1.2 } });
      });
    });

    // Hero-objecten: zweven, scroll-parallax en muis
    const objs = $$(".hero-objects > *");
    if (objs.length) {
      objs.forEach((o, i) => {
        gsap.from(o, { y: 80 + i * 20, opacity: 0, rotate: (i % 2 ? 8 : -8), scale: .9, duration: 1.6, ease: "expo.out", delay: .35 + i * .12 });
        gsap.to(o.firstElementChild || o, { y: i % 2 ? -10 : 10, rotate: i % 2 ? 2 : -2, duration: 3.2 + i * .6, ease: "sine.inOut", yoyo: true, repeat: -1 });
        gsap.to(o, { yPercent: -18 - i * 10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      });
      if (fine) {
        const hero = objs[0].closest("section");
        const movers = objs.map((o, i) => ({ x: gsap.quickTo(o, "x", { duration: 1.2, ease: "power3.out" }), y: gsap.quickTo(o, "y", { duration: 1.2, ease: "power3.out" }), f: (i + 1) * 7 }));
        hero.addEventListener("pointermove", (e) => {
          const nx = e.clientX / window.innerWidth - .5, ny = e.clientY / window.innerHeight - .5;
          movers.forEach((m) => { m.x(nx * m.f * 2); m.y(ny * m.f * 1.4); });
        });
      }
    }

    // Ticker reageert op scrollsnelheid
    $$(".ticker-track").forEach((t) => {
      let skew = gsap.quickTo(t, "skewX", { duration: .5, ease: "power3.out" });
      ScrollTrigger.create({ onUpdate: (self) => skew(gsap.utils.clamp(-8, 8, self.getVelocity() / -300)) });
    });

    // Corail-onderstreping tekent zichzelf
    $$(".underline-coral").forEach((u) => {
      gsap.fromTo(u, { "--u": 0 }, { "--u": 1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: u, start: "top 85%", once: true } });
    });

    // Objecten in kaarten: lichte parallax
    $$("[data-float]").forEach((el) => {
      gsap.fromTo(el, { y: 30 }, { y: -30, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });
    });

    // Stickers 'plakken' op hun plek
    ScrollTrigger.batch("[data-slap]", {
      start: "top 85%", once: true,
      onEnter: (els) => gsap.fromTo(els, { scale: 1.35, rotate: (i) => (i % 2 ? 14 : -12), opacity: 0 }, { scale: 1, rotate: (i) => (i % 2 ? 3 : -4), opacity: 1, duration: .9, ease: "back.out(2.2)", stagger: .1 })
    });

    printSequence();
    uvStage();
  }

  /* ---------- Home: gepinde print-sequentie ---------- */
  function printSequence() {
    const sec = $(".print-seq");
    if (!sec) return;
    const steps = $$(".print-step", sec);
    const plain = $(".ps-plain", sec), gold = $(".ps-gold", sec), extra = $$(".ps-extra", sec);
    const beam = $(".ps-beam", sec);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1000px)", () => {
      sec.classList.add("js-pin");
      gsap.set(gold, { opacity: 0, "--print": 0 });
      gsap.set(extra, { opacity: 0, scale: .6, y: 30 });
      gsap.set(beam, { yPercent: -120, opacity: 0 });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sec.querySelector(".print-grid"), start: "top top", end: "+=2600", pin: true, scrub: 1,
          onUpdate: (self) => {
            const idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length * .999));
            steps.forEach((s, i) => s.classList.toggle("is-active", i === idx));
          }
        }
      });
      tl.to({}, { duration: .6 })
        .to(plain, { rotate: -4, y: -10, duration: .4 }, 0.1)
        .to(plain, { opacity: 0, duration: .3 }, 1)
        .to(gold, { opacity: 1, duration: .3 }, 1)
        .to(plain, { rotate: 0, y: 0, duration: .2 }, 1.1)
        .to(beam, { opacity: 1, duration: .1 }, 2)
        .to(beam, { yPercent: 520, duration: .9 }, 2)
        .to(gold, { "--print": 1, duration: .8 }, 2.05)
        .to(beam, { opacity: 0, duration: .1 }, 2.85)
        .to(gold.querySelector(".lid"), { y: -26, duration: .3 }, 3.05)
        .to(gold.querySelector(".lid"), { y: 0, duration: .25, ease: "power2.in" }, 3.4)
        .to(extra, { opacity: 1, scale: 1, y: 0, stagger: .1, duration: .3, ease: "back.out(2)" }, 3.45)
        .to({}, { duration: .4 });
      return () => sec.classList.remove("js-pin");
    });
    mm.add("(max-width: 999px)", () => {
      gsap.set(plain, { opacity: 0 });
      gsap.set(gold, { opacity: 1, "--print": 1 });
      gsap.set(extra, { opacity: 1 });
      steps.forEach((s) => s.classList.add("is-active"));
    });
  }

  /* ---------- Dozen: UV-straal over een doos ---------- */
  function uvStage() {
    const st = $(".uv-stage");
    if (!st) return;
    const beam = $(".uv-beam", st), scope = $(".tins-scope", st);
    gsap.set(scope, { "--print": 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: st, start: "top 70%", end: "bottom 30%", scrub: 1 } });
    tl.fromTo(beam, { yPercent: -120 }, { yPercent: 480, ease: "none", duration: 1 }, 0)
      .to(scope, { "--print": 1, ease: "none", duration: .8 }, .1);
  }

  /* ---------- Dozen: onbedrukt / UV-schakelaar ---------- */
  function printToggle() {
    const seg = $("[data-print-toggle]");
    if (!seg) return;
    const scopes = () => $$("[data-tins-scope]");
    const set = (state) => {
      seg.dataset.state = state;
      $$("button", seg).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.value === state)));
      scopes().forEach((s) => s.classList.toggle("is-uv", state === "uv"));
      $$("[data-quote-link]").forEach((a) => {
        const u = new URL(a.href, location.href);
        u.searchParams.set("druk", state === "uv" ? "uv" : "onbedrukt");
        a.href = u.pathname.split("/").pop() + u.search;
      });
      const live = $("#print-live");
      if (live) live.textContent = state === "uv" ? "Weergave: dozen met UV-bedrukking" : "Weergave: onbedrukte dozen";
    };
    $$("button", seg).forEach((b) => b.addEventListener("click", () => set(b.dataset.value)));
    const p = new URLSearchParams(location.search).get("druk");
    set(p === "uv" ? "uv" : "plain");
  }

  /* ---------- Dozen: catalogus ---------- */
  function catalog() {
    const grid = $("#catalog");
    if (!grid) return;
    grid.innerHTML = MODELS.map((m) => `
      <article class="model bezel" data-vorm="${m.vorm}" data-reveal>
        <div class="core">
          <div class="model-visual"><div data-tin="${m.shape}" data-color="${m.colors[0]}" data-art="${m.art}" data-label="${m.name}, ${COLOR_LABEL[m.colors[0]].toLowerCase()}"></div></div>
          <div class="model-body">
            <div class="model-title"><h3>${m.name}</h3><span>${m.size}</span></div>
            <dl class="specs">
              <dt>Vorm</dt><dd>${m.vorm[0].toUpperCase() + m.vorm.slice(1)}</dd>
              <dt>Ideaal voor</dt><dd>${m.use}</dd>
              <dt>Kleur</dt><dd class="color-name">${COLOR_LABEL[m.colors[0]]}</dd>
            </dl>
            <div class="swatches" role="group" aria-label="Kleur kiezen voor ${m.name}">
              ${m.colors.map((c, i) => `<button type="button" class="swatch" style="--sw:${COLOR_HEX[c]}" data-color="${c}" aria-pressed="${i === 0}" aria-label="${COLOR_LABEL[c]}"></button>`).join("")}
            </div>
            <div class="chips"><span class="chip sky"><i></i>Onbedrukt</span><span class="chip"><i></i>UV-bedrukking</span></div>
            <div class="model-foot">
              <a class="btn btn--sm" data-arrow data-quote-link href="offerte.html?cat=dozen&model=${m.id}&kleur=${m.colors[0]}&druk=onbedrukt">Offerte voor dit model</a>
            </div>
          </div>
        </div>
      </article>`).join("");
    $$(".btn[data-arrow]", grid).forEach((b) => b.insertAdjacentHTML("beforeend", btnIcon()));
    window.WaviArt && window.WaviArt.hydrate(grid);

    // Kleurstalen
    grid.addEventListener("click", (e) => {
      const sw = e.target.closest(".swatch");
      if (!sw) return;
      const card = sw.closest(".model");
      const t = $("[data-tin]", card);
      t.dataset.color = sw.dataset.color;
      t.dataset.label = `${$("h3", card).textContent}, ${COLOR_LABEL[sw.dataset.color].toLowerCase()}`;
      window.WaviArt.tin(t);
      $$(".swatch", card).forEach((s) => s.setAttribute("aria-pressed", String(s === sw)));
      $(".color-name", card).textContent = COLOR_LABEL[sw.dataset.color];
      const a = $("[data-quote-link]", card), u = new URL(a.href, location.href);
      u.searchParams.set("kleur", sw.dataset.color);
      a.href = "offerte.html" + u.search;
      if (hasGsap && !reduce) gsap.fromTo(t, { scale: .94, rotate: -2 }, { scale: 1, rotate: 0, duration: .8, ease: "elastic.out(1, .55)" });
    });

    // Filter op vorm
    const pills = $$(".filter-pills button");
    pills.forEach((p) => p.addEventListener("click", () => {
      pills.forEach((x) => x.setAttribute("aria-pressed", String(x === p)));
      const v = p.dataset.filter;
      const cards = $$(".model", grid);
      const show = cards.filter((c) => v === "alle" || c.dataset.vorm === v);
      cards.forEach((c) => c.classList.toggle("is-hidden", !show.includes(c)));
      if (hasGsap && !reduce) gsap.fromTo(show, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .7, ease: "expo.out", stagger: .05 });
      const n = $("#catalog-count"); if (n) n.textContent = `${show.length} ${show.length === 1 ? "model" : "modellen"}`;
      hasGsap && ScrollTrigger.refresh();
    }));
  }

  /* ---------- Stickers: speeltuin ---------- */
  function tabs() {
    $$("[data-tabs]").forEach((wrap) => {
      const list = $('[role="tablist"]', wrap), btns = $$('[role="tab"]', wrap);
      const select = (b, focus) => {
        btns.forEach((x) => {
          const on = x === b;
          x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
          const p = document.getElementById(x.getAttribute("aria-controls"));
          p.hidden = !on;
          if (on && hasGsap && !reduce) gsap.fromTo(p.querySelectorAll(".tab-anim, .cluster > *"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .8, ease: "expo.out", stagger: .06 });
        });
        if (focus) b.focus();
      };
      btns.forEach((b, i) => {
        b.addEventListener("click", () => select(b));
        b.addEventListener("keydown", (e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            select(btns[(i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length], true);
          }
        });
      });
    });
  }

  /* ---------- FAQ: zacht openen ---------- */
  function faq() {
    if (!hasGsap || reduce) return;
    $$(".faq details").forEach((d) => {
      const s = $("summary", d), a = $(".answer", d);
      s.addEventListener("click", (e) => {
        e.preventDefault();
        if (d.open) {
          gsap.to(a, { height: 0, duration: .5, ease: "expo.out", onComplete: () => { d.open = false; gsap.set(a, { clearProps: "height" }); hasGsap && ScrollTrigger.refresh(); } });
        } else {
          d.open = true;
          gsap.fromTo(a, { height: 0 }, { height: "auto", duration: .7, ease: "expo.out", onComplete: () => ScrollTrigger.refresh() });
          gsap.fromTo(a.firstElementChild, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .6, ease: "expo.out" });
        }
      });
    });
  }

  /* ---------- Offerteformulier ---------- */
  function quoteForm() {
    const form = $("#quote-form");
    if (!form) return;
    const steps = $$(".form-step", form);
    const prog = $$(".progress li:not(.bar)");
    const params = new URLSearchParams(location.search);
    let current = 0;

    // Modellenlijst
    const modelSel = $("#f-model");
    if (modelSel) {
      modelSel.innerHTML = `<option value="">Kies een model</option>` +
        MODELS.map((m) => `<option value="${m.id}">${m.name} · ${m.size}</option>`).join("") +
        `<option value="eigen">Ander model of eigen vorm</option>`;
    }

    const catLabel = { dozen: "Metalen dozen", stickers: "Stickers op maat", badges: "Geweven etiketten en badges" };
    const getCat = () => (form.querySelector('input[name="categorie"]:checked') || {}).value;

    function showCond() {
      const cat = getCat();
      $$("[data-cat]", form).forEach((f) => {
        const on = f.dataset.cat === cat;
        f.hidden = !on;
        $$("input, select, textarea", f).forEach((i) => i.disabled = !on);
      });
      const druk = (form.querySelector('input[name="bedrukking"]:checked') || {}).value;
      $$("[data-if-uv]", form).forEach((f) => {
        const on = cat === "dozen" && druk === "uv";
        f.hidden = !on; $$("input, select, textarea", f).forEach((i) => i.disabled = !on);
      });
      const model = modelSel && modelSel.value;
      $$("[data-if-eigen]", form).forEach((f) => {
        const on = cat === "dozen" && model === "eigen";
        f.hidden = !on; $$("input, select, textarea", f).forEach((i) => i.disabled = !on);
      });
      // kleuren volgen het model
      const colorWrap = $("#f-kleur-wrap");
      if (colorWrap && cat === "dozen") {
        const m = MODELS.find((x) => x.id === model);
        const list = m ? m.colors : Object.keys(COLOR_LABEL);
        const prev = (form.querySelector('input[name="kleur"]:checked') || {}).value;
        colorWrap.innerHTML = list.map((c) => `<div class="choice"><input type="radio" name="kleur" id="k-${c}" value="${c}" ${c === prev ? "checked" : ""}><label for="k-${c}"><i style="--sw:${COLOR_HEX[c]}"></i>${COLOR_LABEL[c]}</label></div>`).join("") +
          `<div class="choice"><input type="radio" name="kleur" id="k-advies" value="advies" ${prev === "advies" ? "checked" : ""}><label for="k-advies">Nog niet zeker</label></div>`;
      }
    }

    function summary() {
      const cat = getCat();
      const v = (n) => { const el = form.elements[n]; if (!el) return ""; if (el instanceof RadioNodeList) return el.value; return el.disabled ? "" : el.value; };
      const rows = [];
      if (cat) rows.push(["Categorie", catLabel[cat]]);
      if (cat === "dozen") {
        const m = MODELS.find((x) => x.id === v("model"));
        if (m) rows.push(["Model", m.name]); else if (v("model") === "eigen") rows.push(["Model", "Eigen vorm"]);
        if (v("kleur")) rows.push(["Kleur", COLOR_LABEL[v("kleur")] || "Advies gewenst"]);
        if (v("bedrukking")) rows.push(["Uitvoering", v("bedrukking") === "uv" ? "UV-bedrukt" : "Onbedrukt"]);
      }
      if (cat === "stickers") {
        if (v("sticker_vorm")) rows.push(["Vorm", v("sticker_vorm")]);
        if (v("sticker_maat")) rows.push(["Afmetingen", v("sticker_maat")]);
      }
      if (cat === "badges") {
        if (v("badge_type")) rows.push(["Type", v("badge_type")]);
        if (v("badge_maat")) rows.push(["Afmetingen", v("badge_maat")]);
      }
      if (v("aantal")) rows.push(["Aantal", v("aantal")]);
      if (v("leverdatum")) rows.push(["Leverdatum", new Date(v("leverdatum")).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" })]);
      const files = $("#f-files"); if (files && files.files.length) rows.push(["Bestanden", `${files.files.length}`]);
      const dl = $("#summary-list");
      dl.innerHTML = rows.length ? rows.map(([k, val]) => `<dt>${k}</dt><dd>${escapeHtml(val)}</dd>`).join("") : `<dt>Nog niets gekozen</dt><dd></dd>`;

      // Visual
      const vis = $("#summary-visual");
      const key = cat + "|" + v("model") + "|" + v("kleur") + "|" + v("bedrukking") + "|" + v("sticker_vorm");
      if (vis.dataset.key !== key) {
        vis.dataset.key = key;
        if (cat === "dozen") {
          const m = MODELS.find((x) => x.id === v("model")) || MODELS[1];
          const col = COLOR_LABEL[v("kleur")] ? v("kleur") : m.colors[0];
          vis.innerHTML = `<div class="tins-scope ${v("bedrukking") === "uv" ? "is-uv" : ""}" style="width:56%"><div data-tin="${m.shape}" data-color="${col}" data-art="${m.art}"></div></div>`;
        } else if (cat === "stickers") {
          const map = { Rond: "rond", Vierkant: "vierkant", Druppel: "druppel", Ovaal: "ovaal", Rechthoek: "rechthoek", "Eigen contour": "contour", Ster: "ster", Boog: "boog" };
          vis.innerHTML = `<div data-sticker="${map[v("sticker_vorm")] || "druppel"}" data-art="ontwerp" style="width:42%"></div>`;
        } else if (cat === "badges") {
          vis.innerHTML = `<div data-badge="rond" data-art="ontwerp" style="width:42%"></div>`;
        } else {
          vis.innerHTML = `<img src="assets/img/waviprint-symbole-couleur.svg" alt="" style="width:30%">`;
        }
        window.WaviArt.hydrate(vis);
        if (hasGsap && !reduce) gsap.fromTo(vis.firstElementChild, { scale: .85, opacity: 0 }, { scale: 1, opacity: 1, duration: .8, ease: "expo.out" });
      }
    }

    function go(n, focus = true) {
      current = n;
      steps.forEach((s, i) => s.hidden = i !== n);
      prog.forEach((p, i) => {
        p.classList.toggle("is-current", i === n); p.classList.toggle("is-done", i < n);
        p.querySelector(".pn").textContent = i < n ? "✓" : String(i + 1);
        if (i === n) p.setAttribute("aria-current", "step"); else p.removeAttribute("aria-current");
      });
      if (hasGsap && !reduce) gsap.fromTo(steps[n], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .7, ease: "expo.out" });
      if (focus) {
        const h = steps[n].querySelector("h2"); h && h.focus({ preventScroll: true });
        const top = form.getBoundingClientRect().top + window.scrollY - 110;
        lenis ? lenis.scrollTo(top, { duration: 1 }) : window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      }
      hasGsap && ScrollTrigger.refresh();
    }

    function validate(stepEl) {
      let ok = true, first = null;
      $$(".field", stepEl).forEach((f) => f.classList.remove("has-error"));
      $$("[required]", stepEl).forEach((inp) => {
        if (inp.disabled || inp.closest("[hidden]")) return;
        let valid = true;
        if (inp.type === "radio") valid = !!stepEl.querySelector(`input[name="${inp.name}"]:checked`);
        else if (inp.type === "checkbox") valid = inp.checked;
        else if (inp.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(inp.value.trim());
        else valid = inp.value.trim() !== "";
        if (!valid) { ok = false; const f = inp.closest(".field"); f && f.classList.add("has-error"); first = first || inp; }
      });
      if (!ok) {
        const catErr = $("#cat-error", stepEl);
        if (catErr) catErr.hidden = !!getCat();
        first && first.focus();
        if (hasGsap && !reduce) gsap.fromTo(stepEl.querySelector(".has-error, .cat-picker"), { x: -8 }, { x: 0, duration: .6, ease: "elastic.out(1, .3)" });
      }
      return ok;
    }

    form.addEventListener("click", (e) => {
      const next = e.target.closest("[data-next]"), prev = e.target.closest("[data-prev]");
      if (next) { e.preventDefault(); if (validate(steps[current])) go(current + 1); }
      if (prev) { e.preventDefault(); go(current - 1); }
    });
    form.addEventListener("change", (e) => {
      if (e.target.name === "categorie") { showCond(); const ce = $("#cat-error"); ce && (ce.hidden = true); }
      if (e.target.name === "bedrukking" || e.target.id === "f-model") showCond();
      summary();
    });
    form.addEventListener("input", summary);

    // Bestanden
    const dz = $(".dropzone", form), files = $("#f-files"), list = $("#file-list");
    if (dz && files) {
      ["dragenter", "dragover"].forEach((t) => dz.addEventListener(t, () => dz.classList.add("is-over")));
      ["dragleave", "drop"].forEach((t) => dz.addEventListener(t, () => dz.classList.remove("is-over")));
      files.addEventListener("change", () => {
        list.innerHTML = Array.from(files.files).map((f) => `<li><span>${escapeHtml(f.name)}</span><span>${(f.size / 1024 / 1024).toFixed(1).replace(".", ",")} MB</span></li>`).join("");
        summary();
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate(steps[current])) return;
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true; btn.firstChild.textContent = "Even geduld… ";
      const endpoint = form.dataset.endpoint;
      try {
        if (endpoint) {
          const res = await fetch(endpoint, { method: "POST", body: new FormData(form) });
          if (!res.ok) throw new Error("send");
        } else {
          await new Promise((r) => setTimeout(r, 900)); // Demo: nog geen verzendadres ingesteld
        }
        const name = (form.elements.naam.value || "").trim().split(" ")[0];
        $("#success-name").textContent = name ? `, ${name}` : "";
        form.hidden = true; $(".progress").hidden = true;
        const ok = $("#quote-success"); ok.hidden = false;
        $("#summary-title").textContent = "Je aanvraag";
        if (hasGsap && !reduce) {
          gsap.fromTo(ok.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: .08, duration: .9, ease: "expo.out" });
          gsap.fromTo(".drop-big", { scale: 0, rotate: -20 }, { scale: 1, rotate: 0, duration: 1.1, ease: "elastic.out(1, .5)" });
        }
        ok.querySelector("h2").focus();
        const top = ok.getBoundingClientRect().top + window.scrollY - 140;
        lenis ? lenis.scrollTo(top) : window.scrollTo(0, top);
      } catch (err) {
        btn.disabled = false; btn.firstChild.textContent = "Aanvraag versturen ";
        const m = $("#send-error"); m.hidden = false;
      }
    });

    // Voorinvullen vanuit productpagina's
    const cat = params.get("cat");
    if (cat && catLabel[cat]) {
      form.querySelector(`input[name="categorie"][value="${cat}"]`).checked = true;
      showCond();
      if (cat === "dozen") {
        const m = params.get("model"); if (m && modelSel) { modelSel.value = MODELS.some((x) => x.id === m) ? m : ""; showCond(); }
        const d = params.get("druk"); if (d) { const r = form.querySelector(`input[name="bedrukking"][value="${d === "uv" ? "uv" : "onbedrukt"}"]`); r && (r.checked = true); showCond(); }
        const k = params.get("kleur"); if (k) { const r = form.querySelector(`input[name="kleur"][value="${k}"]`); r && (r.checked = true); }
      }
      if (cat === "badges") {
        const t = params.get("type"); if (t) { const r = form.querySelector(`input[name="badge_type"][value="${t}"]`); r && (r.checked = true); }
      }
      go(1, false);
    } else {
      showCond(); go(0, false);
    }
    summary();
  }

  /* ---------- Contactformulier ---------- */
  function contactForm() {
    const form = $("#contact-form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      $$(".field", form).forEach((f) => f.classList.remove("has-error"));
      $$("[required]", form).forEach((i) => {
        const valid = i.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim()) : i.value.trim() !== "";
        if (!valid) { ok = false; i.closest(".field").classList.add("has-error"); }
      });
      if (!ok) { form.querySelector(".has-error input, .has-error textarea").focus(); return; }
      const btn = form.querySelector('[type="submit"]'); btn.disabled = true;
      try {
        if (form.dataset.endpoint) { const r = await fetch(form.dataset.endpoint, { method: "POST", body: new FormData(form) }); if (!r.ok) throw 0; }
        else await new Promise((r) => setTimeout(r, 700));
        form.hidden = true;
        const s = $("#contact-success"); s.hidden = false; s.querySelector("h3").focus();
        if (hasGsap && !reduce) gsap.fromTo(s.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: .08, duration: .8, ease: "expo.out" });
      } catch (err) { btn.disabled = false; $("#contact-error").hidden = false; }
    });
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  // Jaar in footer
  $$("[data-year]").forEach((y) => y.textContent = new Date().getFullYear());

  catalog();
  printToggle();
  tabs();
  faq();
  quoteForm();
  contactForm();
  motion();
  v2();

  /* ======================================================================
     V2 — merkbeleving: posters, wipe, stickermuur, kinetische type, cursor
     ====================================================================== */
  function v2() {
    // Poster-schakelaar: dozen onbedrukt / bedrukt
    const pt = $("[data-poster-toggle]");
    if (pt) {
      const scope = $("#poster-tins");
      $$("button", pt).forEach((b) => b.addEventListener("click", () => {
        pt.dataset.state = b.dataset.value;
        $$("button", pt).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        scope.classList.toggle("is-uv", b.dataset.value === "uv");
      }));
    }

    // Wipe: sleep om te drukken
    const wipe = $("#wipe");
    if (wipe) {
      const handle = $(".wipe-handle", wipe);
      let pos = 50, drag = false;
      const set = (p) => {
        pos = Math.max(0, Math.min(100, p));
        wipe.style.setProperty("--pos", pos + "%");
        handle.setAttribute("aria-valuenow", String(Math.round(pos)));
        handle.setAttribute("aria-valuetext", `${Math.round(100 - pos)}% bedrukt`);
      };
      const fromEvent = (e) => { const r = wipe.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
      wipe.addEventListener("pointerdown", (e) => { drag = true; wipe.classList.add("is-drag"); wipe.setPointerCapture(e.pointerId); fromEvent(e); });
      wipe.addEventListener("pointermove", (e) => { if (drag) fromEvent(e); });
      const end = () => { drag = false; wipe.classList.remove("is-drag"); };
      wipe.addEventListener("pointerup", end); wipe.addEventListener("pointercancel", end);
      handle.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { set(pos - 5); e.preventDefault(); }
        if (e.key === "ArrowRight") { set(pos + 5); e.preventDefault(); }
        if (e.key === "Home") { set(0); e.preventDefault(); }
        if (e.key === "End") { set(100); e.preventDefault(); }
      });
      set(50);
      if (hasGsap && !reduce) {
        const o = { p: 92 };
        gsap.to(o, { p: 30, duration: 1.6, ease: "expo.inOut", onUpdate: () => !drag && set(o.p), scrollTrigger: { trigger: wipe, start: "top 70%", once: true },
          onComplete: () => gsap.to(o, { p: 50, duration: 1, ease: "elastic.out(1, .6)", onUpdate: () => !drag && set(o.p) }) });
      }
    }


    // Stickermuur: sleep, gooi, plak. Klik op een lege plek = nieuwe sticker
    const wall = $("#wall");
    if (wall && hasGsap) {
      const canDrag = !!window.Draggable;
      if (canDrag) gsap.registerPlugin(Draggable);
      let z = 10;
      const attach = (el) => {
        if (!canDrag) return;
        Draggable.create(el, {
          bounds: wall, type: "x,y", zIndexBoost: false,
          onPress() { el.style.zIndex = ++z; gsap.to(el, { scale: 1.12, duration: .3, ease: "power3.out" }); gsap.to(el.firstElementChild, { filter: "drop-shadow(0 30px 30px rgba(20,27,77,.3))", duration: .3 }); },
          onDrag() { gsap.to(el, { rotation: gsap.utils.clamp(-25, 25, this.deltaX * 1.6), duration: .4, ease: "power2.out" }); },
          onRelease() {
            gsap.to(el, { scale: 1, rotation: 0, duration: .7, ease: "elastic.out(1, .45)" });
            gsap.to(el.firstElementChild, { filter: "drop-shadow(0 0 0 rgba(0,0,0,0))", duration: .4 });
          }
        });
      };
      $$(".wi", wall).forEach((el, i) => {
        if (!reduce) gsap.from(el, { scale: 0, rotate: (i % 2 ? 40 : -40), duration: 1, ease: "back.out(1.8)", delay: i * .06, scrollTrigger: { trigger: wall, start: "top 70%", once: true } });
        attach(el);
      });

      const items = $(".wall-items", wall);
      const SHAPES = ["rond", "vierkant", "druppel", "ovaal", "contour", "ster", "boog"];
      const ARTS = ["merci", "gedrukt", "ontwerp", "ontwerp2", "ontwerp3", "ontwerp4", "handmade", "club"];
      const rnd = (a) => a[Math.floor(Math.random() * a.length)];
      const added = [];
      wall.addEventListener("click", (e) => {
        if (e.target.closest(".wi, a, button")) return;
        const r = wall.getBoundingClientRect();
        const small = window.innerWidth <= 700;
        const w = Math.round((110 + Math.random() * 70) * (small ? .62 : 1));
        const el = document.createElement("div");
        el.className = "wi wi--new";
        el.style.cssText = `left:${e.clientX - r.left - w / 2}px;top:${e.clientY - r.top - w / 2}px;width:${w}px;--r:${Math.round(Math.random() * 28 - 14)}deg;z-index:${++z}`;
        el.innerHTML = `<div data-sticker="${rnd(SHAPES)}" data-art="${rnd(ARTS)}"></div>`;
        items.appendChild(el);
        window.WaviArt && window.WaviArt.sticker(el.firstElementChild);
        attach(el);
        if (!reduce) gsap.fromTo(el, { scale: 1.7, opacity: 0 }, { scale: 1, opacity: 1, duration: .55, ease: "back.out(2.6)" });
        added.push(el);
        if (added.length > 30) { const old = added.shift(); gsap.to(old, { scale: 0, opacity: 0, duration: .3, onComplete: () => old.remove() }); }
      });
    }

    // Kinetische rijen: drijven en versnellen met de scroll
    const rows = $$(".kin-row");
    if (rows.length && hasGsap) {
      const state = rows.map((row) => {
        const track = $(".kin-track", row);
        return { row, track, dir: +row.dataset.dir, x: 0, w: track.scrollWidth / 2 };
      });
      let boost = 0;
      if (!reduce) {
        ScrollTrigger.create({ trigger: ".kin-sec", start: "top bottom", end: "bottom top", onUpdate: (s) => { boost = gsap.utils.clamp(-30, 30, s.getVelocity() / 120); } });
        gsap.ticker.add(() => {
          boost *= .92;
          state.forEach((s) => {
            s.x += (1.1 + Math.abs(boost)) * s.dir * (boost < 0 ? -1 : 1);
            s.x = gsap.utils.wrap(-s.w, 0, s.x);
            s.track.style.transform = `translate3d(${s.x}px,0,0)`;
          });
        });
        window.addEventListener("resize", () => state.forEach((s) => (s.w = s.track.scrollWidth / 2)));
      }
    }

    // Woord-voor-woord inkleuren
    $$("[data-words]").forEach((p) => {
      p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => `<span class="wd">${w}</span>`).join(" ");
      if (!hasGsap || reduce) { $$(".wd", p).forEach((w) => (w.style.opacity = 1)); return; }
      gsap.to($$(".wd", p), { opacity: 1, stagger: .08, ease: "none", scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: true } });
    });

    if (!hasGsap || reduce) return;

    // Posters schuiven over elkaar, de vorige zakt weg
    const posters = $$(".poster");
    posters.forEach((p, i) => {
      const next = posters[i + 1];
      if (next) gsap.to($(".poster-inner", p), { scale: .96, opacity: .08, ease: "none", scrollTrigger: { trigger: next, start: "top bottom", end: "top 40%", scrub: true } });
      gsap.from($(".poster-word", p), { yPercent: 40, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: p, start: "top 75%", once: true } });
    });
    // Dozen: deksels gaan open op de scroll
    $$("#poster-tins .pa").forEach((pa, i) => {
      gsap.fromTo(pa, { y: 120 + i * 40, rotate: i % 2 ? 8 : -6 }, { y: 0, rotate: 0, ease: "none", scrollTrigger: { trigger: "#dozen", start: "top bottom", end: "top top", scrub: 1 } });
      const lid = $(".lid", pa);
      if (lid) gsap.to(lid, { y: -40 - i * 10, ease: "none", scrollTrigger: { trigger: "#dozen", start: "top top", end: "bottom top", scrub: 1 } });
    });
    // Stickers waaieren open
    const fan = $$(".fan-item");
    // CSS-standaardopstelling uitzetten, GSAP neemt het over
    fan.concat($$(".orb")).forEach((el) => { el.style.rotate = "0deg"; el.style.translate = "-50% -50%"; });
    fan.forEach((f, i) => {
      const a = (i - (fan.length - 1) / 2);
      gsap.fromTo(f, { rotate: 0, x: 0, y: 0 }, { rotate: a * 14, x: a * 90, y: Math.abs(a) * 30, ease: "none", scrollTrigger: { trigger: "#stickers-p", start: "top 80%", end: "top 10%", scrub: 1 } });
    });
    // Badges draaien in een baan
    const orbs = $$(".orb");
    const orbit = { t: 0 };
    gsap.to(orbit, { t: 1, ease: "none", scrollTrigger: { trigger: "#badges-p", start: "top bottom", end: "bottom top", scrub: 1 },
      onUpdate: () => {
        const R = Math.min(window.innerWidth * .16, 210);
        orbs.forEach((o, i) => {
          const a = orbit.t * Math.PI * 1.5 + (i / orbs.length) * Math.PI * 2;
          gsap.set(o, { x: Math.cos(a) * R, y: Math.sin(a) * R * .6, rotate: Math.sin(a) * 12, zIndex: Math.round(Math.sin(a) * 10) + 10, scale: .85 + (Math.sin(a) + 1) * .12 });
        });
      } });

    // Inktdruppel-cursor
    if (fine) {
      const c = document.createElement("div");
      c.className = "ink-cursor";
      c.innerHTML = `<svg viewBox="0 0 100 100"><path d="M50 2 L78 30 A40 40 0 1 1 22 30 Z"/></svg>`;
      document.body.appendChild(c);
      const xTo = gsap.quickTo(c, "x", { duration: .45, ease: "power3.out" }), yTo = gsap.quickTo(c, "y", { duration: .45, ease: "power3.out" });
      let lx = 0;
      window.addEventListener("pointermove", (e) => {
        xTo(e.clientX); yTo(e.clientY); c.classList.add("is-on");
        gsap.to(c, { rotate: gsap.utils.clamp(-35, 35, (e.clientX - lx) * 2), duration: .4 }); lx = e.clientX;
        const t = e.target;
        c.classList.toggle("is-hover", !!t.closest("a, button, .wi, .wipe, [role=slider], input, select, textarea, label"));
        c.classList.toggle("is-dark", !!t.closest(".on-ink, .wipe-sec, .kin-sec, .footer, .poster--coral, .cta-block"));
      }, { passive: true });
      document.addEventListener("pointerleave", () => c.classList.remove("is-on"));
    }
  }

  // Na het laden van fonts posities herberekenen
  if (hasGsap && document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();

/* Posters hoger dan het scherm: eerst helemaal doorscrollen, pas dan vastzetten */
(function () {
  const posters = document.querySelectorAll(".poster");
  if (!posters.length) return;
  const fit = () => posters.forEach((p) => p.style.setProperty("--stick", Math.min(0, window.innerHeight - p.offsetHeight) + "px"));
  fit();
  window.addEventListener("resize", fit, { passive: true });
  window.addEventListener("load", fit);
  if (document.fonts) document.fonts.ready.then(fit);
})();
