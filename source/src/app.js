/* Sirdosh: interfeys. Hech qanday tarmoq so'rovi yo'q. */
const tg = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData !== undefined) ? window.Telegram.WebApp : null;
const U = TEXT.UI;
const STORE_KEY = "sirdosh.v1";

const S = { screen: "welcome", sex: null, couple: false, turn: 0, a: {}, stepId: null, hist: [], result: null, err: "", status: "" };
const $app = document.getElementById("app");

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function today() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

/* --- saqlash: faqat foydalanuvchi bossa --- */
function readHist() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch (e) { return []; } }
function writeHist(l) { try { localStorage.setItem(STORE_KEY, JSON.stringify(l)); return true; } catch (e) { return false; } }
function wipeHist() { try { localStorage.removeItem(STORE_KEY); return true; } catch (e) { return false; } }

/* --- gulbarg --- */
function petalPath(l, w) {
  return "M0,0 C" + w + "," + (-l * .32) + " " + w + "," + (-l * .78) + " 0," + (-l) +
    " C" + (-w) + "," + (-l * .78) + " " + (-w) + "," + (-l * .32) + " 0,0Z";
}
function emblem() {
  let p = "";
  for (let i = 0; i < 6; i++) p += '<path d="' + petalPath(46, 15) + '" transform="translate(50 50) rotate(' + i * 60 + ')" fill="var(--cobalt)"/>';
  return '<svg viewBox="0 0 100 100" aria-hidden="true">' + p + '<circle cx="50" cy="50" r="9" fill="var(--anor)"/></svg>';
}
function rosette(r) {
  const cx = 190, cy = 170, max = 122, min = 42, n = r.domains.length;
  let ghosts = "", petals = "", labels = "";
  r.domains.forEach((d, i) => {
    const ang = i * 360 / n, rad = (ang - 90) * Math.PI / 180;
    const rated = d.score != null;
    ghosts += '<path class="ghost-petal' + (rated ? "" : " unrated") + '" d="' + petalPath(max, 37) + '" transform="translate(' + cx + " " + cy + ") rotate(" + ang + ')"/>';
    if (rated) {
      const l = min + (max - min) * d.score / 100;
      petals += '<g class="petal ' + band(d.score) + '" style="animation-delay:' + i * 50 + 'ms"><path d="' + petalPath(l, 37 * Math.max(.55, l / max)) + '" transform="translate(' + cx + " " + cy + ") rotate(" + ang + ')"/></g>';
    }
    const lx = cx + Math.cos(rad) * (max + 14), ly = cy + Math.sin(rad) * (max + 14) + 4;
    const anchor = Math.abs(Math.cos(rad)) < .1 ? "middle" : Math.cos(rad) > 0 ? "start" : "end";
    labels += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + anchor + '">' + esc(d.label) + "</text>";
  });
  const num = r.index == null ? "–" : r.index;
  const desc = r.domains.map(d => d.label + " " + (d.score == null ? U.notRated : d.score)).join(", ");
  return '<svg class="rosette" viewBox="0 0 380 340" role="img" aria-label="' + esc(desc) + '">' + ghosts + petals +
    '<circle class="ctr" cx="' + cx + '" cy="' + cy + '" r="42"/>' +
    '<text class="ctr-num" x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle">' + num + "</text>" +
    '<text class="ctr-sub" x="' + cx + '" y="' + (cy + 27) + '" text-anchor="middle">' + esc(U.indexLabel) + "</text>" + labels + "</svg>";
}

/* --- manba yorliqlari --- */
const REF_LABEL = { eau2025: "EAU 2025", fda: "FDA", phq2: "PHQ-2", gad2: "GAD-2", hotline: "Ishonch telefonlari", liS2021: "Li S", wangXM2018: "Wang XM", wang2025: "Wang S", oliveira2024: "de Oliveira", dogan2026: "Doğan" };
function refUrl(k) { const r = TEXT.REFS[k]; return r[1] ? "https://doi.org/" + r[1] : r[2]; }
function refLabel(k) {
  const y = (TEXT.REFS[k][0].match(/\b(?:19|20)\d\d\b/) || [""])[0];
  if (["eau2025", "fda", "phq2", "gad2", "hotline"].includes(k)) return REF_LABEL[k];
  const name = REF_LABEL[k] || k.replace(/\d+$/, "").replace(/^./, c => c.toUpperCase());
  return name + " " + y;
}
function refLinks(refs) {
  if (!refs || !refs.length) return "";
  return '<div class="refs">' + refs.map(k => '<a href="' + esc(refUrl(k)) + '" target="_blank" rel="noopener">' + esc(refLabel(k)) + "</a>").join("") + "</div>";
}

/* --- kartalar --- */
function adviceCard(c) {
  const a = TEXT.ADVICE[c.id];
  return '<article class="card"><h3>' + esc(a.title) + "</h3>" +
    (c.why ? '<p class="why">' + esc(c.why) + "</p>" : "") +
    "<ul>" + a.steps.map(x => "<li>" + esc(x) + "</li>").join("") + "</ul>" +
    '<div class="evid"><span class="grade ' + a.grade + '">' + esc(TEXT.GRADES[a.grade]) + "</span><span>" + esc(a.effect) + "</span>" + refLinks(a.refs) + "</div></article>";
}
function privateCard(c) {
  const a = TEXT.ADVICE[c.id];
  return '<section class="private"><h2>' + esc(a.title) + "</h2><ul>" + a.steps.map(x => "<li>" + esc(x) + "</li>").join("") +
    '</ul><p class="small">' + esc(a.effect) + "</p></section>";
}

/* --- ekranlar --- */
const screens = {
  welcome() {
    return '<div class="brand">' + emblem() + esc(U.name) + "</div>" +
      '<h1 tabindex="-1">' + esc(U.welcomeTitle) + "</h1>" +
      "<p>" + esc(U.welcomeLead) + "</p>" +
      '<ul class="points"><li>' + esc(U.point1) + "</li><li>" + esc(U.point2) + "</li><li>" + esc(U.point3) + "</li></ul>" +
      '<p class="small muted">' + esc(U.adult) + "</p>" +
      '<div class="stack"><button class="btn" data-go="who">' + esc(U.start) + '</button><button class="btn ghost" data-go="sources">' + esc(U.sources) + "</button></div>";
  },
  who() {
    const second = S.couple && S.turn === 1;
    const title = S.couple ? (second ? U.handoffTitle : U.coupleWho) : U.who;
    return '<div class="brand">' + emblem() + esc(U.name) + "</div>" +
      '<h2 tabindex="-1">' + esc(title) + "</h2>" +
      '<p class="muted small">' + esc(second ? U.handoffText : U.whoHint) + "</p>" +
      '<div class="options"><button class="opt" data-sex="m">' + esc(U.man) + '</button><button class="opt" data-sex="f">' + esc(U.woman) + "</button>" +
      (S.couple ? "" : '<button class="opt" data-couple="1">' + esc(U.couple) + "</button>") + "</div>";
  },
  q() {
    const steps = buildSteps(S.sex, S.a), i = steps.findIndex(s => s.id === S.stepId), q = steps[i];
    const pct = Math.round(i / steps.length * 100);
    let body = "";
    if (q.type === "scale") {
      const labels = TEXT.SCALES[q.scale];
      body = '<div class="options">' + labels.map((l, v) => optBtn(l, v, S.a[q.id] === v, pips(v, labels.length))).join("") + "</div>";
    } else if (q.type === "single") {
      body = '<div class="options">' + q.options.map(o => optBtn(o[1], o[0], S.a[q.id] === o[0])).join("") + "</div>";
    } else if (q.type === "multi") {
      const cur = S.a[q.id] || [];
      body = '<div class="options">' + q.options.map(o => '<button class="opt" data-toggle="' + o[0] + '" aria-pressed="' + cur.includes(o[0]) + '">' + esc(o[1]) + "</button>").join("") + "</div>" +
        '<button class="btn" data-next="1"' + (cur.length ? "" : " disabled") + ">" + esc(U.next) + "</button>";
    } else if (q.type === "number") {
      body = '<label class="field" for="f-num">' + esc(q.unit) + '<input id="f-num" type="number" inputmode="numeric" min="' + q.min + '" max="' + q.max + '" value="' + esc(S.a[q.id] || "") + '"></label>' +
        '<p class="err" role="alert">' + esc(S.err) + '</p><button class="btn" data-next="1">' + esc(U.next) + "</button>";
    } else if (q.type === "body") {
      body = '<label class="field" for="f-h">' + esc(U.height) + '<input id="f-h" type="number" inputmode="numeric" value="' + esc(S.a.height || "") + '"></label>' +
        '<label class="field" for="f-w">' + esc(U.weight) + '<input id="f-w" type="number" inputmode="decimal" value="' + esc(S.a.weight || "") + '"></label>' +
        '<p class="err" role="alert">' + esc(S.err) + '</p><button class="btn" data-next="1">' + esc(U.next) + "</button>";
    }
    return '<div class="topbar"><button class="link" data-back="1">' + esc(U.back) + '</button><span class="small muted">' + esc(q.section) + "</span></div>" +
      '<div class="track" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div>' +
      '<div class="stack">' + (q.lead ? '<p class="q-lead">' + esc(q.lead) + "</p>" : "") + '<h2 tabindex="-1">' + esc(q.text) + "</h2>" + (q.hint ? '<p class="muted small">' + esc(q.hint) + "</p>" : "") + "</div>" + body;
  },
  underage() {
    return '<h2 tabindex="-1">' + esc(U.underage) + '</h2><button class="btn ghost" data-home="1">' + esc(U.backHome) + "</button>";
  },
  result() {
    const r = S.result;
    const last = S.couple ? null : readHist().filter(x => x.sex === r.sex).slice(-1)[0];
    const delta = last && r.index != null && last.index != null ? fmt(U.delta, { d: (r.index - last.index > 0 ? "+" : "") + (r.index - last.index), date: last.date }) : "";
    const bandName = { good: U.bandGood, mid: U.bandMid, low: U.bandLow };
    let h = "";
    if (r.privateCards.length) h += r.privateCards.map(privateCard).join("");
    if (r.urgent.length) h += '<section class="stack"><h2>' + esc(U.urgent) + "</h2>" +
      r.urgent.map(k => '<div class="alert"><h3>' + esc(TEXT.URGENT[k].title) + "</h3><p>" + esc(TEXT.URGENT[k].text) + "</p></div>").join("") + "</section>";
    h += '<section class="rosette-wrap"><h2 tabindex="-1">' + esc(U.profile) + "</h2>" + rosette(r) +
      (r.band ? '<p class="verdict ' + r.band + '">' + esc(bandName[r.band]) + "</p>" : "") +
      '<p class="small muted" style="text-align:center">' + esc(r.index == null ? U.noIndex : U.indexNote) + "</p>" +
      (delta ? '<p class="small">' + esc(delta) + "</p>" : "") + "</section>";
    h += '<section class="domains">' + r.domains.map(d => {
      const b = band(d.score);
      return '<div class="domain"><span>' + esc(d.label) + '</span><span class="val">' + (d.score == null ? '<span class="muted small">' + esc(U.notRated) + "</span>" : d.score) + "</span>" +
        '<div class="bar">' + (b ? '<i class="' + b + '" style="width:' + d.score + '%"></i>' : "") + "</div></div>";
    }).join("") + "</section>";
    if (r.note) h += '<p class="note">' + esc(r.note === "distressLow" ? U.distressLowNote : U.distressHighNote) + "</p>";
    h += '<div class="facts"><span>' + esc(fmt(U.moodLine, { phq: r.phq, gad: r.gad })) + "</span>" + (r.bmi ? "<span>" + esc(fmt(U.bmiLine, { bmi: String(r.bmi).replace(".", ",") })) + "</span>" : "") + "</div>";
    if (r.whyNot === "nopartner") h += '<p class="note">' + esc(TEXT.WHY.nopartner) + "</p>";
    if (r.doctor.length) h += '<section class="stack"><div class="section-head"><h2>' + esc(U.doctor) + '</h2><p class="small muted">' + esc(U.doctorHint) + "</p></div>" + r.doctor.map(adviceCard).join("") + "</section>";
    if (r.plan.length) h += '<section class="stack"><div class="section-head"><h2>' + esc(U.plan) + '</h2><p class="small muted">' + esc(U.planHint) + "</p></div>" + r.plan.map(adviceCard).join("") + "</section>";
    if (r.more.length) h += '<details class="more-box"><summary>' + esc(U.more) + '</summary><div class="stack">' + r.more.map(adviceCard).join("") + "</div></details>";
    h += '<section class="stack"><div class="section-head"><h2>' + esc(U.summary) + '</h2><p class="small muted">' + esc(U.summaryHint) + '</p></div><div class="summary-box" id="summary">' + esc(doctorSummary(r, today())) + "</div>" +
      '<button class="btn ghost" data-copy="1">' + esc(U.copy) + "</button>" + (S.couple ? "" : '<button class="btn ghost" data-save="1">' + esc(U.save) + "</button>") + '<p class="status" role="status">' + esc(S.status) + "</p></section>";
    if (S.couple && S.turn === 0) h += '<button class="btn" data-handoff="1">' + esc(U.handoff) + "</button>";
    else if (S.couple) h += '<button class="btn" data-shared="1">' + esc(U.next2) + "</button>";
    else h += '<div class="stack"><button class="btn ghost" data-home="1">' + esc(U.again) + '</button><button class="btn ghost" data-go="sources">' + esc(U.sources) + "</button></div>";
    h += '<p class="foot">' + esc(U.emergency) + "</p>";
    return h;
  },
  shared() {
    return '<h2 tabindex="-1">' + esc(U.sharedTitle) + '</h2><p class="muted">' + esc(U.sharedLead) + "</p>" +
      '<div class="stack">' + TEXT.SHARED_PLAN.map(p => '<article class="card"><h3>' + esc(p.title) + "</h3><p>" + esc(p.text) + "</p></article>").join("") + "</div>" +
      '<button class="btn ghost" data-home="1">' + esc(U.again) + "</button>";
  },
  sources() {
    return '<div class="topbar"><button class="link" data-back="1">' + esc(S.result && !S.couple ? U.backResult : U.backHome) + "</button></div>" +
      '<h2 tabindex="-1">' + esc(U.methodTitle) + '</h2><div class="stack">' + U.method.map(p => "<p>" + esc(p) + "</p>").join("") + "</div>" +
      "<h2>" + esc(U.dataTitle) + "</h2><p>" + esc(U.data) + '</p><button class="btn ghost" data-wipe="1">' + esc(U.wipe) + '</button><p class="status" role="status">' + esc(S.status) + "</p>" +
      "<h2>" + esc(U.refsTitle) + '</h2><ol class="reflist">' + Object.keys(TEXT.REFS).map(k => '<li>' + esc(TEXT.REFS[k][0]) + ' <a href="' + esc(refUrl(k)) + '" target="_blank" rel="noopener">' + esc(TEXT.REFS[k][1] ? "DOI" : "Havola") + "</a></li>").join("") + "</ol>";
  }
};

function optBtn(label, value, on, extra) {
  return '<button class="opt" data-val="' + esc(value) + '" aria-pressed="' + !!on + '"><span>' + esc(label) + "</span>" + (extra || "") + "</button>";
}
function pips(v, n) {
  let s = '<span class="pips" aria-hidden="true">';
  for (let i = 1; i < n; i++) s += "<b" + (i <= v ? ' class="on"' : "") + "></b>";
  return s + "</span>";
}

function render() {
  $app.innerHTML = screens[S.screen]();
  window.scrollTo(0, 0);
  const h = $app.querySelector("[tabindex='-1']");
  if (h) h.focus({ preventScroll: true });
  if (tg && tg.BackButton) {
    const showBack = S.screen === "q" || S.screen === "sources" || S.screen === "who";
    try { showBack ? tg.BackButton.show() : tg.BackButton.hide(); } catch (e) { /* eski versiya */ }
  }
}

/* --- oqim --- */
function startFlow(sex) {
  S.sex = sex; S.a = {}; S.hist = []; S.err = ""; S.status = ""; S.result = null;
  S.stepId = "age"; S.screen = "q"; render();
}
function next() {
  const steps = buildSteps(S.sex, S.a), i = steps.findIndex(s => s.id === S.stepId);
  S.err = "";
  if (i + 1 >= steps.length) {
    S.result = evaluate(S.sex, S.a); S.screen = "result"; S.hist = []; render(); return;
  }
  S.hist.push(S.stepId); S.stepId = steps[i + 1].id; render();
}
function goBack() {
  if (S.screen === "q") {
    if (S.hist.length) { S.stepId = S.hist.pop(); S.err = ""; render(); return; }
    S.screen = "who"; render(); return;
  }
  if (S.screen === "who") { if (S.couple && S.turn === 1) return; S.couple = false; S.screen = "welcome"; render(); return; }
  if (S.screen === "sources") { S.status = ""; S.screen = S.result && !S.couple ? "result" : "welcome"; render(); }
}
function home() { Object.assign(S, { screen: "welcome", sex: null, couple: false, turn: 0, a: {}, stepId: null, hist: [], result: null, err: "", status: "" }); render(); }

function setStatus(t) { S.status = t; const el = $app.querySelector(".status"); if (el) el.textContent = t; }

$app.addEventListener("click", ev => {
  const b = ev.target.closest("button, a");
  if (!b) return;
  if (b.tagName === "A") {
    if (tg && tg.openLink) { ev.preventDefault(); tg.openLink(b.href); }
    return;
  }
  const d = b.dataset;
  if (d.go) { S.status = ""; S.screen = d.go; render(); }
  else if (d.home) home();
  else if (d.back) goBack();
  else if (d.sex) startFlow(d.sex);
  else if (d.couple) { S.couple = true; S.turn = 0; render(); }
  else if (d.val !== undefined) {
    const q = buildSteps(S.sex, S.a).find(s => s.id === S.stepId);
    S.a[q.id] = q.type === "scale" ? Number(d.val) : d.val;
    next();
  } else if (d.toggle) {
    const q = S.stepId; let cur = S.a[q] || [];
    if (d.toggle === "none") cur = cur.includes("none") ? [] : ["none"];
    else { cur = cur.filter(x => x !== "none"); cur = cur.includes(d.toggle) ? cur.filter(x => x !== d.toggle) : cur.concat(d.toggle); }
    S.a[q] = cur; render();
  } else if (d.next) {
    const q = buildSteps(S.sex, S.a).find(s => s.id === S.stepId);
    if (q.type === "number") {
      const v = Number(document.getElementById("f-num").value);
      if (v > 0 && v < q.min) { S.a = {}; S.screen = "underage"; S.couple = false; render(); return; }
      if (!v || v > q.max) { S.err = fmt(U.invalid, { min: q.min, max: q.max }); render(); return; }
      S.a[q.id] = v;
    } else if (q.type === "body") {
      const h = Number(document.getElementById("f-h").value), w = Number(document.getElementById("f-w").value);
      if (!(h >= 120 && h <= 230 && w >= 35 && w <= 250)) { S.a.height = h || ""; S.a.weight = w || ""; S.err = U.invalidBody; render(); return; }
      S.a.height = h; S.a.weight = w;
    }
    next();
  } else if (d.copy) {
    const text = document.getElementById("summary").textContent;
    const fail = () => {
      setStatus(U.copyFail);
      const r = document.createRange(); r.selectNodeContents(document.getElementById("summary"));
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => setStatus(U.copied), fail);
    else fail();
  } else if (d.save) {
    const r = S.result, l = readHist();
    l.push({ date: today(), sex: r.sex, index: r.index, domains: r.domains.map(x => [x.id, x.score]), distress: r.distress });
    setStatus(writeHist(l.slice(-12)) ? U.saved : U.saveFail);
  } else if (d.wipe) {
    setStatus(wipeHist() ? U.wiped : U.saveFail);
  } else if (d.handoff) {
    S.a = {}; S.result = null; S.sex = null; S.turn = 1; S.status = ""; S.screen = "who"; render();
  } else if (d.shared) {
    S.a = {}; S.result = null; S.status = ""; S.screen = "shared"; render();
  }
});

/* --- Telegram --- */
function applyTheme() {
  if (!tg) return;
  document.documentElement.dataset.theme = tg.colorScheme === "dark" ? "dark" : "light";
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  try {
    if (tg.isVersionAtLeast && tg.isVersionAtLeast("6.1")) { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); }
  } catch (e) { /* eski versiya */ }
}
if (tg) {
  tg.ready();
  tg.expand();
  applyTheme();
  tg.onEvent("themeChanged", applyTheme);
  try { tg.BackButton.onClick(goBack); } catch (e) { /* eski versiya */ }
}
render();
