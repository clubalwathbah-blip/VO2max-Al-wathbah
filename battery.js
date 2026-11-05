/* Batterie de tests Al-Wathba — module (s'appuie sur VO2CORE) */
(function () {
'use strict';
var K = window.VO2CORE, C = K.C, $ = K.$, $$ = K.$$, esc = K.esc, T = K.T, R = K.R, F = K.F;
function L() { return K.lang(); }
function tv(v) { return L() === 'fr' ? v[1] : v[0]; }
function DB() { return K.db(); }

/* ---------------- i18n ---------------- */
Object.assign(K.D, {
  bt_sys: ['الأنظمة', 'Filières'], AER: ['هوائي', 'Aérobie'], LAC: ['لاكتيكي', 'Lactique'], ALA: ['لالاكتيكي', 'Alactique'], END: ['تحمّل القوة', 'Endurance de force'], MAX: ['القوة القصوى', 'Force max'], POW: ['القدرة', 'Puissance'], FLX: ['المرونة', 'Souplesse'],
  water: ['🏊 في الماء', '🏊 Dans l’eau'], land: ['🏋 خارج الماء', '🏋 Hors de l’eau'],
  campaign: ['الحملة', 'Campagne'], cat: ['الفئة', 'Catégorie'], allCats: ['كل الفئات', 'Toutes catégories'], allGroups: ['كل الأفواج', 'Tous les groupes'],
  entry: ['📝 إدخال جماعي', '📝 Saisie de groupe'], report: ['📋 تقرير الفئة', '📋 Rapport de catégorie'], chooseTest: ['اختار الاختبار', 'Choisir le test'],
  saveAll: ['حفظ الكل', 'Tout enregistrer'], savedN: ['نتيجة تسجّلت', 'résultats enregistrés'], nothing: ['ما كاين حتى نتيجة', 'Aucun résultat'],
  radar: ['ملف السباح', 'Profil du nageur'], cur: ['الحملة الحالية', 'Campagne actuelle'], prev: ['الحملة اللي فاتت', 'Campagne précédente'],
  score: ['النقطة', 'Score'], last: ['آخر نتيجة', 'Dernier'], before: ['قبل', 'Avant'], delta: ['التطور', 'Évolution'],
  notForCat: ['ماهوش مناسب لهاذ الفئة', 'Non adapté à cette catégorie'], scoreNote: ['النقطة /100 = المرتبة داخل نفس الفئة في النادي (50 = المعدل). تتحسب كي يكونو 3 سباحين على الأقل.', 'Score /100 = position dans la même catégorie au club (50 = moyenne). Dès 3 nageurs.'],
  catsT: ['🎂 الفئات العمرية', '🎂 Catégories d’âge'], catsP: ['سنوات الميلاد لموسم', 'Années de naissance pour la saison'], from: ['من', 'de'], to: ['حتى', 'à'], andYounger: ['وأصغر', 'et après'], andOlder: ['وأكبر', 'et avant'],
  season: ['الموسم', 'Saison'], noTests: ['ما كاين حتى نتيجة في هاذ الحملة.', 'Aucun résultat pour cette campagne.'], addRes: ['زيد نتيجة', 'Ajouter un résultat'],
  ball: ['وزن الكرة', 'Poids du ballon'], exercise: ['التمرين', 'Exercice'], best: ['الأحسن', 'Meilleur'], mean: ['المتوسط', 'Moyenne'], fi: ['مؤشر التعب', 'Indice de fatigue'], dec: ['نسبة الهبوط', 'Décrément'],
  relW: ['نسبة للوزن', 'Relatif au poids'], watts: ['القدرة (واط)', 'Puissance (W)'], needW: ['زيد الوزن في ملف السباح', 'Ajoutez le poids dans la fiche'],
  ofSwimmers: ['سباح', 'nageurs'], printReport: ['🖨 طباعة التقرير', '🖨 Imprimer le rapport'], resultsOf: ['نتائج', 'Résultats'],
  noSwCat: ['ما كاين حتى سباح في هاذي الفئة.', 'Aucun nageur dans cette catégorie.'], cats: ['الفئات', 'Catégories']
});

/* ---------------- catégories ---------------- */
var CATS = [['eco', 'École', 'مدارس'], ['pou', 'Poussins', 'كتاكيت'], ['ben', 'Benjamins', 'براعم'], ['min', 'Minimes', 'أصاغر'], ['cad', 'Cadets', 'أشبال'], ['jun', 'Juniors', 'أواسط'], ['sen', 'Seniors', 'أكابر']];
// âge de saison (année de début de saison − année de naissance) minimum par catégorie
var DEF_CAT = { eco: 0, pou: 9, ben: 10, min: 12, cad: 14, jun: 16, sen: 18 };
function seasonYear(d) { d = d ? new Date(d) : new Date(); return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; }
function catDef() { var s = (DB().settings || {}).btCats; return s && typeof s === 'object' ? Object.assign({}, DEF_CAT, s) : DEF_CAT; }
function catOf(sw, date) {
  if (!sw || !sw.dob) return null;
  var a = seasonYear(date) - new Date(sw.dob).getFullYear(), d = catDef(), c = 'eco';
  CATS.forEach(function (x) { if (a >= d[x[0]]) c = x[0]; });
  return c;
}
function catName(id) { var c = CATS.find(function (x) { return x[0] === id; }); return c ? (L() === 'fr' ? c[1] : c[2] + ' · ' + c[1]) : '—'; }
function yearsOf(id) { var d = catDef(), S = seasonYear(), i = CATS.findIndex(function (x) { return x[0] === id; }), lo = d[id], hi = i < CATS.length - 1 ? d[CATS[i + 1][0]] - 1 : null; return { born_to: S - lo, born_from: hi == null ? null : S - hi }; }
var CI = { eco: 0, pou: 1, ben: 2, min: 3, cad: 4, jun: 5, sen: 6 };
function from(c) { return Object.keys(CI).filter(function (k) { return CI[k] >= CI[c]; }); }
function upTo(c) { return Object.keys(CI).filter(function (k) { return CI[k] <= CI[c]; }); }

/* ---------------- campagnes ---------------- */
function campOf(date) { var d = new Date(date), m = d.getMonth(), S = seasonYear(date); return S + '-' + (m >= 8 ? 1 : m <= 3 ? 2 : 3); }
function campName(c) { var p = c.split('-'); return 'C' + p[1] + ' · ' + p[0] + '/' + String(+p[0] + 1).slice(2); }
function prevCamp(c) { var p = c.split('-'), S = +p[0], n = +p[1]; return n > 1 ? S + '-' + (n - 1) : (S - 1) + '-3'; }

/* ---------------- catalogue ---------------- */
var tm = function (k, l, hint) { return { k: k, l: l, t: 'time', hint: hint }; };
var nm = function (k, l, u, hint) { return { k: k, l: l, t: 'num', u: u, hint: hint }; };
var H = {
  touch: ['من الانطلاق حتى لمس الحائط', 'Du départ au toucher'], dist: ['المسافة الكلية بالمتر', 'Distance totale en mètres'],
  reps: ['عدد التكرارات الصحيحة', 'Répétitions correctes'], sec: ['بالثواني', 'En secondes'], cm: ['بالسنتيمتر', 'En centimètres'], m: ['بالمتر (مثلاً 4.35)', 'En mètres (ex. 4,35)'], kg: ['بالكيلوغرام', 'En kilogrammes']
};
function pace(dist, sec) { return dist && sec ? F(sec * 100 / dist, 1) + ' /100' : '—'; }
function timesStats(d, n) {
  var a = []; for (var i = 1; i <= n; i++) { var x = C.parseTime(d['r' + i]); if (x) a.push(x); }
  if (!a.length) return null;
  var best = Math.min.apply(null, a), mean = a.reduce(function (p, q) { return p + q; }, 0) / a.length;
  return { a: a, best: best, mean: mean, fi: a.length > 1 ? (a[a.length - 1] - a[0]) / a[0] * 100 : null, dec: (mean / best - 1) * 100 };
}
function repsInputs(n, l) { var o = []; for (var i = 1; i <= n; i++) o.push(tm('r' + i, l + ' ' + i, H.touch)); return o; }
var TESTS = [
  // ---- aérobie
  { id: 't12', sys: 'AER', w: 1, cats: upTo('ben'), name: ['سباحة 12 دقيقة', 'Nage 12 minutes'], unit: 'm', better: 'high',
    inputs: [nm('dist', tv(['المسافة', 'Distance']), 'm', H.dist)], calc: function (d) { var x = C.num(d.dist); return x ? { v: x, disp: x + ' m', extra: pace(x, 720) } : null; },
    g: ['يسبح <b>12 دقيقة بلا توقف</b> بالإيقاع اللي يقدر يحافظ عليه، أي سباحة (الحرة أحسن). المدرب يعدّ الطولات ويكمّل المتر الأخير. <b>النتيجة:</b> المسافة الكلية.', 'Nager <b>12 min sans arrêt</b>, allure régulière. Compter les longueurs + mètres de la dernière. <b>Résultat :</b> distance totale.'] },
  { id: 't20', sys: 'AER', w: 1, cats: ['ben', 'min'], name: ['سباحة 20 دقيقة', 'Nage 20 minutes'], unit: 'm', better: 'high',
    inputs: [nm('dist', tv(['المسافة', 'Distance']), 'm', H.dist)], calc: function (d) { var x = C.num(d.dist); return x ? { v: x, disp: x + ' m', extra: pace(x, 1200) } : null; },
    g: ['يسبح <b>20 دقيقة حرة بلا توقف</b>، إيقاع منتظم. <b>النتيجة:</b> المسافة الكلية. منها تتحسب سرعة العتبة.', '<b>20 min</b> crawl sans arrêt. <b>Résultat :</b> distance.'] },
  { id: 't30', sys: 'AER', w: 1, cats: from('min'), name: ['T30 (30 دقيقة)', 'T30 (30 minutes)'], unit: 'm', better: 'high',
    inputs: [nm('dist', tv(['المسافة', 'Distance']), 'm', H.dist)], calc: function (d) { var x = C.num(d.dist); return x ? { v: x, disp: x + ' m', extra: 'T30 ' + pace(x, 1800) } : null; },
    g: ['إحماء 600 م. يسبح <b>30 دقيقة حرة</b> بأحسن إيقاع منتظم يقدر عليه. <b>النتيجة:</b> المسافة. سرعة T30 = سرعة العتبة اللاهوائية.', 'Échauffement 600 m. <b>30 min</b> crawl, allure maximale régulière. <b>Résultat :</b> distance (allure T30 = seuil).'] },
  { id: 'css', sys: 'AER', w: 1, cats: from('ben'), name: ['CSS (400 + 200)', 'CSS (400 + 200)'], unit: '/100', better: 'low',
    inputs: [tm('t400', tv(['زمن 400 م', 'Temps 400 m']), H.touch), tm('t200', tv(['زمن 200 م', 'Temps 200 m']), H.touch)],
    calc: function (d) { var c = C.css(400, C.parseTime(d.t400), 200, C.parseTime(d.t200)); return c ? { v: c.pace, disp: F(c.pace, 1) + ' /100', extra: 'D′ ' + R(c.dprime, 0) + ' m' } : null; },
    g: ['400 م بأقصى جهد ← راحة كاملة 10–15 د ← 200 م بأقصى جهد. <b>النتيجة:</b> سرعة CSS في 100 م (أقل = أحسن).', '400 m max ← 10–15 min de récup ← 200 m max. <b>Résultat :</b> allure CSS /100 m.'] },
  { id: 'f800', sys: 'AER', w: 1, cats: from('min'), name: ['800 م حرة', '800 m NL'], unit: 's', better: 'low',
    inputs: [tm('t', tv(['الزمن', 'Temps']), H.touch)], calc: function (d) { var x = C.parseTime(d.t); return x ? { v: x, disp: F(x, 2), extra: pace(800, x) } : null; },
    g: ['800 م حرة بأقصى جهد متوازن، الانطلاق من الماء. <b>النتيجة:</b> الزمن.', '800 m crawl à fond, départ dans l’eau. <b>Résultat :</b> temps.'] },
  { id: 'cs3', sys: 'AER', w: 1, cats: from('ben'), name: ['3 دقايق بأقصى جهد (السرعة الحرجة)', '3 min all-out (vitesse critique)'], unit: 'm/s', better: 'high',
    inputs: [nm('d150', tv(['المسافة في 2:30', 'Distance à 2:30']), 'm', ['بالمتر (علامة كل 5 م)', 'En mètres (repère tous les 5 m)']), nm('d180', tv(['المسافة في 3:00', 'Distance à 3:00']), 'm', ['المسافة الكلية بالمتر', 'Distance totale en mètres'])],
    calc: function (d) { var a = C.num(d.d150), b = C.num(d.d180); if (!a || !b || b <= a) return null; var cs = (b - a) / 30, dp = b - cs * 180; return { v: cs, disp: R(cs, 2) + ' m/s', extra: 'CS ' + F(100 / cs, 1) + ' /100 · D′ ' + Math.round(dp) + ' m', cs: cs }; },
    g: ['إحماء 15–20 د. انطلاق بالدفع من الحائط، ويسبح <b>3 دقايق كاملين بأقصى جهد من البداية</b>، بلا ما يقسّم المجهود (السرعة تطيح وحدها). المدرب يعلّم <b>المسافة في 2:30</b> و <b>في 3:00</b> (حط علامات كل 5 م على الحافة). <b>السرعة الحرجة</b> = متوسط السرعة في آخر 30 ث = حد الجهد الهوائي. <b>D′</b> = الاحتياطي اللاهوائي بالمتر. منها تخرج مناطق التدريب.', 'Échauffement 15–20 min. Départ poussé, <b>3 min à fond dès le départ</b>, sans gestion d’allure. Noter la <b>distance à 2:30</b> et <b>à 3:00</b> (repères tous les 5 m). <b>Vitesse critique</b> = vitesse moyenne des 30 dernières s. <b>D′</b> = réserve anaérobie (m). Zones d’entraînement calculées.'] },
  // ---- lactique
  { id: 'm100', sys: 'LAC', w: 1, cats: from('ben'), name: ['100 م بأقصى جهد', '100 m maximal'], unit: 's', better: 'low',
    inputs: [tm('t', tv(['الزمن', 'Temps']), H.touch)], calc: function (d) { var x = C.parseTime(d.t); return x ? { v: x, disp: F(x, 2), extra: pace(100, x) } : null; },
    g: ['إحماء كامل. 100 م حرة <b>بأقصى سرعة</b> من المكعب. <b>النتيجة:</b> الزمن.', 'Échauffement complet. 100 m crawl <b>à fond</b> du plot. <b>Résultat :</b> temps.'] },
  { id: 'm200', sys: 'LAC', w: 1, cats: from('min'), name: ['200 م بأقصى جهد', '200 m maximal'], unit: 's', better: 'low',
    inputs: [tm('t', tv(['الزمن', 'Temps']), H.touch)], calc: function (d) { var x = C.parseTime(d.t); return x ? { v: x, disp: F(x, 2), extra: pace(200, x) } : null; },
    g: ['200 م حرة <b>بأقصى جهد</b> من المكعب. <b>النتيجة:</b> الزمن.', '200 m crawl <b>à fond</b>. <b>Résultat :</b> temps.'] },
  { id: 'tol', sys: 'LAC', w: 1, cats: from('min'), name: ['4×50 كل 1:00 (تحمّل لاكتيكي)', '4×50 départ 1:00 (tolérance)'], unit: 's', better: 'low',
    inputs: repsInputs(4, '50'), calc: function (d) { var s = timesStats(d, 4); return s && s.a.length === 4 ? { v: s.mean, disp: F(s.mean, 2), extra: T('fi') + ' ' + R(s.fi, 1) + '%' } : null; },
    g: ['4×50 حرة <b>بأقصى جهد</b>، كل 50 تبدا كل دقيقة (الراحة هي الباقي). <b>اكتب زمن كل 50</b>. النتيجة: المتوسط، ومؤشر التعب = قدّاش طاح الأخير على الأول.', '4×50 <b>à fond</b>, départ toutes les 1:00. Noter chaque temps. Moyenne + indice de fatigue.'] },
  // ---- alactique
  { id: 's15', sys: 'ALA', w: 1, cats: from('pou'), name: ['15 م سرعة (من الغطس)', '15 m sprint (plongé)'], unit: 's', better: 'low',
    inputs: [tm('t', tv(['الزمن', 'Temps']), ['من الإشارة حتى يمرّ الراس خط 15 م', 'Du signal au passage de la tête à 15 m'])], calc: function (d) { var x = C.parseTime(d.t); return x ? { v: x, disp: F(x, 2), extra: R(15 / x, 2) + ' m/s' } : null; },
    g: ['غطس من المكعب، يسبح <b>بأقصى سرعة</b>. الكرونو يبدا مع الإشارة ويحبس كي يمرّ <b>الراس</b> خط 15 م (علامة على الحافة). 2 محاولات، راحة 3 د، ناخذو الأحسن.', 'Plongé, <b>vitesse max</b>. Chrono du signal au passage de la <b>tête</b> à 15 m. 2 essais, garder le meilleur.'] },
  { id: 's25', sys: 'ALA', w: 1, cats: CATS.map(function (c) { return c[0]; }), name: ['25 م سرعة', '25 m sprint'], unit: 's', better: 'low',
    inputs: [tm('t', tv(['الزمن', 'Temps']), H.touch), nm('st', tv(['عدد الضربات', 'Nombre de coups de bras']), '', ['اختياري: يحسب كل يد', 'Facultatif : chaque bras compte'])],
    calc: function (d) { var x = C.parseTime(d.t), st = C.num(d.st); return x ? { v: x, disp: F(x, 2), extra: R(25 / x, 2) + ' m/s' + (st ? ' · ' + R(25 / st, 2) + ' m/' + tv(['ضربة', 'coup']) : '') } : null; },
    g: ['25 م حرة <b>بأقصى سرعة</b> (الصغار من الحائط، الكبار من المكعب، ودايماً نفس الطريقة). 2 محاولات، ناخذو الأحسن. اختياري: عدد الضربات، منو تتحسب المسافة في كل ضربة.', '25 m <b>vitesse max</b> (même départ à chaque fois). 2 essais. Facultatif : nombre de coups.'] },
  { id: 'rs', sys: 'ALA', w: 1, cats: from('ben'), name: ['6×25 كل 1:00 (تكرار السرعة)', '6×25 départ 1:00 (sprints répétés)'], unit: 's', better: 'low',
    inputs: repsInputs(6, '25'), calc: function (d) { var s = timesStats(d, 6); return s && s.a.length >= 4 ? { v: s.best, disp: F(s.best, 2), extra: T('mean') + ' ' + F(s.mean, 2) + ' · ' + T('dec') + ' ' + R(s.dec, 1) + '%' } : null; },
    g: ['6×25 <b>بأقصى سرعة</b>، كل 25 تبدا كل دقيقة. <b>اكتب كل زمن</b>. النتيجة: الأحسن، ونسبة الهبوط (أقل = يسترجع أحسن).', '6×25 <b>vitesse max</b>, départ 1:00. Noter chaque temps. Meilleur + décrément.'] },
  { id: 'lv', sys: 'ALA', w: 1, cats: from('min'), name: ['قوة-سرعة في الماء (Semi-tethered)', 'Charge-vitesse en semi-tethered'], unit: 'm/s', better: 'high',
    inputs: [nm('l1', tv(['الحمل 1', 'Charge 1']), 'kg', ['مثلاً 1', 'ex. 1']), tm('t1', tv(['زمن 10 م', 'Temps 10 m']), ['بالحمل 1', 'avec charge 1']), nm('l2', tv(['الحمل 2', 'Charge 2']), 'kg', ['مثلاً 5', 'ex. 5']), tm('t2', tv(['زمن 10 م', 'Temps 10 m']), ['بالحمل 2', 'avec charge 2']), nm('l3', tv(['الحمل 3', 'Charge 3']), 'kg', ['مثلاً 9', 'ex. 9']), tm('t3', tv(['زمن 10 م', 'Temps 10 m']), ['بالحمل 3', 'avec charge 3'])],
    calc: function (d) {
      var P = []; [1, 2, 3].forEach(function (i) { var l = C.num(d['l' + i]), t = C.parseTime(d['t' + i]); if (l != null && t) P.push([l, 10 / t]); });
      if (P.length < 2) return null;
      var n = P.length, mx = P.reduce(function (a, p) { return a + p[0]; }, 0) / n, my = P.reduce(function (a, p) { return a + p[1]; }, 0) / n, sxy = 0, sxx = 0;
      P.forEach(function (p) { sxy += (p[0] - mx) * (p[1] - my); sxx += (p[0] - mx) * (p[0] - mx); });
      if (!sxx) return null; var b = sxy / sxx, a = my - b * mx; if (b >= 0) return null;
      return { v: a, disp: R(a, 2) + ' m/s', extra: 'V0 ' + R(a, 2) + ' m/s · L0 ' + R(-a / b, 1) + ' kg · ' + (L() === 'fr' ? 'pente ' : 'الميل ') + R(b, 3) };
    },
    g: ['حزام في الوسط مربوط بخيط يمرّ على <b>بكرة</b> فوق المكعب، وفي اللخر أوزان. السباح يسبح <b>10 م بأقصى سرعة</b> (بعد 5 م انطلاق في الماء) بـ <b>3 أحمال</b> (مثلاً 1، 5، 9 كغ للذكور · 1، 3، 5 كغ للإناث)، راحة 3 د. الزمن بالكرونو ولا بالفيديو. <b>V0</b> = السرعة القصوى النظرية (السرعة)، <b>L0</b> = الحمل الأقصى النظري (القوة في الماء). يستعمل للمتابعة مع الوقت.', 'Ceinture reliée à une <b>poulie</b> et des charges. <b>10 m à fond</b> (après 5 m lancés) avec <b>3 charges</b> (ex. 1, 5, 9 kg garçons · 1, 3, 5 kg filles), récup 3 min. <b>V0</b> = vitesse max théorique, <b>L0</b> = charge max théorique. Pour le suivi dans le temps.'] },
  // ---- endurance de force
  { id: 'push', sys: 'END', w: 0, cats: CATS.map(function (c) { return c[0]; }), name: ['Pompes في 30 ث', 'Pompes en 30 s'], unit: 'rep', better: 'high',
    inputs: [nm('n', tv(['العدد', 'Nombre']), 'rep', H.reps)], calc: function (d) { var x = C.num(d.n); return x != null ? { v: x, disp: x } : null; },
    g: ['الجسم مستقيم، الصدر يهبط حتى قبضة يد من الأرض. <b>غير الصحيحة تتحسب</b>. الصغار والبنات ينجمو يديروها على الركبتين (دايماً نفس الطريقة).', 'Corps gainé, poitrine à un poing du sol. Seules les répétitions correctes comptent.'] },
  { id: 'plank', sys: 'END', w: 0, cats: CATS.map(function (c) { return c[0]; }), name: ['Gainage (planche)', 'Gainage (planche)'], unit: 's', better: 'high',
    inputs: [nm('s', tv(['الوقت', 'Durée']), 's', H.sec)], calc: function (d) { var x = C.num(d.s); return x != null ? { v: x, disp: x + ' s' } : null; },
    g: ['على المرفقين، الجسم خط مستقيم من الراس للكعب. يتوقف الكرونو كي يطيح الحوض ولا يطلع (تنبيه واحد).', 'Sur les avant-bras, corps aligné. Arrêt quand le bassin chute (1 avertissement).'] },
  { id: 'situp', sys: 'END', w: 0, cats: CATS.map(function (c) { return c[0]; }), name: ['Abdos في 30 ث', 'Abdos en 30 s'], unit: 'rep', better: 'high',
    inputs: [nm('n', tv(['العدد', 'Nombre']), 'rep', H.reps)], calc: function (d) { var x = C.num(d.n); return x != null ? { v: x, disp: x } : null; },
    g: ['راقد على ظهرو، الركبتين مطويين، اليدين على الصدر. يطلع حتى المرفقين يمسّو الركبتين.', 'Dos au sol, genoux fléchis, mains sur la poitrine ; coudes aux genoux.'] },
  { id: 'hang', sys: 'END', w: 0, cats: upTo('ben'), name: ['التعلّق بذراعين مطويين', 'Suspension bras fléchis'], unit: 's', better: 'high',
    inputs: [nm('s', tv(['الوقت', 'Durée']), 's', H.sec)], calc: function (d) { var x = C.num(d.s); return x != null ? { v: x, disp: x + ' s' } : null; },
    g: ['يتعلّق في البار، الذقن فوق البار. الكرونو يتوقف كي الذقن يهبط تحت البار.', 'Menton au-dessus de la barre ; arrêt quand il passe dessous.'] },
  { id: 'pull', sys: 'END', w: 0, cats: from('min'), name: ['Tractions (أقصى عدد)', 'Tractions (max)'], unit: 'rep', better: 'high',
    inputs: [nm('n', tv(['العدد', 'Nombre']), 'rep', H.reps)], calc: function (d) { var x = C.num(d.n); return x != null ? { v: x, disp: x } : null; },
    g: ['الذراعين ممدودين كامل في الأسفل، الذقن فوق البار في الأعلى، بلا تأرجح.', 'Bras tendus en bas, menton au-dessus de la barre, sans élan.'] },
  { id: 'sqj', sys: 'END', w: 0, cats: from('ben'), name: ['Squat jumps في 30 ث', 'Squat jumps en 30 s'], unit: 'rep', better: 'high',
    inputs: [nm('n', tv(['العدد', 'Nombre']), 'rep', H.reps)], calc: function (d) { var x = C.num(d.n); return x != null ? { v: x, disp: x } : null; },
    g: ['ينزل حتى الفخذين أفقيين، ويقفز. كل قفزة كاملة تتحسب.', 'Descente cuisses parallèles puis saut ; chaque saut complet compte.'] },
  // ---- force max
  { id: 'grip', sys: 'MAX', w: 0, cats: CATS.map(function (c) { return c[0]; }), name: ['Handgrip (قوة القبضة)', 'Handgrip'], unit: 'kg', better: 'high',
    inputs: [nm('r', tv(['اليد اليمنى', 'Main droite']), 'kg', ['الأحسن من 2 محاولات', 'Meilleur de 2 essais']), nm('l', tv(['اليد اليسرى', 'Main gauche']), 'kg', ['الأحسن من 2 محاولات', 'Meilleur de 2 essais'])],
    calc: function (d, s) { var a = C.num(d.r), b = C.num(d.l); if (!a && !b) return null; var m = Math.max(a || 0, b || 0), w = C.num(s && s.weight); return { v: m, disp: m + ' kg', extra: w ? T('relW') + ' ' + R(m / w, 2) : '' }; },
    g: ['واقف، الذراع ممدود حدا الجسم. يضغط <b>بكل قوتو 3 ثواني</b>. 2 محاولات لكل يد، ناخذو الأحسن.', 'Debout, bras le long du corps, serrer <b>3 s</b> au max. 2 essais par main.'] },
  { id: 'rm1', sys: 'MAX', w: 0, cats: from('jun'), name: ['1RM مقدّر (Brzycki)', '1RM estimé (Brzycki)'], unit: 'kg', better: 'high',
    inputs: [{ k: 'ex', l: tv(['التمرين', 'Exercice']), t: 'sel', opts: [['squat', 'Squat'], ['bench', 'Développé couché'], ['pull', 'Tirage / Rowing']] }, nm('load', tv(['الحمل', 'Charge']), 'kg', H.kg), nm('reps', tv(['عدد التكرارات', 'Répétitions']), 'rep', ['بين 3 و 10، حتى العجز التقني', 'Entre 3 et 10, jusqu’à l’échec technique'])],
    calc: function (d, s) { var l = C.num(d.load), r = C.num(d.reps); if (!l || !r || r > 12) return null; var rm = l * 36 / (37 - r), w = C.num(s && s.weight); return { v: rm, disp: R(rm, 1) + ' kg', extra: (d.ex || '') + (w ? ' · ' + T('relW') + ' ' + R(rm / w, 2) : '') }; },
    g: ['<b>غير للكبار (Juniors / Seniors)</b> مع تقنية صحيحة. إحماء متدرّج، ومن بعد حمل يقدر يرفعو بين 3 و 10 مرات. <b>اكتب الحمل وعدد التكرارات</b>، التطبيق يحسب 1RM (ما يرفعش الحمل الأقصى).', '<b>Juniors / Seniors</b> uniquement. Charge soulevée 3 à 10 fois ; 1RM calculé sans test maximal.'] },
  // ---- puissance
  { id: 'sargent', sys: 'POW', w: 0, cats: CATS.map(function (c) { return c[0]; }), name: ['القفز العمودي (Sargent)', 'Détente verticale (Sargent)'], unit: 'cm', better: 'high',
    inputs: [nm('reach', tv(['علامة الوقوف', 'Marque debout']), 'cm', ['واقف حدا الحائط، الذراع ممدود لفوق', 'Debout, bras tendu']), nm('jump', tv(['أعلى علامة في القفز', 'Marque du saut']), 'cm', ['الأحسن من 3 قفزات', 'Meilleur de 3 sauts'])],
    calc: function (d, s) { var a = C.num(d.reach), b = C.num(d.jump); if (!a || !b || b <= a) return null; var h = b - a, w = C.num(s && s.weight); return { v: h, disp: R(h, 1) + ' cm', extra: w ? T('watts') + ' ' + Math.round(Math.sqrt(4.9) * w * Math.sqrt(h / 100) * 9.81) : '' }; },
    g: ['أصابع مبلولة بالطباشير. <b>1)</b> واقف حدا الحائط، يمدّ الذراع ويحط علامة. <b>2)</b> يقفز من بلاصتو (بلا خطوة) ويحط علامة أعلى ما يقدر. 3 قفزات. <b>النتيجة = الفرق بين العلامتين</b> (cm).', 'Doigts à la craie : marque debout bras tendu, puis saut sur place. 3 sauts. <b>Résultat = différence</b>.'] },
  { id: 'slj', sys: 'POW', w: 0, cats: CATS.map(function (c) { return c[0]; }), name: ['القفز الطويل بلا ركض', 'Saut en longueur sans élan'], unit: 'cm', better: 'high',
    inputs: [nm('d', tv(['المسافة', 'Distance']), 'cm', ['من الخط حتى الكعب الأقرب · الأحسن من 3', 'Ligne → talon le plus proche · meilleur de 3'])], calc: function (d) { var x = C.num(d.d); return x ? { v: x, disp: x + ' cm' } : null; },
    g: ['الرجلين مع بعض ورا الخط، يقفز بالجوج. نقيسو <b>من الخط حتى الكعب الأقرب</b>. 3 محاولات، ناخذو الأحسن.', 'Pieds joints derrière la ligne, mesure <b>jusqu’au talon le plus proche</b>. 3 essais.'] },
  { id: 'mbc', sys: 'POW', w: 0, cats: from('pou'), name: ['رمي الكرة الطبية من الصدر', 'Lancer médecine-ball poitrine'], unit: 'm', better: 'high',
    inputs: [nm('d', tv(['المسافة', 'Distance']), 'm', H.m), nm('kg', tv(['وزن الكرة', 'Poids du ballon']), 'kg', ['1 كغ للصغار · 2 كغ Minimes/Cadets · 3 كغ للكبار', '1 kg jeunes · 2 kg Min/Cad · 3 kg grands'])],
    calc: function (d) { var x = C.num(d.d); return x ? { v: x, disp: R(x, 2) + ' m', extra: d.kg ? d.kg + ' kg' : '' } : null; },
    g: ['قاعد، الظهر للحائط، يرمي الكرة من الصدر بالجوج يدين. نقيسو حتى بلاصة الطيحة الأولى. 3 محاولات. <b>دايماً نفس وزن الكرة</b> لنفس الفئة.', 'Assis dos au mur, lancer à deux mains depuis la poitrine. 3 essais. Même ballon pour la catégorie.'] },
  { id: 'mbo', sys: 'POW', w: 0, cats: from('min'), name: ['رمي الكرة من فوق الراس للخلف', 'Lancer arrière par-dessus la tête'], unit: 'm', better: 'high',
    inputs: [nm('d', tv(['المسافة', 'Distance']), 'm', H.m), nm('kg', tv(['وزن الكرة', 'Poids du ballon']), 'kg', ['2 أو 3 كغ', '2 ou 3 kg'])],
    calc: function (d) { var x = C.num(d.d); return x ? { v: x, disp: R(x, 2) + ' m', extra: d.kg ? d.kg + ' kg' : '' } : null; },
    g: ['واقف، الظهر لجهة الرمي، ينزل ويرمي الكرة من فوق الراس للخلف بكل الجسم. 3 محاولات.', 'Dos à la zone, flexion puis lancer arrière par-dessus la tête. 3 essais.'] },
  // ---- souplesse
  { id: 'sit', sys: 'FLX', w: 0, cats: CATS.map(function (c) { return c[0]; }), name: ['Sit and reach', 'Flexion avant (sit & reach)'], unit: 'cm', better: 'high',
    inputs: [nm('cm', tv(['النتيجة', 'Résultat']), 'cm', ['+ بعد أصابع الرجلين · − قبلها', '+ au-delà des orteils · − avant'])], calc: function (d) { var x = C.num(d.cm); return x != null ? { v: x, disp: (x > 0 ? '+' : '') + x + ' cm' } : null; },
    g: ['قاعد، الرجلين ممدودين والركبتين ما يتطواوش. يمدّ اليدين للقدام بالراحة ويبقى 2 ثواني. 0 = أصابع الرجلين.', 'Assis jambes tendues, se pencher lentement, tenir 2 s. 0 = orteils.'] }
];
var SYS = ['AER', 'LAC', 'ALA', 'END', 'MAX', 'POW'];
function testById(id) { if (String(id).indexOf('p:') === 0) { var p = protoById(id.slice(2)); return p ? protoTest(p) : null; } return TESTS.find(function (t) { return t.id === id; }); }
function testsForCat(c, withArch) { return TESTS.filter(function (t) { return t.cats.indexOf(c) >= 0; }).concat(protos(withArch).map(protoTest).filter(function (t) { return t.cats.indexOf(c) >= 0; })); }

/* ---------------- données ---------------- */
function recs() { return DB().tests.filter(function (t) { return t.type === 'bt'; }); }
function recsOf(sid) { return recs().filter(function (t) { return t.swimmerId === sid; }); }
// dernier résultat (calculé) d'un nageur pour un test et une campagne
function result(s, tid, camp) {
  var t = testById(tid), best = null; if (!t) return null;
  recsOf(s.id).forEach(function (r) { if (r.data.test !== tid || r.data.retest || (camp && campOf(r.date) !== camp)) return; if (!best || r.date > best.date || (r.date === best.date && (r.updated || '') > (best.updated || ''))) best = r; });
  if (!best) return null;
  var c = t.calc(best.data || {}, s); return c ? Object.assign({ rec: best }, c) : null;
}
// score 0–100 dans la catégorie (même sexe si ≥3, sinon mixte)
function score(s, tid, camp, mode) {
  var me = result(s, tid, camp); if (!me) return null;
  var cat = catOf(s, me.rec.date), t = testById(tid);
  var pool = DB().swimmers.filter(function (x) { return catOf(x, me.rec.date) === cat; });
  if (mode === 'mat') { var mm = matOf(s, me.rec.date); if (!mm) return null; pool = DB().swimmers.filter(function (x) { var q = matOf(x, me.rec.date); return q && Math.abs(q.mo - mm.mo) <= 1 && (x.sex || 'M') === (s.sex || 'M'); }); }
  var same = pool.filter(function (x) { return (x.sex || 'M') === (s.sex || 'M'); });
  var sg = t.proto && me.rec.data.proto ? pSig(me.rec.data.proto) : null;
  var vals = function (list) { return list.map(function (x) { var r = result(x, tid, camp); return r && (!sg || (r.rec.data.proto && pSig(r.rec.data.proto) === sg)) ? r.v : null; }).filter(function (v) { return v != null; }); };
  var v = vals(same); if (v.length < 3 && mode !== 'mat') v = vals(pool);
  if (v.length < 3) return null;
  var st = C.stats(v); if (!st.sd) return 50;
  var z = (me.v - st.m) / st.sd; if (t.better === 'low') z = -z;
  return Math.max(0, Math.min(100, Math.round(50 + 15 * z)));
}
function sysScores(s, camp, mode) {
  var cat = catOf(s), o = {};
  SYS.forEach(function (k) { var a = testsForCat(cat).filter(function (t) { return t.sys === k; }).map(function (t) { return score(s, t.id, camp, mode); }).filter(function (x) { return x != null; }); o[k] = a.length ? Math.round(a.reduce(function (p, q) { return p + q; }, 0) / a.length) : null; });
  return o;
}
function camps() { var set = {}; set[campOf(new Date())] = 1; recs().forEach(function (r) { set[campOf(r.date)] = 1; }); return Object.keys(set).sort().reverse(); }
var ST = { camp: null, cat: '', group: '', test: '', cond: { pool: '25', timing: 'hand', warm: true }, retest: false };
function curCamp() { return ST.camp || campOf(new Date()); }
/* ================= protocoles des entraîneurs ================= */
Object.assign(K.D, {
  protos: ['🧩 البروتوكولات', '🧩 Protocoles'], protoNew: ['＋ بروتوكول جديد', '＋ Nouveau protocole'], protoOf: ['بروتوكولات المدربين', 'Protocoles des entraîneurs'],
  pName: ['اسم البروتوكول', 'Nom du protocole'], pSys: ['النظام', 'Filière'], pCats: ['الفئات', 'Catégories'], pSets: ['عدد السلاسل', 'Séries'], pReps: ['التكرارات في كل سلسلة', 'Répétitions par série'],
  pAtt: ['المحاولات في كل سلسلة', 'Essais par série'], pDist: ['المسافة (م)', 'Distance (m)'], pStroke: ['السباحة', 'Nage'], pStart: ['الانطلاق', 'Départ'], pRestRep: ['الراحة بين التكرارات (ث)', 'Récup entre répétitions (s)'],
  pRestSet: ['الراحة بين السلاسل (ث)', 'Récup entre séries (s)'], pInt: ['الشدة', 'Intensité'], pHr: ['نسجّل النبض بعد كل سلسلة', 'Noter la FC après chaque série'], pEx: ['التمرين', 'Exercice'],
  pMode: ['نوع القياس', 'Type de mesure'], pWork: ['وقت العمل (ث)', 'Temps de travail (s)'], pUnit: ['الوحدة', 'Unité'], pBetter: ['الأحسن هو', 'Le meilleur est'], pAgg: ['النتيجة', 'Résultat retenu'], pFps: ['سرعة الفيديو (صورة/ث)', 'Vidéo (images/s)'],
  pNote: ['تعليمات للمدرب', 'Consignes'], pPresets: ['قوالب جاهزة', 'Modèles prêts'], pBy: ['بواسطة', 'par'], pArchive: ['أرشفة', 'Archiver'], pArchived: ['مؤرشف', 'Archivé'], pRestore: ['استرجاع', 'Restaurer'],
  pEditWarn: ['هذا البروتوكول عندو نتائج. كي تبدّل السلاسل/التكرارات/الراحة تولّي <b>نسخة جديدة</b>: النتائج القديمة تبقى بالبروتوكول القديم وما تتقارنش مع الجديدة.', 'Ce protocole a des résultats : modifier sa structure crée une <b>nouvelle version</b> ; les anciens résultats ne seront pas comparés à la nouvelle.'],
  pRmWarn: ['⚠ اختبار بالأوزان: غير من Cadets وفوق، بتقنية صحيحة وحمل يترفع 3–10 مرات (ماشي الحمل الأقصى).', '⚠ Test avec charges : à partir des Cadets, technique correcte, charge 3–10 RM (pas de maximal).'],
  m_count: ['عدد التكرارات (في وقت ولا أقصى عدد)', 'Nombre de répétitions'], m_measure: ['قياس (مسافة، وقت، كغ…)', 'Mesure (distance, durée, kg…)'], m_rm: ['حمل × تكرارات ← 1RM مقدّر', 'Charge × répétitions → 1RM estimé'], m_jump: ['قفز بالفيديو (عدد الصور)', 'Saut vidéo (nombre d’images)'],
  a_best: ['الأحسن', 'Meilleur'], a_mean: ['المتوسط', 'Moyenne'], a_total: ['المجموع', 'Total'], b_high: ['الأكبر', 'Le plus grand'], b_low: ['الأصغر', 'Le plus petit'],
  maxEff: ['أقصى جهد', 'Effort maximal'], attP: ['محاولات', 'essais'], set: ['سلسلة', 'Série'], rep: ['تكرار', 'Rép.'], att: ['محاولة', 'Essai'], hrAfter: ['نبض', 'FC'], rpe: ['التعب المحسوس (1–10)', 'Effort perçu (1–10)'],
  cond: ['ظروف الاختبار', 'Conditions du test'], cPool: ['المسبح', 'Bassin'], cTiming: ['التوقيت', 'Chronométrage'], tHand: ['كرونو يدوي', 'Manuel'], tElec: ['إلكتروني', 'Électronique'], tVideo: ['فيديو', 'Vidéo'],
  cWarm: ['نفس التسخين المعتاد', 'Échauffement standard'], cRetest: ['إعادة اختبار (لقياس الدقة، ما تعوّضش النتيجة)', 'Re-test (pour mesurer la fiabilité, ne remplace pas le résultat)'],
  fiS: ['تعب', 'fatigue'], cvS: ['انتظام', 'régularité'], setVs: ['س2/س1', 'S2/S1'], speed: ['السرعة', 'Vitesse'],
  chkTypo: ['زمن غير معقول: تأكد من الكتابة', 'Temps improbable : vérifier la saisie'], chkDev: ['بعيد على باقي التكرارات', 'Écart important avec les autres répétitions'], chkPrev: ['بعيد بزاف على النتيجة اللي فاتت', 'Très différent du résultat précédent'],
  real: ['تطور حقيقي', 'Changement réel'], likely: ['تطور محتمل', 'Changement probable'], noise: ['داخل هامش الخطأ', 'Dans la marge d’erreur'], diffProto: ['بروتوكول مختلف', 'Protocole différent'],
  relTitle: ['🎯 دقة القياس', '🎯 Fiabilité de la mesure'], relNote: ['الخطأ النموذجي يتحسب من إعادات الاختبار (نفس البروتوكول في أقل من 7 أيام). قبل 3 إعادات نستعمل قيمة معروفة. «التغيير الأدنى المؤكد» = أصغر تطور نقدرو نقولو عليه حقيقي.', 'Erreur typique calculée à partir des re-tests (même protocole, < 7 j). Avant 3 re-tests : valeur de référence. « Changement minimal détectable » = plus petit progrès certain.'],
  te: ['الخطأ النموذجي', 'Erreur typique'], mdc: ['التغيير الأدنى المؤكد', 'Changement minimal détectable'], pairs: ['إعادة', 're-tests'], refVal: ['قيمة مرجعية', 'valeur de référence'],
  audit: ['🕵 سجل التعديلات', '🕵 Journal des modifications'], details: ['التفاصيل', 'Détails'], results: ['النتائج', 'Résultats'], useIt: ['استعمل', 'Utiliser'], nResults: ['نتيجة', 'résultats']
});
var WATER = { AER: 1, LAC: 1, ALA: 1 };
var ALLC = CATS.map(function (c) { return c[0]; });
var EXO = {
  END: ['Pompes', 'Squats', 'Burpees', 'Abdos (curl-up)', 'Gainage', 'Gainage latéral', 'Fentes', 'Dips', 'Tractions', 'Mountain climbers', 'Corde à sauter'],
  MAX: ['Squat', 'Développé couché', 'Tirage horizontal (rowing)', 'Tirage vertical', 'Soulevé de terre', 'Développé militaire', 'Tractions lestées', 'Hip thrust', 'Handgrip'],
  POW: ['CMJ (saut contre-mouvement)', 'Squat jump', 'Saut en longueur sans élan', 'Triple bond', 'Lancer médecine-ball poitrine', 'Lancer arrière par-dessus la tête', 'Lancer médecine-ball au-dessus de la tête', 'Sprint 10 m']
};
var PRESETS = [
  { name: ['هوائي 2×(4×100) R20″/2′', 'Aérobie 2×(4×100) R20″/2′'], sys: 'AER', sets: 2, reps: 4, dist: 100, restRep: 20, restSet: 120, intensity: '85%', hr: true, stroke: 'NL', start: 'eau' },
  { name: ['هوائي 8×100 R15″', 'Aérobie 8×100 R15″'], sys: 'AER', sets: 1, reps: 8, dist: 100, restRep: 15, restSet: 0, intensity: '85%', hr: true, stroke: 'NL', start: 'eau' },
  { name: ['لاكتيك 6×50 R30″ أقصى', 'Lactique 6×50 R30″ max'], sys: 'LAC', sets: 1, reps: 6, dist: 50, restRep: 30, restSet: 0, intensity: 'max', hr: true, stroke: 'NL', start: 'plot' },
  { name: ['لاكتيك 2×(3×100) R1′/4′ أقصى', 'Lactique 2×(3×100) R1′/4′ max'], sys: 'LAC', sets: 2, reps: 3, dist: 100, restRep: 60, restSet: 240, intensity: 'max', hr: true, stroke: 'NL', start: 'plot' },
  { name: ['ألاكتيك 4×25 R2′ أقصى', 'Alactique 4×25 R2′ max'], sys: 'ALA', sets: 1, reps: 4, dist: 25, restRep: 120, restSet: 0, intensity: 'max', stroke: 'NL', start: 'plot' },
  { name: ['ألاكتيك 2×(3×15) R1′30/4′', 'Alactique 2×(3×15) R1′30/4′'], sys: 'ALA', sets: 2, reps: 3, dist: 15, restRep: 90, restSet: 240, intensity: 'max', stroke: 'NL', start: 'plot' },
  { name: ['Pompes 3×30″ R30″', 'Pompes 3×30″ R30″'], sys: 'END', mode: 'count', exercise: 'Pompes', sets: 3, work: 30, restSet: 30 },
  { name: ['Squats 3×45″ R15″', 'Squats 3×45″ R15″'], sys: 'END', mode: 'count', exercise: 'Squats', sets: 3, work: 45, restSet: 15 },
  { name: ['Gainage 3× أقصى R1′', 'Gainage 3× max R1′'], sys: 'END', mode: 'measure', exercise: 'Gainage', sets: 3, reps: 1, restSet: 60, unit: 's', agg: 'total', better: 'high' },
  { name: ['Squat 1RM مقدّر', 'Squat 1RM estimé'], sys: 'MAX', mode: 'rm', exercise: 'Squat', sets: 3, restSet: 180, cats: ['cad', 'jun', 'sen'] },
  { name: ['Développé couché 1RM مقدّر', 'Développé couché 1RM estimé'], sys: 'MAX', mode: 'rm', exercise: 'Développé couché', sets: 3, restSet: 180, cats: ['cad', 'jun', 'sen'] },
  { name: ['Tirage horizontal 1RM مقدّر', 'Tirage horizontal 1RM estimé'], sys: 'MAX', mode: 'rm', exercise: 'Tirage horizontal (rowing)', sets: 3, restSet: 180, cats: ['cad', 'jun', 'sen'] },
  { name: ['CMJ فيديو 5 قفزات R1′', 'CMJ vidéo 5 sauts R1′'], sys: 'POW', mode: 'jump', exercise: 'CMJ (saut contre-mouvement)', sets: 1, reps: 5, restRep: 60, fps: 240 },
  { name: ['Médecine-ball 3 كغ ×3', 'Médecine-ball 3 kg ×3'], sys: 'POW', mode: 'measure', exercise: 'Lancer médecine-ball poitrine', sets: 1, reps: 3, restRep: 60, unit: 'm', agg: 'best', better: 'high', intensity: '3 kg' }
];
function protos(all) { return (DB().protos || []).filter(function (p) { return all || p.active !== false; }); }
function protoById(id) { return (DB().protos || []).find(function (p) { return p.id === id; }); }
function pMode(p) { return WATER[p.sys] ? 'water' : (p.mode || 'count'); }
function pSig(p) { var m = pMode(p); return JSON.stringify([p.sys, m, +p.sets || 1, m === 'count' || m === 'rm' ? 1 : +p.reps || 1, +p.dist || 0, +p.work || 0, +p.restRep || 0, +p.restSet || 0, String(p.intensity || ''), String(p.exercise || ''), String(p.stroke || ''), String(p.start || ''), String(p.unit || ''), String(p.agg || '')]); }
function cellsPerSet(p) { var m = pMode(p); return m === 'count' || m === 'rm' ? 1 : Math.max(1, +p.reps || 1); }
function fmtS(s) { s = +s || 0; if (!s) return '0'; return s >= 60 ? Math.floor(s / 60) + '′' + (s % 60 ? ('0' + s % 60).slice(-2) : '') : s + '″'; }
function protoStr(p) {
  var m = pMode(p), n = +p.sets || 1, r = +p.reps || 1, s;
  if (m === 'water') { var core = r + '×' + (p.dist || '?') + ' m'; s = n > 1 ? n + '×(' + core + ')' : core; s += ' ' + (p.stroke || ''); if (+p.restRep || +p.restSet) s += ' · R ' + fmtS(p.restRep) + (n > 1 ? ' / ' + fmtS(p.restSet) : ''); }
  else {
    s = (p.exercise || '') + ' · ';
    if (m === 'count') s += n + '×' + (+p.work ? fmtS(p.work) : (L() === 'fr' ? 'max' : 'أقصى'));
    else if (m === 'rm') s += n + '× (3–10 RM)';
    else s += (n > 1 ? n + '×' : '') + r + ' ' + (r > 1 ? T('attP') : T('att').toLowerCase());
    if (+p.restRep || +p.restSet) s += ' · R ' + (+p.restRep ? fmtS(p.restRep) : '') + (+p.restRep && +p.restSet ? ' / ' : '') + (+p.restSet ? fmtS(p.restSet) : '');
  }
  if (p.intensity) s += ' · ' + (p.intensity === 'max' ? T('maxEff') : p.intensity);
  return s;
}
function pUnit(p) { var m = pMode(p); return m === 'water' ? 's' : m === 'count' ? 'rep' : m === 'rm' ? 'kg' : m === 'jump' ? 'cm' : (p.unit || 'cm'); }
function pBetter(p) { var m = pMode(p); return m === 'water' ? 'low' : m === 'measure' ? (p.better || 'high') : 'high'; }
function parseRm(x) { var m = String(x || '').replace(',', '.').match(/^\s*([\d.]+)\s*[x×*\/ ]\s*(\d+)\s*$/i); if (!m) return null; var l = +m[1], r = +m[2]; if (!l || !r || r > 12) return null; return { load: l, reps: r, rm: r === 1 ? l : l * 36 / (37 - r) }; }
function parseFrames(x) { var s = String(x || '').trim(), m = s.match(/^(\d+)\s*-\s*(\d+)$/); return m ? Math.abs(+m[2] - +m[1]) : C.num(s); }
function cellVal(p, x) {
  var m = pMode(p);
  if (m === 'water') return C.parseTime(x);
  if (m === 'rm') { var o = parseRm(x); return o ? o.rm : null; }
  if (m === 'jump') { var f = parseFrames(x), fps = +p.fps || 240; if (!f) return null; var t = f / fps; return 9.81 * t * t / 8 * 100; }
  if (m === 'measure' && p.unit === 's') { var tt = C.parseTime(x); return tt; }
  return C.num(x);
}
function mean(a) { return a.reduce(function (p, q) { return p + q; }, 0) / a.length; }
function protoCalc(p, d, s) {
  var m = pMode(p), V = (d.vals || []).map(function (row) { return (row || []).map(function (x) { return cellVal(p, x); }); });
  var flat = []; V.forEach(function (row) { row.forEach(function (x) { if (x != null && isFinite(x)) flat.push(x); }); });
  if (!flat.length) return null;
  var lowBetter = pBetter(p) === 'low', best = lowBetter ? Math.min.apply(null, flat) : Math.max.apply(null, flat), mn = mean(flat), tot = flat.reduce(function (a, b) { return a + b; }, 0);
  var st = C.stats(flat), cv = flat.length > 1 && mn ? st.sd / mn * 100 : null;
  var first = flat[0], last = flat[flat.length - 1], fi = flat.length > 1 ? (lowBetter ? (last - first) / first : (first - last) / first) * 100 : null;
  var dec = lowBetter ? (mn / best - 1) * 100 : (1 - mn / best) * 100;
  var setM = V.map(function (row) { var a = row.filter(function (x) { return x != null; }); return a.length ? mean(a) : null; });
  var s21 = setM.length > 1 && setM[0] && setM[1] ? (lowBetter ? setM[1] / setM[0] - 1 : 1 - setM[1] / setM[0]) * 100 : null;
  var v, disp, ex = [], unit = pUnit(p), w = C.num(s && s.weight);
  if (m === 'water') {
    v = p.sys === 'ALA' ? best : mn; disp = F(v, 2);
    ex.push((p.sys === 'ALA' ? T('mean') + ' ' + F(mn, 2) : T('best') + ' ' + F(best, 2)));
    if (p.dist) ex.push(R(p.dist / mn, 2) + ' m/s');
  } else if (m === 'count') { v = tot; disp = R(tot, 0) + ' rep'; ex.push(V.map(function (r) { return r.filter(function (x) { return x != null; }).join('+'); }).join(' | ')); }
  else if (m === 'rm') { v = best; disp = R(best, 1) + ' kg'; if (w) ex.push(T('relW') + ' ' + R(best / w, 2)); }
  else if (m === 'jump') { v = best; disp = R(best, 1) + ' cm'; ex.push(T('mean') + ' ' + R(mn, 1)); if (w) ex.push(T('watts') + ' ' + Math.round(60.7 * best + 45.3 * w - 2055)); }
  else { var ag = p.agg || 'best'; v = ag === 'total' ? tot : ag === 'mean' ? mn : best; disp = (unit === 's' ? F(v, 1) : R(v, 2)) + ' ' + unit; if (ag !== 'mean' && flat.length > 1) ex.push(T('mean') + ' ' + R(mn, 2)); }
  if (fi != null && flat.length > 2) ex.push(T('fiS') + ' ' + R(fi, 1) + '%');
  if (cv != null && flat.length > 2 && m === 'water') ex.push(T('cvS') + ' CV ' + R(cv, 1) + '%');
  if (s21 != null) ex.push(T('setVs') + ' ' + (s21 >= 0 ? '−' : '+') + R(Math.abs(s21), 1) + '%');
  var hr = (d.hr || []).map(C.num).filter(function (x) { return x; }); if (hr.length) ex.push('♥ ' + hr.join('/'));
  if (C.num(d.rpe)) ex.push('RPE ' + C.num(d.rpe));
  return { v: v, disp: disp, extra: ex.join(' · '), V: V, flat: flat, best: best, mean: mn, fi: fi, cv: cv, dec: dec, setM: setM };
}
function protoTest(p) {
  var water = !!WATER[p.sys];
  return { id: 'p:' + p.id, proto: p, sys: p.sys, w: water ? 1 : 0, cats: p.cats && p.cats.length ? p.cats : ALLC, name: [p.name, p.name], unit: pUnit(p), better: pBetter(p),
    g: [protoStr(p) + (p.note ? '<br>' + esc(p.note) : ''), protoStr(p) + (p.note ? '<br>' + esc(p.note) : '')],
    calc: function (d, s) { return protoCalc(d.proto || p, d, s); } };
}
/* --- fiabilité : erreur typique (re-tests) --- */
var TE_DEF = { water: 1.2, count: 8, rm: 4, jump: 5, measure: 3, s: 1.5, '/100': 1.5, rep: 8, m: 3, cm: 3, kg: 3 };
function teOf(t) {
  var p = t.proto, key = p ? pMode(p) : t.unit, def = TE_DEF[key] || 3;
  var pairs = [];
  DB().swimmers.forEach(function (s) {
    var rs = recsOf(s.id).filter(function (r) { return r.data.test === t.id && (!p || (r.data.proto && pSig(r.data.proto) === pSig(p))); }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    for (var i = 1; i < rs.length; i++) {
      if (!rs[i].data.retest) continue;
      var a = rs[i - 1], b = rs[i]; if ((new Date(b.date) - new Date(a.date)) / 864e5 > 7) continue;
      var x = t.calc(a.data, s), y = t.calc(b.data, s); if (x && y && x.v && y.v) pairs.push((y.v - x.v) / ((x.v + y.v) / 2) * 100);
    }
  });
  if (pairs.length < 3) return { te: def, n: pairs.length, ref: true };
  var st = C.stats(pairs); return { te: st.sd / Math.SQRT2, n: pairs.length, ref: false };
}
function verdict(t, cur, prev, catVals) {
  if (!cur || !prev || !prev.v) return null;
  if (t.proto && cur.rec.data.proto && prev.rec.data.proto && pSig(cur.rec.data.proto) !== pSig(prev.rec.data.proto)) return { k: 'diff' };
  var ch = (cur.v - prev.v) / prev.v * 100; if (t.better === 'low') ch = -ch;
  var te = teOf(t).te, mdc = 2.77 * te, swc = 0;
  if (catVals && catVals.length >= 3) { var st = C.stats(catVals); if (st.m) swc = 0.2 * st.sd / st.m * 100; }
  return { ch: ch, k: Math.abs(ch) >= mdc ? 'real' : Math.abs(ch) >= Math.max(swc, te) ? 'likely' : 'noise', mdc: mdc };
}
function verdictChip(vd) {
  if (!vd) return '';
  if (vd.k === 'diff') return '<span class="chip">' + T('diffProto') + '</span>';
  var up = vd.ch >= 0, cls = vd.k === 'noise' ? '' : up ? 'ok' : 'bad';
  return '<span class="chip ' + cls + '" title="' + T(vd.k) + ' · ' + T('mdc') + ' ' + R(vd.mdc, 1) + '%">' + (up ? '▲ ' : '▼ ') + R(Math.abs(vd.ch), 1) + '% · ' + T(vd.k) + '</span>';
}
/* --- vue : liste + éditeur de protocoles --- */
var ACT = { 'résultat': ['نتيجة جديدة', 'Nouveau résultat'], 'résultat modifié': ['تعديل نتيجة', 'Résultat modifié'], 'résultat supprimé': ['حذف نتيجة', 'Résultat supprimé'], 'protocole créé': ['بروتوكول جديد', 'Protocole créé'], 'protocole modifié': ['تعديل بروتوكول', 'Protocole modifié'], 'protocole archivé': ['أرشفة بروتوكول', 'Protocole archivé'], 'programme': ['برنامج الحملة', 'Programme de campagne'] };
function canEdit(p) { var me = DB().me || {}; return K.isAdmin() || p.byId === me.id; }
function vProtos(app) {
  var all = protos(true), ed = ST.pedit, h = '<div class="row"><button class="btn sm" id="bk">← ' + T('home') + '</button><span class="sp"></span>' + (ed ? '' : '<button class="btn pri" id="pnew">' + T('protoNew') + '</button>') + '</div>';
  if (ed) { app.innerHTML = h + protoForm(ed); bindProtoForm(); $('#bk').onclick = function () { ST.pedit = null; K.render(); }; return; }
  h += '<h1>' + T('myProtos') + '</h1>';
  SYS.forEach(function (k) {
    var g = all.filter(function (p) { return p.sys === k; }); if (!g.length) return;
    h += '<h2>' + T(k) + '</h2><div class="grid g2" style="margin-bottom:12px">' + g.map(function (p) {
      var n = recs().filter(function (r) { return r.data.test === 'p:' + p.id; }).length;
      return '<div class="card" style="' + (p.active === false ? 'opacity:.55' : '') + '"><div class="row"><b class="sp" style="font-size:17px">' + esc(p.name) + '</b>' + (p.active === false ? '<span class="chip">' + T('pArchived') + '</span>' : '') + '</div>' +
        '<div class="ltr small" style="margin:6px 0;font-weight:700;color:var(--blue)">' + esc(protoStr(p)) + '</div>' +
        '<div class="small muted">' + (p.by ? T('pBy') + ' ' + esc(p.by) + ' · ' : '') + (p.updated ? K.fmtDate(p.updated.slice(0, 10)) + ' · ' : '') + n + ' ' + T('nResults') + ' · ' + (p.cats && p.cats.length && p.cats.length < ALLC.length ? p.cats.map(function (c) { return (CATS.find(function (x) { return x[0] === c; }) || [])[L() === 'fr' ? 1 : 2]; }).join('، ') : T('allCats')) + '</div>' +
        '<div class="row" style="margin-top:8px"><button class="btn sm pri" data-use="' + p.id + '">📝 ' + T('useIt') + '</button>' + (canEdit(p) ? '<button class="btn sm" data-pe="' + p.id + '">✎ ' + T('edit') + '</button><button class="btn sm" data-pa="' + p.id + '">' + (p.active === false ? T('pRestore') : T('pArchive')) + '</button>' : '') + '</div></div>';
    }).join('') + '</div>';
  });
  if (!all.length) h += '<div class="card empty">' + T('protoNew') + '</div>';
  h += '<h1 style="margin-top:18px">' + T('builtin') + '</h1>' + SYS.concat(['FLX']).map(function (k) { var g = TESTS.filter(function (t) { return t.sys === k; }); return g.length ? '<div class="card"><h3>' + T(k) + '</h3><div class="tlist">' + g.map(function (t) { return '<div class="it"><div class="sp"><b>' + esc(tv(t.name)) + '</b> <span class="chip">📌</span><div class="small muted">' + (t.cats.length === ALLC.length ? T('allCats') : t.cats.map(function (c) { return (CATS.find(function (x) { return x[0] === c; }) || [])[L() === 'fr' ? 1 : 2]; }).join('، ')) + '</div></div><button class="btn sm pri" data-useb="' + t.id + '">📝 ' + T('useIt') + '</button></div>'; }).join('') + '</div></div>' : ''; }).join('');
  // fiabilité
  var rel = all.filter(function (p) { return p.active !== false; }).map(function (p) { var t = protoTest(p), r = teOf(t); return '<tr><td style="text-align:start">' + esc(p.name) + '</td><td class="num">' + R(r.te, 1) + '%</td><td class="num"><b>' + R(2.77 * r.te, 1) + '%</b></td><td class="small muted">' + (r.ref ? T('refVal') + ' (' + r.n + ' ' + T('pairs') + ')' : r.n + ' ' + T('pairs')) + '</td></tr>'; }).join('');
  if (rel) h += '<div class="card"><h3>' + T('relTitle') + '</h3><div class="tbl-wrap"><table><tr><th></th><th>' + T('te') + '</th><th>' + T('mdc') + '</th><th></th></tr>' + rel + '</table></div><p class="small muted">' + T('relNote') + '</p></div>';
  if (K.isAdmin()) h += '<div class="card"><h3>' + T('audit') + '</h3><div id="audit" class="small muted">…</div></div>';
  app.innerHTML = h;
  $('#bk').onclick = function () { K.route('home'); };
  $('#pnew').onclick = function () { ST.pedit = { sys: 'AER', sets: 1, reps: 4, dist: 50, cats: [] }; K.render(); };
  $$('[data-pe]').forEach(function (b) { b.onclick = function () { ST.pedit = JSON.parse(JSON.stringify(protoById(b.dataset.pe))); K.render(); }; });
  $$('[data-pa]').forEach(function (b) { b.onclick = function () { var p = JSON.parse(JSON.stringify(protoById(b.dataset.pa))); p.active = p.active === false; saveProto(p); }; });
  $$('[data-useb]').forEach(function (b) { b.onclick = function () { ST.test = b.dataset.useb; ST.one = null; ST.retest = false; ST.back = 'home'; K.route('btEntry'); }; });
  $$('[data-use]').forEach(function (b) { b.onclick = function () { ST.test = 'p:' + b.dataset.use; ST.one = null; ST.retest = false; K.route('btEntry'); }; });
  if (K.isAdmin()) K.API.call('audit').then(function (r) {
    var el = $('#audit'); if (!el) return;
    el.innerHTML = r.ok && r.log && r.log.length ? '<div class="tbl-wrap"><table>' + r.log.slice(0, 200).map(function (x) { return '<tr><td class="ltr" style="white-space:nowrap">' + esc(String(x.t).slice(0, 16).replace('T', ' ')) + '</td><td><b>' + esc(x.who) + '</b></td><td>' + esc(ACT[x.act] ? tv(ACT[x.act]) : x.act) + '</td><td style="text-align:start">' + esc(x.det) + '</td></tr>'; }).join('') + '</table></div>' : '—';
  }).catch(function () {});
}
function protoForm(p) {
  var water = !!WATER[p.sys], m = pMode(p), has = p.id && recs().some(function (r) { return r.data.test === 'p:' + p.id; });
  var opt = function (v, cur, l) { return '<option value="' + v + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + l + '</option>'; };
  var inp = function (k, l, v, type) { return '<div class="f"><label>' + l + '</label><input data-pf="' + k + '" ' + (type === 'n' ? 'inputmode="decimal" class="mono"' : '') + ' value="' + esc(v == null ? '' : v) + '"></div>'; };
  var h = '<h1>' + (p.id ? '✎ ' + esc(p.name) : T('protoNew')) + '</h1>';
  if (!p.id) h += '<div class="card"><h3>' + T('pPresets') + '</h3><div class="row" style="flex-wrap:wrap;gap:6px">' + PRESETS.map(function (x, i) { return '<button class="btn sm" data-pre="' + i + '">' + esc(tv(x.name)) + '</button>'; }).join('') + '</div></div>';
  if (has) h += '<div class="note" style="margin-bottom:12px">' + T('pEditWarn') + '</div>';
  h += '<div class="card"><div class="fr">' + inp('name', T('pName'), p.name) + '<div class="f"><label>' + T('pSys') + '</label><select data-pf="sys">' + SYS.map(function (k) { return opt(k, p.sys, (WATER[k] ? '🏊 ' : '🏋 ') + T(k)); }).join('') + '</select></div></div>';
  h += '<label>' + T('pCats') + '</label><div class="seg" id="pcats">' + CATS.map(function (c) { var on = (p.cats || []).indexOf(c[0]) >= 0; return '<button class="btn sm' + (on ? ' on' : '') + '" data-pc="' + c[0] + '">' + (L() === 'fr' ? c[1] : c[2]) + '</button>'; }).join('') + '</div><div class="small muted" style="margin:4px 0 10px">' + (L() === 'fr' ? 'Aucune = toutes' : 'ما تختار والو = كل الفئات') + '</div>';
  if (water) {
    h += '<div class="fr">' + inp('sets', T('pSets'), p.sets || 1, 'n') + inp('reps', T('pReps'), p.reps || 1, 'n') + inp('dist', T('pDist'), p.dist, 'n') + '</div>' +
      '<div class="fr"><div class="f"><label>' + T('pStroke') + '</label><select data-pf="stroke">' + [['NL', 'Nage libre'], ['Dos', 'Dos'], ['Brasse', 'Brasse'], ['Papillon', 'Papillon'], ['4N', '4 nages'], ['Spé', 'Spécialité']].map(function (x) { return opt(x[0], p.stroke || 'NL', x[1]); }).join('') + '</select></div>' +
      '<div class="f"><label>' + T('pStart') + '</label><select data-pf="start">' + [['plot', L() === 'fr' ? 'Plot' : 'المكعب'], ['eau', L() === 'fr' ? 'Dans l’eau / poussée' : 'من الماء (دفعة)']].map(function (x) { return opt(x[0], p.start || 'plot', x[1]); }).join('') + '</select></div></div>' +
      '<div class="fr">' + inp('restRep', T('pRestRep'), p.restRep || 0, 'n') + inp('restSet', T('pRestSet'), p.restSet || 0, 'n') + '<div class="f"><label>' + T('pInt') + '</label><input data-pf="intensity" list="intl" value="' + esc(p.intensity || '') + '"><datalist id="intl"><option value="max"><option value="95%"><option value="90%"><option value="85%"><option value="80%"><option value="CSS"></datalist></div></div>' +
      '<label class="row" style="gap:8px;margin:6px 0"><input type="checkbox" data-pf="hr"' + (p.hr ? ' checked' : '') + ' style="width:auto"> ' + T('pHr') + '</label>';
  } else {
    h += '<div class="fr"><div class="f"><label>' + T('pEx') + '</label><input data-pf="exercise" list="exl" value="' + esc(p.exercise || '') + '"><datalist id="exl">' + (EXO[p.sys] || []).map(function (e) { return '<option value="' + e + '">'; }).join('') + '</datalist></div>' +
      '<div class="f"><label>' + T('pMode') + '</label><select data-pf="mode">' + ['count', 'measure', 'rm', 'jump'].map(function (k) { return opt(k, m, T('m_' + k)); }).join('') + '</select></div></div>';
    h += '<div class="fr">' + inp('sets', T('pSets'), p.sets || 1, 'n') + (m === 'count' ? inp('work', T('pWork') + (L() === 'fr' ? ' (0 = max)' : ' (0 = أقصى عدد)'), p.work || 0, 'n') : m === 'rm' ? '' : inp('reps', T('pAtt'), p.reps || 1, 'n')) + '</div>';
    h += '<div class="fr">' + (m === 'count' || m === 'rm' ? '' : inp('restRep', T('pRestRep'), p.restRep || 0, 'n')) + inp('restSet', T('pRestSet'), p.restSet || 0, 'n') + inp('intensity', T('pInt'), p.intensity || '') + '</div>';
    if (m === 'measure') h += '<div class="fr"><div class="f"><label>' + T('pUnit') + '</label><select data-pf="unit">' + ['cm', 'm', 's', 'kg'].map(function (u) { return opt(u, p.unit || 'cm', u); }).join('') + '</select></div><div class="f"><label>' + T('pAgg') + '</label><select data-pf="agg">' + ['best', 'mean', 'total'].map(function (a) { return opt(a, p.agg || 'best', T('a_' + a)); }).join('') + '</select></div><div class="f"><label>' + T('pBetter') + '</label><select data-pf="better">' + ['high', 'low'].map(function (a) { return opt(a, p.better || 'high', T('b_' + a)); }).join('') + '</select></div></div>';
    if (m === 'jump') h += '<div class="fr">' + inp('fps', T('pFps'), p.fps || 240, 'n') + '</div>';
    if (m === 'rm') h += '<div class="note" style="margin:8px 0">' + T('pRmWarn') + '</div>';
  }
  h += '<div class="f"><label>' + T('pNote') + '</label><textarea data-pf="note" rows="3">' + esc(p.note || '') + '</textarea></div>';
  h += '<div class="card" style="background:var(--sky2,rgba(91,155,255,.08));margin-top:10px"><b class="ltr" id="pprev">' + esc(protoStr(p)) + '</b></div>';
  h += '<div class="row" style="margin-top:12px"><button class="btn pri big" id="psave">💾 ' + T('save') + '</button></div></div>';
  return h;
}
function readForm() {
  var p = ST.pedit;
  $$('[data-pf]').forEach(function (i) { var k = i.dataset.pf; p[k] = i.type === 'checkbox' ? i.checked : (/^(sets|reps|dist|restRep|restSet|work|fps)$/.test(k) ? (C.num(i.value) || 0) : i.value.trim()); });
  return p;
}
function bindProtoForm() {
  var p = ST.pedit;
  $$('[data-pre]').forEach(function (b) { b.onclick = function () { var x = JSON.parse(JSON.stringify(PRESETS[+b.dataset.pre])); x.name = tv(x.name); ST.pedit = Object.assign({ cats: [] }, x); K.render(); }; });
  $$('[data-pc]').forEach(function (b) { b.onclick = function () { readForm(); var c = b.dataset.pc, a = p.cats = p.cats || [], i = a.indexOf(c); if (i >= 0) a.splice(i, 1); else a.push(c); K.render(); }; });
  $$('[data-pf]').forEach(function (i) {
    i.addEventListener(i.tagName === 'SELECT' ? 'change' : 'input', function () {
      var before = pMode(p) + WATER[p.sys]; readForm();
      if (i.dataset.pf === 'sys' && !WATER[p.sys] && !p.mode) p.mode = p.sys === 'MAX' ? 'rm' : p.sys === 'POW' ? 'jump' : 'count';
      if (pMode(p) + WATER[p.sys] !== before) K.render(); else $('#pprev').textContent = protoStr(p);
    });
  });
  $('#psave').onclick = function () {
    readForm();
    if (!p.name) { K.toast(T('pName') + ' ?'); return; }
    if (WATER[p.sys] && !(p.dist > 0)) { K.toast(T('pDist') + ' ?'); return; }
    if (pMode(p) === 'rm') p.cats = (p.cats && p.cats.length ? p.cats : ['jun', 'sen']).filter(function (c) { return CI[c] >= CI.cad; });
    saveProto(p);
  };
}
function saveProto(p) {
  var me = DB().me || {}, old = p.id && protoById(p.id);
  if (!p.id) { p.id = K.uid(); p.by = me.name; p.byId = me.id || 'admin'; p.created = new Date().toISOString(); }
  if (old && pSig(old) !== pSig(p)) p.v = (+old.v || 1) + 1;
  p.updated = new Date().toISOString();
  K.mutate('saveProto', { rec: p });
  ST.pedit = null; K.toast(T('saved')); K.render();
}


/* ---------------- vues ---------------- */
function catChips(cur, all) {
  return '<div class="seg">' + (all ? '<button class="btn sm' + (!cur ? ' on' : '') + '" data-cat="">' + T('allCats') + '</button>' : '') + CATS.map(function (c) { return '<button class="btn sm' + (cur === c[0] ? ' on' : '') + '" data-cat="' + c[0] + '">' + (L() === 'fr' ? c[1] : c[2]) + '</button>'; }).join('') + '</div>';
}
function campSel() { return '<select id="campsel" style="width:auto;min-height:38px">' + camps().map(function (c) { return '<option value="' + c + '"' + (c === curCamp() ? ' selected' : '') + '>' + campName(c) + '</option>'; }).join('') + '</select>'; }
function bindCommon(rerender) {
  var cs = $('#campsel'); if (cs) cs.onchange = function () { ST.camp = this.value; rerender(); };
  $$('[data-cat]').forEach(function (b) { b.onclick = function () { ST.cat = b.dataset.cat; ST.test = ''; rerender(); }; });
}

/* ================= organisation par catégorie ================= */
Object.assign(K.D, {
  prog: ['📋 برنامج الحملة', '📋 Programme de la campagne'], progEdit: ['✎ تحديد البرنامج', '✎ Définir le programme'], progEmpty: ['ما كاين حتى اختبار في البرنامج. المدرب الرئيسي يحددو.', 'Aucun test au programme. L’entraîneur principal le définit.'],
  progCopy: ['نسخ من الحملة اللي فاتت', 'Copier la campagne précédente'], done: ['تعدّاو', 'testés'], results2: ['📊 النتائج', '📊 Résultats'], enter: ['📝 إدخال', '📝 Saisir'], tSw: ['👥 السباحين', '👥 Nageurs'],
  builtin: ['📌 قوالب النادي (ثابتة)', '📌 Modèles du club (fixes)'], myProtos: ['🧩 بروتوكولات المدربين', '🧩 Protocoles des entraîneurs'], rank: ['المرتبة', 'Rang'],
  scoreMode: ['النقطة', 'Score'], scNorm: ['عادية', 'Normale'], scMat: ['معدّلة بالنضج', 'Ajustée maturité'], matNote: ['معدّلة بالنضج: السباح يتقارن مع اللي في نفس مرحلة النضج (±1 سنة من ذروة النمو)، من نفس الجنس، مهما كانت الفئة. تحتاج الطول، الطول قاعد والوزن.', 'Ajustée : comparaison avec les nageurs de même maturité (±1 an du pic de croissance), même sexe, toutes catégories. Nécessite taille, taille assise et poids.'],
  q: ['ربع الميلاد', 'Trimestre de naissance'], qNote: ['Q4 = مولود في آخر العام: أصغر من زملاء الفئة بقرابة عام. نتايجو تتقرا بعين الاعتبار.', 'Q4 = né en fin d’année : jusqu’à 1 an plus jeune que ses pairs.'],
  matSt: ['النضج', 'Maturité'], early: ['بكري', 'précoce'], ontime: ['في الوقت', 'normal'], late: ['متأخر', 'tardif'], needSitH: ['زيد الطول قاعد', 'Ajouter taille assise'],
  zones: ['مناطق التدريب (من السرعة الحرجة)', 'Zones d’entraînement (vitesse critique)'], zRec: ['استرجاع', 'Récup'], zA1: ['هوائي 1', 'Aérobie 1'], zA2: ['هوائي 2', 'Aérobie 2'], zTh: ['العتبة (CS)', 'Seuil (CS)'], zVo: ['VO2max', 'VO2max'],
  progress: ['التقدم', 'Avancement'], st_pre: ['قبل ذروة النمو', 'avant le pic'], st_circa: ['حول الذروة', 'autour du pic'], st_post: ['بعد الذروة', 'après le pic'], allTests: ['كل الاختبارات', 'Tous les tests']
});
function progOf(camp) { var p = (DB().settings || {})['prog_' + camp]; return p && typeof p === 'object' ? p : {}; }
function catProg(cat, camp) { return (progOf(camp)[cat] || []).filter(function (id) { return testById(id); }); }
function swOfCat(cat, date) { return K.visibleSwimmers().filter(function (s) { return catOf(s, date) === cat; }); }
function doneCount(tid, list, camp) { return list.filter(function (s) { return result(s, tid, camp); }).length; }
function yrs(c) { var y = yearsOf(c); return c === 'eco' ? '≥' + y.born_from : (y.born_from ? y.born_from + '–' : '≤') + y.born_to; }
function bar(p) { var c = p >= 100 ? 'var(--ok)' : p >= 50 ? 'var(--blue)' : 'var(--warn)'; return '<div style="height:7px;border-radius:4px;background:rgba(127,140,170,.2);overflow:hidden"><div style="height:100%;width:' + Math.min(100, p) + '%;background:' + c + '"></div></div>'; }

function vHome(app) {
  var camp = curCamp();
  var h = '<div class="welcome"><h1>🧪 ' + T('btTitle') + '</h1><div class="muted">' + campName(camp) + ' · ' + K.fmtDate(K.today()) + '</div><svg viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0 30 C150 5 300 55 450 30 S750 5 900 30 S1100 55 1200 30 V60 H0Z" fill="rgba(255,255,255,.15)"/></svg></div>';
  h += '<div class="row" style="margin-bottom:14px">' + campSel() + '<span class="sp"></span><button class="btn pri" id="go-entry">' + T('entry') + '</button><button class="btn" id="go-protos">' + T('protos') + '</button><button class="btn" id="go-report">' + T('report') + '</button><button class="btn" id="add">＋ ' + T('addSw') + '</button></div>';
  h += '<div class="grid g3">' + CATS.map(function (c) {
    var list = swOfCat(c[0]), y = yearsOf(c[0]), pr = catProg(c[0], camp), tot = pr.length * list.length, dn = 0;
    pr.forEach(function (tid) { dn += doneCount(tid, list, camp); });
    var pct = tot ? Math.round(dn / tot * 100) : 0;
    return '<div class="card sw" data-cg="' + c[0] + '" style="cursor:pointer;display:block' + (list.length ? '' : ';opacity:.55') + '"><div class="row"><b style="font-size:19px" class="sp">' + (L() === 'fr' ? c[1] : c[2]) + '</b><span class="chip">' + list.length + ' 🏊</span></div>' +
      '<div class="small muted" style="margin:2px 0 10px">' + (L() === 'fr' ? '' : c[1] + ' · ') + yrs(c[0]) + '</div>' +
      (pr.length ? '<div class="row small" style="margin-bottom:4px"><span class="sp muted">' + T('prog').replace('📋 ', '') + ' · ' + pr.length + '</span><b class="num">' + pct + '%</b></div>' + bar(pct) : '<div class="small muted">' + (L() === 'fr' ? 'Pas de programme' : 'ما كاينش برنامج') + '</div>') + '</div>';
  }).join('') + '</div>';
  app.innerHTML = h;
  bindCommon(function () { K.render(); });
  $('#go-entry').onclick = function () { ST.back = 'home'; K.route('btEntry'); };
  $('#go-protos').onclick = function () { ST.pedit = null; K.route('btProtos'); };
  $('#go-report').onclick = function () { K.route('btReport'); };
  $('#add').onclick = function () { K.route('swForm', { sid: null }); };
  $$('[data-cg]').forEach(function (el) { el.onclick = function () { ST.cat = el.dataset.cg; ST.ctab = ST.ctab || 'prog'; ST.pe = false; K.route('btCat'); }; });
  if (!vHome.loaded) { vHome.loaded = true; K.load().then(function (r) { if (r && r.ok && K.S.view === 'home') K.render(); }).catch(function () {}); }
}
function canProg() { var me = DB().me || {}; return K.isAdmin() || !!me.head; }
function vCat(app) {
  var cat = ST.cat || 'ben', camp = curCamp(), list = swOfCat(cat).sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); }), y = yearsOf(cat), tab = ST.ctab || 'prog';
  var h = '<div class="row"><button class="btn sm" id="bk">← ' + T('home') + '</button><span class="sp"></span>' + campSel() + '</div>' +
    '<div class="row" style="margin:12px 0"><h1 class="sp" style="margin:0">' + catName(cat) + ' <span class="small muted">(' + yrs(cat) + ') · ' + list.length + ' ' + T('ofSwimmers') + '</span></h1></div>' +
    '<div class="seg" style="margin-bottom:14px">' + [['prog', T('prog')], ['water', T('water')], ['land', T('land')], ['sw', T('tSw')]].map(function (x) { return '<button class="btn sm' + (tab === x[0] ? ' on' : '') + '" data-ct="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
  var row = function (t) {
    var n = doneCount(t.id, list, camp), p = list.length ? Math.round(n / list.length * 100) : 0;
    return '<div class="it"><div class="sp"><b>' + esc(tv(t.name)) + '</b>' + (t.proto ? ' <span class="chip">🧩</span>' : '') + '<div class="small muted ltr">' + (t.proto ? esc(protoStr(t.proto)) : '') + '</div><div class="row small" style="margin-top:4px"><span class="num">' + n + '/' + list.length + '</span><span class="sp">' + bar(p) + '</span></div></div>' +
      '<div class="row" style="gap:6px"><button class="btn sm pri" data-en="' + t.id + '">' + T('enter') + '</button><button class="btn sm" data-rs="' + t.id + '">' + T('results2') + '</button></div></div>';
  };
  if (tab === 'prog') {
    var pr = catProg(cat, camp);
    if (ST.pe) {
      var all = testsForCat(cat), sel = {}; pr.forEach(function (id) { sel[id] = 1; });
      h += '<div class="card"><h3>' + T('progEdit') + ' · ' + campName(camp) + '</h3>' + SYS.concat(['FLX']).map(function (k) { var g = all.filter(function (t) { return t.sys === k; }); return g.length ? '<h2 style="font-size:15px">' + (WATER[k] ? '🏊 ' : '🏋 ') + T(k) + '</h2>' + g.map(function (t) { return '<label class="row" style="gap:8px;margin:4px 0;font-weight:600"><input type="checkbox" data-pt="' + t.id + '"' + (sel[t.id] ? ' checked' : '') + ' style="width:auto"> ' + esc(tv(t.name)) + (t.proto ? ' <span class="small muted ltr">' + esc(protoStr(t.proto)) + '</span>' : '') + '</label>'; }).join('') : ''; }).join('') +
        '<div class="row" style="margin-top:12px"><button class="btn pri" id="psv">💾 ' + T('save') + '</button><button class="btn" id="pcp">' + T('progCopy') + '</button><button class="btn" id="pcx">' + T('cancel') + '</button></div></div>';
    } else {
      h += '<div class="card"><div class="row" style="margin-bottom:6px"><h3 class="sp" style="margin:0">' + T('prog') + ' · ' + campName(camp) + '</h3>' + (canProg() ? '<button class="btn sm" id="pe">' + T('progEdit') + '</button>' : '') + '</div>' + (pr.length ? '<div class="tlist">' + pr.map(function (id) { return row(testById(id)); }).join('') + '</div>' : '<p class="muted">' + T('progEmpty') + '</p>') + '</div>';
    }
  } else if (tab === 'water' || tab === 'land') {
    var ks = tab === 'water' ? ['AER', 'LAC', 'ALA'] : ['END', 'MAX', 'POW', 'FLX'];
    ks.forEach(function (k) { var g = testsForCat(cat).filter(function (t) { return t.sys === k; }); if (g.length) h += '<div class="card"><h3>' + T(k) + '</h3><div class="tlist">' + g.map(row).join('') + '</div></div>'; });
  } else {
    if (!list.length) h += '<div class="card empty">' + T('noSwCat') + '</div>';
    else h += '<div class="grid g3">' + list.map(function (s) {
      var sc = sysScores(s, camp), n = recsOf(s.id).filter(function (r) { return campOf(r.date) === camp; }).length;
      return '<div class="card sw" data-id="' + s.id + '"><div class="av">' + esc(K.initials(s.name)) + '</div><div class="sp" style="min-width:0"><b style="font-size:17px">' + esc(s.name) + '</b><div class="small muted">' + (s.group ? esc(s.group) + ' · ' : '') + n + ' ' + T('resultsOf').toLowerCase() + ' · Q' + quarter(s) + '</div>' +
        '<div class="row" style="gap:4px;margin-top:4px">' + SYS.map(function (k) { var v = sc[k]; var col = v == null ? '#c9d5ea' : v >= 60 ? 'var(--ok)' : v >= 40 ? 'var(--blue)' : 'var(--warn)'; return '<span title="' + T(k) + '" style="flex:1;height:6px;border-radius:3px;background:' + col + '"></span>'; }).join('') + '</div></div></div>';
    }).join('') + '</div>';
  }
  app.innerHTML = h;
  bindCommon(function () { K.render(); });
  $('#bk').onclick = function () { K.route('home'); };
  $$('[data-ct]').forEach(function (b) { b.onclick = function () { ST.ctab = b.dataset.ct; ST.pe = false; K.render(); }; });
  $$('[data-en]').forEach(function (b) { b.onclick = function () { ST.test = b.dataset.en; ST.one = null; ST.retest = false; ST.back = 'btCat'; K.route('btEntry'); }; });
  $$('[data-rs]').forEach(function (b) { b.onclick = function () { ST.rtest = b.dataset.rs; K.route('btRes'); }; });
  $$('.sw[data-id]').forEach(function (el) { el.onclick = function () { ST.back = 'btCat'; K.route('swimmer', { sid: el.dataset.id }); }; });
  if ($('#pe')) $('#pe').onclick = function () { ST.pe = true; K.render(); };
  if ($('#pcx')) $('#pcx').onclick = function () { ST.pe = false; K.render(); };
  if ($('#pcp')) $('#pcp').onclick = function () { var prev = catProg(cat, prevCamp(camp)); $$('[data-pt]').forEach(function (i) { i.checked = prev.indexOf(i.dataset.pt) >= 0; }); };
  if ($('#psv')) $('#psv').onclick = function () {
    var ids = $$('[data-pt]').filter(function (i) { return i.checked; }).map(function (i) { return i.dataset.pt; });
    var p = JSON.parse(JSON.stringify(progOf(camp))); p[cat] = ids;
    DB().settings = DB().settings || {}; DB().settings['prog_' + camp] = p;
    K.API.call('saveProgram', { camp: camp, cat: cat, tests: ids }).then(function (r) { if (!r.ok) return K.toast(T(r.err) || r.err); K.toast(T('saved')); }).catch(function () { K.toast(T('neterr')); });
    ST.pe = false; K.render();
  };
}
/* --- résultats d'un test pour la catégorie --- */
function vRes(app) {
  var cat = ST.cat, camp = curCamp(), t = testById(ST.rtest); if (!t) return K.route('btCat');
  var list = swOfCat(cat).map(function (s) { var r = result(s, t.id, camp), p = result(s, t.id, prevCamp(camp)); return { s: s, r: r, p: p, sc: score(s, t.id, camp), sm: score(s, t.id, camp, 'mat') }; });
  var vals = list.filter(function (x) { return x.r; }).map(function (x) { return x.r.v; });
  list.sort(function (a, b) { if (!a.r) return 1; if (!b.r) return -1; return t.better === 'low' ? a.r.v - b.r.v : b.r.v - a.r.v; });
  var h = '<div class="row"><button class="btn sm" id="bk">← ' + catName(cat) + '</button><span class="sp"></span>' + campSel() + '<button class="btn sm pri" id="en">' + T('enter') + '</button></div><h1 style="margin-top:12px">' + esc(tv(t.name)) + '</h1>' + (t.proto ? '<p class="ltr muted">' + esc(protoStr(t.proto)) + '</p>' : '');
  h += '<div class="card"><div class="tbl-wrap"><table><tr><th>' + T('rank') + '</th><th style="text-align:start">' + T('name') + '</th><th>' + T('results') + '</th><th></th><th>' + T('score') + '</th><th>' + T('scMat') + '</th><th>' + T('delta') + '</th></tr>' +
    list.map(function (x, i) { return '<tr><td class="num">' + (x.r ? i + 1 : '—') + '</td><td style="text-align:start"><b>' + esc(x.s.name) + '</b> <span class="small muted">Q' + quarter(x.s) + '</span></td><td class="num" style="font-weight:800">' + (x.r ? x.r.disp : '—') + '</td><td class="small muted" style="text-align:start">' + (x.r && x.r.extra ? x.r.extra.split(' · ').map(function (e) { return '<bdi>' + esc(e) + '</bdi>'; }).join(' · ') : '') + '</td><td class="num">' + (x.sc != null ? x.sc : '—') + '</td><td class="num">' + (x.sm != null ? x.sm : '—') + '</td><td>' + (x.r && x.p ? verdictChip(verdict(t, x.r, x.p, vals)) : '') + '</td></tr>'; }).join('') + '</table></div></div>';
  app.innerHTML = h;
  bindCommon(function () { K.render(); });
  $('#bk').onclick = function () { K.route('btCat'); };
  $('#en').onclick = function () { ST.test = t.id; ST.one = null; ST.back = 'btCat'; K.route('btEntry'); };
}
/* --- maturité & trimestre --- */
function quarter(s) { if (!s || !s.dob) return '?'; return Math.floor(new Date(s.dob).getMonth() / 3) + 1; }
function matOf(s, date) { if (!s) return null; var a = C.ageAt(s.dob, date), M = a ? C.maturity(s.sex, a, s.height, s.sitH, s.weight) : null; return M; }
function matStage(mo) { return mo == null ? null : mo < -1 ? 'pre' : mo <= 1 ? 'circa' : 'post'; }
// précoce / normal / tardif : âge au pic de croissance comparé à la moyenne (garçons 13,8 · filles 11,8)
function matTiming(s, M) { if (!M || M.aphv == null) return null; var ref = (s.sex || 'M') === 'F' ? 11.8 : 13.8, d = M.aphv - ref; return d < -1 ? 'early' : d > 1 ? 'late' : 'ontime'; }
function matLabel(s, M) { if (!M) return '—'; var st = matStage(M.mo), tm = matTiming(s, M); return '<span class="num">' + (M.mo > 0 ? '+' : '') + R(M.mo, 1) + '</span> ' + T('st_' + st) + ' · ' + T(tm); }
/* --- zones à partir de la vitesse critique --- */
function csZones(cs) {
  var Z = [['zRec', 0.70, 0.80], ['zA1', 0.80, 0.88], ['zA2', 0.88, 0.95], ['zTh', 0.95, 1.02], ['zVo', 1.02, 1.08]];
  return '<details class="rd"><summary class="small muted">' + T('zones') + '</summary><table class="small">' + Z.map(function (z) { return '<tr><td style="text-align:start"><b>' + T(z[0]) + '</b></td><td class="num ltr">' + F(100 / (cs * z[2]), 1) + ' – ' + F(100 / (cs * z[1]), 1) + ' /100</td><td class="muted num">' + Math.round(z[1] * 100) + '–' + Math.round(z[2] * 100) + '% CS</td></tr>'; }).join('') + '</table></details>';
}

/* --- fiche nageur --- */
function vSwimmer(app) {
  var s = K.sw(K.S.sid); if (!s) return K.route('home');
  var camp = curCamp(), pc = prevCamp(camp), cat = catOf(s), md = ST.mat ? 'mat' : '', sc = sysScores(s, camp, md), sp = sysScores(s, pc, md), M = matOf(s), st = M ? matStage(M.mo) : null;
  var h = '<div class="row"><button class="btn sm" id="bk">← ' + T('swimmers') + '</button><span class="sp"></span>' + campSel() + '<button class="btn sm" id="pr">🖨</button><button class="btn sm" id="ed">✎ ' + T('edit') + '</button></div>' +
    '<div class="row" style="margin:12px 0"><div class="av" style="width:58px;height:58px;font-size:22px">' + esc(K.initials(s.name)) + '</div><div class="sp"><h1 style="margin:0">' + esc(s.name) + '</h1><div class="small muted"><span class="chip">' + catName(cat) + '</span> ' + (s.dob ? K.fmtDate(s.dob) : '') + (s.weight ? ' · <span class="ltr">' + esc(s.weight) + ' kg</span>' : '') + (s.group ? ' · ' + esc(s.group) : '') + '</div><div class="row small" style="gap:6px;margin-top:6px"><span class="chip' + (quarter(s) === 4 ? ' warn' : '') + '" title="' + esc(T('qNote')) + '">' + T('q') + ' Q' + quarter(s) + '</span>' + (M ? '<span class="chip" title="APHV ' + R(M.aphv, 1) + '">' + T('matSt') + ' : ' + matLabel(s, M) + '</span>' : '<span class="chip">' + T('needSitH') + '</span>') + '</div></div></div>' +
    '<div class="row" style="margin-bottom:12px"><span class="small muted">' + T('scoreMode') + ' :</span><div class="seg"><button class="btn sm' + (!ST.mat ? ' on' : '') + '" data-md="">' + T('scNorm') + '</button><button class="btn sm' + (ST.mat ? ' on' : '') + '" data-md="mat">' + T('scMat') + '</button></div></div>' + (ST.mat ? '<p class="small muted">' + T('matNote') + '</p>' : '');
  h += '<div class="grid g2"><div class="card"><h3>🕸 ' + T('radar') + '</h3><div class="chart" style="height:300px"><canvas id="ch-radar"></canvas></div><p class="small muted">' + T('scoreNote') + '</p></div><div class="card"><h3>' + T('bt_sys') + '</h3><table><tr><th></th><th>' + campName(camp) + '</th><th>' + campName(pc) + '</th></tr>' +
    SYS.map(function (k) { return '<tr><td style="text-align:start"><b>' + T(k) + '</b></td><td class="num">' + (sc[k] != null ? sc[k] : '—') + '</td><td class="num muted">' + (sp[k] != null ? sp[k] : '—') + '</td></tr>'; }).join('') + '</table></div></div>';
  [['water', ['AER', 'LAC', 'ALA']], ['land', ['END', 'MAX', 'POW', 'FLX']]].forEach(function (grp) {
    h += '<h2 style="margin-top:6px">' + T(grp[0]) + '</h2><div class="grid g2">';
    grp[1].forEach(function (k) {
      var list = testsForCat(cat, true).filter(function (t) { return t.sys === k && (!t.proto || recsOf(s.id).some(function (r) { return r.data.test === t.id; })); }); if (!list.length) return;
      h += '<div class="card"><h3>' + T(k) + '</h3><div class="tlist">';
      list.forEach(function (t) {
        var r = result(s, t.id, camp), p = result(s, t.id, pc), scv = score(s, t.id, camp, md), d = '';
        if (r && p) { var pool = DB().swimmers.filter(function (x) { return catOf(x, r.rec.date) === catOf(s, r.rec.date); }).map(function (x) { var q = result(x, t.id, camp); return q ? q.v : null; }).filter(function (v) { return v != null; }); d = verdictChip(verdict(t, r, p, pool)); }
        h += '<div class="it" data-test="' + t.id + '" style="cursor:pointer"><div class="sp"><b>' + tv(t.name) + '</b><div class="small muted">' + (r ? K.fmtDate(r.rec.date) + (r.extra ? ' · ' + r.extra.split(' · ').map(function (x) { return '<bdi>' + esc(x) + '</bdi>'; }).join(' · ') : '') : '＋ ' + T('addRes')) + (p ? ' · ' + T('before') + ' <span class="num">' + p.disp + '</span>' : '') + '</div></div>' +
          '<div style="text-align:end"><div class="num" style="font-size:19px;font-weight:700">' + (r ? r.disp : '—') + '</div>' + d + (scv != null ? ' <span class="chip">' + scv + '</span>' : '') + '</div></div>' + (r && r.V ? repsDetail(r) : '') + (r && r.cs ? csZones(r.cs) : '');
      });
      h += '</div></div>';
    });
    h += '</div>';
  });
  if (window.BTV.video) h += window.BTV.video.section(s);
  app.innerHTML = h;
  if (window.BTV.video) window.BTV.video.bind();
  bindCommon(function () { K.render(); });
  $('#bk').onclick = function () { K.route(ST.back === 'btCat' ? 'btCat' : 'home'); };
  $$('[data-md]').forEach(function (b) { b.onclick = function () { ST.mat = !!b.dataset.md; K.render(); }; });
  $('#ed').onclick = function () { K.route('swForm'); };
  $('#pr').onclick = function () { window.print(); };
  $$('[data-test]').forEach(function (b) { b.onclick = function () { ST.test = b.dataset.test; ST.one = s.id; ST.retest = false; K.route('btEntry'); }; });
  // radar
  var o = K.chartBase(); o.scales = { r: { min: 0, max: 100, ticks: { stepSize: 25, display: false }, pointLabels: { font: { size: 13 } } } };
  K.mk('ch-radar', { type: 'radar', data: { labels: SYS.map(function (k) { return T(k); }), datasets: [
    { label: campName(camp), data: SYS.map(function (k) { return sc[k]; }), borderColor: '#1d6bff', backgroundColor: 'rgba(29,107,255,.2)', borderWidth: 2.5, pointBackgroundColor: '#1d6bff' },
    { label: campName(pc), data: SYS.map(function (k) { return sp[k]; }), borderColor: '#9aabc9', backgroundColor: 'rgba(154,171,201,.12)', borderDash: [5, 4], pointRadius: 2 },
    { label: '50', data: SYS.map(function () { return 50; }), borderColor: 'rgba(232,163,23,.7)', backgroundColor: 'transparent', borderWidth: 1, pointRadius: 0 }] }, options: o });
}

/* --- détail des répétitions (fiche) --- */
function fmtCell(p, x) { var m = pMode(p); return x == null ? '—' : m === 'water' ? F(x, 2) : m === 'count' ? R(x, 0) : R(x, 1); }
function repsDetail(r) {
  var p = r.rec.data.proto || {}, n = r.V.length;
  return '<details class="rd"><summary class="small muted">' + T('details') + ' · <span class="ltr">' + esc(protoStr(p)) + '</span></summary><div class="ltr small" style="padding:4px 0 8px">' +
    r.V.map(function (row, i) { return '<div><b>' + (n > 1 ? 'S' + (i + 1) + ' ' : '') + '</b>' + row.map(function (x) { return '<span class="chip" style="margin:2px">' + fmtCell(p, x) + '</span>'; }).join('') + (r.setM[i] != null && row.length > 1 ? ' <span class="muted">x̄ ' + fmtCell(p, r.setM[i]) + '</span>' : '') + ((r.rec.data.hr || [])[i] ? ' <span class="muted">♥' + esc(r.rec.data.hr[i]) + '</span>' : '') + '</div>'; }).join('') +
    (r.rec.data.cond ? '<div class="muted" style="margin-top:4px">' + condStr(r.rec.data.cond) + '</div>' : '') + '</div></details>';
}
function condStr(c) { var a = []; if (c.pool) a.push(c.pool === 'land' ? '🏋' : c.pool + ' m'); if (c.timing) a.push(T(c.timing === 'hand' ? 'tHand' : c.timing === 'elec' ? 'tElec' : 'tVideo')); if (c.hour) a.push(c.hour); if (c.warm === false) a.push('⚠ ' + T('cWarm')); return a.join(' · '); }
var MODE_G = {
  water: ['اكتب <b>زمن كل تكرار</b> كيما يجي (مثلاً <span class="ltr">1:12.4</span> ولا <span class="ltr">72.4</span>). الكرونو من الإشارة حتى اللمس. <b>احترم الراحة بالضبط</b> بكرونو ثاني (ولا مع ساعة الحائط). كي يكون النبض: يتقاس مباشرة بعد آخر تكرار في السلسلة.', 'Noter <b>chaque temps</b> (ex. 1:12.4 ou 72.4), du signal au toucher. <b>Respecter exactement la récup</b>. FC prise juste après la dernière répétition de la série.'],
  count: ['اكتب <b>عدد التكرارات الصحيحة</b> في كل سلسلة. وقت العمل والراحة بالكرونو. التكرار اللي ما تمّش بالتقنية الصحيحة ما يتحسبش.', 'Noter les <b>répétitions correctes</b> de chaque série ; travail et récup au chrono.'],
  measure: ['اكتب <b>نتيجة كل محاولة</b>. التطبيق ياخذ الأحسن/المتوسط/المجموع حسب البروتوكول.', 'Noter <b>chaque essai</b>.'],
  rm: ['إحماء متدرّج (<span class="ltr">50%×10 · 70%×5 · 85%×3</span>). في كل سلسلة اكتب <b>الحمل×التكرارات</b>، مثلاً <span class="ltr">60×5</span>. التكرارات حتى العجز التقني، <b>بين 3 و 10</b>. التطبيق يحسب 1RM (Brzycki) وياخذ الأحسن — السباح ما يرفعش الحمل الأقصى أبداً.', 'Échauffement progressif. Par série : <b>charge×répétitions</b> (ex. 60×5), 3 à 10 répétitions jusqu’à l’échec technique. 1RM calculé (Brzycki).'],
  jump: ['صوّر من الجنب بـ <b>التصوير البطيء</b> (240 صورة/ث، ولا كيما محدد في البروتوكول)، الهاتف ثابت في مستوى الرجلين. افتح الفيديو صورة بصورة: رقم الصورة اللي <b>تفارق</b> فيها الأصابع الأرض، ورقم الصورة اللي <b>ترجع تمسّ</b>. اكتب <span class="ltr">120-245</span> ولا الفرق مباشرة (125). في الهبوط الركبتين ممدودين، اليدين على الحوض. العلو = g·t²/8.', 'Filmer de profil au <b>ralenti</b> (240 i/s), téléphone fixe. Image du décollage et de la réception : écrire <span class="ltr">120-245</span> ou la différence. Hauteur = g·t²/8.']
};
function pHolder(p) { var m = pMode(p); return m === 'water' ? '0:00.0' : m === 'rm' ? 'kg×rep' : m === 'jump' ? (L() === 'fr' ? 'images' : 'صور') : m === 'count' ? 'rep' : (p.unit || ''); }
function cellLabel(p, si, ri, n, cps) { var m = pMode(p); if (m === 'count' || m === 'rm') return T('set') + ' ' + (si + 1); return (n > 1 ? 'S' + (si + 1) + '·' : '') + (m === 'water' ? (ri + 1) : T('att') + ' ' + (ri + 1)); }

/* --- saisie de groupe (ou individuelle) --- */
function vEntry(app) {
  var one = ST.one ? K.sw(ST.one) : null;
  var list = one ? [one] : K.visibleSwimmers().filter(function (s) { return (!ST.cat || catOf(s) === ST.cat) && (!ST.group || s.group === ST.group); }).sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
  var cat = one ? catOf(one) : ST.cat;
  var avail = cat ? testsForCat(cat) : TESTS.concat(protos().map(protoTest));
  if (ST.test && !avail.some(function (t) { return t.id === ST.test; })) { var tt = testById(ST.test); if (!(tt && tt.proto && tt.proto.active !== false)) ST.test = ''; else avail = avail.concat([tt]); }
  var t = testById(ST.test), P = t && t.proto;
  var groups = {}; K.visibleSwimmers().forEach(function (s) { if (s.group) groups[s.group] = 1; });
  var h = '<button class="btn sm" id="bk">← ' + (one ? esc(one.name) : ST.back === 'btCat' && ST.cat ? catName(ST.cat) : T('home')) + '</button><h1>' + (one ? '📝 ' + esc(one.name) : T('entry')) + '</h1>';
  if (!one) h += '<div class="card"><div style="margin-bottom:10px">' + catChips(ST.cat, true) + '</div>' + (Object.keys(groups).length ? '<select id="grp" style="width:auto">' + '<option value="">' + T('allGroups') + '</option>' + Object.keys(groups).sort().map(function (g) { return '<option' + (ST.group === g ? ' selected' : '') + '>' + esc(g) + '</option>'; }).join('') + '</select>' : '') + '</div>';
  var opts = function (arr) { return arr.map(function (x) { return '<option value="' + x.id + '"' + (x.id === ST.test ? ' selected' : '') + '>' + esc(tv(x.name)) + '</option>'; }).join(''); };
  h += '<div class="card"><div class="fr"><div class="f"><label>' + T('chooseTest') + '</label><select id="tsel"><option value="">—</option>' +
    SYS.concat(['FLX']).map(function (k) { var g = avail.filter(function (x) { return x.sys === k && !x.proto; }), gp = avail.filter(function (x) { return x.sys === k && x.proto; }); return (gp.length ? '<optgroup label="🧩 ' + T(k) + '">' + opts(gp) + '</optgroup>' : '') + (g.length ? '<optgroup label="' + T(k) + '">' + opts(g) + '</optgroup>' : ''); }).join('') + '</select></div>' +
    '<div class="f"><label>' + T('date') + '</label><input type="date" id="edate" value="' + (ST.date || K.today()) + '"></div></div>';
  // conditions
  var c = ST.cond, water = t && t.w;
  if (t) h += '<details class="rd"' + (P ? ' open' : '') + '><summary><b>' + T('cond') + '</b></summary><div class="fr" style="margin-top:6px">' +
    (water ? '<div class="f"><label>' + T('cPool') + '</label><select data-cd="pool">' + ['25', '50'].map(function (x) { return '<option' + (c.pool === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' : '') +
    '<div class="f"><label>' + T('cTiming') + '</label><select data-cd="timing">' + [['hand', 'tHand'], ['elec', 'tElec'], ['video', 'tVideo']].map(function (x) { return '<option value="' + x[0] + '"' + (c.timing === x[0] ? ' selected' : '') + '>' + T(x[1]) + '</option>'; }).join('') + '</select></div></div>' +
    '<label class="row" style="gap:8px;margin:4px 0"><input type="checkbox" data-cd="warm"' + (c.warm !== false ? ' checked' : '') + ' style="width:auto"> ' + T('cWarm') + '</label>' +
    '<label class="row" style="gap:8px;margin:4px 0"><input type="checkbox" id="retest"' + (ST.retest ? ' checked' : '') + ' style="width:auto"> ' + T('cRetest') + '</label></details>';
  h += '</div>';
  if (t && ST.retest) h += '<div class="note" style="margin-bottom:12px">🔁 ' + T('cRetest') + '</div>';
  if (t) {
    h += '<details class="guide" open><summary>' + T('guide') + '</summary><div class="gb">' + (P ? '<b class="ltr">' + esc(protoStr(P)) + '</b>' + (P.note ? '<div>' + esc(P.note) + '</div>' : '') + '<div style="margin-top:6px">' + tv(MODE_G[pMode(P)]) + '</div>' + (pMode(P) === 'rm' ? '<div class="note" style="margin-top:6px">' + T('pRmWarn') + '</div>' : '') : tv(t.g)) + '</div></details>';
    if (!list.length) h += '<div class="card empty">' + T('noSwCat') + '</div>';
    else {
      var date = ST.date || K.today(), n = P ? Math.max(1, +P.sets || 1) : 0, cps = P ? cellsPerSet(P) : 0, hrOn = P && pMode(P) === 'water' && P.hr;
      h += '<div class="card"><div class="tbl-wrap"><table id="etab"><tr><th style="text-align:start">' + T('name') + '</th>';
      if (P) { for (var si = 0; si < n; si++) { for (var ri = 0; ri < cps; ri++) h += '<th' + (ri === 0 && si > 0 ? ' style="border-inline-start:2px solid var(--line)"' : '') + '>' + cellLabel(P, si, ri, n, cps) + '</th>'; if (hrOn) h += '<th>♥ ' + (n > 1 ? 'S' + (si + 1) : '') + '</th>'; } h += '<th>RPE</th>'; }
      else h += t.inputs.map(function (i) { return '<th>' + esc(i.l) + (i.u ? ' (' + i.u + ')' : '') + (i.hint ? '<small>' + tv(i.hint) + '</small>' : '') + '</th>'; }).join('');
      h += '<th>' + T('results') + '</th></tr>';
      list.forEach(function (s) {
        var ok = t.cats.indexOf(catOf(s, date)) >= 0, ex = recsOf(s.id).filter(function (r) { return r.data.test === t.id && r.date === date && !!r.data.retest === !!ST.retest; })[0], d = ex ? ex.data : {};
        h += '<tr data-sid="' + s.id + '"' + (ex ? ' data-rid="' + ex.id + '"' : '') + '><td style="text-align:start;white-space:nowrap"><b>' + esc(s.name) + '</b>' + (!ok ? '<div class="small" style="color:var(--warn)">⚠ ' + T('notForCat') + '</div>' : '') + '</td>';
        if (P) {
          for (var a = 0; a < n; a++) { for (var b = 0; b < cps; b++) h += '<td' + (b === 0 && a > 0 ? ' style="border-inline-start:2px solid var(--line)"' : '') + '><input data-c="' + a + '_' + b + '" inputmode="decimal" value="' + esc(((d.vals || [])[a] || [])[b]) + '" placeholder="' + pHolder(P) + '" style="min-width:' + (pMode(P) === 'rm' ? 84 : 70) + 'px"></td>'; if (hrOn) h += '<td><input data-h="' + a + '" inputmode="numeric" value="' + esc((d.hr || [])[a]) + '" placeholder="bpm" style="min-width:58px"></td>'; }
          h += '<td><input data-k="rpe" inputmode="numeric" value="' + esc(d.rpe) + '" placeholder="1–10" style="min-width:50px"></td>';
        } else h += t.inputs.map(function (i) {
          if (i.t === 'sel') return '<td><select data-k="' + i.k + '">' + i.opts.map(function (o) { return '<option value="' + o[0] + '"' + (d[i.k] === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></td>';
          return '<td><input data-k="' + i.k + '" inputmode="decimal" value="' + esc(d[i.k]) + '" placeholder="' + (i.t === 'time' ? '0:00.0' : '') + '" style="min-width:76px"></td>';
        }).join('');
        h += '<td class="num" data-out style="font-weight:700;white-space:nowrap">—</td></tr>';
      });
      h += '</table></div><div class="row" style="margin-top:12px"><button class="btn pri big" id="saveall">💾 ' + T('saveAll') + '</button></div></div>';
    }
  }
  app.innerHTML = h;
  $('#bk').onclick = function () { var o = ST.one; ST.one = null; ST.retest = false; o ? K.route('swimmer', { sid: o }) : K.route(ST.back === 'btCat' && ST.cat ? 'btCat' : 'home'); };
  $$('[data-cat]').forEach(function (b) { b.onclick = function () { ST.cat = b.dataset.cat; K.render(); }; });
  if ($('#grp')) $('#grp').onchange = function () { ST.group = this.value; K.render(); };
  $('#tsel').onchange = function () { ST.test = this.value; ST.retest = false; K.render(); };
  $('#edate').onchange = function () { ST.date = this.value; K.render(); };
  $$('[data-cd]').forEach(function (i) { i.onchange = function () { ST.cond[i.dataset.cd] = i.type === 'checkbox' ? i.checked : i.value; }; });
  if ($('#retest')) $('#retest').onchange = function () { ST.retest = this.checked; K.render(); };
  if (!t || !$('#etab')) return;
  function rowData(tr) {
    var d = { test: t.id };
    if (P) {
      d.proto = JSON.parse(JSON.stringify(P)); delete d.proto.note; d.vals = []; d.hr = [];
      $$('[data-c]', tr).forEach(function (i) { var k = i.dataset.c.split('_'); (d.vals[+k[0]] = d.vals[+k[0]] || [])[+k[1]] = i.value.trim(); });
      $$('[data-h]', tr).forEach(function (i) { d.hr[+i.dataset.h] = i.value.trim(); });
      var rp = $('[data-k=rpe]', tr); d.rpe = rp ? rp.value.trim() : '';
    } else $$('[data-k]', tr).forEach(function (i) { d[i.dataset.k] = i.value.trim(); });
    return d;
  }
  function prevOf(s) {
    var best = null; recsOf(s.id).forEach(function (r) { if (r.data.test !== t.id || r.data.retest || r.date >= (ST.date || K.today())) return; if (P && !(r.data.proto && pSig(r.data.proto) === pSig(P))) return; if (!best || r.date > best.date) best = r; });
    return best ? t.calc(best.data, s) : null;
  }
  function check(tr, s, r) {
    var warn = '';
    if (P) {
      var m = pMode(P), cells = $$('[data-c]', tr), vals = cells.map(function (i) { return cellVal(P, i.value); }), ok = vals.filter(function (x) { return x != null; }).sort(function (a, b) { return a - b; }), med = ok.length ? ok[Math.floor(ok.length / 2)] : null;
      cells.forEach(function (i, k) {
        var x = vals[k], msg = '';
        if (i.value.trim() && x == null) msg = T('chkTypo');
        else if (x != null && m === 'water' && P.dist) { var sp = P.dist / x; if (sp > 2.5 || sp < 0.3) msg = T('chkTypo'); else if (ok.length >= 3 && Math.abs(x - med) / med > 0.12) msg = T('chkDev'); }
        else if (x != null && m === 'jump' && (x > 90 || x < 3)) msg = T('chkTypo');
        i.style.borderColor = msg ? (msg === T('chkTypo') ? 'var(--bad)' : 'var(--warn)') : ''; i.title = msg;
        if (msg && !warn) warn = msg;
      });
    }
    var pv = r && prevOf(s);
    if (!warn && pv && pv.v && Math.abs(r.v - pv.v) / pv.v > (P && pMode(P) === 'water' ? 0.1 : 0.3)) warn = T('chkPrev') + ' (' + pv.disp + ')';
    return warn;
  }
  function upd(tr) {
    var s = K.sw(tr.dataset.sid), r = t.calc(rowData(tr), s), w = check(tr, s, r);
    $('[data-out]', tr).innerHTML = (r ? r.disp + (r.extra ? '<div class="small muted" style="font-weight:500;white-space:nowrap;line-height:1.5">' + r.extra.split(' · ').map(function (x) { return '<div><bdi>' + esc(x) + '</bdi></div>'; }).join('') + '</div>' : '') : '—') + (w ? '<div class="small" style="color:var(--warn);white-space:normal">⚠ ' + esc(w) + '</div>' : '');
  }
  $$('#etab tr[data-sid]').forEach(function (tr) { upd(tr); tr.addEventListener('input', function () { upd(tr); }); });
  $('#saveall').onclick = function () {
    var date = $('#edate').value || K.today(), n = 0, now = new Date();
    var cond = Object.assign({}, ST.cond, { hour: ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) }); if (!t.w) delete cond.pool;
    $$('#etab tr[data-sid]').forEach(function (tr) {
      var d = rowData(tr), has = P ? d.vals.some(function (row) { return (row || []).some(function (x) { return x; }); }) : t.inputs.some(function (i) { return i.t !== 'sel' && d[i.k]; });
      if (!has) return;
      d.cond = cond; if (ST.retest) d.retest = true;
      K.mutate('saveTest', { rec: { id: tr.dataset.rid || K.uid(), swimmerId: tr.dataset.sid, type: 'bt', date: date, data: d } }); n++;
    });
    K.toast(n ? n + ' ' + T('savedN') : T('nothing'));
    if (n && ST.one) { var o = ST.one; ST.one = null; K.route('swimmer', { sid: o }); } else K.render();
  };
}

/* --- rapport de catégorie --- */
function vReport(app) {
  if (!ST.cat) ST.cat = 'ben';
  var camp = curCamp(), list = K.visibleSwimmers().filter(function (s) { return catOf(s) === ST.cat; }).sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
  var tests = testsForCat(ST.cat, true).filter(function (t) { return !t.proto || list.some(function (s) { return result(s, t.id, camp); }); });
  var h = '<div class="row"><button class="btn sm" id="bk">← ' + T('home') + '</button><span class="sp"></span>' + campSel() + '<button class="btn sm" id="pr">' + T('printReport') + '</button></div><h1>' + T('report') + ' · ' + catName(ST.cat) + '</h1><div style="margin-bottom:12px">' + catChips(ST.cat, false) + '</div>';
  if (!list.length) h += '<div class="card empty">' + T('noSwCat') + '</div>';
  else {
    h += '<div class="card"><div class="tbl-wrap"><table><tr><th style="text-align:start">' + T('name') + '</th><th>Q</th><th>' + T('matSt') + '</th>' + SYS.map(function (k) { return '<th>' + T(k) + '</th>'; }).join('') + '</tr>' +
      list.map(function (s) { var sc = sysScores(s, camp), M = matOf(s), st = M ? matStage(M.mo) : null; return '<tr><td style="text-align:start"><b>' + esc(s.name) + '</b></td><td class="num">Q' + quarter(s) + '</td><td class="small">' + matLabel(s, M) + '</td>' + SYS.map(function (k) { var v = sc[k]; return '<td class="num" style="font-weight:700;color:' + (v == null ? 'var(--mute)' : v >= 60 ? 'var(--ok)' : v >= 40 ? 'var(--ink)' : 'var(--warn)') + '">' + (v != null ? v : '—') + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div></div>';
    h += '<div class="card"><h3>' + T('resultsOf') + ' · ' + campName(camp) + '</h3><div class="tbl-wrap"><table><tr><th style="text-align:start">' + T('name') + '</th>' + tests.map(function (t) { return '<th>' + tv(t.name) + '</th>'; }).join('') + '</tr>' +
      list.map(function (s) { return '<tr><td style="text-align:start;white-space:nowrap"><b>' + esc(s.name) + '</b></td>' + tests.map(function (t) { var r = result(s, t.id, camp); return '<td class="num">' + (r ? r.disp : '—') + '</td>'; }).join('') + '</tr>'; }).join('') +
      '<tr><td style="text-align:start"><b>' + T('mean') + '</b></td>' + tests.map(function (t) { var v = list.map(function (s) { var r = result(s, t.id, camp); return r ? r.v : null; }).filter(function (x) { return x != null; }); if (!v.length) return '<td>—</td>'; var m = v.reduce(function (a, b) { return a + b; }, 0) / v.length; return '<td class="num"><b>' + (t.unit === 's' || t.unit === '/100' ? F(m, 2) : R(m, 1)) + '</b></td>'; }).join('') + '</tr></table></div></div>';
  }
  app.innerHTML = h;
  bindCommon(function () { K.render(); });
  $('#bk').onclick = function () { K.route('home'); };
  $('#pr').onclick = function () { var p = $('#print'); p.innerHTML = '<div style="font-family:inherit"><h2>' + T('btTitle') + ' · ' + catName(ST.cat) + ' · ' + campName(camp) + '</h2>' + $$('#app .card').map(function (c) { return c.outerHTML; }).join('') + '</div>'; setTimeout(function () { window.print(); }, 200); };
}

/* --- paramètres : catégories --- */
function settingsExtra() {
  var d = catDef(), S = seasonYear();
  return '<div class="card"><h3>' + T('catsT') + '</h3><p class="small muted">' + T('catsP') + ' ' + S + '/' + (S + 1) + '</p><div class="tbl-wrap"><table><tr><th>' + T('cat') + '</th><th>' + T('from') + '</th><th>' + T('to') + '</th></tr>' +
    CATS.map(function (c, i) { var hi = i < CATS.length - 1 ? d[CATS[i + 1][0]] - 1 : null; return '<tr><td style="text-align:start"><b>' + catName(c[0]) + '</b></td><td>' + (hi == null ? '<span class="muted">' + T('andOlder') + '</span>' : '<span class="num">' + (S - hi) + '</span>') + '</td><td>' + (i === 0 ? '<span class="muted">' + T('andYounger') + '</span>' : '<input class="mono" data-cy="' + c[0] + '" value="' + (S - d[c[0]]) + '" style="max-width:110px">') + '</td></tr>'; }).join('') +
    '</table></div><p class="small muted">' + (L() === 'fr' ? 'Saisir l’année de naissance la plus ancienne de chaque catégorie. Chaque saison, les années avancent automatiquement.' : 'بدّل في خانة «حتى» أحدث سنة ميلاد في كل فئة. كل موسم جديد السنوات يزيدو وحدهم.') + '</p><button class="btn pri" id="savecats">' + T('save') + '</button></div>';
}
function settingsBind() {
  var b = $('#savecats'); if (!b) return;
  b.onclick = function () {
    var S = seasonYear(), o = { eco: 0 };
    $$('[data-cy]').forEach(function (i) { var y = parseInt(i.value, 10); if (y > 1900) o[i.dataset.cy] = S - y; });
    var bad = CATS.slice(1).some(function (c, i) { var prevK = CATS[i][0]; return i > 0 && o[c[0]] <= o[prevK]; });
    if (bad) { K.toast('✗'); return; }
    K.API.call('saveSetting', { key: 'btCats', value: o }).then(function (r) { if (!r.ok) return K.toast(T(r.err) || r.err); K.toast(T('saved')); K.load().then(K.render); }).catch(function () { K.toast(T('neterr')); });
  };
}

window.BTV = { views: { home: vHome, swimmer: vSwimmer, btEntry: vEntry, btReport: vReport, btProtos: vProtos, btCat: vCat, btRes: vRes }, settingsExtra: settingsExtra, settingsBind: settingsBind, TESTS: TESTS, catOf: catOf, campOf: campOf };
})();
