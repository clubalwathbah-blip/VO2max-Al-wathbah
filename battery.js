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
function testById(id) { return TESTS.find(function (t) { return t.id === id; }); }
function testsForCat(c) { return TESTS.filter(function (t) { return t.cats.indexOf(c) >= 0; }); }

/* ---------------- données ---------------- */
function recs() { return DB().tests.filter(function (t) { return t.type === 'bt'; }); }
function recsOf(sid) { return recs().filter(function (t) { return t.swimmerId === sid; }); }
// dernier résultat (calculé) d'un nageur pour un test et une campagne
function result(s, tid, camp) {
  var t = testById(tid), best = null;
  recsOf(s.id).forEach(function (r) { if (r.data.test !== tid || (camp && campOf(r.date) !== camp)) return; if (!best || r.date > best.date || (r.date === best.date && (r.updated || '') > (best.updated || ''))) best = r; });
  if (!best) return null;
  var c = t.calc(best.data || {}, s); return c ? Object.assign({ rec: best }, c) : null;
}
// score 0–100 dans la catégorie (même sexe si ≥3, sinon mixte)
function score(s, tid, camp) {
  var me = result(s, tid, camp); if (!me) return null;
  var cat = catOf(s, me.rec.date), t = testById(tid);
  var pool = DB().swimmers.filter(function (x) { return catOf(x, me.rec.date) === cat; });
  var same = pool.filter(function (x) { return (x.sex || 'M') === (s.sex || 'M'); });
  var vals = function (list) { return list.map(function (x) { var r = result(x, tid, camp); return r ? r.v : null; }).filter(function (v) { return v != null; }); };
  var v = vals(same); if (v.length < 3) v = vals(pool);
  if (v.length < 3) return null;
  var st = C.stats(v); if (!st.sd) return 50;
  var z = (me.v - st.m) / st.sd; if (t.better === 'low') z = -z;
  return Math.max(0, Math.min(100, Math.round(50 + 15 * z)));
}
function sysScores(s, camp) {
  var cat = catOf(s), o = {};
  SYS.forEach(function (k) { var a = testsForCat(cat).filter(function (t) { return t.sys === k; }).map(function (t) { return score(s, t.id, camp); }).filter(function (x) { return x != null; }); o[k] = a.length ? Math.round(a.reduce(function (p, q) { return p + q; }, 0) / a.length) : null; });
  return o;
}
function camps() { var set = {}; set[campOf(new Date())] = 1; recs().forEach(function (r) { set[campOf(r.date)] = 1; }); return Object.keys(set).sort().reverse(); }
var ST = { camp: null, cat: '', group: '', test: '' };
function curCamp() { return ST.camp || campOf(new Date()); }

/* ---------------- vues ---------------- */
function catChips(cur, all) {
  return '<div class="seg">' + (all ? '<button class="btn sm' + (!cur ? ' on' : '') + '" data-cat="">' + T('allCats') + '</button>' : '') + CATS.map(function (c) { return '<button class="btn sm' + (cur === c[0] ? ' on' : '') + '" data-cat="' + c[0] + '">' + (L() === 'fr' ? c[1] : c[2]) + '</button>'; }).join('') + '</div>';
}
function campSel() { return '<select id="campsel" style="width:auto;min-height:38px">' + camps().map(function (c) { return '<option value="' + c + '"' + (c === curCamp() ? ' selected' : '') + '>' + campName(c) + '</option>'; }).join('') + '</select>'; }
function bindCommon(rerender) {
  var cs = $('#campsel'); if (cs) cs.onchange = function () { ST.camp = this.value; rerender(); };
  $$('[data-cat]').forEach(function (b) { b.onclick = function () { ST.cat = b.dataset.cat; ST.test = ''; rerender(); }; });
}

function vHome(app) {
  var list = K.visibleSwimmers().slice().sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); }), camp = curCamp();
  var h = '<div class="welcome"><h1>🧪 ' + T('btTitle') + '</h1><div class="muted">' + campName(camp) + ' · ' + K.fmtDate(K.today()) + '</div><svg viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0 30 C150 5 300 55 450 30 S750 5 900 30 S1100 55 1200 30 V60 H0Z" fill="rgba(255,255,255,.15)"/></svg></div>';
  if (K.isAdmin() && (DB().coaches || []).length) h += '<div class="coachbar"><span class="small muted">👁 ' + T('viewAs') + ' :</span><div class="seg"><button class="btn sm' + (!K.viewAs() ? ' on' : '') + '" data-va="">' + T('allCoaches') + '</button>' + DB().coaches.map(function (c) { return '<button class="btn sm' + (K.viewAs() === c.id ? ' on' : '') + '" data-va="' + c.id + '">' + esc(c.name) + '</button>'; }).join('') + '</div></div>';
  h += '<div class="row" style="margin-bottom:12px">' + campSel() + '<span class="sp"></span><button class="btn pri" id="go-entry">' + T('entry') + '</button><button class="btn" id="go-report">' + T('report') + '</button><button class="btn" id="add">＋ ' + T('addSw') + '</button></div>';
  h += '<div style="margin-bottom:14px">' + catChips(ST.cat, true) + '</div>';
  var shown = list.filter(function (s) { return !ST.cat || catOf(s) === ST.cat; });
  if (!shown.length) h += '<div class="card empty">' + (list.length ? T('noSwCat') : T('noSw')) + '</div>';
  CATS.forEach(function (c) {
    var g = shown.filter(function (s) { return catOf(s) === c[0]; }); if (!g.length) return;
    var y = yearsOf(c[0]);
    h += '<h2 style="margin-top:8px">' + catName(c[0]) + ' <span class="small muted">(' + (y.born_from ? y.born_from + '–' : '≤') + y.born_to + (y.born_from ? '' : '') + ') · ' + g.length + ' ' + T('ofSwimmers') + '</span></h2><div class="grid g3" style="margin-bottom:16px">';
    g.forEach(function (s) {
      var sc = sysScores(s, camp), n = recsOf(s.id).filter(function (r) { return campOf(r.date) === camp; }).length;
      h += '<div class="card sw" data-id="' + s.id + '"><div class="av">' + esc(K.initials(s.name)) + '</div><div class="sp" style="min-width:0"><b style="font-size:17px">' + esc(s.name) + '</b><div class="small muted">' + (s.group ? esc(s.group) + ' · ' : '') + n + ' ' + T('resultsOf').toLowerCase() + '</div>' +
        '<div class="row" style="gap:4px;margin-top:4px">' + SYS.map(function (k) { var v = sc[k]; var col = v == null ? '#c9d5ea' : v >= 60 ? 'var(--ok)' : v >= 40 ? 'var(--blue)' : 'var(--warn)'; return '<span title="' + T(k) + '" style="flex:1;height:6px;border-radius:3px;background:' + col + '"></span>'; }).join('') + '</div></div></div>';
    });
    h += '</div>';
  });
  app.innerHTML = h;
  bindCommon(function () { K.render(); });
  $$('[data-va]').forEach(function (b) { b.onclick = function () { K.ls('vo2_viewas', b.dataset.va || null); location.reload(); }; });
  $('#go-entry').onclick = function () { K.route('btEntry'); };
  $('#go-report').onclick = function () { K.route('btReport'); };
  $('#add').onclick = function () { K.route('swForm', { sid: null }); };
  $$('.sw').forEach(function (el) { el.onclick = function () { K.route('swimmer', { sid: el.dataset.id }); }; });
  if (!vHome.loaded) { vHome.loaded = true; K.load().then(function (r) { if (r && r.ok && K.S.view === 'home') K.render(); }).catch(function () {}); }
}

/* --- fiche nageur --- */
function vSwimmer(app) {
  var s = K.sw(K.S.sid); if (!s) return K.route('home');
  var camp = curCamp(), pc = prevCamp(camp), cat = catOf(s), sc = sysScores(s, camp), sp = sysScores(s, pc);
  var h = '<div class="row"><button class="btn sm" id="bk">← ' + T('swimmers') + '</button><span class="sp"></span>' + campSel() + '<button class="btn sm" id="pr">🖨</button><button class="btn sm" id="ed">✎ ' + T('edit') + '</button></div>' +
    '<div class="row" style="margin:12px 0"><div class="av" style="width:58px;height:58px;font-size:22px">' + esc(K.initials(s.name)) + '</div><div class="sp"><h1 style="margin:0">' + esc(s.name) + '</h1><div class="small muted"><span class="chip">' + catName(cat) + '</span> ' + (s.dob ? K.fmtDate(s.dob) : '') + (s.weight ? ' · <span class="ltr">' + esc(s.weight) + ' kg</span>' : '') + (s.group ? ' · ' + esc(s.group) : '') + '</div></div></div>';
  h += '<div class="grid g2"><div class="card"><h3>🕸 ' + T('radar') + '</h3><div class="chart" style="height:300px"><canvas id="ch-radar"></canvas></div><p class="small muted">' + T('scoreNote') + '</p></div><div class="card"><h3>' + T('bt_sys') + '</h3><table><tr><th></th><th>' + campName(camp) + '</th><th>' + campName(pc) + '</th></tr>' +
    SYS.map(function (k) { return '<tr><td style="text-align:start"><b>' + T(k) + '</b></td><td class="num">' + (sc[k] != null ? sc[k] : '—') + '</td><td class="num muted">' + (sp[k] != null ? sp[k] : '—') + '</td></tr>'; }).join('') + '</table></div></div>';
  [['water', ['AER', 'LAC', 'ALA']], ['land', ['END', 'MAX', 'POW', 'FLX']]].forEach(function (grp) {
    h += '<h2 style="margin-top:6px">' + T(grp[0]) + '</h2><div class="grid g2">';
    grp[1].forEach(function (k) {
      var list = testsForCat(cat).filter(function (t) { return t.sys === k; }); if (!list.length) return;
      h += '<div class="card"><h3>' + T(k) + '</h3><div class="tlist">';
      list.forEach(function (t) {
        var r = result(s, t.id, camp), p = result(s, t.id, pc), scv = score(s, t.id, camp), d = '';
        if (r && p && p.v) { var ch = (r.v - p.v) / p.v * 100; if (t.better === 'low') ch = -ch; d = '<span class="chip ' + (ch >= 0 ? 'ok' : 'bad') + '">' + (ch >= 0 ? '▲ ' : '▼ ') + R(Math.abs(ch), 1) + '%</span>'; }
        h += '<div class="it" data-test="' + t.id + '" style="cursor:pointer"><div class="sp"><b>' + tv(t.name) + '</b><div class="small muted">' + (r ? K.fmtDate(r.rec.date) + (r.extra ? ' · <span class="ltr">' + esc(r.extra) + '</span>' : '') : '＋ ' + T('addRes')) + (p ? ' · ' + T('before') + ' <span class="num">' + p.disp + '</span>' : '') + '</div></div>' +
          '<div style="text-align:end"><div class="num" style="font-size:19px;font-weight:700">' + (r ? r.disp : '—') + '</div>' + d + (scv != null ? ' <span class="chip">' + scv + '</span>' : '') + '</div></div>';
      });
      h += '</div></div>';
    });
    h += '</div>';
  });
  app.innerHTML = h;
  bindCommon(function () { K.render(); });
  $('#bk').onclick = function () { K.route('home'); };
  $('#ed').onclick = function () { K.route('swForm'); };
  $('#pr').onclick = function () { window.print(); };
  $$('[data-test]').forEach(function (b) { b.onclick = function () { ST.test = b.dataset.test; ST.one = s.id; K.route('btEntry'); }; });
  // radar
  var o = K.chartBase(); o.scales = { r: { min: 0, max: 100, ticks: { stepSize: 25, display: false }, pointLabels: { font: { size: 13 } } } };
  K.mk('ch-radar', { type: 'radar', data: { labels: SYS.map(function (k) { return T(k); }), datasets: [
    { label: campName(camp), data: SYS.map(function (k) { return sc[k]; }), borderColor: '#1d6bff', backgroundColor: 'rgba(29,107,255,.2)', borderWidth: 2.5, pointBackgroundColor: '#1d6bff' },
    { label: campName(pc), data: SYS.map(function (k) { return sp[k]; }), borderColor: '#9aabc9', backgroundColor: 'rgba(154,171,201,.12)', borderDash: [5, 4], pointRadius: 2 },
    { label: '50', data: SYS.map(function () { return 50; }), borderColor: 'rgba(232,163,23,.7)', backgroundColor: 'transparent', borderWidth: 1, pointRadius: 0 }] }, options: o });
}

/* --- saisie de groupe (ou individuelle) --- */
function vEntry(app) {
  var one = ST.one ? K.sw(ST.one) : null;
  var list = one ? [one] : K.visibleSwimmers().filter(function (s) { return (!ST.cat || catOf(s) === ST.cat) && (!ST.group || s.group === ST.group); }).sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
  var cat = one ? catOf(one) : ST.cat;
  var avail = cat ? testsForCat(cat) : TESTS;
  if (ST.test && !avail.some(function (t) { return t.id === ST.test; })) ST.test = '';
  var t = testById(ST.test);
  var groups = {}; K.visibleSwimmers().forEach(function (s) { if (s.group) groups[s.group] = 1; });
  var h = '<button class="btn sm" id="bk">← ' + (one ? esc(one.name) : T('home')) + '</button><h1>' + (one ? '📝 ' + esc(one.name) : T('entry')) + '</h1>';
  if (!one) h += '<div class="card"><div style="margin-bottom:10px">' + catChips(ST.cat, true) + '</div>' + (Object.keys(groups).length ? '<select id="grp" style="width:auto">' + '<option value="">' + T('allGroups') + '</option>' + Object.keys(groups).sort().map(function (g) { return '<option' + (ST.group === g ? ' selected' : '') + '>' + esc(g) + '</option>'; }).join('') + '</select>' : '') + '</div>';
  h += '<div class="card"><div class="fr"><div class="f"><label>' + T('chooseTest') + '</label><select id="tsel"><option value="">—</option>' +
    SYS.concat(['FLX']).map(function (k) { var g = avail.filter(function (x) { return x.sys === k; }); return g.length ? '<optgroup label="' + T(k) + '">' + g.map(function (x) { return '<option value="' + x.id + '"' + (x.id === ST.test ? ' selected' : '') + '>' + tv(x.name) + '</option>'; }).join('') + '</optgroup>' : ''; }).join('') + '</select></div>' +
    '<div class="f"><label>' + T('date') + '</label><input type="date" id="edate" value="' + (ST.date || K.today()) + '"></div></div></div>';
  if (t) {
    h += '<details class="guide" open><summary>' + T('guide') + '</summary><div class="gb">' + tv(t.g) + '</div></details>';
    if (!list.length) h += '<div class="card empty">' + T('noSwCat') + '</div>';
    else {
      h += '<div class="card"><div class="tbl-wrap"><table id="etab"><tr><th style="text-align:start">' + T('name') + '</th>' + t.inputs.map(function (i) { return '<th>' + esc(i.l) + (i.u ? ' (' + i.u + ')' : '') + (i.hint ? '<small>' + tv(i.hint) + '</small>' : '') + '</th>'; }).join('') + '<th>' + T('results') + '</th></tr>';
      var date = ST.date || K.today();
      list.forEach(function (s) {
        var ok = t.cats.indexOf(catOf(s, date)) >= 0, ex = recsOf(s.id).filter(function (r) { return r.data.test === t.id && r.date === date; })[0], d = ex ? ex.data : {};
        h += '<tr data-sid="' + s.id + '"' + (ex ? ' data-rid="' + ex.id + '"' : '') + '><td style="text-align:start;white-space:nowrap"><b>' + esc(s.name) + '</b>' + (!ok ? '<div class="small" style="color:var(--warn)">⚠ ' + T('notForCat') + '</div>' : '') + '</td>' +
          t.inputs.map(function (i) {
            if (i.t === 'sel') return '<td><select data-k="' + i.k + '">' + i.opts.map(function (o) { return '<option value="' + o[0] + '"' + (d[i.k] === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></td>';
            return '<td><input data-k="' + i.k + '" inputmode="decimal" value="' + esc(d[i.k]) + '" placeholder="' + (i.t === 'time' ? '0:00.0' : '') + '" style="min-width:76px"></td>';
          }).join('') + '<td class="num" data-out style="font-weight:700;white-space:nowrap">—</td></tr>';
      });
      h += '</table></div><div class="row" style="margin-top:12px"><button class="btn pri big" id="saveall">💾 ' + T('saveAll') + '</button></div></div>';
    }
  }
  app.innerHTML = h;
  $('#bk').onclick = function () { var o = ST.one; ST.one = null; o ? K.route('swimmer', { sid: o }) : K.route('home'); };
  $$('[data-cat]').forEach(function (b) { b.onclick = function () { ST.cat = b.dataset.cat; K.render(); }; });
  if ($('#grp')) $('#grp').onchange = function () { ST.group = this.value; K.render(); };
  $('#tsel').onchange = function () { ST.test = this.value; K.render(); };
  $('#edate').onchange = function () { ST.date = this.value; K.render(); };
  if (!t || !$('#etab')) return;
  function rowData(tr) { var d = { test: t.id }; $$('[data-k]', tr).forEach(function (i) { d[i.dataset.k] = i.value.trim(); }); return d; }
  function upd(tr) { var s = K.sw(tr.dataset.sid), r = t.calc(rowData(tr), s); $('[data-out]', tr).innerHTML = r ? r.disp + (r.extra ? '<div class="small muted ltr" style="font-weight:500">' + esc(r.extra) + '</div>' : '') : '—'; }
  $$('#etab tr[data-sid]').forEach(function (tr) { upd(tr); tr.addEventListener('input', function () { upd(tr); }); });
  $('#saveall').onclick = function () {
    var date = $('#edate').value || K.today(), n = 0;
    $$('#etab tr[data-sid]').forEach(function (tr) {
      var d = rowData(tr), has = t.inputs.some(function (i) { return i.t !== 'sel' && d[i.k]; });
      if (!has) return;
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
  var tests = testsForCat(ST.cat);
  var h = '<div class="row"><button class="btn sm" id="bk">← ' + T('home') + '</button><span class="sp"></span>' + campSel() + '<button class="btn sm" id="pr">' + T('printReport') + '</button></div><h1>' + T('report') + ' · ' + catName(ST.cat) + '</h1><div style="margin-bottom:12px">' + catChips(ST.cat, false) + '</div>';
  if (!list.length) h += '<div class="card empty">' + T('noSwCat') + '</div>';
  else {
    h += '<div class="card"><div class="tbl-wrap"><table><tr><th style="text-align:start">' + T('name') + '</th>' + SYS.map(function (k) { return '<th>' + T(k) + '</th>'; }).join('') + '</tr>' +
      list.map(function (s) { var sc = sysScores(s, camp); return '<tr><td style="text-align:start"><b>' + esc(s.name) + '</b></td>' + SYS.map(function (k) { var v = sc[k]; return '<td class="num" style="font-weight:700;color:' + (v == null ? 'var(--mute)' : v >= 60 ? 'var(--ok)' : v >= 40 ? 'var(--ink)' : 'var(--warn)') + '">' + (v != null ? v : '—') + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div></div>';
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

window.BTV = { views: { home: vHome, swimmer: vSwimmer, btEntry: vEntry, btReport: vReport }, settingsExtra: settingsExtra, settingsBind: settingsBind, TESTS: TESTS, catOf: catOf, campOf: campOf };
})();
