#!/usr/bin/env python3
"""Bouwt de statische Waviprint-pagina's: gedeelde head, navigatie, menu, footer + paginabody."""
import hashlib, pathlib, sys

OUT = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(__file__).parent / "pages"

PAGES = [
    ("index", "Waviprint · Metalen dozen, stickers en geweven badges op maat",
     "Waviprint is een Belgisch bedrijf voor metalen dozen (onbedrukt of met UV-bedrukking), stickers op maat en geweven etiketten en badges."),
    ("metalen-dozen", "Metalen dozen, onbedrukt of met UV-bedrukking · Waviprint",
     "Metalen dozen in verschillende vormen, maten en kleuren. Koop ze onbedrukt of laat ze personaliseren met UV-bedrukking. Voor food en non-food."),
    ("stickers", "Stickers op maat, in elke vorm en maat · Waviprint",
     "Gepersonaliseerde stickers in alle afmetingen en vormen, uitgesneden volgens jouw ontwerp. Voor etiketten, verpakkingen, branding, events en verenigingen."),
    ("geweven-etiketten-badges", "Geweven etiketten en badges · Waviprint",
     "Geweven badges en etiketten in alle soorten, maten en vormen. Voor scouts, gidsen, clubs, kledingmerken en bedrijven."),
    ("offerte", "Offerte aanvragen · Waviprint",
     "Vraag in drie korte stappen een offerte aan voor metalen dozen, stickers op maat of geweven etiketten en badges."),
    ("contact", "Contact · Waviprint",
     "Neem contact op met Waviprint voor een algemene vraag over metalen dozen, stickers of geweven badges."),
]

NAV = [
    ("index", "Home"),
    ("metalen-dozen", "Metalen dozen"),
    ("stickers", "Stickers"),
    ("geweven-etiketten-badges", "Etiketten en badges"),
    ("contact", "Contact"),
]

MENU = [
    ("index", "Home"),
    ("metalen-dozen", "Metalen dozen"),
    ("stickers", "Stickers"),
    ("geweven-etiketten-badges", "Geweven etiketten en badges"),
    ("offerte", "Offerte aanvragen"),
    ("contact", "Contact"),
]

def href(slug):
    return "index.html" if slug == "index" else f"{slug}.html"

def head(title, desc, slug):
    return f"""<!doctype html>
<html lang="nl-BE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#141B4D">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="assets/img/og-image.png">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<script>document.documentElement.classList.add("js");setTimeout(function(){{if(!window.__wvReady)document.documentElement.classList.remove("js")}},3500);</script>
</head>
<body class="page-{slug}">
<a class="skip-link" href="#main">Naar de inhoud</a>
"""

def cur(s, slug):
    return ' aria-current="page"' if s == slug else ""

def nav(slug):
    links = "\n".join(
        f'        <li><a href="{href(s)}"{cur(s, slug)}>{label}</a></li>'
        for s, label in NAV)
    menu = "\n".join(
        f'      <li><a href="{href(s)}"{cur(s, slug)}>{label}</a></li>'
        for s, label in MENU)
    return f"""
<header class="nav" role="banner" data-nav>
  <div class="nav-inner">
    <a class="nav-logo" href="index.html" aria-label="Waviprint, naar de homepagina">
      <img class="logo-color" src="assets/img/waviprint-horizontal-sans-signature-couleur.svg" alt="Waviprint" width="190" height="46">
      <img class="logo-inv" src="assets/img/waviprint-horizontal-sans-signature-inverse.svg" alt="" width="190" height="46">
    </a>
    <nav aria-label="Hoofdnavigatie">
      <ul class="nav-links">
{links}
      </ul>
    </nav>
    <a class="nav-cta" href="offerte.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5 18.4 9a8 8 0 1 1-12.8 0Z"/><path d="M8.5 14.5c1.2-1.4 2.3-1.4 3.5 0s2.3 1.4 3.5 0"/></svg><span>Offerte aanvragen</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menu openen"><span></span><span></span></button>
  </div>
</header>

<div class="menu" id="menu" aria-hidden="true">
  <nav aria-label="Menu">
    <ul>
{menu}
    </ul>
  </nav>
  <div>
    <div class="menu-foot">
      <a href="mailto:celine@belgosweet.be">celine@belgosweet.be</a>
      <a href="tel:+32498056674">+32 498 05 66 74</a>
    </div>
    <div class="waves waves--loop" data-waves="brand" data-stroke="22" data-gap="48" data-amp="20"></div>
  </div>
</div>
"""

FOOTER = """
<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer-grid">
      <div>
        <img class="footer-logo" src="assets/img/waviprint-horizontal-inverse.svg" alt="Waviprint, Belgian custom printing" width="300" height="88">
        <p class="mt-2 max-50">Metalen dozen, stickers op maat en geweven etiketten en badges. Voor bedrijven, verenigingen, organisaties en particulieren.</p>
        <span class="opening"><i></i>Open vanaf 1 januari 2027</span>
      </div>
      <div>
        <h4>Producten</h4>
        <ul>
          <li><a href="metalen-dozen.html">Metalen dozen</a></li>
          <li><a href="stickers.html">Stickers op maat</a></li>
          <li><a href="geweven-etiketten-badges.html">Geweven etiketten en badges</a></li>
        </ul>
      </div>
      <div>
        <h4>Waviprint</h4>
        <ul>
          <li><a href="offerte.html">Offerte aanvragen</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li>Céline Saelens</li>
          <li><a href="tel:+32498056674">+32 498 05 66 74</a></li>
          <li><a href="mailto:celine@belgosweet.be">celine@belgosweet.be</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>2026</span> Waviprint · Belgian custom printing</span>
      <span>Gemaakt in België</span>
    </div>
  </div>
</footer>

<div class="curtain" aria-hidden="true">
  <div class="sheet">
    <div class="waves waves--loop" data-waves="brand" data-stroke="26" data-gap="56" data-amp="22"></div>
    <img class="mark" src="assets/img/waviprint-symbole-inverse.svg" alt="">
  </div>
</div>
<div class="grain" aria-hidden="true"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Draggable.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="assets/js/art.js"></script>
<script src="assets/js/main.js"></script>
</body>
</html>
"""

# Kleine helpers die in de body-bestanden als {{TAG}} gebruikt kunnen worden
ICONS = {
    "ARROW": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    "ARROW_UR": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    "PHONE": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    "MAIL": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    "UPLOAD": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
    "CHECK": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
}

HERO3D = """<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
<script type="module" src="assets/js/hero3d.js"></script>
"""

def build():
    for slug, title, desc in PAGES:
        body = (SRC / f"{slug}.html").read_text()
        for k, v in ICONS.items():
            body = body.replace("{{" + k + "}}", v)
        footer = FOOTER
        html = head(title, desc, slug) + nav(slug) + '\n<main id="main">\n' + body + "\n</main>\n" + footer
        for asset in ("assets/css/style.css", "assets/js/art.js", "assets/js/main.js"):
            v = hashlib.md5((OUT / asset).read_bytes()).hexdigest()[:8]
            html = html.replace(f'"{asset}"', f'"{asset}?v={v}"')
        (OUT / f"{slug}.html").write_text(html)
        print("✓", slug)

if __name__ == "__main__":
    build()
