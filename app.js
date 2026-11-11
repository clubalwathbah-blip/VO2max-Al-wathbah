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
  settings2: ['الإعدادات', 'Paramètres'],
  admin: ['الإدارة', 'Administration'], coach: ['المدرب', 'Entraîneur'], coaches: ['المدربون', 'Entraîneurs'], headC: ['مدرب رئيسي (الاختبارات)', 'Entraîneur principal (tests)'], headS: ['⭐ رئيسي', '⭐ Principal'], noBt: ['الاختبارات خاصة بالإدارة والمدربين الرئيسيين.', 'Les tests sont réservés à l’administration et aux entraîneurs principaux.'],
  addCoach: ['مدرب جديد', 'Nouvel entraîneur'], code: ['الكود', 'Code'], phone: ['الهاتف', 'Téléphone'], active: ['نشط', 'Actif'], inactive: ['موقوف', 'Désactivé'],
  codeHint: ['4 خانات على الأقل، يدخل بيه المدرب. أنت وحدك تبدّلو.', '4 caractères min. Code de connexion de l’entraîneur, modifiable par vous seul.'],
  dupcode: ['هذا الكود مستعمل', 'Code déjà utilisé'], forbidden: ['ماعندكش الصلاحية', 'Action non autorisée'],
  viewAs: ['عرض حساب', 'Voir le compte'], viewing: ['راك تشوف حساب المدرب', 'Vous voyez le compte de'], exitView: ['رجوع للكل', 'Revenir à tout'],
  allCoaches: ['كل المدربين', 'Tous les entraîneurs'], noCoach: ['بلا مدرب', 'Sans entraîneur'],
  coachLogin: ['الإدارة: كلمة السر · المدرب: الكود تاعو', 'Administration : mot de passe · Entraîneur : son code'],
  pwOrCode: ['كلمة السر ولا الكود', 'Mot de passe ou code'],
  group: ['الفوج', 'Groupe'],
  sitH: ['طول الجلوس (سم)', 'Taille assise (cm)'], sitHint: ['قاعد على كرسي، ظهرو للحيط: من الكرسي حتى فوق الراس', 'Assis dos au mur : du siège au sommet du crâne'],
  span: ['طول الذراعين (سم)', 'Envergure (cm)'], spanHint: ['الذراعين مفتوحين: من طرف الأصبع للأصبع', 'Bras écartés, bout des doigts à bout des doigts'],
  hHint: ['واقف حافي، ظهرو للحيط', 'Debout pieds nus, dos au mur'],
  body: ['الجسم والنضج', 'Morphologie et maturité'], bmi: ['مؤشر كتلة الجسم', 'IMC'], ape: ['نسبة الذراعين/الطول', 'Indice envergure/taille'],
  mo: ['البعد عن قمة النمو', 'Écart au pic de croissance'], aphv: ['عمر قمة النمو (PHV)', 'Âge au pic de croissance (PHV)'],
  pre: ['قبل قمة النمو', 'Avant le pic'], circa: ['في قمة النمو', 'Autour du pic'], post: ['بعد قمة النمو', 'Après le pic'],
  matNote: ['Mirwald 2002 · الخطأ ±0.6 سنة. قبل القمة بزاف: لا أحمال ثقيلة؛ في القمة: ركّز على التقنية والمرونة.', 'Mirwald 2002 · ±0,6 an. Bien avant le pic : pas de charges lourdes ; autour du pic : technique et souplesse.'],
  matNeed: ['زيد الطول، طول الجلوس والوزن في ملف السباح', 'Ajoutez taille, taille assise et poids dans la fiche'],
  yrsBefore: ['سنة قبل', 'an(s) avant'], yrsAfter: ['سنة بعد', 'an(s) après'],
  recovery: ['الاسترجاع', 'Récupération'], times: ['الأزمنة', 'Temps'],
  T_day: ['الاسترجاع اليومي', 'Récupération du jour'], D_day: ['من Polar Loop + حمل الحصة', 'Polar Loop + charge de séance'],
  T_time: ['زمن منافسة', 'Temps de compétition'],
  addDay: ['إدخال اليوم', 'Saisir la journée'], addTime: ['زيد زمن', 'Ajouter un temps'],
  sleepH: ['مدة النوم (ساعات)', 'Durée de sommeil (h)'], sleepHint: ['Polar Flow ← النوم ← المدة (مثلاً 9.5)', 'Polar Flow ← Sommeil ← durée (ex. 9,5)'],
  sleepScore: ['Sleep score (1–100)', 'Sleep score (1–100)'], sleepScoreHint: ['Polar Flow ← النوم ← النتيجة', 'Polar Flow ← Sommeil ← score'],
  recharge: ['Nightly Recharge', 'Nightly Recharge'], rechargeHint: ['الحالة اللي يعطيها Polar الصباح', 'Statut affiché le matin'],
  rc1: ['ضعيف جداً', 'Très faible'], rc2: ['ضعيف', 'Faible'], rc3: ['عادي', 'Correct'], rc4: ['جيد', 'Bon'], rc5: ['ممتاز', 'Très bon'],
  hrvN: ['HRV الليلي (ms)', 'VFC nocturne (ms)'], hrvHint: ['Nightly Recharge ← متوسط HRV في الليل', 'Nightly Recharge ← VFC moyenne de la nuit'],
  rhrN: ['نبض الراحة في الليل (bpm)', 'FC de repos nocturne (bpm)'], rhrHint: ['متوسط النبض وهو راقد: راحة، ماشي بعد الجهد', 'Moyenne pendant le sommeil : repos, pas après effort'],
  br: ['التنفس (نفس/د)', 'Respiration (/min)'], ans: ['ANS charge (−10…+10)', 'ANS charge (−10…+10)'], optional: ['اختياري', 'facultatif'],
  trainMin: ['مدة الحصة (دقيقة)', 'Durée de séance (min)'], trainHint: ['الوقت الكلي في الماء + الصالة', 'Temps total eau + salle'],
  sRpe: ['تعب الحصة (0–10)', 'RPE de séance (0–10)'], sRpeHint: ['يسقسي السباح 30 دقيقة بعد الحصة: «كيفاش كانت؟»', 'Demander 30 min après : « c’était comment ? »'],
  polarLoad: ['Training Load (Polar)', 'Training Load (Polar)'],
  sleepSec: ['🌙 الليل (Polar Loop)', '🌙 La nuit (Polar Loop)'], trainSec: ['🏊 الحصة', '🏊 La séance'],
  readyT: ['الجاهزية اليوم', 'Forme du jour'], green: ['جاهز: حصة عادية', 'Prêt : séance normale'], yellow: ['تعب خفيف: نقّص الشدة', 'Fatigue légère : réduire l’intensité'], red: ['تعب: حصة استرجاع', 'Fatigue : séance de récupération'],
  needDays: ['لازم 7 أيام على الأقل باش يتحسب المعدل الشخصي', 'Au moins 7 jours pour calculer la référence personnelle'],
  f_hrv1: ['HRV أقل من العادة', 'VFC sous la normale'], f_hrv2: ['HRV أقل بزاف من العادة', 'VFC très basse'], f_rhr1: ['نبض الليل أعلى من العادة', 'FC nocturne élevée'], f_rhr2: ['نبض الليل أعلى بزاف', 'FC nocturne très élevée'],
  f_sleep1: ['نوم ناقص', 'Sommeil un peu court'], f_sleep2: ['نوم ناقص بزاف', 'Sommeil trop court'], f_score: ['جودة نوم ضعيفة', 'Qualité de sommeil faible'], f_recharge: ['Nightly Recharge ضعيف', 'Nightly Recharge faible'],
  base28: ['المعدل الشخصي (28 يوم)', 'Référence perso (28 j)'], load: ['الحمل', 'Charge'], acwr: ['نسبة الحمل (7 أيام / 28 يوم)', 'Ratio de charge (7 j / 28 j)'],
  acw_low: ['حمل ناقص', 'Charge basse'], acw_ok: ['حمل مناسب', 'Charge adaptée'], acw_warn: ['انتبه: زيادة سريعة', 'Attention : hausse rapide'], acw_risk: ['خطر إرهاق/إصابة', 'Risque de surmenage'],
  lastDays: ['آخر الأيام', 'Derniers jours'], noDays: ['ما كاين حتى إدخال.', 'Aucune saisie.'],
  redTest: ['الجاهزية في هذا النهار حمراء: النتيجة تنجم تكون أقل من الحقيقة.', 'Forme rouge ce jour-là : le résultat peut être sous-estimé.'],
  event: ['السباق', 'Épreuve'], course: ['المسبح', 'Bassin'], meet: ['المنافسة', 'Compétition'], points: ['نقاط WA', 'Points WA'], best: ['أحسن زمن', 'Meilleur temps'],
  timeHint: ['د:ث.ج مثلاً 5:15.32 ولا 32.10', 'm:ss.cc ex. 5:15.32 ou 32.10'],
  noTimes: ['ما كاين حتى زمن.', 'Aucun temps.'], allTimes: ['كل الأزمنة', 'Tous les temps'],
  guide: ['📘 كيفاش نديرو هذا الاختبار؟', '📘 Comment faire ce test ?'],
  repTimeH: ['من الانطلاق حتى لمس الحائط', 'Du départ au toucher'], repHrH: ['مباشرة بعد الجهد', 'Juste après l’effort'], repLacH: ['دقيقة بعد الوصول', '1 min après l’arrivée'], rpeH: ['0 سهل · 10 أقصى', '0 facile · 10 max'],
  hrEndH: ['أعلى نبض في 10 ثواني بعد لمس الحائط (بعد الجهد)', 'FC max dans les 10 s après le toucher (après effort)'],
  hr60H: ['بعد دقيقة كاملة راحة، واقف بلا حركة', 'Après 1 min de repos complet, immobile'],
  hrmaxLH: ['أعلى نبض عند التوقف (بعد الجهد)', 'FC la plus haute à l’arrêt (après effort)'],
  stageH: ['المرحلة اللي وقف فيها', 'Palier atteint à l’arrêt'], shuttleH: ['عدد الذهابات المكمّلة في ذيك المرحلة', 'Navettes terminées dans ce palier'],
  t1H: ['زمن 400 م بأقصى جهد', 'Temps du 400 m maximal'], t2H: ['زمن 200 م بأقصى جهد، بعد راحة 10–15 د', 'Temps du 200 m maximal, après 10–15 min de repos'],
  restBpmH: ['نبض الراحة الصباحي، قبل ما ينوض', 'FC de repos au réveil, avant le lever'],
  srH: ['ضربات الذراعين في الدقيقة (اختياري)', 'Cycles de bras/min (facultatif)'],
  distH: ['مسافة الاختبار', 'Distance du test'],
  stats_sw: ['السباحين', 'Nageurs'], stats_month: ['اختبارات هذا الشهر', 'Tests ce mois'], stats_ready: ['جاهزية اليوم', 'Forme du jour'],
  by: ['سجّلو', 'Saisi par'],
  home: ['الرئيسية', 'Accueil'], btTitle: ['الاختبارات · الوثبة', 'TESTS · AL-WATHBA'], btShort: ['الاختبارات', 'Tests'], gm: ['صباح الخير', 'Bonjour'], ga: ['مساء الخير', 'Bon après-midi'], ge: ['مساء الخير', 'Bonsoir'],
  authSub: ['قياس اللياقة الهوائية · نادي الوثبة', 'Aptitude aérobie · Club Al-Wathba'],
  failsAlert: ['محاولات دخول غالطة في آخر 24 ساعة. شوف سجل الدخول في الإعدادات.', 'tentatives de connexion échouées en 24 h. Voir le journal dans Paramètres.'],
  weakCode: ['الكود لازم 6 خانات على الأقل فيه أرقام وحروف', 'Code : 6 caractères min., lettres et chiffres'],
  logT: ['سجل الدخول', 'Journal des connexions'], okLogin: ['دخول', 'Connexion'], failLogin: ['غالط', 'Échec'], when: ['الوقت', 'Quand'], who: ['شكون', 'Qui'],
  acwrNeed: ['يتحسب بعد 3 أسابيع من إدخال الحصص', 'Calculé après 3 semaines de saisies'],
  hrrR: { exc: ['ممتاز', 'Excellent'], good: ['جيد', 'Bon'], avg: ['متوسط', 'Moyen'], low: ['ضعيف', 'Faible'], poor: ['ضعيف جداً', 'Très faible'] }
};
function T(k) { var v = D[k]; return v ? (LANG === 'fr' ? v[1] : v[0]) : k; }
function Tv(v) { return LANG === 'fr' ? v[1] : v[0]; }
var GUIDE = {
  step: [
    '<div class="gt">🎯 الهدف</div>نعرفو كيفاش يطلع النبض (واللاكتات) كي تزيد السرعة: FCmax في الماء، العتبات، والسرعة عند FCmax.' +
    '<div class="gt">⏪ قبل الاختبار</div><ul><li>بلا تدريب قوي في 24 ساعة اللي قبل.</li><li>Verity Sense على الصدغ تحت البونيه، والتسجيل يبدا قبل الإحماء.</li><li>إحماء 800 م خفيف + 4×50 تصاعدي، ومن بعد 3 دقائق راحة.</li></ul>' +
    '<div class="gt">🏊 السلسلة</div><ul><li>الشكل مثلاً <b>7×200 @ 5:00</b>: كل 200 تبدا كل 5 دقائق، والراحة هي اللي تبقى.</li><li>كل تكرار <b>أسرع من اللي قبلو بـ 3–5 ثواني</b>. الأول سهل بزاف، الأخير بكل القوة.</li><li>للتحضير: آخر تكرار = الأقصى، الأول ≈ أحسن زمن + 25–30 ث.</li></ul>' +
    '<div class="gt">✍️ واش نكتبو</div><ul><li><b>الزمن:</b> من الانطلاق (دفع الحائط) حتى لمس الحائط في الأخير، بالكرونو، بعشر الثانية.</li><li><b>النبض:</b> مباشرة عند الوصول (بعد الجهد): أعلى نبض في 10 ثواني بعد لمس الحائط.</li><li><b>اللاكتات</b> (إذا كاين الجهاز): دقيقة بعد الوصول، من الأذن ولا الإصبع بعد التنشيف.</li><li><b>التعب:</b> تسقسيه من 0 (سهل) حتى 10 (أقصى).</li><li><b>بعد التكرار الأخير:</b> يبقى واقف في الماء دقيقة كاملة، وتكتب <b>النبض بعد 60 ث</b>.</li></ul>' +
    '<div class="gt">📌 مهم</div>نفس المسبح، نفس الساعة، نفس الإحماء في كل مرة، باش نقدرو نقارنو.',
    '<div class="gt">🎯 Objectif</div>Voir comment la FC (et le lactate) monte avec la vitesse : FCmax nage, seuils, vitesse à FCmax.' +
    '<div class="gt">⏪ Avant</div><ul><li>Pas d’entraînement intense dans les 24 h.</li><li>Verity Sense à la tempe sous le bonnet, enregistrement lancé avant l’échauffement.</li><li>800 m facile + 4×50 progressifs, puis 3 min de repos.</li></ul>' +
    '<div class="gt">🏊 Série</div><ul><li>Ex. <b>7×200 @ 5:00</b> : départ toutes les 5 min.</li><li>Chaque répétition <b>3–5 s plus rapide</b> ; la 1re très facile, la dernière à fond.</li></ul>' +
    '<div class="gt">✍️ À noter</div><ul><li><b>Temps :</b> du départ au toucher final, au 1/10 s.</li><li><b>FC :</b> juste après l’effort, max des 10 s après le toucher.</li><li><b>Lactate :</b> 1 min après l’arrivée.</li><li><b>RPE :</b> 0 à 10.</li><li><b>Après la dernière :</b> 1 min immobile, noter la <b>FC à +60 s</b>.</li></ul>'
  ],
  '400': [
    '<div class="gt">🎯 الهدف</div>سرعة VO2max في الماء (vVO2max) + كيفاش يسترجع النبض.' +
    '<div class="gt">🏊 الطريقة</div><ol><li>إحماء 800–1000 م مع 4×50 سريعة، ومن بعد 5 دقائق راحة.</li><li>400 م حرة <b>بأقصى جهد متوازن</b>. الانطلاق دايماً نفس الطريقة (من الماء ولا من المكعب).</li></ol>' +
    '<div class="gt">✍️ واش نكتبو</div><ul><li><b>الزمن:</b> من الانطلاق حتى لمس الحائط.</li><li><b>النبض عند الوصول:</b> بعد الجهد مباشرة (أعلى نبض في 10 ثواني).</li><li><b>النبض بعد 60 ث:</b> يبقى واقف بلا حركة دقيقة كاملة، ومن بعد نقراو النبض.</li><li><b>ضربات الذراعين/د</b> (اختياري): تحسبها وسط الحوض في الـ 100 الثالثة.</li></ul>',
    '<div class="gt">🎯 Objectif</div>Vitesse VO2max en nage + récupération cardiaque.' +
    '<ol><li>800–1000 m d’échauffement + 4×50 rapides, 5 min de repos.</li><li>400 m crawl <b>à fond, allure régulière</b>, départ toujours identique.</li></ol>' +
    '<ul><li><b>Temps :</b> départ → toucher.</li><li><b>FC arrivée :</b> juste après l’effort (max sur 10 s).</li><li><b>FC +60 s :</b> après 1 min immobile.</li></ul>'
  ],
  css: [
    '<div class="gt">🎯 الهدف</div>السرعة الحرجة (CSS) = سرعة العتبة اللي يقدر يحافظ عليها مدة طويلة. منها تتحسب سرعات A1 / A2 / EN.' +
    '<div class="gt">🏊 الطريقة</div><ol><li>إحماء 800 م.</li><li><b>400 م بأقصى جهد</b>.</li><li>راحة كاملة <b>10–15 دقيقة</b> (سباحة خفيفة).</li><li><b>200 م بأقصى جهد</b>.</li></ol>' +
    '<div class="gt">✍️ واش نكتبو</div><ul><li><b>الزمن 1:</b> زمن الـ 400.</li><li><b>الزمن 2:</b> زمن الـ 200.</li><li>الزمن دايماً من الانطلاق حتى لمس الحائط.</li><li>النبض (اختياري): عند الوصول، بعد الجهد.</li></ul>',
    '<ol><li>800 m d’échauffement.</li><li><b>400 m à fond</b>.</li><li><b>10–15 min</b> de récupération.</li><li><b>200 m à fond</b>.</li></ol><ul><li><b>Temps 1</b> = 400 m, <b>Temps 2</b> = 200 m (départ → toucher).</li></ul>'
  ],
  leger: [
    '<div class="gt">🎯 الهدف</div>VO2max الأدق للأطفال (6–18 سنة) + FCmax الأرضي.' +
    '<div class="gt">📏 التحضير</div><ul><li>أرض مستوية ما تزلقش، <b>خطين بيناتهم 20 م بالضبط</b> (بالمتر)، صباط رياضي.</li><li>Verity Sense على الذراع، مربوط بالبلوتوث.</li><li>إحماء 5 دقائق جري خفيف.</li></ul>' +
    '<div class="gt">🏃 الطريقة</div><ol><li>اضغط <b>تشغيل</b>: 5 بيبات عدّ، ومن بعد مع <b>كل بيب لازم يكون واصل للخط</b>.</li><li><b>3 بيبات = مرحلة جديدة</b> أسرع.</li><li>كي ما يلحقش الخط <b>مرتين متتابعين</b>، ولا يحبس وحدو، اضغط <b>توقف</b>.</li></ol>' +
    '<div class="gt">✍️ واش نكتبو</div><ul><li><b>المرحلة والذهاب:</b> يتسجلو وحدهم (ولا اكتبهم باليد).</li><li><b>FCmax:</b> أعلى نبض عند التوقف (بعد الجهد).</li><li><b>النبض بعد 60 ث:</b> بعد دقيقة راحة.</li></ul>',
    '<ul><li>Sol plat, <b>2 lignes à 20 m exactement</b>.</li><li>Verity Sense au bras, connecté.</li></ul><ol><li><b>Lancer</b> : 5 bips de décompte, puis il doit être sur la ligne à chaque bip.</li><li><b>3 bips = nouveau palier</b>.</li><li>Arrêt après <b>2 retards consécutifs</b>.</li></ol><ul><li><b>FCmax :</b> FC la plus haute à l’arrêt.</li><li><b>FC +60 s</b> après 1 min.</li></ul>'
  ],
  rest: [
    '<div class="gt">🎯 الهدف</div>نبض الراحة الحقيقي: لمعادلة Uth ولمتابعة التعب.' +
    '<div class="gt">🛏 الطريقة</div><ul><li><b>الصباح كي يفيق</b>، قبل ما ينوض، قبل الهاتف والأكل.</li><li>Verity Sense على الذراع، يرقد على ظهرو <b>5 دقائق</b> ساكت.</li><li>التطبيق يحسب متوسط آخر دقيقتين.</li><li><b>3 صباحات</b> متتابعة، ماشي بعد مرض ولا سهر.</li></ul>' +
    '<div class="note" style="margin-top:8px">⚠ هذا نبض <b>راحة</b>، ماشي بعد الجهد.</div>',
    '<ul><li><b>Au réveil</b>, avant le lever, avant téléphone et repas.</li><li>Verity Sense au bras, <b>5 min</b> allongé au calme ; moyenne des 2 dernières minutes.</li><li><b>3 matins</b> consécutifs.</li></ul><div class="note">⚠ FC de <b>repos</b>, pas après effort.</div>'
  ],
  day: [
    '<div class="gt">🌙 كل صباح من Polar Flow</div><ul><li>السباح يلبس <b>Polar Loop</b> الليل كامل.</li><li><b>Nightly Recharge:</b> الحالة، HRV (ms) ونبض الراحة في الليل (bpm).</li><li><b>النوم:</b> المدة و Sleep score.</li></ul>' +
    '<div class="gt">🏊 بعد كل حصة</div><ul><li><b>المدة</b> بالدقائق (الماء + الصالة).</li><li><b>تعب الحصة 0–10:</b> تسقسيه 30 دقيقة بعد الحصة «كيفاش كانت الحصة؟».</li></ul>' +
    '<div class="gt">🧮 الحساب</div>كل رقم يتقارن مع <b>المعدل الشخصي تاع 28 يوم</b> تاع نفس السباح. لازم 7 أيام على الأقل.',
    '<ul><li><b>Polar Loop</b> porté la nuit.</li><li><b>Nightly Recharge :</b> statut, VFC (ms), FC nocturne (bpm).</li><li><b>Sommeil :</b> durée et score.</li><li><b>Séance :</b> durée (min) et RPE 0–10 (30 min après).</li></ul>Comparaison avec la <b>référence perso sur 28 jours</b> (7 jours minimum).'
  ],
  time: [
    'سجّل الأزمنة الرسمية (منافسة ولا اختبار مكروني). <b>نقاط World Aquatics</b> تتحسب وحدها حسب المسبح (25 ولا 50) والجنس.',
    'Temps officiels (compétition). <b>Points World Aquatics</b> calculés selon bassin et sexe.'
  ]
};
function guideHtml(k) { var g = GUIDE[k]; return g ? '<details class="guide"' + (k === 'day' || k === 'time' ? '' : ' open') + '><summary>' + T('guide') + '</summary><div class="gb">' + (LANG === 'fr' ? g[1] : g[0]) + '</div></details>' : ''; }

/* ======================= backend ======================= */
// serveur du club : l'entraîneur n'a qu'à saisir son code
var DEFAULT_API = 'https://script.google.com/macros/s/AKfycbzB_IabVM98T4knvuH67efkmvNgg27gp_t3ot9Q9pLlK4dGjbma4yaqrQiux9V9gBEY/exec';
(function () { try { var q = new URLSearchParams(location.search).get('api'); if (q && /^https:\/\/script\.google\.com\/.+\/exec$/.test(q)) localStorage.setItem('vo2_api', q); } catch (e) {} })();
var API = {
  url: function () { return ls('vo2_api') || DEFAULT_API; },
  tk: function () { return ls('vo2_tk') || ''; },
  call: function (a, p) {
    p = p || {}; p.a = a; p.tk = API.tk();
    if (API.url() === 'demo') return Promise.resolve(Local.call(p));
    return fetch(API.url(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p), redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (!r.ok && r.err === 'auth') { ls('vo2_tk', null); render(); throw new Error('auth'); } return r; });
  }
};
// serveur local (mode essai / tests) — mêmes règles que le serveur
var Local = {
  db: function () { try { var d = JSON.parse(ls('vo2_demo') || '{}'); d.s = d.s || []; d.t = d.t || []; d.c = d.c || []; d.p = d.p || []; d.au = d.au || []; return d; } catch (e) { return { s: [], t: [], c: [], p: [], au: [] }; } },
  put: function (d) { ls('vo2_demo', JSON.stringify(d)); },
  call: function (p) {
    var d = Local.db();
    if (p.a === 'login') {
      if (!d.pw) { if (String(p.pw || '').length < 6) return { ok: false, err: 'short' }; d.pw = p.pw; Local.put(d); ls('vo2_demo_who', 'admin'); return { ok: true, tk: 'demo-admin', first: true, role: 'admin' }; }
      d.log = d.log || [];
      var c = p.pw === d.pw ? null : d.c.find(function (x) { return x.code === p.pw && x.active !== false; });
      var okk = p.pw === d.pw || !!c; d.log.push({ t: new Date().toISOString(), who: okk ? (c ? c.name : 'Administration') : '', ok: okk }); Local.put(d);
      if (p.pw === d.pw) return { ok: true, tk: 'demo-admin', role: 'admin' };
      return c ? { ok: true, tk: 'demo-coach-' + c.id, role: 'coach' } : { ok: false, err: 'bad' };
    }
    var tk = p.tk || '', w = tk === 'demo-admin' ? { role: 'admin', name: 'Administration' } : null;
    if (!w && tk.indexOf('demo-coach-') === 0) { var co = d.c.find(function (x) { return x.id === tk.slice(11) && x.active !== false; }); if (co) w = { role: 'coach', id: co.id, name: co.name, head: co.head === true }; }
    if (!w) return { ok: false, err: 'auth' };
    var own = function (s) { return w.role === 'admin' || (s && s.coachId === w.id); };
    var btT = function (ty) { return ty === 'bt' || ty === 'va'; }, canT = function (s, ty) { return own(s) || (w.head && s && btT(ty)); };
    function up(arr, rec) { if (!rec.id) rec.id = uid(); rec.updated = new Date().toISOString(); var i = arr.findIndex(function (x) { return x.id === rec.id; }); if (i >= 0) arr[i] = rec; else arr.push(rec); return rec; }
    function S_(id) { return d.s.find(function (x) { return x.id === id; }); }
    var r = { ok: true };
    function audit(act, det) { d.au.push({ t: new Date().toISOString(), who: w.name, act: act, det: det }); if (d.au.length > 1000) d.au.splice(0, 200); }
    if (p.a === 'all') {
      var ss = w.head ? d.s : d.s.filter(own), ids = {}; d.s.filter(own).forEach(function (x) { ids[x.id] = 1; });
      r.swimmers = ss; r.tests = d.t.filter(function (t) { return ids[t.swimmerId] || (w.head && btT(t.type)); });
      r.coaches = w.role === 'admin' ? d.c : d.c.filter(function (c) { return c.id === w.id; }).map(function (c) { return { id: c.id, name: c.name }; });
      r.me = { role: w.role, id: w.id || null, name: w.name, head: !!w.head }; r.settings = d.set || {}; r.protos = d.p;
      if (w.role === 'admin') r.fails24 = (d.log || []).filter(function (x) { return !x.ok && Date.now() - new Date(x.t) < 864e5; }).length;
    }
    else if (p.a === 'saveSwimmer') { var old = S_(p.rec.id); if (old && !own(old)) return { ok: false, err: 'forbidden' }; if (w.role !== 'admin') p.rec.coachId = w.id; r.rec = up(d.s, p.rec); }
    else if (p.a === 'saveTest') { if (!canT(S_(p.rec.swimmerId), p.rec.type)) return { ok: false, err: 'forbidden' }; if (btT(p.rec.type) && w.role !== 'admin' && !w.head) return { ok: false, err: 'forbidden' }; var ex0 = d.t.find(function (x) { return x.id === p.rec.id; }); p.rec.by = p.rec.by || w.name; r.rec = up(d.t, p.rec); if (btT(p.rec.type)) audit(ex0 ? 'résultat modifié' : 'résultat', (S_(p.rec.swimmerId) || {}).name + ' · ' + (p.rec.type === 'va' ? '🎥 ' + ((p.rec.data.cfg || {}).dist || '') + 'm' : p.rec.data.proto ? p.rec.data.proto.name : p.rec.data.test) + ' · ' + p.rec.date + (p.rec.data.retest ? ' · re-test' : '')); }
    else if (p.a === 'saveProto') { if (w.role !== 'admin' && !w.head) return { ok: false, err: 'forbidden' }; var op = d.p.find(function (x) { return x.id === p.rec.id; }); if (op && w.role !== 'admin' && op.byId !== w.id) return { ok: false, err: 'forbidden' }; if (!op) { p.rec.by = w.name; p.rec.byId = w.id || 'admin'; } else { p.rec.by = op.by; p.rec.byId = op.byId; } r.rec = up(d.p, p.rec); audit(op ? (p.rec.active === false ? 'protocole archivé' : 'protocole modifié') : 'protocole créé', p.rec.name); }
    else if (p.a === 'saveProgram') { if (w.role !== 'admin' && !w.head) return { ok: false, err: 'forbidden' }; d.set = d.set || {}; var pk = 'prog_' + p.camp; d.set[pk] = d.set[pk] || {}; d.set[pk][p.cat] = p.tests || []; audit('programme', p.camp + ' · ' + p.cat + ' · ' + (p.tests || []).length + ' tests'); }
    else if (p.a === 'audit') { if (w.role !== 'admin') return { ok: false, err: 'forbidden' }; r.log = d.au.slice().reverse(); }
    else if (p.a === 'delSwimmer') { if (!own(S_(p.id))) return { ok: false, err: 'forbidden' }; d.s = d.s.filter(function (x) { return x.id !== p.id; }); d.t = d.t.filter(function (x) { return x.swimmerId !== p.id; }); }
    else if (p.a === 'delTest') { var dt = d.t.find(function (x) { return x.id === p.id; }); if (dt && !canT(S_(dt.swimmerId), dt.type)) return { ok: false, err: 'forbidden' }; if (dt && btT(dt.type)) audit('résultat supprimé', (S_(dt.swimmerId) || {}).name + ' · ' + dt.date); d.t = d.t.filter(function (x) { return x.id !== p.id; }); }
    else if (p.a === 'saveSetting') { if (w.role !== 'admin') return { ok: false, err: 'forbidden' }; d.set = d.set || {}; d.set[p.key] = p.value; }
    else if (p.a === 'log') { r.log = (d.log || []).slice().reverse(); }
    else if (p.a === 'saveCoach') { if (w.role !== 'admin') return { ok: false, err: 'forbidden' }; if (!/^(?=.*[0-9])(?=.*[A-Za-z]).{6,}$/.test(String(p.rec.code || ''))) return { ok: false, err: 'weakCode' }; if (d.c.some(function (c) { return c.code === p.rec.code && c.id !== p.rec.id; }) || p.rec.code === d.pw) return { ok: false, err: 'dupcode' }; r.rec = up(d.c, p.rec); }
    else if (p.a === 'delCoach') { if (w.role !== 'admin') return { ok: false, err: 'forbidden' }; d.c = d.c.filter(function (c) { return c.id !== p.id; }); }
    else if (p.a === 'changePw') { if (p.old !== d.pw) return { ok: false, err: 'bad' }; if (String(p.nw).length < 6) return { ok: false, err: 'short' }; d.pw = p.nw; }
    Local.put(d);
    return JSON.parse(JSON.stringify(r));
  }
};

/* ======================= état ======================= */
var DB = { swimmers: [], tests: [], coaches: [], me: null };
try { var cache = JSON.parse(ls('vo2_cache') || 'null'); if (cache) DB = cache; } catch (e) {}
var QUEUE = []; try { QUEUE = JSON.parse(ls('vo2_queue') || '[]'); } catch (e) {}
var S = { view: 'home', sid: null, tid: null, type: null, tab: 'sum' };
var VIEWAS = ls('vo2_viewas') || '';
function isAdmin() { return DB.me && DB.me.role === 'admin'; }
function coachName(id) { var c = (DB.coaches || []).find(function (x) { return x.id === id; }); return c ? c.name : ''; }
function persist() { ls('vo2_cache', JSON.stringify(DB)); ls('vo2_queue', JSON.stringify(QUEUE)); }

function load() {
  return API.call('all').then(function (r) {
    if (r.ok) { DB = { swimmers: r.swimmers || [], tests: r.tests || [], coaches: r.coaches || [], me: r.me || null, fails24: r.fails24 || 0, settings: r.settings || {}, protos: r.protos || [] }; applyQueueLocal(); persist(); }
    return r;
  });
}
function applyQueueLocal() {
  QUEUE.forEach(function (q) {
    var arr = q.a.indexOf('Swimmer') > 0 ? DB.swimmers : q.a.indexOf('Coach') > 0 ? (DB.coaches = DB.coaches || []) : q.a.indexOf('Proto') > 0 ? (DB.protos = DB.protos || []) : DB.tests;
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
    QUEUE.shift(); persist(); toast(T(r.err) || r.err || 'error'); return load().then(function () { render(); });
  }).catch(function (e) { flushing = false; if (e.message !== 'auth') toast(T('offline')); });
}
window.addEventListener('online', flush);

/* ======================= aides ======================= */
function toast(m) { var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600); }
function sw(id) { return DB.swimmers.find(function (s) { return s.id === id; }); }
function testsOf(id, all) { return DB.tests.filter(function (t) { return t.swimmerId === id && (all || (t.type !== 'day' && t.type !== 'time' && t.type !== 'bt')); }).sort(function (a, b) { return (b.date || '').localeCompare(a.date || '') || (b.updated || '').localeCompare(a.updated || ''); }); }
function ageOf(s, date) { return C.ageAt(s && s.dob, date); }
function paceStr(p) { return p ? F(p, 1) : '—'; }
function vPace(v) { return v ? F(100 / v, 1) : '—'; }
function n1(x) { return x == null ? '—' : R(x, 1); }
function n0(x) { return x == null ? '—' : Math.round(x); }
function initials(n) { return String(n || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
var ICON = { step: '📈', '400': '🏊', css: '⏱', leger: '🏃', rest: '😴', day: '🌙', time: '🏅' };
function daysOf(id) { return DB.tests.filter(function (t) { return t.swimmerId === id && t.type === 'day'; }).map(function (t) { var d = t.data || {}; return { id: t.id, date: t.date, hrv: d.hrv, rhr: d.rhr, sleepH: d.sleepH, sleepScore: d.sleepScore, recharge: d.recharge, br: d.br, ans: d.ans, min: d.min, rpe: d.rpe, load: C.num(d.min) && C.num(d.rpe) != null ? C.num(d.min) * C.num(d.rpe) : null, polar: d.polar, cl: d.cl, str: d.str, tol: d.tol, clr: d.clr, cls: d.cls, ex: d.ex || [] }; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; }); }
function readyOf(s, date) { return C.readiness(daysOf(s.id), date || today(), ageOf(s, date)); }
function isHead() { return DB.me && DB.me.role === 'coach' && DB.me.head; }
function visibleSwimmers() { return DB.swimmers.filter(function (s) { if (isHead() && window.APP_MODE !== 'bt') return s.coachId === DB.me.id; return !isAdmin() || !VIEWAS || s.coachId === VIEWAS; }); }
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
  P.mat = C.maturity(s.sex, age, s.height, s.sitH, s.weight);
  P.bmi = C.bmi(s.weight, s.height); P.ape = C.apeIndex(s.span, s.height);
  P.ready = upTo ? null : readyOf(s);
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
  var logged = !!(API.url() && API.tk());
  $('#set-btn').classList.toggle('hide', !logged); $('#out-btn').classList.toggle('hide', !logged);
  $('#set-lbl').textContent = T('settings'); $('#out-lbl').textContent = T('logout');
  var tb = document.querySelector('.hd .t b'); if (tb) tb.textContent = window.APP_MODE === 'bt' ? T('btTitle') : 'VO2max · AL-WATHBA';
  document.body.classList.toggle('wide', S.view === 'btVideo');
  var sb = $('#switch-btn'); if (sb) { sb.classList.toggle('hide', !logged || (window.APP_MODE !== 'bt' && DB.me && DB.me.role === 'coach' && !DB.me.head)); sb.textContent = window.APP_MODE === 'bt' ? '🫁 VO2max' : '🧪 ' + T('btShort'); sb.onclick = function () { location.href = window.APP_MODE === 'bt' ? 'index.html' : 'tests.html'; }; }
  $('#hd-sub').textContent = logged && DB.me ? (DB.me.role === 'admin' ? T('admin') : T('coach') + ' · ' + DB.me.name) : T('sub');
  var app = $('#app');
  document.body.classList.toggle('auth', !logged);
  var nav = [['home', '🏠', T('home')], ['add', '＋', T('addSw')], ['settings', '⚙', T('settings')], ['out', '🚪', T('logout')]];
  $('#bnav').innerHTML = nav.map(function (n) { return '<button data-nav="' + n[0] + '" class="' + ((S.view === n[0] || (n[0] === 'home' && (S.view === 'swimmer' || S.view === 'test'))) ? 'on' : '') + '"><b>' + n[1] + '</b>' + n[2] + '</button>'; }).join('');
  $$('#bnav [data-nav]').forEach(function (b) { b.onclick = function () { var k = b.dataset.nav; if (k === 'out') $('#out-btn').click(); else if (k === 'add') route('swForm', { sid: null }); else route(k); }; });
  if (!API.url()) return vSetup(app);
  if (!API.tk()) return vLogin(app);
  if (window.APP_MODE === 'bt' && DB.me && DB.me.role === 'coach' && !DB.me.head && S.view !== 'settings') { app.innerHTML = '<div class="card empty" style="margin-top:30px">🔒 ' + T('noBt') + '<div style="margin-top:14px"><a class="btn pri" href="index.html">🫁 VO2max</a></div></div>'; load().then(function (r) { if (r && r.ok && DB.me && DB.me.head) render(); }).catch(function () {}); return; }
  var V = { home: vHome, swimmer: vSwimmer, swForm: vSwForm, test: vTest, settings: vSettings };
  if (window.APP_MODE === 'bt' && window.BTV) Object.keys(window.BTV.views).forEach(function (k) { V[k] = window.BTV.views[k]; });
  (V[S.view] || V.home)(app);
}
$('#lang-btn').onclick = function () { LANG = LANG === 'fr' ? 'ar' : 'fr'; ls('vo2_lang', LANG); render(); };
$('#set-btn').onclick = function () { route('settings'); };
$('#out-btn').onclick = function () { ls('vo2_tk', null); ls('vo2_viewas', null); VIEWAS = ''; DB = { swimmers: [], tests: [], coaches: [], me: null }; persist(); BT.disconnect(); vHome.loaded = false; route('home'); };

/* ---------- setup & login ---------- */
function authShell(inner) {
  var bub = ''; for (var i = 0; i < 14; i++) bub += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;width:' + (4 + Math.random() * 8).toFixed(0) + 'px;height:' + (4 + Math.random() * 8).toFixed(0) + 'px;animation-duration:' + (8 + Math.random() * 12).toFixed(1) + 's;animation-delay:-' + (Math.random() * 12).toFixed(1) + 's"></i>';
  var wave = function (cls, fill, d) { return '<svg class="' + cls + '" viewBox="0 0 2400 200" preserveAspectRatio="none"><path d="' + d + '" fill="' + fill + '"/></svg>'; };
  var d1 = 'M0 100 C200 40 400 160 600 100 S1000 40 1200 100 S1600 160 1800 100 S2200 40 2400 100 V200 H0Z', d2 = 'M0 120 C300 70 500 170 800 120 S1300 70 1600 120 S2100 170 2400 120 V200 H0Z';
  return '<div class="auth-wrap"><button class="hbtn auth-lang" id="auth-lang" type="button">' + (LANG === 'fr' ? 'ع' : 'FR') + '</button><div class="bubbles">' + bub + '</div>' +
    '<div class="waves">' + wave('w3', 'rgba(91,155,255,.35)', d2) + wave('w1', 'rgba(47,212,240,.28)', d1) + wave('w2', 'rgba(59,123,255,.45)', d2) + '</div>' +
    '<div class="auth-card"><img class="logo" src="logo.png" alt=""><div class="brand">' + (window.APP_MODE === 'bt' ? 'TESTS' : 'VO2max') + '</div><div class="sub">' + T('authSub') + '</div>' + inner + '</div></div>';
}
function bindAuthLang() { $('#auth-lang').onclick = function () { $('#lang-btn').click(); }; }
function vSetup(app) {
  app.innerHTML = authShell('<p class="small muted">' + T('setupP') + '</p>' +
    '<div class="f"><input id="api" class="ltr" style="font-size:14px;letter-spacing:0" placeholder="https://script.google.com/macros/s/…/exec"></div>' +
    '<button class="btn pri big" id="go" style="width:100%;justify-content:center">' + T('next') + '</button>' +
    '<p><a href="#" id="demo" class="small">' + T('demo') + '</a></p>');
  bindAuthLang();
  $('#go').onclick = function () { var u = $('#api').value.trim(); if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(u)) { toast(T('apiUrl') + ' ✗'); return; } ls('vo2_api', u); render(); };
  $('#demo').onclick = function (e) { e.preventDefault(); ls('vo2_api', 'demo'); render(); };
}
function vLogin(app) {
  app.innerHTML = authShell('<form id="lf"><div class="f"><input type="password" id="pw" autocomplete="current-password" class="ltr" placeholder="••••••"></div>' +
    '<button class="btn pri big" style="width:100%;justify-content:center">' + T('login') + ' →</button>' +
    '<p class="small muted" style="margin:14px 0 4px">' + T('coachLogin') + '</p>' +
    '</form>');
  bindAuthLang();
  $('#pw').focus();
  $('#lf').onsubmit = function (e) {
    e.preventDefault(); var b = $('#lf button'); b.disabled = true;
    API.call('login', { pw: $('#pw').value }).then(function (r) {
      b.disabled = false;
      if (!r.ok) { toast(T(r.err) || r.err); $('.auth-card').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }], { duration: 300 }); return; }
      ls('vo2_tk', r.tk); if (r.first) toast(T('first'));
      return load().then(function () { vHome.loaded = true; route('home'); });
    }).catch(function () { b.disabled = false; toast(T('neterr')); });
  };
}

/* ---------- accueil ---------- */
function vHome(app) {
  var list = visibleSwimmers().sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
  var h = '';
  if (isAdmin() && (DB.coaches || []).length) {
    h += '<div class="coachbar"><span class="small muted" style="font-weight:700">👁 ' + T('viewAs') + ' :</span><div class="seg"><button class="btn sm' + (!VIEWAS ? ' on' : '') + '" data-va="">' + T('allCoaches') + '</button>' +
      DB.coaches.map(function (c) { return '<button class="btn sm' + (VIEWAS === c.id ? ' on' : '') + '" data-va="' + c.id + '">' + esc(c.name) + (c.active === false ? ' ⛔' : '') + '</button>'; }).join('') + '</div></div>';
    if (VIEWAS) h += '<div class="info" style="margin-bottom:14px">👁 ' + T('viewing') + ' <b>' + esc(coachName(VIEWAS)) + '</b></div>';
  }
  // statistiques
  var month = today().slice(0, 7), nT = 0, rd = { green: 0, yellow: 0, red: 0 };
  list.forEach(function (s) { nT += testsOf(s.id).filter(function (t) { return (t.date || '').slice(0, 7) === month; }).length; var r = readyOf(s); if (r) rd[r.level]++; });
  var hr_ = new Date().getHours(), greet = hr_ < 12 ? T('gm') : hr_ < 18 ? T('ga') : T('ge');
  h = '<div class="welcome"><h1>' + greet + (DB.me ? ' ' + esc(DB.me.role === 'admin' ? T('admin') : DB.me.name) + ' 👋' : '') + '</h1><div class="muted">' + fmtDate(today()) + ' · Club Sportif Al-Wathba · Batna</div>' +
    '<svg viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0 30 C150 5 300 55 450 30 S750 5 900 30 S1100 55 1200 30 V60 H0Z" fill="rgba(47,212,240,.18)"/><path d="M0 40 C200 20 350 60 600 40 S950 20 1200 40 V60 H0Z" fill="rgba(91,155,255,.18)"/></svg></div>' + h;
  if (isAdmin() && DB.fails24 >= 3) h += '<div class="alert" style="margin-bottom:14px">🔐 ' + DB.fails24 + ' ' + T('failsAlert') + '</div>';
  var si = function (ic, bg, l, v) { return '<div class="card"><div class="si" style="background:' + bg + '">' + ic + '</div><div class="kpi"><div class="l">' + l + '</div><div class="v">' + v + '</div></div></div>'; };
  h += '<div class="statbar">' + si('🏊', 'rgba(91,155,255,.18)', T('stats_sw'), list.length) + si('🧪', 'rgba(47,212,240,.15)', T('stats_month'), nT) +
    '<div class="card"><div class="si" style="background:rgba(43,209,143,.15)">💚</div><div class="kpi"><div class="l">' + T('stats_ready') + '</div><div class="row" style="gap:12px;font:700 20px Rubik"><span><span class="dot green"></span> ' + rd.green + '</span><span><span class="dot yellow"></span> ' + rd.yellow + '</span><span><span class="dot red"></span> ' + rd.red + '</span></div></div></div>' +
    (isAdmin() ? si('👥', 'rgba(246,196,83,.15)', T('coaches'), (DB.coaches || []).length) : '') + '</div>';
  h += '<div class="row"><h1 class="sp">' + T('swimmers') + '</h1><button class="btn pri" id="add">＋ ' + T('addSw') + '</button></div>';
  if (QUEUE.length) h += '<div class="note" style="margin-bottom:12px">⏳ ' + QUEUE.length + ' ' + T('pending') + '</div>';
  if (!list.length) h += '<div class="card empty">' + T('noSw') + '</div>';
  h += '<div class="grid g3">';
  list.forEach(function (s) {
    var P = profile(s), a = P.age, r = P.ready;
    h += '<div class="card sw" data-id="' + s.id + '"><div class="av ' + (r ? r.level : '') + '">' + esc(initials(s.name)) + '</div><div class="sp" style="min-width:0"><b style="font-size:17px">' + esc(s.name) + '</b><div class="small muted">' +
      (a ? Math.floor(a) + ' ' + T('yrs') : '') + (s.level ? ' · ' + (s.level == 7 ? T('comp') : T('level') + ' ' + s.level) : '') + (s.group ? ' · ' + esc(s.group) : '') + '</div>' +
      '<div class="small muted">' + (isAdmin() && !VIEWAS ? '👤 ' + esc(coachName(s.coachId) || T('noCoach')) + ' · ' : '') + '<span class="dot ' + (r ? r.level : 'none') + '" style="vertical-align:middle"></span> ' + (r ? T(r.level).split(':')[0] : '—') + '</div></div>' +
      gauge(P.final ? P.final.vo2 : null, 84) + '</div>';
  });
  h += '</div>';
  app.innerHTML = h;
  $('#add').onclick = function () { route('swForm', { sid: null }); };
  $$('[data-va]').forEach(function (b) { b.onclick = function () { VIEWAS = b.dataset.va; ls('vo2_viewas', VIEWAS || null); render(); }; });
  $$('.sw').forEach(function (el) { el.onclick = function () { route('swimmer', { sid: el.dataset.id, tab: 'sum' }); }; });
  if (!vHome.loaded) { vHome.loaded = true; load().then(function (r) { if (r && r.ok && S.view === 'home') render(); }).catch(function () {}); }
}

/* ---------- fiche nageur (formulaire) ---------- */
function lab(k, hintKey) { return '<label>' + T(k) + (hintKey ? '<span class="hint">' + T(hintKey) + '</span>' : '') + '</label>'; }
function vSwForm(app) {
  var s = S.sid ? sw(S.sid) : { coachId: VIEWAS || '' };
  var lv = '<option value="">—</option>' + [1, 2, 3, 4, 5, 6, 7].map(function (n) { return '<option value="' + n + '"' + (String(s.level) === String(n) ? ' selected' : '') + '>' + (n === 7 ? T('comp') : T('level') + ' ' + n) + '</option>'; }).join('');
  var co = isAdmin() ? '<div class="f">' + lab('coach') + '<select name="coachId"><option value="">' + T('noCoach') + '</option>' + (DB.coaches || []).map(function (c) { return '<option value="' + c.id + '"' + (s.coachId === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select></div>' : '';
  var inp = function (n, k, h, mode) { return '<div class="f">' + lab(k, h) + '<input name="' + n + '" inputmode="' + (mode || 'decimal') + '" class="num" value="' + esc(s[n]) + '"></div>'; };
  app.innerHTML = '<button class="btn sm" id="bk">← ' + T('back') + '</button><h1>' + (S.sid ? esc(s.name) : T('addSw')) + '</h1><form id="sf">' +
    '<div class="card"><div class="f">' + lab('name') + '<input name="name" required value="' + esc(s.name) + '"></div>' +
    '<div class="fr"><div class="f">' + lab('dob') + '<input type="date" name="dob" required value="' + esc(s.dob) + '"></div>' +
    '<div class="f">' + lab('sex') + '<select name="sex"><option value="M">' + T('M') + '</option><option value="F"' + (s.sex === 'F' ? ' selected' : '') + '>' + T('Fm') + '</option></select></div>' +
    '<div class="f">' + lab('level') + '<select name="level">' + lv + '</select></div>' +
    '<div class="f">' + lab('group') + '<input name="group" value="' + esc(s.group) + '"></div>' + co + '</div></div>' +
    '<div class="card"><h3>📏 ' + T('body') + '</h3><div class="fr">' + inp('height', 'height', 'hHint') + inp('sitH', 'sitH', 'sitHint') + inp('span', 'span', 'spanHint') + inp('weight', 'weight') + inp('hrmaxKnown', 'hrmaxOverride', null, 'numeric') + '</div></div>' +
    '<div class="card"><div class="f">' + lab('notes') + '<textarea name="notes" rows="2">' + esc(s.notes) + '</textarea></div>' +
    '<div class="row"><button class="btn pri big">' + T('save') + '</button>' + (S.sid ? '<span class="sp"></span><button type="button" class="btn dan" id="dl">' + T('del') + '</button>' : '') + '</div></div></form>';
  $('#bk').onclick = function () { S.sid ? route('swimmer') : route('home'); };
  $('#sf').onsubmit = function (e) {
    e.preventDefault(); var f = e.target, rec = Object.assign({}, s);
    ['name', 'dob', 'sex', 'level', 'group', 'height', 'sitH', 'span', 'weight', 'hrmaxKnown', 'notes'].forEach(function (k) { rec[k] = f[k].value.trim(); });
    if (f.coachId) rec.coachId = f.coachId.value; else if (!rec.coachId && DB.me && DB.me.role === 'coach') rec.coachId = DB.me.id;
    rec.id = rec.id || uid();
    rec.body = (s.body || []).slice();
    if (rec.height !== (s.height || '') || rec.weight !== (s.weight || '') || rec.sitH !== (s.sitH || '')) rec.body.push({ date: today(), h: rec.height, w: rec.weight, sh: rec.sitH, span: rec.span });
    mutate('saveSwimmer', { rec: rec }); toast(T('saved')); route('swimmer', { sid: rec.id, tab: 'sum' });
  };
  if (S.sid) $('#dl').onclick = function () { if (confirm(T('confirmDel'))) { mutate('delSwimmer', { id: S.sid }); toast(T('deleted')); route('home'); } };
}

/* ---------- page nageur ---------- */
function vSwimmer(app) {
  var s = sw(S.sid); if (!s) return route('home');
  var P = profile(s);
  var h = '<div class="row"><button class="btn sm" id="bk">← ' + T('swimmers') + '</button><span class="sp"></span><button class="btn sm" id="pr">🖨 ' + T('print') + '</button><button class="btn sm" id="ed">✎ ' + T('edit') + '</button></div>' +
    '<div class="row" style="margin:12px 0"><div class="av" style="width:58px;height:58px;font-size:22px">' + esc(initials(s.name)) + '</div><div class="sp"><h1 style="margin:0">' + esc(s.name) + '</h1><div class="small muted">' +
    (P.age ? '<span class="num">' + R(P.age, 1) + '</span> ' + T('yrs') : '') + (s.weight ? ' · <span class="ltr">' + esc(s.weight) + ' kg</span>' : '') + (s.height ? ' · <span class="ltr">' + esc(s.height) + ' cm</span>' : '') + (s.level ? ' · ' + (s.level == 7 ? T('comp') : T('level') + ' ' + s.level) : '') + (isAdmin() && s.coachId ? ' · 👤 ' + esc(coachName(s.coachId)) : '') + '</div></div>' +
    (P.ready ? '<span class="chip ' + P.ready.level + '"><span class="dot ' + P.ready.level + '"></span> ' + T(P.ready.level).split(':')[0] + '</span>' : '') + '</div>';
  h += '<div class="tabs">' + [['sum', '📊'], ['recovery', '🌙'], ['tests', '🧪'], ['times', '🏅'], ['history', '📈']].map(function (k) { return '<button class="btn sm' + (S.tab === k[0] ? ' on' : '') + '" data-tab="' + k[0] + '">' + k[1] + ' ' + T(k[0]) + '</button>'; }).join('') + '</div>';
  if (S.tab === 'sum') h += summaryHtml(P);
  else if (S.tab === 'tests') h += testsHtml(P);
  else if (S.tab === 'recovery') h += recoveryHtml(s);
  else if (S.tab === 'times') h += timesHtml(s);
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
  if (S.tab === 'recovery') { drawRecovery(s); polarBind(s); drawReport(s); }
}

/* ---------- 📋 التقرير اليومي + ⌚ Polar ---------- */
function A(ar, fr) { return LANG === 'fr' ? fr : ar; }
// حالة الحمل تاع Polar (Cardio load) → فئة
function clCat(d) {
  if (!d) return null;
  var s = String(d.cls || ''), r = C.num(d.clr);
  if (/OVERREACH|EXCESS|HIGH_RISK/i.test(s)) return 'excess';
  if (/PRODUCT/i.test(s)) return 'prod';
  if (/MAINTAIN/i.test(s)) return 'maint';
  if (/DETRAIN|RECOVER|LOW/i.test(s)) return 'low';
  if (r == null) return null;
  return r > 1.5 ? 'excess' : r >= 1 ? 'prod' : r >= 0.8 ? 'maint' : 'low';
}
var CLC = {
  excess: { c: 'bad', ic: '🟠', t: ['حمل زايد (Excessif)', 'Excessif'], x: ['الحمل تاع الأيام الأخيرة فايت بزاف واش متعوّد عليه الجسم. خطر التعب والإصابة ولا المرض يطلع.', 'La charge récente dépasse nettement ce à quoi le corps est habitué : risque accru de fatigue, blessure ou maladie.'] },
  prod: { c: 'ok', ic: '🟢', t: ['حمل منتج (Productif)', 'Productif'], x: ['الحمل فوق العادة شوية: هذا هو لي يحسّن المستوى، بشرط الاسترجاع يكون مليح.', 'Charge légèrement au-dessus de l’habitude : c’est ce qui fait progresser, si la récupération suit.'] },
  maint: { c: 'ok', ic: '🔵', t: ['محافظة (Maintien)', 'Maintien'], x: ['الحمل قريب من العادة: المستوى يبقى كيما راهو.', 'Charge proche de l’habitude : le niveau se maintient.'] },
  low: { c: 'warn', ic: '⚪', t: ['حمل ناقص (Récupération)', 'Récupération / désentraînement'], x: ['الحمل تحت العادة: مليح للاسترجاع، بصح إذا طوّل المستوى يهبط.', 'Charge sous l’habitude : bien pour récupérer, mais si cela dure le niveau baisse.'] }
};
function lastWith(days, date, key) { for (var i = days.length - 1; i >= 0; i--) if (days[i].date <= date && days[i][key] != null && String(days[i][key]) !== '') return days[i]; return null; }
function addDays(iso, n) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function hhmm(h) { h = ((h % 24) + 24) % 24; var m = Math.round(h * 60); return ('0' + Math.floor(m / 60) % 24).slice(-2) + ':' + ('0' + m % 60).slice(-2); }

function dayReport(s, date) {
  var days = daysOf(s.id), d = days.filter(function (x) { return x.date === date; })[0];
  if (!d) return null;
  var age = ageOf(s, date), r = C.readiness(days, date, age), P = profile(s);
  var y = days.filter(function (x) { return x.date === addDays(date, -1); })[0];
  var cl = lastWith(days, date, 'cls') || lastWith(days, date, 'clr'), cat = clCat(cl);
  var need = r ? r.sleepNeed : (age != null && age < 13 ? 9 : 8);
  var rep = { s: s, date: date, d: d, y: y, r: r, cl: cl, cat: cat, age: age, need: need, P: P };
  // ── المستوى النهائي
  var lvl = r ? r.level : null;
  if (cat === 'excess') lvl = !lvl || lvl === 'green' ? 'yellow' : 'red';
  rep.lvl = lvl || 'none';
  rep.ill = r && r.hrvZ != null && r.rhrZ != null && r.hrvZ < -1.5 && r.rhrZ > 1.5;
  if (rep.ill) rep.lvl = 'red';
  // ── مناطق النبض: من الاختبارات، ولا تقريبية من أعلى نبض في حصص Polar
  var z = P.zones, approx = false;
  if (!z) {
    var mx = 0; days.forEach(function (x) { (x.ex || []).forEach(function (e) { if (e.hrMax > mx) mx = e.hrMax; }); });
    if (mx >= 150) { z = C.hrZones(mx, P.hrrest); approx = true; }
  }
  rep.zones = z; rep.zApprox = approx;
  // ── حمل 7 أيام من Polar
  var w7 = 0, n7 = 0, a7 = 0, m7 = 0; days.forEach(function (x) { var k = (new Date(date) - new Date(x.date)) / 864e5; if (k >= 0 && k < 7) (x.ex || []).forEach(function (e) { if (isTraining(e)) { w7 += e.load || 0; n7++; } else { a7 += e.load || 0; m7++; } }); });
  rep.w7 = w7; rep.n7 = n7; rep.a7 = a7; rep.m7 = m7;
  return rep;
}
function zr(rep, a, b) { var z = rep.zones; if (!z) return ''; return ' <span class="num ltr">(' + z[a - 1].lo + '–' + z[b - 1].hi + ' bpm)</span>'; }

function reportHtml(rep) { return reportVisual(rep) + '<div class="rp-sec">📝 ' + A('التفاصيل والشرح', 'Détails et explications') + '</div>' + reportDetails(rep); }
function reportDetails(rep) {
  var d = rep.d, r = rep.r, L = rep.lvl, out = [];
  var head = { green: ['🟢', A('جاهز: حصة عادية حسب البرنامج', 'Prêt : séance normale selon le programme')], yellow: ['🟡', A('تعب خفيف: نقّص الشدة اليوم', 'Fatigue légère : réduire l’intensité aujourd’hui')], red: ['🔴', A('تعب: حصة استرجاع ولا راحة', 'Fatigue : récupération ou repos')], none: ['⚪', A('ما كاينش بيانات كافية للحكم', 'Pas assez de données')] }[L];
  var why = [];
  if (r) r.flags.forEach(function (f) { why.push(T('f_' + f)); });
  if (rep.cat === 'excess') why.push(A('حمل التدريب تاع الأيام الأخيرة زايد (Polar)', 'Charge récente excessive (Polar)'));
  if (rep.ill) why.push(A('HRV هابط ونبض الراحة طالع في نفس الليلة', 'VFC basse et FC de repos haute la même nuit'));
  // 2) واش نديرو اليوم
  var todo = [];
  if (L === 'green') {
    todo.push(A('<b>التدريب:</b> الحصة كيما راهي في البرنامج. الشدة العالية مسموحة (مناطق 3–4' + zr(rep, 3, 4) + ').', '<b>Entraînement :</b> séance prévue. L’intensité élevée est permise (zones 3–4' + zr(rep, 3, 4) + ').'));
    todo.push(A('إحماء 15–20 دقيقة قبل أي سرعة، وتهدئة 10 دقايق في الأخير.', 'Échauffement 15–20 min avant toute vitesse, 10 min de retour au calme.'));
  } else if (L === 'yellow') {
    todo.push(A('<b>التدريب:</b> نقّص <b>الحجم بـ 20–30%</b> وما تديرش تكرارات قصوى اليوم.', '<b>Entraînement :</b> réduire le <b>volume de 20–30 %</b>, pas de répétitions maximales.'));
    todo.push(A('ركّز على <b>التقنية</b> والسباحة الهوائية الخفيفة (مناطق 1–2' + zr(rep, 1, 2) + ').', 'Priorité <b>technique</b> et aérobie léger (zones 1–2' + zr(rep, 1, 2) + ').'));
    todo.push(A('إذا حسّ روحو مليح بعد الإحماء، تقدر تزيد سلسلة متوسطة وحدة برك (منطقة 3).', 'S’il se sent bien après l’échauffement : une seule série modérée (zone 3).'));
  } else if (L === 'red') {
    todo.push(A('<b>التدريب:</b> حصة <b>استرجاع</b> 30–45 دقيقة: سباحة خفيفة جداً (منطقة 1' + zr(rep, 1, 1) + ')، تقنية، مرونة. ولا راحة.', '<b>Entraînement :</b> séance de <b>récupération</b> 30–45 min : nage très facile (zone 1' + zr(rep, 1, 1) + '), technique, mobilité. Ou repos.'));
    todo.push(A('ما كاين لا سرعة، لا اختبار، لا سلاسل ثقيلة اليوم.', 'Pas de vitesse, pas de test, pas de séries dures aujourd’hui.'));
  } else todo.push(A('دخّل بيانات الليل (Polar ولا باليد) باش يخرج التقرير كامل.', 'Ajoutez les données de la nuit (Polar ou saisie) pour un rapport complet.'));
  if (rep.ill) todo.push('🩺 ' + A('<b>انتبه:</b> HRV هابط ونبض الراحة طالع مع بعض: ساعات يكون بداية مرض. إذا عندو سخانة، وجع راس، حلق ولا عياء غير عادي ← راحة وشوفو طبيب.', '<b>Attention :</b> VFC basse + FC de repos haute peuvent annoncer une maladie. En cas de fièvre, maux de tête/gorge ou fatigue inhabituelle : repos et avis médical.'));
  if (rep.cat === 'excess') todo.push('📉 ' + A('<b>الحمل:</b> خفّف الأيام الجاية (2–3 أيام) باش يرجع الحمل قريب من العادة، من غير ما توقف التدريب.', '<b>Charge :</b> alléger les 2–3 prochains jours pour revenir vers l’habitude, sans arrêter.'));
  if (rep.cat === 'low') todo.push('📈 ' + A('<b>الحمل:</b> ناقص على العادة. إذا راهو جاهز، زيد شوية بالتدريج (ماشي أكثر من 10% في الأسبوع).', '<b>Charge :</b> sous l’habitude. S’il est prêt, augmenter progressivement (≤ 10 % par semaine).'));
  out.push(rcard('✅', A('واش نديرو اليوم', 'Que faire aujourd’hui'), '<ul>' + todo.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'));

  // 3) الليل
  var sh = C.num(d.sleepH), sc = C.num(d.sleepScore), night = [];
  if (sh != null) {
    var diff = sh - rep.need;
    night.push(A('<b>مدة النوم:</b> <span class="num">' + n1(sh) + '</span> سوايع. اللازم في عمرو (' + (rep.age ? R(rep.age, 0) : '?') + ' سنة): <b>' + rep.need + '–' + (rep.need + 2) + ' سوايع</b>. ', '<b>Sommeil :</b> <span class="num">' + n1(sh) + '</span> h. Besoin à son âge : <b>' + rep.need + '–' + (rep.need + 2) + ' h</b>. ') +
      (diff >= 0 ? A('✅ كافي.', '✅ suffisant.') : diff >= -1 ? A('🟡 ناقص شوية (' + n1(-diff) + ' سا).', '🟡 un peu court (' + n1(-diff) + ' h).') : A('🔴 ناقص بزاف (' + n1(-diff) + ' سا).', '🔴 trop court (' + n1(-diff) + ' h).')));
  }
  if (sc != null) night.push(A('<b>جودة النوم (Sleep score):</b> <span class="num">' + n0(sc) + '</span>/100 — ', '<b>Sleep score :</b> <span class="num">' + n0(sc) + '</span>/100 — ') +
    (sc >= 80 ? A('ممتاز', 'excellent') : sc >= 70 ? A('مليح', 'bon') : sc >= 60 ? A('متوسط', 'moyen') : A('ضعيف: نوم مقطّع ولا قصير', 'faible : sommeil court ou fragmenté')) + ' <span class="muted small">(' + A('تقريبي', 'indicatif') + ')</span>');
  var rc = C.num(d.recharge);
  if (rc != null) night.push(A('<b>Nightly Recharge:</b> ', '<b>Nightly Recharge :</b> ') + T('rc' + rc) + ' — ' + A('هذا حساب Polar لاسترجاع الجسم في الليل (النوم + الجهاز العصبي).', 'récupération nocturne calculée par Polar (sommeil + système nerveux).'));
  if (r && r.hrvBase && C.num(d.hrv) != null) {
    var p = Math.round((C.num(d.hrv) / r.hrvBase - 1) * 100);
    night.push(A('<b>HRV:</b> <span class="num">' + n0(C.num(d.hrv)) + '</span> ms، والمعدل تاعو <span class="num">' + n0(r.hrvBase) + '</span> (' + (p >= 0 ? '+' : '') + p + '%). ', '<b>VFC :</b> <span class="num">' + n0(C.num(d.hrv)) + '</span> ms, référence <span class="num">' + n0(r.hrvBase) + '</span> (' + (p >= 0 ? '+' : '') + p + ' %). ') +
      (r.hrvZ < -1.5 ? A('🔴 هابط بزاف: الجسم مازال ما استرجعش.', '🔴 nettement basse : pas encore récupéré.') : r.hrvZ < -0.75 ? A('🟡 هابط شوية.', '🟡 un peu basse.') : A('✅ في العادة ولا فوقها: استرجاع مليح.', '✅ normale ou au-dessus : bonne récupération.')));
  } else if (C.num(d.hrv) != null) night.push(A('<b>HRV:</b> <span class="num">' + n0(C.num(d.hrv)) + '</span> ms — نقارنوه مع المعدل تاعو كي يكملو 7 ليالي.', '<b>VFC :</b> <span class="num">' + n0(C.num(d.hrv)) + '</span> ms — comparaison après 7 nuits.'));
  if (r && r.rhrBase && C.num(d.rhr) != null) {
    var q = Math.round(C.num(d.rhr) - r.rhrBase);
    night.push(A('<b>نبض الراحة في الليل:</b> <span class="num">' + n0(C.num(d.rhr)) + '</span> bpm، والمعدل <span class="num">' + n0(r.rhrBase) + '</span> (' + (q >= 0 ? '+' : '') + q + '). ', '<b>FC de repos nocturne :</b> <span class="num">' + n0(C.num(d.rhr)) + '</span> bpm, référence <span class="num">' + n0(r.rhrBase) + '</span> (' + (q >= 0 ? '+' : '') + q + '). ') +
      (r.rhrZ > 1.5 ? A('🔴 طالع بزاف: تعب، ضغط، ولا بداية مرض.', '🔴 nettement haute : fatigue, stress ou début de maladie.') : r.rhrZ > 0.75 ? A('🟡 طالع شوية.', '🟡 un peu haute.') : A('✅ عادي.', '✅ normale.')));
  } else if (C.num(d.rhr) != null) night.push(A('<b>نبض الراحة:</b> <span class="num">' + n0(C.num(d.rhr)) + '</span> bpm.', '<b>FC de repos :</b> <span class="num">' + n0(C.num(d.rhr)) + '</span> bpm.'));
  if (night.length) out.push(rcard('🌙', A('الليل (Polar Loop)', 'La nuit (Polar Loop)'), '<ul>' + night.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'));

  // 4) الحمل والحصص
  var tr = [], ex = (rep.y && rep.y.ex || []).concat(d.ex || []);
  [[rep.y && rep.y.ex || [], A('البارح', 'Hier')], [d.ex || [], A('اليوم', 'Aujourd’hui')]].forEach(function (g) {
    var L = g[0].slice().sort(function (a, b) { return String(a.start).localeCompare(String(b.start)); });
    var main = L.filter(isTraining), oth = L.filter(function (e) { return !isTraining(e); });
    main.forEach(function (e) { tr.push(exLine(e, g[1])); });
    if (oth.length) tr.push('<span class="muted">' + g[1] + ' : ' + A('🚶 ' + oth.length + ' نشاط يومي من الـ Loop (لعب، جري، مشي) — ', '🚶 ' + oth.length + ' activité(s) quotidienne(s) Loop (jeu, course, marche) — ') +
      oth.map(function (e) { return esc(e.start) + ' (' + e.min + ' min, ♥' + (e.hrAvg || '—') + ')'; }).join(' · ') + '</span>');
  });
  if (!ex.length) tr.push(A('ما كاينش حصة مسجلة البارح ولا اليوم في Polar.', 'Aucune séance Polar hier ni aujourd’hui.'));
  if (rep.n7 || rep.m7) tr.push(A('<b>الحمل في 7 أيام:</b> تدريب <span class="num">' + Math.round(rep.w7) + '</span> (' + rep.n7 + ' حصص) · نشاط يومي (لعب، جري، مشي) <span class="num">' + Math.round(rep.a7) + '</span> (' + rep.m7 + ').',
    '<b>Charge 7 jours :</b> entraînement <span class="num">' + Math.round(rep.w7) + '</span> (' + rep.n7 + ' séances) · activité quotidienne (jeu, course, marche) <span class="num">' + Math.round(rep.a7) + '</span> (' + rep.m7 + ').'));
  if (rep.cat) {
    var K = CLC[rep.cat], cl = rep.cl;
    tr.push('<b>' + A('حالة الحمل (Polar):', 'Statut de charge (Polar) :') + '</b> ' + K.ic + ' <span class="chip ' + K.c + '">' + Tv(K.t) + '</span> ' + Tv(K.x) +
      (C.num(cl.str) != null && C.num(cl.tol) != null ? '<div class="small muted">' + A('التعب (Strain) ', 'Fatigue ') + '<span class="num">' + n1(C.num(cl.str)) + '</span> · ' + A('التحمّل (Tolérance) ', 'Tolérance ') + '<span class="num">' + n1(C.num(cl.tol)) + '</span>' + (C.num(cl.clr) != null ? ' · ' + A('النسبة ', 'Ratio ') + '<span class="num">' + R(C.num(cl.clr), 2) + '</span>' : '') + '</div>' : '') + (rep.m7 ? '<div class="small muted">ℹ️ ' + A('Polar تحسب في هذي الحالة حتى النشاط اليومي لي يسجلو الـ Loop (لعب، جري، مشي للمدرسة). الحمل تاع التدريب وحدو هو لي فوق.', 'Polar inclut aussi l’activité quotidienne détectée par la Loop (jeu, course, trajets) ; la charge d’entraînement seule est indiquée ci-dessus.') + '</div>' : '') + (C.num(cl.tol) != null && C.num(cl.tol) < 40 ? '<div class="small muted">ℹ️ ' + A('التحمّل مازال ناقص لأن Polar عندها غير أيام قلال من البيانات: النسبة مضخّمة شوية حتى يكمل قريب 4 أسابيع.', 'Tolérance encore basse faute d’historique : le ratio est surestimé pendant ~4 semaines.') + '</div>' : ''));
  }
  out.push(rcard('🏊', A('التدريب والحمل', 'Entraînement et charge'), '<ul>' + tr.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'));

  // 5) الاسترجاع
  var wake = 6.5, bed = hhmm(wake - rep.need - 0.25);
  var rec = [
    A('<b>النوم الليلة:</b> باش يرقد ' + rep.need + ' سوايع وينوض 06:30، لازم يكون في الفراش قبل <b class="num">' + bed + '</b>. ساعة قبل النوم بلا تيليفون ولا شاشة.', '<b>Ce soir :</b> pour ' + rep.need + ' h de sommeil avec réveil à 06:30, au lit avant <b class="num">' + bed + '</b>. Pas d’écran 1 h avant.')
  ];
  if (L === 'yellow' || L === 'red') rec.push(A('<b>اليوم:</b> نهار هادي، يتجنب الرياضات الأخرى الثقيلة بعد الحصة.', '<b>Aujourd’hui :</b> journée calme, éviter d’autres efforts intenses.'));
  out.push(rcard('💤', A('الاسترجاع', 'Récupération'), '<ul>' + rec.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'));

  // 6) واش نراقبو غدوة
  var wt = [];
  if (sh != null && sh < rep.need) wt.push(A('واش رقد بكري ووصل ' + rep.need + ' سوايع.', 'S’il a dormi au moins ' + rep.need + ' h.'));
  if (r && r.hrvZ != null && r.hrvZ < -0.75) wt.push(A('واش رجع الـ HRV قريب من المعدل تاعو (' + n0(r.hrvBase) + ' ms).', 'Si la VFC revient vers sa référence (' + n0(r.hrvBase) + ' ms).'));
  if (r && r.rhrZ != null && r.rhrZ > 0.75) wt.push(A('واش هبط نبض الراحة لـ ' + n0(r.rhrBase) + ' ولا أقل.', 'Si la FC de repos redescend vers ' + n0(r.rhrBase) + '.'));
  if (rep.cat === 'excess') wt.push(A('حالة الحمل في Polar: لازم تهبط من «Excessif» لـ «Productif».', 'Statut de charge Polar : repasser de « Excessif » à « Productif ».'));
  wt.push(A('كيفاش حسّ روحو في الحصة (من 0 لـ 10)، اكتبها في «إدخال اليوم» ← RPE.', 'Son ressenti de séance (0–10), à saisir dans « Saisir la journée » ← RPE.'));
  out.push(rcard('👀', A('واش نراقبو غدوة', 'À surveiller demain'), '<ul>' + wt.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'));

  // 7) شرح المؤشرات
  out.push('<details class="guide"><summary>📖 ' + A('شرح كل مؤشر', 'Explication des indicateurs') + '</summary><div class="gb">' + [
    A('<b>HRV (تغيّر النبض):</b> الفرق الصغير بين دقة ودقة تاع القلب في الليل. كي يكون <b>طالع</b> على العادة تاعو ← الجهاز العصبي مرتاح والجسم استرجع. كي <b>يهبط</b> ← تعب، ضغط، نوم ناقص ولا مرض. نقارنو كل سباح مع روحو، ماشي مع لخرين.', '<b>VFC :</b> variation entre battements la nuit. <b>Haute</b> par rapport à sa référence = bien récupéré ; <b>basse</b> = fatigue, stress, manque de sommeil ou maladie. On compare le nageur à lui-même.'),
    A('<b>نبض الراحة في الليل:</b> كي يطلع 5 ولا أكثر على العادة ← الجسم مازال يخدم باش يسترجع.', '<b>FC de repos :</b> +5 bpm ou plus que d’habitude = l’organisme récupère encore.'),
    A('<b>Nightly Recharge:</b> حساب Polar من جوج حوايج: النوم (Sleep charge) والجهاز العصبي (ANS charge)، مقارنين مع 28 يوم لي فاتو.', '<b>Nightly Recharge :</b> combinaison Polar du sommeil (Sleep charge) et du système nerveux (ANS charge), comparés aux 28 derniers jours.'),
    A('<b>Cardio load (حمل الحصة):</b> Polar تحسبو من النبض والمدة. كل ما كانت الحصة أطول وأقوى، كبر الرقم.', '<b>Cardio load :</b> calculé par Polar à partir de la FC et de la durée. Plus la séance est longue et intense, plus il est élevé.'),
    A('<b>Strain / Tolérance:</b> الـ Strain = التعب تاع الأيام الأخيرة. الـ Tolérance = واش متعوّد عليه في الأسابيع لي فاتو. كي الـ Strain يفوت الـ Tolérance بزاف ← Excessif.', '<b>Strain / Tolérance :</b> fatigue récente vs habitude des semaines passées. Strain bien au-dessus de la tolérance = Excessif.'),
    A('<b>المناطق:</b> 1 = خفيف جداً (استرجاع) · 2 = هوائي سهل · 3 = متوسط · 4 = قوي (العتبة) · 5 = أقصى.', '<b>Zones :</b> 1 très facile · 2 aérobie facile · 3 modéré · 4 intense (seuil) · 5 maximal.') +
      (rep.zApprox ? ' <span class="small muted">' + A('(المناطق تقريبية من أعلى نبض في حصص Polar، دير اختبار باش تولي دقيقة)', '(zones approximatives d’après la FC max des séances Polar ; un test les précisera)') + '</span>' : ''),
    A('<b>ملاحظة:</b> هذا التقرير أداة مساعدة للمدرب. كيفاش يحس السباح روحو والملاحظة في المسبح يبقاو مهمين، وما يعوّضش رأي الطبيب.', '<b>Note :</b> outil d’aide à l’entraîneur ; le ressenti et l’observation restent essentiels ; ne remplace pas un avis médical.')
  ].map(function (x) { return '<p>' + x + '</p>'; }).join('') + '</div></details>');
  return out.join('');
}
function rcard(ic, t, body) { return '<div class="kbox" style="margin-bottom:10px"><h3 style="margin-bottom:6px">' + ic + ' ' + t + '</h3><div class="small" style="font-size:14.5px">' + body + '</div></div>'; }
function isTraining(e) { var sp = String(e.sport || ''); if (/SWIM|NATATION|POOL/i.test(sp)) return true; return (e.min || 0) >= 45; }
function exLine(e, when) {
  return '⌚ <b>' + when + ' ' + esc(e.start || '') + '</b> — ' + A('المدة', 'durée') + ' <span class="num">' + (e.min || '—') + '</span> min · ' + A('النبض', 'FC') + ' <span class="num">' + (e.hrAvg || '—') + '</span> (max <span class="num">' + (e.hrMax || '—') + '</span>)' +
    (e.load != null ? ' · ' + A('الحمل', 'charge') + ' <span class="num">' + e.load + '</span>' : '');
}
function reportText(rep) {
  var el = document.createElement('div'); el.innerHTML = energyHtml(rep) + reportDetails(rep);
  Array.prototype.forEach.call(el.querySelectorAll('details'), function (x) { x.remove(); });
  Array.prototype.forEach.call(el.querySelectorAll('li'), function (x) { x.insertAdjacentText('afterbegin', '• '); x.insertAdjacentText('beforeend', '\n'); });
  Array.prototype.forEach.call(el.querySelectorAll('div.small'), function (x) { x.insertAdjacentText('beforebegin', '\n'); });
  Array.prototype.forEach.call(el.querySelectorAll('h3,b[style]'), function (x) { x.insertAdjacentText('beforebegin', '\n'); x.insertAdjacentText('afterend', '\n'); });
  var hd = { green: '🟢 ' + A('جاهز: حصة عادية', 'Prêt : séance normale'), yellow: '🟡 ' + A('تعب خفيف: نقّص الشدة', 'Fatigue légère : réduire l’intensité'), red: '🔴 ' + A('تعب: استرجاع ولا راحة', 'Fatigue : récupération'), none: '⚪' }[rep.lvl], sc = rpScore(rep);
  var why = []; if (rep.r) rep.r.flags.forEach(function (f) { why.push(T('f_' + f)); }); if (rep.cat === 'excess') why.push(A('حمل الأيام الأخيرة زايد', 'charge récente excessive'));
  return ('📋 ' + A('التقرير اليومي', 'Rapport du jour') + ' — ' + rep.s.name + ' — ' + fmtDate(rep.date) + '\n' + hd + (sc != null ? ' (' + sc + '/100)' : '') + (why.length ? '\n' + A('السبب: ', 'Pourquoi : ') + why.join('، ') : '') + '\n' + el.innerText).replace(/\n{3,}/g, '\n\n').trim();
}
function drawReport(s) {
  var box = $('#day-report'); if (!box) return;
  var days = daysOf(s.id); if (!days.length) { box.innerHTML = ''; return; }
  var dates = days.map(function (x) { return x.date; }).reverse().slice(0, 30);
  if (!S.rdate || dates.indexOf(S.rdate) < 0) S.rdate = dates[0];
  var rep = dayReport(s, S.rdate);
  box.innerHTML = '<div class="card"><div class="row" style="margin-bottom:10px"><h2 class="sp" style="margin:0">📋 ' + A('التقرير اليومي', 'Rapport du jour') + '</h2>' +
    '<select id="rp-d" style="width:auto">' + dates.map(function (x) { return '<option value="' + x + '"' + (x === S.rdate ? ' selected' : '') + '>' + fmtDate(x) + '</option>'; }).join('') + '</select>' +
    '<button class="btn sm" id="rp-cp">📲 ' + A('نسخ (واتساب)', 'Copier') + '</button><button class="btn sm" id="rp-pr">🖨 ' + A('طباعة', 'Imprimer') + '</button></div>' +
    '<div id="rp-body">' + (rep ? reportHtml(rep) : '<p class="muted">' + T('noDays') + '</p>') + '</div></div>';
  if (rep) drawReportCharts(rep);
  $('#rp-d').onchange = function () { S.rdate = this.value; killCharts(); render(); };
  $('#rp-cp').onclick = function () {
    var t = reportText(rep);
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('✅ ' + A('تنسخ، لصقو في واتساب', 'Copié')); }).catch(function () { prompt('', t); });
  };
  $('#rp-pr').onclick = function () {
    var cl = $('#rp-body').cloneNode(true), src = $$('#rp-body canvas');
    var imgs = [];
    $$('canvas', cl).forEach(function (cv, i) { var im = document.createElement('img'); try { im.src = src[i].toDataURL('image/png'); } catch (e) {} im.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block'; imgs.push(im); cv.parentNode.replaceChild(im, cv); });
    $$('details', cl).forEach(function (x) { x.setAttribute('open', ''); });
    $('#print').innerHTML = '<div dir="' + (LANG === 'fr' ? 'ltr' : 'rtl') + '"><h2>📋 ' + A('التقرير اليومي', 'Rapport du jour') + ' — ' + esc(s.name) + ' — ' + fmtDate(rep.date) + '</h2></div>';
    $('#print').firstChild.appendChild(cl);
    // نستناو الصور يتحملو قبل الطباعة، ولا يخرجو فارغين
    Promise.all(imgs.map(function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); })).then(function () { setTimeout(function () { window.print(); }, 150); });
  };
}

/* ---------- 📋 التقرير اليومي: الشكل العصري (بطاقات + منحنيات) ---------- */
var ZC = ['#B4B2A9', '#85B7EB', '#97C459', '#EF9F27', '#F0738A'];
function rpCss() {
  if (document.getElementById('rp-css')) return;
  var st = document.createElement('style'); st.id = 'rp-css';
  st.textContent = '.rp-hero{display:flex;align-items:center;gap:14px;border-radius:18px;padding:14px 16px;margin-bottom:12px}.rp-hero .ic{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font-size:26px;flex:none;background:rgba(255,255,255,.55)}' +
    '.rp-hero.green{background:#e3f7ee;color:#0a5b3a}.rp-hero.yellow{background:#fff4dc;color:#6b4a00}.rp-hero.red{background:#fde8e8;color:#7a1c1c}.rp-hero.none{background:#eef2f8;color:#3d5078}' +
    '.rp-score{text-align:center;min-width:64px}.rp-score b{display:block;font:700 30px/1 Rubik}.rp-score small{font-size:11px}' +
    '.rp-k{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));margin-bottom:12px}' +
    '.rp-c{background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px;box-shadow:var(--sh)}.rp-c .l{font-size:12.5px;color:var(--mute);font-weight:700}.rp-c .v{font:700 26px/1.2 Rubik;color:var(--navy);direction:ltr;unicode-bidi:isolate}.rp-c .v small{font-size:12px;color:var(--mute)}.rp-c .n{font-size:12px;margin-top:4px}' +
    '.rp-bar{height:8px;background:#e6edf8;border-radius:5px;overflow:hidden;margin-top:6px}.rp-bar i{display:block;height:100%;border-radius:5px}.rp-seg{display:flex;gap:3px;margin-top:8px}.rp-seg i{flex:1;height:9px;border-radius:3px;background:#e6edf8}' +
    '.rp-z{display:flex;height:22px;border-radius:7px;overflow:hidden;margin:6px 0 4px;direction:ltr}.rp-z i{display:block}.rp-zl{display:flex;justify-content:space-between;font-size:11.5px;color:var(--mute);direction:ltr}' +
    '.rp-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.rp-chips span{background:#f3f7ff;border:1px solid var(--line);border-radius:999px;padding:3px 10px;font-size:12.5px}.rp-chips b{font-family:Rubik}' +
    '.rp-g2{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));margin-bottom:12px}.rp-ch{position:relative;height:190px}.rp-ch.s{height:150px}' +
    '.rp-do{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr))}.rp-do div{border-radius:12px;padding:10px}.rp-do b{display:block}.rp-do small{font-size:12.5px}' +
    '.rp-lb{display:flex;align-items:flex-end;gap:6px;height:80px;direction:ltr}.rp-lb div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:stretch}.rp-lb span{display:block;border-radius:3px 3px 0 0}.rp-lb em{font-style:normal;font-size:10.5px;color:var(--mute);text-align:center}' +
    '.rp-sec{font-weight:800;color:var(--navy);margin:16px 0 8px;font-size:16px}@media print{.rp-hero,.rp-c,.rp-z i,.rp-do div,.rp-lb span,.rp-seg i,.rp-bar i,.chip{-webkit-print-color-adjust:exact;print-color-adjust:exact}.rp-c{break-inside:avoid;box-shadow:none}.rp-big{break-inside:auto}.rp-ch{break-inside:avoid}.rp-sec{break-after:avoid}#print .rp-ch{height:170px}#print .rp-ch.s{height:140px}}';
  document.head.appendChild(st);
}
function rpScore(rep) {
  if (!rep.r) return null;
  var s = 100 - rep.r.score * 12 - (rep.cat === 'excess' ? 15 : 0) - (rep.ill ? 20 : 0);
  s = Math.max(5, Math.min(100, Math.round(s)));
  return rep.lvl === 'red' ? Math.min(s, 39) : rep.lvl === 'yellow' ? Math.min(s, 69) : s;
}
function spark(vals, color, base) {
  var v = vals.filter(function (x) { return x != null; }); if (v.length < 2) return '';
  var lo = Math.min.apply(null, v.concat(base != null ? [base] : [])), hi = Math.max.apply(null, v.concat(base != null ? [base] : [])); if (hi === lo) { hi++; lo--; }
  var n = vals.length, pts = [], dots = '';
  vals.forEach(function (x, i) { if (x == null) return; var X = 4 + i * 92 / Math.max(1, n - 1), Y = 26 - (x - lo) / (hi - lo) * 22; pts.push(X.toFixed(1) + ',' + Y.toFixed(1)); if (i === n - 1) dots = '<circle cx="' + X.toFixed(1) + '" cy="' + Y.toFixed(1) + '" r="2.8" fill="' + color + '"/>'; });
  var b = base != null ? '<line x1="0" x2="100" y1="' + (26 - (base - lo) / (hi - lo) * 22).toFixed(1) + '" y2="' + (26 - (base - lo) / (hi - lo) * 22).toFixed(1) + '" stroke="#9aa9bb" stroke-dasharray="3 3" stroke-width="1"/>' : '';
  return '<svg viewBox="0 0 100 30" preserveAspectRatio="none" style="width:100%;height:30px;margin-top:4px">' + b + '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="2" vector-effect="non-scaling-stroke"/>' + dots + '</svg>';
}
// المناطق تاع الحصة: تاع Polar إذا كاينين، ولا تاع التقرير
function exZones(e, rep) {
  if (e.zones && e.zones.length) {
    var z = e.zones.slice().sort(function (a, b) { return a.lo - b.lo; });
    return { lo: z.map(function (x) { return x.lo; }), hi: z.map(function (x) { return x.hi; }), sec: z.map(function (x) { return x.sec; }), src: 'polar' };
  }
  if (!rep.zones) return null;
  var lo = rep.zones.map(function (x) { return x.lo; }), hi = rep.zones.map(function (x) { return x.hi; }), sec = [0, 0, 0, 0, 0];
  (e.hr || []).forEach(function (b) { if (b > 0) sec[zIdx(b, lo)] += e.rate || 5; });
  return { lo: lo, hi: hi, sec: sec, src: 'app' };
}
function zIdx(b, lo) { var k = 0; for (var i = 0; i < lo.length; i++) if (b >= lo[i]) k = i; return k; }
// مصادر الطاقة (تقديري من النبض، ولا نسب Polar إذا بعثتهم)
function energy(e, rep) {
  if (!e.hr || !e.hr.length) return null;
  var rest = C.num(rep.d.rhr) || 60, mx = Math.max(e.hrMax || 0, rep.zones ? rep.zones[4].hi : 0, Math.max.apply(null, e.hr)) || 190;
  var kc = e.kcal || null, ws = e.hr.map(function (b) { return b > 0 ? Math.max(b - 70, 5) : 0; }), W = ws.reduce(function (a, b) { return a + b; }, 0) || 1, perMin = 60 / (e.rate || 5);
  var cho = [], fat = [], tc = 0, tf = 0, tp = 0;
  e.hr.forEach(function (b, i) {
    if (!b) { cho.push(null); fat.push(null); return; }
    var I = Math.max(0, Math.min(1, (b - rest) / (mx - rest))), fc = Math.max(0.1, Math.min(0.95, 0.1 + 0.9 * Math.pow(I, 1.3))), k = kc ? kc * ws[i] / W * perMin : ws[i] / 12;
    cho.push(+(k * fc).toFixed(2)); fat.push(+(k * (0.98 - fc)).toFixed(2)); tc += fc; tf += 0.98 - fc; tp += 0.02;
  });
  var T = tc + tf + tp, pc = { c: Math.round(tc / T * 100), f: Math.round(tf / T * 100), p: Math.round(tp / T * 100) }, polar = false;
  if (e.choP != null && e.fatP != null) { pc = { c: Math.round(e.choP), f: Math.round(e.fatP), p: Math.round(e.proP || 0) }; polar = true; }
  return { cho: cho, fat: fat, pc: pc, polar: polar, perMin: !!kc };
}
function fmtMS(s) { s = Math.round(s); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + ('0' + m).slice(-2) : m) + ':' + ('0' + x).slice(-2); }

function reportVisual(rep) {
  rpCss();
  var d = rep.d, r = rep.r, L = rep.lvl, sc = rpScore(rep), days = daysOf(rep.s.id).filter(function (x) { return x.date <= rep.date; }).slice(-7);
  var head = { green: ['🟢', A('جاهز: حصة عادية حسب البرنامج', 'Prêt : séance normale')], yellow: ['🟡', A('تعب خفيف: نقّص الشدة اليوم', 'Fatigue légère : réduire l’intensité')], red: ['🔴', A('تعب: حصة استرجاع ولا راحة', 'Fatigue : récupération ou repos')], none: ['⚪', A('ما كاينش بيانات كافية', 'Données insuffisantes')] }[L];
  var why = []; if (r) r.flags.forEach(function (f) { why.push(T('f_' + f)); }); if (rep.cat === 'excess') why.push(A('حمل الأيام الأخيرة زايد', 'charge récente excessive')); if (rep.ill) why.push(A('HRV هابط + نبض الراحة طالع', 'VFC basse + FC repos haute'));
  var h = '<div class="rp-hero ' + L + '"><div class="ic">' + head[0] + '</div><div class="sp"><b style="font-size:19px">' + head[1] + '</b><div class="small">' + esc(rep.s.name) + ' · ' + fmtDate(rep.date) + (why.length ? ' · ' + A('السبب: ', '') + why.join('، ') : '') + '</div>' +
    (r && r.baseN < 7 ? '<div class="small">⚠️ ' + A('تقييم أوّلي (' + r.baseN + '/7 ليالي)', 'provisoire (' + r.baseN + '/7 nuits)') + '</div>' : '') + '</div>' +
    (sc != null ? '<div class="rp-score"><b>' + sc + '</b><small>' + A('الجاهزية /100', 'forme /100') + '</small></div>' : '') + '</div>';

  // ── بطاقات الليل
  var sh = C.num(d.sleepH), need = rep.need, rc = C.num(d.recharge);
  var hrvS = days.map(function (x) { return C.num(x.hrv); }), rhrS = days.map(function (x) { return C.num(x.rhr); });
  var prev = function (k) { for (var i = days.length - 2; i >= 0; i--) if (C.num(days[i][k]) != null) return C.num(days[i][k]); return null; };
  var pH = prev('hrv'), pR = prev('rhr'), hv = C.num(d.hrv), rh = C.num(d.rhr);
  h += '<div class="rp-k">';
  h += '<div class="rp-c"><div class="l">🌙 ' + A('النوم', 'Sommeil') + '</div><div class="v">' + n1(sh) + ' <small>h</small></div><div class="rp-bar"><i style="width:' + Math.min(100, (sh || 0) / (need + 2) * 100) + '%;background:' + (sh == null ? '#ccc' : sh >= need ? '#1D9E75' : sh >= need - 1 ? '#EF9F27' : '#E24B4A') + '"></i></div><div class="n muted">' + A('اللازم', 'Besoin') + ' <span class="num ltr">' + need + '–' + (need + 2) + 'h</span>' + (C.num(d.sleepScore) != null ? ' · Score <b class="num">' + n0(C.num(d.sleepScore)) + '</b>' : '') + '</div></div>';
  h += '<div class="rp-c"><div class="l">💓 HRV</div><div class="v">' + n0(hv) + ' <small>ms</small></div>' + spark(hrvS, '#378ADD', r && r.hrvBase) + '<div class="n" style="color:' + (hv != null && pH != null ? (hv >= pH ? '#0e9f6e' : '#c27c00') : 'var(--mute)') + '">' + (hv != null && pH != null ? (hv >= pH ? '▲ ' : '▼ ') + A('على البارح', 'vs veille') + ' (' + pH + ')' : r && r.hrvBase ? A('المعدل', 'Réf.') + ' ' + n0(r.hrvBase) : '—') + '</div></div>';
  h += '<div class="rp-c"><div class="l">❤️ ' + A('نبض الراحة', 'FC repos') + '</div><div class="v">' + n0(rh) + ' <small>bpm</small></div>' + spark(rhrS, '#E24B4A', r && r.rhrBase) + '<div class="n" style="color:' + (rh != null && pR != null ? (rh <= pR ? '#0e9f6e' : '#c27c00') : 'var(--mute)') + '">' + (rh != null && pR != null ? (rh <= pR ? '▼ ' : '▲ ') + A('على البارح', 'vs veille') + ' (' + pR + ')' : '—') + '</div></div>';
  h += '<div class="rp-c"><div class="l">🔋 Nightly Recharge</div><div class="v" style="font-size:20px">' + (rc != null ? T('rc' + rc) : '—') + '</div><div class="rp-seg">' + [1, 2, 3, 4, 5].map(function (i) { return '<i style="' + (rc != null && i <= rc ? 'background:' + (rc >= 4 ? '#1D9E75' : rc === 3 ? '#EF9F27' : '#E24B4A') : '') + '"></i>'; }).join('') + '</div><div class="n muted">' + (rc != null ? rc + ' / 5' : '') + '</div></div>';
  h += '</div>';

  // ── الحصص (منحنى النبض + الطاقة)
  var trn = (d.ex || []).filter(isTraining), when = A('اليوم', 'Aujourd’hui');
  if (!trn.length && rep.y) { trn = (rep.y.ex || []).filter(isTraining); when = A('البارح', 'Hier'); }
  rep.charts = [];
  trn.forEach(function (e, i) {
    var Z = exZones(e, rep), tot = Z ? Z.sec.reduce(function (a, b) { return a + b; }, 0) || 1 : 1, en = energy(e, rep);
    h += '<div class="rp-sec">🏊 ' + when + ' ' + esc(e.start) + ' — ' + A('حصة التدريب', 'séance') + '</div><div class="rp-c rp-big" style="margin-bottom:12px">' +
      '<div class="rp-chips"><span>⏱ <b>' + (e.min || '—') + '</b> min</span><span>♥ ' + A('متوسط', 'moy.') + ' <b>' + (e.hrAvg || '—') + '</b></span><span>▲ max <b>' + (e.hrMax || '—') + '</b></span>' + (e.load != null ? '<span>🔥 ' + A('الحمل', 'charge') + ' <b>' + e.load + '</b></span>' : '') + (e.kcal ? '<span>⚡ <b>' + e.kcal + '</b> kcal</span>' : '') + '</div>';
    if (Z) h += '<div class="rp-z">' + Z.sec.map(function (s, k) { return '<i title="Z' + (k + 1) + '" style="width:' + (s / tot * 100) + '%;background:' + ZC[k] + '"></i>'; }).join('') + '</div><div class="rp-zl">' + Z.sec.map(function (s, k) { return '<span><b style="color:' + ZC[k] + '">■</b> Z' + (k + 1) + ' ' + Math.round(s / tot * 100) + '% · ' + fmtMS(s) + '</span>'; }).join('') + '</div>';
    if (e.hr && e.hr.length) {
      h += '<div class="small muted" style="margin-top:10px">' + A('منحنى النبض (bpm)', 'Fréquence cardiaque (bpm)') + '</div><div class="rp-ch"><canvas id="rp-hr-' + i + '"></canvas></div>';
      if (en) h += '<div class="small muted" style="margin-top:8px">' + A('مصادر الطاقة', 'Sources d’énergie') + ' (' + (en.perMin ? 'kcal/min' : A('نسبي', 'relatif')) + ') — <b style="color:#F26B21">■ ' + A('سكريات', 'Glucides') + ' ' + en.pc.c + '%</b> · <b style="color:#E0B020">■ ' + A('دهون', 'Lipides') + ' ' + en.pc.f + '%</b> · ' + A('بروتين', 'Protéines') + ' ' + en.pc.p + '%' + (en.polar ? '' : ' <span class="chip warn" style="font-size:11px">' + A('تقديري', 'estimation') + '</span>') + '</div><div class="rp-ch s"><canvas id="rp-en-' + i + '"></canvas></div>';
      rep.charts.push({ i: i, e: e, Z: Z, en: en });
    } else h += '<div class="small muted" style="margin-top:8px">⏳ ' + A('المنحنى يجي مع الجلب الجاي (🔄 جيب دوك).', 'Courbe disponible à la prochaine synchro.') + '</div>';
    h += '</div>';
  });

  // ── الحمل 7 أيام (أعمدة) + الاتجاهات
  var L7 = []; for (var k = 6; k >= 0; k--) { var dt = addDays(rep.date, -k), dd = daysOf(rep.s.id).filter(function (x) { return x.date === dt; })[0], t = 0, a = 0; (dd && dd.ex || []).forEach(function (e) { if (isTraining(e)) t += e.load || 0; else a += e.load || 0; }); L7.push({ d: dt, t: t, a: a }); }
  var mx = Math.max.apply(null, L7.map(function (x) { return x.t + x.a; })) || 1, K = rep.cat ? CLC[rep.cat] : null;
  h += '<div class="rp-g2"><div class="rp-c"><div class="l">📊 ' + A('الحمل في 7 أيام', 'Charge sur 7 jours') + '</div><div class="rp-lb" style="margin-top:8px">' + L7.map(function (x) { return '<div><span style="height:' + (x.a / mx * 64) + 'px;background:#9FE1CB"></span><span style="height:' + (x.t / mx * 64) + 'px;background:#534AB7"></span><em>' + x.d.slice(8) + '</em></div>'; }).join('') + '</div>' +
    '<div class="n"><b style="color:#534AB7">■</b> ' + A('تدريب', 'entraînement') + ' <b class="num">' + Math.round(rep.w7) + '</b> · <b style="color:#1D9E75">■</b> ' + A('نشاط يومي', 'activité') + ' <b class="num">' + Math.round(rep.a7) + '</b></div>' +
    (K ? '<div style="margin-top:8px"><span class="chip ' + K.c + '">' + K.ic + ' Polar : ' + Tv(K.t) + '</span>' + (C.num(rep.cl.clr) != null ? ' <span class="small muted">' + A('النسبة', 'ratio') + ' <b class="num">' + R(C.num(rep.cl.clr), 2) + '</b></span>' : '') + '</div>' : '') + '</div>' +
    '<div class="rp-c"><div class="l">📈 ' + A('HRV ونبض الراحة (14 يوم)', 'VFC et FC repos (14 j)') + '</div><div class="rp-ch s"><canvas id="rp-tr1"></canvas></div></div></div>';
  h += '<div class="rp-c" style="margin-bottom:12px"><div class="l">🌙 ' + A('النوم والحمل (14 يوم)', 'Sommeil et charge (14 j)') + '</div><div class="rp-ch s"><canvas id="rp-tr2"></canvas></div></div>';

  // ── واش نديرو اليوم (3 بطاقات)
  var tiles = {
    green: [['#E1F5EE', '#085041', '✅ ' + A('حصة عادية', 'Séance normale'), A('حسب البرنامج', 'selon le programme')], ['#E6F1FB', '#0C447C', '🎯 Z3–Z4', zTxt(rep, 3, 4) + ' ' + A('مسموح', 'permis')]],
    yellow: [['#E6F1FB', '#0C447C', '⬇️ ' + A('الحجم −20 لـ 30%', 'Volume −20 à 30 %'), A('بلا تكرارات قصوى', 'pas de max')], ['#E1F5EE', '#085041', '🎯 Z1–Z2', zTxt(rep, 1, 2) + ' · ' + A('تقنية', 'technique')]],
    red: [['#FCEBEB', '#791F1F', '🛌 ' + A('استرجاع', 'Récupération'), A('30–45 د خفيف ولا راحة', '30–45 min facile ou repos')], ['#E1F5EE', '#085041', '🎯 Z1', zTxt(rep, 1, 1)]],
    none: [['#eef2f8', '#3d5078', '📝 ' + A('دخّل الليل', 'Saisir la nuit'), A('Polar ولا باليد', 'Polar ou manuel')]]
  }[L].concat([['#EEEDFE', '#3C3489', '🛏 ' + A('يرقد قبل', 'Au lit avant') + ' ' + hhmm(6.5 - need - 0.25), A('ماء + ماكلة بعد الحصة', 'eau + repas après')]]);
  h += '<div class="rp-sec">✅ ' + A('واش نديرو اليوم', 'Que faire aujourd’hui') + '</div><div class="rp-do" style="margin-bottom:12px">' + tiles.map(function (t) { return '<div style="background:' + t[0] + ';color:' + t[1] + '"><b>' + t[2] + '</b><small>' + t[3] + '</small></div>'; }).join('') + '</div>';
  h += energyHtml(rep);
  return h;
}
function zTxt(rep, a, b) { var z = rep.zones; return z ? z[a - 1].lo + '–' + z[b - 1].hi + ' bpm' : ''; }

function drawReportCharts(rep) {
  if (!window.Chart) return;
  var o0 = function () { var o = chartBase(); o.plugins.legend = { display: false }; o.interaction = { mode: 'index', intersect: false }; return o; };
  (rep.charts || []).forEach(function (c) {
    var e = c.e, rate = e.rate || 5, lab = e.hr.map(function (_, k) { return fmtMS(k * rate); });
    var lo = c.Z ? c.Z.lo : null, col = function (b) { return lo ? ZC[zIdx(b, lo)] : '#E24B4A'; };
    var imax = e.hr.indexOf(Math.max.apply(null, e.hr));
    var o = o0(); o.scales = { x: { ticks: { maxTicksLimit: 7, maxRotation: 0 }, grid: { display: false } }, y: { suggestedMin: 80 } };
    o.plugins.tooltip = { callbacks: { label: function (x) { return x.parsed.y + ' bpm'; } } };
    mk('rp-hr-' + c.i, { type: 'line', data: { labels: lab, datasets: [{ data: e.hr.map(function (b) { return b || null; }), borderWidth: 2, pointRadius: e.hr.map(function (_, k) { return k === imax ? 4 : 0; }), pointBackgroundColor: '#E24B4A', spanGaps: false,
      segment: { borderColor: function (ctx) { return col(ctx.p1.parsed.y); } }, borderColor: '#97C459', tension: 0.25 }].concat(lo ? lo.slice(1).map(function (v, k) { return { data: e.hr.map(function () { return v; }), borderColor: ZC[k + 1] + '66', borderWidth: 1, borderDash: [4, 4], pointRadius: 0 }; }) : []) }, options: o });
    if (c.en) {
      var o2 = o0(); o2.scales = { x: { ticks: { maxTicksLimit: 7, maxRotation: 0 }, grid: { display: false } }, y: { min: 0 } };
      mk('rp-en-' + c.i, { type: 'line', data: { labels: lab, datasets: [{ data: c.en.cho, borderColor: '#F26B21', borderWidth: 1.8, pointRadius: 0, tension: .3 }, { data: c.en.fat, borderColor: '#E0B020', borderWidth: 1.8, pointRadius: 0, tension: .3 }] }, options: o2 });
    }
  });
  var all = daysOf(rep.s.id).filter(function (x) { return x.date <= rep.date; }).slice(-14), lab = all.map(function (x) { return x.date.slice(8) + '/' + x.date.slice(5, 7); });
  var base = all.map(function (x) { var r = C.readiness(daysOf(rep.s.id), x.date); return r && r.hrvBase ? Math.round(r.hrvBase) : null; });
  var o = chartBase(); o.plugins.legend = { position: 'bottom', labels: { boxWidth: 10 } }; o.spanGaps = true; o.scales = { y: { title: { display: true, text: 'ms' } }, y2: { position: 'right', grid: { display: false }, title: { display: true, text: 'bpm' } } };
  mk('rp-tr1', { type: 'line', data: { labels: lab, datasets: [{ label: 'HRV', data: all.map(function (x) { return C.num(x.hrv); }), borderColor: '#378ADD', backgroundColor: '#378ADD', borderWidth: 2.5 }, { label: A('المعدل', 'Réf.'), data: base, borderColor: '#9aa9bb', borderDash: [5, 4], pointRadius: 0 }, { label: A('نبض الراحة', 'FC repos'), data: all.map(function (x) { return C.num(x.rhr); }), borderColor: '#E24B4A', backgroundColor: '#E24B4A', yAxisID: 'y2' }] }, options: o });
  var o3 = chartBase(); o3.plugins.legend = { position: 'bottom', labels: { boxWidth: 10 } }; o3.scales = { y: { min: 0, title: { display: true, text: 'h' } }, y2: { position: 'right', min: 0, grid: { display: false } } };
  mk('rp-tr2', { type: 'bar', data: { labels: lab, datasets: [{ type: 'bar', label: A('النوم (سا)', 'Sommeil (h)'), data: all.map(function (x) { return C.num(x.sleepH); }), backgroundColor: all.map(function (x) { var s = C.num(x.sleepH); return s == null ? '#ccc' : s >= rep.need ? '#5DCAA5' : s >= rep.need - 1 ? '#FAC775' : '#F09595'; }), borderRadius: 4 },
    { type: 'line', label: 'Cardio load', data: all.map(function (x) { var t = 0, n = 0; (x.ex || []).forEach(function (e) { if (isTraining(e) && e.load != null) { t += e.load; n++; } }); return n ? t : C.num(x.cl); }), borderColor: '#534AB7', backgroundColor: '#534AB7', yAxisID: 'y2', spanGaps: true }] }, options: o3 });
}

/* ---------- 🔥 الطاقة والاسترجاع ---------- */
function rpMainEx(rep) {
  var t = (rep.d.ex || []).filter(isTraining), w = A('اليوم', 'aujourd’hui');
  if (!t.length && rep.y) { t = (rep.y.ex || []).filter(isTraining); w = A('البارح', 'hier'); }
  if (!t.length) return null;
  var e = t.slice().sort(function (a, b) { return (b.load || b.min || 0) - (a.load || a.min || 0); })[0];
  var min = t.reduce(function (a, x) { return a + (x.min || 0); }, 0), kcal = t.reduce(function (a, x) { return a + (x.kcal || 0); }, 0);
  var Z = exZones(e, rep), tot = Z ? Z.sec.reduce(function (a, b) { return a + b; }, 0) || 1 : 1, hi = Z ? (Z.sec[3] + Z.sec[4]) / tot : 0;
  return { e: e, when: w, min: min, kcal: kcal || null, hiPct: Math.round(hi * 100), en: energy(e, rep), hard: min > 60 || hi > 0.2 || (e.load || 0) >= 80, easy: min < 45 && hi < 0.1 };
}
function energyHtml(rep) {
  var m = rpMainEx(rep), h = '<div class="rp-sec">🔥 ' + A('الطاقة والاسترجاع', 'Énergie et récupération') + '</div>';
  if (m) {
    var pc = m.en ? m.en.pc : null, k = m.kcal, est = m.en && !m.en.polar;
    h += '<div class="rp-c" style="margin-bottom:10px"><div class="l">' + A('واش حرق في حصة ', 'Dépense de la séance d’') + m.when + ' · <span class="num">' + m.min + '</span> min' + (k ? ' · <b class="num">' + k + '</b> kcal' : '') + (est ? ' <span class="chip warn" style="font-size:11px">' + A('تقديري', 'estimation') + '</span>' : '') + '</div>';
    if (pc) h += '<div class="rp-z" style="height:26px;margin-top:8px"><i style="width:' + pc.c + '%;background:#F26B21"></i><i style="width:' + pc.f + '%;background:#F2C94C"></i><i style="width:' + pc.p + '%;background:#9B7BD4"></i></div>';
    var row = function (c, t, p, x) { return '<div style="display:flex;gap:10px;align-items:flex-start;margin-top:8px"><span style="width:12px;height:12px;border-radius:3px;background:' + c + ';margin-top:5px;flex:none"></span><div><b>' + t + (p != null ? ' — <span class="num">' + p + '%</span>' + (k ? ' <span class="small muted">(≈ <span class="num">' + Math.round(k * p / 100) + '</span> kcal)</span>' : '') : '') + '</b><div class="small">' + x + '</div></div></div>'; };
    h += row('#F26B21', A('السكريات (Glucides)', 'Glucides'), pc && pc.c, A('«البنزين» تاع السرعة والسلاسل القوية، تتخزن في العضلات والكبد. كي تخلاص، السباح يثقل ويبطا ← <b>لازم يعوضها بعد الحصة</b>.', 'Le « carburant » de la vitesse et des séries dures, stocké dans les muscles et le foie. Quand il manque, le nageur ralentit ← <b>à recharger après la séance</b>.'));
    h += row('#F2C94C', A('الدهون (Lipides)', 'Lipides'), pc && pc.f, A('تخدم أكثر في السباحة الخفيفة والطويلة (Z1–Z2). الجسم عندو منها بزاف ← ما يلزمش يعوضها بعد الحصة.', 'Utilisés surtout à faible intensité (Z1–Z2). Le corps en a beaucoup en réserve ← pas besoin de les compenser.'));
    h += row('#9B7BD4', A('البروتين (Protéines)', 'Protéines'), pc && pc.p, A('ماشي للطاقة: يحتاجو باش <b>يصلّح ويبني العضلات</b> بعد التدريب.', 'Pas pour l’énergie : sert à <b>réparer et construire</b> le muscle après l’effort.'));
    h += '<div class="info" style="margin-top:10px">' + (m.hard ? A('💡 <b>الخلاصة:</b> حصة ' + (m.min > 60 ? 'طويلة' : 'قوية') + (m.hiPct ? ' (' + m.hiPct + '% في Z4–Z5)' : '') + ' ← لازم <b>يعوض السكريات</b> و<b>ياكل بروتين</b> في الساعة لي تجي.', '💡 <b>Bilan :</b> séance ' + (m.min > 60 ? 'longue' : 'intense') + (m.hiPct ? ' (' + m.hiPct + ' % en Z4–Z5)' : '') + ' ← <b>recharger en glucides</b> et <b>apporter des protéines</b> dans l’heure.') :
      m.easy ? A('💡 <b>الخلاصة:</b> حصة خفيفة ← ماء وماكلة عادية يكفيو، ما يحتاجش قصّة زايدة.', '💡 <b>Bilan :</b> séance légère ← eau et repas normal suffisent.') :
      A('💡 <b>الخلاصة:</b> حصة متوسطة ← قصّة خفيفة بعد الحصة ووجبة عادية.', '💡 <b>Bilan :</b> séance modérée ← petite collation puis repas normal.')) + '</div></div>';
  } else h += '<div class="info" style="margin-bottom:10px">' + A('💡 ما كاينش حصة تدريب اليوم ولا البارح ← ماكلة عادية متوازنة، والتركيز على النوم.', '💡 Pas de séance hier ni aujourd’hui ← alimentation équilibrée normale, priorité au sommeil.') + '</div>';

  // ── برنامج الاسترجاع (جدول زمني)
  var need = rep.need, bed = hhmm(6.5 - need - 0.25), hard = m && m.hard, easy = !m || m.easy;
  var T5 = [
    ['💧', A('في الحصة', 'Pendant'), A('قرعة ماء، يشرب شوية كل 15–20 دقيقة', 'Gourde d’eau, quelques gorgées toutes les 15–20 min'), '#E6F1FB', '#0C447C'],
    ['🥛', A('0–30 د بعد', '0–30 min après'), easy ? A('ماء برك، ولا فاكهة إذا جاع', 'De l’eau ; un fruit s’il a faim') : A('<b>لبن ولا حليب</b> + <b>تمر</b> ولا بنانة ولا خبزة صغيرة', '<b>Lben ou lait</b> + <b>dattes</b>, banane ou petit pain'), '#FAEEDA', '#633806'],
    ['🍽', A('1–2 سا بعد', '1–2 h après'), A('وجبة: <b>كسكسي، عجائن ولا أرز</b> + <b>دجاج، حوت، بيض ولا عدس</b> + خضرة' + (hard ? ' (صحن السكريات يكون أكبر شوية اليوم)' : ''), 'Repas : <b>couscous, pâtes ou riz</b> + <b>poulet, poisson, œufs ou lentilles</b> + légumes' + (hard ? ' (portion de féculents un peu plus grande)' : '')), '#E1F5EE', '#085041'],
    ['🌙', A('قبل الرقاد', 'Avant de dormir'), A('ياوورت ولا حليب، ويرقد قبل <b class="num">' + bed + '</b> بلا شاشة', 'Yaourt ou lait ; au lit avant <b class="num">' + bed + '</b>, sans écran'), '#EEEDFE', '#3C3489'],
    ['🍳', A('غدوة الصباح', 'Demain matin'), A('فطور كامل: خبز + بيض ولا جبن + فاكهة + حليب', 'Petit-déjeuner complet : pain + œuf ou fromage + fruit + lait'), '#FBEAF0', '#72243E']
  ];
  h += '<div class="rp-c" style="margin-bottom:10px"><div class="l">🍽 ' + A('برنامج الاسترجاع', 'Plan de récupération') + '</div>' + T5.map(function (x) {
    return '<div style="display:flex;gap:10px;align-items:center;margin-top:8px"><div style="background:' + x[3] + ';color:' + x[4] + ';border-radius:12px;min-width:104px;padding:7px 8px;text-align:center;font-weight:700;font-size:13px">' + x[0] + ' ' + x[1] + '</div><div class="small" style="font-size:14px">' + x[2] + '</div></div>';
  }).join('') + '</div>';
  if (rep.lvl === 'yellow' || rep.lvl === 'red') h += '<div class="note" style="margin-bottom:10px">' + A('<b>اليوم الحالة ' + (rep.lvl === 'red' ? '🔴' : '🟡') + ':</b> 3 وجبات + 2 قصّات بلا ما ينقص حتى وحدة · ما يعوضش بالحلويات والمشروبات الغازية · <b>مشروبات الطاقة (Energy drinks) ممنوعة</b> في هذا العمر · النوم هو أول وسيلة استرجاع (' + need + ' سوايع على الأقل).',
    '<b>Statut ' + (rep.lvl === 'red' ? '🔴' : '🟡') + ' :</b> 3 repas + 2 collations, aucun sauté · pas de sucreries ni sodas pour « compenser » · <b>boissons énergisantes interdites</b> à cet âge · le sommeil reste la 1re récupération (au moins ' + need + ' h).') + '</div>';
  h += '<div class="small muted" style="margin-bottom:12px">ℹ️ ' + A('هاذي نصائح عامة للرياضيين الصغار. لبرنامج غذائي خاص بيه (الكميات، الوزن، الحساسية) استشير طبيب ولا أخصائي تغذية رياضية.', 'Conseils généraux pour jeunes sportifs. Pour un plan personnalisé (quantités, poids, allergies), consulter un médecin ou un diététicien du sport.') + '</div>';
  return h;
}

/* ---------- ⌚ Polar مباشر في الاختبارات ---------- */
function polarSrc(kind, b) {
  b.innerHTML = '<div class="kbox" style="margin-bottom:12px"><div class="small muted">' + A('حصص Verity Sense لي طالعين في Polar Flow (آخر 30 يوم، من بعد الربط). اختار الحصة تاع الاختبار:', 'Séances Verity Sense dans Polar Flow (30 derniers jours, après connexion). Choisissez celle du test :') + '</div>' +
    '<div id="pl-list" class="small" style="margin:8px 0">⏳ …</div><div id="csv-info" class="small"></div>' +
    (kind === 'step' ? '<div class="fr" id="off-row" style="display:none"><div class="f"><label>' + T('offset') + '</label><input id="offs" class="num mono" placeholder="mm:ss"></div><div class="f" style="align-self:end"><button type="button" class="btn pri" id="applyc">' + T('apply') + '</button></div></div>' : '') +
    '<div class="chart" id="csv-ch-w" style="display:none;height:220px"><canvas id="csv-ch"></canvas></div></div>';
  var date = (document.querySelector('#tf [name="date"]') || {}).value || TMP.t.date || today();
  API.call('polarExList', { sid: TMP.s.id }).then(function (r) {
    var el = $('#pl-list'); if (!el) return;
    if (!r.ok) { el.innerHTML = '⚠️ ' + (r.err === 'polarNotLinked' ? A('السباح هذا ما راهوش مربوط مع Polar (🌙 الاسترجاع ← ربط Polar).', 'Nageur non connecté à Polar.') : esc(r.err)); return; }
    if (!r.list.length) { el.innerHTML = A('ما كاين حتى حصة. زامن الـ Verity Sense مع تطبيق Polar Flow وعاود.', 'Aucune séance. Synchronisez la Verity Sense avec Polar Flow.'); return; }
    var same = r.list.filter(function (x) { return x.date === date; }), lst = same.length ? same.concat(r.list.filter(function (x) { return x.date !== date; }).slice(0, 8)) : r.list.slice(0, 12);
    el.innerHTML = lst.map(function (x) { return '<button type="button" class="btn sm' + (x.date === date ? ' pri' : '') + '" data-pex="' + esc(x.id) + '" style="margin:3px">⌚ ' + fmtDate(x.date) + ' ' + esc(x.start) + ' · ' + x.min + ' min · ♥ ' + (x.hrAvg || '—') + '/' + (x.hrMax || '—') + '</button>'; }).join('');
    $$('[data-pex]').forEach(function (bt) {
      bt.onclick = function () {
        $('#csv-info').textContent = '⏳ ' + A('نجيب النبض من Polar…', 'Récupération de la FC…');
        API.call('polarExHr', { sid: TMP.s.id, id: bt.dataset.pex }).then(function (h) {
          if (!h.ok) { $('#csv-info').textContent = '⚠️ ' + (h.err === 'polarNoHr' ? A('الحصة هذي ما فيهاش نبض.', 'Pas de FC dans cette séance.') : h.err); return; }
          TMP.samples = unpack(h.hr); if (!TMP.samples.length) { $('#csv-info').textContent = T('csvErr'); return; }
          if (kind === 'step' && $('#offs')) $('#offs').value = '';
          csvReady(kind, true);
        }).catch(function () { $('#csv-info').textContent = T('neterr'); });
      };
    });
  }).catch(function () { var el = $('#pl-list'); if (el) el.textContent = T('neterr'); });
}

/* ---------- 🔗 Polar (ربط مباشر) ---------- */
var PL = { ar: { t: 'Polar Flow', link: '🔗 ربط Polar', sync: '🔄 جيب دوك', unlink: 'إلغاء الربط', on: '✅ مربوط', off: 'مازال ما تربطش', last: 'آخر جلب', none: 'ما تجلب والو', wait: 'نجيب من Polar…', got: 'تحدّثو الأيام', noCfg: 'لازم تحط POLAR_CLIENT_ID و POLAR_CLIENT_SECRET في Apps Script', back: 'كي يكمّل الربط في الصفحة لي تحلّت، ارجع هنا واضغط «جيب دوك»', auth: 'الربط مع Polar ما بقاش صالح: عاود «ربط Polar»', auto: 'يتجاب وحدو كل يوم 9:00 و13:00', unconf: 'نلغيو الربط مع Polar ؟' },
           fr: { t: 'Polar Flow', link: '🔗 Connecter Polar', sync: '🔄 Synchroniser', unlink: 'Déconnecter', on: '✅ Connecté', off: 'Non connecté', last: 'Dernière synchro', none: 'jamais', wait: 'Synchronisation Polar…', got: 'jours mis à jour', noCfg: 'Ajoutez POLAR_CLIENT_ID et POLAR_CLIENT_SECRET dans Apps Script', back: 'Une fois la connexion terminée dans l’onglet ouvert, revenez et cliquez « Synchroniser »', auth: 'Connexion Polar expirée : reconnectez', auto: 'Synchro automatique chaque jour à 9:00 et 13:00', unconf: 'Déconnecter Polar ?' } };
function PT(k) { return (PL[LANG === 'fr' ? 'fr' : 'ar'])[k]; }
function polarBind(s) {
  var box = $('#polar-bar'); if (!box || API.url() === 'demo') return;
  API.call('polarStatus').then(function (r) {
    if (!r || !r.ok) return;
    var L = (r.linked || {})[s.id];
    if (!L && !isAdmin()) return;
    var when = L && L.last ? new Date(L.last).toLocaleString(LANG === 'fr' ? 'fr-FR' : 'ar-DZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : PT('none');
    box.innerHTML = '<div class="card" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px"><div class="ic">⌚</div><div class="sp"><b>' + PT('t') + ' · ' + (L ? PT('on') : PT('off')) + '</b>' +
      '<div class="small muted">' + (L ? PT('last') + ' : <span class="num">' + esc(when) + '</span> · ' + PT('auto') : (r.cfg ? '' : PT('noCfg'))) + '</div></div>' +
      (L ? '<button class="btn pri sm" id="pl-sync">' + PT('sync') + '</button>' : '') +
      (isAdmin() && r.cfg ? '<button class="btn sm" id="pl-link">' + PT('link') + '</button>' : '') +
      (isAdmin() && L ? '<button class="btn sm dan" id="pl-un">' + PT('unlink') + '</button>' : '') + '</div>';
    var b;
    if ((b = $('#pl-sync'))) b.onclick = function () {
      b.disabled = true; toast(PT('wait'));
      API.call('polarSync', { sid: s.id }).then(function (x) {
        if (!x.ok) { b.disabled = false; return toast(x.err === 'polarAuth' ? PT('auth') : (x.err || 'Polar ✗')); }
        toast('✅ ' + x.days + ' ' + PT('got')); load().then(render);
      }).catch(function () { b.disabled = false; toast(T('neterr')); });
    };
    if ((b = $('#pl-link'))) b.onclick = function () {
      var win = window.open('about:blank', '_blank');
      API.call('polarLink', { sid: s.id }).then(function (x) {
        if (!x.ok) { if (win) win.close(); return toast(x.err === 'polarNoCfg' ? PT('noCfg') : x.err); }
        if (win) win.location.href = x.url; else location.href = x.url;
        toast(PT('back'));
      }).catch(function () { if (win) win.close(); toast(T('neterr')); });
    };
    if ((b = $('#pl-un'))) b.onclick = function () { if (!confirm(PT('unconf'))) return; API.call('polarUnlink', { sid: s.id }).then(function () { polarBind(s); }); };
  }).catch(function () {});
}

/* ---------- récupération ---------- */
function readyCard(r, s) {
  if (!r) return '<div class="card"><h3>' + T('readyT') + '</h3><p class="muted">' + T('noDays') + '</p></div>';
  var em = { green: '🟢', yellow: '🟡', red: '🔴' }[r.level];
  return '<div class="ready ' + r.level + '" style="margin-bottom:14px"><span class="big">' + em + '</span><div class="sp"><b style="font-size:18px">' + T(r.level) + '</b>' +
    (r.flags.length ? '<div class="small">' + r.flags.map(function (f) { return T('f_' + f); }).join(' · ') + '</div>' : '') +
    (r.baseN < 7 ? '<div class="small">' + T('needDays') + '</div>' : '') + '</div></div>';
}
function recoveryHtml(s) {
  var days = daysOf(s.id), last = days[days.length - 1], r = last ? C.readiness(days, last.date, ageOf(s, last.date)) : null, ac = C.acwr(days, today());
  var h = '<div class="row" style="margin-bottom:12px"><h2 class="sp" style="margin:0">' + T('readyT') + (last ? ' <span class="small muted">' + fmtDate(last.date) + '</span>' : '') + '</h2><button class="btn pri" data-new="day">＋ ' + T('addDay') + '</button></div>';
  h += '<div id="polar-bar"></div><div id="day-report" style="margin-bottom:14px"></div>';
h += readyCard(r, s);
  h += '<div class="grid g4" style="margin-bottom:14px">';
  if (last) {
    h += '<div class="card">' + kpi(T('hrvN'), n0(C.num(last.hrv)), 'ms') + (r && r.hrvBase ? '<div class="small muted">' + T('base28') + ' : <span class="num">' + n0(r.hrvBase) + '</span></div>' : '') + '</div>';
    h += '<div class="card">' + kpi(T('rhrN'), n0(C.num(last.rhr)), 'bpm') + (r && r.rhrBase ? '<div class="small muted">' + T('base28') + ' : <span class="num">' + n1(r.rhrBase) + '</span></div>' : '') + '</div>';
    h += '<div class="card">' + kpi(T('sleepH'), n1(C.num(last.sleepH)), 'h') + '<div class="small muted">' + T('sleepScore') + ' : <span class="num">' + n0(C.num(last.sleepScore)) + '</span></div></div>';
  }
  var pcl = last ? lastWith(days, last.date, 'cls') || lastWith(days, last.date, 'clr') : null, pcat = clCat(pcl);
  if (pcat) h += '<div class="card">' + kpi(A('حالة الحمل (Polar)', 'Statut de charge (Polar)'), CLC[pcat].ic, '') + '<span class="chip ' + CLC[pcat].c + '">' + Tv(CLC[pcat].t) + '</span>' + (C.num(pcl.clr) != null ? '<div class="small muted">' + A('النسبة', 'Ratio') + ' : <span class="num">' + R(C.num(pcl.clr), 2) + '</span> · Strain <span class="num">' + n1(C.num(pcl.str)) + '</span> / Tol. <span class="num">' + n1(C.num(pcl.tol)) + '</span></div>' : '') + '</div>';
  else h += '<div class="card">' + kpi(T('acwr'), ac && !ac.short ? R(ac.ratio, 2) : '—', '') + (ac && ac.short ? '<div class="small muted">' + T('acwrNeed') + '</div>' : '') + (ac && !ac.short ? '<span class="chip ' + ({ low: 'warn', ok: 'ok', warn: 'warn', risk: 'bad' })[ac.zone] + '">' + T('acw_' + ac.zone) + '</span><div class="small muted">' + T('load') + ' (7) : <span class="num">' + Math.round(ac.acute) + '</span> · (28/4) : <span class="num">' + Math.round(ac.chronic) + '</span></div>' : '') + '</div>';
  h += '</div><div class="grid g2"><div class="card"><h3>HRV · ' + T('rhrN') + '</h3><div class="chart"><canvas id="ch-hrv"></canvas></div></div><div class="card"><h3>' + T('sleepH') + ' · ' + T('load') + '</h3><div class="chart"><canvas id="ch-sleep"></canvas></div></div></div>';
  h += '<div class="card"><h3>' + T('lastDays') + '</h3>';
  if (!days.length) h += '<p class="muted">' + T('noDays') + '</p>';
  else h += '<div class="tbl-wrap"><table><tr><th>' + T('date') + '</th><th></th><th>HRV</th><th>' + T('hr') + '</th><th>' + T('sleepH') + '</th><th>Score</th><th>' + T('load') + '</th></tr>' + days.slice(-21).reverse().map(function (d) {
    var rr = C.readiness(days, d.date, ageOf(s, d.date));
    return '<tr data-tid="' + d.id + '" style="cursor:pointer"><td class="num">' + fmtDate(d.date) + '</td><td><span class="dot ' + (rr ? rr.level : 'none') + '"></span></td><td class="num">' + n0(C.num(d.hrv)) + '</td><td class="num">' + n0(C.num(d.rhr)) + '</td><td class="num">' + n1(C.num(d.sleepH)) + '</td><td class="num">' + n0(C.num(d.sleepScore)) + '</td><td class="num">' + (d.cl != null && d.cl !== '' ? n0(C.num(d.cl)) : d.load != null ? Math.round(d.load) : '—') + (d.ex && d.ex.length ? ' ⌚' : '') + '</td></tr>';
  }).join('') + '</table></div>';
  return h + '</div>' + guideHtml('day');
}
function drawRecovery(s) {
  var days = daysOf(s.id).slice(-42); if (!days.length) return;
  var lab = days.map(function (d) { return fmtDate(d.date).slice(0, 5); });
  var o = chartBase(); o.spanGaps = true; o.scales = { y: { title: { display: true, text: 'HRV ms' } }, y2: { position: 'right', grid: { display: false }, title: { display: true, text: 'bpm' } } };
  var base = days.map(function (d) { var r = C.readiness(daysOf(s.id), d.date); return r && r.hrvBase ? R(r.hrvBase, 0) : null; });
  mk('ch-hrv', { type: 'line', data: { labels: lab, datasets: [{ label: 'HRV', data: days.map(function (d) { return C.num(d.hrv); }), borderColor: CH.blue, backgroundColor: CH.blue, borderWidth: 2.5 }, { label: T('base28'), data: base, borderColor: CH.grey, borderDash: [5, 4], pointRadius: 0 }, { label: T('rhrN'), data: days.map(function (d) { return C.num(d.rhr); }), borderColor: CH.red, backgroundColor: CH.red, yAxisID: 'y2' }] }, options: o });
  var o2 = chartBase(); o2.scales = { y: { title: { display: true, text: 'h' }, min: 0 }, y2: { position: 'right', grid: { display: false }, title: { display: true, text: T('load') } } };
  mk('ch-sleep', { type: 'bar', data: { labels: lab, datasets: [{ type: 'bar', label: T('sleepH'), data: days.map(function (d) { return C.num(d.sleepH); }), backgroundColor: 'rgba(91,155,255,.45)' }, { type: 'line', label: days.some(function (d) { return C.num(d.cl) != null; }) ? 'Cardio load (Polar)' : T('load'), data: days.map(function (d) { var c = C.num(d.cl); return days.some(function (x) { return C.num(x.cl) != null; }) ? c : d.load; }), borderColor: CH.gold, backgroundColor: CH.gold, yAxisID: 'y2', spanGaps: true }] }, options: o2 });
}

/* ---------- temps de compétition ---------- */
var EVL = { FR: ['حرة', 'NL'], BK: ['ظهر', 'Dos'], BR: ['صدر', 'Brasse'], FL: ['فراشة', 'Pap.'], IM: ['متنوع', '4N'] };
function evName(e) { var m = e.match(/^(\d+)(\w+)$/); return m ? m[1] + ' ' + Tv(EVL[m[2]]) : e; }
function timesOf(id) { return DB.tests.filter(function (t) { return t.swimmerId === id && t.type === 'time'; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; }); }
function timesHtml(s) {
  var all = timesOf(s.id), best = {};
  all.forEach(function (t) { var d = t.data || {}, k = d.event + '|' + (d.course || 'SCM'), sec = C.parseTime(d.time); if (!sec) return; if (!best[k] || sec < best[k].sec) best[k] = { sec: sec, t: t, ev: d.event, course: d.course || 'SCM' }; });
  var rows = Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) { return C.EVENTS.indexOf(a.ev) - C.EVENTS.indexOf(b.ev) || (a.course < b.course ? 1 : -1); });
  var h = '<div class="row" style="margin-bottom:12px"><h2 class="sp" style="margin:0">' + T('best') + '</h2><button class="btn pri" data-new="time">＋ ' + T('addTime') + '</button></div><div class="card">';
  if (!rows.length) h += '<p class="muted">' + T('noTimes') + '</p>';
  else h += '<div class="tbl-wrap"><table><tr><th>' + T('event') + '</th><th>' + T('course') + '</th><th>' + T('best') + '</th><th>' + T('points') + '</th><th>' + T('date') + '</th></tr>' + rows.map(function (b) {
    var pts = C.waPoints(b.ev, b.sec, s.sex, b.course);
    return '<tr data-tid="' + b.t.id + '" style="cursor:pointer"><td><b>' + evName(b.ev) + '</b></td><td>' + (b.course === 'LCM' ? '50 m' : '25 m') + '</td><td class="num" style="font-weight:700">' + F(b.sec, 2) + '</td><td class="num">' + (pts != null ? pts : '—') + '</td><td class="num small">' + fmtDate(b.t.date) + '</td></tr>';
  }).join('') + '</table></div>';
  h += '</div><div class="card tlist"><h3>' + T('allTimes') + '</h3>' + (all.length ? all.map(function (t) { var d = t.data || {}; return '<div class="it" data-tid="' + t.id + '" style="cursor:pointer"><span class="ic">🏅</span><div class="sp"><b>' + evName(d.event) + '</b> <span class="small muted">' + (d.course === 'LCM' ? '50 m' : '25 m') + (d.meet ? ' · ' + esc(d.meet) : '') + '</span><div class="small muted">' + fmtDate(t.date) + '</div></div><div class="num" style="font-size:18px;font-weight:700">' + esc(d.time) + '</div></div>'; }).join('') : '<p class="muted">' + T('noTimes') + '</p>') + '</div>';
  return h;
}

function summaryHtml(P) {
  var h = '', f = P.final;
  // héros VO2max
  h += '<div class="card hero"><div class="row" style="gap:18px">' + gauge(f ? f.vo2 : null, 170, f ? f.ci95 : null, true) + '<div class="kpi sp"><div class="l">' + T('estFinal') + ' · VO2max</div><div class="v num">' + (f ? R(f.vo2, 1) : '—') + ' <small style="color:rgba(255,255,255,.8)">' + T('unit') + '</small></div></div>';
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
  // morphologie & maturité
  var M = P.mat;
  h += '<div class="card"><h3>📏 ' + T('body') + '</h3>';
  if (M || P.bmi || P.ape) {
    h += '<div class="grid g4">' + '<div class="kbox">' + kpi(T('bmi'), P.bmi ? R(P.bmi, 1) : '—', 'kg/m²') + '</div>' + '<div class="kbox">' + kpi(T('ape'), P.ape ? R(P.ape, 3) : '—', P.ape ? '(' + (P.ape >= 1.04 ? '++' : P.ape >= 1.0 ? '+' : '−') + ')' : '') + '</div>';
    if (M) h += '<div class="kbox">' + kpi(T('mo'), (M.mo > 0 ? '+' : '') + R(M.mo, 1), T('yrs')) + '<span class="chip">' + T(C.maturityStage(M.mo)) + '</span></div><div class="kbox">' + kpi(T('aphv'), R(M.aphv, 1), T('yrs') + ' ± ' + M.see) + '</div>';
    h += '</div>' + (M ? '<p class="small muted" style="margin:10px 0 0">' + T('matNote') + '</p>' : '<p class="small muted">' + T('matNeed') + '</p>');
  } else h += '<p class="small muted">' + T('matNeed') + '</p>';
  h += '</div>';
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


/* ---------- jauge VO2max ---------- */
function gauge(v, size, ci, onDark) {
  var fg = onDark ? '#fff' : '#0d2a6b', fg2 = onDark ? '#d4e3ff' : '#5c6f93';
  size = size || 180; var lo = 25, hi = 75, r = size * 0.4, cx = size / 2, cy = size / 2, a0 = 135, sweep = 270;
  function pt(val) { var f = Math.max(0, Math.min(1, (val - lo) / (hi - lo))), a = (a0 + sweep * f) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function arc(v1, v2) { var p1 = pt(v1), p2 = pt(v2), large = ((Math.min(v2, hi) - Math.max(v1, lo)) / (hi - lo)) * sweep > 180 ? 1 : 0; return 'M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); }
  var id = 'g' + Math.random().toString(36).slice(2, 7), sw = size * 0.075;
  var h = '<svg class="gauge" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><defs><linearGradient id="' + id + '" x1="0" x2="1"><stop offset="0" stop-color="#2fd4f0"/><stop offset=".6" stop-color="#5b9bff"/><stop offset="1" stop-color="#f6c453"/></linearGradient></defs>' +
    '<path class="trk" d="' + arc(lo, hi) + '" fill="none" stroke-width="' + sw + '" stroke-linecap="round"/>';
  if (ci) h += '<path d="' + arc(Math.max(lo, ci[0]), Math.min(hi, ci[1])) + '" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="' + (sw * 1.9) + '" stroke-linecap="round"/>';
  if (v != null) { var p = pt(v); h += '<path d="' + arc(lo, Math.max(lo + 0.01, Math.min(hi, v))) + '" fill="none" stroke="url(#' + id + ')" stroke-width="' + sw + '" stroke-linecap="round" style="filter:drop-shadow(0 0 6px rgba(91,155,255,.7))"/><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (sw * 0.75) + '" fill="' + (onDark ? '#fff' : '#1d6bff') + '" stroke="#fff" stroke-width="2"/>'; }
  h += '<text x="' + cx + '" y="' + (cy + size * 0.06) + '" text-anchor="middle" fill="' + fg + '" font-family="Rubik" font-weight="700" font-size="' + (size * 0.24) + '">' + (v != null ? R(v, 1) : '—') + '</text>' +
    '<text x="' + cx + '" y="' + (cy + size * 0.2) + '" text-anchor="middle" fill="' + fg2 + '" font-family="PT Bold Heading, Lalezar, Tahoma" font-weight="700" font-size="' + Math.max(9, size * 0.075) + '">VO2max</text></svg>';
  return h;
}
/* ---------- graphiques ---------- */
var CH = { blue: '#5b9bff', red: '#ff6b6b', gold: '#f6c453', green: '#2bd18f', grey: '#7183a6' };
function chartBase() {
  Chart.defaults.font.family = '"Rubik","PT Bold Heading","Lalezar",sans-serif'; Chart.defaults.font.size = 12; Chart.defaults.color = '#8ea3c9';
  if (Chart.defaults.borderColor !== undefined) Chart.defaults.borderColor = 'rgba(148,178,255,.12)';
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
  var cols = ['#2a3a5e', '#34548f', '#3f6fc0', '#4f8bf0', '#6fb0ff', '#2fd4f0'], k = 0, ds = [];
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
  var backTab = t.type === 'day' ? 'recovery' : t.type === 'time' ? 'times' : 'tests';
  var h = '<button class="btn sm" id="bk">← ' + esc(s.name) + '</button><h1>' + ICON[t.type] + ' ' + T('T_' + t.type) + '</h1>' + (t.type !== 'time' && t.type !== 'day' ? guideHtml(t.type) : '') + '<div id="rdw"></div><form id="tf" autocomplete="off">' +
    '<div class="card"><div class="fr"><div class="f"><label>' + T('date') + '</label><input type="date" name="date" value="' + esc(t.date) + '"></div>' +
    (t.type !== 'leger' && t.type !== 'rest' && t.type !== 'day' && t.type !== 'time' ? '<div class="f"><label>' + T('pool') + '</label><select name="pool"><option value="25">25 m</option><option value="50"' + (t.data.pool == 50 ? ' selected' : '') + '>50 m</option></select></div>' : '') + '</div></div>';
  h += '<div id="form-body"></div>';
  h += '<div class="card"><div class="f"><label>' + T('notes') + '</label><textarea name="notes" rows="2">' + esc(t.notes) + '</textarea></div><div id="res"></div>' +
    '<div class="row"><button class="btn pri big" id="save">' + T('save') + '</button>' + (S.tid ? '<span class="sp"></span><button type="button" class="btn dan" id="dl">' + T('del') + '</button>' : '') + '</div></div></form>';
  app.innerHTML = h;
  $('#bk').onclick = function () { route('swimmer', { tab: backTab }); };
  if (S.tid) $('#dl').onclick = function () { if (confirm(T('confirmDel'))) { mutate('delTest', { id: t.id }); toast(T('deleted')); route('swimmer', { tab: backTab }); } };
  ({ step: fStep, '400': f400, css: fCss, leger: fLeger, rest: fRest, day: fDay, time: fTime })[t.type]($('#form-body'));
  var rdw = function () { var r = t.type !== 'day' && t.type !== 'time' ? readyOf(s, val('date') || today()) : null; $('#rdw').innerHTML = r && r.level === 'red' ? '<div class="alert" style="margin-bottom:14px">🔴 ' + T('redTest') + '</div>' : ''; };
  $('#tf [name=date]').addEventListener('change', rdw); rdw();
  $('#tf').addEventListener('input', liveResults);
  liveResults();
  $('#tf').onsubmit = function (e) {
    e.preventDefault();
    var rec = TMP.t; rec.date = e.target.date.value || today(); rec.notes = e.target.notes.value; rec.data = collect();
    if (TMP.samples && TMP.samples.length) rec.data.samples = pack(TMP.samples);
    mutate('saveTest', { rec: rec }); toast(T('saved')); route('swimmer', { tab: backTab === 'tests' ? 'sum' : backTab });
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
function fieldsHtml(list) { return '<div class="fr">' + list.map(function (f) { return '<div class="f"><label>' + f[1] + (f[4] ? '<span class="hint">' + T(f[4]) + '</span>' : '') + '</label><input name="' + f[0] + '" class="num mono" inputmode="' + (f[2] || 'decimal') + '" placeholder="' + (f[3] || '') + '" value="' + esc((TMP.t.data || {})[f[0]]) + '"></div>'; }).join('') + '</div>'; }

function collect() {
  var t = TMP.t, d = { pool: val('pool') };
  if (t.type === 'step') {
    d.protocol = val('protocol'); var P = C.PROTOCOLS[d.protocol];
    d.reps = []; for (var i = 0; i < P.reps; i++) d.reps.push({ time: val('t' + i), hr: val('h' + i), lac: val('l' + i), rpe: val('r' + i) });
    d.hrmax = val('hrmax'); d.hr60 = val('hr60'); d.peak = val('peak'); d.hrSrc = TMP.src || t.data.hrSrc || 'manual'; d.offset = val('offset');
  } else if (t.type === '400') { ['dist', 'time', 'hrEnd', 'hr60', 'sr'].forEach(function (k) { d[k] = val(k); }); d.hrSrc = TMP.src || t.data.hrSrc; }
  else if (t.type === 'css') { ['d1', 't1', 'd2', 't2', 'hr1', 'hr2'].forEach(function (k) { d[k] = val(k); }); }
  else if (t.type === 'leger') { ['stage', 'shuttle', 'hrmax', 'hr60'].forEach(function (k) { d[k] = val(k); }); d.lastDone = ''; }
  else if (t.type === 'day') { d = Object.assign({}, t.data || {}, d); ['sleepH', 'sleepScore', 'recharge', 'hrv', 'rhr', 'br', 'ans', 'min', 'rpe', 'polar'].forEach(function (k) { d[k] = val(k); }); }
  else if (t.type === 'time') { ['event', 'course', 'time', 'meet'].forEach(function (k) { d[k] = val(k); }); }
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
  if (t.type === 'day') {
    var days = daysOf(TMP.s.id).filter(function (x) { return x.id !== t.id; }), dt = val('date') || today();
    days.push({ date: dt, hrv: d.hrv, rhr: d.rhr, sleepH: d.sleepH, sleepScore: d.sleepScore, recharge: d.recharge, load: C.num(d.min) && C.num(d.rpe) != null ? C.num(d.min) * C.num(d.rpe) : null });
    var rr = C.readiness(days, dt, ageOf(TMP.s, dt)); h = readyCard(rr, TMP.s) + (C.num(d.min) && C.num(d.rpe) != null ? '<div class="kbox">' + kpi(T('load') + ' (sRPE)', Math.round(C.num(d.min) * C.num(d.rpe)), 'UA') + '</div>' : '');
  }
  if (t.type === 'time') { var sec = C.parseTime(d.time), pts = sec ? C.waPoints(d.event, sec, TMP.s.sex, d.course) : null; if (sec) h = '<div class="grid g3">' + kpi(T('time'), F(sec, 2), '') + kpi(T('points'), pts != null ? pts : '—', '') + kpi(T('pace'), F(sec * 100 / parseInt(d.event, 10), 1), '') + '</div>'; }
  var el = $('#res'); if (el) el.innerHTML = h ? '<h3>' + T('results') + '</h3>' + h + '<hr style="border:none;border-top:1px solid var(--line);margin:12px 0">' : '';
}

/* --- source FC (manuel / CSV / BT) --- */
function srcTabs(cur) { return '<div class="tabs">' + ['manual', 'csv', 'polar', 'bt'].map(function (k) { return '<button type="button" class="btn sm' + (cur === k ? ' on' : '') + '" data-src="' + k + '">' + (k === 'polar' ? '⌚ Polar' : T(k)) + '</button>'; }).join('') + '</div>'; }
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
    '<div class="f"><label>' + T('hr60') + '<span class="hint">' + T('hr60H') + '</span></label><input name="hr60" class="num mono" inputmode="numeric" value="' + esc(keep.hr60 != null ? keep.hr60 : d.hr60) + '"></div></div>' +
    '<label>' + T('hrSrc') + '</label>' + srcTabs(TMP.src) + '<div id="src-box"></div><p class="small muted">' + T('lacHint') + '</p>' +
    '<input type="hidden" name="peak" value="' + esc(keep.peak != null ? keep.peak : d.peak) + '"><input type="hidden" name="offset" value="' + esc(keep.offset != null ? keep.offset : d.offset) + '">' +
    '<div class="tbl-wrap"><table><tr><th>' + T('rep') + '</th><th>' + T('time') + '<small>' + T('repTimeH') + '</small></th><th>' + T('pace') + '</th><th>' + T('hr') + '<small>' + T('repHrH') + '</small></th><th>' + T('lac') + '<small>' + T('repLacH') + '</small></th><th>' + T('rpe') + '<small>' + T('rpeH') + '</small></th></tr>';
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
  if (TMP.src === 'polar') { polarSrc(kind, b); return; }
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
  b.innerHTML = '<div class="kbox" style="margin-bottom:12px"><div class="small muted">' + T('csvHelp') + '</div><input type="file" id="csvf" accept=".csv,text/csv" style="margin:8px 0">' +
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


/* --- récupération du jour --- */
function fDay(box) {
  var d = TMP.t.data;
  var rc = '<div class="f"><label>' + T('recharge') + '<span class="hint">' + T('rechargeHint') + '</span></label><select name="recharge"><option value="">—</option>' + [5, 4, 3, 2, 1].map(function (n) { return '<option value="' + n + '"' + (String(d.recharge) === String(n) ? ' selected' : '') + '>' + T('rc' + n) + '</option>'; }).join('') + '</select></div>';
  box.innerHTML = guideHtml('day') + '<div class="card"><h3>' + T('sleepSec') + '</h3><div class="fr">' + rc + '</div>' +
    fieldsHtml([['hrv', T('hrvN'), 'numeric', '', 'hrvHint'], ['rhr', T('rhrN'), 'numeric', '', 'rhrHint'], ['sleepH', T('sleepH'), 'decimal', '9.5', 'sleepHint'], ['sleepScore', T('sleepScore'), 'numeric', '', 'sleepScoreHint']]) +
    fieldsHtml([['br', T('br') + ' (' + T('optional') + ')', 'decimal'], ['ans', T('ans') + ' (' + T('optional') + ')', 'decimal']]) + '</div>' +
    '<div class="card"><h3>' + T('trainSec') + '</h3>' + fieldsHtml([['min', T('trainMin'), 'numeric', '75', 'trainHint'], ['rpe', T('sRpe'), 'numeric', '0–10', 'sRpeHint'], ['polar', T('polarLoad') + ' (' + T('optional') + ')', 'numeric']]) + '</div>';
}
/* --- temps de compétition --- */
function fTime(box) {
  var d = TMP.t.data;
  box.innerHTML = guideHtml('time') + '<div class="card"><div class="fr"><div class="f"><label>' + T('event') + '</label><select name="event">' + C.EVENTS.map(function (e) { return '<option value="' + e + '"' + ((d.event || '400FR') === e ? ' selected' : '') + '>' + evName(e) + '</option>'; }).join('') + '</select></div>' +
    '<div class="f"><label>' + T('course') + '</label><select name="course"><option value="SCM">25 m</option><option value="LCM"' + (d.course === 'LCM' ? ' selected' : '') + '>50 m</option></select></div></div>' +
    fieldsHtml([['time', T('time'), 'decimal', '5:15.32', 'timeHint']]) + '<div class="f"><label>' + T('meet') + '</label><input name="meet" value="' + esc(d.meet) + '"></div></div>';
  $$('#tf select').forEach(function (x) { x.addEventListener('change', liveResults); });
}
/* --- 400 m --- */
function f400(box) {
  TMP.src = TMP.src || TMP.t.data.hrSrc || 'manual';
  if (!TMP.t.data.dist) TMP.t.data.dist = 400;
  var keep = {}; $$('#form-body input').forEach(function (i) { keep[i.name] = i.value; }); Object.assign(TMP.t.data, keep);
  box.innerHTML = '<div class="card">' + fieldsHtml([['dist', T('dist') + ' (m)', 'numeric', '', 'distH'], ['time', T('time'), 'decimal', '5:15.0', 'repTimeH'], ['sr', T('sr'), 'decimal', '', 'srH']]) +
    '<label>' + T('hrSrc') + '</label>' + srcTabs(TMP.src) + '<div id="src-box"></div>' + fieldsHtml([['hrEnd', T('hrEnd'), 'numeric', '', 'hrEndH'], ['hr60', T('hr60'), 'numeric', '', 'hr60H']]) + '</div>';
  bindSrc(function () { f400(box); liveResults(); }); srcBox('400');
}
/* --- CSS --- */
function fCss(box) {
  var d = TMP.t.data; if (!d.d1) { d.d1 = 400; d.d2 = 200; }
  box.innerHTML = '<div class="card"><div class="info small" style="margin-bottom:10px">400 m + 200 m · 15–20 min</div>' +
    fieldsHtml([['d1', T('dist') + ' 1 (m)', 'numeric'], ['t1', T('time') + ' 1', 'decimal', '5:15.0', 't1H'], ['hr1', T('hr') + ' 1 (' + T('optional') + ')', 'numeric', '', 'repHrH']]) +
    fieldsHtml([['d2', T('dist') + ' 2 (m)', 'numeric'], ['t2', T('time') + ' 2', 'decimal', '2:30.0', 't2H'], ['hr2', T('hr') + ' 2 (' + T('optional') + ')', 'numeric', '', 'repHrH']]) + '</div>';
}
/* --- Léger --- */
function fLeger(box) {
  TMP.src = TMP.src || 'run';
  box.innerHTML = '<div class="card"><div class="info small">' + T('legerHelp') + '</div></div>' + btPanel() +
    '<div class="card runner" id="runner"><div class="small muted">' + T('stage') + '</div><div class="stage num" id="r-stage">1</div>' +
    '<div class="meta"><div><span class="small muted">' + T('shuttle') + '</span><b class="num" id="r-sh">0 / 7</b></div><div><span class="small muted">' + T('speed') + '</span><b class="num" id="r-sp">8.5</b></div><div><span class="small muted">' + T('elapsed') + '</span><b class="num" id="r-t">0:00</b></div><div><span class="small muted">FC</span><b class="num" id="r-hr" style="color:var(--bad)">--</b></div></div>' +
    '<div class="prog"><i id="r-pg" style="width:0"></i></div><div class="row" style="justify-content:center;margin-top:16px"><button type="button" class="btn pri big" id="r-go">▶ ' + T('run') + '</button></div></div>' +
    '<div class="card"><h3>' + T('manualRes') + '</h3>' + fieldsHtml([['stage', T('stage'), 'numeric', '', 'stageH'], ['shuttle', T('shuttle'), 'numeric', '', 'shuttleH'], ['hrmax', T('hrmax'), 'numeric', '', 'hrmaxLH'], ['hr60', T('hr60'), 'numeric', '', 'hr60H']]) +
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
    '<div class="card"><table id="rest-rows"><tr><th>' + T('morning') + '</th><th>' + T('date') + '</th><th>bpm<small>' + T('restBpmH') + '</small></th><th>RMSSD<small>' + T('optional') + '</small></th></tr></table><button type="button" class="btn sm" id="addr" style="margin-top:8px">' + T('addRow') + '</button>' +
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
  var h = '<button class="btn sm" id="bk">← ' + T('back') + '</button><h1>⚙ ' + T('settings') + '</h1>';
  if (isAdmin()) {
    h += '<div class="card"><div class="row" style="margin-bottom:8px"><h3 class="sp" style="margin:0">👥 ' + T('coaches') + '</h3><button class="btn pri sm" id="addc">＋ ' + T('addCoach') + '</button></div><div id="cform"></div>';
    var cs = DB.coaches || [];
    if (!cs.length) h += '<p class="muted">—</p>';
    else h += '<div class="tbl-wrap"><table><tr><th>' + T('name') + '</th><th>' + T('phone') + '</th><th>' + T('code') + '</th><th>' + T('swimmers') + '</th><th></th><th></th></tr>' + cs.map(function (c) {
      var n = DB.swimmers.filter(function (s) { return s.coachId === c.id; }).length;
      return '<tr><td style="text-align:start"><b>' + esc(c.name) + '</b>' + (c.head ? ' <span class="chip warn">' + T('headS') + '</span>' : '') + '</td><td class="num">' + esc(c.phone || '') + '</td><td><span class="chip mono">' + esc(c.code) + '</span></td><td class="num">' + n + '</td><td><span class="chip ' + (c.active === false ? 'bad' : 'ok') + '">' + T(c.active === false ? 'inactive' : 'active') + '</span></td>' +
        '<td style="white-space:nowrap"><button class="btn sm" data-view="' + c.id + '" title="' + T('viewAs') + '">👁</button> <button class="btn sm" data-ec="' + c.id + '">✎</button></td></tr>';
    }).join('') + '</table></div>';
    h += '</div><div class="card"><h3>🔐 ' + T('logT') + '</h3><div id="loglist" class="small muted">…</div></div><form class="card" id="pwf"><h3>🔑 ' + T('changePw') + '</h3><div class="fr"><div class="f"><label>' + T('oldPw') + '</label><input type="password" name="o"></div><div class="f"><label>' + T('newPw') + '</label><input type="password" name="n"></div></div><button class="btn pri">' + T('save') + '</button></form>';
  }
  if (window.BTV && window.BTV.settingsExtra && isAdmin()) h += window.BTV.settingsExtra();
  if (isAdmin()) h += '<div class="card"><h3>🔗 ' + T('apiUrl') + '</h3><p class="small ltr muted" style="word-break:break-all">' + esc(API.url()) + '</p><div class="row"><button class="btn" id="bkp">⬇ ' + T('backup') + '</button><button class="btn" id="chg">' + T('apiUrl') + ' ✎</button><span class="sp"></span><button class="btn dan" id="lo">🚪 ' + T('logout') + '</button></div></div>';
  else h += '<div class="card"><div class="row"><span class="sp muted">' + esc(DB.me ? DB.me.name : '') + '</span><button class="btn dan" id="lo">🚪 ' + T('logout') + '</button></div></div>';
  app.innerHTML = h;
  $('#bk').onclick = function () { route('home'); };
  if (window.BTV && window.BTV.settingsBind && isAdmin()) window.BTV.settingsBind();
  $('#lo').onclick = function () { $('#out-btn').click(); };
  if ($('#chg')) $('#chg').onclick = function () { if (confirm(T('apiUrl') + ' ?')) { ls('vo2_api', null); ls('vo2_tk', null); render(); } };
  if (!isAdmin()) return;
  $('#pwf').onsubmit = function (e) { e.preventDefault(); API.call('changePw', { old: e.target.o.value, nw: e.target.n.value }).then(function (r) { toast(r.ok ? T('saved') : T(r.err)); if (r.ok) e.target.reset(); }).catch(function () { toast(T('neterr')); }); };
  $('#bkp').onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(DB, null, 1)], { type: 'application/json' })); a.download = 'vo2max-wathba-' + today() + '.json'; a.click(); };
  $('#addc').onclick = function () { coachForm({}); };
  API.call('log').then(function (r) {
    var el = $('#loglist'); if (!el) return;
    if (!r.ok || !r.log || !r.log.length) { el.textContent = '—'; return; }
    el.innerHTML = '<div class="tbl-wrap" style="max-height:320px;overflow:auto"><table><tr><th>' + T('when') + '</th><th>' + T('who') + '</th><th></th></tr>' + r.log.map(function (x) {
      var d = new Date(x.t); return '<tr><td class="num">' + fmtDate(d.toISOString().slice(0, 10)) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + '</td><td>' + esc(x.who || '—') + '</td><td><span class="chip ' + (x.ok ? 'ok' : 'bad') + '">' + T(x.ok ? 'okLogin' : 'failLogin') + '</span></td></tr>';
    }).join('') + '</table></div>';
  }).catch(function () {});
  $$('[data-ec]').forEach(function (b) { b.onclick = function () { coachForm(DB.coaches.find(function (c) { return c.id === b.dataset.ec; })); }; });
  $$('[data-view]').forEach(function (b) { b.onclick = function () { VIEWAS = b.dataset.view; ls('vo2_viewas', VIEWAS); route('home'); }; });
}
function coachForm(c) {
  var box = $('#cform');
  box.innerHTML = '<form class="kbox" id="cf" style="margin-bottom:12px"><div class="fr"><div class="f"><label>' + T('name') + '</label><input name="name" required value="' + esc(c.name) + '"></div>' +
    '<div class="f"><label>' + T('phone') + '</label><input name="phone" inputmode="tel" class="ltr" value="' + esc(c.phone) + '"></div>' +
    '<div class="f"><label>' + T('code') + '<span class="hint">' + T('codeHint') + '</span></label><input name="code" required minlength="6" class="mono ltr" value="' + esc(c.code) + '"></div>' +
    '<div class="f"><label>' + T('active') + '</label><select name="active"><option value="1">' + T('active') + '</option><option value="0"' + (c.active === false ? ' selected' : '') + '>' + T('inactive') + '</option></select></div></div>' +
    '<label class="row" style="gap:8px;margin:0 0 10px"><input type="checkbox" name="head"' + (c.head ? ' checked' : '') + ' style="width:auto"> ' + T('headC') + '</label>' +
    '<div class="row"><button class="btn pri">' + T('save') + '</button><button type="button" class="btn" id="cc">' + T('cancel') + '</button><span class="sp"></span>' + (c.id ? '<button type="button" class="btn dan" id="cd">' + T('del') + '</button>' : '') + '</div></form>';
  $('#cf [name=name]').focus();
  $('#cc').onclick = function () { box.innerHTML = ''; };
  if (c.id) $('#cd').onclick = function () { if (confirm(T('confirmDel'))) { API.call('delCoach', { id: c.id }).then(function (r) { if (!r.ok) return toast(T(r.err) || r.err); toast(T('deleted')); load().then(render); }); } };
  $('#cf').onsubmit = function (e) {
    e.preventDefault(); var f = e.target, rec = Object.assign({}, c, { name: f.name.value.trim(), phone: f.phone.value.trim(), code: f.code.value.trim(), active: f.active.value === '1', head: f.head.checked });
    if (!/^(?=.*[0-9])(?=.*[A-Za-z]).{6,}$/.test(rec.code)) return toast(T('weakCode'));
    f.querySelector('.pri').disabled = true;
    API.call('saveCoach', { rec: rec }).then(function (r) { if (!r.ok) { f.querySelector('.pri').disabled = false; return toast(T(r.err) || r.err); } toast(T('saved')); load().then(render); }).catch(function () { f.querySelector('.pri').disabled = false; toast(T('neterr')); });
  };
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
window.VO2CORE = {
  $: $, $$: $$, esc: esc, ls: ls, today: today, uid: uid, T: T, Tv: Tv, D: D, C: C, R: R, F: F, API: API, S: S,
  db: function () { return DB; }, lang: function () { return LANG; }, viewAs: function () { return VIEWAS; },
  route: route, render: render, mutate: mutate, load: load, toast: toast, sw: sw, isAdmin: isAdmin, coachName: coachName,
  visibleSwimmers: visibleSwimmers, ageOf: ageOf, fmtDate: fmtDate, kpi: kpi, chartBase: chartBase, mk: mk, CH: CH,
  initials: initials, readyOf: readyOf, n0: n0, n1: n1, lab: lab
};
document.addEventListener('DOMContentLoaded', function () { render(); if (API.tk()) flush(); });
window.VO2APP = { load: load,  DB: function () { return DB; }, profile: profile, computeTest: computeTest, route: route, BT: BT };
})();
