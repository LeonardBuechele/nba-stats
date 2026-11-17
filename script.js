// =====================================================================
// NBA Stats
// Daten: NBA Stats API – https://github.com/nprasad2077/nbaStats
// Base-URL: https://api.server.nbaapi.com (kein API-Key nötig)
// Achtung: season=2025 bedeutet die Saison 2024/25
// =====================================================================

const API_BASE = "https://api.server.nbaapi.com/api";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE_IN_OUT = "cubic-bezier(0.76, 0, 0.24, 1)";
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

// Aktuelle Auswahl
const state = {
  view: "home",
  season: null,
  team: null,
  conf: "West",
  players: [],              // alle Spieler des Teams (mit berechneten Werten)
  visible: [],              // Spieler in der aktuellen Sortierung/Suche
  sort: { key: "ppg", asc: false },
  player: null
};

const cache = new Map();    // bereits geladene API-Antworten

/* =====================================================================
   DATEN
   ===================================================================== */
const seasons = [
  { year: 2025, img: "./API_Saison/2025.jpg", champion: "Oklahoma City Thunder" },
  { year: 2024, img: "./API_Saison/2024.webp", champion: "Boston Celtics" },
  { year: 2023, img: "./API_Saison/2023.jpg", champion: "Denver Nuggets" },
  { year: 2022, img: "./API_Saison/2022.webp", champion: "Golden State Warriors" }
];

// abbr = Kürzel für die API, color = Hauptfarbe des Teams, conf = Conference
const teams = [
  { name: "Atlanta Hawks", abbr: "ATL", conf: "East", color: "#c8102e", img: "./API_Bilder/hawks.png" },
  { name: "Boston Celtics", abbr: "BOS", conf: "East", color: "#007a33", img: "./API_Bilder/Boston.png" },
  { name: "Brooklyn Nets", abbr: "BRK", conf: "East", color: "#000000", img: "./API_Bilder/nets.png" },
  { name: "Charlotte Hornets", abbr: "CHO", conf: "East", color: "#00788c", img: "./API_Bilder/hornets.png" },
  { name: "Chicago Bulls", abbr: "CHI", conf: "East", color: "#ce1141", img: "./API_Bilder/chicago.png" },
  { name: "Cleveland Cavaliers", abbr: "CLE", conf: "East", color: "#860038", img: "./API_Bilder/cleveland.png" },
  { name: "Detroit Pistons", abbr: "DET", conf: "East", color: "#1d42ba", img: "./API_Bilder/pistons.png" },
  { name: "Indiana Pacers", abbr: "IND", conf: "East", color: "#002d62", img: "./API_Bilder/pacers.png" },
  { name: "Miami Heat", abbr: "MIA", conf: "East", color: "#98002e", img: "./API_Bilder/miami.png" },
  { name: "Milwaukee Bucks", abbr: "MIL", conf: "East", color: "#00471b", img: "./API_Bilder/bucks.jpg" },
  { name: "New York Knicks", abbr: "NYK", conf: "East", color: "#006bb6", img: "./API_Bilder/knicks.png" },
  { name: "Orlando Magic", abbr: "ORL", conf: "East", color: "#0077c0", img: "./API_Bilder/magic.png" },
  { name: "Philadelphia 76ers", abbr: "PHI", conf: "East", color: "#006bb6", img: "./API_Bilder/phili.png" },
  { name: "Toronto Raptors", abbr: "TOR", conf: "East", color: "#ce1141", img: "./API_Bilder/raptors.png" },
  { name: "Washington Wizards", abbr: "WAS", conf: "East", color: "#002b5c", img: "./API_Bilder/Wizards.png" },
  { name: "Dallas Mavericks", abbr: "DAL", conf: "West", color: "#00538c", img: "./API_Bilder/dallas.png" },
  { name: "Denver Nuggets", abbr: "DEN", conf: "West", color: "#0e2240", img: "./API_Bilder/nuggets.png" },
  { name: "Golden State Warriors", abbr: "GSW", conf: "West", color: "#1d428a", img: "./API_Bilder/Goldenstate.png" },
  { name: "Houston Rockets", abbr: "HOU", conf: "West", color: "#ce1141", img: "./API_Bilder/Houston.png" },
  { name: "Los Angeles Clippers", abbr: "LAC", conf: "West", color: "#c8102e", img: "./API_Bilder/Clippers.png" },
  { name: "Los Angeles Lakers", abbr: "LAL", conf: "West", color: "#552583", img: "./API_Bilder/Lakers.png" },
  { name: "Memphis Grizzlies", abbr: "MEM", conf: "West", color: "#5d76a9", img: "./API_Bilder/memphis.png" },
  { name: "Minnesota Timberwolves", abbr: "MIN", conf: "West", color: "#0c2340", img: "./API_Bilder/timberwolves.jpg" },
  { name: "New Orleans Pelicans", abbr: "NOP", conf: "West", color: "#0c2340", img: "./API_Bilder/pelicans.png" },
  { name: "Oklahoma City Thunder", abbr: "OKC", conf: "West", color: "#007ac1", img: "./API_Bilder/okc.png" },
  { name: "Phoenix Suns", abbr: "PHO", conf: "West", color: "#1d1160", img: "./API_Bilder/suns.png" },
  { name: "Portland Trail Blazers", abbr: "POR", conf: "West", color: "#c8102e", img: "./API_Bilder/portland.png" },
  { name: "Sacramento Kings", abbr: "SAC", conf: "West", color: "#5a2d81", img: "./API_Bilder/kings.png" },
  { name: "San Antonio Spurs", abbr: "SAS", conf: "West", color: "#000000", img: "./API_Bilder/spurs.png" },
  { name: "Utah Jazz", abbr: "UTA", conf: "West", color: "#002b5c", img: "./API_Bilder/jazz.png" }
];

// Eigene Spielerfotos (nur Houston). Schlüssel = normalisierter Name
const localPlayerImages = {
  "jalen green": "./API_Spieler/jalen.jpg",
  "fred vanvleet": "./API_Spieler/fred.jpg",
  "alperen sengun": "./API_Spieler/alperen.jpg",
  "dillon brooks": "./API_Spieler/dillon.jpg",
  "amen thompson": "./API_Spieler/amen.jpg",
  "cam whitmore": "./API_Spieler/cam.jpg",
  "jabari smith jr.": "./API_Spieler/jabari.jpg",
  "tari eason": "./API_Spieler/tari.jpg",
  "jock landale": "./API_Spieler/jock.jpg",
  "jeff green": "./API_Spieler/jeff.jpg",
  "reggie bullock": "./API_Spieler/reggie.jpg",
  "aaron holiday": "./API_Spieler/aaron.jpg",
  "jermaine samuels jr.": "./API_Spieler/jermaine.jpg",
  "nate hinton": "./API_Spieler/nate.jpg",
  "jeremiah robinson-earl": "./API_Spieler/jeremiah.jpg",
  "boban marjanovic": "./API_Spieler/boban.jpg"
};

const positionNames = {
  PG: "Point Guard",
  SG: "Shooting Guard",
  SF: "Small Forward",
  PF: "Power Forward",
  C: "Center"
};

/* =====================================================================
   HILFSFUNKTIONEN
   ===================================================================== */
const $ = id => document.getElementById(id);

// Text aus der API nie direkt als HTML verwenden
function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// "Alperen Şengün" -> "alperen sengun"
function normalizeName(name) {
  return String(name).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function initials(name) {
  return String(name).split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function seasonLabel(year) {
  return `${year - 1}/${String(year).slice(-2)}`;
}

function perGame(total, games) {
  return games ? total / games : 0;
}

function fmt(value, decimals = 1) {
  return Number(value).toLocaleString("de-AT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function pct(value) {
  return typeof value === "number" ? fmt(value * 100) + " %" : "–";
}

function playerImage(player) {
  return localPlayerImages[normalizeName(player.playerName)]
    ?? `https://www.basketball-reference.com/req/202106291/images/headshots/${player.playerId}.jpg`;
}

// Spielerbild; wenn es nicht lädt, erscheinen die Initialen
function createAvatar(player) {
  const img = document.createElement("img");
  img.className = "avatar";
  img.src = playerImage(player);
  img.alt = "";
  img.loading = "lazy";
  img.onerror = () => {
    const fallback = document.createElement("span");
    fallback.className = "avatar";
    fallback.textContent = initials(player.playerName);
    img.replaceWith(fallback);
  };
  return img;
}

// Zahl von 0 auf den Zielwert hochzählen
function countUp(el, target, decimals = 1, duration = 1400) {
  if (reduceMotion) {
    el.textContent = fmt(target, decimals);
    return;
  }
  const start = performance.now();
  const tick = now => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(2, -10 * t);          // easeOutExpo
    el.textContent = fmt(target * (t === 1 ? 1 : eased), decimals);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* =====================================================================
   SEITENWECHSEL
   Eine Farbfläche fährt von unten über den Bildschirm, darunter wird die
   Seite getauscht, dann fährt die Fläche nach oben weg.
   ===================================================================== */
let busy = false;
const enterHooks = {};       // Funktionen, die nach dem Einblenden laufen

async function go(name, prepare) {
  if (busy) return;
  busy = true;

  const wipe = $("wipe");
  const next = $(`view-${name}`);
  const coloured = name === "roster" || name === "player";
  wipe.style.background = coloured ? "var(--team)" : "var(--ink)";

  if (!reduceMotion) {
    await wipe.animate(
      [{ transform: "translateY(100%)" }, { transform: "translateY(0)" }],
      { duration: 550, easing: EASE_IN_OUT, fill: "forwards" }
    ).finished;
  }

  prepare?.();

  document.querySelectorAll(".view").forEach(v => v.classList.remove("is-active", "is-in", "is-settled"));
  next.classList.add("is-active");
  state.view = name;
  window.scrollTo(0, 0);
  updateNav();
  renderCrumbs();
  hideFloatImage();

  // Text-Reveals starten, während die Fläche nach oben wegfährt
  requestAnimationFrame(() => requestAnimationFrame(() => next.classList.add("is-in")));

  if (!reduceMotion) {
    await wipe.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }],
      { duration: 650, easing: EASE_IN_OUT, fill: "forwards" }
    ).finished;
  }

  enterHooks[name]?.();
  busy = false;
  setTimeout(() => next.classList.add("is-settled"), 900);
}

// Navigation weiß über farbigen Bändern, mit Hintergrund nach dem Scrollen
function updateNav() {
  const band = document.querySelector(".view.is-active .band");
  const limit = band ? band.offsetHeight - 72 : 0;
  document.body.classList.toggle("nav-light", !!band && window.scrollY < limit);
  document.body.classList.toggle("scrolled", window.scrollY > 40);
}

window.addEventListener("scroll", updateNav, { passive: true });

// Pfad oben: Saisons / 2024/25 / Houston Rockets / Jalen Green
function renderCrumbs() {
  const levels = ["seasons", "teams", "roster", "player"];
  const level = levels.indexOf(state.view);
  const nav = $("crumbs");

  if (level < 0) {
    nav.innerHTML = "";
    return;
  }

  const items = [
    { label: "Saisons", view: "seasons" },
    { label: state.season && seasonLabel(state.season), view: "teams" },
    { label: state.team?.name, view: "roster" },
    { label: state.player?.playerName, view: "player" }
  ].slice(0, level + 1);

  nav.innerHTML = items.map((item, i) => {
    const sep = i ? `<span class="sep">/</span>` : "";
    return i === items.length - 1
      ? `${sep}<span class="current">${escapeHtml(item.label)}</span>`
      : `${sep}<button data-go="${item.view}">${escapeHtml(item.label)}</button>`;
  }).join("");
}

// Alle Elemente mit data-go="..." wechseln zur jeweiligen Seite
document.addEventListener("click", event => {
  const target = event.target.closest("[data-go]");
  if (target) go(target.dataset.go);
});

// Button: der Hover-Kreis startet dort, wo die Maus den Button betritt
document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("pointerenter", e => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - r.left}px`);
    btn.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

/* =====================================================================
   STARTSEITE
   ===================================================================== */
// Überschrift in einzelne Buchstaben zerlegen, damit sie nacheinander aufsteigen
document.querySelectorAll("[data-split]").forEach((el, line) => {
  el.innerHTML = [...el.textContent]
    .map((ch, i) => `<span class="char" style="--i:${i + line * 3}">${ch}</span>`)
    .join("");
});

// Laufband mit den Meistern (zweimal hintereinander für eine nahtlose Schleife)
const tickerItems = seasons
  .map(s => `<span class="ticker-item">${seasonLabel(s.year)} <em>Meister</em> ${s.champion}</span>`)
  .join("");
$("ticker").innerHTML = tickerItems.repeat(4);

// Ball fliegt in einem Bogen in den Korb
function shootBall() {
  const ball = $("ball");
  const net = document.querySelector(".net");
  if (reduceMotion) return;

  // Punkte auf einer Parabel (quadratische Bézierkurve) berechnen
  const p0 = { x: 500, y: 470 };
  const p1 = { x: 400, y: -230 };
  const p2 = { x: 300, y: 64 };
  const frames = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
    const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;
    const scale = 1.5 - t * 0.6;                     // Ball wird kleiner = weiter weg
    frames.push({ transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${-t * 540}deg)`, opacity: 1 });
  }

  const shot = ball.animate(frames, { duration: 1100, easing: "linear", fill: "forwards" });

  shot.finished.then(() => {
    net.classList.remove("swish");
    void net.getBoundingClientRect();               // Animation neu starten
    net.classList.add("swish");

    // durchs Netz fallen und auf dem Boden auftippen
    ball.animate([
      { transform: "translate(300px, 64px) scale(0.9) rotate(-540deg)", opacity: 1 },
      { transform: "translate(300px, 130px) scale(0.92) rotate(-560deg)", opacity: 1, offset: 0.2 },
      { transform: "translate(302px, 300px) scale(1) rotate(-600deg)", opacity: 1, offset: 0.5, easing: "ease-out" },
      { transform: "translate(312px, 240px) scale(1) rotate(-620deg)", opacity: 1, offset: 0.68, easing: "ease-in" },
      { transform: "translate(322px, 300px) scale(1) rotate(-640deg)", opacity: 1, offset: 0.84, easing: "ease-out" },
      { transform: "translate(330px, 280px) scale(1) rotate(-650deg)", opacity: 1, offset: 0.92, easing: "ease-in" },
      { transform: "translate(338px, 300px) scale(1) rotate(-660deg)", opacity: 1 }
    ], { duration: 1500, easing: "ease-in", fill: "forwards" });
  });
}

enterHooks.home = () => setTimeout(shootBall, 300);

/* =====================================================================
   SAISONS
   ===================================================================== */
$("season-list").innerHTML = seasons.map((s, i) => `
  <li class="season-row" style="--i:${i}">
    <button data-season="${s.year}" data-img="${s.img}">
      <span class="season-year">${seasonLabel(s.year)}</span>
      <span class="season-champ">Meister<strong>${s.champion}</strong></span>
    </button>
  </li>`).join("");

$("season-list").addEventListener("click", e => {
  const btn = e.target.closest("[data-season]");
  if (!btn) return;
  const year = Number(btn.dataset.season);
  go("teams", () => {
    state.season = year;
    renderTeams();
  });
});

// ---------- Bild folgt der Maus (mit weicher Verzögerung) ----------
const floatImg = $("float-img");
const pointer = { x: 0, y: 0 };
const imgPos = { x: 0, y: 0 };
let floatRunning = false;

function followPointer() {
  const dx = pointer.x - imgPos.x;
  imgPos.x += dx * 0.12;
  imgPos.y += (pointer.y - imgPos.y) * 0.12;
  const tilt = Math.max(-8, Math.min(8, dx * 0.05));   // leichte Neigung bei schneller Bewegung
  floatImg.style.transform =
    `translate(${imgPos.x - 170}px, ${imgPos.y - 128}px) rotate(${tilt}deg)`;
  if (floatRunning) requestAnimationFrame(followPointer);
}

function hideFloatImage() {
  floatImg.classList.remove("is-visible");
  floatRunning = false;
}

$("season-list").addEventListener("pointermove", e => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  const btn = e.target.closest("[data-img]");
  if (!btn || e.pointerType !== "mouse") return;

  const img = floatImg.querySelector("img");
  if (!img.src.endsWith(btn.dataset.img.slice(1))) img.src = btn.dataset.img;

  if (!floatRunning) {
    imgPos.x = pointer.x;
    imgPos.y = pointer.y;
    floatRunning = true;
    requestAnimationFrame(followPointer);
  }
  floatImg.classList.add("is-visible");
});

$("season-list").addEventListener("pointerleave", hideFloatImage);

/* =====================================================================
   TEAMS
   ===================================================================== */
function renderTeams() {
  $("team-list").innerHTML = teams
    .filter(t => t.conf === state.conf)
    .map((t, i) => `
      <li class="team-row" style="--i:${i}">
        <button data-team="${t.abbr}" style="--c:${t.color}">
          <span class="team-abbr">${t.abbr}</span>
          <span class="team-name">${t.name}</span>
          <img class="team-logo" src="${t.img}" alt="" />
        </button>
      </li>`).join("");
  moveTabIndicator();
}

function moveTabIndicator() {
  const active = document.querySelector(`#conf-tabs [data-conf="${state.conf}"]`);
  const indicator = $("tabs-indicator");
  indicator.style.width = `${active.offsetWidth}px`;
  indicator.style.transform = `translateX(${active.offsetLeft}px)`;
}

$("conf-tabs").addEventListener("click", e => {
  const tab = e.target.closest("[data-conf]");
  if (!tab || tab.dataset.conf === state.conf) return;
  state.conf = tab.dataset.conf;
  document.querySelectorAll("#conf-tabs [data-conf]").forEach(b =>
    b.setAttribute("aria-selected", String(b === tab)));
  renderTeams();
});

window.addEventListener("resize", () => {
  if (state.view === "teams") moveTabIndicator();
});

enterHooks.teams = moveTabIndicator;

$("team-list").addEventListener("click", e => {
  const btn = e.target.closest("[data-team]");
  if (btn) selectTeam(teams.find(t => t.abbr === btn.dataset.team));
});

/* =====================================================================
   KADER
   ===================================================================== */
async function fetchPlayers(season, teamAbbr) {
  const key = `${season}-${teamAbbr}`;
  if (cache.has(key)) return cache.get(key);

  const url = `${API_BASE}/playertotals?season=${season}&team=${teamAbbr}` +
              `&page=1&pageSize=50&sortBy=points&ascending=false&isPlayoff=false`;
  const res = await fetch(url);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`API antwortet mit Status ${res.status}`);

  const json = await res.json();
  // Durchschnittswerte einmal berechnen (für Tabelle, Sortierung und Ränge)
  const players = (json.data ?? []).map(p => ({
    ...p,
    ppg: perGame(p.points, p.games),
    rpg: perGame(p.totalRb, p.games),
    apg: perGame(p.assists, p.games),
    spg: perGame(p.steals, p.games),
    bpg: perGame(p.blocks, p.games),
    mpg: perGame(p.minutesPg, p.games)   // "minutesPg" enthält die Gesamtminuten
  }));
  cache.set(key, players);
  return players;
}

let rowEls = new Map();      // playerId -> Tabellenzeile

async function selectTeam(team) {
  const season = state.season;
  const request = fetchPlayers(season, team.abbr);   // Laden startet sofort
  request.catch(() => {});                            // Fehler wird unten behandelt

  await go("roster", () => {
    state.team = team;
    state.players = [];
    state.sort = { key: "ppg", asc: false };
    rowEls = new Map();
    document.documentElement.style.setProperty("--team", team.color);
    $("roster-logo").src = team.img;
    $("roster-title").textContent = team.name;
    $("roster-sub").textContent = `Kader der Saison ${seasonLabel(season)}`;
    $("roster-body").innerHTML = "";
    $("player-search").value = "";
    setStatus("Kader wird geladen", "is-loading");
    updateSortHeader();
  });

  try {
    const players = await request;
    if (state.team !== team || state.season !== season) return;
    state.players = players;
    $("roster-sub").textContent =
      `Kader der Saison ${seasonLabel(season)}, ${players.length} Spieler`;
    setStatus(players.length ? "" : `Für die ${team.name} gibt es in dieser Saison keine Daten. Wähle eine andere Saison.`);
    renderRoster(false);
  } catch (error) {
    console.error(error);
    setStatus("Die Daten konnten nicht geladen werden. Prüfe die Internetverbindung und wähle das Team erneut.", "is-error");
  }
}

function setStatus(text, type = "") {
  const el = $("roster-status");
  el.textContent = text;
  el.className = `status ${type}`;
}

function createRow(p, index, maxPpg) {
  const row = document.createElement("button");
  row.className = "roster-row is-new";
  row.setAttribute("role", "row");
  row.style.setProperty("--i", index);
  row.dataset.id = p.playerId;

  const name = document.createElement("span");
  name.className = "cell-name";
  name.setAttribute("role", "cell");
  name.appendChild(createAvatar(p));
  name.insertAdjacentHTML("beforeend", `<span>${escapeHtml(p.playerName)}</span>`);
  row.appendChild(name);

  row.insertAdjacentHTML("beforeend", `
    <span role="cell" class="cell-pos">${escapeHtml(p.position ?? "–")}</span>
    <span role="cell" class="cell-num cell-games">${p.games}</span>
    <span role="cell" class="cell-num cell-main">
      ${fmt(p.ppg)}
      <span class="meter"><span style="--v:${maxPpg ? p.ppg / maxPpg : 0}"></span></span>
    </span>
    <span role="cell" class="cell-num">${fmt(p.rpg)}</span>
    <span role="cell" class="cell-num">${fmt(p.apg)}</span>
    <span role="cell" class="cell-num cell-hide">${pct(p.fieldPercent).replace(" ", "")}</span>`);

  row.addEventListener("animationend", e => {
    if (e.target === row) row.classList.remove("is-new");
  });
  row.addEventListener("click", () => showPlayer(p));
  return row;
}

// Tabelle zeichnen. Mit flip=true gleiten vorhandene Zeilen an ihren neuen Platz
function renderRoster(flip = true) {
  const body = $("roster-body");
  const query = normalizeName($("player-search").value);
  const { key, asc } = state.sort;
  const maxPpg = Math.max(0, ...state.players.map(p => p.ppg));

  state.visible = state.players
    .filter(p => normalizeName(p.playerName).includes(query))
    .sort((a, b) => {
      const result = typeof a[key] === "string"
        ? String(a[key]).localeCompare(String(b[key]))
        : (a[key] ?? 0) - (b[key] ?? 0);
      return asc ? result : -result;
    });

  // 1. alte Positionen merken
  const before = new Map();
  if (flip && !reduceMotion) {
    rowEls.forEach((el, id) => {
      if (el.isConnected) before.set(id, el.getBoundingClientRect().top);
    });
  }

  // 2. Zeilen in neuer Reihenfolge einsetzen
  body.innerHTML = "";
  state.visible.forEach((p, i) => {
    let row = rowEls.get(p.playerId);
    if (!row) {
      row = createRow(p, i, maxPpg);
      rowEls.set(p.playerId, row);
    }
    body.appendChild(row);
  });

  if (state.players.length && !state.visible.length) {
    setStatus(`Kein Spieler passt zu „${$("player-search").value}“.`);
  } else if (state.players.length) {
    setStatus("");
  }

  // 3. Unterschied berechnen und zurückgleiten lassen (FLIP-Technik)
  if (flip && !reduceMotion) {
    state.visible.forEach(p => {
      const row = rowEls.get(p.playerId);
      const oldTop = before.get(p.playerId);
      if (oldTop === undefined) {
        row.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
        return;
      }
      const dy = oldTop - row.getBoundingClientRect().top;
      if (dy) {
        row.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: "none" }],
          { duration: 700, easing: EASE_OUT }
        );
      }
    });
  }
}

function updateSortHeader() {
  document.querySelectorAll("#roster-head [data-sort]").forEach(btn => {
    const active = btn.dataset.sort === state.sort.key;
    btn.classList.toggle("is-sorted", active);
    btn.classList.toggle("is-asc", active && state.sort.asc);
    btn.setAttribute("aria-sort", active ? (state.sort.asc ? "ascending" : "descending") : "none");
  });
}

$("roster-head").addEventListener("click", e => {
  const btn = e.target.closest("[data-sort]");
  if (!btn) return;
  const key = btn.dataset.sort;
  const textKey = key === "playerName" || key === "position";
  state.sort = state.sort.key === key
    ? { key, asc: !state.sort.asc }
    : { key, asc: textKey };
  updateSortHeader();
  renderRoster(true);
});

$("player-search").addEventListener("input", () => renderRoster(true));

/* =====================================================================
   SPIELER
   ===================================================================== */
function showPlayer(p) {
  go("player", () => fillPlayer(p));
}

// Platz im Team für einen Wert berechnen (1 = bester)
function rankOf(p, key) {
  return 1 + state.players.filter(other => other[key] > p[key]).length;
}

function fillPlayer(p) {
  state.player = p;

  // Foto
  const photo = $("player-photo");
  photo.innerHTML = "";
  photo.appendChild(createAvatar(p));

  // Name in Vor- und Nachname teilen
  const [first, ...rest] = p.playerName.split(" ");
  $("player-first").textContent = rest.length ? first : "";
  $("player-last").textContent = rest.length ? rest.join(" ") : first;
  $("player-last").parentElement.style.setProperty("--d", "0.08s");

  $("player-facts").innerHTML = [
    ["Position", positionNames[p.position] ?? p.position ?? "–"],
    ["Alter", p.age ? `${p.age} Jahre` : "–"],
    ["Spiele", `${p.games}, davon ${p.gamesStarted} als Starter`],
    ["Saison", seasonLabel(state.season)]
  ].map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${escapeHtml(dd)}</dd></div>`).join("");

  // Große Zahlen (zählen beim Einblenden hoch)
  $("big-numbers").innerHTML = [
    ["ppg", "Punkte pro Spiel"],
    ["rpg", "Rebounds pro Spiel"],
    ["apg", "Assists pro Spiel"],
    ["mpg", "Minuten pro Spiel"]
  ].map(([key, label]) => `
    <div class="big-number">
      <strong data-count="${p[key]}">0,0</strong>
      <span>${label}</span>
    </div>`).join("");

  // Wurfquoten als Ringe
  $("rings").innerHTML = [
    ["Feldwürfe", p.fieldGoals, p.fieldAttempts, p.fieldPercent],
    ["Dreier", p.threeFg, p.threeAttempts, p.threePercent],
    ["Freiwürfe", p.ft, p.ftAttempts, p.ftPercent]
  ].map(([label, made, att, value]) => `
    <div class="ring">
      <div class="ring-figure">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle class="track" cx="60" cy="60" r="52" />
          <circle class="value" cx="60" cy="60" r="52" pathLength="100" data-value="${(value ?? 0) * 100}" />
        </svg>
        <strong>${pct(value).replace(" ", "")}</strong>
      </div>
      <p>${label}<small>${made} von ${att} getroffen</small></p>
    </div>`).join("");

  // Rang im Team
  const teamShort = state.team.name.split(" ").pop();
  $("ranks").innerHTML = [
    ["ppg", "Punkte pro Spiel"],
    ["rpg", "Rebounds pro Spiel"],
    ["apg", "Assists pro Spiel"],
    ["spg", "Steals pro Spiel"],
    ["bpg", "Blocks pro Spiel"]
  ].map(([key, label]) => {
    const rank = rankOf(p, key);
    return `
      <li class="${rank === 1 ? "rank-top" : ""}">
        <span>${label}<br><small>${fmt(p[key])} im Schnitt</small></span>
        <span><strong>Platz ${rank}</strong> <small>von ${state.players.length} ${teamShort}</small></span>
      </li>`;
  }).join("");

  // Saison gesamt
  $("totals").innerHTML = [
    ["Punkte", p.points],
    ["Minuten", p.minutesPg],
    ["Rebounds", p.totalRb],
    ["Offensiv-Rebounds", p.offensiveRb],
    ["Defensiv-Rebounds", p.defensiveRb],
    ["Assists", p.assists],
    ["Steals", p.steals],
    ["Blocks", p.blocks],
    ["Ballverluste", p.turnovers],
    ["Fouls", p.personalFouls]
  ].map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${(dd ?? 0).toLocaleString("de-AT")}</dd></div>`).join("");

  // Vorheriger / nächster Spieler in der aktuellen Sortierung
  const list = state.visible.length ? state.visible : state.players;
  const index = list.indexOf(p);
  setPager($("prev-player"), list[index - 1], "Vorheriger Spieler");
  setPager($("next-player"), list[index + 1], "Nächster Spieler");
}

function setPager(btn, player, label) {
  btn.innerHTML = player ? `<small>${label}</small><strong>${escapeHtml(player.playerName)}</strong>` : "";
  btn.onclick = player ? () => showPlayer(player) : null;
}

enterHooks.player = () => {
  document.querySelectorAll("#big-numbers [data-count]").forEach((el, i) =>
    setTimeout(() => countUp(el, Number(el.dataset.count)), i * 90));
  document.querySelectorAll("#rings .value").forEach((circle, i) =>
    setTimeout(() => {
      circle.style.strokeDashoffset = 100 - Number(circle.dataset.value);
    }, 150 + i * 120));
};

/* =====================================================================
   START
   ===================================================================== */
renderTeams();
requestAnimationFrame(() => $("view-home").classList.add("is-in"));
setTimeout(shootBall, 1300);
