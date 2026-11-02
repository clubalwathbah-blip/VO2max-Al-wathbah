/* VO2max Al-Wathba — application */
(function () {
'use strict';
var C = window.VO2C;
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function uid() { return Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 6); }
var R = C.round, F = C.fmtTime;

/* ======================= i18n ======================= */
var LANG = ls('vo2_lang') || 'ar';
var D = {
  sub: ['قياس اللياقة الهوائية للسباحين', 'Aptitude aérobie des nageurs'],
  setupT: ['ربط التطبيق بملف البيانات', 'Relier l’application aux données'],
  setupP: ['ألصق رابط تطبيق الويب (Apps Script) اللي ينتهي بـ /exec. هذا يتدار مرة وحدة في كل جهاز.', 'Collez l’URL de l’application Web Apps Script (se termine par /exec). Une seule fois par appareil.'],
  apiUrl: ['رابط الخادم', 'URL du serveur'],
  demo: ['تجربة بلا خادم (البيانات تبقى في هذا الجهاز فقط)', 'Essai sans serveur (données sur cet appareil uniquement)'],
  next: ['التالي', 'Suivant'],
  pw: ['كلمة السر', 'Mot de passe'],
  pwFirst: ['أول دخول: كلمة السر اللي تكتبها دركا تولّي هي كلمة السر (6 خانات على الأقل).', 'Première connexion : le mot de passe saisi devient le mot de passe (6 caractères min.).'],
  login: ['دخول', 'Connexion'],
  bad: ['كلمة السر غالطة', 'Mot de passe incorrect'],
  locked: ['محاولات كثيرة، أعد بعد 15 دقيقة', 'Trop d’essais, réessayez dans 15 min'],
  short: ['كلمة السر لازم 6 خانات على الأقل', '6 caractères minimum'],
  neterr: ['ما قدرناش نوصلو للخادم. تأكد من الأنترنت والرابط.', 'Serveur injoignable. Vérifiez la connexion et l’URL.'],
  swimmers: ['السباحون', 'Nageurs'],
  addSw: ['سباح جديد', 'Nouveau nageur'],
  noSw: ['ما كاين حتى سباح. زيد أول واحد.', 'Aucun nageur. Ajoutez le premier.'],
  name: ['الاسم واللقب', 'Nom et prénom'],
  dob: ['تاريخ الميلاد', 'Date de naissance'],
  sex: ['الجنس', 'Sexe'], M: ['ذكر', 'Garçon'], Fm: ['أنثى', 'Fille'],
  height: ['الطول (سم)', 'Taille (cm)'], weight: ['الوزن (كغ)', 'Poids (kg)'],
  level: ['المستوى', 'Niveau'], comp: ['المنافسة', 'Compétition'],
  notes: ['ملاحظات', 'Notes'],
  save: ['حفظ', 'Enregistrer'], cancel: ['إلغاء', 'Annuler'], del: ['حذف', 'Supprimer'], edit: ['تعديل', 'Modifier'], back: ['رجوع', 'Retour'],
  saved: ['تم الحفظ', 'Enregistré'], deleted: ['تم الحذف', 'Supprimé'],
  confirmDel: ['متأكد من الحذف؟', 'Confirmer la suppression ?'],
  age: ['العمر', 'Âge'], yrs: ['سنة', 'ans'],
  vo2: ['VO2max', 'VO2max'], unit: ['مل/كغ/د', 'ml/kg/min'],
  estFinal: ['التقدير النهائي', 'Estimation finale'],
  margin: ['هامش الدقة', 'Marge'],
  ci95: ['المجال الأكيد 95%', 'Intervalle 95 %'],
  methods: ['حسب كل طريقة', 'Par méthode'],
  noVo2: ['باش يتحسب VO2max لازم اختبار Léger، ولا FC الراحة + FCmax.', 'Pour calculer la VO2max : un test Léger, ou FC repos + FCmax.'],
  leger: ['Léger 20 م (أرضي)', 'Léger 20 m (terrain)'],
  uth: ['النبض (Uth)', 'Fréquence cardiaque (Uth)'],
  tests: ['الاختبارات', 'Tests'], newTest: ['اختبار جديد', 'Nouveau test'], noTests: ['ما كاين حتى اختبار.', 'Aucun test.'],
  T_step: ['تصاعدي في الماء', 'Progressif en nage'],
  T_400: ['400 م بأقصى جهد', '400 m maximal'],
  T_css: ['السرعة الحرجة CSS', 'Vitesse critique (CSS)'],
  T_leger: ['Léger 20 م', 'Léger 20 m'],
  T_rest: ['نبض الراحة', 'FC de repos'],
  D_step: ['FCmax، منحنى النبض/السرعة، اللاكتات والعتبات', 'FCmax, courbe FC/vitesse, lactate et seuils'],
  D_400: ['سرعة VO2max في الماء + استرجاع النبض', 'Vitesse VO2max en nage + récupération'],
  D_css: ['سرعة العتبة الهوائية (400 + 200)', 'Allure seuil (400 + 200)'],
  D_leger: ['جري مكوكي بالبيبات، VO2max الأدق للأطفال', 'Navette avec bips, VO2max la plus fiable chez les jeunes'],
  D_rest: ['3 صباحات قبل النهوض', '3 matins avant le lever'],
  date: ['التاريخ', 'Date'], pool: ['المسبح', 'Bassin'],
  protocol: ['الشكل', 'Protocole'],
  rep: ['التكرار', 'Rép.'], time: ['الزمن', 'Temps'], hr: ['النبض', 'FC'], lac: ['لاكتات', 'Lactate'], rpe: ['التعب /10', 'RPE /10'], pace: ['/100 م', '/100 m'], sr: ['ضربات/د', 'Cycles/min'],
  hrSrc: ['مصدر النبض', 'Source FC'],
  manual: ['باليد', 'Manuel'], csv: ['ملف Polar', 'Fichier Polar'], bt: ['بلوتوث حي', 'Bluetooth direct'],
  hrmax: ['FCmax', 'FCmax'], hrrest: ['FC الراحة', 'FC repos'],
  hrmaxW: ['FCmax في الماء', 'FCmax nage'], hrmaxL: ['FCmax أرضي', 'FCmax terrain'],
  hr60: ['النبض بعد 60 ث', 'FC à +60 s'], hrEnd: ['النبض عند الوصول', 'FC à l’arrivée'],
  hrr: ['استرجاع 60 ث', 'Récup. 60 s'],
  results: ['النتائج', 'Résultats'],
  thresholds: ['العتبات', 'Seuils'],
  lt1: ['العتبة 1 (أساس +1)', 'Seuil 1 (base +1)'], lt2d: ['العتبة 2 (Dmax)', 'Seuil 2 (Dmax)'], lt2m: ['العتبة 2 (Dmax معدّل)', 'Seuil 2 (Dmax modifié)'], obla: ['4 mmol (OBLA)', '4 mmol (OBLA)'],
  vAtMax: ['السرعة عند FCmax', 'Vitesse à FCmax'],
  zones: ['مناطق النبض', 'Zones cardiaques'], pacesT: ['سرعات التدريب', 'Allures d’entraînement'],
  zSrcLac: ['محسوبة من اللاكتات', 'calées sur le lactate'], zSrcMax: ['محسوبة من FCmax', 'calculées sur FCmax'],
  Z1: ['استرجاع', 'Récupération'], Z2: ['هوائي أساسي A1-A2', 'Aérobie A1-A2'], Z3: ['عتبة EN', 'Seuil EN'], Z4: ['VO2max', 'VO2max'], Z5: ['لاكتيكي/سرعة', 'Lactique / vitesse'],
  css: ['CSS', 'CSS'], dprime: ['احتياط لاهوائي D′', 'Réserve anaérobie D′'],
  v400: ['سرعة 400', 'Allure 400'],
  history: ['التطور', 'Évolution'],
  hrCurve: ['منحنى النبض / السرعة', 'Courbe FC / vitesse'],
  lacCurve: ['منحنى اللاكتات', 'Courbe de lactate'],
  print: ['طباعة / PDF', 'Imprimer / PDF'],
  settings: ['الإعدادات', 'Paramètres'], logout: ['خروج', 'Déconnexion'],
  changePw: ['تبديل كلمة السر', 'Changer le mot de passe'], oldPw: ['كلمة السر الحالية', 'Mot de passe actuel'], newPw: ['كلمة السر الجديدة', 'Nouveau mot de passe'],
  backup: ['نسخة احتياطية (JSON)', 'Sauvegarde (JSON)'],
  connect: ['ربط Verity Sense', 'Connecter Verity Sense'], disconnect: ['قطع', 'Déconnecter'],
  btNo: ['البلوتوث يخدم غير في Chrome على أندرويد ولا الحاسوب.', 'Bluetooth : uniquement Chrome sur Android ou ordinateur.'],
  btTip: ['شغّل Verity Sense في وضع بث النبض (ماشي وضع التسجيل)، وقرّبو من الهاتف.', 'Mettez le Verity Sense en mode diffusion FC (pas en mode enregistrement), près du téléphone.'],
  btWater: ['البلوتوث ما يخدمش تحت الماء: النبض يتقرا كي يحبس السباح عند الحافة. للدقة الكاملة استعمل ملف Polar.', 'Le Bluetooth ne passe pas sous l’eau : la FC est lue à l’arrêt au mur. Pour une précision totale, utilisez le fichier Polar.'],
  capture: ['📍 سجّل نبض التكرار', '📍 Capturer la FC'],
  start60: ['⏱ وصل: عدّ 60 ث', '⏱ Arrivée : compter 60 s'],
  csvPick: ['اختار ملف CSV من Polar Flow', 'Choisir le CSV Polar Flow'],
  csvHelp: ['Polar Flow (الحاسوب) ← الحصة ← ⋯ ← Export session ← CSV', 'Polar Flow (web) ← séance ← ⋯ ← Exporter ← CSV'],
  offset: ['بداية التكرار 1 في التسجيل', 'Début rép. 1 dans l’enregistrement'],
  apply: ['طبّق النبض على الجدول', 'Appliquer au tableau'],
  csvOk: ['تقرا الملف', 'Fichier lu'], samples: ['قراءة', 'mesures'],
  csvErr: ['ما لقيناش عمود النبض في الملف', 'Colonne FC introuvable'],
  needTimes: ['اكتب الأزمنة أولاً', 'Saisissez d’abord les temps'],
  min3: ['لازم 3 تكرارات على الأقل', 'Au moins 3 répétitions'],
  lacHint: ['اللاكتات اختياري: كي يكون في 4 تكرارات ولا أكثر نحسبو العتبات.', 'Lactate facultatif : à partir de 4 mesures, calcul des seuils.'],
  run: ['تشغيل الاختبار', 'Lancer le test'], stop: ['توقف', 'Arrêt'], stage: ['المرحلة', 'Palier'], shuttle: ['الذهاب', 'Navette'], speed: ['السرعة', 'Vitesse'], elapsed: ['الوقت', 'Temps'],
  manualRes: ['ولا اكتب النتيجة باليد', 'Ou saisir le résultat'],
  stopAt: ['المرحلة والذهاب عند التوقف', 'Palier et navette à l’arrêt'],
  legerHelp: ['خطين بيناتهم 20 م بالضبط. مع كل بيب يلزم يكون في الخط. 3 بيبات = مرحلة جديدة. يتوقف كي ما يلحقش الخط مرتين متتابعين.', 'Deux lignes à 20 m exactement. À chaque bip il doit être sur la ligne. 3 bips = nouveau palier. Arrêt après 2 retards consécutifs.'],
  lastDone: ['آخر مرحلة كاملة', 'Dernier palier complet'],
  restHelp: ['الصباح، قبل ما ينوض: يلبس Verity Sense على الذراع، يبقى راقد 5 دقائق ساكت. نحسب متوسط آخر دقيقتين.', 'Le matin, avant le lever : Verity Sense au bras, 5 min allongé au calme. Moyenne des 2 dernières minutes.'],
  rec5: ['ابدا قياس 5 دقائق', 'Lancer 5 min de mesure'],
  morning: ['صباح', 'Matin'], avg: ['المتوسط', 'Moyenne'], rmssd: ['تغيّر النبض RMSSD', 'VFC RMSSD'],
  addRow: ['+ سطر', '+ ligne'],
  t400: ['زمن 400 م', 'Temps 400 m'], t200: ['زمن 200 م', 'Temps 200 m'], dist: ['المسافة', 'Distance'],
  lastTest: ['آخر اختبار', 'Dernier test'],
  waterNote: ['FCmax أرضي غير موجود: Uth محسوب بـ FCmax الماء (أقل عادة بـ 5-10 نبضات)، الهامش أوسع.', 'Pas de FCmax terrain : Uth calculé avec la FCmax nage (souvent 5-10 bpm plus basse), marge élargie.'],
  quality: ['جودة القياس', 'Qualité'], r2: ['ترابط النبض/السرعة', 'Corrélation FC/vitesse'],
  diverge: ['الطرق متباعدة: الهامش توسّع وحدو. عاود اختبار ولا تأكد من FCmax/FC الراحة.', 'Méthodes divergentes : marge élargie. Refaire un test ou vérifier FCmax/FC repos.'],
  precision: ['الدقة', 'Précision'],
  improve: ['باش تحسّن الدقة', 'Pour améliorer la précision'],
  impLeger: ['دير اختبار Léger', 'Faire un test Léger'], impRest: ['قيس FC الراحة 3 صباحات', 'Mesurer la FC repos 3 matins'], impMax: ['دير اختبار يعطي FCmax (Léger ولا تصاعدي)', 'Un test donnant la FCmax (Léger ou progressif)'],
  impRepeat: ['عاود نفس الاختبار بعد 6-8 أسابيع في نفس الظروف', 'Refaire le même test dans 6-8 semaines, mêmes conditions'],
  card: ['بطاقة السباح', 'Fiche nageur'],
  printed: ['طُبعت في', 'Imprimé le'],
  conn: ['متصل', 'connecté'],
  recording: ['تسجيل', 'Enregistrement'],
  done: ['انتهى', 'Terminé'],
  hrmaxOverride: ['FCmax معروفة (اختياري)', 'FCmax connue (facultatif)'],
  peak: ['أعلى نبض', 'FC pic'],
  all: ['الكل', 'Tout'],
  first: ['تم تسجيل كلمة السر ✅', 'Mot de passe défini ✅'],
  syncing: ['جارٍ الحفظ…', 'Enregistrement…'],
  offline: ['بلا أنترنت: الحفظ مؤجّل', 'Hors ligne : enregistrement différé'],
  pending: ['في الانتظار', 'en attente'],
  shuttlesTot: ['مجموع الذهابات', 'Navettes totales'],
  ageWarn: ['معادلة Léger مصادق عليها من 6 حتى 18 سنة.', 'Équation de Léger validée de 6 à 18 ans.'],
  autoOff: ['تقدير تلقائي', 'Auto'],
  method: ['الطريقة', 'Méthode'],
  value: ['القيمة', 'Valeur'],
  see: ['الخطأ المعياري', 'Erreur type'],
  sum: ['الملخص', 'Résumé'],
  vVO2: ['سرعة VO2max (vVO2max)', 'Vitesse VO2max (vVO2max)'],
  fromStep: ['من التصاعدي', 'du progressif'], from400: ['من 400 م', 'du 400 m'],
  hrrR: { exc: ['ممتاز', 'Excellent'], good: ['جيد', 'Bon'], avg: ['متوسط', 'Moyen'], low: ['ضعيف', 'Faible'], poor: ['ضعيف جداً', 'Très faible'] }
};
function T(k) { var v = D[k]; return v ? (LANG === 'fr' ? v[1] : v[0]) : k; }
function Tv(v) { return LANG === 'fr' ? v[1] : v[0]; }

/* ======================= backend ======================= */
var API = {
  url: function () { return ls('vo2_api') || ''; },
  tk: function () { return ls('vo2_tk') || ''; },
  call: function (a, p) {
    p = p || {}; p.a = a; p.tk = API.tk();
    if (API.url() === 'demo') return Promise.resolve(Local.call(p));
    return fetch(API.url(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p), redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (!r.ok && r.err === 'auth') { ls('vo2_tk', null); render(); throw new Error('auth'); } return r; });
  }
};
// serveur local (mode essai / tests)
var Local = {
  db: function () { try { return JSON.parse(ls('vo2_demo') || '{"s":[],"t":[]}'); } catch (e) { return { s: [], t: [] }; } },
  put: function (d) { ls('vo2_demo', JSON.stringify(d)); },
  call: function (p) {
    var d = Local.db();
    if (p.a === 'login') {
      if (!d.pw) { if (String(p.pw || '').length < 6) return { ok: false, err: 'short' }; d.pw = p.pw; Local.put(d); return { ok: true, tk: 'demo', first: true }; }
      return p.pw === d.pw ? { ok: true, tk: 'demo' } : { ok: false, err: 'bad' };
    }
    function up(arr, rec) { if (!rec.id) rec.id = uid(); rec.updated = new Date().toISOString(); var i = arr.findIndex(function (x) { return x.id === rec.id; }); if (i >= 0) arr[i] = rec; else arr.push(rec); return rec; }
    var r = { ok: true };
    if (p.a === 'all') { r.swimmers = d.s; r.tests = d.t; }
    else if (p.a === 'saveSwimmer') r.rec = up(d.s, p.rec);
    else if (p.a === 'saveTest') r.rec = up(d.t, p.rec);
    else if (p.a === 'delSwimmer') { d.s = d.s.filter(function (x) { return x.id !== p.id; }); d.t = d.t.filter(function (x) { return x.swimmerId !== p.id; }); }
    else if (p.a === 'delTest') d.t = d.t.filter(function (x) { return x.id !== p.id; });
    else if (p.a === 'changePw') { if (p.old !== d.pw) return { ok: false, err: 'bad' }; if (String(p.nw).length < 6) return { ok: false, err: 'short' }; d.pw = p.nw; }
    Local.put(d);
    return JSON.parse(JSON.stringify(r));
  }
};

/* ======================= état ======================= */
var DB = { swimmers: [], tests: [] };
try { var cache = JSON.parse(ls('vo2_cache') || 'null'); if (cache) DB = cache; } catch (e) {}
var QUEUE = []; try { QUEUE = JSON.parse(ls('vo2_queue') || '[]'); } catch (e) {}
var S = { view: 'home', sid: null, tid: null, type: null, tab: 'sum' };
function persist() { ls('vo2_cache', JSON.stringify(DB)); ls('vo2_queue', JSON.stringify(QUEUE)); }

function load() {
  return API.call('all').then(function (r) {
    if (r.ok) { DB = { swimmers: r.swimmers || [], tests: r.tests || [] }; applyQueueLocal(); persist(); }
    return r;
  });
}
function applyQueueLocal() {
  QUEUE.forEach(function (q) {
    var arr = q.a.indexOf('Swimmer') > 0 ? DB.swimmers : DB.tests;
    if (q.a.indexOf('save') === 0) { var i = arr.findIndex(function (x) { return x.id === q.rec.id; }); if (i >= 0) arr[i] = q.rec; else arr.push(q.rec); }
    else { var j = arr.findIndex(function (x) { return x.id === q.id; }); if (j >= 0) arr.splice(j, 1); }
  });
}
function mutate(a, payload) {
  // mise à jour optimiste + file d'attente si hors ligne
  var q = Object.assign({ a: a }, payload);
  QUEUE.push(q); applyQueueLocalOne(q); persist();
  return flush();
}
function applyQueueLocalOne(q) { var save = QUEUE; QUEUE = [q]; applyQueueLocal(); QUEUE = save; if (q.a === 'delSwimmer') DB.tests = DB.tests.filter(function (t) { return t.swimmerId !== q.id; }); }
var flushing = false;
function flush() {
  if (flushing || !QUEUE.length) return Promise.resolve();
  flushing = true;
  var q = QUEUE[0], p = Object.assign({}, q); delete p.a;
  return API.call(q.a, p).then(function (r) {
    flushing = false;
    if (r.ok) { QUEUE.shift(); persist(); return flush(); }
    toast(r.err || 'error');
  }).catch(function (e) { flushing = false; if (e.message !== 'auth') toast(T('offline')); });
}
window.addEventListener('online', flush);

/* ======================= aides ======================= */
function toast(m) { var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600); }
function sw(id) { return DB.swimmers.find(function (s) { return s.id === id; }); }
function testsOf(id) { return DB.tests.filter(function (t) { return t.swimmerId === id; }).sort(function (a, b) { return (b.date || '').localeCompare(a.date || '') || (b.updated || '').localeCompare(a.updated || ''); }); }
function ageOf(s, date) { return C.ageAt(s && s.dob, date); }
function paceStr(p) { return p ? F(p, 1) : '—'; }
function vPace(v) { return v ? F(100 / v, 1) : '—'; }
function n1(x) { return x == null ? '—' : R(x, 1); }
function n0(x) { return x == null ? '—' : Math.round(x); }
function initials(n) { return String(n || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
var ICON = { step: '📈', '400': '🏊', css: '⏱', leger: '🏃', rest: '😴' };
function fmtDate(d) { if (!d) return ''; var p = d.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }

/* ======================= analyse d'un nageur ======================= */
// renvoie les résultats calculés d'un test
function computeTest(t, s) {
  var d = t.data || {}, age = ageOf(s, t.date), r = { age: age };
  if (t.type === 'step') {
    var P = C.PROTOCOLS[d.protocol] || C.PROTOCOLS['7x200'];
    var st = C.stepTest((d.reps || []).map(function (x) { return { time: C.parseTime(x.time), hr: x.hr, lac: x.lac, rpe: x.rpe }; }), P.dist, { hrmax: C.num(d.hrmax) });
    r.step = st; r.hrmaxW = Math.max(st.hrPeak || 0, C.num(d.peak) || 0) || null;
    if (C.num(d.hr60) && st.hrPeak) r.hrr = (C.num(d.peak) || st.hrPeak) - C.num(d.hr60);
  } else if (t.type === '400') {
    r.m400 = C.max400(C.parseTime(d.time), d.hrEnd, d.hr60, C.num(d.dist) || 400);
    if (r.m400 && r.m400.hrr60 != null) r.hrr = r.m400.hrr60;
    r.hrmaxW = C.num(d.hrEnd) || null;
  } else if (t.type === 'css') {
    r.css = C.css(d.d1 || 400, C.parseTime(d.t1), d.d2 || 200, C.parseTime(d.t2));
    var d1 = C.num(d.d1) || 400; if (d1 === 400 && C.parseTime(d.t1)) r.p400 = C.parseTime(d.t1) / 4;
  } else if (t.type === 'leger') {
    var last = C.num(d.lastDone) != null ? C.num(d.lastDone) : C.legerLastCompleted(C.num(d.stage), C.num(d.shuttle));
    r.lastDone = last;
    r.leger = last >= 1 && age ? C.legerVO2(last, age) : null;
    r.hrmaxL = C.num(d.hrmax) || null;
    if (C.num(d.hr60) && r.hrmaxL) r.hrr = r.hrmaxL - C.num(d.hr60);
  } else if (t.type === 'rest') {
    r.rest = C.restHR((d.rows || []).map(function (x) { return x.bpm; }));
    var rm = (d.rows || []).map(function (x) { return C.num(x.rmssd); }).filter(function (x) { return x > 0; });
    if (rm.length) r.rmssd = rm.reduce(function (a, b) { return a + b; }, 0) / rm.length;
  }
  return r;
}

// profil consolidé à une date (par défaut aujourd'hui), à partir des tests jusqu'à cette date
function profile(s, upTo) {
  var all = testsOf(s.id).filter(function (t) { return !upTo || t.date <= upTo; });
  var P = { s: s, tests: all, date: upTo || today() };
  var age = ageOf(s, P.date); P.age = age;
  function latest(type, pred) { for (var i = 0; i < all.length; i++) if (all[i].type === type) { var r = computeTest(all[i], s); if (!pred || pred(r)) return { t: all[i], r: r }; } return null; }
  var recent = function (t) { return (new Date(P.date) - new Date(t.date)) / 864e5 <= 365; };
  // FCmax : max sur 12 mois par contexte
  var hrW = [], hrL = [];
  all.filter(recent).forEach(function (t) { var r = computeTest(t, s); if (r.hrmaxW) hrW.push(r.hrmaxW); if (r.hrmaxL) hrL.push(r.hrmaxL); });
  if (C.num(s.hrmaxKnown)) hrL.push(C.num(s.hrmaxKnown));
  P.hrmaxW = hrW.length ? Math.max.apply(null, hrW) : null;
  P.hrmaxL = hrL.length ? Math.max.apply(null, hrL) : null;
  var rest = latest('rest', function (r) { return r.rest; });
  P.hrrest = rest ? rest.r.rest.mean : null; P.restT = rest;
  var lg = latest('leger', function (r) { return r.leger; }); P.legerT = lg;
  var est = [];
  if (lg) est.push({ k: 'leger', vo2: lg.r.leger.vo2, see: lg.r.leger.see, date: lg.t.date });
  var hm = P.hrmaxL || P.hrmaxW;
  if (hm && P.hrrest) {
    var u = C.uthVO2(hm, P.hrrest, age);
    if (u) { if (!P.hrmaxL) { u.see += 1.5; u.water = true; } est.push({ k: 'uth', vo2: u.vo2, see: u.see, water: u.water, date: rest.t.date }); }
  }
  P.est = est; P.final = C.combine(est);
  if (P.final && est.length > 1) { var spread = Math.abs(est[0].vo2 - est[1].vo2); P.diverge = spread > 1.5 * Math.sqrt(est[0].see * est[0].see + est[1].see * est[1].see); }
  // nage
  var cs = latest('css', function (r) { return r.css; }); P.cssT = cs; P.cssPace = cs ? cs.r.css.pace : null; P.dprime = cs ? cs.r.css.dprime : null;
  var m4 = latest('400', function (r) { return r.m400; }); P.m400T = m4;
  P.p400 = m4 ? m4.r.m400.pace : cs && cs.r.p400 ? cs.r.p400 : null;
  var stp = latest('step', function (r) { return r.step && !r.step.error; }); P.stepT = stp;
  P.vVO2 = m4 ? m4.r.m400.v : P.p400 ? 100 / P.p400 : null;
  P.vAtMax = stp && stp.r.step.vAtHRmax ? stp.r.step.vAtHRmax : null;
  // seuils lactiques -> FC aux seuils
  var lt1hr = null, lt2hr = null;
  if (stp && stp.r.step.lactate) {
    var L = stp.r.step.lactate, reg = stp.r.step.hrRegAll;
    P.lac = L;
    var lt2 = L.mdmax || L.dmax || L.obla;
    if (reg && L.lt1) lt1hr = reg.a + reg.b * L.lt1;
    if (reg && lt2) lt2hr = reg.a + reg.b * lt2;
    if (!P.cssPace && lt2) P.cssPace = 100 / lt2;
  }
  P.zones = C.hrZones(P.hrmaxW || P.hrmaxL, P.hrrest, lt1hr, lt2hr);
  P.zonesHr = P.hrmaxW ? 'W' : P.hrmaxL ? 'L' : null;
  P.paces = C.paces(P.cssPace, P.p400);
  var hrrT = all.map(function (t) { return { t: t, r: computeTest(t, s) }; }).find(function (x) { return x.r.hrr != null; });
  P.hrr = hrrT ? hrrT.r.hrr : null;
  return P;
}

/* ======================= Bluetooth ======================= */
var BT = {
  dev: null, ch: null, hr: null, last: 0, rec: null, listeners: [], wantReconnect: false,
  supported: function () { return !!(navigator.bluetooth && navigator.bluetooth.requestDevice); },
  connect: function () {
    if (!BT.supported()) { toast(T('btNo')); return Promise.reject(new Error('nobt')); }
    return navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }], optionalServices: ['battery_service'] })
      .then(function (dev) { BT.dev = dev; BT.wantReconnect = true; dev.addEventListener('gattserverdisconnected', BT.onDisc); return BT.gatt(); });
  },
  gatt: function () {
    return BT.dev.gatt.connect().then(function (g) { return g.getPrimaryService('heart_rate'); })
      .then(function (sv) { return sv.getCharacteristic('heart_rate_measurement'); })
      .then(function (ch) { BT.ch = ch; ch.addEventListener('characteristicvaluechanged', BT.onVal); return ch.startNotifications(); })
      .then(function () { $('#bt-pill').classList.add('on'); BT.emit(); });
  },
  onDisc: function () {
    $('#bt-pill').classList.remove('on'); BT.hr = null; BT.emit();
    if (BT.wantReconnect && BT.dev) { var n = 0; (function retry() { if (!BT.wantReconnect || n++ > 30) return; BT.gatt().catch(function () { setTimeout(retry, 2000); }); })(); }
  },
  disconnect: function () { BT.wantReconnect = false; if (BT.dev && BT.dev.gatt.connected) BT.dev.gatt.disconnect(); BT.dev = null; $('#bt-pill').classList.remove('on'); BT.emit(); },
  onVal: function (e) {
    var dv = e.target.value, fl = dv.getUint8(0), i = 1, hr;
    if (fl & 1) { hr = dv.getUint16(i, true); i += 2; } else { hr = dv.getUint8(i); i += 1; }
    if (fl & 8) i += 2; // énergie dépensée
    var rr = [];
    if (fl & 16) for (; i + 1 < dv.byteLength; i += 2) rr.push(dv.getUint16(i, true) / 1024 * 1000);
    BT.hr = hr; BT.last = Date.now();
    $('#bt-hr').textContent = hr;
    if (BT.rec) { BT.rec.s.push({ t: (performance.now() - BT.rec.t0) / 1000, hr: hr }); Array.prototype.push.apply(BT.rec.rr, rr); }
    BT.emit();
  },
  startRec: function () { BT.rec = { t0: performance.now(), s: [], rr: [] }; },
  stopRec: function () { var r = BT.rec; BT.rec = null; return r; },
  maxLast: function (sec) { if (!BT.rec) return BT.hr; var t = (performance.now() - BT.rec.t0) / 1000, w = BT.rec.s.filter(function (x) { return x.t >= t - sec; }); return w.length ? Math.max.apply(null, w.map(function (x) { return x.hr; })) : BT.hr; },
  on: function (f) { BT.listeners.push(f); }, emit: function () { BT.listeners.forEach(function (f) { try { f(); } catch (e) {} }); }
};
BT.on(function () { var el = $('#live-hr'); if (el) el.innerHTML = (BT.hr != null ? BT.hr : '--') + ' <small>bpm</small>'; var st = $('#bt-state'); if (st) st.textContent = BT.dev && BT.hr != null ? '● ' + (BT.dev.name || 'Polar') + ' ' + T('conn') : ''; var b = $('#bt-btn'); if (b) b.textContent = BT.dev ? T('disconnect') : T('connect'); });

function btPanel(extra) {
  return '<div class="card"><div class="live"><div class="hr num" id="live-hr">' + (BT.hr != null ? BT.hr : '--') + ' <small>bpm</small></div>' +
    '<div class="sp"><button class="btn" id="bt-btn" type="button">' + (BT.dev ? T('disconnect') : T('connect')) + '</button> <span class="small" id="bt-state" style="color:var(--ok)"></span>' +
    '<div class="small muted" style="margin-top:6px">' + (BT.supported() ? T('btTip') : T('btNo')) + '</div></div></div>' + (extra || '') + '</div>';
}
function bindBt() { var b = $('#bt-btn'); if (b) b.onclick = function () { if (BT.dev) BT.disconnect(); else BT.connect().catch(function (e) { if (e.message !== 'nobt') toast(e.message); }); }; BT.emit(); }

/* ======================= Wake lock ======================= */
var wake = null;
function keepAwake(on) { try { if (on && navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { wake = w; }); else if (wake) { wake.release(); wake = null; } } catch (e) {} }

/* ======================= routage / rendu ======================= */
function route(v, o) { stopRunner(); Object.assign(S, { view: v }, o || {}); render(); window.scrollTo(0, 0); }
var charts = [];
function killCharts() { charts.forEach(function (c) { try { c.destroy(); } catch (e) {} }); charts = []; }
function render() {
  killCharts();
  document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'fr' ? 'ltr' : 'rtl';
  $('#lang-btn').textContent = LANG === 'fr' ? 'ع' : 'FR';
  $('#hd-sub').textContent = T('sub');
  var app = $('#app');
  if (!API.url()) return vSetup(app);
  if (!API.tk()) return vLogin(app);
  ({ home: vHome, swimmer: vSwimmer, swForm: vSwForm, test: vTest, settings: vSettings })[S.view](app);
}
$('#lang-btn').onclick = function () { LANG = LANG === 'fr' ? 'ar' : 'fr'; ls('vo2_lang', LANG); render(); };

/* ---------- setup & login ---------- */
function vSetup(app) {
  app.innerHTML = '<div class="login card"><img src="logo.png" alt=""><h2>' + T('setupT') + '</h2><p class="small muted">' + T('setupP') + '</p>' +
    '<div class="f"><label>' + T('apiUrl') + '</label><input id="api" class="ltr" placeholder="https://script.google.com/macros/s/…/exec"></div>' +
    '<button class="btn pri" id="go" style="width:100%">' + T('next') + '</button>' +
    '<p><a href="#" id="demo" class="small">' + T('demo') + '</a></p></div>';
  $('#go').onclick = function () { var u = $('#api').value.trim(); if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(u)) { toast(T('apiUrl') + ' ✗'); return; } ls('vo2_api', u); render(); };
  $('#demo').onclick = function (e) { e.preventDefault(); ls('vo2_api', 'demo'); render(); };
}
function vLogin(app) {
  app.innerHTML = '<form class="login card" id="lf"><img src="logo.png" alt=""><h2>VO2max</h2>' +
    '<div class="f"><label>' + T('pw') + '</label><input type="password" id="pw" autocomplete="current-password" class="ltr"></div>' +
    '<button class="btn pri" style="width:100%">' + T('login') + '</button><p class="small muted">' + T('pwFirst') + '</p>' +
    '<p><a href="#" id="chg" class="small">' + T('apiUrl') + ' ✎</a></p></form>';
  $('#pw').focus();
  $('#chg').onclick = function (e) { e.preventDefault(); ls('vo2_api', null); render(); };
  $('#lf').onsubmit = function (e) {
    e.preventDefault(); var b = $('#lf button'); b.disabled = true;
    API.call('login', { pw: $('#pw').value }).then(function (r) {
      b.disabled = false;
      if (!r.ok) { toast(T(r.err) || r.err); return; }
      ls('vo2_tk', r.tk); if (r.first) toast(T('first'));
      return load().then(function () { route('home'); });
    }).catch(function () { b.disabled = false; toast(T('neterr')); });
  };
}

/* ---------- accueil ---------- */
function vHome(app) {
  var list = DB.swimmers.slice().sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
  var h = '<div class="row"><h1 class="sp">' + T('swimmers') + '</h1><button class="btn" id="set">⚙</button><button class="btn pri" id="add">＋ ' + T('addSw') + '</button></div>';
  if (QUEUE.length) h += '<div class="note" style="margin-bottom:12px">⏳ ' + QUEUE.length + ' ' + T('pending') + '</div>';
  if (!list.length) h += '<div class="card empty">' + T('noSw') + '</div>';
  h += '<div class="grid g3">';
  list.forEach(function (s) {
    var P = profile(s), a = P.age;
    h += '<div class="card sw" data-id="' + s.id + '"><div class="av">' + esc(initials(s.name)) + '</div><div class="sp"><b>' + esc(s.name) + '</b><div class="small muted">' +
      (a ? Math.floor(a) + ' ' + T('yrs') : '') + (s.level ? ' · ' + T('level') + ' ' + (s.level == 7 ? T('comp') : s.level) : '') + ' · ' + P.tests.length + ' ' + T('tests') + '</div></div>' +
      '<div class="kpi" style="text-align:center"><div class="v num" style="font-size:28px">' + (P.final ? R(P.final.vo2, 1) : '—') + '</div><div class="l">VO2max</div></div></div>';
  });
  h += '</div>';
  app.innerHTML = h;
  $('#add').onclick = function () { route('swForm', { sid: null }); };
  $('#set').onclick = function () { route('settings'); };
  $$('.sw').forEach(function (el) { el.onclick = function () { route('swimmer', { sid: el.dataset.id, tab: 'sum' }); }; });
  // rafraîchir en arrière-plan
  if (!vHome.loaded) { vHome.loaded = true; load().then(function (r) { if (r && r.ok && S.view === 'home') render(); }).catch(function () {}); }
}

/* ---------- fiche nageur (formulaire) ---------- */
function vSwForm(app) {
  var s = S.sid ? sw(S.sid) : {};
  var lv = '<option value="">—</option>' + [1, 2, 3, 4, 5, 6, 7].map(function (n) { return '<option value="' + n + '"' + (String(s.level) === String(n) ? ' selected' : '') + '>' + (n === 7 ? T('comp') : T('level') + ' ' + n) + '</option>'; }).join('');
  app.innerHTML = '<button class="btn sm" id="bk">← ' + T('back') + '</button><h1>' + (S.sid ? esc(s.name) : T('addSw')) + '</h1><form class="card" id="sf">' +
    '<div class="f"><label>' + T('name') + '</label><input name="name" required value="' + esc(s.name) + '"></div>' +
    '<div class="fr"><div class="f"><label>' + T('dob') + '</label><input type="date" name="dob" required value="' + esc(s.dob) + '"></div>' +
    '<div class="f"><label>' + T('sex') + '</label><select name="sex"><option value="M">' + T('M') + '</option><option value="F"' + (s.sex === 'F' ? ' selected' : '') + '>' + T('Fm') + '</option></select></div>' +
    '<div class="f"><label>' + T('level') + '</label><select name="level">' + lv + '</select></div></div>' +
    '<div class="fr"><div class="f"><label>' + T('height') + '</label><input name="height" inputmode="decimal" class="num" value="' + esc(s.height) + '"></div>' +
    '<div class="f"><label>' + T('weight') + '</label><input name="weight" inputmode="decimal" class="num" value="' + esc(s.weight) + '"></div>' +
    '<div class="f"><label>' + T('hrmaxOverride') + '</label><input name="hrmaxKnown" inputmode="numeric" class="num" value="' + esc(s.hrmaxKnown) + '"></div></div>' +
    '<div class="f"><label>' + T('notes') + '</label><textarea name="notes" rows="2">' + esc(s.notes) + '</textarea></div>' +
    '<div class="row"><button class="btn pri">' + T('save') + '</button>' + (S.sid ? '<span class="sp"></span><button type="button" class="btn dan" id="dl">' + T('del') + '</button>' : '') + '</div></form>';
  $('#bk').onclick = function () { S.sid ? route('swimmer') : route('home'); };
  $('#sf').onsubmit = function (e) {
    e.preventDefault(); var f = e.target, rec = Object.assign({}, s);
    ['name', 'dob', 'sex', 'level', 'height', 'weight', 'hrmaxKnown', 'notes'].forEach(function (k) { rec[k] = f[k].value.trim(); });
    rec.id = rec.id || uid();
    // historique taille/poids
    rec.body = (s.body || []).slice();
    if (rec.height !== (s.height || '') || rec.weight !== (s.weight || '')) rec.body.push({ date: today(), h: rec.height, w: rec.weight });
    mutate('saveSwimmer', { rec: rec }); toast(T('saved')); route('swimmer', { sid: rec.id });
  };
  if (S.sid) $('#dl').onclick = function () { if (confirm(T('confirmDel'))) { mutate('delSwimmer', { id: S.sid }); toast(T('deleted')); route('home'); } };
}

/* ---------- page nageur ---------- */
function vSwimmer(app) {
  var s = sw(S.sid); if (!s) return route('home');
  var P = profile(s);
  var h = '<div class="row"><button class="btn sm" id="bk">← ' + T('swimmers') + '</button><span class="sp"></span><button class="btn sm" id="pr">🖨 ' + T('print') + '</button><button class="btn sm" id="ed">✎ ' + T('edit') + '</button></div>' +
    '<div class="row" style="margin:10px 0"><div class="av">' + esc(initials(s.name)) + '</div><div class="sp"><h1 style="margin:0">' + esc(s.name) + '</h1><div class="small muted">' +
    (P.age ? R(P.age, 1) + ' ' + T('yrs') : '') + (s.weight ? ' · <span class="ltr">' + esc(s.weight) + ' kg</span>' : '') + (s.height ? ' · <span class="ltr">' + esc(s.height) + ' cm</span>' : '') + (s.level ? ' · ' + T('level') + ' ' + (s.level == 7 ? T('comp') : s.level) : '') + '</div></div></div>';
  h += '<div class="tabs">' + ['sum', 'tests', 'history'].map(function (k) { return '<button class="btn sm' + (S.tab === k ? ' on' : '') + '" data-tab="' + k + '">' + T(k === 'sum' ? 'sum' : k) + '</button>'; }).join('') + '</div>';
  if (S.tab === 'sum') h += summaryHtml(P);
  else if (S.tab === 'tests') h += testsHtml(P);
  else h += '<div class="grid g2"><div class="card"><h3>VO2max</h3><div class="chart"><canvas id="ch-vo2"></canvas></div></div><div class="card"><h3>' + T('pacesT') + '</h3><div class="chart"><canvas id="ch-pace"></canvas></div></div>' +
    '<div class="card"><h3>' + T('hrCurve') + '</h3><div class="chart"><canvas id="ch-hrall"></canvas></div></div><div class="card"><h3>' + T('hrrest') + ' / ' + T('hrr') + '</h3><div class="chart"><canvas id="ch-rest"></canvas></div></div></div>';
  app.innerHTML = h;
  $('#bk').onclick = function () { route('home'); };
  $('#ed').onclick = function () { route('swForm'); };
  $('#pr').onclick = function () { printCard(s); };
  $$('[data-tab]').forEach(function (b) { b.onclick = function () { S.tab = b.dataset.tab; render(); }; });
  $$('[data-new]').forEach(function (b) { b.onclick = function () { route('test', { tid: null, type: b.dataset.new }); }; });
  $$('[data-tid]').forEach(function (b) { b.onclick = function () { var t = DB.tests.find(function (x) { return x.id === b.dataset.tid; }); route('test', { tid: t.id, type: t.type }); }; });
  if (S.tab === 'sum') drawSummaryCharts(P);
  if (S.tab === 'history') drawHistory(s);
}

function summaryHtml(P) {
  var h = '', f = P.final;
  // héros VO2max
  h += '<div class="card hero"><div class="row"><div class="kpi sp"><div class="l">' + T('estFinal') + ' · VO2max</div><div class="v num">' + (f ? R(f.vo2, 1) : '—') + ' <small style="color:rgba(255,255,255,.8)">' + T('unit') + '</small></div></div>';
  if (f) {
    h += '<div class="kpi" style="text-align:center"><div class="l">' + T('margin') + '</div><div class="v num" style="font-size:30px">± ' + R(f.se, 1) + '</div><div class="l">' + R(f.pct, 1) + ' %</div></div></div>';
    var lo = 25, hi = 75, pos = function (x) { return Math.max(0, Math.min(100, (x - lo) / (hi - lo) * 100)); };
    h += '<div class="bar"><i style="inset-inline-start:' + pos(f.ci95[0]) + '%;width:' + (pos(f.ci95[1]) - pos(f.ci95[0])) + '%"></i><b style="inset-inline-start:calc(' + pos(f.vo2) + '% - 2px)"></b></div>' +
      '<div class="row small muted" style="margin-top:6px"><span class="num">25</span><span class="sp" style="text-align:center">' + T('ci95') + ' : <span class="num">' + R(f.ci95[0], 1) + ' – ' + R(f.ci95[1], 1) + '</span></span><span class="num">75</span></div>';
  } else h += '</div><p class="muted" style="margin:8px 0 0">' + T('noVo2') + '</p>';
  h += '</div>';
  if (P.diverge) h += '<div class="note" style="margin-bottom:14px">⚠ ' + T('diverge') + '</div>';
  // méthodes
  h += '<div class="grid g2"><div class="card"><h3>' + T('methods') + '</h3>';
  if (!P.est.length) h += '<p class="muted small">' + T('noVo2') + '</p>';
  P.est.forEach(function (e) {
    h += '<div class="est"><div><b>' + T(e.k) + '</b><div class="small muted">' + fmtDate(e.date) + (e.k === 'uth' ? ' · ' + T('hrmax') + ' ' + n0(P.hrmaxL || P.hrmaxW) + ' / ' + T('hrrest') + ' ' + n1(P.hrrest) : ' · ' + T('lastDone') + ' ' + P.legerT.r.lastDone + ' (' + P.legerT.r.leger.V + ' km/h)') + '</div>' +
      (e.water ? '<div class="small" style="color:var(--warn)">' + T('waterNote') + '</div>' : '') + '</div><div class="num" style="font-size:24px;font-weight:700">' + R(e.vo2, 1) + ' <span class="small muted">± ' + R(e.see, 1) + '</span></div></div>';
  });
  // améliorer
  var imp = [];
  if (!P.legerT) imp.push(T('impLeger'));
  if (!P.hrrest) imp.push(T('impRest'));
  if (!P.hrmaxL && !P.hrmaxW) imp.push(T('impMax'));
  imp.push(T('impRepeat'));
  h += '<div class="info" style="margin-top:10px"><b>' + T('improve') + ' :</b><ul style="margin:4px 0 0;padding-inline-start:18px">' + imp.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div>';
  // indicateurs nage
  h += '<div class="card"><h3>' + T('results') + '</h3><div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">' +
    kpi(T('hrmaxW'), n0(P.hrmaxW), 'bpm') + kpi(T('hrmaxL'), n0(P.hrmaxL), 'bpm') + kpi(T('hrrest'), n1(P.hrrest), 'bpm') + kpi(T('hrr'), n0(P.hrr), 'bpm') +
    kpi(T('css'), paceStr(P.cssPace), T('pace')) + kpi(T('vVO2'), P.vVO2 ? vPace(P.vVO2) : '—', T('pace')) +
    kpi(T('vAtMax'), P.vAtMax ? vPace(P.vAtMax) : '—', T('pace')) + kpi(T('dprime'), P.dprime != null ? R(P.dprime, 0) : '—', 'm') +
    '</div></div></div>';
  // zones & allures
  h += '<div class="grid g2"><div class="card"><h3>' + T('zones') + '</h3>';
  if (P.zones) {
    var cols = ['var(--z1)', 'var(--z2)', 'var(--z3)', 'var(--z4)', 'var(--z5)'];
    h += '<table class="zone"><tr><th>Z</th><th></th><th>bpm</th><th>% FCmax</th></tr>' + P.zones.map(function (z, i) {
      var hm = P.hrmaxW || P.hrmaxL;
      return '<tr><td style="background:' + cols[i] + '">Z' + z.z + '</td><td>' + T('Z' + z.z) + '</td><td class="num">' + z.lo + ' – ' + z.hi + '</td><td class="num">' + Math.round(z.lo / hm * 100) + '–' + Math.round(z.hi / hm * 100) + '</td></tr>';
    }).join('') + '</table><p class="small muted">' + (P.zones.source === 'lactate' ? T('zSrcLac') : T('zSrcMax')) + ' · ' + (P.zonesHr === 'W' ? T('hrmaxW') : T('hrmaxL')) + '</p>';
  } else h += '<p class="muted small">' + T('impMax') + '</p>';
  h += '</div><div class="card"><h3>' + T('pacesT') + ' <span class="small muted">' + T('pace') + '</span></h3>';
  if (P.paces) {
    h += '<table><tr><th></th><th>' + T('pace') + '</th><th>' + T('zones') + '</th></tr>' + [['A1', 'Z2'], ['A2', 'Z2'], ['EN', 'Z3'], ['VO2', 'Z4'], ['SP', 'Z5']].map(function (k) {
      var p = P.paces[k[0]]; return '<tr><td><b>' + k[0] + '</b></td><td class="num">' + F(p[0], 0) + ' – ' + F(p[1], 0) + '</td><td>' + k[1] + '</td></tr>';
    }).join('') + '</table>';
  } else h += '<p class="muted small">' + T('T_css') + ' / ' + T('T_step') + '</p>';
  h += '</div></div>';
  // courbes du dernier progressif
  if (P.stepT) {
    h += '<div class="grid g2"><div class="card"><h3>' + T('hrCurve') + ' · ' + fmtDate(P.stepT.t.date) + '</h3><div class="chart"><canvas id="ch-hr"></canvas></div>' +
      (P.stepT.r.step.hrReg ? '<p class="small muted">' + T('r2') + ' : R² = <span class="num">' + R(P.stepT.r.step.hrReg.r2, 3) + '</span></p>' : '') + '</div>';
    if (P.lac) h += '<div class="card"><h3>' + T('lacCurve') + '</h3><div class="chart"><canvas id="ch-lac"></canvas></div>' + lacTable(P.lac, P.stepT.r.step.hrRegAll) + '</div>';
    h += '</div>';
  }
  return h;
}
function kpi(l, v, u) { return '<div class="kpi"><div class="l">' + l + '</div><div class="v num" style="font-size:24px">' + v + ' <small>' + (v === '—' ? '' : u) + '</small></div></div>'; }
function lacTable(L, reg) {
  var rows = [['lt1', L.lt1], ['lt2m', L.mdmax], ['lt2d', L.dmax], ['obla', L.obla]];
  return '<table><tr><th>' + T('thresholds') + '</th><th>' + T('pace') + '</th><th>' + T('hr') + '</th><th>mmol</th></tr>' + rows.map(function (r) {
    var v = r[1]; return '<tr><td>' + T(r[0]) + '</td><td class="num">' + (v ? vPace(v) : '—') + '</td><td class="num">' + (v && reg ? Math.round(reg.a + reg.b * v) : '—') + '</td><td class="num">' + (v && L.fit ? R(L.fit.f(v), 1) : '—') + '</td></tr>';
  }).join('') + '</table>';
}

function testsHtml(P) {
  var h = '<div class="card"><h3>' + T('newTest') + '</h3><div class="grid g3">' + ['step', '400', 'css', 'leger', 'rest'].map(function (k) {
    return '<button class="btn" style="justify-content:flex-start;text-align:start;min-height:64px" data-new="' + k + '"><span class="ic">' + ICON[k] + '</span><span><b>' + T('T_' + k) + '</b><br><span class="small muted" style="font-weight:400">' + T('D_' + k) + '</span></span></button>';
  }).join('') + '</div></div><div class="card tlist"><h3>' + T('tests') + '</h3>';
  if (!P.tests.length) h += '<p class="muted">' + T('noTests') + '</p>';
  P.tests.forEach(function (t) {
    var r = computeTest(t, P.s), k = '';
    if (t.type === 'step' && r.step && !r.step.error) k = T('peak') + ' ' + n0(r.hrmaxW) + ' · ' + (r.step.lactate ? 'LT2 ' + vPace(r.step.lactate.mdmax || r.step.lactate.dmax) : vPace(r.step.vLast));
    if (t.type === '400' && r.m400) k = F(r.m400.time, 2) + ' · ' + paceStr(r.m400.pace) + (r.hrr != null ? ' · HRR ' + n0(r.hrr) : '');
    if (t.type === 'css' && r.css) k = 'CSS ' + paceStr(r.css.pace);
    if (t.type === 'leger' && r.leger) k = T('stage') + ' ' + r.lastDone + ' · VO2 ' + R(r.leger.vo2, 1);
    if (t.type === 'rest' && r.rest) k = n1(r.rest.mean) + ' bpm' + (r.rmssd ? ' · RMSSD ' + n0(r.rmssd) : '');
    h += '<div class="it" data-tid="' + t.id + '" style="cursor:pointer"><span class="ic">' + ICON[t.type] + '</span><div class="sp"><b>' + T('T_' + t.type) + '</b><div class="small muted">' + fmtDate(t.date) + '</div></div><div class="num" style="font-size:17px">' + k + '</div></div>';
  });
  return h + '</div>';
}

/* ---------- graphiques ---------- */
var CH = { blue: '#1557c0', red: '#d23c3c', gold: '#d4a017', green: '#11875d', grey: '#9aa8bc' };
function chartBase() {
  Chart.defaults.font.family = '"Barlow Condensed","IBM Plex Sans Arabic",sans-serif'; Chart.defaults.font.size = 13; Chart.defaults.color = '#5b6b82';
  return { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { labels: { boxWidth: 12 } } } };
}
function paceAxis(title) { return { title: { display: true, text: title }, ticks: { callback: function (v) { return F(100 / v, 0); } } }; }
function mk(id, cfg) { var el = document.getElementById(id); if (!el || !window.Chart) return null; var c = new Chart(el, cfg); charts.push(c); return c; }

function drawSummaryCharts(P) {
  if (!P.stepT) return;
  var st = P.stepT.r.step, rows = st.rows.filter(function (r) { return r.hr; });
  var o = chartBase();
  var ds = [{ type: 'scatter', label: T('hr'), data: rows.map(function (r) { return { x: r.v, y: r.hr }; }), backgroundColor: CH.red, pointRadius: 5 }];
  if (st.hrRegAll) { var xs = rows.map(function (r) { return r.v; }), a = Math.min.apply(null, xs), b = Math.max.apply(null, xs); ds.push({ type: 'line', label: 'R²=' + R(st.hrRegAll.r2, 3), data: [{ x: a, y: st.hrRegAll.a + st.hrRegAll.b * a }, { x: b, y: st.hrRegAll.a + st.hrRegAll.b * b }], borderColor: CH.grey, borderDash: [5, 4], pointRadius: 0 }); }
  // anciens tests
  var prev = P.tests.filter(function (t) { return t.type === 'step' && t.id !== P.stepT.t.id; })[0];
  if (prev) { var pr = computeTest(prev, P.s).step; if (pr && pr.rows) ds.push({ type: 'scatter', label: fmtDate(prev.date), data: pr.rows.filter(function (r) { return r.hr; }).map(function (r) { return { x: r.v, y: r.hr }; }), backgroundColor: CH.grey, pointRadius: 4 }); }
  o.scales = { x: Object.assign({ type: 'linear' }, paceAxis(T('pace'))), y: { title: { display: true, text: 'bpm' } } };
  mk('ch-hr', { type: 'scatter', data: { datasets: ds }, options: o });
  if (P.lac && P.lac.fit) {
    var L = P.lac, lr = st.rows.filter(function (r) { return r.lac != null; }), x0 = Math.min.apply(null, lr.map(function (r) { return r.v; })), x1 = Math.max.apply(null, lr.map(function (r) { return r.v; }));
    var curve = []; for (var i = 0; i <= 40; i++) { var x = x0 + (x1 - x0) * i / 40; curve.push({ x: x, y: L.fit.f(x) }); }
    var marks = [['lt1', L.lt1, CH.green], ['lt2m', L.mdmax, CH.gold], ['obla', L.obla, CH.red]].filter(function (m) { return m[1]; });
    var o2 = chartBase(); o2.scales = { x: Object.assign({ type: 'linear' }, paceAxis(T('pace'))), y: { title: { display: true, text: 'mmol/L' }, min: 0 } };
    mk('ch-lac', { type: 'scatter', data: { datasets: [{ type: 'line', label: 'fit', data: curve, borderColor: CH.blue, pointRadius: 0, tension: .3 }, { label: T('lac'), data: lr.map(function (r) { return { x: r.v, y: r.lac }; }), backgroundColor: CH.blue, pointRadius: 5 }]
      .concat(marks.map(function (m) { return { label: T(m[0]), data: [{ x: m[1], y: 0 }, { x: m[1], y: L.fit.f(m[1]) }], type: 'line', borderColor: m[2], pointRadius: [0, 6], pointBackgroundColor: m[2], borderWidth: 2 }; })) }, options: o2 });
  }
}
function drawHistory(s) {
  var all = testsOf(s.id).slice().reverse(), dates = [];
  all.forEach(function (t) { if (dates.indexOf(t.date) < 0) dates.push(t.date); });
  var fin = [], lg = [], ut = [], lab = [];
  dates.forEach(function (d) {
    var P = profile(s, d); if (!P.final) return; lab.push(fmtDate(d));
    fin.push(R(P.final.vo2, 1));
    var a = P.est.find(function (e) { return e.k === 'leger'; }), b = P.est.find(function (e) { return e.k === 'uth'; });
    lg.push(a ? R(a.vo2, 1) : null); ut.push(b ? R(b.vo2, 1) : null);
  });
  var o = chartBase(); o.scales = { y: { title: { display: true, text: T('unit') } } }; o.spanGaps = true;
  mk('ch-vo2', { type: 'line', data: { labels: lab, datasets: [{ label: T('estFinal'), data: fin, borderColor: CH.blue, backgroundColor: CH.blue, borderWidth: 3 }, { label: 'Léger', data: lg, borderColor: CH.green, borderDash: [4, 3] }, { label: 'Uth', data: ut, borderColor: CH.red, borderDash: [4, 3] }] }, options: o });
  // allures
  var pl = [], css = [], p4 = [];
  all.forEach(function (t) { var r = computeTest(t, s); if (r.css || r.m400) { pl.push(fmtDate(t.date)); css.push(r.css ? R(r.css.pace, 1) : null); p4.push(r.m400 ? R(r.m400.pace, 1) : r.p400 ? R(r.p400, 1) : null); } });
  var o2 = chartBase(); o2.spanGaps = true; o2.scales = { y: { reverse: true, ticks: { callback: function (v) { return F(v, 0); } }, title: { display: true, text: T('pace') } } };
  mk('ch-pace', { type: 'line', data: { labels: pl, datasets: [{ label: 'CSS', data: css, borderColor: CH.blue }, { label: '400', data: p4, borderColor: CH.red }] }, options: o2 });
  // toutes les courbes FC/vitesse
  var cols = ['#c7d3e6', '#9db4d8', '#6f93cb', '#4072be', '#1557c0', '#0b3d91'], k = 0, ds = [];
  var steps = all.filter(function (t) { return t.type === 'step'; });
  steps.forEach(function (t, i) { var st = computeTest(t, s).step; if (!st || !st.rows) return; ds.push({ label: fmtDate(t.date), data: st.rows.filter(function (r) { return r.hr; }).map(function (r) { return { x: r.v, y: r.hr }; }), borderColor: cols[Math.max(0, cols.length - steps.length + i)], backgroundColor: cols[Math.max(0, cols.length - steps.length + i)], showLine: true }); });
  var o3 = chartBase(); o3.scales = { x: Object.assign({ type: 'linear' }, paceAxis(T('pace'))), y: { title: { display: true, text: 'bpm' } } };
  mk('ch-hrall', { type: 'scatter', data: { datasets: ds }, options: o3 });
  var rl = [], rv = [], hv = [];
  all.forEach(function (t) { var r = computeTest(t, s); if (r.rest || r.hrr != null) { rl.push(fmtDate(t.date)); rv.push(r.rest ? R(r.rest.mean, 1) : null); hv.push(r.hrr != null ? Math.round(r.hrr) : null); } });
  var o4 = chartBase(); o4.spanGaps = true;
  mk('ch-rest', { type: 'line', data: { labels: rl, datasets: [{ label: T('hrrest'), data: rv, borderColor: CH.blue }, { label: T('hrr'), data: hv, borderColor: CH.green }] }, options: o4 });
}

/* ======================= formulaires de test ======================= */
var TMP = {};
function vTest(app) {
  var s = sw(S.sid), t = S.tid ? DB.tests.find(function (x) { return x.id === S.tid; }) : null;
  t = t ? JSON.parse(JSON.stringify(t)) : { id: uid(), swimmerId: s.id, type: S.type, date: today(), data: {} };
  TMP = { t: t, s: s, samples: (t.data.samples ? unpack(t.data.samples) : null) };
  var h = '<button class="btn sm" id="bk">← ' + esc(s.name) + '</button><h1>' + ICON[t.type] + ' ' + T('T_' + t.type) + '</h1><form id="tf" autocomplete="off">' +
    '<div class="card"><div class="fr"><div class="f"><label>' + T('date') + '</label><input type="date" name="date" value="' + esc(t.date) + '"></div>' +
    (t.type !== 'leger' && t.type !== 'rest' ? '<div class="f"><label>' + T('pool') + '</label><select name="pool"><option value="25">25 m</option><option value="50"' + (t.data.pool == 50 ? ' selected' : '') + '>50 m</option></select></div>' : '') + '</div></div>';
  h += '<div id="form-body"></div>';
  h += '<div class="card"><div class="f"><label>' + T('notes') + '</label><textarea name="notes" rows="2">' + esc(t.notes) + '</textarea></div><div id="res"></div>' +
    '<div class="row"><button class="btn pri big" id="save">' + T('save') + '</button>' + (S.tid ? '<span class="sp"></span><button type="button" class="btn dan" id="dl">' + T('del') + '</button>' : '') + '</div></div></form>';
  app.innerHTML = h;
  $('#bk').onclick = function () { route('swimmer', { tab: 'tests' }); };
  if (S.tid) $('#dl').onclick = function () { if (confirm(T('confirmDel'))) { mutate('delTest', { id: t.id }); toast(T('deleted')); route('swimmer', { tab: 'tests' }); } };
  ({ step: fStep, '400': f400, css: fCss, leger: fLeger, rest: fRest })[t.type]($('#form-body'));
  $('#tf').addEventListener('input', liveResults);
  liveResults();
  $('#tf').onsubmit = function (e) {
    e.preventDefault();
    var rec = TMP.t; rec.date = e.target.date.value || today(); rec.notes = e.target.notes.value; rec.data = collect();
    if (TMP.samples && TMP.samples.length) rec.data.samples = pack(TMP.samples);
    mutate('saveTest', { rec: rec }); toast(T('saved')); route('swimmer', { tab: 'sum' });
  };
}
function pack(samples) { // [t,hr,…] réduit à 1 point / 2 s si long
  var step = samples.length > 4000 ? 2 : 1, out = [];
  for (var i = 0; i < samples.length; i += step) out.push(Math.round(samples[i].t), samples[i].hr);
  return out;
}
function unpack(a) { var o = []; for (var i = 0; i + 1 < a.length; i += 2) o.push({ t: a[i], hr: a[i + 1] }); return o; }
function val(n) { var el = document.querySelector('#tf [name="' + n + '"]'); return el ? el.value.trim() : ''; }
function setVal(n, v) { var el = document.querySelector('#tf [name="' + n + '"]'); if (el) { el.value = v == null ? '' : v; } }
function fieldsHtml(list) { return '<div class="fr">' + list.map(function (f) { return '<div class="f"><label>' + f[1] + '</label><input name="' + f[0] + '" class="num mono" inputmode="' + (f[2] || 'decimal') + '" placeholder="' + (f[3] || '') + '" value="' + esc((TMP.t.data || {})[f[0]]) + '"></div>'; }).join('') + '</div>'; }

function collect() {
  var t = TMP.t, d = { pool: val('pool') };
  if (t.type === 'step') {
    d.protocol = val('protocol'); var P = C.PROTOCOLS[d.protocol];
    d.reps = []; for (var i = 0; i < P.reps; i++) d.reps.push({ time: val('t' + i), hr: val('h' + i), lac: val('l' + i), rpe: val('r' + i) });
    d.hrmax = val('hrmax'); d.hr60 = val('hr60'); d.peak = val('peak'); d.hrSrc = TMP.src || t.data.hrSrc || 'manual'; d.offset = val('offset');
  } else if (t.type === '400') { ['dist', 'time', 'hrEnd', 'hr60', 'sr'].forEach(function (k) { d[k] = val(k); }); d.hrSrc = TMP.src || t.data.hrSrc; }
  else if (t.type === 'css') { ['d1', 't1', 'd2', 't2', 'hr1', 'hr2'].forEach(function (k) { d[k] = val(k); }); }
  else if (t.type === 'leger') { ['stage', 'shuttle', 'hrmax', 'hr60'].forEach(function (k) { d[k] = val(k); }); d.lastDone = ''; }
  else if (t.type === 'rest') { d.rows = $$('#rest-rows tr[data-i]').map(function (tr) { var i = tr.dataset.i; return { date: val('rd' + i), bpm: val('rb' + i), rmssd: val('rr' + i) }; }).filter(function (r) { return r.bpm; }); }
  return d;
}
function liveResults() {
  var t = TMP.t, d = collect(), r = computeTest({ type: t.type, date: val('date') || today(), data: d }, TMP.s), h = '';
  if (t.type === 'step' && r.step) {
    var st = r.step;
    if (st.error) h = '<p class="muted small">' + T('min3') + '</p>';
    else {
      h = '<div class="grid g3">' + kpi(T('peak'), n0(r.hrmaxW), 'bpm') + kpi(T('vAtMax'), st.vAtHRmax ? vPace(st.vAtHRmax) : '—', T('pace')) + kpi('R² ' + T('hr'), st.hrReg ? R(st.hrReg.r2, 3) : '—', '') + (r.hrr != null ? kpi(T('hrr'), n0(r.hrr), 'bpm') : '') + '</div>';
      if (st.lactate) h += lacTable(st.lactate, st.hrRegAll);
    }
    st.rows.forEach(function (row) { var el = $('#pc' + (row.i - 1)); if (el) el.textContent = paceStr(row.pace); });
  }
  if (t.type === '400' && r.m400) h = '<div class="grid g3">' + kpi(T('vVO2'), paceStr(r.m400.pace), T('pace')) + kpi(T('speed'), R(r.m400.v, 3), 'm/s') + (r.hrr != null ? kpi(T('hrr'), n0(r.hrr), 'bpm · ' + Tv(D.hrrR[C.hrrRating(r.hrr)])) : '') + '</div>';
  if (t.type === 'css' && r.css) h = '<div class="grid g3">' + kpi('CSS', paceStr(r.css.pace), T('pace')) + kpi(T('speed'), R(r.css.v, 3), 'm/s') + kpi(T('dprime'), R(r.css.dprime, 0), 'm') + '</div>';
  if (t.type === 'leger') {
    if (r.leger) h = '<div class="grid g3">' + kpi('VO2max', R(r.leger.vo2, 1), T('unit') + ' ± ' + r.leger.see) + kpi(T('lastDone'), r.lastDone, '· ' + r.leger.V + ' km/h') + (r.hrr != null ? kpi(T('hrr'), n0(r.hrr), 'bpm') : '') + '</div>';
    if (r.age && (r.age < 6 || r.age >= 18)) h += '<p class="note">' + T('ageWarn') + '</p>';
  }
  if (t.type === 'rest' && r.rest) h = '<div class="grid g3">' + kpi(T('avg'), n1(r.rest.mean), 'bpm') + kpi('SD', n1(r.rest.sd), 'bpm') + (r.rmssd ? kpi(T('rmssd'), n0(r.rmssd), 'ms') : '') + '</div>';
  var el = $('#res'); if (el) el.innerHTML = h ? '<h3>' + T('results') + '</h3>' + h + '<hr style="border:none;border-top:1px solid var(--line);margin:12px 0">' : '';
}

/* --- source FC (manuel / CSV / BT) --- */
function srcTabs(cur) { return '<div class="tabs">' + ['manual', 'csv', 'bt'].map(function (k) { return '<button type="button" class="btn sm' + (cur === k ? ' on' : '') + '" data-src="' + k + '">' + T(k) + '</button>'; }).join('') + '</div>'; }
function bindSrc(redraw) { $$('[data-src]').forEach(function (b) { b.onclick = function () { TMP.src = b.dataset.src; redraw(); }; }); }

/* --- progressif --- */
function fStep(box) {
  var d = TMP.t.data, s = TMP.s;
  var pid = d.protocol || C.protocolForLevel(s.level);
  TMP.src = TMP.src || d.hrSrc || 'manual';
  var P = C.PROTOCOLS[pid], keep = {};
  $$('#form-body input').forEach(function (i) { keep[i.name] = i.value; });
  var h = '<div class="card"><div class="fr"><div class="f"><label>' + T('protocol') + '</label><select name="protocol" id="proto">' + Object.keys(C.PROTOCOLS).map(function (k) { return '<option value="' + k + '"' + (k === pid ? ' selected' : '') + '>' + C.PROTOCOLS[k].label + '</option>'; }).join('') + '</select></div>' +
    '<div class="f"><label>' + T('hrmaxOverride') + '</label><input name="hrmax" class="num mono" inputmode="numeric" value="' + esc(keep.hrmax != null ? keep.hrmax : d.hrmax) + '"></div>' +
    '<div class="f"><label>' + T('hr60') + '</label><input name="hr60" class="num mono" inputmode="numeric" value="' + esc(keep.hr60 != null ? keep.hr60 : d.hr60) + '"></div></div>' +
    '<label>' + T('hrSrc') + '</label>' + srcTabs(TMP.src) + '<div id="src-box"></div><p class="small muted">' + T('lacHint') + '</p>' +
    '<input type="hidden" name="peak" value="' + esc(keep.peak != null ? keep.peak : d.peak) + '"><input type="hidden" name="offset" value="' + esc(keep.offset != null ? keep.offset : d.offset) + '">' +
    '<div class="tbl-wrap"><table><tr><th>' + T('rep') + '</th><th>' + T('time') + '</th><th>' + T('pace') + '</th><th>' + T('hr') + '</th><th>' + T('lac') + '</th><th>' + T('rpe') + '</th></tr>';
  for (var i = 0; i < P.reps; i++) {
    var r = (d.reps || [])[i] || {};
    var g = function (k, def) { return esc(keep[k + i] != null ? keep[k + i] : def); };
    h += '<tr><td><b>' + (i + 1) + '</b><div class="small muted">' + P.dist + 'm</div></td><td><input name="t' + i + '" class="num" inputmode="decimal" placeholder="2:45.0" value="' + g('t', r.time) + '"></td><td class="num" id="pc' + i + '">—</td>' +
      '<td><input name="h' + i + '" class="num" inputmode="numeric" value="' + g('h', r.hr) + '"></td><td><input name="l' + i + '" class="num" inputmode="decimal" value="' + g('l', r.lac) + '"></td><td><input name="r' + i + '" class="num" inputmode="numeric" value="' + g('r', r.rpe) + '" style="max-width:60px"></td></tr>';
  }
  h += '</table></div></div>';
  box.innerHTML = h;
  $('#proto').onchange = function () { TMP.t.data.protocol = this.value; fStep(box); liveResults(); };
  bindSrc(function () { fStep(box); liveResults(); });
  srcBox('step');
}
function srcBox(kind) {
  var b = $('#src-box'); if (!b) return;
  if (TMP.src === 'manual') { b.innerHTML = ''; return; }
  if (TMP.src === 'bt') {
    var btn = kind === 'step' ? '<button type="button" class="btn pri big" id="cap" style="margin-top:10px">' + T('capture') + '</button>' : kind === '400' ? '<button type="button" class="btn pri big" id="cap60" style="margin-top:10px">' + T('start60') + '</button> <span id="cd" class="num" style="font-size:28px"></span>' : '';
    b.innerHTML = btPanel('<div class="note" style="margin-top:8px">' + T('btWater') + '</div>' + btn);
    bindBt();
    if (!BT.rec) BT.startRec();
    if ($('#cap')) $('#cap').onclick = function () {
      var P = C.PROTOCOLS[val('protocol')], hr = BT.maxLast(15);
      for (var i = 0; i < P.reps; i++) if (!val('h' + i)) { setVal('h' + i, hr); break; }
      var pk = Math.max(C.num(val('peak')) || 0, hr || 0); setVal('peak', pk || '');
      liveResults();
    };
    if ($('#cap60')) $('#cap60').onclick = function () {
      setVal('hrEnd', BT.maxLast(10)); liveResults(); var n = 60, cd = $('#cd');
      var iv = setInterval(function () { n--; if (cd) cd.textContent = n + ' s'; if (n <= 0) { clearInterval(iv); setVal('hr60', BT.hr); liveResults(); beep(880, .3); } }, 1000);
    };
    return;
  }
  // CSV
  b.innerHTML = '<div class="card" style="background:#f7f9fc"><div class="small muted">' + T('csvHelp') + '</div><input type="file" id="csvf" accept=".csv,text/csv" style="margin:8px 0">' +
    '<div id="csv-info" class="small"></div>' + (kind === 'step' ? '<div class="fr" id="off-row" style="display:none"><div class="f"><label>' + T('offset') + '</label><input id="offs" class="num mono" placeholder="mm:ss"></div><div class="f" style="align-self:end"><button type="button" class="btn pri" id="applyc">' + T('apply') + '</button></div></div>' : '') +
    '<div class="chart" id="csv-ch-w" style="display:none;height:220px"><canvas id="csv-ch"></canvas></div></div>';
  $('#csvf').onchange = function (e) {
    var file = e.target.files[0]; if (!file) return;
    var rd = new FileReader(); rd.onload = function () {
      var p = C.parsePolarCSV(rd.result);
      if (p.error || !p.samples.length) { $('#csv-info').textContent = T('csvErr'); return; }
      TMP.samples = p.samples; csvReady(kind, true);
    }; rd.readAsText(file);
  };
  if (TMP.samples) csvReady(kind, false);
}
var csvChart = null;
function csvReady(kind, fresh) {
  var smp = TMP.samples, pk = Math.max.apply(null, smp.map(function (x) { return x.hr; }));
  $('#csv-info').innerHTML = '✅ ' + T('csvOk') + ' : <span class="num">' + smp.length + '</span> ' + T('samples') + ' · ' + T('peak') + ' <b class="num">' + pk + '</b> bpm';
  $('#csv-ch-w').style.display = '';
  if (kind === 'step') {
    var P = C.PROTOCOLS[val('protocol')];
    $('#off-row').style.display = '';
    if (!$('#offs').value) $('#offs').value = val('offset') || F(C.guessOffset(smp, P.cycle, P.reps), 0);
    $('#offs').oninput = drawCsv; drawCsv();
    $('#applyc').onclick = function () {
      var times = []; for (var i = 0; i < P.reps; i++) times.push(C.parseTime(val('t' + i)));
      if (!times.filter(Boolean).length) { toast(T('needTimes')); return; }
      var off = C.parseTime($('#offs').value) || 0, al = C.alignReps(smp, off, P.cycle, times);
      al.reps.forEach(function (r, i) { if (r) setVal('h' + i, r.hr); });
      setVal('peak', al.peak); setVal('offset', $('#offs').value); if (al.hr60) setVal('hr60', Math.round(al.hr60));
      liveResults(); drawCsv(); toast('✓');
    };
  } else if (!fresh) { drawCsv();
  } else if (kind === '400') {
    var i = smp.findIndex(function (x) { return x.hr === pk; }), t60 = smp[i].t + 60, a = smp.filter(function (x) { return Math.abs(x.t - t60) <= 2; });
    setVal('hrEnd', pk); if (a.length) setVal('hr60', Math.round(a.reduce(function (s, x) { return s + x.hr; }, 0) / a.length));
    liveResults(); drawCsv();
  } else if (kind === 'leger') {
    setVal('hrmax', pk); var j = smp.findIndex(function (x) { return x.hr === pk; }), b = smp.filter(function (x) { return Math.abs(x.t - (smp[j].t + 60)) <= 2; });
    if (b.length) setVal('hr60', Math.round(b.reduce(function (s, x) { return s + x.hr; }, 0) / b.length)); liveResults(); drawCsv();
  } else if (kind === 'rest') {
    var rr = C.restFromRecording(smp, 120); if (rr) addRestRow(R(rr.mean, 1)); drawCsv();
  }
}
function drawCsv() {
  if (csvChart) { try { csvChart.destroy(); } catch (e) {} }
  var smp = TMP.samples, el = $('#csv-ch'); if (!el || !window.Chart) return;
  var marks = [];
  if (TMP.t.type === 'step') {
    var P = C.PROTOCOLS[val('protocol')], off = C.parseTime($('#offs') && $('#offs').value) || 0;
    for (var i = 0; i < P.reps; i++) { var t = C.parseTime(val('t' + i)); marks.push({ x: (off + i * P.cycle) / 60, e: t ? (off + i * P.cycle + t) / 60 : null }); }
  }
  var o = chartBase(); o.plugins.legend = { display: false };
  o.scales = { x: { type: 'linear', title: { display: true, text: 'min' } }, y: { title: { display: true, text: 'bpm' } } };
  var ds = [{ type: 'line', data: smp.map(function (x) { return { x: x.t / 60, y: x.hr }; }), borderColor: CH.red, borderWidth: 1.5, pointRadius: 0 }];
  var lo = Math.min.apply(null, smp.map(function (x) { return x.hr; })), hi = Math.max.apply(null, smp.map(function (x) { return x.hr; }));
  marks.forEach(function (m, i) {
    ds.push({ type: 'line', data: [{ x: m.x, y: lo }, { x: m.x, y: hi }], borderColor: 'rgba(21,87,192,.35)', borderWidth: 1, pointRadius: 0 });
    if (m.e) ds.push({ type: 'line', data: [{ x: m.e, y: lo }, { x: m.e, y: hi }], borderColor: CH.blue, borderWidth: 2, pointRadius: 0 });
  });
  csvChart = new Chart(el, { type: 'scatter', data: { datasets: ds }, options: o }); charts.push(csvChart);
}

/* --- 400 m --- */
function f400(box) {
  TMP.src = TMP.src || TMP.t.data.hrSrc || 'manual';
  if (!TMP.t.data.dist) TMP.t.data.dist = 400;
  var keep = {}; $$('#form-body input').forEach(function (i) { keep[i.name] = i.value; }); Object.assign(TMP.t.data, keep);
  box.innerHTML = '<div class="card">' + fieldsHtml([['dist', T('dist') + ' (m)', 'numeric'], ['time', T('time'), 'decimal', '5:15.0'], ['sr', T('sr'), 'decimal']]) +
    '<label>' + T('hrSrc') + '</label>' + srcTabs(TMP.src) + '<div id="src-box"></div>' + fieldsHtml([['hrEnd', T('hrEnd'), 'numeric'], ['hr60', T('hr60'), 'numeric']]) + '</div>';
  bindSrc(function () { f400(box); liveResults(); }); srcBox('400');
}
/* --- CSS --- */
function fCss(box) {
  var d = TMP.t.data; if (!d.d1) { d.d1 = 400; d.d2 = 200; }
  box.innerHTML = '<div class="card"><div class="info small" style="margin-bottom:10px">400 m + 200 m · 15–20 min</div>' +
    fieldsHtml([['d1', T('dist') + ' 1 (m)', 'numeric'], ['t1', T('time') + ' 1', 'decimal', '5:15.0'], ['hr1', T('hr') + ' 1', 'numeric']]) +
    fieldsHtml([['d2', T('dist') + ' 2 (m)', 'numeric'], ['t2', T('time') + ' 2', 'decimal', '2:30.0'], ['hr2', T('hr') + ' 2', 'numeric']]) + '</div>';
}
/* --- Léger --- */
function fLeger(box) {
  TMP.src = TMP.src || 'run';
  box.innerHTML = '<div class="card"><div class="info small">' + T('legerHelp') + '</div></div>' + btPanel() +
    '<div class="card runner" id="runner"><div class="small muted">' + T('stage') + '</div><div class="stage num" id="r-stage">1</div>' +
    '<div class="meta"><div><span class="small muted">' + T('shuttle') + '</span><b class="num" id="r-sh">0 / 7</b></div><div><span class="small muted">' + T('speed') + '</span><b class="num" id="r-sp">8.5</b></div><div><span class="small muted">' + T('elapsed') + '</span><b class="num" id="r-t">0:00</b></div><div><span class="small muted">FC</span><b class="num" id="r-hr" style="color:var(--bad)">--</b></div></div>' +
    '<div class="prog"><i id="r-pg" style="width:0"></i></div><div class="row" style="justify-content:center;margin-top:16px"><button type="button" class="btn pri big" id="r-go">▶ ' + T('run') + '</button></div></div>' +
    '<div class="card"><h3>' + T('manualRes') + '</h3>' + fieldsHtml([['stage', T('stage'), 'numeric'], ['shuttle', T('shuttle'), 'numeric'], ['hrmax', T('hrmax'), 'numeric'], ['hr60', T('hr60'), 'numeric']]) +
    '<label>' + T('csv') + '</label>' + '<div id="src-box"></div></div>';
  bindBt(); TMP.src = 'csv'; srcBox('leger'); TMP.src = 'run';
  $('#r-go').onclick = function () { RUN.on ? RUN.stop() : RUN.start(); };
}
var actx = null;
function beep(f, d, when) {
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(), t = when || actx.currentTime; o.frequency.value = f; o.type = 'square'; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.5, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + .02); } catch (e) {}
}
var RUN = {
  on: false, iv: null,
  start: function () {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.resume) actx.resume();
    RUN.on = true; RUN.stage = 1; RUN.sh = 0; RUN.t0 = performance.now(); RUN.next = C.legerInterval(1); RUN.stageStart = 0; RUN.hrmax = 0;
    if (BT.dev) BT.startRec();
    keepAwake(true);
    // compte à rebours 5 s
    RUN.t0 += 5000; RUN.next += 0;
    for (var k = 0; k <= 5; k++) beep(k < 5 ? 600 : 1000, k < 5 ? .12 : .3, actx.currentTime + k * 1.0 + .01);
    $('#r-go').textContent = '■ ' + T('stop'); $('#r-go').classList.remove('pri'); $('#r-go').classList.add('dan');
    RUN.iv = setInterval(RUN.tick, 40);
  },
  tick: function () {
    var el = (performance.now() - RUN.t0) / 1000;
    if (BT.hr) { RUN.hrmax = Math.max(RUN.hrmax, BT.hr); $('#r-hr').textContent = BT.hr; }
    if (el < 0) { $('#r-t').textContent = Math.ceil(-el) + ''; return; }
    if (el >= RUN.next) {
      RUN.sh++;
      var n = C.legerShuttles(RUN.stage);
      if (RUN.sh >= n) { // nouveau palier
        RUN.stage++; RUN.sh = 0; RUN.stageStart = RUN.next;
        beep(1000, .12); beep(1000, .12, actx.currentTime + .2); beep(1000, .12, actx.currentTime + .4);
      } else beep(880, .18);
      RUN.next += C.legerInterval(RUN.stage);
    }
    var n2 = C.legerShuttles(RUN.stage), iv = C.legerInterval(RUN.stage), into = (el - (RUN.next - iv)) / iv;
    $('#r-stage').textContent = RUN.stage; $('#r-sh').textContent = RUN.sh + ' / ' + n2; $('#r-sp').textContent = C.legerSpeed(RUN.stage).toFixed(1);
    $('#r-t').textContent = F(el, 0); $('#r-pg').style.width = Math.min(100, ((RUN.sh + into) / n2) * 100) + '%';
  },
  stop: function () {
    clearInterval(RUN.iv); RUN.on = false; keepAwake(false);
    setVal('stage', RUN.stage); setVal('shuttle', RUN.sh);
    var rec = BT.dev ? BT.stopRec() : null;
    if (rec && rec.s.length) { TMP.samples = rec.s; var pk = Math.max.apply(null, rec.s.map(function (x) { return x.hr; })); setVal('hrmax', pk); }
    else if (RUN.hrmax) setVal('hrmax', RUN.hrmax);
    $('#r-go').textContent = '▶ ' + T('run'); $('#r-go').classList.add('pri'); $('#r-go').classList.remove('dan');
    liveResults(); beep(400, .5);
    // FC à +60 s
    if (BT.dev) { var cnt = 60; var w = setInterval(function () { cnt--; $('#r-t').textContent = '+' + (60 - cnt) + ' s'; if (cnt <= 0) { clearInterval(w); setVal('hr60', BT.hr); liveResults(); beep(880, .3); } }, 1000); }
  }
};
function stopRunner() { if (RUN.on) { clearInterval(RUN.iv); RUN.on = false; keepAwake(false); } }

/* --- FC repos --- */
function fRest(box) {
  var rows = (TMP.t.data.rows || []).slice(); while (rows.length < 3) rows.push({});
  box.innerHTML = '<div class="card"><div class="info small">' + T('restHelp') + '</div></div>' + btPanel('<div class="row" style="margin-top:10px"><button type="button" class="btn pri" id="rec5">⏺ ' + T('rec5') + '</button><span class="num" id="rec-t" style="font-size:24px"></span></div>') +
    '<div class="card"><table id="rest-rows"><tr><th>' + T('morning') + '</th><th>' + T('date') + '</th><th>bpm</th><th>RMSSD</th></tr></table><button type="button" class="btn sm" id="addr" style="margin-top:8px">' + T('addRow') + '</button>' +
    '<div style="margin-top:10px"><label>' + T('csv') + '</label><div id="src-box"></div></div></div>';
  rows.forEach(function (r) { addRestRow(r.bpm, r.date, r.rmssd, true); });
  $('#addr').onclick = function () { addRestRow('', '', '', true); };
  bindBt(); TMP.src = 'csv'; srcBox('rest');
  $('#rec5').onclick = function () {
    if (!BT.dev) { toast(T('connect')); return; }
    BT.startRec(); keepAwake(true); var t0 = Date.now(), b = this; b.disabled = true;
    var iv = setInterval(function () {
      var el = (Date.now() - t0) / 1000; $('#rec-t').textContent = F(300 - el, 0);
      if (el >= 300 || S.view !== 'test') {
        clearInterval(iv); keepAwake(false); b.disabled = false; var rec = BT.stopRec(); if (!rec) return;
        var m = C.restFromRecording(rec.s, 120), rm = C.rmssd(rec.rr.slice(-200));
        if (m) addRestRow(R(m.mean, 1), today(), rm ? R(rm, 0) : ''); beep(880, .3); $('#rec-t').textContent = T('done');
      }
    }, 500);
  };
}
var restN = 0;
function addRestRow(bpm, date, rmssd, initial) {
  var tb = $('#rest-rows'); if (!tb) return;
  if (!initial) { // remplir la 1re ligne vide
    var empty = $$('#rest-rows tr[data-i]').find(function (tr) { return !val('rb' + tr.dataset.i); });
    if (empty) { var k = empty.dataset.i; setVal('rb' + k, bpm); setVal('rd' + k, date || today()); setVal('rr' + k, rmssd || ''); liveResults(); return; }
  }
  var i = restN++, tr = document.createElement('tr'); tr.dataset.i = i;
  tr.innerHTML = '<td>' + ($$('#rest-rows tr[data-i]').length + 1) + '</td><td><input type="date" name="rd' + i + '" value="' + esc(date || '') + '"></td><td><input name="rb' + i + '" class="num" inputmode="decimal" value="' + esc(bpm || '') + '"></td><td><input name="rr' + i + '" class="num" inputmode="numeric" value="' + esc(rmssd || '') + '"></td>';
  tb.appendChild(tr); if (!initial) liveResults();
}

/* ======================= paramètres ======================= */
function vSettings(app) {
  app.innerHTML = '<button class="btn sm" id="bk">← ' + T('back') + '</button><h1>' + T('settings') + '</h1>' +
    '<form class="card" id="pwf"><h3>' + T('changePw') + '</h3><div class="fr"><div class="f"><label>' + T('oldPw') + '</label><input type="password" name="o"></div><div class="f"><label>' + T('newPw') + '</label><input type="password" name="n"></div></div><button class="btn pri">' + T('save') + '</button></form>' +
    '<div class="card"><h3>' + T('apiUrl') + '</h3><p class="small ltr muted" style="word-break:break-all">' + esc(API.url()) + '</p><div class="row"><button class="btn" id="bkp">⬇ ' + T('backup') + '</button><button class="btn" id="chg">' + T('apiUrl') + ' ✎</button><span class="sp"></span><button class="btn dan" id="lo">' + T('logout') + '</button></div></div>';
  $('#bk').onclick = function () { route('home'); };
  $('#pwf').onsubmit = function (e) { e.preventDefault(); API.call('changePw', { old: e.target.o.value, nw: e.target.n.value }).then(function (r) { toast(r.ok ? T('saved') : T(r.err)); if (r.ok) e.target.reset(); }).catch(function () { toast(T('neterr')); }); };
  $('#lo').onclick = function () { ls('vo2_tk', null); BT.disconnect(); render(); };
  $('#chg').onclick = function () { if (confirm(T('apiUrl') + ' ?')) { ls('vo2_api', null); ls('vo2_tk', null); render(); } };
  $('#bkp').onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(DB, null, 1)], { type: 'application/json' })); a.download = 'vo2max-wathba-' + today() + '.json'; a.click(); };
}

/* ======================= impression ======================= */
function printCard(s) {
  var P = profile(s), f = P.final;
  // images des graphiques affichés
  var imgs = charts.map(function (c) { try { return '<img src="' + c.toBase64Image() + '" style="width:100%;max-height:230px;object-fit:contain">'; } catch (e) { return ''; } }).filter(Boolean);
  var h = '<div style="font-family:IBM Plex Sans Arabic,sans-serif" dir="' + (LANG === 'fr' ? 'ltr' : 'rtl') + '">' +
    '<div style="display:flex;align-items:center;gap:14px;border-bottom:3px solid #0b3d91;padding-bottom:8px;margin-bottom:12px"><img src="logo.png" style="width:56px"><div style="flex:1"><div style="font-weight:700;font-size:18px;color:#0b3d91">' + T('card') + ' · VO2max</div><div class="small muted">Club Sportif Al-Wathba · Batna</div></div><div style="text-align:end"><b style="font-size:16px">' + esc(s.name) + '</b><div class="small muted">' + (P.age ? R(P.age, 1) + ' ' + T('yrs') : '') + (s.weight ? ' · <span class="ltr">' + esc(s.weight) + ' kg</span>' : '') + (s.height ? ' · <span class="ltr">' + esc(s.height) + ' cm</span>' : '') + '</div></div></div>' +
    summaryHtml(P).replace(/<canvas[^>]*><\/canvas>/g, '') +
    (imgs.length ? '<div class="grid g2">' + imgs.map(function (i) { return '<div class="card">' + i + '</div>'; }).join('') + '</div>' : '') +
    '<div class="small muted" style="margin-top:10px">' + T('printed') + ' ' + fmtDate(today()) + ' · Léger 1988 · Uth 2004 · Dmax (Cheng 1992) · CSS (Wakayoshi 1992)</div></div>';
  $('#print').innerHTML = h;
  $$('#print .chart').forEach(function (c) { c.remove(); });
  setTimeout(function () { window.print(); }, 300);
}

/* ======================= démarrage ======================= */
render();
if (API.tk()) flush();
window.VO2APP = { DB: function () { return DB; }, profile: profile, computeTest: computeTest, route: route, BT: BT };
})();
