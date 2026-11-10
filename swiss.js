/* Europe's Divides, Swiss Democracy Lab: The Far Right in Switzerland (D3 v7), drawn into one element:

     <div id="far-right-switzerland" data-base="https://<data host>/"></div>

   data-base       where data/*.json live (default: next to the page)
   data-header     "false" leaves out the built-in title (when the host page has its own)
   data-layout     "standalone" adds the page's own width and side gutters

   Reads data/*.json, written by pipeline/run.py from mart.ch_* (MotherDuck), and data/communes.topo.json (today's
   communes, cantons and lakes: BFS generalised boundaries, as on People vs Parliament). No database access here.
   Styles: swiss.css (scoped under .sfr); colours come from the host's tokens or theme.css.
   One meaning per colour: red = far right, ink = Switzerland as a whole.
   Three views of the far right, one switch for the whole page: all far-right parties, the SVP alone, or the
   smaller far-right parties. On both maps a click or tap keeps an area marked until it is clicked again. */
(function () {
  'use strict';

  const root = document.getElementById('far-right-switzerland');
  if (!root || typeof d3 === 'undefined') return;
  const BASE = root.dataset.base ? root.dataset.base.replace(/\/?$/, '/') : '';
  root.classList.add('sfr');
  if (root.dataset.layout === 'standalone') root.classList.add('sfr--standalone');

  const DOT = '<svg class="title-dot" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><circle cx="5" cy="5" r="5"/></svg>';
  const LAYER_SEG = (id) => `<div class="seg sfr-layer" id="${id}" role="group" aria-label="Which far right"></div>`;
  root.innerHTML = `<svg class="sfr-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
  <pattern id="sfr-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect class="sfr-hatch-bg" width="5" height="5"/><line class="sfr-hatch-line" x1="0" y1="0" x2="0" y2="5"/></pattern>
</defs></svg>
<div class="masthead wrap">
  <div class="masthead__text">
    <p class="eyebrow">Swiss Democracy Lab</p>
    <h1>The Far Right in Switzerland${DOT}</h1>
    <p class="lede">Every National Council election since 1971, canton by canton and commune by commune: from the movement against &ldquo;overforeignization&rdquo; to the SVP, Switzerland&rsquo;s largest party.</p>
  </div>
</div>
<div class="wrap">
  <section class="hero" aria-label="In short">
    <div class="hero__item">
      <p class="hero__label"><i class="sfr-sw sfr-sw--red"></i><span>Far right in the National Council election of <span id="sfr-hero-y"></span></span></p>
      <p class="hero__figure" id="sfr-now">&nbsp;</p>
      <p class="hero__text" id="sfr-now-text"></p>
    </div>
    <div class="hero__item">
      <p class="hero__label"><i class="sfr-sw sfr-sw--red"></i><span>Before the SVP counted</span></p>
      <p class="hero__figure" id="sfr-before">&nbsp;</p>
      <p class="hero__text" id="sfr-before-text"></p>
    </div>
  </section>

  <section class="block" aria-labelledby="sfr-h-all">
    <div class="block__rail">
      <h2 id="sfr-h-all">Every election since 1971${DOT}</h2>
      <p>Each dot is the far right&rsquo;s share of the vote in one canton in one National Council election. The line with squares is Switzerland as a whole.</p>
      <p id="sfr-all-text"></p>
    </div>
    <div class="block__body">
      <div class="filters">${LAYER_SEG('sfr-layer-all')}</div>
      <div class="chart" id="sfr-arc"></div>
      <div class="sfr-key" id="sfr-arc-key"></div>
    </div>
  </section>

  <section class="block" aria-labelledby="sfr-h-cantons">
    <div class="block__rail">
      <h2 id="sfr-h-cantons">Canton by canton${DOT}</h2>
      <p>The far right&rsquo;s share in each canton. Choose an election and which far right to show.</p>
      <p class="note" id="sfr-kmap-note"></p>
    </div>
    <div class="block__body">
      <div class="filters">
        <div class="seg sfr-year" id="sfr-kyear" role="group" aria-label="Election"></div>
        ${LAYER_SEG('sfr-layer-k')}
      </div>
      <div class="sfr-key" id="sfr-kkey"></div>
      <div class="chart sfr-map" id="sfr-kmap"></div>
    </div>
  </section>

  <section class="block" aria-labelledby="sfr-h-communes">
    <div class="block__rail">
      <h2 id="sfr-h-communes">Commune by commune${DOT}</h2>
      <p>All of Switzerland&rsquo;s communes, on today&rsquo;s boundaries: the Federal Statistical Office restates every election on one commune state, and communes that have merged since are added up.</p>
      <p class="note" id="sfr-cmap-note"></p>
    </div>
    <div class="block__body">
      <div class="filters">
        <div class="seg sfr-year" id="sfr-cyear" role="group" aria-label="Election"></div>
        ${LAYER_SEG('sfr-layer-c')}
      </div>
      <div class="sfr-tools">
        <label class="sfr-find" for="sfr-cfind">Find a commune
          <input id="sfr-cfind" type="search" list="sfr-cnames" autocomplete="off" placeholder="e.g. Schwyz"></label>
        <datalist id="sfr-cnames"></datalist>
        <div class="sfr-zoom">
          <button type="button" id="sfr-czin" aria-label="Zoom in">+</button>
          <button type="button" id="sfr-czout" aria-label="Zoom out">&minus;</button>
          <button type="button" id="sfr-czreset">Reset</button>
        </div>
      </div>
      <div class="sfr-key" id="sfr-ckey"></div>
      <div class="chart sfr-tmap" id="sfr-cmap"></div>
    </div>
  </section>

  <section class="block" aria-labelledby="sfr-h-why">
    <div class="block__rail">
      <h2 id="sfr-h-why">What goes with it${DOT}</h2>
      <p>The communes compared on seven measures from the Federal Statistical Office and the Federal Tax Administration. German-speaking communes and French- or Italian-speaking communes are compared separately: the far right is much stronger in German-speaking Switzerland, so a single comparison would mostly show the gap between the language regions.</p>
      <p id="sfr-why-text"></p>
      <p>These are patterns across communes, not causes, and they say nothing about how any one person votes. Every commune counts once, whatever its size.</p>
    </div>
    <div class="block__body">
      <div class="filters">
        <div class="seg" id="sfr-ind" role="group" aria-label="Measure"></div>
        ${LAYER_SEG('sfr-layer-why')}
      </div>
      <div class="sfr-key"><span><i class="sfr-sw sfr-sw--red"></i>German-speaking commune</span><span><i class="sfr-sw sfr-sw--hollow"></i>French- or Italian-speaking commune</span><span><i class="sfr-ln"></i>Trend, German-speaking</span><span><i class="sfr-ln sfr-ln--latin"></i>Trend, French- and Italian-speaking</span></div>
      <div class="chart" id="sfr-scatter"></div>
      <p class="note" id="sfr-scatter-note"></p>
      <div class="tablewrap sfr-tablewrap"><table id="sfr-corr"></table></div>
    </div>
  </section>

  <section class="block" aria-labelledby="sfr-h-parties">
    <div class="block__rail">
      <h2 id="sfr-h-parties">What counts as far right${DOT}</h2>
      <p>Parties classed as far right by the PopuList, a classification by political scientists used across Europe, from 1991, the first National Council election it covers. For the earlier elections: the parties of the movement against &ldquo;overforeignization&rdquo;, after the historian Damir Skenderovic.</p>
      <p>The SVP counts from 1991. Before that, as a conservative farmers&rsquo; and trades party, it does not; its earlier results appear as a dotted line and in the tooltips, not added in.</p>
    </div>
    <div class="block__body">
      <div class="tablewrap sfr-tablewrap"><table id="sfr-parties"></table></div>
    </div>
  </section>
</div>
<footer class="wrap foot">
  <h2>How this is counted</h2>
  <div>
    <ul>
      <li>Shares are party strengths in National Council elections: a party&rsquo;s votes as a share of all party votes. Voters have as many votes as their canton has seats, so the Federal Statistical Office adds the cantons up for Switzerland with &ldquo;fictitious voters&rdquo; (party votes divided by seats).</li>
      <li>The far right is the sum of the parties counted as far right in that election (table above), shown together, as the SVP alone, or as the smaller parties alone. The Federal Statistical Office reports the Nationale Aktion and its successor, the Schweizer Demokraten (from 1990), under one code; the Mouvement Citoyens Genevois stands for the National Council as Mouvement Citoyens Romand.</li>
      <li>Cantons with a single seat (Uri, Obwalden, Nidwalden, Glarus, Appenzell Innerrhoden, and Appenzell Ausserrhoden since 2003) elect by majority vote: their shares are votes for people, which the Federal Statistical Office counts for their parties. One party can look overwhelming, as the SVP&rsquo;s 82.8% in Nidwalden in 2015, and a small share can come from votes written in for a party member who is not running. Where only one candidate stands, nobody votes (a tacit election); those cantons have no result in that year.</li>
      <li>A share of 0 usually means nobody of the far right stood: no list, or no candidate where one seat is elected. Before 1991 only the Nationale Aktion and the Republikaner count, and they stood in 6 to 13 cantons; the SVP first stood in many cantons only in the 1990s and 2000s; and in the single-seat cantons the SVP often put up no candidate. The maps hatch these cantons (and their communes), and the chart shows them as hollow dots. A commune where a far-right list stood but got no vote has an ordinary 0.</li>
      <li>Communes: results by commune from the Federal Statistical Office, restated on one commune state and added up onto today&rsquo;s communes; the counting units of the Swiss abroad are in the canton results but not on the commune map. A commune always voted in the canton it then belonged to: the Jura voted in Bern up to the 1975 election, the Laufental up to 1991 and Moutier up to 2023. In the smallest communes a few dozen voters decide the share, so the map notes name the highest share among communes with at least 100 voters. Boundaries: today&rsquo;s communes.</li>
      <li>&ldquo;What goes with it&rdquo;: residents, foreign nationals and age from STATPOP (31 December of the year before the election), jobs by commune of work from STATENT (the same year), median taxable income per tax return from the Federal Tax Administration&rsquo;s direct federal tax statistics (the election&rsquo;s tax year, estimated from income classes), all added up onto today&rsquo;s communes. Language regions and municipality types: the Federal Statistical Office&rsquo;s 2020 classifications; the few Romansh-speaking communes are counted with the German-speaking ones. &rho; is Spearman&rsquo;s rank correlation: 1 means the communes fall in the same order on both, &minus;1 in reverse order, 0 no relation. Trend lines are least-squares fits (on a logarithmic scale for density and jobs).</li>
      <li>Not counted: the Autopartei / Freiheits-Partei (in the National Council from 1987 to 1999), which the PopuList does not class as far right, and other small lists that the Federal Statistical Office reports under &ldquo;others&rdquo;.</li>
    </ul>
    <p class="credit">Election results: Swiss Federal Statistical Office (BFS), STAT-TAB, <a href="https://www.pxweb.bfs.admin.ch/pxweb/de/px-x-1702020000_104/-/px-x-1702020000_104.px/">Nationalratswahlen: Parteistimmen, fiktive W&auml;hlende und Parteist&auml;rke seit 1971 (Schweiz und Kantone)</a>, <a href="https://www.pxweb.bfs.admin.ch/pxweb/de/px-x-1702020000_105/-/px-x-1702020000_105.px/">(Bezirke und Gemeinden)</a> and <a href="https://www.pxweb.bfs.admin.ch/pxweb/de/px-x-1702020000_101/-/px-x-1702020000_101.px/">Wahlberechtigte, W&auml;hlende und Typen von Wahlzetteln seit 1971</a>, Neuch&acirc;tel. Commune measures: BFS, <a href="https://www.pxweb.bfs.admin.ch/pxweb/de/px-x-0102010000_101/-/px-x-0102010000_101.px/">STATPOP</a>, <a href="https://www.pxweb.bfs.admin.ch/pxweb/de/px-x-0602010000_102/-/px-x-0602010000_102.px/">STATENT</a>, <a href="https://www.agvchapp.bfs.admin.ch/de/home">commune register</a> (language regions, municipality typology); Federal Tax Administration (ESTV), <a href="https://www.estv.admin.ch/de/statistiken-natuerliche-personen-gemeinden-1983-bis-heute">direct federal tax, natural persons, by commune</a>. Classification: <a href="https://popu-list.org">The PopuList 4.0</a> (Rooduijn et al. 2024); D. Skenderovic (2009), <em>The Radical Right in Switzerland: Continuity and Change, 1945&ndash;2000</em>, New York/Oxford: Berghahn. Boundaries: BFS, <a href="https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html">generalised boundaries</a> (K4), <span id="sfr-geo-state"></span>.</p>
  </div>
</footer>`;
  if (root.dataset.header === 'false') root.querySelector('.masthead').remove();

  // ---------- settings ----------
  const CANTONS = ['', 'Zürich', 'Bern', 'Luzern', 'Uri', 'Schwyz', 'Obwalden', 'Nidwalden', 'Glarus', 'Zug', 'Fribourg', 'Solothurn',
    'Basel-Stadt', 'Basel-Landschaft', 'Schaffhausen', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'St. Gallen', 'Graubünden',
    'Aargau', 'Thurgau', 'Ticino', 'Vaud', 'Valais', 'Neuchâtel', 'Genève', 'Jura'];
  const LAYERS = [['f', 'All far right'], ['svp', 'SVP'], ['sm', 'Smaller parties']];
  const LAYER_WORD = { f: 'far right', svp: 'SVP', sm: 'smaller far-right parties' };
  const SVP_FROM = 1991;
  const state = { layer: 'f', year: null };
  try {
    const l = localStorage.getItem('sfr-layer'); if (LAYERS.some(([v]) => v === l)) state.layer = l;
  } catch (e) { /* storage unavailable */ }
  const BINS = [1, 2, 5, 10, 20, 30, 40, 50];         // share, %: classes c1 (<1) ... c9 (50 and more), as on the German page
  const BIN_LABELS = ['<1', '1–2', '2–5', '5–10', '10–20', '20–30', '30–40', '40–50', '50+'];

  // ---------- helpers ----------
  const $ = (sel) => root.querySelector(sel.replace(/#([\w-]+)/g, '#sfr-$1'));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const f1 = d3.format('.1f');
  const pct = (v) => (v == null ? '–' : f1(v) + '%');
  const num = d3.format(',');
  const val = (r) => (r == null ? null : state.layer === 'svp' ? r.svp : state.layer === 'sm' ? r.sm : r.f);
  const binOf = (v) => (v == null ? 0 : 1 + d3.bisectRight(BINS, v));
  // Why an area shows 0 in the current layer: 'nc' = the SVP before it counts, 'none' = no party of the layer stood there
  // (no list, or no candidate where one seat is elected), null = it stood. st: bit 1 SVP stood (and counts), bit 2 a smaller party.
  const STOOD_BIT = { f: 3, svp: 1, sm: 2 };
  const zeroWhy = (r, year) => {
    if (state.layer === 'svp' && year < SVP_FROM) return 'nc';
    if (!r || r.st == null) return null;
    return r.st & STOOD_BIT[state.layer] ? null : 'none';
  };
  const NONE_KEY = { f: 'No far-right list or candidate', svp: 'No SVP list or candidate', sm: 'No list or candidate of a smaller far-right party' };
  const NONE_NOTE = {
    f: 'No far-right party stood here (no list, or no candidate where a single seat is elected), so the 0 is not a vote result.',
    svp: 'The SVP did not stand here (no list, or no candidate where a single seat is elected), so the 0 is not a vote result.',
    sm: 'No smaller far-right party stood here, so the 0 is not a vote result.',
  };
  const NC_KEY = 'SVP not counted before ' + SVP_FROM;
  // a hatch for areas where nobody of the layer stood; one pattern per drawing (ids must be unique on the page)
  const hatch = (svg, id) => {
    const p = svg.append('defs').append('pattern').attr('id', id).attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 5).attr('height', 5).attr('patternTransform', 'rotate(45)');
    p.append('rect').attr('class', 'sfr-hatch-bg').attr('width', 5).attr('height', 5);
    p.append('line').attr('class', 'sfr-hatch-ln').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 5);
    return 'url(#' + id + ')';
  };
  const singleSeat = (k, y) => { const c = CANTON_ROWS.find((r) => r.y === y && r.k === k); return !!(c && c.ss); };
  const partyLabel = (p, y) => ({ SVP: 'SVP', SD: y < 1990 ? 'Nationale Aktion' : 'Schweizer Demokraten', 'Rep.': 'Republikaner',
    EDU: 'EDU', Lega: 'Lega dei Ticinesi', MCR: 'MCG (as MCR)' }[p] || p);
  const parseLists = (ps) => (ps ? ps.split('|').map((x) => { const i = x.lastIndexOf(':'); return [x.slice(0, i), +x.slice(i + 1)]; }) : []);
  const rampKey = () => '<div class="sfr-ramp" aria-label="Share of the vote, percent">' +
    BIN_LABELS.map((l, i) => '<span><i class="sfr-c' + (i + 1) + '"></i>' + l + '</span>').join('') + '<span class="sfr-ramp__unit">%</span></div>';

  async function getJSON(path) {
    const r = await fetch(BASE + path + '?m=' + Math.floor(Date.now() / 60000), { cache: 'no-cache' });
    if (!r.ok) throw new Error('Could not load ' + BASE + path + ' (' + r.status + ').');
    return r.json();
  }

  function onWidth(el, draw) {
    let last = -1;
    const run = () => {
      const w = Math.round(el.clientWidth);
      if (w && w !== last) { last = w; draw(); }
    };
    if ('ResizeObserver' in window) new ResizeObserver(() => requestAnimationFrame(run)).observe(el);
    else window.addEventListener('resize', run);
    run();
    return () => { last = -1; run(); };
  }

  function tooltip(container) {
    const tip = document.createElement('div');
    tip.className = 'tooltip';
    tip.hidden = true;
    tip.setAttribute('role', 'status');
    container.appendChild(tip);
    return {
      show(html, x, y) {
        tip.innerHTML = html;
        tip.hidden = false;
        const cw = container.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
        let left = x + 14;
        if (left + tw > cw) left = Math.max(0, x - tw - 14);
        let top = y - th - 12;
        if (top < 0) top = y + 16;
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
      },
      hide() { tip.hidden = true; },
    };
  }

  // Maps: hovering shows an area; a click or tap keeps it (outline and tooltip) until the same area is clicked
  // again, another area is clicked, or Escape is pressed.
  const PINS = new Set();
  function keepOnClick(svg, shapes, show, hide) {
    let pinned = null;
    shapes.on('pointermove', (ev, f) => { if (!pinned && ev.pointerType === 'mouse') show(ev, f); })
      .on('click', (ev, f) => { if (pinned === f) { pinned = null; hide(); } else { pinned = f; show(ev, f); } });
    svg.on('pointerleave', () => { if (!pinned) hide(); });
    const unpin = () => { if (pinned) { pinned = null; hide(); } };
    PINS.forEach((u) => { if (!u.svg.node().isConnected) PINS.delete(u); });
    PINS.add({ svg, unpin });
    return { pin(f) { pinned = f; } };
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') PINS.forEach((u) => u.unpin()); });

  // one switch state, several switches: every switch of a kind shows the same choice
  const LISTENERS = { layer: [], year: [] };
  function fillSeg(el, items, key) {
    el.innerHTML = '';
    items.forEach(([v, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.dataset.v = v;
      b.setAttribute('aria-pressed', String(state[key] === v));
      b.addEventListener('click', () => setState(key, v));
      el.appendChild(b);
    });
  }
  function setState(key, v) {
    if (state[key] === v) return;
    state[key] = v;
    if (key === 'layer') { try { localStorage.setItem('sfr-layer', v); } catch (e) { /* ignore */ } }
    root.querySelectorAll(key === 'layer' ? '.sfr-layer button' : '.sfr-year button')
      .forEach((b) => b.setAttribute('aria-pressed', String(String(b.dataset.v) === String(v))));
    LISTENERS[key].forEach((fn) => fn());
  }

  function topoReader(topo) {
    const t = topo.transform;
    const arcs = topo.arcs.map((a) => {
      if (!t) return a;
      let x = 0, y = 0;
      return a.map(([dx, dy]) => { x += dx; y += dy; return [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]]; });
    });
    const arc = (i) => (i < 0 ? arcs[~i].slice().reverse() : arcs[i]);
    const ring = (ids) => { const pts = []; ids.forEach((i, k) => { const a = arc(i); pts.push(...(k ? a.slice(1) : a)); }); return pts; };
    const polys = (g) => (g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : []);
    return {
      features(obj) {
        return obj.geometries.filter((g) => g.arcs).map((g) => ({
          type: 'Feature', id: g.id, properties: g.properties || {},
          geometry: { type: 'MultiPolygon', coordinates: polys(g).map((p) => p.map(ring)) },
        }));
      },
      mesh(obj, keep) {
        const owners = new Map();
        obj.geometries.forEach((g) => polys(g).forEach((p) => p.forEach((r) => r.forEach((i) => {
          const k = i < 0 ? ~i : i;
          if (!owners.has(k)) owners.set(k, []);
          owners.get(k).push(g);
        }))));
        const lines = [];
        owners.forEach((gs, k) => { if (keep(gs[0], gs[1] || gs[0])) lines.push(arcs[k]); });
        return { type: 'MultiLineString', coordinates: lines };
      },
    };
  }

  // ---------- data ----------
  let NATIONAL = [], CANTON_ROWS = [], PARTIES = [], YEARS = [], GEO = null;
  const COMMUNES = new Map();     // year -> Map(bfs_nr -> row)
  async function communes(year) {
    if (!COMMUNES.has(year)) {
      const rows = await getJSON('data/communes_' + year + '.json');
      COMMUNES.set(year, new Map(rows.map((r) => [r.u, r])));
    }
    return COMMUNES.get(year);
  }
  async function geo() {
    if (!GEO) {
      const [topo, list] = await Promise.all([getJSON('data/communes.topo.json'), getJSON('data/communes.json')]);
      const reader = topoReader(topo);
      const o = topo.objects;
      GEO = {
        communes: reader.features(o.communes),
        cantons: reader.features(o.cantons),
        lakes: reader.features(o.lakes),
        cantonLines: reader.mesh(o.communes, (a, b) => a !== b && a.properties.kt !== b.properties.kt),
        outline: reader.mesh(o.communes, (a, b) => a === b),
        meta: topo.meta || {},
        names: new Map(list.map((c) => [c.u, c.n])),   // today's communes, with or without a result
      };
    }
    return GEO;
  }

  // ---------- tooltips ----------
  function areaTip(r, where, year, extra, k) {
    let html = '<p class="tt__meta">National Council ' + year + (extra ? ' · ' + esc(extra) : '') + '</p><p class="tt__title">' + esc(where) + '</p>';
    if (!r || (r.ok === false)) return html + '<p class="tt__note">No vote held (tacit election).</p>';
    const lists = parseLists(r.ps);
    const why = zeroWhy(r, year);
    if (why === 'none') html += '<p class="tt__note">' + NONE_NOTE[state.layer] + '</p>';
    else if (why === 'nc') html += '<p class="tt__note">The SVP counts as far right from ' + SVP_FROM + '.</p>';
    if (k != null ? singleSeat(k, year) : r.ss) html += '<p class="tt__note">One seat, elected by majority vote: the shares are votes for people, counted for their parties. Voters may also write in someone who is not running.</p>';
    html += '<table class="tt__tab"><tbody>';
    if (lists.length) {
      lists.forEach(([p, v]) => { html += '<tr><th>' + esc(partyLabel(p, year)) + '</th><td>' + pct(v) + '</td></tr>'; });
      if (lists.length > 1) html += '<tr class="tt__sub"><th>Far right together</th><td>' + pct(r.f) + '</td></tr>';
    } else if (r.st == null || r.st > 0) html += '<tr><th>Far right</th><td>no votes' + (k != null ? ' here' : '') + '</td></tr>';
    if (year < SVP_FROM && r.sv0 != null) html += '<tr><th>SVP (not counted before ' + SVP_FROM + ')</th><td>' + pct(r.sv0) + '</td></tr>';
    if (r.e != null) html += '<tr class="tt__sub"><th>Eligible voters</th><td>' + num(r.e) + '</td></tr>';
    if (r.t != null) html += '<tr><th>Turnout</th><td>' + pct(r.t) + '</td></tr>';
    return html + '</tbody></table>';
  }

  // ---------- hero ----------
  function renderHero() {
    const last = NATIONAL[NATIONAL.length - 1];
    $('#hero-y').textContent = last.y;
    $('#now').innerHTML = f1(last.f) + '<small>%</small>';
    $('#now-text').textContent = 'of the vote: ' + pct(last.svp) + ' for the SVP and ' + pct(last.sm) + ' for smaller far-right parties.';
    const before = NATIONAL.filter((n) => n.y < SVP_FROM);
    const peak = before.reduce((a, c) => (c.sm > a.sm ? c : a), before[0]);
    $('#before').innerHTML = f1(peak.sm) + '<small>%</small>';
    $('#before-text').textContent = 'for the Nationale Aktion and the Republikaner in ' + peak.y +
      ', the parties of the movement against “overforeignization”: their best result before ' + SVP_FROM + '. The SVP then had ' + pct(peak.sv0) + ' and does not count before ' + SVP_FROM + '.';
  }

  // ---------- every election since 1971 ----------
  function drawArc(el) {
    const W = Math.round(el.clientWidth);
    if (!W) return;
    el.querySelectorAll('svg').forEach((n) => n.remove());
    const tip = el._tip || (el._tip = tooltip(el));
    tip.hide();
    const H = Math.round(Math.max(300, Math.min(440, W * 0.55)));
    const m = { t: 12, r: 12, b: 28, l: 38 };
    const rows = CANTON_ROWS.filter((r) => r.ok);
    const x = d3.scaleLinear([1969, 2025], [m.l, W - m.r]);
    const ymax = Math.max(10, d3.max(rows, val) || 0, d3.max(NATIONAL, (n) => (state.layer === 'sm' ? n.sm : Math.max(val(n), n.sv0 || 0))));
    const y = d3.scaleLinear([0, Math.ceil(ymax / 10) * 10], [H - m.b, m.t]).nice();
    const svg = d3.select(el).insert('svg', ':first-child').attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img').attr('aria-label', 'Chart: ' + LAYER_WORD[state.layer] + ' share in each canton and in Switzerland, National Council elections since 1971');
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`)
      .call(d3.axisBottom(x).tickValues(YEARS.filter((yy, i) => W > 560 || i % 2 === 0)).tickFormat(d3.format('d')).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis axis--y').attr('transform', `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat((v) => v + '%').tickSize(-(W - m.l - m.r)))
      .call((g) => g.select('.domain').remove());
    // the SVP before it counts: dotted, for context
    if (state.layer !== 'sm') {
      const pre = NATIONAL.filter((n) => n.y <= SVP_FROM && n.sv0 != null);
      svg.append('path').attr('class', 'sfr-svp0').attr('d', d3.line((n) => x(n.y), (n) => y(n.sv0))(pre));
      const p0 = pre[0];
      svg.append('text').attr('class', 'sfr-svp0-label').attr('x', x(p0.y) + 4).attr('y', y(p0.sv0) - 7).text('SVP, not counted until ' + SVP_FROM);
    }
    const jitter = (k) => ((k * 37) % 11 - 5) * Math.min(1.6, W / 400);
    const shown = rows.filter((r) => zeroWhy(r, r.y) !== 'nc');
    const dots = svg.append('g').selectAll('circle').data(shown).join('circle')
      .attr('class', (r) => (zeroWhy(r, r.y) === 'none' ? 'sfr-dot0' : 'sfr-dot')).attr('r', W < 480 ? 2.6 : 3.2)
      .attr('cx', (r) => x(r.y) + jitter(r.k)).attr('cy', (r) => y(val(r)));
    const nat = NATIONAL.map((n) => ({ ...n, v: val(n) }));
    svg.append('path').attr('class', 'sfr-natline').attr('d', d3.line((n) => x(n.y), (n) => y(n.v))(nat));
    const sq = svg.append('g').selectAll('rect').data(nat).join('rect').attr('class', 'sfr-nat')
      .attr('x', (n) => x(n.y) - 3.5).attr('y', (n) => y(n.v) - 3.5).attr('width', 7).attr('height', 7);
    const show = (ev, r, where) => {
      const [px, py] = d3.pointer(ev, el);
      tip.show(areaTip(r, where, r.y), px, py);
    };
    dots.on('pointermove', (ev, r) => show(ev, r, CANTONS[r.k])).on('click', (ev, r) => show(ev, r, CANTONS[r.k]));
    sq.on('pointermove', (ev, n) => show(ev, n, 'Switzerland')).on('click', (ev, n) => show(ev, n, 'Switzerland'));
    svg.on('pointerleave', () => tip.hide());
    const rings = shown.filter((r) => zeroWhy(r, r.y) === 'none').length;
    $('#arc-key').innerHTML = '<span><i class="sfr-sw sfr-sw--red"></i>a canton</span><span><i class="sfr-sw sfr-sw--nat"></i>Switzerland</span>' +
      (rings ? '<span><i class="sfr-sw sfr-sw--ring"></i>' + NONE_KEY[state.layer].replace(/^No/, 'no') + ' in the canton</span>' : '') +
      (state.layer !== 'sm' ? '<span><i class="sfr-sw sfr-sw--svp0"></i>SVP before ' + SVP_FROM + ', not counted</span>' : '');
    const first = NATIONAL[0], s91 = NATIONAL.find((n) => n.y === SVP_FROM), last = NATIONAL[NATIONAL.length - 1];
    $('#all-text').textContent = 'Until ' + (SVP_FROM - 4) + ' the far right counted here is the Nationale Aktion and the Republikaner (' + pct(first.f) + ' in ' + first.y +
      '). From ' + SVP_FROM + ', when the SVP counts, the far right rose from ' + pct(s91.f) + ' to ' + pct(last.f) + ' in ' + last.y + '.' +
      (rings ? ' Hollow dots at 0 are cantons where no ' + (state.layer === 'svp' ? 'SVP' : state.layer === 'sm' ? 'smaller far-right' : 'far-right') +
        ' list or candidate stood; they say nothing about how people voted.' : '') + singleSeatText(shown);
  }

  // The highest dots are often cantons with a single seat, where one candidate's vote is the whole result.
  function singleSeatText(shown) {
    const top = shown.reduce((a, c) => (val(c) > val(a) ? c : a), shown[0]);
    if (!top || !top.ss) return '';
    return ' The highest dot, ' + CANTONS[top.k] + ' in ' + top.y + ' (' + pct(val(top)) + '), is a canton with a single seat, elected by majority vote: there the share is the vote for one person.';
  }

  // ---------- maps ----------
  function mapHeight(W, feats) {
    const all = { type: 'FeatureCollection', features: feats };
    const probe = d3.geoIdentity().reflectY(true).fitWidth(W, all);
    const b = d3.geoPath(probe).bounds(all);
    return Math.round(Math.min(b[1][1] - b[0][1], Math.max(320, W * 0.75)));
  }

  function drawCantons(el) {
    const W = Math.round(el.clientWidth);
    if (!W || !GEO) return;
    el.querySelectorAll('svg').forEach((n) => n.remove());
    const tip = el._tip || (el._tip = tooltip(el));
    tip.hide();
    const H = mapHeight(W, GEO.cantons);
    const proj = d3.geoIdentity().reflectY(true).fitExtent([[2, 2], [W - 2, H - 2]], { type: 'FeatureCollection', features: GEO.cantons });
    const path = d3.geoPath(proj);
    const byK = new Map(CANTON_ROWS.filter((r) => r.y === state.year).map((r) => [r.k, r]));
    const svg = d3.select(el).insert('svg', ':first-child').attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img');
    const hfill = hatch(svg, 'sfr-hatch-k');
    const kWhy = (f) => { const r = byK.get(f.id); return r && r.ok ? zeroWhy(r, state.year) : null; };
    const shapes = svg.append('g').selectAll('path').data(GEO.cantons).join('path')
      .attr('class', (f) => { const r = byK.get(f.id); return 'sfr-county ' + (r && r.ok ? (kWhy(f) ? 'sfr-none' : 'sfr-c' + binOf(val(r))) : 'sfr-cx'); })
      .style('fill', (f) => (kWhy(f) ? hfill : null))
      .attr('d', path);
    svg.append('g').selectAll('path').data(GEO.lakes).join('path').attr('class', 'sfr-lake').attr('d', path);
    svg.append('path').attr('class', 'sfr-outline').attr('d', path(GEO.outline));
    const labels = svg.append('g').attr('class', 'sfr-klabels');
    GEO.cantons.forEach((f) => {
      const r = byK.get(f.id), c = path.centroid(f), a = path.area(f);
      if (!r || a < 900) return;
      labels.append('text').attr('x', c[0]).attr('y', c[1]).text(r.a);
    });
    const hl = svg.append('path').attr('class', 'focus-ring');
    const show = (ev, f) => {
      hl.attr('d', path(f)).attr('visibility', 'visible');
      const [px, py] = d3.pointer(ev, el);
      const r = byK.get(f.id);
      tip.show(r ? areaTip(r, CANTONS[f.id], state.year) : '<p class="tt__meta">National Council ' + state.year + '</p><p class="tt__title">' + esc(CANTONS[f.id]) +
        '</p><p class="tt__note">' + (f.id === 26 && state.year < 1979 ? 'Part of the canton of Bern until 1978.' :
        'No party results in this election (for example a tacit election, where nobody votes).') + '</p>', px, py);
    };
    keepOnClick(svg, shapes, show, () => { tip.hide(); hl.attr('visibility', 'hidden'); });
    const rows = [...byK.values()].filter((r) => r.ok);
    const top = rows.reduce((a, c) => (val(c) > val(a) ? c : a), rows[0]);
    const none = GEO.cantons.filter((f) => !byK.has(f.id) && !(f.id === 26 && state.year < 1979)).map((f) => CANTONS[f.id]);
    const stoodNot = GEO.cantons.filter((f) => kWhy(f) === 'none').map((f) => CANTONS[f.id]);
    const nc = GEO.cantons.some((f) => kWhy(f) === 'nc');
    const extra = (stoodNot.length || nc ? '<span><i class="sfr-sw sfr-sw--none"></i>' + (nc ? NC_KEY : NONE_KEY[state.layer]) + '</span>' : '') +
      (GEO.cantons.some((f) => !byK.has(f.id)) ? '<span><i class="sfr-sw sfr-sw--novote"></i>No result' + (state.year < 1979 ? ' (Jura: part of Bern until 1978)' : '') + '</span>' : '');
    $('#kkey').innerHTML = rampKey() + (extra ? '<div class="sfr-key">' + extra + '</div>' : '');
    $('#kmap-note').textContent = (nc ? 'The SVP counts as far right from ' + SVP_FROM + '.' :
      'Highest in ' + state.year + ': ' + CANTONS[top.k] + ', ' + pct(val(top)) + ' (' + LAYER_WORD[state.layer] + ').' +
      (stoodNot.length ? ' ' + NONE_KEY[state.layer] + ' in ' + stoodNot.join(', ') + '.' : '')) +
      (none.length ? ' No party results for ' + none.join(', ') + '.' : '');
    svg.attr('aria-label', 'Map of the ' + LAYER_WORD[state.layer] + ' share by canton, National Council ' + state.year + '. Highest: ' + CANTONS[top.k] + ', ' + pct(val(top)) + '.');
  }

  const CM = { view: null, names: new Map() };
  function drawCommunes(el, rows) {
    const W = Math.round(el.clientWidth);
    if (!W || !GEO || !rows) return;
    el.querySelectorAll('svg').forEach((n) => n.remove());
    const tip = el._tip || (el._tip = tooltip(el));
    tip.hide();
    const H = mapHeight(W, GEO.communes);
    const proj = d3.geoIdentity().reflectY(true).fitExtent([[2, 2], [W - 2, H - 2]], { type: 'FeatureCollection', features: GEO.communes });
    const path = d3.geoPath(proj);
    const svg = d3.select(el).insert('svg', ':first-child').attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img');
    const hfill = hatch(svg, 'sfr-hatch-c');
    const g = svg.append('g');
    const cWhy = (f) => { const r = rows.get(f.id); return r && r.pv ? zeroWhy(r, state.year) : null; };
    const shapes = g.append('g').selectAll('path').data(GEO.communes).join('path')
      .attr('class', (f) => { const r = rows.get(f.id); return 'sfr-county sfr-town ' + (r && r.pv ? (cWhy(f) ? 'sfr-none' : 'sfr-c' + binOf(val(r))) : 'sfr-cx'); })
      .style('fill', (f) => (cWhy(f) ? hfill : null))
      .attr('d', path);
    g.append('g').selectAll('path').data(GEO.lakes).join('path').attr('class', 'sfr-lake').attr('d', path);
    g.append('path').attr('class', 'sfr-statelines').attr('d', path(GEO.cantonLines));
    g.append('path').attr('class', 'sfr-outline').attr('d', path(GEO.outline));
    const hl = g.append('path').attr('class', 'focus-ring');
    const tipFor = (f) => {
      const r = rows.get(f.id);
      if (!r) {
        const cantonDone = CANTON_ROWS.some((c) => c.y === state.year && c.k === f.properties.kt);
        return '<p class="tt__meta">National Council ' + state.year + ' · ' + esc(CANTONS[f.properties.kt] || '') + '</p><p class="tt__title">' +
          esc(GEO.names.get(f.id) || 'Commune') + '</p><p class="tt__note">' + (cantonDone
          ? 'Its votes are counted together with a neighbouring commune, so there is no separate result.'
          : 'No party results for this canton in this election (for example a tacit election, where nobody votes).') + '</p>';
      }
      return areaTip(r.pv ? r : null, r.n, state.year, CANTONS[r.k], r.k);
    };
    const show = (ev, f) => {
      hl.attr('d', path(f)).attr('visibility', 'visible');
      const [px, py] = d3.pointer(ev, el);
      tip.show(tipFor(f), px, py);
    };
    const keep = keepOnClick(svg, shapes, show, () => { tip.hide(); hl.attr('visibility', 'hidden'); });
    const zoom = d3.zoom().scaleExtent([1, 32]).translateExtent([[0, 0], [W, H]])
      .filter((ev) => (ev.type === 'wheel' ? ev.ctrlKey || ev.metaKey : ev.type === 'touchstart' ? ev.touches.length > 1 : !ev.button))
      .on('zoom', (ev) => { g.attr('transform', ev.transform); svg.classed('is-zoomed', ev.transform.k > 1.01); tip.hide(); });
    svg.call(zoom).on('dblclick.zoom', null);
    const zoomTo = (f) => {      // the commune and its surroundings: at most 8 times, so its neighbours stay in view
      const [[x0, y0], [x1, y1]] = path.bounds(f);
      const k = Math.max(1, Math.min(8, 0.25 / Math.max((x1 - x0) / W, (y1 - y0) / H)));
      const t = d3.zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
      svg.transition().duration(600).call(zoom.transform, t).on('end', () => {
        keep.pin(f);
        hl.attr('d', path(f)).attr('visibility', 'visible');
        const p = t.apply(path.centroid(f));
        tip.show(tipFor(f), p[0], p[1]);
      });
    };
    CM.view = { zoom, svg, zoomTo };
    const vals = [...rows.values()].filter((r) => r.pv);
    const cNone = GEO.communes.some((f) => cWhy(f) === 'none'), cNc = GEO.communes.some((f) => cWhy(f) === 'nc');
    $('#ckey').innerHTML = rampKey() + '<div class="sfr-key">' + (cNone || cNc ? '<span><i class="sfr-sw sfr-sw--none"></i>' +
      (cNc ? NC_KEY : NONE_KEY[state.layer] + ' in the canton') + '</span>' : '') + '<span><i class="sfr-sw sfr-sw--novote"></i>No separate result</span></div>';
    // The very smallest communes (a few dozen voters) swing to extremes; the note names the highest among the rest.
    const big = vals.filter((r) => r.e && r.t != null && (r.e * r.t) / 100 >= 100);
    const pool = big.length ? big : vals;
    const top = pool.reduce((a, c) => (val(c) > val(a) ? c : a), pool[0]);
    const over = vals.filter((r) => val(r) >= 50).length;
    $('#cmap-note').textContent = num(vals.length) + ' communes with results in ' + state.year + '. ' + (cNc ? 'The SVP counts as far right from ' + SVP_FROM + '.' :
      'Highest share (' + LAYER_WORD[state.layer] + ')' + (big.length ? ' among communes with at least 100 voters' : '') + ': ' +
      top.n + ' (' + CANTONS[top.k] + '), ' + pct(val(top)) + '.' + (over ? ' 50% or more in ' + num(over) + ' communes.' : '')) +
      ' Zoom with the buttons, by pinching, or with Ctrl or ⌘ and the scroll wheel.';
    svg.attr('aria-label', 'Map of the ' + LAYER_WORD[state.layer] + ' share by commune, National Council ' + state.year + '. Highest: ' + top.n + ', ' + pct(val(top)) + '.');
  }

  function setupMaps() {
    const kEl = $('#kmap'), cEl = $('#cmap');
    const yearItems = YEARS.slice().map((y) => [y, String(y)]);
    root.querySelectorAll('.sfr-year').forEach((el) => fillSeg(el, yearItems, 'year'));
    $('#kkey').innerHTML = rampKey();
    $('#ckey').innerHTML = rampKey() + '<div class="sfr-key"><span><i class="sfr-sw sfr-sw--novote"></i>No separate result</span></div>';
    let kRedraw = null, cRedraw = null;
    const renderK = () => { if (!kRedraw) kRedraw = onWidth(kEl, () => drawCantons(kEl)); else kRedraw(); };
    const renderC = async () => {
      const rows = await communes(state.year);
      CM.rows = rows;
      if (!CM.names.size) {
        CM.names = new Map([...GEO.names].map(([u, n]) => [n, u]));
        $('#cnames').innerHTML = [...CM.names.keys()].sort((a, b) => a.localeCompare(b, 'de')).map((n) => '<option value="' + esc(n) + '">').join('');
      }
      if (!cRedraw) cRedraw = onWidth(cEl, () => drawCommunes(cEl, CM.rows)); else cRedraw();
    };
    LISTENERS.year.push(renderK, renderC);
    LISTENERS.layer.push(renderK, renderC);
    const find = $('#cfind');
    const reset = () => CM.view && CM.view.svg.transition().duration(400).call(CM.view.zoom.transform, d3.zoomIdentity);
    find.addEventListener('change', () => {
      const u = CM.names.get(find.value);
      const f = u && GEO.communes.find((x) => x.id === u);
      if (f && CM.view) CM.view.zoomTo(f);
    });
    find.addEventListener('search', () => { if (!find.value) reset(); });
    find.addEventListener('keydown', (e) => { if (e.key === 'Escape') { find.value = ''; reset(); } });
    $('#czin').addEventListener('click', () => CM.view && CM.view.svg.transition().duration(300).call(CM.view.zoom.scaleBy, 2));
    $('#czout').addEventListener('click', () => CM.view && CM.view.svg.transition().duration(300).call(CM.view.zoom.scaleBy, 0.5));
    $('#czreset').addEventListener('click', reset);
    renderK();
    renderC();
  }

  // ---------- parties ----------
  function renderParties() {
    const t = $('#parties');
    t.innerHTML = '<thead><tr><th>Party</th><th>Counted</th><th>Group</th><th>Basis</th></tr></thead><tbody>' +
      PARTIES.map((p) => '<tr><td><b>' + esc(p.n) + '</b><br><span class="note">BFS: ' + esc(p.p) + '</span></td><td>' +
        (p.f1 ? p.f0 + '–' + p.f1 : 'from ' + p.f0) + '</td><td>' + (p.g === 'svp' ? 'SVP' : 'smaller') + '</td><td>' +
        esc(p.b.split(';').map((b) => ({ populist4: 'PopuList', skenderovic2009: 'Skenderovic 2009' }[b] || b)).join(', ')) +
        (p.note ? '<br><span class="note">' + esc(p.note) + '</span>' : '') + '</td></tr>').join('') + '</tbody>';
  }

  // ---------- what goes with it: commune measures ----------
  const WHY = { code: null, year: null, ind: [], rows: [], corr: [] };
  const VOTE = { f: 'far_right', svp: 'svp', sm: 'small' };
  const GROUP = { german: 'German-speaking', latin: 'French- or Italian-speaking' };
  const LANG_OF = { german: 'German- or Romansh-speaking', latin: 'French- or Italian-speaking' };
  const SHARE_OF = { f: 'the far-right share', svp: 'the SVP share', sm: 'the share of the smaller far-right parties' };
  const SHARE_HEAD = { f: 'Far right', svp: 'SVP', sm: 'Smaller far-right parties' };
  const fmtVal = (ind, v) => {
    if (v == null) return '–';
    if (ind.unit.startsWith('CHF')) return 'CHF ' + num(Math.round(v));
    if (ind.scale === 'log') return num(Math.round(v));
    return (v > 0 && ind.code === 'popchg' ? '+' : '') + f1(v) + (ind.unit.startsWith('%') ? '%' : '');
  };
  const rhoTxt = (r) => (r == null ? '–' : (r < 0 ? '−' : '') + d3.format('.2f')(Math.abs(r)));
  const corrOf = (code, reg) => WHY.corr.find((k) => k.y === WHY.year && k.c === code && k.r === reg && k.v === VOTE[state.layer]);

  function drawWhy(el) {
    const W = Math.round(el.clientWidth);
    if (!W || !WHY.ind.length) return;
    el.querySelectorAll('svg').forEach((n) => n.remove());
    const tip = el._tip || (el._tip = tooltip(el));
    tip.hide();
    const ind = WHY.ind.find((i) => i.code === WHY.code);
    const xv = (r) => r.x[ind.code];
    const pts = WHY.rows.filter((r) => r.y === WHY.year && xv(r) != null && val(r) != null && (ind.scale !== 'log' || xv(r) > 0));
    const small = W < 560;
    const H = Math.round(Math.max(300, Math.min(W * 0.62, 480)));
    const m = { t: 26, r: 12, b: 40, l: small ? 34 : 40 };
    const ext = d3.extent(pts, xv);
    const x = ind.scale === 'log' ? d3.scaleLog().domain([ext[0] / 1.15, ext[1] * 1.15]).range([m.l, W - m.r])
      : d3.scaleLinear().domain(ext).nice().range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain([0, Math.max(10, d3.max(pts, val))]).nice().range([H - m.b, m.t]);
    const svg = d3.select(el).insert('svg', ':first-child').attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img');
    const g = svg.append('g').attr('class', 'grid');
    const yt = y.ticks(5);
    g.selectAll('line').data(yt).join('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', (d) => Math.round(y(d)) + 0.5).attr('y2', (d) => Math.round(y(d)) + 0.5);
    svg.append('g').selectAll('text').data(yt).join('text').attr('class', 'tick').attr('x', m.l - 6).attr('y', (d) => y(d)).attr('dy', '0.32em')
      .attr('text-anchor', 'end').text((d, i) => (i === yt.length - 1 ? d + '%' : d));
    const [x0, x1] = x.domain();
    const xt = ind.scale === 'log' ? [1, 3, 10, 30, 100, 300, 1000, 3000, 10000, 30000].filter((d) => d >= x0 && d <= x1) : x.ticks(small ? 4 : 6);
    const tickTxt = (d) => (ind.unit.startsWith('CHF') ? num(d / 1000) + 'k' : num(d)) + (ind.unit.startsWith('%') && d === xt[xt.length - 1] ? '%' : '');
    svg.append('g').selectAll('text').data(xt).join('text').attr('class', 'tick').attr('x', (d) => x(d)).attr('y', H - m.b + 16)
      .attr('text-anchor', 'middle').text(tickTxt);
    if (x0 < 0 && x1 > 0) svg.append('line').attr('class', 'sfr-zero').attr('x1', x(0)).attr('x2', x(0)).attr('y1', m.t).attr('y2', H - m.b);
    svg.append('text').attr('class', 'axis-title').attr('x', W - m.r).attr('y', H - 4).attr('text-anchor', 'end').text(ind.name + (ind.name.toLowerCase() === ind.unit.toLowerCase() ? '' : ' (' + ind.unit + ')'));
    svg.append('text').attr('class', 'axis-title').attr('x', m.l - (small ? 30 : 36)).attr('y', 11).text(SHARE_HEAD[state.layer] + ', % of party votes');
    const dots = svg.append('g');
    ['german', 'latin'].forEach((grp) => {
      dots.append('g').selectAll('circle').data(pts.filter((r) => r.g === grp)).join('circle')
        .attr('class', grp === 'german' ? 'sfr-dot sfr-wdot' : 'sfr-hollow sfr-wdot').attr('r', small ? 2.2 : 2.7)
        .attr('cx', (r) => x(xv(r))).attr('cy', (r) => y(val(r)));
    });
    ['german', 'latin'].forEach((grp) => {
      const c = corrOf(ind.code, grp);
      const own = pts.filter((r) => r.g === grp);
      if (!c || c.slope == null || own.length < 3) return;
      const [a, b] = d3.extent(own, xv);
      const fx = (v) => c.intercept + c.slope * (ind.scale === 'log' ? Math.log10(v) : v);
      const seg = d3.range(0, 21).map((i) => { const v = ind.scale === 'log' ? a * Math.pow(b / a, i / 20) : a + (b - a) * i / 20; return [x(v), y(Math.max(0, fx(v)))]; });
      svg.append('path').attr('class', 'sfr-trend-halo').attr('d', d3.line()(seg));
      svg.append('path').attr('class', 'sfr-trend sfr-trend--' + grp).attr('d', d3.line()(seg));
    });
    const ring = svg.append('circle').attr('class', 'focus-ring').attr('r', 6).attr('visibility', 'hidden');
    const delaunay = d3.Delaunay.from(pts, (r) => x(xv(r)), (r) => y(val(r)));
    svg.append('rect').attr('class', 'overlay').attr('width', W).attr('height', H).attr('aria-hidden', 'true')
      .on('pointermove pointerdown', (ev) => {
        const [px, py] = d3.pointer(ev);
        const i = delaunay.find(px, py);
        const best = pts[i];
        if (!best || Math.hypot(x(xv(best)) - px, y(val(best)) - py) > 16) { tip.hide(); ring.attr('visibility', 'hidden'); return; }
        ring.attr('visibility', 'visible').attr('cx', x(xv(best))).attr('cy', y(val(best)));
        const a = el.getBoundingClientRect(), b = svg.node().getBoundingClientRect();
        tip.show('<p class="tt__meta">' + esc(CANTONS[best.k] || '') + ' · ' + esc(LANG_OF[best.g]) + '</p><p class="tt__title">' + esc(best.n) + '</p>' +
          '<table class="tt__tab"><tbody><tr><th>' + esc(LAYER_WORD[state.layer].replace(/^./, (c) => c.toUpperCase())) + ' ' + WHY.year + '</th><td>' + pct(val(best)) + '</td></tr>' +
          '<tr><th>' + esc(ind.short_name) + ' (' + esc(ind.data_years[String(WHY.year)]) + ')</th><td>' + fmtVal(ind, xv(best)) + '</td></tr>' +
          (best.e != null ? '<tr class="tt__sub"><th>Eligible voters</th><td>' + num(best.e) + '</td></tr>' : '') + '</tbody></table>',
        b.left - a.left + x(xv(best)), b.top - a.top + y(val(best)));
      })
      .on('pointerleave', () => { tip.hide(); ring.attr('visibility', 'hidden'); });
    const cg = corrOf(ind.code, 'german'), cl = corrOf(ind.code, 'latin');
    svg.attr('aria-label', ind.name + ' and ' + SHARE_OF[state.layer] + ' by commune, National Council ' + WHY.year +
      '. Rank correlation, German-speaking communes ' + rhoTxt(cg && cg.rho) + ', French- or Italian-speaking ' + rhoTxt(cl && cl.rho) + '.');
    $('#scatter-note').textContent = ind.description + ' Figures for ' + ind.data_years[String(WHY.year)] + '. Rank correlation ρ with ' +
      SHARE_OF[state.layer] + ': German-speaking communes ' + rhoTxt(cg && cg.rho) + ' (' + num(cg ? cg.n : 0) + ' communes), French- or Italian-speaking ' +
      rhoTxt(cl && cl.rho) + ' (' + num(cl ? cl.n : 0) + ').';
    renderCorrTable();
  }

  function renderCorrTable() {
    const bar = (r) => {
      if (r == null) return '<td class="num">–</td><td></td>';
      const w = Math.round(Math.abs(r) * 50);
      return '<td class="num">' + rhoTxt(r) + '</td><td class="sfr-rhocell"><span class="sfr-rho"><i style="' + (r < 0 ? 'right:50%' : 'left:50%') + ';width:' + w + '%"></i></span></td>';
    };
    const rows = WHY.ind.map((i) => {
      const a = corrOf(i.code, 'german'), b = corrOf(i.code, 'latin');
      return '<tr data-code="' + i.code + '"' + (i.code === WHY.code ? ' class="is-on"' : '') + '><td>' + esc(i.name) + '</td>' + bar(a && a.rho) + bar(b && b.rho) + '</tr>';
    });
    $('#corr').innerHTML = '<thead><tr><th>' + esc(SHARE_HEAD[state.layer]) + ', ' + WHY.year + '</th><th class="num">German &rho;</th><th class="sfr-rhocell"></th>' +
      '<th class="num">French / Italian &rho;</th><th class="sfr-rhocell"></th></tr></thead><tbody>' + rows.join('') + '</tbody>';
  }

  function setupWhy(el) {
    let started = false;
    const start = async () => {
      if (started) return;
      started = true;
      try {
        const [ind, rows, corr] = await Promise.all([getJSON('data/indicators.json'), getJSON('data/correlates.json'), getJSON('data/correlations.json')]);
        WHY.ind = ind; WHY.rows = rows; WHY.corr = corr;
      } catch (err) {
        el.insertAdjacentHTML('afterbegin', '<p class="error">' + esc(err.message) + '</p>');
        return;
      }
      if (!WHY.ind.length || !WHY.rows.length) return;
      WHY.code = WHY.ind[0].code;
      WHY.year = d3.max(WHY.rows, (r) => r.y);
      whyText();
      const redraw = onWidth(el, () => drawWhy(el));
      LISTENERS.layer.push(redraw);
      const segInd = $('#ind');
      const pick = (val) => segInd.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === String(val))));
      WHY.ind.forEach((i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = i.short_name; b.dataset.v = i.code;
        b.addEventListener('click', () => { WHY.code = i.code; pick(i.code); drawWhy(el); });
        segInd.appendChild(b);
      });
      pick(WHY.code);
      $('#corr').addEventListener('click', (ev) => {
        const tr = ev.target.closest('tr[data-code]');
        if (!tr) return;
        WHY.code = tr.dataset.code; pick(WHY.code); drawWhy(el);
      });
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '600px 0px' });
      io.observe(el);
    } else start();
  }

  // The rail's summary: the statements are written by hand and guarded by sql/90_qa.sql (they must hold for the
  // latest election); the figures come from the data.
  function whyText() {
    const r = (code, reg) => { const k = WHY.corr.find((c) => c.y === WHY.year && c.c === code && c.r === reg && c.v === 'far_right'); return rhoTxt(k ? k.rho : null); };
    $('#why-text').textContent = 'In ' + WHY.year + ' the same pattern held in both language regions: the far right did best where many people work in farming ' +
      '(ρ ' + r('agri', 'german') + ' among German-speaking communes, ' + r('agri', 'latin') + ' among French- and Italian-speaking ones) and few people live per square kilometre (' +
      r('density', 'german') + ' and ' + r('density', 'latin') + '). It was also stronger where few foreign nationals live (' + r('foreign', 'german') + ' and ' + r('foreign', 'latin') +
      '). Lower incomes go with it more in German-speaking communes (' + r('income', 'german') + ') than in the others (' + r('income', 'latin') +
      '). The share of older residents and population growth hardly go with it.';
  }

  // ---------- start ----------
  async function boot() {
    try {
      [NATIONAL, CANTON_ROWS, PARTIES] = await Promise.all([getJSON('data/national.json'), getJSON('data/cantons.json'), getJSON('data/parties.json')]);
      await geo();
    } catch (err) {
      root.querySelector('.hero').insertAdjacentHTML('beforebegin', '<p class="error">' + esc(err.message) + '</p>');
      return;
    }
    YEARS = NATIONAL.map((n) => n.y);
    state.year = YEARS[YEARS.length - 1];
    $('#geo-state').textContent = GEO.meta.state_date ? 'state of ' + GEO.meta.state_date : '';
    root.querySelectorAll('.sfr-layer').forEach((el) => fillSeg(el, LAYERS, 'layer'));
    renderHero();
    const arcEl = $('#arc');
    const arcRedraw = onWidth(arcEl, () => drawArc(arcEl));
    LISTENERS.layer.push(arcRedraw);
    setupMaps();
    setupWhy($('#scatter'));
    renderParties();
  }
  boot();
})();
