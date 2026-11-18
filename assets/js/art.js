/* ==========================================================================
   Waviprint — productillustraties in SVG
   Metalen dozen, stickers en geweven badges, getekend in de huisstijlkleuren.
   Elementen met data-tin / data-sticker / data-badge / data-waves worden
   bij het laden gevuld. Tijdelijk tot de echte productfoto's er zijn.
   ========================================================================== */
(function () {
  "use strict";

  const C = { ink: "#141B4D", coral: "#F9423A", sun: "#FFC72C", sky: "#8DC8E8", cream: "#FBF5E9", paper: "#FFFDF8" };
  let uid = 0;
  const id = (p) => `${p}${++uid}`;

  /* ---------- Golven (identiek aan de golf uit het logo) ---------- */
  function wavePath(width, y, half, amp) {
    const c1 = 0.36 * half, c2 = 0.64 * half;
    let d = `M0 ${y}`, x = 0, up = true;
    while (x < width) {
      const dy = up ? -amp : amp;
      d += ` C${(x + c1).toFixed(1)} ${y + dy} ${(x + c2).toFixed(1)} ${y + dy} ${(x + half).toFixed(1)} ${y}`;
      x += half; up = !up;
    }
    return d;
  }

  function waves(opts = {}) {
    const colors = opts.colors || [C.cream, C.coral, C.sun];
    const W = 2880, half = 120, amp = opts.amp || 26, stroke = opts.stroke || 26, gap = opts.gap || 62;
    const H = gap * (colors.length - 1) + amp * 2 + stroke + (opts.pad || 0);
    const paths = colors.map((c, i) => {
      const y = amp + stroke / 2 + i * gap;
      return `<g class="wave"><path d="${wavePath(W, y, half, amp)}" fill="none" stroke="${c}" stroke-width="${stroke}" stroke-linecap="round"/></g>`;
    }).join("");
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">${paths}</svg>`;
  }

  /* ---------- Metalen dozen ---------- */
  const METAL = {
    zilver: { l: "#F6F7FA", m: "#C9CDD6", d: "#8D93A2", t1: "#F1F2F5", t2: "#D2D6DD", rim: "#FFFFFF" },
    goud:   { l: "#F8E7B0", m: "#D5AF58", d: "#97712C", t1: "#F3DC98", t2: "#D8B562", rim: "#FFF4CF" },
    wit:    { l: "#FFFFFF", m: "#ECE9E2", d: "#BDB9AE", t1: "#FFFFFF", t2: "#EFEBE3", rim: "#FFFFFF" },
    zwart:  { l: "#62677A", m: "#2B2F3B", d: "#121419", t1: "#41465599", t2: "#262A34", rim: "#7A8091" },
    inkt:   { l: "#46508F", m: "#1D2560", d: "#0B1036", t1: "#2B3474", t2: "#1A2257", rim: "#5A64A6" },
    koraal: { l: "#FF8E86", m: "#F9423A", d: "#B8251F", t1: "#FF6C63", t2: "#EE3D35", rim: "#FFB4AE" }
  };
  // Zwart top fix (zonder alpha)
  METAL.zwart.t1 = "#414655";

  const SHAPES = {
    rond:      { kind: "round", cx: 120, rx: 92, ry: 30, lidTop: 74, lidD: 22, bodyRx: 88, bodyD: 70, shadowY: 196 },
    rond_s:    { kind: "round", cx: 120, rx: 74, ry: 24, lidTop: 92, lidD: 18, bodyRx: 71, bodyD: 52, shadowY: 190 },
    hoog:      { kind: "round", cx: 120, rx: 56, ry: 18, lidTop: 40, lidD: 26, bodyRx: 53, bodyD: 116, shadowY: 202 },
    rechthoek: { kind: "rect", x: 16, w: 208, top: 56, faceH: 46, lidD: 18, bodyD: 52, inset: 4, r: 10, shadowY: 190 },
    plat:      { kind: "rect", x: 12, w: 216, top: 92, faceH: 26, lidD: 12, bodyD: 16, inset: 3, r: 8, shadowY: 170 },
    vierkant:  { kind: "rect", x: 40, w: 160, top: 38, faceH: 52, lidD: 20, bodyD: 70, inset: 4, r: 10, shadowY: 196 },
    scharnier: { kind: "rect", x: 34, w: 172, top: 88, faceH: 34, lidD: 18, bodyD: 18, inset: 0, r: 20, shadowY: 176, hinge: true },
    hart:      { kind: "heart", shadowY: 200 }
  };

  const ART = {
    // Voorbeeldontwerpen zoals een klant ze zou aanleveren (UV-bedrukking)
    bakkerij(W, H) {
      const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2;
      let dots = "";
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        dots += `<circle cx="${cx + Math.cos(a) * r * .72}" cy="${cy + Math.sin(a) * r * .72}" r="${r * .045}" fill="${C.sun}"/>`;
      }
      return `<rect width="${W}" height="${H}" fill="${C.cream}"/>
        <rect x="${W * .04}" y="${H * .04}" width="${W * .92}" height="${H * .92}" rx="${r * .9}" fill="none" stroke="${C.coral}" stroke-width="${r * .09}"/>
        ${dots}
        <text x="${cx}" y="${cy + r * .06}" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="${r * .34}" fill="${C.ink}" letter-spacing="-1">Maison</text>
        <text x="${cx}" y="${cy + r * .3}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="${r * .1}" fill="${C.coral}" letter-spacing="${r * .03}">BISCUITS</text>`;
    },
    confetti(W, H) {
      const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2;
      const pts = [[.14,.2,C.coral],[.3,.78,C.sun],[.82,.18,C.sun],[.88,.7,C.coral],[.62,.1,C.cream],[.08,.6,C.ink],[.5,.92,C.ink],[.74,.86,C.cream],[.22,.4,C.cream],[.94,.42,C.ink]];
      const conf = pts.map(([x, y, c], i) => `<circle cx="${x * W}" cy="${y * H}" r="${r * (i % 3 ? .07 : .1)}" fill="${c}"/>`).join("");
      return `<rect width="${W}" height="${H}" fill="${C.sky}"/>${conf}
        <circle cx="${cx}" cy="${cy}" r="${r * .44}" fill="${C.cream}"/>
        <text x="${cx}" y="${cy + r * .02}" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="${r * .17}" fill="${C.ink}">jouw</text>
        <text x="${cx}" y="${cy + r * .2}" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="${r * .17}" fill="${C.coral}">logo</text>`;
    },
    strepen(W, H) {
      const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2, pid = id("st");
      return `<defs><pattern id="${pid}" width="${r * .3}" height="${r * .3}" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="${r * .15}" height="${r * .3}" fill="${C.coral}"/></pattern></defs>
        <rect width="${W}" height="${H}" fill="${C.sun}"/><rect width="${W}" height="${H}" fill="url(#${pid})"/>
        <circle cx="${cx}" cy="${cy}" r="${r * .5}" fill="${C.ink}"/>
        <text x="${cx}" y="${cy + r * .12}" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="${r * .32}" fill="${C.cream}">LOGO</text>`;
    },
    thee(W, H) {
      const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2;
      let stars = "";
      const s = [[.15,.25],[.3,.12],[.8,.3],[.7,.78],[.2,.75],[.9,.55],[.45,.88],[.6,.18]];
      s.forEach(([x, y], i) => stars += `<circle cx="${x * W}" cy="${y * H}" r="${r * (i % 2 ? .025 : .04)}" fill="${C.cream}"/>`);
      return `<rect width="${W}" height="${H}" fill="${C.ink}"/>${stars}
        <circle cx="${cx + r * .3}" cy="${cy - r * .28}" r="${r * .2}" fill="${C.sun}"/>
        <text x="${cx}" y="${cy + r * .2}" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="${r * .42}" fill="${C.cream}">Thé</text>
        <rect x="${cx - r * .32}" y="${cy + r * .36}" width="${r * .64}" height="${r * .05}" rx="${r * .025}" fill="${C.coral}"/>`;
    },
    cadeau(W, H) {
      const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2;
      return `<rect width="${W}" height="${H}" fill="${C.coral}"/>
        <rect x="${cx - r * .1}" y="0" width="${r * .2}" height="${H}" fill="${C.sun}"/>
        <rect x="0" y="${cy - r * .1}" width="${W}" height="${r * .2}" fill="${C.sun}"/>
        <circle cx="${cx}" cy="${cy}" r="${r * .34}" fill="${C.cream}"/>
        <text x="${cx}" y="${cy + r * .1}" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="${r * .26}" fill="${C.ink}">Merci</text>`;
    }
  };

  function tin(el) {
    const shape = SHAPES[el.dataset.tin] || SHAPES.rond;
    const m = METAL[el.dataset.color] || METAL.zilver;
    const artName = el.dataset.art || "confetti";
    const art = ART[artName] || ART.confetti;
    const tilt = 0.32;
    const g = { body: id("b"), lid: id("l"), top: id("t"), clip: id("c"), sh: id("s") };

    const defs = `<defs>
      <linearGradient id="${g.body}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="${m.d}"/><stop offset=".22" stop-color="${m.l}"/><stop offset=".48" stop-color="${m.m}"/><stop offset=".8" stop-color="${m.l}" stop-opacity=".9"/><stop offset="1" stop-color="${m.d}"/>
      </linearGradient>
      <linearGradient id="${g.lid}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="${m.d}"/><stop offset=".25" stop-color="${m.rim}"/><stop offset=".55" stop-color="${m.m}"/><stop offset=".85" stop-color="${m.l}"/><stop offset="1" stop-color="${m.d}"/>
      </linearGradient>
      <linearGradient id="${g.top}" x1="0" x2=".3" y1="0" y2="1">
        <stop offset="0" stop-color="${m.t1}"/><stop offset="1" stop-color="${m.t2}"/>
      </linearGradient>
      <radialGradient id="${g.sh}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.ink}" stop-opacity=".28"/><stop offset="1" stop-color="${C.ink}" stop-opacity="0"/></radialGradient>
    </defs>`;

    let shadow = "", body = "", bodyPrint = "", lidSide = "", lidTop = "", topArt = "", shine = "";

    if (shape.kind === "round") {
      const { cx, rx, ry, lidTop: lt, lidD, bodyRx, bodyD } = shape;
      const bTop = lt + lidD - 4, bBot = bTop + bodyD;
      shadow = `<ellipse cx="${cx}" cy="${bBot + 6}" rx="${bodyRx * 1.15}" ry="${ry * .75}" fill="url(#${g.sh})"/>`;
      body = `<path d="M${cx - bodyRx} ${bTop} V${bBot} A${bodyRx} ${ry * bodyRx / rx} 0 0 0 ${cx + bodyRx} ${bBot} V${bTop} Z" fill="url(#${g.body})"/>`;
      const by = bTop + bodyD * .32, bh = bodyD * .42, bry = ry * bodyRx / rx;
      bodyPrint = `<path class="print" d="M${cx - bodyRx} ${by} V${by + bh} A${bodyRx} ${bry} 0 0 0 ${cx + bodyRx} ${by + bh} V${by} A${bodyRx} ${bry} 0 0 1 ${cx - bodyRx} ${by} Z" fill="${artName === "thee" ? C.ink : artName === "strepen" ? C.coral : artName === "bakkerij" ? C.coral : C.sky}" opacity=".95"/>
        <path class="print" d="M${cx - bodyRx} ${by + bh * .5} A${bodyRx} ${bry} 0 0 0 ${cx + bodyRx} ${by + bh * .5}" fill="none" stroke="${C.sun}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>`;
      lidSide = `<path d="M${cx - rx} ${lt} V${lt + lidD} A${rx} ${ry} 0 0 0 ${cx + rx} ${lt + lidD} V${lt} Z" fill="url(#${g.lid})"/>
        <path d="M${cx - rx} ${lt + lidD} A${rx} ${ry} 0 0 0 ${cx + rx} ${lt + lidD}" fill="none" stroke="${C.ink}" stroke-opacity=".18" stroke-width="1.2"/>`;
      lidTop = `<ellipse cx="${cx}" cy="${lt}" rx="${rx}" ry="${ry}" fill="url(#${g.top})"/>
        <ellipse cx="${cx}" cy="${lt}" rx="${rx * .86}" ry="${ry * .86}" fill="none" stroke="${m.d}" stroke-opacity=".35" stroke-width="1.2"/>
        <ellipse cx="${cx}" cy="${lt + 1}" rx="${rx * .82}" ry="${ry * .82}" fill="none" stroke="${m.rim}" stroke-opacity=".7" stroke-width="1"/>`;
      const W = rx * 2 * .86, H = W;
      topArt = `<g class="print"><g transform="translate(${cx - W / 2} ${lt - ry * .86}) scale(1 ${tilt * (ry / (rx * tilt)) })">
        <clipPath id="${g.clip}"><circle cx="${W / 2}" cy="${H / 2}" r="${W / 2}"/></clipPath>
        <g clip-path="url(#${g.clip})">${art(W, H)}</g></g></g>`;
      shine = `<ellipse cx="${cx - rx * .35}" cy="${lt - ry * .35}" rx="${rx * .35}" ry="${ry * .22}" fill="#fff" opacity=".22"/>`;
    }

    if (shape.kind === "rect") {
      const { x, w, top, faceH, lidD, bodyD, inset, r } = shape;
      const ry = r * tilt;
      const bx = x + inset, bw = w - inset * 2, bTop = top + faceH / 2, bBot = top + faceH + lidD + bodyD;
      shadow = `<ellipse cx="${x + w / 2}" cy="${bBot + 4}" rx="${w * .58}" ry="${faceH * .5}" fill="url(#${g.sh})"/>`;
      body = `<rect x="${bx}" y="${bTop}" width="${bw}" height="${bBot - bTop}" rx="${r}" ry="${ry * 2.2}" fill="url(#${g.body})"/>`;
      if (shape.hinge) body += `<path d="M${bx + 6} ${top + faceH + lidD + 1} H${bx + bw - 6}" stroke="${C.ink}" stroke-opacity=".25" stroke-width="1.4"/>`;
      const by = top + faceH + lidD + bodyD * .25, bh = bodyD * .5;
      if (bodyD > 30) bodyPrint = `<rect class="print" x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${artName === "thee" ? C.ink : artName === "strepen" ? C.coral : C.sky}" opacity=".95"/>
        <path class="print" d="M${bx + 8} ${by + bh / 2} H${bx + bw - 8}" stroke="${C.sun}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>`;
      lidSide = `<rect x="${x}" y="${top + faceH / 2}" width="${w}" height="${faceH / 2 + lidD}" rx="${r}" ry="${ry * 2.4}" fill="url(#${g.lid})"/>
        <path d="M${x + r} ${top + faceH + lidD} H${x + w - r}" stroke="${C.ink}" stroke-opacity=".16" stroke-width="1.2"/>`;
      lidTop = `<rect x="${x}" y="${top}" width="${w}" height="${faceH}" rx="${r}" ry="${ry * 2.4}" fill="url(#${g.top})"/>
        <rect x="${x + 8}" y="${top + 3}" width="${w - 16}" height="${faceH - 6}" rx="${r * .7}" ry="${ry * 1.8}" fill="none" stroke="${m.d}" stroke-opacity=".32" stroke-width="1.1"/>`;
      const W = w - 16, Hs = faceH - 6, H = Hs / tilt;
      topArt = `<g class="print"><g transform="translate(${x + 8} ${top + 3}) scale(1 ${tilt})">
        <clipPath id="${g.clip}"><rect width="${W}" height="${H}" rx="${r * .7}" ry="${r * .7 * 2}"/></clipPath>
        <g clip-path="url(#${g.clip})">${art(W, H)}</g></g></g>`;
      shine = `<rect x="${x + w * .08}" y="${top + 2}" width="${w * .4}" height="${faceH * .28}" rx="${faceH * .14}" fill="#fff" opacity=".18"/>`;
    }

    if (shape.kind === "heart") {
      const hp = "M100 176 C 52 144, 18 112, 18 74 C 18 44, 40 22, 68 22 C 84 22, 96 32, 100 44 C 104 32, 116 22, 132 22 C 160 22, 182 44, 182 74 C 182 112, 148 144, 100 176 Z";
      const ty = 0.58, ox = 20, oy = 26, depth = 44;
      const layer = (i, grad) => `<path d="${hp}" transform="translate(${ox} ${oy + i}) scale(1 ${ty})" fill="url(#${grad})"/>`;
      body = ""; lidSide = "";
      for (let i = depth; i > 0; i -= 2) {
        if (i > 16) body += layer(i, g.body); else lidSide += layer(i, g.lid);
      }
      body += `<path d="${hp}" transform="translate(${ox} ${oy + 17}) scale(1 ${ty})" fill="none" stroke="${C.ink}" stroke-opacity=".15" stroke-width="1.2"/>`;
      shadow = `<ellipse cx="120" cy="${oy + depth + 176 * ty - 4}" rx="98" ry="22" fill="url(#${g.sh})"/>`;
      lidTop = `<path d="${hp}" transform="translate(${ox} ${oy}) scale(1 ${ty})" fill="url(#${g.top})"/>
        <path d="${hp}" transform="translate(${ox + 10} ${oy + 6}) scale(.9 ${ty * .9})" fill="none" stroke="${m.d}" stroke-opacity=".35" stroke-width="1.2"/>`;
      topArt = `<g class="print"><g transform="translate(${ox} ${oy}) scale(1 ${ty})">
        <clipPath id="${g.clip}"><path d="${hp}" transform="translate(10 10) scale(.9)"/></clipPath>
        <g clip-path="url(#${g.clip})"><g transform="translate(0 0)">${art(200, 190)}</g></g></g></g>`;
      shine = `<ellipse cx="70" cy="${oy + 30}" rx="28" ry="9" fill="#fff" opacity=".22"/>`;
    }

    el.classList.add("tin-wrap");
    el.innerHTML = `<svg class="tin" viewBox="0 0 240 220" role="img" aria-label="${el.dataset.label || "Metalen doos"}">${defs}
      ${shadow}<g class="body">${body}${bodyPrint}</g>
      <g class="lid">${lidSide}${lidTop}${topArt}${shine}</g></svg>`;
  }

  /* ---------- Stickers ---------- */
  const STICKER_SHAPES = {
    rond: `<circle cx="100" cy="100" r="78"/>`,
    vierkant: `<rect x="24" y="24" width="152" height="152" rx="26"/>`,
    druppel: `<path d="M100 12 L152 63 A74 74 0 1 1 48 63 Z" transform="translate(0 -2)"/>`,
    ovaal: `<ellipse cx="100" cy="100" rx="86" ry="58"/>`,
    rechthoek: `<rect x="14" y="52" width="172" height="96" rx="16"/>`,
    contour: `<path d="M58 40 C80 18 118 22 132 44 C160 34 186 58 176 88 C196 108 184 146 152 150 C146 178 110 188 92 168 C66 182 30 166 34 136 C10 122 14 84 40 76 C34 60 44 48 58 40 Z"/>`,
    ster: (() => {
      let d = "", n = 14;
      for (let i = 0; i < n * 2; i++) {
        const r = i % 2 ? 66 : 84, a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
        d += (i ? " L" : "M") + (100 + Math.cos(a) * r).toFixed(1) + " " + (100 + Math.sin(a) * r).toFixed(1);
      }
      return `<path d="${d} Z" stroke-linejoin="round"/>`;
    })(),
    boog: `<path d="M30 176 V100 A70 70 0 0 1 170 100 V176 Q170 182 164 182 H36 Q30 182 30 176 Z"/>`
  };

  const STICKER_ART = {
    gebakken: { bg: C.coral, fg: C.cream, l1: "Vers", l2: "gebakken", acc: C.sun },
    merci:    { bg: C.sun, fg: C.ink, l1: "Merci!", l2: "", acc: C.coral },
    club:     { bg: C.ink, fg: C.sun, l1: "Club", l2: "sinds 1923", acc: C.coral },
    handmade: { bg: C.sky, fg: C.ink, l1: "Handmade", l2: "in België", acc: C.coral },
    promo:    { bg: C.coral, fg: C.ink, l1: "−20%", l2: "deze week", acc: C.sun },
    bio:      { bg: C.cream, fg: C.ink, l1: "100%", l2: "natuurlijk", acc: C.coral },
    event:    { bg: C.ink, fg: C.cream, l1: "Fest", l2: "2027", acc: C.sun },
    ontwerp:  { bg: C.sun, fg: C.ink, l1: "Jouw", l2: "ontwerp", acc: C.coral },
    ontwerp2: { bg: C.coral, fg: C.cream, l1: "Jouw", l2: "ontwerp", acc: C.sun },
    ontwerp3: { bg: C.sky, fg: C.ink, l1: "Jouw", l2: "ontwerp", acc: C.coral },
    ontwerp4: { bg: C.ink, fg: C.cream, l1: "Jouw", l2: "ontwerp", acc: C.coral }
  };

  function sticker(el) {
    const shape = STICKER_SHAPES[el.dataset.sticker] || STICKER_SHAPES.rond;
    const a = STICKER_ART[el.dataset.art] || STICKER_ART.merci;
    const cid = id("sc");
    const two = !!a.l2;
    const big = a.l1.length > 6 ? 30 : 40;
    const cy = el.dataset.sticker === "druppel" ? 118 : el.dataset.sticker === "boog" ? 128 : 102;
    el.classList.add("sticker-wrap");
    el.innerHTML = `<svg viewBox="0 0 200 200" role="img" aria-label="${el.dataset.label || "Sticker op maat"}" class="obj-shadow">
      <defs><clipPath id="${cid}">${shape}</clipPath></defs>
      <g fill="${C.paper}" stroke="${C.paper}" stroke-width="18" stroke-linejoin="round">${shape}</g>
      <g clip-path="url(#${cid})">
        <rect width="200" height="200" fill="${a.bg}"/>
        <path d="${wavePath(240, cy + 44, 18, 6)}" fill="none" stroke="${a.acc}" stroke-width="6" stroke-linecap="round" transform="translate(-20 0)"/>
        <text x="100" y="${two ? cy - 2 : cy + 12}" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="${big}" letter-spacing="-1" fill="${a.fg}">${a.l1}</text>
        ${two ? `<text x="100" y="${cy + 24}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="15" fill="${a.fg}" opacity=".9">${a.l2}</text>` : ""}
      </g>
      <g fill="none" stroke="#000" stroke-opacity=".06" stroke-width="1">${shape}</g>
    </svg>`;
  }

  /* ---------- Geweven badges & etiketten ---------- */
  const BADGE_SHAPES = {
    rond: { path: `<circle cx="100" cy="100" r="84"/>`, border: 13 },
    schild: { path: `<path d="M100 14 L174 40 V98 C174 144 142 174 100 188 C58 174 26 144 26 98 V40 Z"/>`, border: 12 },
    rechthoek: { path: `<rect x="16" y="44" width="168" height="112" rx="20"/>`, border: 11 },
    zeshoek: { path: `<path d="M100 14 L174 56 V144 L100 186 L26 144 V56 Z"/>`, border: 12 },
    label: { path: `<rect x="8" y="66" width="184" height="68" rx="3"/>`, border: 0, label: true },
    band: { path: `<rect x="4" y="80" width="192" height="40" rx="2"/>`, border: 0, label: true }
  };

  const BADGE_ART = {
    scouts:  { bg: C.sun, border: C.ink, fg: C.ink, t1: "SCOUTS", t2: "Est. 1958", icon: "tent" },
    gidsen:  { bg: C.sky, border: C.ink, fg: C.ink, t1: "GIDSEN", t2: "Tak 2027", icon: "star" },
    club:    { bg: C.ink, border: C.coral, fg: C.cream, t1: "FC LINDE", t2: "", icon: "ball" },
    kamp:    { bg: C.cream, border: C.coral, fg: C.ink, t1: "ZOMERKAMP", t2: "2027", icon: "mountain" },
    merk:    { bg: C.ink, border: C.ink, fg: C.cream, t1: "atelier noor", t2: "", icon: "" },
    merk2:   { bg: C.cream, border: C.cream, fg: C.ink, t1: "Studio Mol", t2: "100% katoen", icon: "" },
    bedrijf: { bg: C.cream, border: C.ink, fg: C.ink, t1: "CREW", t2: "Event team", icon: "drop" },
    naam:    { bg: C.paper, border: C.paper, fg: C.ink, t1: "Lotte V.", t2: "", icon: "" },
    jeugd:   { bg: C.coral, border: C.sun, fg: C.cream, t1: "CHIRO", t2: "Groep 12", icon: "flame" },
    ontwerp: { bg: C.sun, border: C.ink, fg: C.ink, t1: "JOUW", t2: "ontwerp", icon: "drop" }
  };

  function icon(name, x, y, s, c) {
    const t = `translate(${x - s / 2} ${y - s / 2}) scale(${s / 40})`;
    switch (name) {
      case "tent": return `<g transform="${t}"><path d="M20 4 L38 36 H2 Z" fill="${c}"/><path d="M20 16 L27 36 H13 Z" fill="${C.cream}"/></g>`;
      case "mountain": return `<g transform="${t}"><circle cx="30" cy="10" r="6" fill="${C.sun}"/><path d="M0 36 L14 12 L22 24 L28 16 L40 36 Z" fill="${c}"/></g>`;
      case "star": return `<g transform="${t}"><path d="M20 2 L25 15 L39 15 L28 24 L32 38 L20 30 L8 38 L12 24 L1 15 L15 15 Z" fill="${c}"/></g>`;
      case "ball": return `<g transform="${t}"><circle cx="20" cy="20" r="17" fill="${C.cream}"/><path d="M20 10 L28 16 L25 26 H15 L12 16 Z" fill="${C.ink}"/></g>`;
      case "flame": return `<g transform="${t}"><path d="M20 2 C30 14 34 22 30 30 C27 36 13 36 10 30 C6 22 12 18 16 10 C17 16 20 18 22 16 C24 12 22 8 20 2 Z" fill="${C.sun}"/></g>`;
      case "drop": return `<g transform="${t}"><path d="M20 1 L33 14 A18 18 0 1 1 7 14 Z" fill="${c}"/></g>`;
      default: return "";
    }
  }

  function badge(el) {
    const s = BADGE_SHAPES[el.dataset.badge] || BADGE_SHAPES.rond;
    const a = BADGE_ART[el.dataset.art] || BADGE_ART.scouts;
    const cid = id("bc"), pid = id("bp");
    const hasIcon = !!a.icon;
    let content = "";
    if (s.label) {
      const fs = a.t1.length > 9 ? 22 : 26;
      content = `<text x="100" y="${a.t2 ? 100 : 108}" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="${el.dataset.badge === "band" ? 20 : fs}" fill="${a.fg}" letter-spacing="-.5">${a.t1}</text>
        ${a.t2 ? `<text x="100" y="120" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="10" letter-spacing="2" fill="${a.fg}" opacity=".8">${a.t2.toUpperCase()}</text>` : ""}`;
    } else {
      const iy = el.dataset.badge === "rechthoek" ? 82 : 78;
      const ty = hasIcon ? iy + 42 : 108;
      const fs = a.t1.length > 7 ? 20 : 26;
      content = `${hasIcon ? icon(a.icon, 100, iy, el.dataset.badge === "rechthoek" ? 34 : 42, a.fg) : ""}
        <text x="100" y="${ty}" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="${fs}" fill="${a.fg}" letter-spacing=".5">${a.t1}</text>
        ${a.t2 ? `<text x="100" y="${ty + 17}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="11" fill="${a.fg}" opacity=".85" letter-spacing="1">${a.t2}</text>` : ""}`;
    }
    // Weefstructuur: fijne diagonale lijnen
    const weave = `<pattern id="${pid}" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2" height="4" fill="#000" opacity=".07"/></pattern>`;
    const border = s.border ? `
      <g fill="none" stroke="${a.border}" stroke-width="${s.border}" stroke-linejoin="round">${s.path}</g>
      <g fill="none" stroke="#000" stroke-opacity=".22" stroke-width="${s.border}" stroke-dasharray="1.2 2.6" stroke-linejoin="round">${s.path}</g>
      <g fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="${s.border * .35}" stroke-dasharray="1 3" stroke-linejoin="round">${s.path}</g>` : "";
    const folds = s.label ? `<path d="M8 66 V134" stroke="#000" stroke-opacity=".18" stroke-width="5"/><path d="M192 66 V134" stroke="#000" stroke-opacity=".18" stroke-width="5"/>
      <path d="M16 70 V130" stroke="${a.fg}" stroke-opacity=".25" stroke-width="1" stroke-dasharray="2 3"/><path d="M184 70 V130" stroke="${a.fg}" stroke-opacity=".25" stroke-width="1" stroke-dasharray="2 3"/>` : "";
    el.classList.add("badge-wrap");
    el.innerHTML = `<svg viewBox="0 0 200 200" role="img" aria-label="${el.dataset.label || "Geweven badge"}" class="obj-shadow">
      <defs><clipPath id="${cid}">${s.path}</clipPath>${weave}</defs>
      <g fill="${a.bg}">${s.path}</g>
      <g clip-path="url(#${cid})">${content}<rect width="200" height="200" fill="url(#${pid})"/>${folds}</g>
      ${border}
    </svg>`;
  }

  function hydrate(root = document) {
    root.querySelectorAll("[data-waves]").forEach((el) => {
      const preset = el.dataset.waves;
      const sets = {
        brand: [C.cream, C.coral, C.sun],
        light: [C.ink, C.coral, C.sun],
        sky: [C.sky, C.coral, C.sun],
        ink: [C.ink, C.cream, C.sun]
      };
      el.innerHTML = waves({ colors: sets[preset] || sets.brand, stroke: +el.dataset.stroke || 26, gap: +el.dataset.gap || 62, amp: +el.dataset.amp || 26 });
    });
    root.querySelectorAll("[data-tin]").forEach(tin);
    root.querySelectorAll("[data-sticker]").forEach(sticker);
    root.querySelectorAll("[data-badge]").forEach(badge);
  }

  window.WaviArt = { hydrate, tin, sticker, badge, waves, wavePath, METAL, STICKER_SHAPES };
  hydrate();
})();
