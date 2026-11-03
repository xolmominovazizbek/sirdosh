const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const errors = [];
  async function page(theme, opts = {}) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1, colorScheme: theme, ...opts });
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push(String(e)));
    p.on('console', m => { if (m.type() === 'error' && !/telegram\.org|ERR_/.test(m.text())) errors.push(m.text()); });
    p.on('request', r => { const u = r.url(); if (!u.startsWith('file:') && !u.startsWith('data:') && !/telegram\.org/.test(u)) errors.push('NETWORK ' + u); });
    await p.goto('file://' + path.resolve('dist/index.html'));
    return p;
  }
  const clickText = async (p, t) => p.locator('button', { hasText: t }).first().click();
  // answers until result
  async function run(p, { val = 2, female = false, singleFirst = true, multi = 'Hech biri', custom = {} } = {}) {
    for (let guard = 0; guard < 80; guard++) {
      if (await p.locator('.rosette').count()) return;
      const h = (await p.locator('h2').first().innerText()).trim();
      if (await p.locator('#f-num').count()) { await p.fill('#f-num', custom.age || '38'); await clickText(p, 'Keyingisi'); continue; }
      if (await p.locator('#f-h').count()) { await p.fill('#f-h', '172'); await p.fill('#f-w', custom.weight || '92'); await clickText(p, 'Keyingisi'); continue; }
      const keys = Object.keys(custom).filter(k => h.includes(k));
      if (keys.length) { await clickText(p, custom[keys[0]]); continue; }
      if (await p.locator('button[data-toggle]').count()) { await p.locator('button[data-toggle="none"]').click(); await clickText(p, 'Keyingisi'); continue; }
      const opts = p.locator('button[data-val]'); const n = await opts.count();
      await opts.nth(Math.min(val, n - 1)).click();
    }
    throw new Error('no result');
  }
  // 1 male, light
  let p = await page('light');
  await p.screenshot({ path: out + '/01-welcome.png' });
  await clickText(p, 'boshlash'); await p.screenshot({ path: out + '/02-who.png' });
  await clickText(p, 'Erkak');
  await p.fill('#f-num', '15'); await clickText(p, 'Keyingisi');
  const under = await p.locator('h2').innerText();
  await clickText(p, 'Boshiga'); await clickText(p, 'boshlash'); await clickText(p, 'Erkak');
  await p.fill('#f-num', '38'); await clickText(p, 'Keyingisi');
  await clickText(p, 'Ha'); await clickText(p, 'Ha');
  await p.locator('button[data-val]').nth(1).click();
  await p.screenshot({ path: out + '/03-question.png' });
  await p.locator('button[data-back]').click();
  const backQ = await p.locator('h2').innerText();
  await run(p, { val: 1, custom: { 'Tamaki': 'Nos', 'Spirtli': 'Haftada', 'Haftasiga': '30 daqiqadan kam' } });
  await p.waitForTimeout(900);
  await p.screenshot({ path: out + '/04-result-m.png', fullPage: true });
  const res = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, cards: document.querySelectorAll('.card').length, idx: document.querySelector('.ctr-num').textContent, summary: document.getElementById('summary').textContent }));
  // save + rerun delta
  await clickText(p, 'saqlash'); const st = await p.locator('.status').first().innerText();
  await clickText(p, 'Manbalar'); await p.waitForTimeout(100);
  await p.screenshot({ path: out + '/05-sources.png' });
  const refCount = await p.locator('.reflist li').count();
  // 2 female dark, pain
  let f = await page('dark');
  await clickText(f, 'boshlash'); await clickText(f, 'Ayol');
  await run(f, { val: 1, custom: { 'Hozir turmush': 'Ha', 'jinsiy faoliyat bo‘ldimi': 'Ha', 'Hozirgi holatingiz': 'Menopauzadaman', 'majburlashadimi': 'Ha' , 'Aloqa og‘riqsiz': 'Kamdan-kam'} });
  await f.waitForTimeout(900);
  await f.screenshot({ path: out + '/06-result-f-dark.png', fullPage: true });
  const fres = await f.evaluate(() => ({ priv: !!document.querySelector('.private'), titles: [...document.querySelectorAll('.card h3')].map(e => e.textContent), summary: document.getElementById('summary').textContent, w: document.documentElement.scrollWidth }));
  // 3 not active, no partner
  let n = await page('light');
  await clickText(n, 'boshlash'); await clickText(n, 'Erkak');
  await n.fill('#f-num', '29'); await clickText(n, 'Keyingisi');
  await clickText(n, 'Yo‘q'); await clickText(n, 'Yo‘q'); await clickText(n, 'Sherik yo‘q');
  await run(n, { val: 3 });
  await n.waitForTimeout(900);
  await n.screenshot({ path: out + '/07-notactive.png', fullPage: true });
  const nres = await n.evaluate(() => ({ idx: document.querySelector('.ctr-num').textContent, unrated: document.querySelectorAll('.ghost-petal.unrated').length }));
  // 4 couple privacy
  let c = await page('light');
  await clickText(c, 'boshlash'); await clickText(c, 'Juftlik'); await clickText(c, 'Erkak');
  await run(c, { val: 2 });
  const hasSave = await c.locator('button[data-save]').count();
  await clickText(c, 'sherigimga');
  const leak1 = await c.evaluate(() => document.body.innerText.includes('Erektsiya'));
  await c.screenshot({ path: out + '/08-handoff.png' });
  await clickText(c, 'Ayol');
  await run(c, { val: 2 });
  await clickText(c, 'Umumiy rejani');
  await c.screenshot({ path: out + '/09-shared.png', fullPage: true });
  const sharedText = await c.evaluate(() => document.body.innerText);
  console.log(JSON.stringify({ under, backQ, res, st, refCount, fres, nres, hasSave, leak1, sharedHasScores: /\b\d+\/100\b/.test(sharedText), errors }, null, 1));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
