const assert = require("assert");
const { TEXT } = require("../src/content.js");
global.TEXT = TEXT;
const { evaluate, buildSteps, doctorSummary } = require("../src/engine.js");
const base = { age: 34, partner: "yes", active: "yes", distress: 0, phq1: 0, phq2: 0, gad1: 0, gad2: 0, height: 175, weight: 70,
  activity: "a2", sleep: "s2", snore: "no", tobacco: "no", alcohol: "no", cond: ["none"], meds: ["none"], enhancer: "no", flags: ["none"], safety: "no" };
const fill = (sex, v) => { const a = Object.assign({}, base); TEXT.DOMAINS[sex].forEach(d => d.items.forEach(i => a[i.id] = v)); return a; };
const ids = l => l.map(x => x.id);

// 1 ideal erkak
let r = evaluate("m", fill("m", 4));
assert.equal(r.index, 100); assert.deepEqual(ids(r.plan), ["maintain"]); assert.equal(r.doctor.length, 0);
// 2 hamma javob 0: ball 0
r = evaluate("m", fill("m", 0)); assert.equal(r.index, 0); assert.equal(r.band, "low");
assert(ids(r.doctor).includes("cardio") && ids(r.doctor).includes("ed_doc"));
// 3 nitrat doim birinchi
let a = fill("m", 1); a.meds = ["nitrate"]; r = evaluate("m", a); assert.equal(r.doctor[0].id, "nitrate");
// 4 faol emas: funksiya baholanmaydi, indeks yo'q
a = fill("m", 2); a.active = "no"; a.whyNot = "nopartner"; a.partner = "no"; r = evaluate("m", a);
assert.equal(r.index, null); assert.equal(r.domains.find(d => d.id === "ere").score, null); assert.equal(r.domains.find(d => d.id === "rel").score, null);
// 5 og'riqda Kegel berilmaydi
a = fill("f", 3); a.pain1 = 0; a.pain2 = 1; a.org1 = 1; a.org2 = 1; r = evaluate("f", a);
assert(!ids(r.plan.concat(r.more)).includes("pfmt_f")); assert(ids(r.doctor).includes("pain_pelvic"));
// 6 og'riqsiz past orgazmda Kegel beriladi
a = fill("f", 4); a.org1 = 1; a.org2 = 1; r = evaluate("f", a); assert(ids(r.plan.concat(r.more)).includes("pfmt_f"));
// 7 shoshilinch belgilar
a = fill("f", 4); a.flags = ["chest", "cauda"]; r = evaluate("f", a); assert.deepEqual(r.urgent, ["chest", "cauda"]);
// 8 PHQ/GAD chegarasi
a = fill("m", 4); a.phq1 = 1; a.phq2 = 1; r = evaluate("m", a); assert(!ids(r.doctor).includes("dep"));
a.phq2 = 2; r = evaluate("m", a); assert(ids(r.doctor).includes("dep"));
// 9 zo'ravonlik xulosaga kirmaydi
a = fill("f", 2); a.safety = "yes"; r = evaluate("f", a); assert.equal(r.privateCards[0].id, "coercion");
assert(!doctorSummary(r, "2026-11-03").toLowerCase().includes("zo‘ravon")); assert(!JSON.stringify(r.doctor).includes("coercion"));
// 10 past ball, bezovtalik yo'q
a = fill("f", 1); a.distress = 0; r = evaluate("f", a); assert.equal(r.note, "distressLow");
a.distress = 3; r = evaluate("f", a); assert.equal(r.note, "distressHigh");
// 11 savollar shartli
let st = buildSteps("m", { active: "no", partner: "no" }).map(s => s.id);
assert(st.includes("whyNot") && !st.includes("ere1") && st.includes("des1") && !st.includes("rel1"));
st = buildSteps("m", Object.assign(fill("m", 1))).map(s => s.id); assert(st.includes("monset") && st.includes("mpe"));
st = buildSteps("m", fill("m", 4)).map(s => s.id); assert(!st.includes("monset"));
st = buildSteps("f", fill("f", 4)).map(s => s.id); assert(st.includes("fstage") && st.includes("pain1"));
// 12 BMI va menopauza
a = fill("f", 2); a.fstage = "meno"; a.height = 160; a.weight = 80; r = evaluate("f", a); assert.equal(r.bmi, 31.2);
assert(ids(r.doctor).includes("gsm")); assert(ids(r.plan.concat(r.more)).includes("lube")); assert(ids(r.plan.concat(r.more)).includes("weight"));
// 13 har bir karta manbasi bor va mavjud
Object.entries(TEXT.ADVICE).forEach(([k, v]) => { assert(TEXT.GRADES[v.grade], k); (v.refs || []).forEach(x => assert(TEXT.REFS[x], k + ":" + x)); assert(v.steps.length >= 2, k); });
// 14 matnlarda ochiq apostrof qolmagan
assert(!JSON.stringify(TEXT.ADVICE).includes("'")); assert(!JSON.stringify(TEXT.UI).includes("'"));
// 15 karta bir marta chiqadi, shifokor va reja takrorlanmaydi
a = fill("m", 1); a.enhancer = "yes"; a.activity = "a0"; a.tobacco = "nos"; a.alcohol = "daily"; r = evaluate("m", a);
const all = ids(r.doctor).concat(ids(r.plan), ids(r.more)); assert.equal(all.length, new Set(all).size);
assert.equal(r.plan.length, 3);
// 16 har bir ADVICE kartasi kamida bitta ssenariyda chiqadi
console.log("OK: 16 ta test o'tdi; PLAN namunasi:", ids(r.plan), "doctor:", ids(r.doctor));
