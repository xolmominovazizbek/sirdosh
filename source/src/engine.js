/* Sirdosh hisoblash qoidalari: UI'ga bog'liq emas, Node'da test qilinadi. */
const LOW = 50, GOOD = 75;

function band(v) { return v == null ? null : v >= GOOD ? "good" : v >= LOW ? "mid" : "low"; }

function fmt(t, vars) {
  return t.replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : ""));
}

function domainsFor(sex) { return TEXT.DOMAINS[sex]; }

function scoreDomains(sex, a) {
  const active = a.active === "yes", partner = a.partner === "yes";
  return domainsFor(sex).map(d => {
    const applicable = d.needsPartner ? partner : (d.always || active);
    if (!applicable) return { id: d.id, label: d.label, score: null };
    const vals = d.items.map(i => a[i.id]);
    if (vals.some(v => typeof v !== "number")) return { id: d.id, label: d.label, score: null };
    const score = Math.round(vals.reduce((x, y) => x + y, 0) / (vals.length * 4) * 100);
    return { id: d.id, label: d.label, score };
  });
}

function bmiOf(a) {
  if (!a.height || !a.weight) return null;
  return Math.round(a.weight / Math.pow(a.height / 100, 2) * 10) / 10;
}

function has(list, v) { return Array.isArray(list) && list.includes(v); }

/* Savollar ketma-ketligi. Har bir qadam javoblarga qarab aniqlanadi. */
function buildSteps(sex, a) {
  const c = TEXT.CONTEXT_Q, l = TEXT.LIFE_Q, steps = [];
  const add = (id, q) => steps.push(Object.assign({ id }, q));
  add("age", c.age);
  add("partner", c.partner);
  add("active", c.active);
  if (a.active === "no") add("whyNot", c.whyNot);
  if (sex === "f") add("fstage", c.fstage);
  const active = a.active === "yes", partner = a.partner === "yes";
  domainsFor(sex).forEach(d => {
    const on = d.needsPartner ? partner : (d.always || active);
    if (on) d.items.forEach(i => add(i.id, { type: "scale", section: "Jinsiy funksiya", text: i.text, scale: i.scale, domain: d.label }));
  });
  add("distress", c.distress);
  if (sex === "m" && active) {
    const ds = scoreDomains(sex, a), ere = ds.find(x => x.id === "ere").score, eja = ds.find(x => x.id === "eja").score;
    if (ere != null && ere < GOOD) { add("monset", c.monset); add("mmorning", c.mmorning); }
    if (eja != null && eja < GOOD) add("mpe", c.mpe);
  }
  TEXT.MOOD_Q.items.forEach(i => add(i.id, { type: "scale", section: "Kayfiyat", lead: TEXT.MOOD_Q.intro, text: i.text, scale: "mood" }));
  ["body", "activity", "sleep", "snore", "tobacco", "alcohol", "cond", "meds", "enhancer"].forEach(k => add(k, l[k]));
  add("flags", { type: "multi", section: "Salomatlik", text: TEXT.UI.flagsQ, options: TEXT.FLAG_Q[sex] });
  add("safety", TEXT.SAFETY_Q);
  return steps;
}

function evaluate(sex, a) {
  const domains = scoreDomains(sex, a);
  const s = id => { const d = domains.find(x => x.id === id); return d ? d.score : null; };
  const lowish = id => s(id) != null && s(id) < GOOD;
  const low = id => s(id) != null && s(id) < LOW;
  const rated = domains.filter(d => d.score != null);
  const index = rated.length >= 4 ? Math.round(rated.reduce((x, d) => x + d.score, 0) / rated.length) : null;
  const distress = typeof a.distress === "number" ? a.distress : 0;
  const phq = (a.phq1 || 0) + (a.phq2 || 0), gad = (a.gad1 || 0) + (a.gad2 || 0);
  const bmi = bmiOf(a);
  const flags = a.flags || [], meds = a.meds || [], cond = a.cond || [];
  const W = TEXT.WHY, U = TEXT.UI;
  const card = (id, why, weight) => ({ id, why, weight });
  const doctor = [], self = [], privateCards = [];
  const urgent = ["chest", "cauda", "priapism"].filter(f => has(flags, f));

  if (a.safety === "yes") privateCards.push(card("coercion", W.coercion, 100));

  /* Shifokor kartalari */
  if (has(meds, "nitrate")) doctor.push(card("nitrate", W.nitrate, 95));
  if (has(flags, "bleed") || has(flags, "pmb")) doctor.push(card("gyn_bleed", W.flag, 92));
  if (has(flags, "pelvicpain")) doctor.push(card("gyn_pain", W.flag, 91));
  if (has(flags, "curve") || has(flags, "testis")) doctor.push(card("uro_flag", W.flag, 90));
  if (has(flags, "sti")) doctor.push(card("sti", W.flag, 89));
  if (a.alcohol === "daily") doctor.push(card("alcohol_doc", W.alcoholDaily, 85));
  if (phq >= 3) doctor.push(card("dep", fmt(W.phq, { v: phq }), 84));
  if (gad >= 3) doctor.push(card("anx", fmt(W.gad, { v: gad }), 80));
  if (has(meds, "ad") && (distress >= 1 || rated.some(d => d.score < GOOD))) doctor.push(card("meds", W.ad, 78));
  else if ((has(meds, "bp") || has(meds, "other")) && distress >= 2) doctor.push(card("meds", W.meds, 60));
  if (a.enhancer === "yes") doctor.push(card("supp", W.enhancer, 76));

  if (sex === "m") {
    if (lowish("ere")) doctor.push(card("cardio", fmt(W.ereLow, { v: s("ere") }), 82));
    if (a.monset === "sudden") doctor.push(card("sudden", W.sudden, 81));
    if (low("ere") || (lowish("ere") && distress >= 2)) doctor.push(card("ed_doc", fmt(W.ereLow, { v: s("ere") }), 72));
    if (low("des") && (a.mmorning === "none" || a.mmorning === "less")) doctor.push(card("testo", W.morning, 70));
    if (a.mpe === "lifelong" && distress >= 2) doctor.push(card("pe_doc", W.lifelong, 68));
    if (a.mpe === "acquired") doctor.push(card("pe_doc", W.acquired, 68));
  }
  if (sex === "f") {
    const dry = lowish("aro") || lowish("pain") || a.whyNot === "pain";
    if ((a.fstage === "peri" || a.fstage === "meno") && dry) doctor.push(card("gsm", fmt(W.stage, { what: U.stageWhat[a.fstage] }), 74));
    if (low("pain") || a.whyNot === "pain") doctor.push(card("pain_pelvic", low("pain") ? fmt(W.painLow, { v: s("pain") }) : W.painReason, 77));
  }
  if (sex === "m" && a.whyNot === "pain") doctor.push(card("uro_flag", W.painReason, 77));
  if (a.snore === "yes") doctor.push(card("osa", W.snore, 58));

  /* O'zi bajaradigan kartalar */
  const lowActivity = a.activity === "a0" || a.activity === "a1";
  if (lowActivity) self.push(card(sex === "m" ? "exercise_m" : "exercise_f", W.activityLow, sex === "m" && lowish("ere") ? 80 : 50));
  if (bmi != null && bmi >= 25) self.push(card("weight", fmt(W.bmi, { bmi: String(bmi).replace(".", ",") }), bmi >= 30 ? 66 : 48));
  if (a.tobacco && a.tobacco !== "no") self.push(card("tobacco", fmt(W.tobacco, { what: U.tobaccoWhat[a.tobacco] }), 70));
  if (a.alcohol === "weekly") self.push(card("alcohol", W.alcoholWeekly, 46));
  if (a.alcohol === "daily") self.push(card("alcohol", W.alcoholDaily, 72));
  if (a.sleep === "s0") self.push(card("sleep", W.sleepShort, 55));
  if (a.sleep === "s1") self.push(card("sleep", W.sleepShort, 34));
  if (sex === "m") {
    if (lowish("eja")) self.push(card("pe_behav", fmt(W.ejaLow, { v: s("eja") }), 68));
    if (lowish("ere") || lowish("eja")) self.push(card("pfmt_m", lowish("ere") ? fmt(W.ereLow, { v: s("ere") }) : fmt(W.ejaLow, { v: s("eja") }), 30));
    if (lowish("ere") || a.whyNot === "fear" || a.monset === "situational") {
      const why = a.whyNot === "fear" ? W.fear : a.monset === "situational" ? W.situational : gad >= 3 ? fmt(W.gad, { v: gad }) : null;
      if (why) self.push(card("perf", why, 64));
    }
    if (lowish("ere") && a.enhancer !== "yes") self.push(card("supp", W.supp, 16));
    if (lowish("ere") || (bmi != null && bmi >= 25)) self.push(card("diet", W.ereDiet, 22));
  }
  if (sex === "f") {
    const painful = low("pain") || a.whyNot === "pain";
    if ((lowish("aro") || lowish("pain") || a.fstage === "peri" || a.fstage === "meno") && (a.active === "yes" || a.whyNot === "pain"))
      self.push(card("lube", lowish("aro") ? fmt(W.aroLow, { v: s("aro") }) : lowish("pain") ? fmt(W.painLow, { v: s("pain") }) : fmt(W.stage, { what: U.stageWhat[a.fstage] }), 69));
    if (a.fstage === "postpartum") self.push(card("postpartum", fmt(W.stage, { what: U.stageWhat.postpartum }), 52));
    if (!painful && (lowish("org") || lowish("aro"))) self.push(card("pfmt_f", lowish("org") ? fmt(W.orgLow, { v: s("org") }) : fmt(W.aroLow, { v: s("aro") }), 38));
    if (lowish("des") || distress >= 2) self.push(card("mindful", lowish("des") ? fmt(W.desLow, { v: s("des") }) : W.distress, 67));
    if (a.whyNot === "fear") self.push(card("perf", W.fear, 60));
    if (distress >= 2 && rated.some(d => d.score < GOOD)) self.push(card("counsel", W.distress, 47));
  }
  if (lowish("rel")) self.push(card("talk", fmt(W.relLow, { v: s("rel") }), 63));
  else if (a.partner === "yes" && (lowish("ere") || lowish("eja"))) self.push(card("talk", W.distress, 33));

  const uniq = list => {
    const seen = {};
    return list.sort((x, y) => y.weight - x.weight).filter(c => (seen[c.id] ? false : (seen[c.id] = true)));
  };
  const dList = uniq(doctor), sList = uniq(self).filter(c => !dList.some(d => d.id === c.id));
  if (!sList.length && !dList.length) sList.push(card("maintain", W.maintain, 1));

  const anyLow = rated.some(d => d.score < GOOD);
  const note = anyLow && distress <= 1 ? "distressLow" : distress >= 2 ? "distressHigh" : null;
  return {
    sex, domains, index, band: band(index), distress, phq, gad, bmi, urgent, doctor: dList,
    plan: sList.slice(0, 3), more: sList.slice(3), privateCards, note, age: a.age, whyNot: a.whyNot || null
  };
}

function doctorSummary(r, today) {
  const L = [];
  L.push("Sirdosh skrining xulosasi (" + today + "). Tashxis emas.");
  L.push((r.sex === "m" ? "Erkak" : "Ayol") + ", " + r.age + " yosh." + (r.bmi ? " TMI " + String(r.bmi).replace(".", ",") + "." : ""));
  r.domains.forEach(d => L.push(d.label + ": " + (d.score == null ? "baholanmadi" : d.score + "/100")));
  L.push("Bezovtalik: " + r.distress + "/4.");
  L.push("PHQ-2: " + r.phq + "; GAD-2: " + r.gad + ".");
  const items = r.urgent.map(u => TEXT.URGENT[u].title).concat(r.doctor.map(d => TEXT.ADVICE[d.id].title));
  if (items.length) L.push("Muhokama uchun: " + items.join("; ") + ".");
  return L.join("\n");
}

if (typeof module !== "undefined") {
  const { TEXT } = require("./content.js");
  global.TEXT = TEXT;
  module.exports = { evaluate, buildSteps, scoreDomains, doctorSummary, band, bmiOf };
}
