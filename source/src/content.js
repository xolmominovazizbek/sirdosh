/* Sirdosh: barcha matnlar shu yerda. Apostroflar ishga tushganda o‘, g‘ va ’ belgilariga aylantiriladi (Golos shriftida U+02BB yo‘q). */

const SCALES = {
  freq: ["Deyarli hech qachon", "Kamdan-kam", "Taxminan yarmida", "Ko'pincha", "Deyarli har doim"],
  amount: ["Umuman yo'q", "Ozroq", "O'rtacha", "Ancha", "To'liq"],
  distress: ["Umuman bezovta qilmaydi", "Ozroq", "O'rtacha", "Ancha", "Juda bezovta qiladi"],
  mood: ["Umuman yo'q", "Bir necha kun", "Kunlarning yarmidan ko'pida", "Deyarli har kuni"]
};

const COMMON_DOMAINS = {
  des: {
    id: "des", label: "Xohish", always: true,
    items: [
      { id: "des1", text: "So'nggi 4 haftada jinsiy xohishni qanchalik tez-tez sezdingiz?", scale: "freq" },
      { id: "des2", text: "Xohishingiz darajasi o'zingiz uchun yetarli bo'ldimi?", scale: "amount" }
    ]
  },
  sat: {
    id: "sat", label: "Qoniqish",
    items: [
      { id: "sat1", text: "Jinsiy hayotingizdan umuman qanchalik qoniqdingiz?", scale: "amount" },
      { id: "sat2", text: "Jinsiy hayotingiz o'zingiz kutgan darajada bo'ldimi?", scale: "amount" }
    ]
  },
  rel: {
    id: "rel", label: "Yaqinlik", needsPartner: true,
    items: [
      { id: "rel1", text: "Sherigingiz bilan bu mavzuda ochiq gaplasha olasizmi?", scale: "freq" },
      { id: "rel2", text: "Sherigingiz bilan iliqlik va yaqinlikni his qilasizmi?", scale: "freq" }
    ]
  }
};

const DOMAINS = {
  m: [
    COMMON_DOMAINS.des,
    {
      id: "ere", label: "Erektsiya",
      items: [
        { id: "ere1", text: "Erektsiya aloqani boshlash uchun yetarli bo'lgan holatlar qanchalik ko'p edi?", scale: "freq" },
        { id: "ere2", text: "Erektsiya aloqa oxirigacha saqlanib qoldimi?", scale: "freq" }
      ]
    },
    {
      id: "eja", label: "Bo'shanish",
      items: [
        { id: "eja1", text: "Bo'shanish vaqtini o'zingiz xohlagandek boshqara oldingizmi?", scale: "freq" },
        { id: "eja2", text: "Aloqa davomiyligi siz va sherigingiz uchun yetarli bo'ldimi?", scale: "freq" }
      ]
    },
    {
      id: "org", label: "Orgazm",
      items: [
        { id: "org1", text: "Aloqa orgazm bilan yakunlandimi?", scale: "freq" },
        { id: "org2", text: "Orgazm hissi sizga yetarlicha to'liq tuyuldimi?", scale: "amount" }
      ]
    },
    COMMON_DOMAINS.sat,
    COMMON_DOMAINS.rel
  ],
  f: [
    COMMON_DOMAINS.des,
    {
      id: "aro", label: "Qo'zg'alish",
      items: [
        { id: "aro1", text: "Jinsiy faoliyat vaqtida o'zingizda qo'zg'alish hissini sezdingizmi?", scale: "freq" },
        { id: "aro2", text: "Aloqa uchun namlanish yetarli bo'ldimi?", scale: "freq" }
      ]
    },
    {
      id: "org", label: "Orgazm",
      items: [
        { id: "org1", text: "Jinsiy faoliyat vaqtida orgazmga erisha oldingizmi?", scale: "freq" },
        { id: "org2", text: "Orgazm yoki lazzat hissi sizga yetarli tuyuldimi?", scale: "amount" }
      ]
    },
    {
      id: "pain", label: "Og'riqsizlik",
      items: [
        { id: "pain1", text: "Aloqa og'riqsiz o'tdimi?", scale: "freq" },
        { id: "pain2", text: "Aloqadan keyin og'riq yoki noqulaylik bo'lmadimi?", scale: "freq" }
      ]
    },
    COMMON_DOMAINS.sat,
    COMMON_DOMAINS.rel
  ]
};

const CONTEXT_Q = {
  age: { type: "number", section: "Holat", text: "Yoshingiz nechada?", min: 18, max: 100, unit: "yosh" },
  partner: {
    type: "single", section: "Holat", text: "Hozir turmush o'rtog'ingiz yoki doimiy sherigingiz bormi?",
    options: [["yes", "Ha"], ["no", "Yo'q"]]
  },
  active: {
    type: "single", section: "Holat", text: "So'nggi 4 haftada jinsiy faoliyat bo'ldimi?",
    hint: "Agar bo'lmagan bo'lsa, savollar shunga moslashadi. Bu baho uchun kamchilik emas.",
    options: [["yes", "Ha"], ["no", "Yo'q"]]
  },
  whyNot: {
    type: "single", section: "Holat", text: "Buning asosiy sababi nima?",
    options: [
      ["nopartner", "Sherik yo'q yoki uzoqda"], ["nodesire", "Xohish yo'q"],
      ["pain", "Og'riq yoki noqulaylik"], ["fear", "Muvaffaqiyatsizlikdan xavotir"],
      ["other", "Boshqa sabab"]
    ]
  },
  fstage: {
    type: "single", section: "Holat", text: "Hozirgi holatingiz qaysi biriga to'g'ri keladi?",
    options: [
      ["regular", "Hayz davri bor"], ["pregnant", "Homiladorman"],
      ["postpartum", "Tug'ruqdan keyin 12 oy ichida"],
      ["peri", "Hayz notekis, menopauzaga yaqin"], ["meno", "Menopauzadaman"]
    ]
  },
  distress: { type: "scale", section: "Jinsiy funksiya", text: "Jinsiy hayotingizdagi qiyinchiliklar sizni qanchalik bezovta qiladi?", scale: "distress", hint: "Klinik jihatdan eng muhim savollardan biri: past ko'rsatkich sizni bezovta qilmasa, u kasallik bo'lmasligi mumkin." },
  monset: {
    type: "single", section: "Jinsiy funksiya", text: "Erektsiyadagi qiyinchilik qanday boshlandi?",
    options: [
      ["sudden", "To'satdan, bir necha kun ichida"], ["gradual", "Asta-sekin, oylar yoki yillar davomida"],
      ["situational", "Faqat ayrim vaziyatlarda bo'ladi"]
    ]
  },
  mmorning: {
    type: "single", section: "Jinsiy funksiya", text: "Ertalabki erektsiyalar saqlanganmi?",
    options: [["yes", "Ha, odatdagidek"], ["less", "Kamaygan"], ["none", "Deyarli yo'q"]]
  },
  mpe: {
    type: "single", section: "Jinsiy funksiya", text: "Erta bo'shanish qachondan beri kuzatiladi?",
    options: [["lifelong", "Jinsiy hayot boshlanganidan beri"], ["acquired", "Keyinroq paydo bo'ldi"], ["rare", "Faqat ba'zida bo'ladi"]]
  }
};

const MOOD_Q = {
  intro: "So'nggi 2 haftada quyidagilar sizni qanchalik bezovta qildi?",
  items: [
    { id: "phq1", text: "Biror ishga qiziqish yoki undan zavq olishning kamligi" },
    { id: "phq2", text: "Tushkunlik, ruhiy siqilish yoki umidsizlik" },
    { id: "gad1", text: "Asabiylashish, xavotir yoki o'zini tang his qilish" },
    { id: "gad2", text: "Xavotirni to'xtata olmaslik yoki nazorat qila olmaslik" }
  ]
};

const LIFE_Q = {
  body: { type: "body", section: "Turmush tarzi", text: "Bo'yingiz va vazningiz qancha?", hint: "Tana massasi indeksini hisoblash uchun." },
  activity: {
    type: "single", section: "Turmush tarzi", text: "Haftasiga jami qancha vaqt tez yurish yoki sport bilan shug'ullanasiz?",
    options: [["a0", "30 daqiqadan kam"], ["a1", "30–149 daqiqa"], ["a2", "150–299 daqiqa"], ["a3", "300 daqiqa va undan ko'p"]]
  },
  sleep: {
    type: "single", section: "Turmush tarzi", text: "Odatda sutkasiga necha soat uxlaysiz?",
    options: [["s0", "6 soatdan kam"], ["s1", "6–7 soat"], ["s2", "7–9 soat"], ["s3", "9 soatdan ko'p"]]
  },
  snore: {
    type: "single", section: "Turmush tarzi", text: "Kuchli xurrak yoki uyquda nafas to'xtashi bormi?",
    options: [["yes", "Ha"], ["no", "Yo'q"], ["unknown", "Bilmayman"]]
  },
  tobacco: {
    type: "single", section: "Turmush tarzi", text: "Tamaki yoki nikotin ishlatasizmi?",
    options: [["no", "Yo'q"], ["cig", "Sigaret yoki vape"], ["nos", "Nos"], ["both", "Ikkalasini ham"]]
  },
  alcohol: {
    type: "single", section: "Turmush tarzi", text: "Spirtli ichimlikni qanchalik tez-tez ichasiz?",
    options: [["no", "Ichmayman"], ["rare", "Oyda bir-ikki marta yoki kamroq"], ["weekly", "Haftada bir necha marta"], ["daily", "Deyarli har kuni"]]
  },
  cond: {
    type: "multi", section: "Salomatlik", text: "Quyidagilardan qaysi biri sizda aniqlangan?",
    options: [
      ["diabetes", "Qandli diabet"], ["htn", "Yuqori qon bosimi"], ["cvd", "Yurak-tomir kasalligi"],
      ["ckd", "Surunkali buyrak kasalligi"], ["neuro", "Nevrologik kasallik"],
      ["pelvic", "Chanoq a'zolarida operatsiya yoki nur davosi"], ["none", "Hech biri"]
    ]
  },
  meds: {
    type: "multi", section: "Salomatlik", text: "Muntazam qabul qiladigan dorilaringiz bormi?",
    options: [
      ["ad", "Antidepressant"], ["nitrate", "Nitrat (nitroglitserin, izosorbid)"],
      ["bp", "Qon bosimi dorisi"], ["other", "Boshqa doimiy dori"], ["none", "Yo'q"]
    ]
  },
  enhancer: {
    type: "single", section: "Salomatlik", text: "So'nggi 6 oyda “quvvat” uchun qo'shimcha, maxsus asal yoki retseptsiz tabletka ishlatdingizmi?",
    options: [["yes", "Ha"], ["no", "Yo'q"]]
  }
};

const FLAG_Q = {
  m: [
    ["chest", "Zo'riqish yoki aloqa vaqtida ko'krak og'rig'i, nafas qisishi"],
    ["cauda", "To'satdan chov sohasida uvishish, siydik yoki najasni tuta olmaslik, oyoqlarda kuchsizlik"],
    ["priapism", "4 soatdan uzoq davom etgan erektsiya"],
    ["curve", "Jinsiy a'zoda yangi qiyshayish, qattiq tugun yoki og'riq"],
    ["testis", "Moyakda og'riq, shish yoki tugun"],
    ["sti", "Yara, g'ayrioddiy ajralma yoki siyganda achishish"],
    ["none", "Hech biri"]
  ],
  f: [
    ["chest", "Zo'riqish yoki aloqa vaqtida ko'krak og'rig'i, nafas qisishi"],
    ["cauda", "To'satdan chov sohasida uvishish, siydik yoki najasni tuta olmaslik, oyoqlarda kuchsizlik"],
    ["bleed", "Aloqadan keyin qon ketishi"],
    ["pmb", "Menopauzadan keyin qonli ajralma"],
    ["pelvicpain", "Kuchli chanoq og'rig'i yoki isitma bilan ajralma"],
    ["sti", "Yara, g'ayrioddiy ajralma yoki siyganda achishish"],
    ["none", "Hech biri"]
  ]
};

const SAFETY_Q = {
  type: "single", section: "Xavfsizlik", text: "Sizni xohlamagan holatda jinsiy aloqaga majburlashadimi yoki sizga zo'ravonlik qilinadimi?",
  hint: "Bu javob saqlanmaydi, xulosaga kirmaydi va faqat sizga ko'rinadi.",
  options: [["no", "Yo'q"], ["yes", "Ha"], ["skip", "Javob bermayman"]]
};

const URGENT = {
  chest: { title: "Ko'krak og'rig'i: tez yordam kerak bo'lishi mumkin", text: "Og'riq yoki nafas qisishi hozir bo'lsa, 103 raqamiga qo'ng'iroq qiling. Hozir bo'lmasa ham, jinsiy faollikdan oldin kardiologga boring." },
  cauda: { title: "Chov sohasida uvishish va siydik tuta olmaslik", text: "To'satdan boshlangan bo'lsa, bu orqa miya ildizlari siqilishi belgisi bo'lishi mumkin. 103 raqamiga qo'ng'iroq qiling, kutmang." },
  priapism: { title: "4 soatdan uzoq erektsiya", text: "Hozir davom etayotgan bo'lsa, 103 raqamiga qo'ng'iroq qiling. Bu shoshilinch holat, kechiksa to'qimalar zararlanadi. O'tib ketgan bo'lsa, urologga ayting." }
};

const WHY = {
  activityLow: "Haftalik harakatingiz 150 daqiqadan kam.",
  bmi: "Tana massasi indeksingiz {bmi}.",
  tobacco: "Siz {what} ishlatasiz.",
  alcoholWeekly: "Spirtli ichimlikni haftada bir necha marta ichasiz.",
  alcoholDaily: "Spirtli ichimlikni deyarli har kuni ichasiz.",
  sleepShort: "Odatda 7 soatdan kam uxlaysiz.",
  snore: "Kuchli xurrak yoki uyquda nafas to'xtashini belgiladingiz.",
  ereLow: "Erektsiya ko'rsatkichingiz {v} ball.",
  ejaLow: "Bo'shanish nazorati ko'rsatkichingiz {v} ball.",
  orgLow: "Orgazm ko'rsatkichingiz {v} ball.",
  desLow: "Xohish ko'rsatkichingiz {v} ball.",
  aroLow: "Qo'zg'alish ko'rsatkichingiz {v} ball.",
  painLow: "Og'riqsizlik ko'rsatkichingiz {v} ball.",
  painReason: "Jinsiy faoliyat bo'lmasligiga og'riq sabab bo'lgan.",
  relLow: "Yaqinlik ko'rsatkichingiz {v} ball.",
  distress: "Bu holat sizni sezilarli bezovta qiladi.",
  fear: "Muvaffaqiyatsizlikdan xavotirni belgiladingiz.",
  situational: "Qiyinchilik faqat ayrim vaziyatlarda bo'ladi.",
  gad: "Xavotir skriningi {v} ball (chegara 3).",
  phq: "Depressiya skriningi {v} ball (chegara 3).",
  stage: "Holatingiz: {what}.",
  ad: "Antidepressant qabul qilasiz.",
  meds: "Doimiy dori qabul qilasiz.",
  nitrate: "Nitrat guruhidagi dori qabul qilasiz.",
  enhancer: "“Quvvat” uchun mahsulot ishlatgansiz.",
  sudden: "Qiyinchilik to'satdan boshlangan.",
  morning: "Ertalabki erektsiyalar kamaygan.",
  lifelong: "Erta bo'shanish jinsiy hayot boshlanganidan beri kuzatiladi.",
  acquired: "Erta bo'shanish keyinroq paydo bo'lgan.",
  coercion: "",
  flag: "Xavf belgisini belgiladingiz.",
  maintain: "Ko'rsatkichlaringiz yaxshi va sizni bezovta qiladigan narsa kam.",
  nopartner: "Sherik yo'qligi kasallik yoki kamchilik emas.",
  ereDiet: "Ovqatlanish qon tomirlari orqali erektsiyaga ta'sir qiladi.",
  supp: "Erektsiya qiyinchiligida bunday mahsulotlar ko'p reklama qilinadi."
};

const GRADES = {
  rct: "Randomizatsiyalangan tadqiqotlar",
  guide: "Klinik qo'llanma",
  obs: "Kuzatuv tadqiqotlari",
  weak: "Zaif yoki ziddiyatli dalil",
  practice: "Klinik amaliyot"
};

const ADVICE = {
  exercise_m: {
    title: "Aerob mashqlar",
    steps: [
      "Haftada 3–5 marta 30–60 daqiqa tez yuring, yuguring, suzing yoki velosiped haydang.",
      "Boshlanishda 20–30 daqiqa yetarli, keyin har hafta sal oshiring.",
      "Yurak kasalligi bo'lsa, boshlashdan oldin shifokor bilan kelishing."
    ],
    grade: "rct",
    effect: "11 ta tadqiqot: IIEF-EF o'rtacha +2,8 ball (95% IK 1,7–3,9), og'ir holatda +4,9. Foyda statistik ishonchli, lekin klinik ahamiyat chegarasidan past bo'lishi mumkin. Tadqiqotlarda median muddat 6 oy.",
    refs: ["khera2023", "andrade2024", "li2026"]
  },
  exercise_f: {
    title: "Muntazam harakat",
    steps: [
      "Haftasiga kamida 150 daqiqa tez yurish yoki shunga teng mashq.",
      "Kunni 10–15 daqiqalik yurishlarga bo'lsangiz ham bo'ladi.",
      "Homiladorlik yoki tug'ruqdan keyingi davrda shifokor bilan kelishing."
    ],
    grade: "weak",
    effect: "Erkaklardagi kabi aniq raqamlar ayollar uchun bu ro'yxatda yo'q; harakat umumiy salomatlik tavsiyasi sifatida beriladi.",
    refs: ["andrade2024"]
  },
  weight: {
    title: "Vaznni kamaytirish",
    steps: [
      "Boshlang'ich maqsad: 3 oyda vaznning 5 foizini kamaytirish.",
      "Shirin ichimlik va qandolatni kamaytiring, sabzavotni ko'paytiring.",
      "Parhez va harakatni birga olib boring: alohidagidan ko'ra yaxshiroq natija kuzatilgan."
    ],
    grade: "rct",
    effect: "16 ta randomizatsiyalangan tadqiqot: parhez va mashq erektil funksiyani o'rtacha 2,35 ballga yaxshilagan (95% IK 1,68–3,01), ishonch darajasi o'rtacha.",
    refs: ["li2026", "yang2024"]
  },
  diet: {
    title: "O'simlik mahsulotlariga boy ovqatlanish",
    steps: [
      "Har kuni sabzavot, meva, dukkaklilar va yong'oq.",
      "Qizil go'sht va qovurilgan yog'li taomlarni kamaytiring.",
      "Bitta “afrodiziak” mahsulotga emas, umumiy ovqatlanish tartibiga e'tibor bering."
    ],
    grade: "obs",
    effect: "O'simlikka boy ovqatlanish erektil disfunksiya ehtimoli pastroq bilan bog'langan (OR 0,71; 95% IK 0,66–0,75). Bu bog'liqlik, sabab emas.",
    refs: ["yang2024"]
  },
  tobacco: {
    title: "Tamaki va nosni tashlash",
    steps: [
      "Tashlash sanasini belgilang va uni yaqinlaringizga ayting.",
      "Tortish istagi uyg'otadigan vaziyatlarni yozib boring.",
      "Qiyin bo'lsa, shifokordan nikotinga qaramlik davosi haqida so'rang."
    ],
    grade: "obs",
    effect: "Chekish erektil disfunksiya xavf omili hisoblanadi. Nos bo'yicha alohida ma'lumot bu ro'yxatda yo'q, tavsiya nikotinning umumiy ta'siriga asoslangan.",
    refs: ["sivaratnam2021", "wang2025", "visscher2023"]
  },
  alcohol: {
    title: "Spirtli ichimlikni kamaytirish",
    steps: [
      "Ichish kunlari sonini sanang va uni bosqichma-bosqich kamaytiring.",
      "Jinsiy muammoni “dadillik” uchun ichish bilan yechmang.",
      "Ichmaydigan bo'lsangiz, boshlash tavsiya etilmaydi."
    ],
    grade: "obs",
    effect: "Tadqiqotlarda J-shaklidagi bog'liqlik bor: oz miqdordagi ichish foydali ko'rinadi, ammo bu sababiy isbot emas. Surunkali ichish tomirlarga zarar yetkazishi mumkin.",
    refs: ["liS2021", "wangXM2018", "sivaratnam2021"]
  },
  sleep: {
    title: "Uyquni 7 soatdan ko'paytirish",
    steps: [
      "Bir hafta davomida har kuni bir xil vaqtda turing.",
      "Yotishdan 1 soat oldin telefonni qo'ying.",
      "Tushdan keyin kofeinni kamaytiring."
    ],
    grade: "weak",
    effect: "171 ayolda 14 kunlik pilot tadqiqot: uyqu 1 soatga uzayganda keyingi kun sherik bilan jinsiy faoliyat ehtimoli 14% oshgan. Natija cheklangan guruhga tegishli.",
    refs: ["kalmbach2015"]
  },
  pfmt_m: {
    title: "Chanoq tubi mushaklari mashqi",
    steps: [
      "Mushakni toping: u siydik oqimini to'xtatishda ishlaydi. Mashqni siyish paytida qilmang.",
      "Boshlang'ich tartib: 5 soniya qisib, 5 soniya bo'shating, 10 marta.",
      "Kuniga 3 marta takrorlang. Qorin va sonni qismang."
    ],
    grade: "weak",
    effect: "Dalillar ziddiyatli: tizimli sharhda foyda ko'rsatilgan, ammo 2024 yilgi meta-tahlilda erektsiyaga ishonchli ta'sir topilmagan (SMD 0,03). Eng yaxshi tartib aniqlanmagan.",
    refs: ["myers2019", "chen2024"]
  },
  pfmt_f: {
    title: "Chanoq tubi mushaklari mashqi",
    steps: [
      "Mushakni toping: u siydik oqimini to'xtatishda ishlaydi. Mashqni siyish paytida qilmang.",
      "Boshlang'ich tartib: 5 soniya qisib, 5 soniya bo'shating, 10 marta.",
      "Kuniga 3 marta takrorlang. Og'riq paydo bo'lsa, to'xtating."
    ],
    grade: "weak",
    effect: "21 ta tadqiqot sharhi, 4 tasining meta-tahlilida FSFI umumiy balli +7,67 (95% IK 0,77–14,57), lekin ishonch darajasi juda past. Bachadon olib tashlangandan keyin: +5 ball, o'rtacha ishonch.",
    refs: ["jorge2024", "oliveira2024"]
  },
  pain_pelvic: {
    title: "Og'riqda avval ginekolog ko'rigi",
    steps: [
      "Sababni aniqlash uchun ginekologga boring.",
      "Og'riq bor paytda Kegel mashqini o'zingiz boshlamang: mushak ortiq taranglashgan bo'lishi mumkin.",
      "Chanoq tubi fizioterapevti bo'lsa, u bilan mushakni bo'shashtirish mashqlarini o'rganing."
    ],
    grade: "guide",
    effect: "Qo'llanmalarda chanoq tubi fizioterapiyasi va xulq-atvor terapiyasi mushak taranglashuvi va psixologik omillarni davolashda qayd etiladi.",
    refs: ["christmas2023"]
  },
  pe_behav: {
    title: "To'xtash va davom ettirish usuli",
    steps: [
      "Bo'shanish yaqinlashayotganini sezganda harakatni to'xtating.",
      "Sezgi pasaygach davom eting. Bir aloqada 3–4 marta takrorlang.",
      "Sherigingiz bilan oldindan kelishib oling. Natija darhol emas, haftalar ichida seziladi."
    ],
    grade: "weak",
    effect: "Xulq-atvor usullari qisqa muddatda yaxshilanish beradi, keyinchalik samara pasayadi.",
    refs: ["serefoglu2013"]
  },
  perf: {
    title: "Natija xavotirini kamaytirish",
    steps: [
      "Keyingi bir necha yaqinlikda maqsadni “natija”dan “yoqimli his”ga o'zgartiring.",
      "Xavotirli fikrni payqang, uni baholamang, e'tiborni nafas va sezgiga qaytaring.",
      "Muammo davom etsa, kognitiv-xulq-atvor terapiyasi bo'yicha mutaxassisga boring."
    ],
    grade: "weak",
    effect: "Natija xavotiri erkaklarning 9–25%, ayollarning 6–16% ida uchraydi. KXT va mayndfulness tavsiya etiladi, lekin bu holat uchun nazoratli tadqiqotlar kam.",
    refs: ["pyke2020"]
  },
  mindful: {
    title: "Mayndfulness va jinsiy ta'lim",
    steps: [
      "Har kuni 10 daqiqa nafasga e'tibor qaratish mashqini bajaring.",
      "Yaqinlik paytida fikr chalg'isa, e'tiborni tana sezgilariga qaytaring.",
      "Jinsiy ta'limga oid ishonchli manbalarni birga o'qing. Mavzuni shifokor yoki psixolog bilan muhokama qiling."
    ],
    grade: "rct",
    effect: "45 ta tadqiqot, 4726 ayol: jinsiy ta'lim, KXT, mayndfulness va maslahat FSFI ballini yaxshilagan. Ruhiy zo'riqishni kamaytirishda mayndfulness birinchi o'rinda.",
    refs: ["qiangzhao2026", "jaderek2019"]
  },
  counsel: {
    title: "Mutaxassis bilan suhbat",
    steps: [
      "Oilaviy psixolog yoki psixoterapevtga boring. Imkon bo'lsa, sherigingiz bilan birga.",
      "Birinchi uchrashuvda shu xulosani ko'rsating, bu suhbatni osonlashtiradi.",
      "Qisqa, aniq maqsad qo'ying: masalan, 6 haftada bezovtalikni kamaytirish."
    ],
    grade: "rct",
    effect: "Ayollar uchun PLISSIT modeli va KXT asosidagi maslahat FSFI bo'yicha eng yuqori o'rinlarda.",
    refs: ["qiangzhao2026"]
  },
  talk: {
    title: "Sherik bilan ochiq suhbat",
    steps: [
      "Haftada 20 daqiqa, karavotdan tashqarida, xotirjam vaqtda gaplashing.",
      "“Sen doim…” emas, “Men ... his qilaman” deb boshlang.",
      "Bitta aniq iltimos ayting: nima yoqadi, nimani o'zgartirmoqchisiz."
    ],
    grade: "obs",
    effect: "Yaqinlik erektil disfunksiyada himoya omili sifatida qayd etilgan. Erta bo'shanishda juftlik omillari ham ahamiyatli.",
    refs: ["sivaratnam2021", "dogan2026"]
  },
  lube: {
    title: "Lubrikant va namlovchi vositalar",
    steps: [
      "Aloqa paytida suv asosidagi lubrikantdan foydalaning.",
      "Doimiy quruqlikda muntazam ishlatiladigan vaginal namlovchi vosita sinab ko'ring.",
      "Xushbo'y, qichituvchi moddali vositalardan saqlaning."
    ],
    grade: "guide",
    effect: "Frantsiya klinik qo'llanmasiga ko'ra lubrikant, namlovchi va gialuron kislotasi menopauzadagi simptomlarni yengillashtiradi va barcha bemorlarga taklif qilinishi mumkin.",
    refs: ["hocke2021", "christmas2023"]
  },
  postpartum: {
    title: "Tug'ruqdan keyingi tiklanish",
    steps: [
      "Aloqani qayta boshlash vaqtini shifokor va o'zingizning holatingiz belgilaydi.",
      "Chanoq tubi mashqlari siydik tuta olmaslik xavfini kamaytiradi.",
      "Emizish davrida quruqlik bo'lsa, lubrikant ishlating."
    ],
    grade: "rct",
    effect: "Chanoq tubi mashqlari siydik tuta olmaslik ehtimolini 37% kamaytirgan (OR 0,63). Jinsiy funksiyaga ta'siri bo'yicha dalil cheklangan.",
    refs: ["beamish2025"]
  },
  maintain: {
    title: "Hozirgi holatni saqlash",
    steps: [
      "Harakat, uyqu va ovqatlanish odatlaringizni davom ettiring.",
      "Sherigingiz bilan muloqotni to'xtatmang.",
      "6–12 oydan keyin yoki biror o'zgarish sezsangiz, testni qayta ishlang."
    ],
    grade: "practice",
    effect: "Maxsus aralashuv talab qilinmaydi.",
    refs: []
  },
  supp: {
    title: "“Quvvat” mahsulotlaridan saqlaning",
    steps: [
      "Tezda ta'sir qilishni va'da qilgan “tabiiy” mahsulotni ishlatmang.",
      "Rux va magniyni faqat tahlilda yetishmovchilik bo'lsa qabul qiling.",
      "Bironta mahsulot ishlatgan bo'lsangiz, shifokorga ayting."
    ],
    grade: "guide",
    effect: "FDA bazasida 1000 ga yaqin xavfli mahsulot qayd etilgan, ayrimlarida yashirin sildenafil va tadalafil topilgan. Rux va folat testosteronni oshirmagan (meta-tahlil, subfertil erkaklar).",
    refs: ["fda", "irani2017", "moyad2022"]
  },
  /* Shifokor kartalari */
  cardio: {
    title: "Yurak-tomir tekshiruvi",
    steps: [
      "Terapevtga boring: qon bosimi, qandli diabet va lipidlarni tekshiring.",
      "Erektsiya qiyinchiligini shifokorga albatta ayting.",
      "Xavf omillarini nazorat qilish davoning birinchi qadamidir."
    ],
    grade: "guide",
    effect: "EAU 2025: erektil disfunksiya yurak-tomir kasalligi, koronar kasallik va insult xavfini sezilarli oshiradi va ba'zan ularning erta belgisi bo'ladi.",
    refs: ["eau2025", "corona2020"]
  },
  ed_doc: {
    title: "Urolog yoki androlog ko'rigi",
    steps: [
      "Birinchi qator dori davosi (PDE5 ingibitorlari) faqat shifokor ko'rigidan keyin tanlanadi.",
      "Dorini dorixonadan o'zingiz tanlamang va dozani o'zgartirmang.",
      "Mavjud dorilaringiz ro'yxatini o'zingiz bilan oling."
    ],
    grade: "guide",
    effect: "Hayot tarzi o'zgarishi davolashni to'ldiradi, uni kechiktirmasligi kerak. Davo bemor kutishlari va xavfsizligiga qarab tanlanadi.",
    refs: ["eau2025"]
  },
  sudden: {
    title: "To'satdan boshlangan qiyinchilikni tekshirish",
    steps: [
      "Yaqin kunlarda shifokorga boring.",
      "Oxirgi paytda boshlangan dorilar, jarohat yoki operatsiyalarni ayting.",
      "Kuchli stress yoki munosabatdagi o'zgarish bo'lsa, buni ham ayting."
    ],
    grade: "practice",
    effect: "Boshlanish tezligi, ertalabki erektsiyalar va vaziyatga bog'liqlik sababni farqlashga yordam beradi.",
    refs: ["eau2025"]
  },
  testo: {
    title: "Testosteronni shifokor bilan tekshirish",
    steps: [
      "Tahlilni ertalab, shifokor yo'llanmasi bilan topshiring.",
      "Testosteron preparatini o'zingiz boshlamang.",
      "Davo faqat belgilari bor va tahlilda past bo'lgan erkaklarga buyuriladi."
    ],
    grade: "guide",
    effect: "EAU 2025 testosteron davosini simptomlari bor va testosteroni past bemorlar bilan cheklashni tavsiya qiladi.",
    refs: ["eau2025"]
  },
  pe_doc: {
    title: "Erta bo'shanish bo'yicha urolog ko'rigi",
    steps: [
      "Jinsiy hayot boshidan bo'lsa, dori davosi haqida shifokor bilan gaplashing.",
      "Keyinroq paydo bo'lgan bo'lsa, sabab izlanadi: erektsiya, prostata, qalqonsimon bez, stress.",
      "Dorini o'zingiz tanlamang."
    ],
    grade: "guide",
    effect: "EAU 2025: umrbod shaklda dori davosi birinchi qator; orttirilgan shaklda avval sabab davolanadi.",
    refs: ["eau2025"]
  },
  nitrate: {
    title: "Nitrat va potensiya dorilari birga mumkin emas",
    steps: [
      "Sildenafil, tadalafil, vardenafil va ularga o'xshash dorilarni qabul qilmang.",
      "“Quvvat” qo'shimchalari va maxsus asal ham xavfli: tarkibida shu moddalar yashirin bo'lishi mumkin.",
      "Kardiolog bilan xavfsiz yechimni muhokama qiling."
    ],
    grade: "guide",
    effect: "Nitratlar bilan birga qabul qilish qat'iy mumkin emas: qon bosimi xavfli darajada tushishi mumkin.",
    refs: ["eau2025", "fda"]
  },
  meds: {
    title: "Dorini o'zingiz to'xtatmang",
    steps: [
      "Jinsiy nojo'ya ta'sirni shifokorga ochiq ayting.",
      "Dozani o'zgartirish, boshqa doriga o'tish yoki qo'shimcha davo faqat shifokor qarori bilan bo'ladi.",
      "Antidepressantni birdan to'xtatish depressiya qaytishi va bekor qilish belgilariga olib kelishi mumkin."
    ],
    grade: "guide",
    effect: "SSRI va SNRI dorilarida jinsiy nojo'ya ta'sir ko'p uchraydi. Doza kamaytirish, boshqa doriga o'tish yoki qo'shimcha davo shifokor tomonidan tanlanadi.",
    refs: ["zini2026", "aquino2025"]
  },
  dep: {
    title: "Kayfiyat bo'yicha psixiatr yoki psixolog ko'rigi",
    steps: [
      "Skrining tashxis emas, lekin to'liq baholashni talab qiladi.",
      "Kayfiyat yaxshilanishi ko'pincha jinsiy hayotga ham ta'sir qiladi.",
      "O'zingizga zarar yetkazish fikrlari bo'lsa, shu kuni 103 yoki 1003 raqamiga murojaat qiling."
    ],
    grade: "guide",
    effect: "PHQ-2 ≥ 3: keyingi baholash tavsiya etiladi. Depressiya va xavotir jinsiy disfunksiya bilan bog'liq.",
    refs: ["phq2", "wang2025"]
  },
  anx: {
    title: "Xavotir bo'yicha mutaxassis ko'rigi",
    steps: [
      "Psixiatr yoki psixolog bilan to'liq baholashdan o'ting.",
      "Xavotir davolansa, natija xavotiri ham kamayishi mumkin.",
      "Tinchlantiruvchi dorilarni o'zingiz qabul qilmang."
    ],
    grade: "guide",
    effect: "GAD-2 ≥ 3: keyingi baholash tavsiya etiladi.",
    refs: ["gad2", "pyke2020"]
  },
  osa: {
    title: "Uyqu apnoesini tekshirish",
    steps: [
      "Terapevt, nevrolog yoki LOR shifokoriga boring.",
      "Kunduzgi uyquchanlik va ertalabki bosh og'rig'ini ayting.",
      "Apnoe tasdiqlansa, u yurak uchun ham davolanishi kerak."
    ],
    grade: "weak",
    effect: "Cochrane 2021: CPAP erektsiyaga ta'siri noaniq, dalil ishonchi juda past. Tekshiruv baribir umumiy salomatlik uchun kerak.",
    refs: ["barbosa2021"]
  },
  alcohol_doc: {
    title: "Spirtli ichimlik bo'yicha shifokor bilan gaplashing",
    steps: [
      "Har kuni ichish qaramlik belgisi bo'lishi mumkin.",
      "Ko'p yillik ichishni birdan to'xtatish xavfli bo'lishi mumkin: shifokor nazoratida to'xtating.",
      "Narkolog yoki psixiatrga murojaat qiling."
    ],
    grade: "practice",
    effect: "Surunkali ichish tomirlarga zarar yetkazishi mumkin.",
    refs: ["liS2021"]
  },
  gyn_bleed: {
    title: "Tez orada ginekolog ko'rigi",
    steps: [
      "Aloqadan keyin yoki menopauzadan keyingi qon ketishini kechiktirmang.",
      "Ko'rik va kerakli tekshiruvlarni o'ting.",
      "Belgilar qachon boshlanganini yozib oling."
    ],
    grade: "practice",
    effect: "Bu belgilar sababi aniqlanishi kerak bo'lgan holatlardir.",
    refs: []
  },
  gyn_pain: {
    title: "Tez orada ginekolog ko'rigi",
    steps: ["Isitma yoki kuchli og'riq bo'lsa, shu kuni boring.", "Antibiotikni o'zingiz boshlamang.", "Sherigingizga ham aytish kerak bo'lishi mumkin."],
    grade: "practice", effect: "Infeksiya yoki yallig'lanish sababini aniqlash kerak.", refs: []
  },
  uro_flag: {
    title: "Tez orada urolog ko'rigi",
    steps: ["Tugun, og'riq yoki qiyshayishni ko'rsating.", "Moyakdagi to'satdan kuchli og'riqda shu kuni boring.", "Internetdan davo tanlamang."],
    grade: "practice", effect: "Bu belgilar shifokor ko'rigini talab qiladi.", refs: ["eau2025"]
  },
  sti: {
    title: "Infeksiya tekshiruvi",
    steps: ["Dermatovenerolog, urolog yoki ginekologga boring.", "Tekshiruvgacha himoyasiz aloqadan saqlaning.", "Antibiotikni o'zingiz boshlamang."],
    grade: "practice", effect: "Bu belgilar tekshiruv va sabab davosini talab qiladi.", refs: []
  },
  gsm: {
    title: "Menopauza davrini ginekolog bilan muhokama qilish",
    steps: [
      "Quruqlik va og'riq davolanadi, bunga chidash shart emas.",
      "Kam dozali mahalliy gormon davosini shifokor bilan muhokama qiling.",
      "Ko'krak saratoni bo'lgan bo'lsa, avval gormonsiz vositalar tanlanadi."
    ],
    grade: "guide",
    effect: "Qo'llanmalar: mahalliy kam dozali estrogen samarali va og'iz orqali shakldan afzal; ko'krak saratonida gormonsiz vositalar birinchi qator.",
    refs: ["hocke2021", "christmas2023"]
  },
  coercion: {
    title: "Bu sizning aybingiz emas",
    steps: [
      "1146: qiyin vaziyatdagi ayollar uchun ishonch telefoni.",
      "102: xavf ostida bo'lsangiz, ichki ishlar organlari.",
      "“Inson” markazlari: ijtimoiy-psixologik yordam.",
      "1003: Sog'liqni saqlash vazirligi ishonch telefoni, erkaklar ham murojaat qilishi mumkin."
    ],
    grade: "practice",
    effect: "Bu ekran faqat sizga ko'rinadi va hech qayerda saqlanmaydi.",
    refs: ["hotline"]
  }
};

const REFS = {
  li2026: ["Li T, et al. Lifestyle interventions in treating erectile dysfunction: SR and MA of RCTs. J Sex Med. 2026;23(6).", "10.1093/jsxmed/qdag137"],
  khera2023: ["Khera M, et al. Effect of aerobic exercise on erectile function: SR and MA of RCTs. J Sex Med. 2023;20(12):1369-75.", "10.1093/jsxmed/qdad130"],
  chen2024: ["Chen Z, et al. Physical activities and erectile dysfunction in men not receiving PDE5 inhibitors: SR and MA. Andrology. 2024;12(8):1632-41.", "10.1111/andr.13682"],
  andrade2024: ["Andrade C. Aerobic exercise: RCT data suggest qualified benefits for erectile dysfunction. J Clin Psychiatry. 2024;85(3).", "10.4088/JCP.24f15480"],
  yang2024: ["Yang B, et al. Improved erectile function and dietary patterns: SR and MA. Asian J Androl. 2025;27(2):239-44.", "10.4103/aja202485"],
  sivaratnam2021: ["Sivaratnam L, et al. Behavior-related erectile dysfunction: SR and MA. J Sex Med. 2021;18(1):121-43.", "10.1016/j.jsxm.2020.09.009"],
  wang2025: ["Wang S, Zhou J. Reproductive dysfunction in male infertility: MA. Hormones. 2025;24(4):1157-75.", "10.1007/s42000-025-00689-5"],
  visscher2023: ["Visscher J, et al. Smoking and urinary and sexual function recovery after radical prostatectomy: SR and MA. Prostate Cancer Prostatic Dis. 2024;27(2):222-29.", "10.1038/s41391-023-00701-2"],
  liS2021: ["Li S, et al. A meta-analysis of erectile dysfunction and alcohol consumption. Urol Int. 2021;105(11-12):969-85.", "10.1159/000508171"],
  wangXM2018: ["Wang XM, et al. Alcohol intake and risk of erectile dysfunction: dose-response MA. Int J Impot Res. 2018;30(6):342-51.", "10.1038/s41443-018-0022-x"],
  kalmbach2015: ["Kalmbach DA, et al. The impact of sleep on female sexual response and behavior: a pilot study. J Sex Med. 2015;12(5):1221-32.", "10.1111/jsm.12858"],
  barbosa2021: ["Barbosa FT, et al. Non-invasive positive airway pressure for erectile dysfunction in obstructive sleep apnoea. Cochrane Database Syst Rev. 2021;9:CD013169.", "10.1002/14651858.CD013169.pub2"],
  myers2019: ["Myers C, Smith M. Pelvic floor muscle training improves erectile dysfunction and premature ejaculation: SR. Physiotherapy. 2019;105(2):235-43.", "10.1016/j.physio.2019.01.002"],
  jorge2024: ["Jorge CH, et al. Pelvic floor muscle training as treatment for female sexual dysfunction: SR and MA. Am J Obstet Gynecol. 2024;231(1):51-66.", "10.1016/j.ajog.2024.01.001"],
  oliveira2024: ["de Oliveira NFF, et al. Pelvic floor muscle training after hysterectomy: SR with MA. Braz J Phys Ther. 2024;28(5):101122.", "10.1016/j.bjpt.2024.101122"],
  beamish2025: ["Beamish NF, et al. Postpartum exercise, pelvic floor disorders and diastasis recti: SR and MA. Br J Sports Med. 2025;59(8):562-75.", "10.1136/bjsports-2024-108619"],
  qiangzhao2026: ["Qiangzhao L, et al. Psychological therapies for female sexual function: SR and network MA. J Sex Med. 2026;23(3).", "10.1093/jsxmed/qdag040"],
  jaderek2019: ["Jaderek I, Lew-Starowicz M. Mindfulness meditation-based interventions for sexual dysfunctions: SR. J Sex Med. 2019;16(10):1581-96.", "10.1016/j.jsxm.2019.07.019"],
  pyke2020: ["Pyke RE. Sexual performance anxiety. Sex Med Rev. 2020;8(2):183-90.", "10.1016/j.sxmr.2019.07.001"],
  serefoglu2013: ["Serefoglu EC, et al. Premature ejaculation: do we have effective therapy? Transl Androl Urol. 2013;2(1):45-53.", "10.3978/j.issn.2223-4683.2013.01.02"],
  dogan2026: ["Doğan Ç, et al. The hidden half of premature ejaculation: couple-based cross-sectional study. World J Urol. 2026;44(1).", "10.1007/s00345-026-06650-4"],
  zini2026: ["Zini J, Turecki G. Antidepressant-induced sexual dysfunction in adults: scoping review. J Clin Psychopharmacol. 2026.", "10.1097/JCP.0000000000002210"],
  aquino2025: ["de Aquino ACQ, et al. Pharmacological treatment of antidepressant-induced sexual dysfunction in women: SR and MA. Clinics. 2025;80:100602.", "10.1016/j.clinsp.2025.100602"],
  hocke2021: ["Hocké C, et al. Genitourinary menopause syndrome: CNGOF and GEMVi guidelines. Gynecol Obstet Fertil Senol. 2021;49(5):394-413.", "10.1016/j.gofs.2021.03.025"],
  christmas2023: ["Christmas M, et al. Clinical practice guidelines for managing genitourinary symptoms associated with menopause. Clin Obstet Gynecol. 2024;67(1):101-14.", "10.1097/GRF.0000000000000833"],
  corona2020: ["Corona G, et al. Erectile dysfunction and cardiovascular risk: review. Expert Rev Cardiovasc Ther. 2020;18(3):155-64.", "10.1080/14779072.2020.1745632"],
  irani2017: ["Irani M, et al. Folate and folate plus zinc in sub-fertile men: SR and MA. Urol J. 2017;14(5):4069-78.", null, "https://pubmed.ncbi.nlm.nih.gov/28853101/"],
  moyad2022: ["Moyad MA. Nutraceuticals and phytotherapy in men's health. Urol Clin North Am. 2022;49(2):239-48.", "10.1016/j.ucl.2021.12.006"],
  eau2025: ["EAU Guidelines on Sexual and Reproductive Health: pocket version. European Association of Urology; 2025.", null, "https://d56bochluxqnz.cloudfront.net/documents/EAU-Pocket-on-Sexual-Reproductive-Health-2025.pdf"],
  fda: ["FDA. Warning letters on honey-based products with hidden drug ingredients marketed for sexual enhancement.", null, "https://content.govdelivery.com/accounts/USFDA/bulletins/320502b"],
  phq2: ["Kroenke K, et al. The Patient Health Questionnaire-2. Med Care. 2003;41:1284-92 (NIDA CTN tavsifi).", null, "https://cde.nida.nih.gov/node/22"],
  gad2: ["GAD-2 screening tool (Spitzer RL, et al.). NICE CG123, Appendix 13.", null, "https://www.ncbi.nlm.nih.gov/books/NBK92248/"],
  hotline: ["1146 va 102 raqamlari: UzDaily; 1003: Sog‘liqni saqlash vazirligi.", null, "https://www.uzdaily.uz/en/uzbekistan-to-provide-rehabilitation-services-to-victims-of-violence-without-official-statements/"]
};

const SHARED_PLAN = [
  { title: "Haftalik suhbat", text: "Haftada 20 daqiqa, karavotdan tashqarida, ikkalangiz gapiradigan vaqt ajrating. Birovni ayblamasdan, bitta aniq istak ayting." },
  { title: "Birga harakat", text: "Haftada kamida 3 marta birga tez yuring. Harakat ikkalangizning salomatligingiz uchun foydali va bir-biringizni rag'batlantiradi." },
  { title: "Bosimsiz yaqinlik", text: "Bir necha marta natija yoki orgazmni maqsad qilmasdan, faqat erkalash va tegishdan zavq oling." },
  { title: "Kerak bo'lsa, birga ko'rikka boring", text: "Sherigingiz istasa, shifokor yoki psixologga birga boring. Har biringizning natijangizni ko'rsatish yoki ko'rsatmaslik o'z ixtiyoringizda." }
];

const UI = {
  name: "Sirdosh",
  welcomeTitle: "Jinsiy salomatlikni tinchgina baholang",
  welcomeLead: "5 daqiqalik savollar sizga yoki juftlikka jinsiy hayot profilini va dalillarga asoslangan shaxsiy rejani beradi.",
  point1: "Javoblar telefoningizdan chiqmaydi: server yo'q, hisob yo'q.",
  point2: "Natija tashxis emas. U shifokor ko'rigini almashtirmaydi.",
  point3: "Tavsiyalar PubMed'dagi tadqiqotlar va klinik qo'llanmalarga asoslangan.",
  adult: "Ilova 18 yoshdan oshgan kattalar uchun.",
  start: "18 yoshdan oshganman, boshlash",
  sources: "Manbalar va usul",
  who: "Kim javob beradi?",
  whoHint: "Juftlikda har biringiz yolg'iz, alohida javob berasiz. Telefonni sherigingizga berishdan oldin natijangiz o'chiriladi.",
  man: "Erkak", woman: "Ayol", couple: "Juftlik",
  coupleWho: "Birinchi kim javob beradi?",
  cont: "Davom etish", back: "Orqaga", next: "Keyingisi",
  height: "Bo'y, sm", weight: "Vazn, kg",
  underage: "Ilova faqat 18 yoshdan oshganlar uchun. Sog'lig'ingiz bo'yicha savollaringiz bo'lsa, ota-onangiz yoki shifokor bilan gaplashing.",
  invalid: "{min} dan {max} gacha son kiriting.",
  invalidBody: "Bo'y 120–230 sm, vazn 35–250 kg oralig'ida bo'lsin.",
  moodLead: "So'nggi 2 haftada",
  profile: "Sizning profilingiz",
  indexLabel: "100 balldan",
  indexNote: "Tasviriy ko'rsatkich. Ball hali validatsiya qilinmagan, shuning uchun tashxis qo'yishga yaroqsiz.",
  noIndex: "Jinsiy faoliyat bo'lmagani uchun umumiy ball hisoblanmadi.",
  bandGood: "Yaxshi", bandMid: "O'rtacha", bandLow: "E'tibor kerak",
  notRated: "Baholanmadi",
  distressLowNote: "Ayrim ko'rsatkichlar past, ammo bu sizni deyarli bezovta qilmaydi. Bunday holatda past ball o'z-o'zidan muammo hisoblanmaydi.",
  distressHighNote: "Bu holat sizni bezovta qiladi. Yordam so'rash uchun yetarli sabab.",
  moodLine: "Kayfiyat skriningi: PHQ-2 {phq} ball, GAD-2 {gad} ball. Chegara 3 ball.",
  bmiLine: "Tana massasi indeksi: {bmi}",
  urgent: "Avval shuni o'qing",
  doctor: "Shifokorga",
  doctorHint: "Quyidagilarni o'z-o'zidan davolab bo'lmaydi.",
  plan: "12 haftalik rejangiz",
  planHint: "Sizning javoblaringizga ko'ra eng foydali uch qadam.",
  more: "Yana foydali bo'lishi mumkin",
  why: "Nega sizga",
  evidence: "Dalil",
  delta: "Avvalgi natijadan: {d} ball ({date})",
  summary: "Shifokor uchun xulosa",
  summaryHint: "Matnni nusxalab, ko'rikda ko'rsating.",
  copy: "Xulosani nusxalash",
  copied: "Nusxalandi",
  copyFail: "Nusxalab bo'lmadi. Matnni belgilab oling.",
  save: "Natijani shu qurilmada saqlash",
  saved: "Saqlandi. 12 haftadan keyin qayta ishlang.",
  saveFail: "Bu qurilmada saqlab bo'lmadi.",
  wipe: "Saqlangan natijalarni o'chirish",
  wiped: "O'chirildi.",
  again: "Qaytadan boshlash",
  handoff: "Natijangizni o'chirib, sherigimga berish",
  handoffTitle: "Telefonni sherigingizga bering",
  handoffText: "Birinchi natija o'chirildi. Endi sherigingiz yolg'iz javob beradi va o'zini tanlaydi.",
  next2: "Umumiy rejani ko'rish",
  sharedTitle: "Ikkalangiz uchun reja",
  sharedLead: "Bu reja hech kimning natijasini oshkor qilmaydi va har bir juftlik uchun bir xil.",
  methodTitle: "Manbalar va usul",
  method: [
    "Jinsiy funksiya savollari shu ilova uchun yozilgan. Ular IIEF, FSFI yoki PEDT matnlari emas, shuning uchun bu shkalalarning chegaraviy ballari qo'llanmaydi.",
    "Har bir sohada ikkita savol bor. Ball savollar o'rtachasining 0–100 ga aylantirilganidir. 75 va undan yuqori: yaxshi, 50–74: o'rtacha, 50 dan past: e'tibor kerak. Bu chegaralar empirik emas, faqat tasviriy.",
    "PHQ-2 va GAD-2 ochiq foydalanishdagi skrining vositalaridir, chegara 3 ball. O'zbekcha matni validatsiya qilinmagan.",
    "Dalil darajasi har bir tavsiyada ko'rsatilgan. Tadqiqotlar PubMed orqali topilgan. Natijalarni O'zbekiston aholisiga ko'chirishda ehtiyot bo'lish kerak."
  ],
  dataTitle: "Maxfiylik",
  data: "Ilova hech narsani serverga yubormaydi va statistika yig'maydi. Saqlash tugmasini bossangizgina ball va sana shu qurilmada qoladi. Zo'ravonlik haqidagi javob hech qachon saqlanmaydi.",
  refsTitle: "Adabiyotlar",
  backHome: "Boshiga qaytish",
  backResult: "Natijaga qaytish",
  flagsQ: "Quyidagi belgilardan birortasi bormi?",
  emergency: "Tez yordam: 103. Ishonch telefoni: 1003.",
  sexM: "Erkak", sexF: "Ayol",
  tobaccoWhat: { cig: "sigaret yoki vape", nos: "nos", both: "sigaret va nos" },
  stageWhat: { peri: "menopauzaga yaqin davr", meno: "menopauza", postpartum: "tug'ruqdan keyingi davr" }
};

/* ---- apostroflarni to'g'rilash ---- */
function uzFix(s) {
  return s.replace(/([oOgG])'/g, "$1\u2018").replace(/'/g, "\u2019");
}
function deepFix(o) {
  if (typeof o === "string") return uzFix(o);
  if (Array.isArray(o)) return o.map(x => deepFix(x));
  if (o && typeof o === "object") {
    const r = {};
    for (const k of Object.keys(o)) r[k] = (k === "refs" || k === "id") ? o[k] : deepFix(o[k]);
    return r;
  }
  return o;
}

const TEXT = {
  SCALES: deepFix(SCALES), DOMAINS: deepFix(DOMAINS), CONTEXT_Q: deepFix(CONTEXT_Q), MOOD_Q: deepFix(MOOD_Q),
  LIFE_Q: deepFix(LIFE_Q), SAFETY_Q: deepFix(SAFETY_Q), URGENT: deepFix(URGENT), WHY: deepFix(WHY),
  GRADES: deepFix(GRADES), ADVICE: deepFix(ADVICE), SHARED_PLAN: deepFix(SHARED_PLAN), UI: deepFix(UI),
  FLAG_Q: deepFix(FLAG_Q), REFS
};

if (typeof module !== "undefined") module.exports = { TEXT };
