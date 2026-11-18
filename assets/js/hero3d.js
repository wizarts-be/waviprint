/* ==========================================================================
   Waviprint — 3D hero: een inktdruppel met drie golven (three.js)
   De druppel volgt exact het logo: cirkel + punt van 90°.
   De drie golflinten (crème, koraal, zon) lopen door de druppel heen.
   ========================================================================== */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const host = document.querySelector("[data-hero3d]");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function supportsWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
}

if (host && supportsWebGL()) init();

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  host.appendChild(renderer.domElement);
  host.classList.add("is-live");

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x8dc8e8, 1.2); rim.position.set(-4, -1, -3); scene.add(rim);

  const uniforms = { uTime: { value: 0 }, uAmp: { value: 1 }, uWobble: { value: 0 } };

  /* ---------- De druppel ---------- */
  const r = 1, tipY = r * Math.SQRT2; // punt van 90° zoals het logo
  const pts = [];
  const alpha = Math.PI / 4;
  for (let i = 0; i <= 64; i++) {
    const b = Math.PI - (Math.PI - alpha) * (i / 64);
    pts.push(new THREE.Vector2(Math.max(0.0001, r * Math.sin(b)), r * Math.cos(b)));
  }
  // rechte flank naar de punt (licht afgerond zoals het logo)
  const tp = pts[pts.length - 1];
  for (let i = 1; i <= 20; i++) {
    const t = i / 20;
    const x = tp.x * (1 - t), y = tp.y + (tipY - tp.y) * t;
    pts.push(new THREE.Vector2(Math.max(0.0001, x), y - (t > 0.9 ? (t - 0.9) * 0.25 : 0)));
  }
  const dropGeo = new THREE.LatheGeometry(pts, 160);
  dropGeo.computeVertexNormals();
  dropGeo.translate(0, -0.12, 0);

  const dropMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a2366, roughness: 0.22, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 0.8
  });
  dropMat.onBeforeCompile = (s) => {
    s.uniforms.uTime = uniforms.uTime; s.uniforms.uWobble = uniforms.uWobble;
    s.vertexShader = "uniform float uTime; uniform float uWobble;\n" + s.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       float w = sin(position.y * 4.0 + uTime * 2.2) * 0.022 + sin(position.x * 5.0 + position.z * 3.0 + uTime * 1.6) * 0.018;
       w *= (0.6 + uWobble * 2.4);
       transformed += normal * w;`
    );
  };
  const drop = new THREE.Mesh(dropGeo, dropMat);
  const dropGroup = new THREE.Group();
  dropGroup.add(drop);
  scene.add(dropGroup);

  /* ---------- Drie golflinten ---------- */
  const ribbonColors = [0xfbf5e9, 0xf9423a, 0xffc72c];
  const ribbons = [];
  ribbonColors.forEach((c, i) => {
    const path = new THREE.LineCurve3(new THREE.Vector3(-9, 0, 0), new THREE.Vector3(9, 0, 0));
    const geo = new THREE.TubeGeometry(path, 520, 0.085, 20, false);
    const mat = new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.45, metalness: 0, clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 0.5 });
    const phase = i * 0.6;
    mat.onBeforeCompile = (s) => {
      s.uniforms.uTime = uniforms.uTime; s.uniforms.uAmp = uniforms.uAmp;
      s.vertexShader = "uniform float uTime; uniform float uAmp;\n" + s.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         float x = transformed.x;
         float k = 2.4;
         transformed.y += sin(x * k + uTime * 1.5 + ${phase.toFixed(2)}) * 0.16 * uAmp;
         transformed.z += cos(x * 0.55 + uTime * 0.45 + ${(phase * 1.7).toFixed(2)}) * 0.9;`
      );
    };
    const m = new THREE.Mesh(geo, mat);
    m.position.y = 0.34 - i * 0.34;
    ribbons.push(m);
    dropGroup.add(m);
  });

  /* ---------- Kleine druppeltjes ---------- */
  const dots = [];
  const dotGeo = new THREE.SphereGeometry(1, 32, 32);
  [[0xf9423a, .12], [0xffc72c, .09], [0x8dc8e8, .14], [0xfbf5e9, .07], [0xf9423a, .06]].forEach(([c, s], i) => {
    const m = new THREE.Mesh(dotGeo, new THREE.MeshPhysicalMaterial({ color: c, roughness: .2, clearcoat: 1 }));
    m.scale.setScalar(s);
    m.userData = { rad: 1.7 + i * 0.28, speed: 0.25 + i * 0.07, off: i * 1.3, tilt: (i % 2 ? 1 : -1) * 0.5 };
    dots.push(m); dropGroup.add(m);
  });

  /* ---------- Layout ---------- */
  let wide = true;
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    wide = w / h > 1.05;
    dropGroup.position.x = wide ? 2.1 * Math.min(1.3, camera.aspect / 1.6) : 0;
    dropGroup.position.y = wide ? 0.2 : 1.1;
    const sc = wide ? 1.15 : 0.95;
    dropGroup.scale.setScalar(sc);
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---------- Interactie ---------- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, v: 0 };
  let lastMove = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    const dx = e.clientX - lastMove.x, dy = e.clientY - lastMove.y;
    mouse.v = Math.min(1, mouse.v + Math.hypot(dx, dy) / 600);
    lastMove = { x: e.clientX, y: e.clientY };
  }, { passive: true });

  // Intro: de druppel valt en de golven spatten op
  let intro = reduce ? 1 : 0;
  const introStart = performance.now();

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(host);

  const clock = new THREE.Clock();
  let raf = 0;
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    uniforms.uTime.value = reduce ? 1.2 : t;

    if (intro < 1) intro = Math.min(1, (performance.now() - introStart) / 1600);
    const fall = 1 - Math.pow(1 - intro, 3);
    const bounce = intro < 1 ? Math.sin(intro * Math.PI * 2.5) * (1 - intro) * 0.25 : 0;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    mouse.v *= 0.95;

    const scroll = Math.min(1, window.scrollY / (window.innerHeight || 1));

    drop.rotation.y = mouse.x * 0.5 + Math.sin(t * 0.4) * 0.12;
    drop.rotation.x = mouse.y * 0.25;
    drop.rotation.z = -mouse.x * 0.08;
    drop.position.y = (1 - fall) * 5 + bounce;
    const squash = intro < 1 ? 1 + Math.sin(intro * Math.PI * 3) * (1 - intro) * 0.18 : 1;
    drop.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));

    uniforms.uWobble.value += ((mouse.v + (1 - intro) * 0.8) - uniforms.uWobble.value) * 0.08;
    uniforms.uAmp.value = 0.25 + fall * 0.75 + mouse.v * 1.2 + scroll * 1.5;

    ribbons.forEach((rb, i) => {
      rb.scale.x = 0.2 + fall * 0.8;
      rb.position.y = (0.34 - i * 0.34) * (1 + scroll * 1.4);
      rb.rotation.x = mouse.y * 0.15;
    });
    dots.forEach((d) => {
      const u = d.userData, a = t * u.speed + u.off;
      d.position.set(Math.cos(a) * u.rad, Math.sin(a * 1.3) * 0.5 + u.tilt * Math.sin(a), Math.sin(a) * u.rad * 0.6);
      d.visible = intro > 0.6;
    });

    dropGroup.rotation.z = scroll * -0.25;
    camera.position.z = 9 + scroll * 2.5;
    camera.position.x = mouse.x * 0.25;
    camera.position.y = -mouse.y * 0.18;
    camera.lookAt(dropGroup.position.x * 0.5, 0, 0);

    renderer.render(scene, camera);
  }
  function loop() {
    cancelAnimationFrame(raf);
    const tick = () => { if (!visible) return; frame(); if (!reduce) raf = requestAnimationFrame(tick); };
    tick();
  }
  loop();
}
