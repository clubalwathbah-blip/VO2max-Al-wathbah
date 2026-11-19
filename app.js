/* VO2max Al-Wathba — application */
var APP_V = '5.6';
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
  sub: ['الأداء والاختبارات · BY OKBA', 'Performance et tests · BY OKBA'],
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
  sum: ['VO2max والمناطق', 'VO2max et zones'],
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
  authSub: ['الأداء والاختبارات · نادي الوثبة', 'Performance et tests · Club Al-Wathba'],
  failsAlert: ['محاولات دخول غالطة في آخر 24 ساعة. شوف سجل الدخول في الإعدادات.', 'tentatives de connexion échouées en 24 h. Voir le journal dans Paramètres.'],
  weakCode: ['الكود لازم 6 خانات على الأقل فيه أرقام وحروف', 'Code : 6 caractères min., lettres et chiffres'],
  logT: ['سجل الدخول', 'Journal des connexions'], okLogin: ['دخول', 'Connexion'], failLogin: ['غالط', 'Échec'], when: ['الوقت', 'Quand'], who: ['شكون', 'Qui'],
  acwrNeed: ['يتحسب بعد 3 أسابيع من إدخال الحصص', 'Calculé après 3 semaines de saisies'],
  rpt: ['التقرير', 'Rapport'], saveAll: ['حفظ الكل', 'Tout enregistrer'], nothing: ['ما كاين حتى نتيجة', 'Aucun résultat'], dayHrT: ['❤️ نبض النهار كامل (Loop)', '❤️ FC de la journée (Loop)'], hrTest: ['النبض أثناء الاختبار', 'FC pendant le test'], suitsFor: ['يصلح لـ', 'Adapté à'], delta: ['التطور', 'Évolution'], pickT: ['اختبار جديد', 'Nouveau test'],
  g_AER: ['🫁 هوائي', '🫁 Aérobie'], g_LAC: ['🔥 لاكتيكي', '🔥 Lactique'], g_ALA: ['⚡ ألاكتيكي (سرعة)', '⚡ Alactique (vitesse)'], g_END: ['🏋 تحمّل القوة', '🏋 Endurance de force'],
  g_MAX: ['💪 القوة القصوى', '💪 Force maximale'], g_POW: ['🚀 القدرة', '🚀 Puissance'], g_FLX: ['🤸 المرونة', '🤸 Souplesse'], g_HR: ['❤️ النبض والاسترجاع', '❤️ FC et récupération'], g_FOL: ['📅 المتابعة', '📅 Suivi'],
  notCat: ['ماشي لفئتو', 'hors catégorie'], lastOn: ['آخر مرة', 'Dernier'], pb: ['🏆 أحسن نتيجة', '🏆 Record perso'], prevR: ['قبل', 'avant'], nRes: ['نتيجة', 'résultat(s)'],
  vReal: ['تطور حقيقي', 'Changement réel'], vLikely: ['تطور محتمل', 'Changement probable'], vNoise: ['داخل هامش الخطأ', 'Dans la marge d’erreur'], vDiff: ['طريقة مختلفة', 'Méthode différente'],
  noRpt: ['ما كاين حتى اختبار لهذا السباح. اضغط «＋ اختبار جديد».', 'Aucun test pour ce nageur. Appuyez sur « ＋ Nouveau test ».'],
  addRes: ['＋ نتيجة جديدة', '＋ Nouveau résultat'], allRes: ['كل النتائج', 'Tous les résultats'], evo: ['منحنى التطور', 'Courbe d’évolution'],
  metStep: ['السرعة عند FCmax', 'Vitesse à FCmax'], metLast: ['سرعة آخر تكرار', 'Allure de la dernière rép.'],
  lastRes: ['آخر نتيجة', 'Dernier résultat'], bestRes: ['أحسن نتيجة', 'Meilleur résultat'], vsPrev: ['مقارنة بالسابقة', 'Par rapport au précédent'], vsFirst: ['من أول نتيجة', 'Depuis le premier'],
  testsDone: ['نتائج مسجّلة', 'Résultats enregistrés'], upN: ['تحسّن حقيقي', 'Progrès réels'], downN: ['تراجع حقيقي', 'Baisses réelles'],
  lowB: ['الأقل هو الأحسن', 'Plus bas = meilleur'], highB: ['الأكبر هو الأحسن', 'Plus haut = meilleur'], legerLand: ['أرضي (جري)', 'terrain (course)'],
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
// 📱 هوية الجهاز: رقم + سر عشوائيين، ما يخرجوش من هاذ المتصفح (السيرفر يحفظ غير البصمة تاع السر)
function rndHex(n) { var a = new Uint8Array(n); (window.crypto || window.msCrypto).getRandomValues(a); return Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
function devInfo() {
  var di = ls('mr_di'), dk = ls('mr_dk');
  if (!/^[a-f0-9]{16,64}$/.test(di || '') || !/^[a-f0-9]{32,128}$/.test(dk || '')) { di = rndHex(12); dk = rndHex(24); ls('mr_di', di); ls('mr_dk', dk); }
  var u = navigator.userAgent || '', os = /iPad|Macintosh.*Mobile|Macintosh/.test(u) && navigator.maxTouchPoints > 1 ? 'iPad' : /iPhone/.test(u) ? 'iPhone' : /Android/.test(u) ? 'Android' : /Windows/.test(u) ? 'Windows' : /Mac/.test(u) ? 'Mac' : /Linux/.test(u) ? 'Linux' : '?';
  var br = /Bluefy/.test(u) ? 'Bluefy' : /Edg\//.test(u) ? 'Edge' : /SamsungBrowser/.test(u) ? 'Samsung' : /Firefox/.test(u) ? 'Firefox' : /CriOS|Chrome/.test(u) ? 'Chrome' : /Safari/.test(u) ? 'Safari' : '';
  return { di: di, dk: dk, label: os + (br ? ' · ' + br : ''), code: di.slice(0, 4).toUpperCase() };
}
function wipeLocal(msg) { // جهاز ممنوع ولا مفكوك: نمسحو كلش من هاذ الجهاز
  ['vo2_tk', 'vo2_cache', 'vo2_queue', 'vo2_viewas', 'mr_role'].forEach(function (k) { ls(k, null); });
  DB = { swimmers: [], tests: [], coaches: [], me: null }; QUEUE = []; S.authMsg = msg || ''; render();
}
var API = {
  url: function () { return ls('vo2_api') || DEFAULT_API; },
  tk: function () { return ls('vo2_tk') || ''; },
  raw: function (p) {
    if (API.url() === 'demo') return Promise.resolve(Local.call(p));
    return fetch(API.url(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p), redirect: 'follow' }).then(function (r) { return r.json(); });
  },
  call: function (a, p, again) {
    p = p || {}; p.a = a; p.tk = API.tk();
    if (a === 'login' || a === 'devLogin') { var D = devInfo(); p.di = D.di; p.dk = D.dk; p.label = D.label; }
    return API.raw(p).then(function (r) {
      if (r && !r.ok && r.err === 'devRevoked') { wipeLocal('devRevoked'); throw new Error('auth'); }
      if (r && !r.ok && r.err === 'auth') {
        // المدرب: الجهاز المربوط يرجع يدخل وحدو
        if (!again && ls('mr_role') === 'coach') return API.call('devLogin', {}, true).then(function (x) {
          if (x.ok) { ls('vo2_tk', x.tk); var q = Object.assign({}, p); delete q.tk; return API.call(a, q, true); }
          if (x.err === 'devNeedLink' || x.err === 'devBlocked') { wipeLocal(x.err); throw new Error('auth'); }
          ls('vo2_tk', null); render(); throw new Error('auth');
        });
        ls('vo2_tk', null); render(); throw new Error('auth');
      }
      return r;
    });
  }
};
// serveur local (mode essai / tests) — mêmes règles que le serveur
var Local = {
  db: function () { try { var d = JSON.parse(ls('vo2_demo') || '{}'); d.s = d.s || []; d.t = d.t || []; d.c = d.c || []; d.p = d.p || []; d.au = d.au || []; return d; } catch (e) { return { s: [], t: [], c: [], p: [], au: [] }; } },
  put: function (d) { ls('vo2_demo', JSON.stringify(d)); },
  call: function (p) {
    var d = Local.db();
    var now = new Date().toISOString(); d.ad = d.ad || [];
    if (p.a === 'login') {
      var first = false; if (!d.pw) { if (String(p.pw || '').length < 6) return { ok: false, err: 'short' }; d.pw = p.pw; first = true; }
      d.log = d.log || [];
      var c = p.pw === d.pw ? null : d.c.find(function (x) { return x.code === p.pw && x.active !== false; });
      var okk = p.pw === d.pw || !!c; d.log.push({ t: now, who: okk ? (c ? c.name : 'Administration') : '', ok: okk });
      if (!okk) { Local.put(d); return { ok: false, err: 'bad' }; }
      if (!c) {
        var ad = d.ad.find(function (x) { return x.id === p.di; });
        if (!d.ad.some(function (x) { return x.ok && !x.blocked; })) { if (!ad) { ad = { id: p.di }; d.ad.push(ad); } Object.assign(ad, { h: p.dk, label: p.label, ok: true, blocked: false, at: now }); }
        else if (!ad) { d.ad.push({ id: p.di, h: p.dk, label: p.label, ok: false, at: now }); Local.put(d); return { ok: false, err: 'devWait', code: String(p.di).slice(0, 4).toUpperCase() }; }
        else if (ad.h !== p.dk) return { ok: false, err: 'devOther' };
        else if (ad.blocked) return { ok: false, err: 'devBlocked' };
        else if (!ad.ok) return { ok: false, err: 'devWait', code: String(p.di).slice(0, 4).toUpperCase() };
        ad.last = now; Local.put(d); return { ok: true, tk: 'demo-admin|' + p.di, role: 'admin', first: first };
      }
      if (p.inv) { if (!c.inv || c.inv.tk !== p.inv) { Local.put(d); return { ok: false, err: 'linkUsed' }; } c.dev = { id: p.di, h: p.dk, label: p.label, at: now }; delete c.inv; }
      else if (!c.dev) { Local.put(d); return { ok: false, err: 'devNeedLink' }; }
      else if (c.dev.id !== p.di || c.dev.h !== p.dk) { Local.put(d); return { ok: false, err: 'devOther' }; }
      c.dev.last = now; Local.put(d); return { ok: true, tk: 'demo-coach-' + c.id + '|' + p.di, role: 'coach' };
    }
    if (p.a === 'devLogin') { var cd = d.c.find(function (x) { return x.dev && x.dev.id === p.di && x.dev.h === p.dk; }); if (!cd) return { ok: false, err: 'devNeedLink' }; if (cd.active === false) return { ok: false, err: 'devBlocked' }; return { ok: true, tk: 'demo-coach-' + cd.id + '|' + p.di, role: 'coach' }; }
    var tk0 = p.tk || '', tdi = tk0.indexOf('|') > 0 ? tk0.split('|')[1] : null, tk = tk0.split('|')[0], w = tk === 'demo-admin' ? { role: 'admin', name: 'Administration', perm: permOf(null), di: tdi } : null;
    if (w && tdi && !d.ad.some(function (x) { return x.id === tdi && x.ok && !x.blocked; })) return { ok: false, err: 'devRevoked' };
    if (!w && tk.indexOf('demo-coach-') === 0) { var co = d.c.find(function (x) { return x.id === tk.slice(11); }); if (co && (co.active === false || (tdi && (!co.dev || co.dev.id !== tdi)))) return { ok: false, err: 'devRevoked' }; if (co) w = { role: 'coach', id: co.id, name: co.name, head: co.head === true, perm: permOf(co), rec: co }; }
    if (!w) return { ok: false, err: 'auth' };
    var sees = function (s) { return w.role === 'admin' || (!!s && (w.perm.see ? w.perm.see.indexOf(String(s.id)) >= 0 : s.coachId === w.id)); };
    var need = function (k) { return w.role === 'admin' || !!w.perm[k]; };
    var btT = function (ty) { return ty === 'bt' || ty === 'va'; }, kindOf = function (ty) { return btT(ty) ? 'bt' : ty === 'day' ? 'day' : 'vo2'; };
    var canT = function (s, ty, edit) { return sees(s) && need(kindOf(ty)) && (!edit || ty === 'day' || need('editRes')); };
    function up(arr, rec) { if (!rec.id) rec.id = uid(); rec.updated = new Date().toISOString(); var i = arr.findIndex(function (x) { return x.id === rec.id; }); if (i >= 0) arr[i] = rec; else arr.push(rec); return rec; }
    function S_(id) { return d.s.find(function (x) { return x.id === id; }); }
    var r = { ok: true }, F_ = { ok: false, err: 'forbidden' };
    function audit(act, det) { d.au.push({ t: new Date().toISOString(), who: w.name, act: act, det: det }); if (d.au.length > 1000) d.au.splice(0, 200); }
    if (p.a === 'all') {
      var ss = d.s.filter(sees), ids = {}; ss.forEach(function (x) { ids[x.id] = 1; });
      r.swimmers = ss; r.tests = d.t.filter(function (t) { return ids[t.swimmerId]; });
      r.coaches = w.role === 'admin' ? d.c.map(function (c) { var x = Object.assign({}, c); if (x.dev) x.dev = { label: x.dev.label, at: x.dev.at, last: x.dev.last, code: String(x.dev.id).slice(0, 4).toUpperCase() }; return x; }) : d.c.filter(function (c) { return c.id === w.id; }).map(function (c) { return { id: c.id, name: c.name }; });
      r.me = { role: w.role, id: w.id || null, name: w.name, head: !!w.head, perm: w.perm }; r.settings = d.set || {}; r.protos = d.p;
      if (w.role === 'admin') r.fails24 = (d.log || []).filter(function (x) { return !x.ok && Date.now() - new Date(x.t) < 864e5; }).length;
    }
    else if (p.a === 'saveSwimmer') { var old = S_(p.rec.id); if (old ? !(need('edit') && sees(old)) : !need('add')) return F_; if (w.role !== 'admin') { if (old) p.rec.coachId = old.coachId; else { p.rec.coachId = w.id; if (!p.rec.id) p.rec.id = uid(); if (w.perm.see) { w.rec.perm = w.rec.perm || {}; w.rec.perm.see = (w.rec.perm.see || []).concat([p.rec.id]); } } } r.rec = up(d.s, p.rec); }
    else if (p.a === 'saveTest') { var ex0 = d.t.find(function (x) { return x.id === p.rec.id; }); if (!canT(S_(p.rec.swimmerId), p.rec.type, !!ex0)) return F_; p.rec.by = p.rec.by || w.name; r.rec = up(d.t, p.rec); if (btT(p.rec.type)) audit(ex0 ? 'résultat modifié' : 'résultat', (S_(p.rec.swimmerId) || {}).name + ' · ' + (p.rec.type === 'va' ? '🎥' : p.rec.data.proto ? p.rec.data.proto.name : p.rec.data.test) + ' · ' + p.rec.date); }
    else if (p.a === 'saveProto') { if (!need('proto')) return F_; var op = d.p.find(function (x) { return x.id === p.rec.id; }); if (op && w.role !== 'admin' && op.byId !== w.id) return F_; if (!op) { p.rec.by = w.name; p.rec.byId = w.id || 'admin'; } else { p.rec.by = op.by; p.rec.byId = op.byId; } r.rec = up(d.p, p.rec); audit(op ? (p.rec.active === false ? 'protocole archivé' : 'protocole modifié') : 'protocole créé', p.rec.name); }
    else if (p.a === 'saveProgram') { if (!need('proto')) return F_; d.set = d.set || {}; var pk = 'prog_' + p.camp; d.set[pk] = d.set[pk] || {}; d.set[pk][p.cat] = p.tests || []; }
    else if (p.a === 'audit') { if (w.role !== 'admin') return F_; r.log = d.au.slice().reverse(); }
    else if (p.a === 'delSwimmer') { if (!need('del') || !sees(S_(p.id))) return F_; d.s = d.s.filter(function (x) { return x.id !== p.id; }); d.t = d.t.filter(function (x) { return x.swimmerId !== p.id; }); }
    else if (p.a === 'delTest') { var dt = d.t.find(function (x) { return x.id === p.id; }); if (dt && !(canT(S_(dt.swimmerId), dt.type, true) && need('editRes'))) return F_; if (dt && btT(dt.type)) audit('résultat supprimé', (S_(dt.swimmerId) || {}).name + ' · ' + dt.date); d.t = d.t.filter(function (x) { return x.id !== p.id; }); }
    else if (p.a === 'saveSetting') { if (w.role !== 'admin') return F_; d.set = d.set || {}; d.set[p.key] = p.value; }
    else if (p.a === 'log') { r.log = (d.log || []).slice().reverse(); }
    else if (p.a === 'coachLink') { if (w.role !== 'admin') return F_; var cl = d.c.find(function (x) { return x.id === p.id; }); cl.inv = { tk: rndHex(20), at: now }; delete cl.dev; r.tk = cl.inv.tk; }
    else if (p.a === 'coachUnbind') { if (w.role !== 'admin') return F_; var cu = d.c.find(function (x) { return x.id === p.id; }); if (cu) { delete cu.dev; delete cu.inv; } }
    else if (p.a === 'devs') { if (w.role !== 'admin') return F_; r.me = w.di; r.list = d.ad.map(function (x) { return { id: x.id, code: String(x.id).slice(0, 4).toUpperCase(), label: x.label, ok: !!x.ok, blocked: !!x.blocked, at: x.at, last: x.last }; }); }
    else if (p.a === 'devSet') { if (w.role !== 'admin') return F_; var dv = d.ad.find(function (x) { return x.id === p.id; }); if (dv) { if (p.op === 'ok') { dv.ok = true; dv.blocked = false; } else { if (!d.ad.some(function (x) { return x.ok && !x.blocked && x.id !== p.id; })) return { ok: false, err: 'lastDev' }; if (p.op === 'block') { dv.ok = false; dv.blocked = true; } else d.ad.splice(d.ad.indexOf(dv), 1); } } }
    else if (p.a === 'saveCoach') { if (w.role !== 'admin') return F_; var pc = d.c.find(function (x) { return x.id === p.rec.id; }); delete p.rec.dev; delete p.rec.inv; if (pc && pc.dev) p.rec.dev = pc.dev; if (pc && pc.inv) p.rec.inv = pc.inv; if (!/^(?=.*[0-9])(?=.*[A-Za-z]).{6,}$/.test(String(p.rec.code || ''))) return { ok: false, err: 'weakCode' }; if (d.c.some(function (c) { return c.code === p.rec.code && c.id !== p.rec.id; }) || p.rec.code === d.pw) return { ok: false, err: 'dupcode' }; r.rec = up(d.c, p.rec); }
    else if (p.a === 'delCoach') { if (w.role !== 'admin') return F_; d.c = d.c.filter(function (c) { return c.id !== p.id; }); }
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
function daysOf(id) { return DB.tests.filter(function (t) { return t.swimmerId === id && t.type === 'day'; }).map(function (t) { var d = t.data || {}; return { id: t.id, date: t.date, hrv: d.hrv, rhr: d.rhr, sleepH: d.sleepH, sleepScore: d.sleepScore, recharge: d.recharge, br: d.br, ans: d.ans, min: d.min, rpe: d.rpe, load: C.num(d.min) && C.num(d.rpe) != null ? C.num(d.min) * C.num(d.rpe) : null, polar: d.polar, cl: d.cl, str: d.str, tol: d.tol, clr: d.clr, cls: d.cls, ex: d.ex || [], chr: d.chr || null }; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; }); }
function readyOf(s, date) { return C.readiness(daysOf(s.id), date || today(), ageOf(s, date)); }
function isHead() { return DB.me && DB.me.role === 'coach' && DB.me.head; }
/* --- permissions (v4) : l'administration choisit, pour chaque entraîneur, les nageurs visibles et les droits --- */
var PERM_KEYS = ['add', 'edit', 'del', 'vo2', 'bt', 'editRes', 'rep', 'day', 'polar', 'proto', 'print'];
function permOf(c) { // mêmes règles que le serveur (Code.gs · permOf_)
  var o = {}; if (!c) { PERM_KEYS.forEach(function (k) { o[k] = true; }); o.see = null; return o; }
  var p = c.perm || {}, head = c.head === true;
  var d = { add: true, edit: true, del: false, vo2: true, bt: head, editRes: true, rep: true, day: true, polar: true, proto: head, print: true };
  PERM_KEYS.forEach(function (k) { o[k] = p[k] != null ? p[k] === true : d[k]; });
  o.see = Array.isArray(p.see) ? p.see.map(String) : null; return o;
}
function can(k) { if (isAdmin()) return true; if (!DB.me) return false; var p = DB.me.perm || permOf(DB.me); return !!p[k]; }
function coachSees(c, s) { if (!c || !s) return false; var p = permOf(c); return p.see ? p.see.indexOf(String(s.id)) >= 0 : s.coachId === c.id; }
function visibleSwimmers() { return DB.swimmers.filter(function (s) { if (!isAdmin() || !VIEWAS) return true; return coachSees((DB.coaches || []).find(function (c) { return c.id === VIEWAS; }), s); }); }
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
function keepAwake(on) { try { if (on && navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { wake = w; }).catch(function () {}); else if (wake) { wake.release(); wake = null; } } catch (e) {} }

/* ======================= routage / rendu ======================= */
function route(v, o) { stopRunner(); S.plk = null; Object.assign(S, { view: v }, o || {}); render(); window.scrollTo(0, 0); }
var charts = [];
function killCharts() { charts.forEach(function (c) { try { c.destroy(); } catch (e) {} }); charts = []; }
function render() {
  killCharts();
  document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'fr' ? 'ltr' : 'rtl';
  $('#lang-btn').textContent = LANG === 'fr' ? 'ع' : 'FR';
  var logged = !!(API.url() && API.tk());
  $('#set-btn').classList.toggle('hide', !logged); $('#out-btn').classList.toggle('hide', !logged);
  $('#set-lbl').textContent = T('settings'); $('#out-lbl').textContent = T('logout');
  var tb = document.querySelector('.hd .t b'); if (tb) tb.innerHTML = 'MR WATHBA PERFORMANCE <small style="font:600 10.5px Rubik,sans-serif;letter-spacing:1.5px;opacity:.8;margin-inline-start:6px">BY OKBA</small>';
  document.body.classList.toggle('wide', S.view === 'btVideo');
  var sb = $('#switch-btn'); if (sb) { sb.classList.toggle('hide', true); sb.textContent = window.APP_MODE === 'bt' ? '🫁 VO2max' : '🧪 ' + T('btShort'); sb.onclick = function () { location.href = window.APP_MODE === 'bt' ? 'index.html' : 'tests.html'; }; }
  $('#hd-sub').textContent = logged && DB.me ? (DB.me.role === 'admin' ? T('admin') : T('coach') + ' · ' + DB.me.name) : T('sub');
  var app = $('#app');
  document.body.classList.toggle('auth', !logged);
  var nav = [['home', '🏠', T('home')]].concat(can('add') ? [['add', '＋', T('addSw')]] : []).concat([['settings', '⚙', T('settings')], ['out', '🚪', T('logout')]]);
  $('#bnav').innerHTML = nav.map(function (n) { return '<button data-nav="' + n[0] + '" class="' + ((S.view === n[0] || (n[0] === 'home' && /^(swimmer|test|pick|swTest|btEntry|liveSetup|live|liveRes)$/.test(S.view))) ? 'on' : '') + '"><b>' + n[1] + '</b>' + n[2] + '</button>'; }).join('');
  $$('#bnav [data-nav]').forEach(function (b) { b.onclick = function () { var k = b.dataset.nav; if (k === 'out') $('#out-btn').click(); else if (k === 'add') route('swForm', { sid: null }); else route(k); }; });
  if (!API.url()) return vSetup(app);
  if (!API.tk()) return vLogin(app);
  if (window.APP_MODE === 'bt' && DB.me && DB.me.role === 'coach' && !DB.me.head && S.view !== 'settings') { app.innerHTML = '<div class="card empty" style="margin-top:30px">🔒 ' + T('noBt') + '<div style="margin-top:14px"><a class="btn pri" href="index.html">🫁 VO2max</a></div></div>'; load().then(function (r) { if (r && r.ok && DB.me && DB.me.head) render(); }).catch(function () {}); return; }
  var V = { home: vHome, swimmer: vSwimmer, swForm: vSwForm, test: vTest, settings: vSettings, pick: vPick, swTest: vSwTest, liveSetup: vLiveSetup, live: vLive, liveRes: vLiveRes };
  if (window.BTV) Object.keys(window.BTV.views).forEach(function (k) { if (window.APP_MODE === 'bt' || (k !== 'home' && k !== 'swimmer')) V[k] = window.BTV.views[k]; });
  (V[S.view] || V.home)(app);
}
window.addEventListener('hashchange', function () { if (/inv=/.test(location.hash) && !API.tk()) { S.authMsg = ''; S.wait = null; render(); } });
$('#lang-btn').onclick = function () { LANG = LANG === 'fr' ? 'ar' : 'fr'; ls('vo2_lang', LANG); render(); };
$('#set-btn').onclick = function () { route('settings'); };
$('#out-btn').onclick = function () { ls('vo2_tk', null); ls('vo2_viewas', null); S.devTried = true; VIEWAS = ''; DB = { swimmers: [], tests: [], coaches: [], me: null }; persist(); BT.disconnect(); vHome.loaded = false; route('home'); };

/* ---------- setup & login ---------- */
function authShell(inner) {
  return '<div class="lg-wrap"><button class="lg-lang" id="auth-lang" type="button">' + (LANG === 'fr' ? 'ع' : 'FR') + '</button>' +
    '<div class="lg-glass"><img class="lg-logo" src="logo.png" alt=""><div class="lg-t">MR WATHBA PERFORMANCE</div><div class="lg-by">BY OKBA</div><div class="lg-sub">' + T('authSub') + '</div>' + inner + '</div>' +
    '<div class="lg-foot">Club Sportif Al-Wathba · Batna</div></div>';
}
function bindAuthLang() { $('#auth-lang').onclick = function () { $('#lang-btn').click(); }; }
var DEV_ERR = {
  devWait: ['⏳ هاذ الجهاز يستنى موافقة الإدارة.', '⏳ Cet appareil attend l’accord de l’administration.'],
  devNeedLink: ['🔗 حساب المدرب يتفتح غير بالرابط الشخصي اللي تبعثو الإدارة (مرة وحدة في الهاتف تاعك).', '🔗 Le compte entraîneur s’ouvre uniquement avec le lien personnel envoyé par l’administration.'],
  devOther: ['📵 هاذ الحساب مربوط بجهاز آخر. إذا بدلت الهاتف، اطلب من الإدارة رابط جديد.', '📵 Ce compte est lié à un autre appareil. Nouveau téléphone : demandez un nouveau lien.'],
  linkUsed: ['⛔ هاذ الرابط تستعمل من قبل ولا تبدّل. اطلب من الإدارة رابط جديد.', '⛔ Ce lien a déjà été utilisé ou remplacé. Demandez un nouveau lien.'],
  devBlocked: ['⛔ هاذ الجهاز ممنوع.', '⛔ Cet appareil est bloqué.'],
  devRevoked: ['🔒 الإدارة نحّات هاذ الجهاز، والبيانات تمسحت منو.', '🔒 L’administration a retiré cet appareil ; les données locales ont été effacées.'],
  devOld: ['⬆️ حدّث التطبيق (أعد تحميل الصفحة).', '⬆️ Mettez l’application à jour (rechargez la page).']
};
function devErr(e) { return DEV_ERR[e] ? Tv(DEV_ERR[e]) : (T(e) || e); }
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
  var inv = (location.hash.match(/inv=([a-f0-9]{16,80})/) || [])[1] || '', D = devInfo();
  var msg = S.authMsg ? '<div class="lg-msg">' + devErr(S.authMsg) + '</div>' : '';
  // المدرب اللي جهازو مربوط: يدخل وحدو
  if (!inv && ls('mr_role') === 'coach' && !S.devTried) {
    S.devTried = true; app.innerHTML = authShell('<div class="lg-msg" style="background:#ffffff14">⏳ ' + A('نفتح…', 'Ouverture…') + '</div>'); bindAuthLang();
    API.call('devLogin', {}, true).then(function (r) { if (r.ok) { ls('vo2_tk', r.tk); S.authMsg = ''; return load().then(function () { vHome.loaded = true; route('home'); }); } S.authMsg = r.err; if (r.err === 'devNeedLink' || r.err === 'devBlocked') ls('mr_role', null); render(); }).catch(function () { S.authMsg = ''; app.innerHTML = authShell('<div class="lg-msg">' + T('neterr') + '</div>'); bindAuthLang(); });
    return;
  }
  if (S.wait) {
    app.innerHTML = authShell('<div class="lg-msg">' + devErr('devWait') + '</div><div class="lg-code">' + esc(S.wait.code) + '</div><div class="lg-note">' + esc(D.label) + '<br>' + A('قول للإدارة: ⚙ الإعدادات ← 📱 أجهزة الإدارة ← اقبل الجهاز اللي رقمو هذا.', 'Demandez : ⚙ Réglages ← 📱 Appareils ← accepter ce code.') + '</div><button class="lg-go" id="w-again" type="button">🔄 ' + A('عاود جرب', 'Réessayer') + '</button><button class="lg-link" id="w-back" type="button">' + A('رجوع', 'Retour') + '</button>');
    bindAuthLang();
    $('#w-back').onclick = function () { S.wait = null; render(); };
    $('#w-again').onclick = function () { var b = this; b.disabled = true; API.call('login', { pw: S.lastPw }).then(function (r) { b.disabled = false; doneLogin(r); }).catch(function () { b.disabled = false; toast(T('neterr')); }); };
    return;
  }
  var head = inv ? '<div class="lg-msg" style="background:#c9a24a26;border-color:#c9a24a88">🔗 ' + A('<b>ربط هاذ الجهاز بالحساب تاعك.</b> اكتب الكود تاعك <b>مرة وحدة</b>. من بعد التطبيق يتحل وحدو في هاذ الجهاز برك.', '<b>Lier cet appareil à votre compte.</b> Saisissez votre code <b>une seule fois</b> ; ensuite l’app s’ouvre seule sur cet appareil uniquement.') + '</div>' : '';
  app.innerHTML = authShell(msg + head + '<form id="lf" autocomplete="off"><label class="lg-lab">' + (inv ? A('الكود تاعك', 'Votre code') : A('كلمة السر ولا كود المدرب', 'Mot de passe ou code entraîneur')) + '</label>' +
    '<div class="lg-pin"><input type="password" id="pw" autocomplete="current-password" placeholder="••••••"><button type="button" id="pw-eye" aria-label="👁">👁</button></div>' +
    '<button class="lg-go">' + (inv ? '🔗 ' + A('ربط الجهاز', 'Lier l’appareil') : T('login') + ' ←') + '</button></form>' +
    (inv ? '' : '<div class="lg-note">' + A('المدربين: أول مرة، افتح الرابط الشخصي اللي بعثتهولك الإدارة.', 'Entraîneurs : la 1re fois, ouvrez le lien personnel envoyé par l’administration.') + '</div>') +
    '<div class="lg-dev">📱 ' + esc(D.label) + ' · ' + D.code + '</div>');
  bindAuthLang();
  $('#pw').focus();
  $('#pw-eye').onclick = function () { var i = $('#pw'); i.type = i.type === 'password' ? 'text' : 'password'; };
  $('#lf').onsubmit = function (e) {
    e.preventDefault(); var b = $('#lf .lg-go'); b.disabled = true; S.lastPw = $('#pw').value;
    API.call('login', inv ? { pw: S.lastPw, inv: inv } : { pw: S.lastPw }).then(function (r) { b.disabled = false; doneLogin(r, inv); }).catch(function () { b.disabled = false; toast(T('neterr')); });
  };
}
function doneLogin(r, inv) {
  if (!r.ok) {
    if (r.err === 'devWait') { S.wait = { code: r.code || devInfo().code }; return render(); }
    S.wait = null; S.authMsg = /^dev|^link/.test(r.err) ? r.err : '';
    if (S.authMsg) render(); else toast(T(r.err) || r.err);
    var g = $('.lg-glass'); if (g && g.animate) g.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }], { duration: 300 });
    return;
  }
  S.wait = null; S.authMsg = ''; S.lastPw = ''; ls('vo2_tk', r.tk); ls('mr_role', r.role); if (r.first) toast(T('first'));
  if (inv) try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; }
  return load().then(function () { vHome.loaded = true; route('home'); });
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
  if (LV && LV.running) h += '<div class="alert" style="margin-bottom:14px;display:flex;align-items:center;gap:10px"><b class="sp">⏱ ' + A('اختبار لايف راهو يخدم', 'Test en direct en cours') + '</b><button class="btn pri" id="lv-back">' + A('رجوع للاختبار', 'Revenir au test') + '</button></div>';
  h += '<div class="row" style="margin-bottom:14px">' + ((can('vo2') || can('bt')) ? '<button class="btn pri big" id="go-live">⏱ ' + A('اختبار لايف · Verity Sense', 'Test en direct · Verity Sense') + '</button>' : '') + (can('proto') ? '<button class="btn" id="go-protos">🧩 ' + A('البروتوكولات', 'Protocoles') + '</button>' : '') + '</div>';
  h += '<div class="row"><h1 class="sp">' + T('swimmers') + '</h1>' + (can('add') ? '<button class="btn pri" id="add">＋ ' + T('addSw') + '</button>' : '') + '</div>';
  if (QUEUE.length) h += '<div class="note" style="margin-bottom:12px">⏳ ' + QUEUE.length + ' ' + T('pending') + '</div>';
  if (!list.length) h += '<div class="card empty">' + T('noSw') + '</div>';
  h += '<div class="grid g3">';
  list.forEach(function (s) {
    var P = profile(s), a = P.age, r = P.ready;
    h += '<div class="card sw" data-id="' + s.id + '"><div class="av ' + (r ? r.level : '') + '">' + esc(initials(s.name)) + '</div><div class="sp" style="min-width:0"><b style="font-size:17px">' + esc(s.name) + '</b><div class="small muted">' +
      (a ? Math.floor(a) + ' ' + T('yrs') : '') + (s.level ? ' · ' + (s.level == 7 ? T('comp') : T('level') + ' ' + s.level) : '') + (window.BTV && BTV.catOf(s) ? ' · ' + BTV.catName(BTV.catOf(s)) : '') + '</div>' +
      '<div class="small muted">' + (isAdmin() && !VIEWAS ? '👤 ' + esc(coachName(s.coachId) || T('noCoach')) + ' · ' : '') + '<span class="dot ' + (r ? r.level : 'none') + '" style="vertical-align:middle"></span> ' + (r ? T(r.level).split(':')[0] : '—') + '</div></div>' +
      gauge(P.final ? P.final.vo2 : null, 84) + '</div>';
  });
  h += '</div>';
  app.innerHTML = h;
  if ($('#add')) $('#add').onclick = function () { route('swForm', { sid: null }); };
  if ($('#go-live')) $('#go-live').onclick = function () { LS = null; route('liveSetup', { liveSids: [] }); };
  if ($('#lv-back')) $('#lv-back').onclick = function () { route('live'); };
  if ($('#go-protos')) $('#go-protos').onclick = function () { route('btProtos'); };
  $$('[data-va]').forEach(function (b) { b.onclick = function () { VIEWAS = b.dataset.va; ls('vo2_viewas', VIEWAS || null); render(); }; });
  $$('.sw').forEach(function (el) { el.onclick = function () { route('swimmer', { sid: el.dataset.id, tab: 'rpt' }); }; });
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
    co + '</div></div>' +
    '<div class="card"><h3>📏 ' + T('body') + '</h3><div class="fr">' + inp('height', 'height', 'hHint') + inp('sitH', 'sitH', 'sitHint') + inp('span', 'span', 'spanHint') + inp('weight', 'weight') + inp('hrmaxKnown', 'hrmaxOverride', null, 'numeric') + '</div></div>' +
    '<div class="card"><div class="f">' + lab('notes') + '<textarea name="notes" rows="2">' + esc(s.notes) + '</textarea></div>' +
    '<div class="row"><button class="btn pri big">' + T('save') + '</button>' + (S.sid && can('del') ? '<span class="sp"></span><button type="button" class="btn dan" id="dl">' + T('del') + '</button>' : '') + '</div></div></form>';
  $('#bk').onclick = function () { S.sid ? route('swimmer') : route('home'); };
  $('#sf').onsubmit = function (e) {
    e.preventDefault(); var f = e.target, rec = Object.assign({}, s);
    ['name', 'dob', 'sex', 'level', 'height', 'sitH', 'span', 'weight', 'hrmaxKnown', 'notes'].forEach(function (k) { rec[k] = f[k].value.trim(); });
    if (f.coachId) rec.coachId = f.coachId.value; else if (!rec.coachId && DB.me && DB.me.role === 'coach') rec.coachId = DB.me.id;
    rec.id = rec.id || uid();
    rec.body = (s.body || []).slice();
    if (rec.height !== (s.height || '') || rec.weight !== (s.weight || '') || rec.sitH !== (s.sitH || '')) rec.body.push({ date: today(), h: rec.height, w: rec.weight, sh: rec.sitH, span: rec.span });
    mutate('saveSwimmer', { rec: rec }); toast(T('saved')); route('swimmer', { sid: rec.id, tab: 'rpt' });
  };
  if ($('#dl')) $('#dl').onclick = function () { if (confirm(T('confirmDel'))) { mutate('delSwimmer', { id: S.sid }); toast(T('deleted')); route('home'); } };
}

/* ---------- page nageur ---------- */
function vSwimmer(app) {
  var s = sw(S.sid); if (!s) return route('home');
  var P = profile(s);
  var h = '<div class="row"><button class="btn sm" id="bk">← ' + T('swimmers') + '</button><span class="sp"></span>' + (can('vo2') || can('bt') || can('day') ? '<button class="btn pri" id="nt">＋ ' + T('newTest') + '</button>' : '') + (can('print') && can('rep') ? '<button class="btn sm" id="pr">🖨 ' + T('print') + '</button>' : '') + (can('edit') ? '<button class="btn sm" id="ed">✎ ' + T('edit') + '</button>' : '') + '</div>' +
    '<div class="row" style="margin:12px 0"><div class="av" style="width:58px;height:58px;font-size:22px">' + esc(initials(s.name)) + '</div><div class="sp"><h1 style="margin:0">' + esc(s.name) + '</h1><div class="small muted">' +
    (P.age ? '<span class="num">' + R(P.age, 1) + '</span> ' + T('yrs') : '') + (window.BTV && BTV.catOf(s) ? ' · <span class="chip">' + BTV.catName(BTV.catOf(s)) + '</span>' : '') + (s.weight ? ' · <span class="ltr">' + esc(s.weight) + ' kg</span>' : '') + (s.height ? ' · <span class="ltr">' + esc(s.height) + ' cm</span>' : '') + (s.level ? ' · ' + (s.level == 7 ? T('comp') : T('level') + ' ' + s.level) : '') + (isAdmin() && s.coachId ? ' · 👤 ' + esc(coachName(s.coachId)) : '') + '</div></div>' +
    (P.ready ? '<span class="chip ' + P.ready.level + '"><span class="dot ' + P.ready.level + '"></span> ' + T(P.ready.level).split(':')[0] + '</span>' : '') + '</div>';
  var TABS = [['rpt', '📋'], ['sum', '🫁'], ['recovery', '🌙'], ['times', '🏅'], ['history', '📈']].filter(function (k) { return can('rep') || k[0] === 'recovery' || k[0] === 'times'; });
  if (S.tab === 'tests') S.tab = 'rpt';
  if (!TABS.some(function (k) { return k[0] === S.tab; })) S.tab = TABS[0][0];
  h += '<div class="tabs">' + TABS.map(function (k) { return '<button class="btn sm' + (S.tab === k[0] ? ' on' : '') + '" data-tab="' + k[0] + '">' + k[1] + ' ' + T(k[0]) + '</button>'; }).join('') + '</div>';
  if (S.tab === 'tests') S.tab = 'rpt';
  if (S.tab === 'rpt') h += rptHtml(s);
  else if (S.tab === 'sum') h += summaryHtml(P);
  else if (S.tab === 'recovery') h += recoveryHtml(s);
  else if (S.tab === 'times') h += timesHtml(s);
  else h += historyHtml(s);
  app.innerHTML = h;
  $('#bk').onclick = function () { route('home'); };
  if ($('#ed')) $('#ed').onclick = function () { route('swForm'); };
  if ($('#pr')) $('#pr').onclick = function () { printCard(s); };
  if ($('#nt')) $('#nt').onclick = function () { route('pick', { sid: s.id }); };
  $$('[data-pick]').forEach(function (b) { b.onclick = function () { route('pick', { sid: s.id }); }; });
  $$('[data-tk]').forEach(function (b) { b.onclick = function () { route('swTest', { tkey: b.dataset.tk }); }; });
  $$('[data-tab]').forEach(function (b) { b.onclick = function () { S.tab = b.dataset.tab; render(); }; });
  $$('[data-new]').forEach(function (b) { b.onclick = function () { route('test', { tid: null, type: b.dataset.new }); }; });
  $$('[data-tid]').forEach(function (b) { b.onclick = function () { var t = DB.tests.find(function (x) { return x.id === b.dataset.tid; }); route('test', { tid: t.id, type: t.type }); }; });
  if (S.tab === 'sum') drawSummaryCharts(P);
  if (S.tab === 'history') drawHistory(s);
  if (S.tab === 'recovery') { polarBind(s); if (can('rep')) { drawRecovery(s); drawReport(s); } }
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
  // ما نقدّروش المناطق من أعلى نبض في حصة (يغلط): مصدر حقيقي برك
  var Zs = swZones(s), z = Zs ? Zs.z : null, approx = false;
  rep.zones = z; rep.zApprox = approx; rep.zLab = Zs ? Zs.lab : '';
  // ── حمل 7 أيام من Polar
  var w7 = 0, n7 = 0, a7 = 0, m7 = 0; days.forEach(function (x) { var k = (new Date(date) - new Date(x.date)) / 864e5; if (k >= 0 && k < 7) (x.ex || []).forEach(function (e) { if (isTraining(e)) { w7 += e.load || 0; n7++; } else { a7 += e.load || 0; m7++; } }); });
  rep.w7 = w7; rep.n7 = n7; rep.a7 = a7; rep.m7 = m7;
  // ── حصص النهار هذا برك (ما نخلطوش مع البارح) + آخر حصة قبلو
  var byStart = function (a, b) { return String(a.start || '').localeCompare(String(b.start || '')); };
  rep.tr = (d.ex || []).filter(isTraining).sort(byStart);
  rep.act = (d.ex || []).filter(function (e) { return !isTraining(e); }).sort(byStart);
  rep.prev = null;
  for (var pi = days.length - 1; pi >= 0; pi--) { if (days[pi].date >= date) continue; var pt = (days[pi].ex || []).filter(isTraining); if (pt.length) { rep.prev = { date: days[pi].date, ex: pt.sort(byStart) }; break; } }
  rep.isToday = date === today();
  rep.after = rep.tr.length > 0 || !rep.isToday;   // بعد الحصة (ولا نهار فات) ← ملخص + غدوة
  return rep;
}
function zr(rep, a, b) { var z = rep.zones; if (!z) return ''; return ' <span class="num ltr">(' + z[a - 1].lo + '–' + z[b - 1].hi + ' bpm)</span>'; }

function reportHtml(rep) { return reportVisual(rep) + reportDetails(rep); }
// 📝 التفاصيل: الليل بالشرح + شرح المؤشرات (مرة وحدة)
function reportDetails(rep) {
  var d = rep.d, r = rep.r, L = rep.lvl, out = [];
  out.push('<div class="rp-sec">📝 ' + A('تفاصيل الليل والشرح', 'Détails de la nuit et explications') + '</div>');
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

  // 7) شرح المؤشرات
  out.push('<details class="guide"><summary>📖 ' + A('شرح كل مؤشر', 'Explication des indicateurs') + '</summary><div class="gb">' + [
    A('<b>HRV (تغيّر النبض):</b> الفرق الصغير بين دقة ودقة تاع القلب في الليل. كي يكون <b>طالع</b> على العادة تاعو ← الجهاز العصبي مرتاح والجسم استرجع. كي <b>يهبط</b> ← تعب، ضغط، نوم ناقص ولا مرض. نقارنو كل سباح مع روحو، ماشي مع لخرين.', '<b>VFC :</b> variation entre battements la nuit. <b>Haute</b> par rapport à sa référence = bien récupéré ; <b>basse</b> = fatigue, stress, manque de sommeil ou maladie. On compare le nageur à lui-même.'),
    A('<b>نبض الراحة في الليل:</b> كي يطلع 5 ولا أكثر على العادة ← الجسم مازال يخدم باش يسترجع.', '<b>FC de repos :</b> +5 bpm ou plus que d’habitude = l’organisme récupère encore.'),
    A('<b>Nightly Recharge:</b> حساب Polar من جوج حوايج: النوم (Sleep charge) والجهاز العصبي (ANS charge)، مقارنين مع 28 يوم لي فاتو.', '<b>Nightly Recharge :</b> combinaison Polar du sommeil (Sleep charge) et du système nerveux (ANS charge), comparés aux 28 derniers jours.'),
    A('<b>Cardio load (حمل الحصة):</b> Polar تحسبو من النبض والمدة. كل ما كانت الحصة أطول وأقوى، كبر الرقم.', '<b>Cardio load :</b> calculé par Polar à partir de la FC et de la durée. Plus la séance est longue et intense, plus il est élevé.'),
    A('<b>Strain / Tolérance:</b> الـ Strain = التعب تاع الأيام الأخيرة. الـ Tolérance = واش متعوّد عليه في الأسابيع لي فاتو. كي الـ Strain يفوت الـ Tolérance بزاف ← Excessif.', '<b>Strain / Tolérance :</b> fatigue récente vs habitude des semaines passées. Strain bien au-dessus de la tolérance = Excessif.'),
    A('<b>المناطق:</b> 1 = خفيف جداً (استرجاع) · 2 = هوائي سهل · 3 = متوسط · 4 = قوي (العتبة) · 5 = أقصى.', '<b>Zones :</b> 1 très facile · 2 aérobie facile · 3 modéré · 4 intense (seuil) · 5 maximal.') +
      ' <span class="small muted">(' + (rep.zLab ? esc(rep.zLab) : A('ما كاينش نبض أقصى حقيقي: المناطق تاع التطبيق ما تبانش. مناطق Polar تبان إذا جات مع الحصة.', 'aucune FC max réelle : seules les zones Polar fournies avec la séance sont affichées')) + ')</span>',
    A('<b>ملاحظة:</b> هذا التقرير أداة مساعدة للمدرب. كيفاش يحس السباح روحو والملاحظة في المسبح يبقاو مهمين، وما يعوّضش رأي الطبيب.', '<b>Note :</b> outil d’aide à l’entraîneur ; le ressenti et l’observation restent essentiels ; ne remplace pas un avis médical.')
  ].map(function (x) { return '<p>' + x + '</p>'; }).join('') + '</div></details>');
  return out.join('');
}
// ✅ واش نديرو اليوم (قبل الحصة)
function todayTodo(rep) {
  var L = rep.lvl;
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
  return todo;
}
function rcard(ic, t, body) { return '<div class="kbox" style="margin-bottom:10px"><h3 style="margin-bottom:6px">' + ic + ' ' + t + '</h3><div class="small" style="font-size:14.5px">' + body + '</div></div>'; }
function isTraining(e) { var sp = String(e.sport || ''); if (/SWIM|NATATION|POOL/i.test(sp)) return true; return (e.min || 0) >= 45; }
function exLine(e, when) {
  return '⌚ <b>' + when + ' ' + esc(e.start || '') + '</b> — ' + A('المدة', 'durée') + ' <span class="num">' + (e.min || '—') + '</span> min · ' + A('النبض', 'FC') + ' <span class="num">' + (e.hrAvg || '—') + '</span> (max <span class="num">' + (e.hrMax || '—') + '</span>)' +
    (e.load != null ? ' · ' + A('الحمل', 'charge') + ' <span class="num">' + e.load + '</span>' : '');
}
function strip_(h) { var el = document.createElement('div'); el.innerHTML = String(h || '').replace(/<br\s*\/?>/g, '\n'); return el.textContent.replace(/[ \t]+/g, ' ').trim(); }
function reportText(rep) {
  var hd = { green: '🟢 ' + A('جاهز: حصة عادية', 'Prêt : séance normale'), yellow: '🟡 ' + A('تعب خفيف: نقّص الشدة', 'Fatigue légère : réduire l’intensité'), red: '🔴 ' + A('تعب: استرجاع ولا راحة', 'Fatigue : récupération'), none: '⚪' }[rep.lvl], sc = rpScore(rep), d = rep.d;
  var why = []; if (rep.r) rep.r.flags.forEach(function (f) { why.push(T('f_' + f)); }); if (rep.cat === 'excess') why.push(A('حمل الأيام الأخيرة زايد', 'charge récente excessive'));
  var L = ['📋 ' + A('التقرير اليومي', 'Rapport du jour') + ' — ' + rep.s.name + ' — ' + dayName(rep.date) + ' ' + fmtDate(rep.date)];
  L.push(A('☀️ الصباح: ', '☀️ Matin : ') + hd + (sc != null ? ' (' + sc + '/100)' : '') + (why.length ? ' — ' + why.join('، ') : ''));
  L.push('🌙 ' + A('النوم', 'Sommeil') + ' ' + n1(C.num(d.sleepH)) + 'h · HRV ' + n0(C.num(d.hrv)) + ' ms · ' + A('نبض الراحة', 'FC repos') + ' ' + n0(C.num(d.rhr)) + (C.num(d.recharge) != null ? ' · Recharge ' + T('rc' + C.num(d.recharge)) : ''));
  if (rep.tr.length) {
    rep.tr.forEach(function (e, i) {
      var a = sessAnalysis(e, rep);
      L.push('');
      L.push('🏊 ' + sessTitle(e, i, rep) + ' — ' + e.min + ' min · ♥ ' + (e.hrAvg || '—') + '/' + (e.hrMax || '—') + (e.load != null ? ' · ' + A('الحمل', 'charge') + ' ' + e.load : '') + (e.kcal ? ' · ' + e.kcal + ' kcal' : ''));
      a.lines.forEach(function (x) { L.push('• ' + strip_(x)); });
    });
    var sm = daySum(rep);
    L.push(''); L.push('📊 ' + A('ملخص اليوم', 'Bilan du jour'));
    sm.lines.forEach(function (x) { L.push('• ' + strip_(x)); });
  } else if (rep.isToday) {
    L.push(''); L.push('✅ ' + A('واش نديرو اليوم', 'Que faire aujourd’hui'));
    todayTodo(rep).forEach(function (x) { L.push('• ' + strip_(x)); });
  } else { L.push(''); L.push('😴 ' + A('نهار بلا حصة تدريب', 'Journée sans séance')); }
  if (rep.after) {
    var tm = tomorrowPlan(rep);
    L.push(''); L.push('📅 ' + A('غدوة', 'Demain') + ' (' + dayName(tm.date) + ' ' + fmtDate(tm.date) + ') : ' + strip_(tm.title));
    tm.lines.forEach(function (x) { L.push('• ' + strip_(x)); });
  }
  L.push(''); L.push('— MR WATHBA PERFORMANCE · BY OKBA');
  return L.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
function drawReport(s) {
  var box = $('#day-report'); if (!box) return;
  var days = daysOf(s.id); if (!days.length) { box.innerHTML = ''; return; }
  var dates = days.map(function (x) { return x.date; }).reverse().slice(0, 30);
  if (!S.rdate || dates.indexOf(S.rdate) < 0) S.rdate = dates[0];
  var rep = dayReport(s, S.rdate);
  box.innerHTML = '<div class="card"><div class="row" style="margin-bottom:10px"><h2 class="sp" style="margin:0">📋 ' + A('التقرير اليومي', 'Rapport du jour') + '</h2>' +
    '<select id="rp-d" class="rp-np" style="width:auto">' + dates.map(function (x) { return '<option value="' + x + '"' + (x === S.rdate ? ' selected' : '') + '>' + fmtDate(x) + '</option>'; }).join('') + '</select>' +
    (can('print') ? '<button class="btn sm rp-np" id="rp-cp">📲 ' + A('نسخ (واتساب)', 'Copier') + '</button><button class="btn sm rp-np" id="rp-pr">🖨 ' + A('طباعة', 'Imprimer') + '</button>' : '') + '</div>' +
    '<div id="rp-body">' + (rep ? reportHtml(rep) : '<p class="muted">' + T('noDays') + '</p>') + '</div></div>';
  if (rep) drawReportCharts(rep);
  $('#rp-d').onchange = function () { S.rdate = this.value; killCharts(); render(); };
  if ($('#rp-cp')) $('#rp-cp').onclick = function () {
    var t = reportText(rep);
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('✅ ' + A('تنسخ، لصقو في واتساب', 'Copié')); }).catch(function () { prompt('', t); });
  };
  if ($('#rp-pr')) $('#rp-pr').onclick = function () {
    // 🖨 1) المنحنيات يتصوّرو وهوما ظاهرين في الشاشة (قبل ما نحرّكو التقرير) ← ما يطلعوش فارغين
    var box = $('#day-report'), ph = document.createComment('rp'), pr = $('#print'), snaps = [];
    $$('canvas', box).forEach(function (cv) {
      try {
        if (!cv.width || !cv.height) return;
        var im = new Image(); im.src = cv.toDataURL('image/png'); im.className = 'rp-snap'; im.alt = '';
        im.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block';
        cv.style.display = 'none'; cv.parentNode.insertBefore(im, cv); snaps.push([im, cv]);
      } catch (e) {}
    });
    // 2) نحطو التقرير في #print وقت الطباعة ومن بعد نرجعوه
    box.parentNode.insertBefore(ph, box);
    pr.innerHTML = '<div dir="' + (LANG === 'fr' ? 'ltr' : 'rtl') + '"><div style="font:700 13px Rubik,sans-serif;letter-spacing:1px;color:#0b3d91">MR WATHBA PERFORMANCE · BY OKBA</div><h2 style="margin:0 0 8px">📋 ' + A('التقرير اليومي', 'Rapport du jour') + ' — ' + esc(s.name) + ' — ' + fmtDate(rep.date) + '</h2></div>';
    pr.firstChild.appendChild(box);
    var opened = $$('details', box).filter(function (x) { return !x.open; }); opened.forEach(function (x) { x.open = true; });
    var done = false, back = function () {
      if (done) return; done = true; window.removeEventListener('afterprint', back);
      if (ph.parentNode) ph.parentNode.replaceChild(box, ph);
      snaps.forEach(function (p) { if (p[0].parentNode) p[0].parentNode.removeChild(p[0]); p[1].style.display = ''; });
      opened.forEach(function (x) { x.open = false; }); pr.innerHTML = '';
      charts.forEach(function (c) { try { c.resize(); } catch (e) {} });
    };
    window.addEventListener('afterprint', back);
    setTimeout(function () { window.print(); setTimeout(back, 1500); }, 250);
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
    '.rp-sec{font-weight:800;color:var(--navy);margin:16px 0 8px;font-size:16px}@media print{.rp-hero,.rp-c,.rp-z i,.rp-do div,.rp-lb span,.rp-seg i,.rp-bar i,.chip{-webkit-print-color-adjust:exact;print-color-adjust:exact}.rp-c{break-inside:avoid;box-shadow:none}.rp-big{break-inside:auto}.rp-ch{break-inside:avoid}.rp-sec{break-after:avoid}#print .rp-ch{height:170px}#print .rp-ch.s{height:140px}.rp-np{display:none!important}#print .card{border:none;padding:0;break-inside:auto!important}#print #day-report{break-inside:auto}#print #day-report h2.sp{display:none}.rp-snap{max-width:100%}.rp-an{break-inside:avoid}}' +
    '.rp-an{background:#f6f9ff;border:1px solid var(--line);border-radius:12px;padding:8px 12px;margin-top:10px}.rp-an ul{margin:4px 0;padding-inline-start:18px}.rp-an li{margin:3px 0;font-size:13.5px}.rp-an .t{font-weight:800;color:var(--navy);font-size:13.5px}' +
    '.rp-tag{display:inline-block;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:800;margin-inline-start:6px;vertical-align:middle}.rp-sum{border:2px solid #c9d8f2;background:#fbfdff}.rp-tm{border:2px solid #d5cdf7;background:#fbfaff}.rp-prev{font-size:13px;color:var(--mute);margin:-4px 0 12px}';
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

  h += dayHrHtml(rep);
  // ── حصص النهار: كل حصة وحدها + التحليل تاعها
  rep.charts = [];
  if (rep.tr.length) {
    rep.tr.forEach(function (e, i) {
      var Z = exZones(e, rep), tot = Z ? Z.sec.reduce(function (a, b) { return a + b; }, 0) || 1 : 1, en = energy(e, rep), an = sessAnalysis(e, rep);
      h += '<div class="rp-sec">🏊 ' + sessTitle(e, i, rep) + ' <span class="rp-tag" style="background:' + an.kc[0] + ';color:' + an.kc[1] + '">' + an.kind + '</span></div><div class="rp-c rp-big" style="margin-bottom:12px">' +
        '<div class="rp-chips"><span>⏱ <b>' + (e.min || '—') + '</b> min</span><span>♥ ' + A('متوسط', 'moy.') + ' <b>' + (e.hrAvg || '—') + '</b></span><span>▲ max <b>' + (e.hrMax || '—') + '</b></span>' + (e.load != null ? '<span>🔥 ' + A('الحمل', 'charge') + ' <b>' + e.load + '</b></span>' : '') + (e.kcal ? '<span>⚡ <b>' + e.kcal + '</b> kcal</span>' : '') + '</div>';
      if (Z) h += '<div class="rp-z">' + Z.sec.map(function (s, k) { return '<i title="Z' + (k + 1) + '" style="width:' + (s / tot * 100) + '%;background:' + ZC[k] + '"></i>'; }).join('') + '</div><div class="rp-zl">' + Z.sec.map(function (s, k) { return '<span><b style="color:' + ZC[k] + '">■</b> Z' + (k + 1) + ' ' + Math.round(s / tot * 100) + '% · ' + fmtMS(s) + '</span>'; }).join('') + '</div>';
      if (e.hr && e.hr.length) {
        h += '<div class="small muted" style="margin-top:10px">' + A('منحنى النبض (bpm)', 'Fréquence cardiaque (bpm)') + '</div><div class="rp-ch"><canvas id="rp-hr-' + i + '"></canvas></div>';
        if (en) h += '<div class="small muted" style="margin-top:8px">' + A('مصادر الطاقة', 'Sources d’énergie') + ' (' + (en.perMin ? 'kcal/min' : A('نسبي', 'relatif')) + ') — <b style="color:#F26B21">■ ' + A('سكريات', 'Glucides') + ' ' + en.pc.c + '%</b> · <b style="color:#E0B020">■ ' + A('دهون', 'Lipides') + ' ' + en.pc.f + '%</b> · ' + A('بروتين', 'Protéines') + ' ' + en.pc.p + '%' + (en.polar ? '' : ' <span class="chip warn" style="font-size:11px">' + A('تقديري', 'estimation') + '</span>') + '</div><div class="rp-ch s"><canvas id="rp-en-' + i + '"></canvas></div>';
        rep.charts.push({ i: i, e: e, Z: Z, en: en });
      } else h += '<div class="small muted" style="margin-top:8px">⏳ ' + A('المنحنى يجي مع الجلب الجاي (🔄 جيب دوك).', 'Courbe disponible à la prochaine synchro.') + '</div>';
      h += '<div class="rp-an"><div class="t">🔎 ' + A('تحليل الحصة', 'Analyse de la séance') + '</div><ul>' + an.lines.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div>';
    });
    // ── ملخص اليوم (واحد للحصص كاملين)
    var sm = daySum(rep);
    h += '<div class="rp-sec">📊 ' + A('ملخص اليوم', 'Bilan du jour') + (rep.tr.length > 1 ? ' (' + rep.tr.length + ' ' + A('حصص', 'séances') + ')' : '') + '</div><div class="rp-c rp-sum" style="margin-bottom:12px">' + sm.chips;
    if (sm.zsec) { var zt = sm.zsec.reduce(function (a, b) { return a + b; }, 0) || 1; h += '<div class="rp-z">' + sm.zsec.map(function (s, k) { return '<i style="width:' + (s / zt * 100) + '%;background:' + ZC[k] + '"></i>'; }).join('') + '</div><div class="rp-zl">' + sm.zsec.map(function (s, k) { return '<span><b style="color:' + ZC[k] + '">■</b> Z' + (k + 1) + ' ' + Math.round(s / zt * 100) + '% · ' + fmtMS(s) + '</span>'; }).join('') + '</div>'; }
    h += '<ul style="margin:8px 0 0;padding-inline-start:18px">' + sm.lines.map(function (x) { return '<li style="margin:4px 0">' + x + '</li>'; }).join('') + '</ul></div>';
  } else if (rep.isToday) {
    // ── قبل الحصة: واش نديرو اليوم (مرة وحدة)
    var tiles = {
      green: [['#E1F5EE', '#085041', '✅ ' + A('حصة عادية', 'Séance normale'), A('حسب البرنامج', 'selon le programme')], ['#E6F1FB', '#0C447C', '🎯 Z3–Z4', zTxt(rep, 3, 4) + ' ' + A('مسموح', 'permis')]],
      yellow: [['#E6F1FB', '#0C447C', '⬇️ ' + A('الحجم −20 لـ 30%', 'Volume −20 à 30 %'), A('بلا تكرارات قصوى', 'pas de max')], ['#E1F5EE', '#085041', '🎯 Z1–Z2', zTxt(rep, 1, 2) + ' · ' + A('تقنية', 'technique')]],
      red: [['#FCEBEB', '#791F1F', '🛌 ' + A('استرجاع', 'Récupération'), A('30–45 د خفيف ولا راحة', '30–45 min facile ou repos')], ['#E1F5EE', '#085041', '🎯 Z1', zTxt(rep, 1, 1)]],
      none: [['#eef2f8', '#3d5078', '📝 ' + A('دخّل الليل', 'Saisir la nuit'), A('Polar ولا باليد', 'Polar ou manuel')]]
    }[L].concat([['#EEEDFE', '#3C3489', '🛏 ' + A('يرقد قبل', 'Au lit avant') + ' ' + hhmm(6.5 - need - 0.25), A('ماء + ماكلة بعد الحصة', 'eau + repas après')]]);
    h += '<div class="rp-sec">✅ ' + A('واش نديرو اليوم', 'Que faire aujourd’hui') + '</div><div class="rp-do" style="margin-bottom:8px">' + tiles.map(function (t) { return '<div style="background:' + t[0] + ';color:' + t[1] + '"><b>' + t[2] + '</b><small>' + t[3] + '</small></div>'; }).join('') + '</div>' +
      '<div class="rp-c" style="margin-bottom:10px"><ul style="margin:0;padding-inline-start:18px">' + todayTodo(rep).map(function (x) { return '<li style="margin:4px 0">' + x + '</li>'; }).join('') + '</ul></div>' +
      '<div class="info" style="margin-bottom:10px">⏳ ' + A('حصة اليوم مازالت ما تجابتش من Polar. بعد الحصة اضغط <b>🔄 جيب دوك</b>: يخرج تحليل كل حصة + ملخص اليوم + واش نديرو غدوة.', 'La séance du jour n’est pas encore arrivée de Polar. Après la séance, appuyez sur <b>🔄 Synchroniser</b> : analyse de chaque séance + bilan du jour + plan de demain.') + '</div>';
  } else {
    h += '<div class="rp-sec">😴 ' + A('نهار بلا حصة تدريب', 'Journée sans séance') + '</div><div class="info" style="margin-bottom:10px">' + A('ما كانتش حصة تدريب مسجلة في Polar هذا النهار (راحة).', 'Aucune séance enregistrée dans Polar ce jour-là (repos).') + '</div>';
  }
  // آخر حصة قبل هذا النهار (سطر صغير برك، ما تتخلطش)
  if (rep.prev) h += '<div class="rp-prev">↩️ ' + A('الحصة اللي قبل: ', 'Séance précédente : ') + rep.prev.ex.map(function (e) { return dayName(rep.prev.date) + ' ' + fmtDate(rep.prev.date) + ' · ' + esc(e.start) + ' · <span class="num">' + e.min + '</span> min' + (e.load != null ? ' · ' + A('الحمل', 'charge') + ' <span class="num">' + e.load + '</span>' : ''); }).join(' / ') + '</div>';
  if (rep.act.length) h += '<div class="rp-prev">🚶 ' + A('نشاط يومي من الـ Loop (لعب، جري، مشي): ', 'Activité quotidienne Loop (jeu, course, marche) : ') + rep.act.map(function (e) { return esc(e.start) + ' (' + e.min + ' min, ♥' + (e.hrAvg || '—') + ')'; }).join(' · ') + '</div>';

  // ── بعد الحصص (ولا نهار فات): الاسترجاع الليلة + غدوة
  if (rep.after) {
    h += recoveryTonight(rep, rep.tr.length ? daySum(rep) : null);
    var tm = tomorrowPlan(rep);
    h += '<div class="rp-sec">📅 ' + A('غدوة واش نديرو', 'Demain : que faire') + ' — ' + dayName(tm.date) + ' ' + fmtDate(tm.date) + '</div><div class="rp-c rp-tm" style="margin-bottom:12px"><div style="font-weight:800;font-size:16px;margin-bottom:8px">' + tm.title + '</div>' +
      '<div class="rp-do" style="margin-bottom:8px">' + tm.tiles.map(function (t) { return '<div style="background:' + t[0] + ';color:' + t[1] + '"><b>' + t[2] + '</b><small>' + t[3] + '</small></div>'; }).join('') + '</div>' +
      '<ul style="margin:6px 0 0;padding-inline-start:18px">' + tm.lines.map(function (x) { return '<li style="margin:4px 0">' + x + '</li>'; }).join('') + '</ul></div>';
  }

  // ── الاتجاهات: الحمل 7 أيام + HRV + النوم
  var L7 = []; for (var k = 6; k >= 0; k--) { var dt = addDays(rep.date, -k), dd = daysOf(rep.s.id).filter(function (x) { return x.date === dt; })[0], t = 0, a = 0; (dd && dd.ex || []).forEach(function (e) { if (isTraining(e)) t += e.load || 0; else a += e.load || 0; }); L7.push({ d: dt, t: t, a: a }); }
  var mx = Math.max.apply(null, L7.map(function (x) { return x.t + x.a; })) || 1, K = rep.cat ? CLC[rep.cat] : null;
  h += '<div class="rp-sec">📈 ' + A('الاتجاهات', 'Tendances') + '</div><div class="rp-g2"><div class="rp-c"><div class="l">📊 ' + A('الحمل في 7 أيام', 'Charge sur 7 jours') + '</div><div class="rp-lb" style="margin-top:8px">' + L7.map(function (x) { return '<div><span style="height:' + (x.a / mx * 64) + 'px;background:#9FE1CB"></span><span style="height:' + (x.t / mx * 64) + 'px;background:#534AB7"></span><em>' + x.d.slice(8) + '</em></div>'; }).join('') + '</div>' +
    '<div class="n"><b style="color:#534AB7">■</b> ' + A('تدريب', 'entraînement') + ' <b class="num">' + Math.round(rep.w7) + '</b> · <b style="color:#1D9E75">■</b> ' + A('نشاط يومي', 'activité') + ' <b class="num">' + Math.round(rep.a7) + '</b></div>' +
    (K ? '<div style="margin-top:8px"><span class="chip ' + K.c + '">' + K.ic + ' Polar : ' + Tv(K.t) + '</span>' + (C.num(rep.cl.clr) != null ? ' <span class="small muted">' + A('النسبة', 'ratio') + ' <b class="num">' + R(C.num(rep.cl.clr), 2) + '</b></span>' : '') + '</div>' : '') + '</div>' +
    '<div class="rp-c"><div class="l">📈 ' + A('HRV ونبض الراحة (14 يوم)', 'VFC et FC repos (14 j)') + '</div><div class="rp-ch s"><canvas id="rp-tr1"></canvas></div></div></div>';
  h += '<div class="rp-c" style="margin-bottom:12px"><div class="l">🌙 ' + A('النوم والحمل (14 يوم)', 'Sommeil et charge (14 j)') + '</div><div class="rp-ch s"><canvas id="rp-tr2"></canvas></div></div>';
  return h;
}
function dayHrHtml(rep) {
  var c = rep.d.chr; if (!c || c.length < 8) return '';
  var v = []; for (var i = 1; i < c.length; i += 2) v.push(c[i]);
  var mn = Math.min.apply(null, v), mx = Math.max.apply(null, v), av = Math.round(v.reduce(function (a, b) { return a + b; }, 0) / v.length);
  var day = []; for (var j = 0; j < c.length; j += 2) if (c[j] >= 8 * 60 && c[j] <= 21 * 60) day.push(c[j + 1]);
  var dmn = day.length ? Math.min.apply(null, day) : null;
  return '<div class="rp-c" style="margin-bottom:12px"><div class="l">' + T('dayHrT') + '</div><div class="rp-chips"><span>▼ min <b>' + mn + '</b></span><span>' + A('المتوسط', 'moy.') + ' <b>' + av + '</b></span><span>▲ max <b>' + mx + '</b></span>' + (dmn ? '<span>' + A('أقل نبض في النهار', 'min en journée') + ' <b>' + dmn + '</b></span>' : '') + '<span class="muted">' + A('قراءة كل 5 د · بلا الحصص', 'mesure / 5 min · hors séances') + '</span></div><div class="rp-ch s"><canvas id="rp-chr"></canvas></div></div>';
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
  if (rep.d.chr && rep.d.chr.length >= 8) {
    var cx = [], cy = []; for (var ci = 0; ci < rep.d.chr.length; ci += 2) { cx.push(hhmm(rep.d.chr[ci] / 60)); cy.push(rep.d.chr[ci + 1]); }
    var oc = o0(); oc.scales = { x: { ticks: { maxTicksLimit: 8, maxRotation: 0 }, grid: { display: false } }, y: { suggestedMin: 50 } };
    mk('rp-chr', { type: 'line', data: { labels: cx, datasets: [{ data: cy, borderColor: '#E24B4A', borderWidth: 1.8, pointRadius: 0, tension: .25, spanGaps: true }] }, options: oc });
  }
  var all = daysOf(rep.s.id).filter(function (x) { return x.date <= rep.date; }).slice(-14), lab = all.map(function (x) { return x.date.slice(8) + '/' + x.date.slice(5, 7); });
  var base = all.map(function (x) { var r = C.readiness(daysOf(rep.s.id), x.date); return r && r.hrvBase ? Math.round(r.hrvBase) : null; });
  var o = chartBase(); o.plugins.legend = { position: 'bottom', labels: { boxWidth: 10 } }; o.spanGaps = true; o.scales = { y: { title: { display: true, text: 'ms' } }, y2: { position: 'right', grid: { display: false }, title: { display: true, text: 'bpm' } } };
  mk('rp-tr1', { type: 'line', data: { labels: lab, datasets: [{ label: 'HRV', data: all.map(function (x) { return C.num(x.hrv); }), borderColor: '#378ADD', backgroundColor: '#378ADD', borderWidth: 2.5 }, { label: A('المعدل', 'Réf.'), data: base, borderColor: '#9aa9bb', borderDash: [5, 4], pointRadius: 0 }, { label: A('نبض الراحة', 'FC repos'), data: all.map(function (x) { return C.num(x.rhr); }), borderColor: '#E24B4A', backgroundColor: '#E24B4A', yAxisID: 'y2' }] }, options: o });
  var o3 = chartBase(); o3.plugins.legend = { position: 'bottom', labels: { boxWidth: 10 } }; o3.scales = { y: { min: 0, title: { display: true, text: 'h' } }, y2: { position: 'right', min: 0, grid: { display: false } } };
  mk('rp-tr2', { type: 'bar', data: { labels: lab, datasets: [{ type: 'bar', label: A('النوم (سا)', 'Sommeil (h)'), data: all.map(function (x) { return C.num(x.sleepH); }), backgroundColor: all.map(function (x) { var s = C.num(x.sleepH); return s == null ? '#ccc' : s >= rep.need ? '#5DCAA5' : s >= rep.need - 1 ? '#FAC775' : '#F09595'; }), borderRadius: 4 },
    { type: 'line', label: 'Cardio load', data: all.map(function (x) { var t = 0, n = 0; (x.ex || []).forEach(function (e) { if (isTraining(e) && e.load != null) { t += e.load; n++; } }); return n ? t : C.num(x.cl); }), borderColor: '#534AB7', backgroundColor: '#534AB7', yAxisID: 'y2', spanGaps: true }] }, options: o3 });
}

/* ---------- 🔎 تحليل الحصص + ملخص اليوم + غدوة ---------- */
var DN_ = { ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'], fr: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'] };
function dayName(iso) { var d = new Date(iso + 'T12:00:00'); return isNaN(d) ? '' : DN_[LANG === 'fr' ? 'fr' : 'ar'][d.getDay()]; }
function sessTitle(e, i, rep) { return (rep.tr.length > 1 ? A('الحصة ', 'Séance ') + (i + 1) + ' · ' : A('حصة التدريب · ', 'Séance · ')) + dayName(rep.date) + ' ' + fmtDate(rep.date) + ' · ' + esc(e.start || ''); }
function hrMaxRef(rep) { if (rep.zones) return rep.zones[4].hi; var mx = 0; daysOf(rep.s.id).forEach(function (x) { (x.ex || []).forEach(function (e) { if (e.hrMax > mx) mx = e.hrMax; }); }); return mx || null; }
var LVL_IC = { green: '🟢', yellow: '🟡', red: '🔴', none: '⚪' };
// أرقام حصة وحدة
function sessStats(e, rep) {
  var Z = exZones(e, rep), tot = Z ? Z.sec.reduce(function (a, b) { return a + b; }, 0) : 0;
  var pct = Z && tot ? Z.sec.map(function (s) { return Math.round(s / tot * 100); }) : null;
  var hi = pct ? pct[3] + pct[4] : 0, mid = pct ? pct[2] : 0, low = pct ? pct[0] + pct[1] : 0, min = e.min || 0;
  return { Z: Z, tot: tot, pct: pct, hi: hi, mid: mid, low: low, hiSec: Z ? Z.sec[3] + Z.sec[4] : 0, min: min, en: energy(e, rep),
    hard: min > 60 || hi >= 20 || (e.load || 0) >= 80, easy: min < 45 && hi < 10 && (e.load || 0) < 50 };
}
// نوع الحصة
function sessKind(st) {
  if (!st.pct) return st.min >= 60 ? ['long', A('هوائية طويلة', 'Aérobie longue')] : ['aer', A('هوائية', 'Aérobie')];
  if (st.hi >= 20) return ['int', A('شدة (عتبة / سرعة)', 'Intense (seuil / vitesse)')];
  if (st.mid >= 30) return ['tempo', A('هوائية متوسطة (Tempo)', 'Aérobie modérée (tempo)')];
  if (st.hi >= 8) return ['mix', A('هوائية + فترات قوية', 'Aérobie + passages intenses')];
  if (st.min >= 60) return ['long', A('هوائية طويلة (تحمّل)', 'Aérobie longue (endurance)')];
  if (st.low >= 85 && st.min < 50) return ['rec', A('استرجاع / تقنية', 'Récupération / technique')];
  return ['aer', A('هوائية', 'Aérobie')];
}
var KIND_X = {
  int: ['تحسّن السرعة والعتبة. الجسم يحتاج 24–48 سا باش يسترجع منها.', 'Développe vitesse et seuil ; 24–48 h de récupération nécessaires.'],
  tempo: ['تحسّن العتبة الهوائية. متعبة أكثر من السباحة الهوائية العادية.', 'Travaille le seuil aérobie ; plus coûteuse qu’une nage aérobie simple.'],
  mix: ['قاعدة هوائية مع شوية سلاسل قوية: حصة كاملة ومتوازنة.', 'Base aérobie avec quelques séries intenses : séance complète.'],
  long: ['تبني القاعدة الهوائية (التحمّل). الطول هو اللي يتعب، ماشي الشدة.', 'Construit la base aérobie (endurance) ; c’est la durée qui fatigue, pas l’intensité.'],
  rec: ['تساعد الجسم يسترجع ويخدم التقنية بلا ما يتعب.', 'Aide à récupérer et à travailler la technique sans fatiguer.'],
  aer: ['هوائية عادية: تحافظ على المستوى.', 'Aérobie classique : entretient le niveau.']
};
var KIND_C = { int: ['#FCEBEB', '#791F1F'], tempo: ['#FAEEDA', '#633806'], mix: ['#FFF4DC', '#6b4a00'], long: ['#E6F1FB', '#0C447C'], rec: ['#E1F5EE', '#085041'], aer: ['#EEF2F8', '#3d5078'] };
// هل الحمل قدّ حالة الصباح؟
function fitMorning(rep, min, hi, hiSec, load, hard, easy, who) {
  var L = rep.lvl, ic = LVL_IC[L], why = [];
  if (L === 'red') {
    if (min > 50) why.push(A('أطول (' + min + ' د بدل 30–45)', 'plus longue (' + min + ' min au lieu de 30–45)'));
    if (hi >= 3) why.push(A(hi + '% في Z4–Z5 (' + fmtMS(hiSec) + ')', hi + ' % en Z4–Z5 (' + fmtMS(hiSec) + ')'));
    if (!why.length && !easy && load >= 50) why.push(A('الحمل ' + load, 'charge ' + load));
    return why.length ? '⚠️ ' + A('<b>الصباح كان ' + ic + '</b> (لازم استرجاع 30–45 د في Z1)، و' + who + ' أقوى من اللازم: ' + why.join('، ') + '.', '<b>Le matin était ' + ic + '</b> (récupération 30–45 min en Z1 prévue) ; ' + who + ' a été plus dure : ' + why.join(', ') + '.')
      : '✅ ' + A('قدّ حالة الصباح (' + ic + ' استرجاع).', 'Conforme à l’état du matin (' + ic + ' récupération).');
  }
  if (L === 'yellow') {
    if (hi >= 10) why.push(A(hi + '% في Z4–Z5', hi + ' % en Z4–Z5'));
    if (min > 75) why.push(A(min + ' دقيقة', min + ' min'));
    return why.length ? '⚠️ ' + A('<b>الصباح كان ' + ic + '</b> (نقّص الشدة والحجم)، بصح ' + who + ': ' + why.join('، ') + '.', '<b>Le matin était ' + ic + '</b> (réduire intensité et volume), mais : ' + why.join(', ') + '.')
      : '✅ ' + A('قدّ حالة الصباح (' + ic + ' شدة منقوصة).', 'Conforme à l’état du matin (' + ic + ').');
  }
  if (L === 'green') return '✅ ' + A('مناسبة: الصباح كان ' + ic + ' (جاهز).', 'Adaptée : le matin était ' + ic + ' (prêt).');
  return '';
}
function sessAnalysis(e, rep) {
  var st = sessStats(e, rep), k = sessKind(st), out = [], mxr = hrMaxRef(rep);
  out.push('<b>' + A('النوع: ', 'Type : ') + k[1] + '</b> — ' + Tv(KIND_X[k[0]]));
  if (st.pct) {
    var dom = st.pct.indexOf(Math.max.apply(null, st.pct));
    out.push(A('أغلب الوقت في <b>Z' + (dom + 1) + '</b> (' + st.pct[dom] + '%)', 'Surtout en <b>Z' + (dom + 1) + '</b> (' + st.pct[dom] + ' %)') + ' · Z1–Z2 <b class="num">' + st.low + '%</b> · Z3 <b class="num">' + st.mid + '%</b> · Z4–Z5 <b class="num">' + st.hi + '%</b>' + (st.hiSec ? ' (' + fmtMS(st.hiSec) + ')' : ''));
  }
  if (e.hrAvg && mxr) out.push(A('النبض المتوسط <b class="num">' + e.hrAvg + '</b> = <b class="num">' + Math.round(e.hrAvg / mxr * 100) + '%</b> من الأقصى (' + mxr + ')، والأعلى <b class="num">' + (e.hrMax || '—') + '</b>.', 'FC moyenne <b class="num">' + e.hrAvg + '</b> = <b class="num">' + Math.round(e.hrAvg / mxr * 100) + ' %</b> du max (' + mxr + '), pic <b class="num">' + (e.hrMax || '—') + '</b>.'));
  var f = fitMorning(rep, st.min, st.hi, st.hiSec, e.load || 0, st.hard, st.easy, A('الحصة كانت', 'la séance')); if (f) out.push(f);
  if (st.en) { var pc = st.en.pc; out.push(A('⚡ الطاقة: سكريات <b class="num">' + pc.c + '%</b>' + (e.kcal ? ' (≈ ' + Math.round(e.kcal * pc.c / 100) + ' kcal)' : '') + ' · دهون <b class="num">' + pc.f + '%</b>', '⚡ Énergie : glucides <b class="num">' + pc.c + ' %</b>' + (e.kcal ? ' (≈ ' + Math.round(e.kcal * pc.c / 100) + ' kcal)' : '') + ' · lipides <b class="num">' + pc.f + ' %</b>') + (st.hard ? A(' ← لازم يعوّض السكريات بعدها.', ' ← recharger en glucides après.') : '') + (st.en.polar ? '' : ' <span class="small muted">(' + A('تقديري', 'estimation') + ')</span>')); }
  return { lines: out, kind: k[1], k: k[0], kc: KIND_C[k[0]], st: st };
}
// ملخص اليوم: الحصص كاملين مع بعض
function daySum(rep) {
  if (rep._sum) return rep._sum;
  var T = rep.tr, min = 0, load = 0, kcal = 0, nl = 0, zsec = null, carb = 0, fat = 0, hiSec = 0, tot = 0, hardN = 0, kinds = [];
  T.forEach(function (e) {
    var st = sessStats(e, rep);
    min += st.min; if (e.load != null) { load += e.load; nl++; } if (e.kcal) kcal += e.kcal;
    if (st.Z) { zsec = zsec || [0, 0, 0, 0, 0]; st.Z.sec.forEach(function (s, k) { zsec[k] += s; }); hiSec += st.hiSec; tot += st.tot; }
    if (st.en && e.kcal) { carb += e.kcal * st.en.pc.c / 100; fat += e.kcal * st.en.pc.f / 100; }
    if (st.hard) hardN++; kinds.push(sessKind(st)[1]);
  });
  var hi = tot ? Math.round(hiSec / tot * 100) : 0;
  var hard = min > 75 || hi >= 15 || load >= 90 || hardN > 0, easy = min < 45 && hi < 5 && load < 50;
  var chips = '<div class="rp-chips">' + (T.length > 1 ? '<span>🏊 <b>' + T.length + '</b> ' + A('حصص', 'séances') + '</span>' : '') + '<span>⏱ <b>' + min + '</b> min</span>' + (nl ? '<span>🔥 ' + A('الحمل', 'charge') + ' <b>' + load + '</b></span>' : '') + (kcal ? '<span>⚡ <b>' + kcal + '</b> kcal</span>' : '') + (zsec ? '<span>🔴 Z4–Z5 <b>' + fmtMS(hiSec) + '</b></span>' : '') + '</div>';
  var lines = [];
  lines.push(A('<b>النهار:</b> ', '<b>Journée :</b> ') + (hard ? A('حمل <b>ثقيل</b>', 'charge <b>élevée</b>') : easy ? A('حمل <b>خفيف</b>', 'charge <b>légère</b>') : A('حمل <b>متوسط</b>', 'charge <b>modérée</b>')) + ' — ' + kinds.join(' + ') + (T.length > 1 ? A(' (' + T.length + ' حصص: الحمل يتجمع، الجسم يحتاج استرجاع أكثر)', ' (' + T.length + ' séances : la charge s’additionne)') : '') + '.');
  var f = fitMorning(rep, min, hi, hiSec, load, hard, easy, A('النهار كان', 'la journée')); if (f) lines.push(f);
  if (carb) lines.push(A('⚡ الطاقة في النهار: سكريات ≈ <b class="num">' + Math.round(carb) + '</b> kcal · دهون ≈ <b class="num">' + Math.round(fat) + '</b> kcal', '⚡ Énergie de la journée : glucides ≈ <b class="num">' + Math.round(carb) + '</b> kcal · lipides ≈ <b class="num">' + Math.round(fat) + '</b> kcal') + (hard ? A(' ← الليلة ماكلة فيها سكريات كافية (كسكسي، عجائن، أرز).', ' ← repas du soir riche en féculents.') : '.'));
  if (rep.act.length) lines.push(A('🚶 نشاط يومي من الـ Loop: ', '🚶 Activité quotidienne Loop : ') + rep.act.length + ' (' + rep.act.reduce(function (a, e) { return a + (e.min || 0); }, 0) + ' min) — ' + A('يزيد شوية على التعب.', 'ajoute un peu de fatigue.'));
  if (rep.n7) lines.push(A('📊 <b>7 أيام:</b> ', '📊 <b>7 jours :</b> ') + A('تدريب <b class="num">' + Math.round(rep.w7) + '</b> (' + rep.n7 + ' حصص)', 'entraînement <b class="num">' + Math.round(rep.w7) + '</b> (' + rep.n7 + ' séances)') + (rep.cat ? ' · Polar ' + CLC[rep.cat].ic + ' ' + Tv(CLC[rep.cat].t) : ''));
  return (rep._sum = { min: min, load: load, kcal: kcal, hi: hi, hiSec: hiSec, zsec: zsec, hard: hard, easy: easy, chips: chips, lines: lines, n: T.length });
}
// 📅 غدوة واش نديرو
function tomorrowPlan(rep) {
  var sm = rep.tr.length ? daySum(rep) : { hard: false, easy: true, n: 0 }, L = rep.lvl, ex = rep.cat === 'excess', need = rep.need, bed = hhmm(6.5 - need - 0.25), why = [], lv;
  if (rep.ill) lv = 'rest';
  else if ((L === 'red' && !sm.easy) || (ex && sm.hard)) lv = 'red';
  else if (L === 'red' || ex || (L === 'yellow' && sm.hard)) lv = 'yellow';
  else if (sm.hard) lv = 'aero';
  else lv = 'green';
  if (L !== 'none') why.push(A('الصباح كان ' + LVL_IC[L], 'matin ' + LVL_IC[L]));
  why.push(sm.n ? (sm.hard ? A('اليوم كان ثقيل', 'journée chargée') : sm.easy ? A('اليوم كان خفيف', 'journée légère') : A('اليوم كان متوسط', 'journée modérée')) : A('اليوم راحة', 'repos aujourd’hui'));
  if (rep.cat) why.push('Polar ' + CLC[rep.cat].ic + ' ' + Tv(CLC[rep.cat].t));
  var P = {
    rest: ['🩺 ' + A('راحة كاملة، وإذا عندو أعراض (سخانة، حلق، عياء) يشوف طبيب', 'Repos complet ; consulter si symptômes'), [['#FCEBEB', '#791F1F', '🛌 ' + A('راحة', 'Repos'), A('بلا تدريب', 'pas d’entraînement')]]],
    red: ['🔴 ' + A('راحة ولا استرجاع خفيف جداً', 'Repos ou récupération très légère'), [['#FCEBEB', '#791F1F', '🛌 ' + A('استرجاع 30–40 د', 'Récup 30–40 min'), A('ولا راحة', 'ou repos')], ['#E1F5EE', '#085041', '🎯 Z1', zTxt(rep, 1, 1) || A('خفيف جداً', 'très facile')]]],
    yellow: ['🟡 ' + A('حصة خفيفة: تقنية + هوائي سهل', 'Séance légère : technique + aérobie facile'), [['#E6F1FB', '#0C447C', '⬇️ ' + A('الحجم −30%', 'Volume −30 %'), A('بلا سرعة ولا سلاسل قوية', 'sans vitesse ni séries dures')], ['#E1F5EE', '#085041', '🎯 Z1–Z2', zTxt(rep, 1, 2) || A('سهل', 'facile')]]],
    aero: ['🟢 ' + A('حصة هوائية عادية، بلا شدة', 'Séance aérobie normale, sans intensité'), [['#E6F1FB', '#0C447C', '🏊 ' + A('هوائي Z2', 'Aérobie Z2'), A('ما نعاودوش الشدة جوج أيام متتابعين', 'pas d’intensité deux jours de suite')], ['#E1F5EE', '#085041', '🎯 Z2', zTxt(rep, 2, 2) || '']]],
    green: ['🟢 ' + A('حصة عادية حسب البرنامج', 'Séance normale selon le programme'), [['#E1F5EE', '#085041', '✅ ' + A('حسب البرنامج', 'Programme'), A('الشدة مسموحة', 'intensité permise')], ['#E6F1FB', '#0C447C', '🎯 Z3–Z4', zTxt(rep, 3, 4) || '']]]
  }[lv];
  var tiles = P[1].concat([['#EEEDFE', '#3C3489', '🛏 ' + A('الليلة يرقد قبل', 'Ce soir au lit avant') + ' ' + bed, need + '–' + (need + 2) + A(' سوايع نوم', ' h de sommeil')]]);
  var lines = ['<b>' + A('علاش: ', 'Pourquoi : ') + '</b>' + why.join(' · ') + '.'];
  if (lv === 'red' || lv === 'rest') lines.push(A('📉 خفّف الأيام الجاية (2–3 أيام) باش يرجع الحمل قريب من العادة، من غير ما توقف التدريب.', '📉 Alléger 2–3 jours pour revenir vers la charge habituelle, sans arrêter.'));
  if (lv === 'aero') lines.push(A('اليوم كان ثقيل: غدوة نخدمو الهوائي برك، والشدة نرجعولها بعد غدوة إذا التقرير طلع 🟢.', 'Journée dure : demain aérobie seulement ; l’intensité reprendra après-demain si le rapport est 🟢.'));
  lines.push(A('🔎 <b>يتأكد غدوة الصباح</b> بعد ما يتجابو داتا الليل: إذا رقد ≥ ' + need + ' سا وHRV رجع قريب من المعدل' + (rep.r && rep.r.hrvBase ? ' (' + n0(rep.r.hrvBase) + ' ms)' : '') + ' ← تقدر تطلع درجة. إذا HRV هبط أكثر ولا نبض الراحة طلع ← راحة.', '🔎 <b>À confirmer demain matin</b> avec les données de la nuit : sommeil ≥ ' + need + ' h et VFC proche de sa référence' + (rep.r && rep.r.hrvBase ? ' (' + n0(rep.r.hrvBase) + ' ms)' : '') + ' ← on peut monter d’un cran ; VFC encore plus basse ou FC de repos plus haute ← repos.'));
  lines.push(A('✍️ بعد الحصة اكتب كيفاش حسّ روحو (RPE من 0 لـ 10) في «إدخال اليوم».', '✍️ Après la séance, noter le ressenti (RPE 0–10) dans « Saisir la journée ».'));
  return { date: addDays(rep.date, 1), lv: lv, title: P[0], tiles: tiles, lines: lines };
}
// 🍽 الاسترجاع الليلة (حسب الحصص كاملين)
function recoveryTonight(rep, sm) {
  var h = '<div class="rp-sec">🍽 ' + A('الاسترجاع الليلة', 'Récupération ce soir') + '</div>';
  var need = rep.need, bed = hhmm(6.5 - need - 0.25), hard = sm && sm.hard, easy = !sm || sm.easy;
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
var PL = { ar: { t: 'Polar Flow', link: '🔗 ربط Polar', sync: '🔄 جيب دوك', unlink: 'إلغاء الربط', on: '✅ مربوط', off: 'مازال ما تربطش', last: 'آخر جلب', none: 'ما تجلب والو', wait: 'نجيب من Polar…', got: 'تحدّثو الأيام', noCfg: 'لازم تحط POLAR_CLIENT_ID و POLAR_CLIENT_SECRET في Apps Script', back: 'كي يكمّل الربط في الصفحة لي تحلّت، ارجع هنا واضغط «جيب دوك»', auth: 'الربط مع Polar ما بقاش صالح: عاود «ربط Polar»', auto: 'يتجاب وحدو كي تفتح الصفحة (ووقت ما تحب: 🔄 جيب دوك)', unconf: 'نلغيو الربط مع Polar ؟' },
           fr: { t: 'Polar Flow', link: '🔗 Connecter Polar', sync: '🔄 Synchroniser', unlink: 'Déconnecter', on: '✅ Connecté', off: 'Non connecté', last: 'Dernière synchro', none: 'jamais', wait: 'Synchronisation Polar…', got: 'jours mis à jour', noCfg: 'Ajoutez POLAR_CLIENT_ID et POLAR_CLIENT_SECRET dans Apps Script', back: 'Une fois la connexion terminée dans l’onglet ouvert, revenez et cliquez « Synchroniser »', auth: 'Connexion Polar expirée : reconnectez', auto: 'Synchro automatique à l’ouverture (ou à tout moment : 🔄)', unconf: 'Déconnecter Polar ?' } };
var PSYNC = {};
function PT(k) { return (PL[LANG === 'fr' ? 'fr' : 'ar'])[k]; }
function polarBind(s) {
  var box = $('#polar-bar'); if (!box || API.url() === 'demo') return;
  API.call('polarStatus').then(function (r) {
    if (!r || !r.ok) return;
    var L = (r.linked || {})[s.id];
    if (!L && !isAdmin()) return;
    // 🔄 جلب وحدو كي تفتح الصفحة (مرة وحدة في الجلسة، وإذا آخر جلب فات عليه 10 دقايق)
    if (L && can('polar') && !PSYNC[s.id] && (!L.last || Date.now() - new Date(L.last).getTime() > 10 * 60000)) {
      PSYNC[s.id] = 1; toast(PT('wait'));
      API.call('polarSync', { sid: s.id }).then(function (x) { if (x && x.ok) { toast('✅ ' + x.days + ' ' + PT('got')); if (x.days) load().then(render); else polarBind(s); } }).catch(function () {});
    }
    var when = L && L.last ? new Date(L.last).toLocaleString(LANG === 'fr' ? 'fr-FR' : 'ar-DZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : PT('none');
    box.innerHTML = '<div class="card" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px"><div class="ic">⌚</div><div class="sp"><b>' + PT('t') + ' · ' + (L ? PT('on') : PT('off')) + '</b>' +
      '<div class="small muted">' + (L ? PT('last') + ' : <span class="num">' + esc(when) + '</span> · ' + PT('auto') : (r.cfg ? '' : PT('noCfg'))) + '</div></div>' +
      (L && can('polar') ? '<button class="btn pri sm" id="pl-sync">' + PT('sync') + '</button>' : '') +
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
  var h = '<div class="row" style="margin-bottom:12px"><h2 class="sp" style="margin:0">' + T('readyT') + (last ? ' <span class="small muted">' + fmtDate(last.date) + '</span>' : '') + '</h2>' + (can('day') ? '<button class="btn pri" data-new="day">＋ ' + T('addDay') + '</button>' : '') + '</div>';
  h += '<div id="polar-bar"></div>';
  if (!can('rep')) return h + '<div class="card empty">🔒 ' + A('التقارير مسكّرة لهذا الحساب. تقدر تدخّل البيانات برك.', 'Rapports non autorisés pour ce compte : saisie uniquement.') + '</div>';
  h += '<div id="day-report" style="margin-bottom:14px"></div>';
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
  var h = '<div class="row" style="margin-bottom:12px"><h2 class="sp" style="margin:0">' + T('best') + '</h2>' + (can('vo2') ? '<button class="btn pri" data-new="time">＋ ' + T('addTime') + '</button>' : '') + '</div><div class="card">';
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


/* ======================= page unifiée : catalogue · rapport · choix · détail ======================= */
var GROUPS = ['AER', 'LAC', 'ALA', 'END', 'MAX', 'POW', 'FLX', 'HR'];
var SYS_IC = { AER: '🫁', LAC: '🔥', ALA: '⚡', END: '🏋', MAX: '💪', POW: '🚀', FLX: '🤸' };
var TE_V = { step: 2, '400': 1.5, css: 2, leger: 4, rest: 5 }; // erreur typique (%) des tests VO2
function canBt() { return can('bt'); }
function rdot(s, date) { var r = s && date ? readyOf(s, date) : null; var c = r ? { green: 'var(--ok)', yellow: 'var(--warn)', red: 'var(--bad)' }[r.level] : '#c9d5ea'; return '<span title="' + (r ? esc(T(r.level)) : '') + '" style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + c + ';vertical-align:middle;margin-inline-end:4px"></span>'; }
function bdi(x) { return x ? String(x).split(' · ').map(function (e) { return '<bdi>' + esc(e) + '</bdi>'; }).join(' · ') : ''; }
// valeur clé d'un test VO2 (pour comparer le nageur avec lui-même)
function vo2Key(t, s) {
  var r = computeTest(t, s);
  if (t.type === 'step') {
    var st = r.step; if (!st || st.error) return null;
    var pk = r.hrmaxW ? ' · ' + T('peak') + ' ' + n0(r.hrmaxW) : '';
    if (st.vAtHRmax) return { v: 100 / st.vAtHRmax, mk: 'hrmax', disp: F(100 / st.vAtHRmax, 1), extra: T('metStep') + ' /100' + pk };
    return st.vLast ? { v: 100 / st.vLast, mk: 'last', disp: F(100 / st.vLast, 1), extra: T('metLast') + ' /100' + pk } : null;
  }
  if (t.type === '400') return r.m400 ? { v: r.m400.time, disp: F(r.m400.time, 2), extra: paceStr(r.m400.pace) + ' /100' + (r.hrr != null ? ' · HRR ' + n0(r.hrr) : '') } : null;
  if (t.type === 'css') return r.css ? { v: r.css.pace, disp: F(r.css.pace, 1) + ' /100', extra: 'D′ ' + R(r.css.dprime, 0) + ' m' } : null;
  if (t.type === 'leger') {
    if (r.leger) return { v: r.leger.vo2, mk: 'vo2', disp: R(r.leger.vo2, 1), extra: 'VO2max · ' + T('stage') + ' ' + r.lastDone + ' · ' + r.leger.V + ' km/h' };
    return r.lastDone >= 1 ? { v: r.lastDone, mk: 'stage', disp: T('stage') + ' ' + r.lastDone, extra: '' } : null;
  }
  if (t.type === 'rest') return r.rest ? { v: r.rest.mean, disp: n1(r.rest.mean) + ' bpm', extra: r.rmssd ? 'RMSSD ' + n0(r.rmssd) + ' ms' : '' } : null;
  return null;
}
// tous les tests (VO2 + batterie + protocoles), chacun dans son groupe
function catalog(s) {
  var out = [], B = window.BTV, cat = B && s ? B.catOf(s) : null;
  if (can('vo2')) [['step', 'AER', 'low'], ['400', 'AER', 'low'], ['css', 'AER', 'low'], ['leger', 'AER', 'high'], ['rest', 'HR', 'low']].forEach(function (x) {
    out.push({ key: x[0], sys: x[1], better: x[2], icon: ICON[x[0]], name: T('T_' + x[0]), desc: T('D_' + x[0]) + (x[0] === 'leger' ? ' · ' + T('legerLand') : ''), time: x[0] !== 'leger' && x[0] !== 'rest', ok: true });
  });
  if (B && canBt()) B.tests(true).forEach(function (t) {
    var u = t.unit;
    out.push({ key: 'bt:' + t.id, sys: t.sys, better: t.better, bt: t, icon: t.proto ? '🧩' : SYS_IC[t.sys] || '🧪', name: Tv(t.name), desc: t.proto ? B.protoStr(t.proto) : '', proto: !!t.proto,
      time: u === 's' || u === '/100', ok: !cat || t.cats.indexOf(cat) >= 0, hide: t.id === 'css', archived: !!(t.proto && t.proto.active === false) });
  });
  return out;
}
function histOf(s, it) {
  if (it.bt) return window.BTV.history(s, it.bt.id).map(function (r) { return { date: r.rec.date, v: r.v, disp: r.disp, extra: r.extra, rec: r.rec, res: r }; });
  return DB.tests.filter(function (t) { return t.swimmerId === s.id && t.type === it.key; })
    .sort(function (a, b) { return (a.date || '').localeCompare(b.date || '') || (a.updated || '').localeCompare(b.updated || ''); })
    .map(function (t) { var k = vo2Key(t, s); return k ? Object.assign({ date: t.date, rec: t }, k) : null; }).filter(Boolean);
}
function vdOf(it, cur, prev) {
  if (!cur || !prev || !prev.v) return null;
  if (it.bt) return window.BTV.verdict(it.bt, cur.res, prev.res);
  if ((cur.mk || '') !== (prev.mk || '')) return { k: 'diff' };
  var ch = (cur.v - prev.v) / prev.v * 100, te = TE_V[it.key] || 3, mdc = 2.77 * te; if (it.better === 'low') ch = -ch;
  return { ch: ch, k: Math.abs(ch) >= mdc ? 'real' : Math.abs(ch) >= te ? 'likely' : 'noise', mdc: mdc };
}
function vChip(vd) {
  if (!vd) return '';
  if (vd.k === 'diff') return '<span class="chip">' + T('vDiff') + '</span>';
  var up = vd.ch >= 0, cls = vd.k === 'noise' ? '' : up ? 'ok' : 'bad', lab = T({ real: 'vReal', likely: 'vLikely', noise: 'vNoise' }[vd.k]);
  return '<span class="chip ' + cls + '" title="' + lab + '">' + (up ? '▲ ' : '▼ ') + R(Math.abs(vd.ch), 1) + '% · ' + lab + '</span>';
}
function pbIdx(hh, better) { var b = -1; hh.forEach(function (x, i) { if (b < 0 || (better === 'low' ? x.v <= hh[b].v : x.v >= hh[b].v)) b = i; }); return b; }

/* --- ❤️ النبض في الاختبار (Verity Sense لايف ولا حصة Polar مربوطة) --- */
// مناطق النبض: غير من مصدر حقيقي (ما نخترعوش). الترتيب: مناطق Polar تاع الحصة ← اختبار أقصى ← HRmax مكتوب في الملف ← مناطق Polar تاع آخر حصة
function swZones(s, rec) {
  var d = rec && rec.data || {}, mk2 = function (z) { return z.map(function (x, i) { return { z: i + 1, lo: Math.round(x.lo), hi: Math.round(x.hi) }; }); };
  if (d.hrZones && d.hrZones.length >= 5) { var z0 = mk2(d.hrZones); return { z: z0, src: 'polar', mx: z0[z0.length - 1].hi, lab: A('مناطق Polar تاع هاذ الحصة (كيما في Polar Flow)', 'Zones Polar de cette séance (comme dans Polar Flow)') }; }
  var P = profile(s);
  if (P.zones) return { z: P.zones, src: 'test', mx: P.hrmaxW || P.hrmaxL, lab: A('من النبض الأقصى المقاس في اختبار', 'D’après la FC max mesurée en test') + ' (' + Math.round(P.hrmaxW || P.hrmaxL) + ')' };
  var k = C.num(s.hrmaxKnown); if (k) return { z: C.hrZones(k, P.hrrest), src: 'file', mx: k, lab: A('من النبض الأقصى المكتوب في ملف السباح', 'D’après la FC max saisie dans la fiche') + ' (' + k + ')' };
  var lz = null; daysOf(s.id).forEach(function (x) { (x.ex || []).forEach(function (e) { if (e.zones && e.zones.length >= 5) lz = e.zones; }); });
  if (lz) { var z1 = mk2(lz.slice().sort(function (a, b) { return a.lo - b.lo; })); return { z: z1, src: 'polar', mx: z1[z1.length - 1].hi, lab: A('مناطق Polar (ملف السباح في Polar Flow)', 'Zones Polar (profil Polar Flow du nageur)') }; }
  return null;
}
function hrDurOf(rec, sm) {
  var d = rec.data || {}, k = C.num(d.hrDur) || (d.live && C.num(d.live.dur));
  if (k) return k;
  if (d.test && BT_DUR[d.test]) return BT_DUR[d.test][0];
  var mx = sm.length ? sm[sm.length - 1].t : 0; return mx > 100 ? mx - 75 : mx;
}
function hrStatsOf(rec, s) {
  if (!rec || !rec.data || !rec.data.samples || rec.data.samples.length < 10) return null;
  var d = rec.data, sm = unpack(d.samples), dur = hrDurOf(rec, sm), w = sm.filter(function (p) { return p.t >= 0 && p.t <= dur + 1; });
  if (w.length < 3) return null;
  var mean = function (a) { return a.length ? a.reduce(function (x, p) { return x + p.hr; }, 0) / a.length : null; };
  var avg = Math.round(mean(w)), peak = Math.max.apply(null, w.map(function (p) { return p.hr; }));
  // التغطية: شحال من الاختبار فيه نبض حقيقي
  var gap = 0, prev = 0, step = d.hrSrc === 'polar' ? 6 : 4; w.forEach(function (p) { if (p.t - prev > step) gap += p.t - prev; prev = p.t; }); if (dur - prev > step) gap += dur - prev;
  var cov = dur > 0 ? Math.max(0, Math.min(1, 1 - gap / dur)) : 0, good = cov >= 0.9;
  // الثبات: أول لحظة يوصل فيها لمتوسط النص الثاني −5
  var drift = null, plat = null, platHr = null, a1 = null, a2 = null;
  if (dur >= 300) {
    a1 = mean(w.filter(function (p) { return p.t < dur / 2; })); a2 = mean(w.filter(function (p) { return p.t >= dur / 2; }));
    if (a1 && a2) drift = (a2 - a1) / a1 * 100;
    var lvl = a2 - 5, f = w.find(function (p) { return p.hr >= lvl; }); if (f) { plat = f.t; platHr = Math.round(mean(w.filter(function (p) { return p.t >= f.t; }))); }
  }
  var endW = sm.filter(function (p) { return p.t >= dur - 10 && p.t <= dur + 5; }), hrEnd = endW.length ? Math.max.apply(null, endW.map(function (p) { return p.hr; })) : null;
  var r60 = sm.filter(function (p) { return Math.abs(p.t - (dur + 60)) <= 3; }), hr60 = r60.length ? Math.round(mean(r60)) : null;
  // الإيقاع من أوقات الطولات (لايف)
  var pace = null; if (d.splits && d.splits.length === 1 && d.splits[0].length >= 4) { var L = d.splits[0], m = L.reduce(function (a, b) { return a + b; }, 0) / L.length, sd = Math.sqrt(L.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / (L.length - 1)), h = Math.floor(L.length / 2);
    pace = { cv: sd / m * 100, h1: L.slice(0, h).reduce(function (a, b) { return a + b; }, 0) / h, h2: L.slice(L.length - h).reduce(function (a, b) { return a + b; }, 0) / h, n: L.length }; }
  var Z = swZones(s, rec), sec = [0, 0, 0, 0, 0];
  if (Z) { var lo = Z.z.map(function (x) { return x.lo; }); for (var i = 1; i < w.length; i++) { var dt = Math.min(step + 1, w[i].t - w[i - 1].t); if (dt > 0) sec[zIdx(w[i].hr, lo)] += dt; } }
  return { sm: sm, dur: dur, avg: avg, peak: peak, drift: drift, a1: a1, a2: a2, plat: plat, platHr: platHr, hrEnd: hrEnd, hr60: hr60, hrr: hrEnd && hr60 ? hrEnd - hr60 : null, gap: Math.round(gap), cov: cov, good: good, Z: Z, sec: sec, pace: pace,
    src: d.hrSrc || (d.live ? 'live' : ''), sensor: d.live && d.live.sensor || '', pex: d.polarEx || '', hrA: d.hrA, hrAuto: d.hrAuto, avg5: d.hrSrc === 'polar' && d.hrRate5 };
}
// وسم المصدر حدا كل رقم
function srcTag(k) { var m = { m: [A('مقاس', 'mesuré'), '#0e9f6e', '#e3f7ee'], c: [A('محسوب', 'calculé'), '#1d6bff', '#e8f0ff'], e: [A('مقدّر', 'estimé'), '#a36a00', '#fff4dc'] }[k]; return '<span class="srct" style="color:' + m[1] + ';background:' + m[2] + '">' + m[0] + '</span>'; }
function hrCardHtml(s, it, x, canLink) {
  var st = hrStatsOf(x.rec, s), h = '<div class="card" id="hr-card"><h3>❤️ ' + T('hrTest') + ' <span class="small muted">· ' + fmtDate(x.date) + ' · ' + esc(x.disp) + (st ? ' · ' + (st.src === 'polar' ? '⌚ Polar' : '⏱ ' + A('لايف', 'direct') + (st.sensor ? ' ' + esc(st.sensor) : '')) : '') + '</span></h3>';
  if (S.plk) return h + '<div id="plk"></div></div>';
  if (!st) {
    h += '<p class="muted" style="margin:4px 0 10px">' + A('هاذ النتيجة ما فيهاش نبض.', 'Pas de fréquence cardiaque pour ce résultat.') + '</p>';
    if (canLink) h += '<button type="button" class="btn pri" id="hr-link">⌚ ' + A('ربط حصة Polar (Verity Sense)', 'Lier une séance Polar (Verity Sense)') + '</button><div class="small muted" style="margin-top:6px">' + A('تختار الحصة تاع نهار الاختبار، وتحدد وقت البداية، والنبض يتحفظ مع النتيجة.', 'Choisissez la séance du jour du test et l’heure de départ : la FC est enregistrée avec le résultat.') + '</div>';
    else if (!it.bt) h += '<div class="small muted">' + A('للاختبار هذا: افتح النتيجة (اضغط على السطر) ← «⌚ Polar».', 'Pour ce test : ouvrez le résultat (clic sur la ligne) ← « ⌚ Polar ».') + '</div>';
    return h + '</div>';
  }
  rpCss();
  var k = function (l, v, tag, sub) { return '<div class="rp-c"><div class="l">' + l + ' ' + srcTag(tag) + '</div><div class="v">' + v + '</div>' + (sub ? '<div class="small muted">' + sub + '</div>' : '') + '</div>'; };
  var pct = st.Z && (st.Z.src === 'test' || st.Z.src === 'file') ? Math.round(st.avg / st.Z.mx * 100) + '% ' + A('من الأقصى المقاس', 'du max mesuré') : '';
  if (!st.good) h += '<div class="note" style="margin-bottom:10px">⚠️ ' + A('النبض يغطي <b>' + Math.round(st.cov * 100) + '%</b> برك من الاختبار (' + st.gap + ' ث بلا نبض). الأرقام المقاسة تبان، بصح الحسابات (الثبات، الانحراف، المناطق، العتبة) ما تتحسبش باش ما نغلطوش.', 'La FC ne couvre que <b>' + Math.round(st.cov * 100) + ' %</b> du test (' + st.gap + ' s sans FC). Seules les valeurs mesurées sont affichées ; les calculs sont désactivés.') + '</div>';
  h += '<div class="rp-k">' + k(A('متوسط النبض', 'FC moyenne'), st.avg + ' <small>bpm</small>', 'm', pct) + k(A('أعلى نبض', 'FC max'), st.peak + ' <small>bpm</small>', 'm', st.src === 'polar' && !st.hiRes ? '' : '') +
    (st.good && st.platHr ? k(A('النبض بعد الثبات', 'FC du plateau'), st.platHr + ' <small>bpm</small>', 'c', A('من ', 'dès ') + fmtMS(st.plat)) : '') +
    (st.hrr != null ? k(A('الاسترجاع 60 ث', 'Récup 60 s'), '−' + st.hrr, 'm', st.hrEnd + ' → ' + st.hr60) : '') + '</div>';
  if (st.good && st.Z) { var tot = st.sec.reduce(function (a, b) { return a + b; }, 0) || 1; h += '<div class="small muted">' + A('الوقت في كل منطقة', 'Temps par zone') + ' · ' + esc(st.Z.lab) + '</div><div class="rp-z">' + st.sec.map(function (v, i) { return v ? '<i title="Z' + (i + 1) + ' ' + fmtMS(v) + '" style="width:' + (v / tot * 100) + '%;background:' + ZC[i] + '"></i>' : ''; }).join('') + '</div><div class="rp-zl">' + st.sec.map(function (v, i) { return '<span>Z' + (i + 1) + ' ' + Math.round(v / tot * 100) + '% <small class="muted">(' + st.Z.z[i].lo + '–' + st.Z.z[i].hi + ')</small></span>'; }).join('') + '</div>'; }
  h += '<div class="chart" style="height:210px;margin-top:8px"><canvas id="ch-hrt"></canvas></div>';
  h += hrReportHtml(s, it, x, st);
  if (canLink) h += '<div class="row" style="margin-top:8px"><button type="button" class="btn sm" id="hr-link">⌚ ' + (st.src === 'polar' ? A('بدّل الحصة / الوقت', 'Changer séance / départ') : A('ربط حصة Polar', 'Lier une séance Polar')) + '</button>' + (st.src === 'polar' ? '<button type="button" class="btn sm dan" id="hr-unlink">✕ ' + A('نحّي النبض', 'Retirer la FC') + '</button>' : '') + '</div>';
  return h + '</div>';
}
// 📝 التقرير المكتوب: كل جملة فيها مصدرها، وواش ناقص مكتوب بوضوح
function hrReportHtml(s, it, x, st) {
  var tid = it.bt && it.bt.id, hh = histOf(s, it), i = hh.findIndex(function (y) { return y.rec && x.rec && y.rec.id === x.rec.id; }), prev = i > 0 ? hh[i - 1] : null, out = [], miss = [], d = x.rec.data || {};
  var cnd = function (r) { var c = r && r.rec && r.rec.data && (r.rec.data.cond || {}); return [c && c.pool || r.rec.data.pool || '', c && c.timing || ''].join('|'); };
  // النتيجة
  out.push(['📋', A('النتيجة', 'Résultat'), '<b class="num">' + esc(x.disp) + '</b> ' + srcTag('m') + (x.extra ? ' · ' + bdi(x.extra) + ' ' + srcTag('c') : '')]);
  if (prev) { if (cnd(prev) === cnd(x)) { var vd = vdOf(it, x, prev); out.push(['↕️', A('مقارنة مع ', 'Par rapport au ') + fmtDate(prev.date), esc(prev.disp) + ' → ' + esc(x.disp) + ' ' + vChip(vd) + (vd && vd.mdc ? ' <span class="small muted">(' + A('خطأ القياس ±', 'erreur de mesure ±') + R(vd.mdc, 1) + '%)</span>' : '')]); }
    else miss.push(A('المقارنة مع ' + fmtDate(prev.date) + ' ما تصلحش: الظروف مختلفة (المسبح ولا طريقة التوقيت).', 'Comparaison avec le ' + fmtDate(prev.date) + ' impossible : conditions différentes.')); }
  else miss.push(A('هاذي أول نتيجة: المقارنة تبدا من النتيجة الجاية.', 'Premier résultat : la comparaison commencera au prochain.'));
  // النبض
  out.push(['❤️', A('النبض', 'FC'), A('متوسط ', 'moy. ') + '<b class="num">' + st.avg + '</b> · ' + A('أعلى ', 'max ') + '<b class="num">' + st.peak + '</b> bpm ' + srcTag('m') + (st.src === 'polar' && !d.hrRaw ? ' <span class="small muted">(' + A('Polar يعطي متوسط كل 5 ث، الأعلى الحقيقي يقدر يكون أعلى بنبضة ولا زوج', 'Polar donne une moyenne / 5 s : le vrai pic peut être 1–2 bpm plus haut') + ')</span>' : '')]);
  if (st.good && st.plat != null) out.push(['📈', A('الثبات', 'Plateau'), A('النبض ثبت بعد ', 'FC stabilisée après ') + '<b class="num">' + fmtMS(st.plat) + '</b> ' + A('على حوالي ', 'autour de ') + '<b class="num">' + st.platHr + '</b> bpm ' + srcTag('c')]);
  if (st.good && st.drift != null) {
    var dj = '';
    if (st.pace && st.pace.cv <= 3) dj = st.drift <= 3 ? A('✅ بنفس السرعة النبض ما طلعش بزاف: تحمّل هوائي مليح.', '✅ À allure constante la FC monte peu : bonne endurance.') : st.drift <= 6 ? A('🟡 طلع شوية في النص الثاني بنفس السرعة.', '🟡 Légère hausse en 2e moitié à allure constante.') : A('🔴 طلع بزاف في النص الثاني بنفس السرعة: التعب بان.', '🔴 Forte hausse en 2e moitié à allure constante : fatigue.');
    else dj = '<span class="muted">' + A('ما نحكموش عليه: ' + (st.pace ? 'السرعة ما كانتش ثابتة (اختلاف ' + R(st.pace.cv, 1) + '%)' : 'ما عندناش وقت كل طولة') + '. الحكم يصلح غير كي السرعة ثابتة.', 'Pas d’interprétation : ' + (st.pace ? 'allure irrégulière (CV ' + R(st.pace.cv, 1) + ' %)' : 'temps par longueur inconnus') + '.') + '</span>';
    out.push(['〰️', A('انحراف النبض', 'Dérive'), A('النص الأول ', '1re moitié ') + '<b class="num">' + Math.round(st.a1) + '</b> · ' + A('النص الثاني ', '2e moitié ') + '<b class="num">' + Math.round(st.a2) + '</b> (' + (st.drift > 0 ? '+' : '') + R(st.drift, 1) + '%) ' + srcTag('c') + '<br>' + dj]);
  }
  if (st.hrr != null) out.push(['🌬️', A('الاسترجاع', 'Récupération'), A('هبط ', 'baisse de ') + '<b class="num">' + st.hrr + '</b> ' + A('نبضة في 60 ث', 'bpm en 60 s') + ' (' + st.hrEnd + ' → ' + st.hr60 + ') ' + srcTag('m')]);
  else miss.push(A('الاسترجاع بعد 60 ث: الحساس ما سجلش دقيقة كاملة بعد الاختبار.', 'Récup 60 s : pas d’enregistrement une minute après le test.'));
  // الإيقاع
  if (st.pace) out.push(['⏱', A('الإيقاع', 'Allure'), A('متوسط الطولة: النص الأول ', 'Longueur moy. : 1re moitié ') + '<b class="num">' + F(st.pace.h1, 1) + '</b> · ' + A('الثاني ', '2e ') + '<b class="num">' + F(st.pace.h2, 1) + '</b> · ' + A('الانتظام ', 'régularité ') + 'CV <b class="num">' + R(st.pace.cv, 1) + '%</b> ' + srcTag('c') + (st.pace.cv <= 3 ? ' ✅' : '')]);
  else if (tid && (BT_DUR[tid] || BT_LIVE[tid])) miss.push(A('الإيقاع (وقت كل طولة): دير الاختبار «⏱ لايف» واضغط «لمسة» في كل حيط.', 'Allure par longueur : faites le test « ⏱ en direct » avec « Touche » à chaque mur.'));
  // العتبة (T20/T30 برك)
  if ((tid === 't20' || tid === 't30') && st.good && st.platHr) out.push(['🎯', A('نبض العتبة التقريبي', 'FC de seuil approx.'), '≈ <b class="num">' + st.platHr + '</b> bpm ' + srcTag('e') + ' <span class="small muted">' + A('(متوسط النبض بعد الثبات في سباحة طويلة بإيقاع منتظم · Olbrecht' + (tid === 't20' ? '. الـ 20 د أقصر من T30، العتبة الحقيقية تقدر تكون أقل بشوية' : '') + ')', '(FC du plateau sur nage longue régulière · Olbrecht' + (tid === 't20' ? ' ; 20 min < T30, le vrai seuil peut être un peu plus bas' : '') + ')') + '</span>']);
  // المناطق
  if (!st.Z) miss.push(A('المناطق و«% من الأقصى»: ما عندناش نبض أقصى حقيقي. دير 400 م ولا التصاعدي لايف، ولا اكتب النبض الأقصى في ملف السباح.', 'Zones et % du max : aucune FC max réelle. Faites un 400 m ou le test progressif en direct, ou saisissez la FC max dans la fiche.'));
  // الجودة
  var q = A('النبض يغطي ', 'Couverture FC ') + '<b class="num">' + Math.round(st.cov * 100) + '%</b> ' + A('من الاختبار', 'du test') + (st.gap ? ' · ' + st.gap + A(' ث بلا نبض', ' s sans FC') : '');
  if (st.src === 'polar') q += ' · ⌚ ' + A('حصة Polar', 'séance Polar') + (d.hrA != null ? ', ' + A('البداية عند ', 'départ à ') + fmtMS(d.hrA) + ' ' + (d.hrAuto ? A('(اقترحها التطبيق على أصعب جزء، تأكد منها في المنحنى)', '(proposé par l’app, à vérifier sur la courbe)') : A('(حددتها أنت)', '(fixé par vous)')) : '');
  else if (st.sensor) q += ' · ⏱ ' + esc(st.sensor);
  out.push(['🔎', A('جودة البيانات', 'Qualité des données'), q]);
  var h = '<div class="rp-an" style="margin-top:12px"><div class="t">📝 ' + A('تقرير الاختبار', 'Rapport du test') + '</div><table class="rp-tb">' + out.map(function (r) { return '<tr><td>' + r[0] + '</td><th>' + r[1] + '</th><td>' + r[2] + '</td></tr>'; }).join('') + '</table>';
  if (miss.length) h += '<div class="t" style="margin-top:10px">⚠️ ' + A('واش ما نقدروش نقولو (ناقص)', 'Ce qu’on ne peut pas dire (manquant)') + '</div><ul>' + miss.map(function (m) { return '<li>' + m + '</li>'; }).join('') + '</ul>';
  return h + '<div class="small muted" style="margin-top:6px">' + srcTag('m') + ' ' + A('= من الحساس ولا الكرونو', '= capteur ou chrono') + ' · ' + srcTag('c') + ' ' + A('= حساب من أرقام مقاسة', '= calcul sur mesures') + ' · ' + srcTag('e') + ' ' + A('= تقدير علمي، ماشي قياس', '= estimation scientifique, pas une mesure') + '</div></div>';
}
function hrCardBind(s, it, x, canLink) {
  var st = hrStatsOf(x.rec, s);
  if (st && window.Chart && $('#ch-hrt')) {
    var oh = chartBase(); oh.plugins.legend = { display: false };
    oh.scales = { x: { type: 'linear', ticks: { callback: function (v) { return (v < 0 ? '−' : '') + fmtMS(Math.abs(v)); } } }, y: { suggestedMin: 80 } };
    var ys = st.sm.map(function (p) { return p.hr; }), lo = Math.min.apply(null, ys) - 5, hi = Math.max.apply(null, ys) + 5, vl = function (t, c) { return { type: 'line', data: [{ x: t, y: lo }, { x: t, y: hi }], borderColor: c, borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0 }; };
    mk('ch-hrt', { type: 'scatter', data: { datasets: [{ type: 'line', data: st.sm.map(function (p) { return { x: p.t, y: p.hr }; }), borderColor: CH.red, borderWidth: 2, pointRadius: 0, tension: .2 }, vl(0, '#0e9f6e'), vl(st.dur, '#0d2a6b')] }, options: oh });
  }
  if ($('#hr-link')) $('#hr-link').onclick = function () { S.plk = { step: 1 }; render(); };
  if ($('#hr-unlink')) $('#hr-unlink').onclick = function () {
    if (!confirm(A('نحّيو النبض من هاذ النتيجة؟', 'Retirer la FC de ce résultat ?'))) return;
    var r = JSON.parse(JSON.stringify(x.rec)); delete r.data.samples; delete r.data.hrDur; delete r.data.hrSrc; delete r.data.polarEx; delete r.data.hrZones; delete r.data.hrA; delete r.data.hrAuto; delete r.data.hrRaw; mutate('saveTest', { rec: r }); render();
  };
  if (S.plk && $('#plk')) plkRun(s, it, x);
}
// ربط حصة Polar: 1) نختارو الحصة 2) نحددو البداية والمدة 3) نحفظو
function plkRun(s, it, x) {
  var box = $('#plk'), date = x.date, P = S.plk;
  var cancel = '<button type="button" class="btn sm" id="plk-x">' + A('إلغاء', 'Annuler') + '</button>';
  if (P.step === 1) {
    var loc = []; daysOf(s.id).forEach(function (d) { (d.ex || []).forEach(function (e) { if (e.hr && e.hr.length) loc.push({ date: d.date, e: e }); }); });
    var dd = function (a) { return Math.abs(new Date(a) - new Date(date)) / 864e5; };
    loc.sort(function (a, b) { return dd(a.date) - dd(b.date) || String(a.e.start).localeCompare(String(b.e.start)); }); loc = loc.filter(function (o) { return dd(o.date) <= 3; });
    box.innerHTML = '<div class="small muted" style="margin-bottom:6px">' + A('اختار الحصة اللي فيها الاختبار (حصص Verity Sense تاع Polar Flow):', 'Choisissez la séance contenant le test (séances Polar Flow) :') + '</div>' +
      (loc.length ? loc.map(function (o, i) { return '<button type="button" class="btn sm' + (o.date === date ? ' pri' : '') + '" data-plo="' + i + '" style="margin:3px">⌚ ' + fmtDate(o.date) + ' ' + esc(o.e.start || '') + ' · ' + (o.e.min || '—') + ' min · ♥ ' + (o.e.hrAvg || '—') + '/' + (o.e.hrMax || '—') + '</button>'; }).join('') : '<div class="small">' + A('ما لقيتش حصة قريبة من نهار الاختبار في البيانات اللي تجابت.', 'Aucune séance proche de la date du test dans les données synchronisées.') + '</div>') +
      '<div class="row" style="margin-top:8px"><button type="button" class="btn sm" id="plk-api">🔄 ' + A('جيب كل الحصص من Polar (بالأنترنت)', 'Toutes les séances Polar (internet)') + '</button>' + cancel + '</div><div id="plk-api-l" class="small" style="margin-top:6px"></div>';
    $$('[data-plo]', box).forEach(function (b) { b.onclick = function () { var o = loc[+b.dataset.plo], rt = o.e.rate || 5; S.plk = { step: 2, id: o.e.id, date: o.date, start: o.e.start, zones: o.e.zones || null, raw: false, sm: o.e.hr.map(function (v, k) { return { t: k * rt, hr: v }; }).filter(function (p) { return p.hr > 0; }) }; render(); }; });
    $('#plk-api').onclick = function () {
      var el = $('#plk-api-l'); el.textContent = '⏳ …';
      API.call('polarExList', { sid: s.id }).then(function (r) {
        if (!r.ok) { el.textContent = '⚠️ ' + (r.err === 'polarNotLinked' ? A('السباح هذا ما راهوش مربوط مع Polar.', 'Nageur non connecté à Polar.') : r.err); return; }
        el.innerHTML = r.list.length ? r.list.slice(0, 20).map(function (e) { return '<button type="button" class="btn sm' + (e.date === date ? ' pri' : '') + '" data-pla="' + esc(e.id) + '" data-pld="' + esc(e.date) + '" data-pls="' + esc(e.start) + '" style="margin:3px">⌚ ' + fmtDate(e.date) + ' ' + esc(e.start) + ' · ' + e.min + ' min · ♥ ' + (e.hrAvg || '—') + '/' + (e.hrMax || '—') + '</button>'; }).join('') : A('ما كاين حتى حصة.', 'Aucune séance.');
        $$('[data-pla]', el).forEach(function (b) { b.onclick = function () {
          el.textContent = '⏳ ' + A('نجيب النبض…', 'Récupération de la FC…');
          API.call('polarExHr', { sid: s.id, id: b.dataset.pla }).then(function (q) {
            if (!q.ok) { el.textContent = '⚠️ ' + (q.err === 'polarNoHr' ? A('الحصة هذي ما فيهاش نبض.', 'Pas de FC dans cette séance.') : q.err); return; }
            S.plk = { step: 2, id: b.dataset.pla, date: b.dataset.pld, start: b.dataset.pls, zones: q.zones || null, raw: true, sm: unpack(q.hr) }; render();
          }).catch(function () { el.textContent = T('neterr'); });
        }; });
      }).catch(function () { el.textContent = T('neterr'); });
    };
  } else {
    var sm = P.sm, end = sm.length ? sm[sm.length - 1].t : 0, tid = it.bt && it.bt.id;
    if (P.dur == null) {
      P.dur = tid && BT_DUR[tid] ? BT_DUR[tid][0] : (it.bt && it.bt.unit === 's' && BT_LIVE[tid] && BT_LIVE[tid][0] === 1 && x.v ? Math.round(x.v) : null);
      P.a = 0; P.auto = false;
      if (P.dur && P.dur < end) { // البداية: النافذة اللي فيها أعلى متوسط نبض
        var best = -1; for (var a = 0; a + P.dur <= end; a += 5) { var w = sm.filter(function (p) { return p.t >= a && p.t <= a + P.dur; }); if (w.length) { var m = w.reduce(function (q, p) { return q + p.hr; }, 0) / w.length; if (m > best) { best = m; P.a = a; P.auto = true; } } }
      }
      if (!P.dur) P.dur = Math.max(30, end);
    }
    box.innerHTML = '<div class="small muted" style="margin-bottom:6px">⌚ ' + fmtDate(P.date) + ' ' + esc(P.start || '') + ' · ' + A('حدد وين بدا الاختبار في الحصة (الخط الأخضر) وقداش دام (الخط الأزرق).', 'Indiquez le début du test dans la séance (ligne verte) et sa durée (ligne bleue).') + (tid && BT_DUR[tid] ? ' ' + A('البداية تحطت وحدها على أصعب جزء، صححها إذا لازم.', 'Le départ est proposé sur la partie la plus intense ; corrigez si besoin.') : '') + '</div>' +
      '<div class="fr"><div class="f"><label>' + A('بداية الاختبار في الحصة', 'Début du test dans la séance') + '</label><input id="plk-a" class="num mono" value="' + fmtMS(P.a) + '" placeholder="mm:ss"></div><div class="f"><label>' + A('مدة الاختبار', 'Durée du test') + '</label><input id="plk-d" class="num mono" value="' + fmtMS(P.dur) + '" placeholder="mm:ss"></div></div>' +
      '<div class="chart" style="height:210px"><canvas id="ch-plk"></canvas></div>' +
      '<div class="row" style="margin-top:8px"><button type="button" class="btn pri" id="plk-ok">💾 ' + A('حفظ النبض مع النتيجة', 'Enregistrer la FC avec le résultat') + '</button><button type="button" class="btn sm" id="plk-b">← ' + A('حصة أخرى', 'Autre séance') + '</button>' + cancel + '</div>';
    var ch = null, draw = function () {
      if (!window.Chart) return; if (ch) { try { ch.destroy(); } catch (e) {} }
      var ys = sm.map(function (p) { return p.hr; }), lo = Math.min.apply(null, ys) - 5, hi = Math.max.apply(null, ys) + 5, vl = function (t, c) { return { type: 'line', data: [{ x: t, y: lo }, { x: t, y: hi }], borderColor: c, borderWidth: 2, pointRadius: 0 }; };
      var o = chartBase(); o.plugins.legend = { display: false }; o.scales = { x: { type: 'linear', ticks: { callback: function (v) { return fmtMS(v); } } } };
      ch = mk('ch-plk', { type: 'scatter', data: { datasets: [{ type: 'line', data: sm.map(function (p) { return { x: p.t, y: p.hr }; }), borderColor: CH.red, borderWidth: 1.5, pointRadius: 0 }, vl(P.a, '#0e9f6e'), vl(P.a + P.dur, '#1d6bff')] }, options: o });
    };
    draw();
    var rd = function () { var a = C.parseTime($('#plk-a').value), d = C.parseTime($('#plk-d').value); if (a != null && a >= 0 && Math.abs(a - P.a) > 0.5) { P.a = a; P.auto = false; } if (d && d > 0) P.dur = d; draw(); };
    $('#plk-a').onchange = rd; $('#plk-d').onchange = rd;
    $('#plk-b').onclick = function () { S.plk = { step: 1 }; render(); };
    $('#plk-ok').onclick = function () {
      rd(); var rel = sm.filter(function (p) { return p.t >= P.a - 30 && p.t <= P.a + P.dur + 75; }).map(function (p) { return { t: p.t - P.a, hr: p.hr }; });
      if (rel.length < 5) return toast(A('ما كاينش نبض في هاذ الوقت', 'Pas de FC sur cet intervalle'));
      var r = JSON.parse(JSON.stringify(x.rec)); r.data.samples = pack(rel); r.data.hrDur = Math.round(P.dur); r.data.hrSrc = 'polar'; r.data.polarEx = P.id; r.data.hrA = Math.round(P.a); r.data.hrAuto = !!P.auto; r.data.hrRaw = !!P.raw; if (P.zones && P.zones.length >= 5) r.data.hrZones = P.zones.map(function (z) { return { lo: z.lo, hi: z.hi }; }).sort(function (a, b) { return a.lo - b.lo; }); else delete r.data.hrZones;
      mutate('saveTest', { rec: r }); S.plk = null; toast(T('saved')); render();
    };
  }
  if ($('#plk-x')) $('#plk-x').onclick = function () { S.plk = null; render(); };
}
// ⏱ الأوقات المتقطعة (كل 25/50) تاع الاختبار لايف
function splitsHtml(d) {
  var pool = +(d.splitM || d.cond && d.cond.pool || d.pool || (d.live && d.live.pool) || 25) || 25, sp = d.splits;
  var h = '<div class="card"><h3>⏱ ' + A('الأوقات المتقطعة', 'Temps intermédiaires') + ' <span class="small muted">· ' + A('كل ', 'tous les ') + pool + A(' م', ' m') + '</span></h3><div class="tbl-wrap"><table><tr><th>' + A('التكرار', 'Rép.') + '</th>' +
    Array.apply(null, Array(Math.max.apply(null, sp.map(function (r) { return r.length; })))).map(function (_, i) { return '<th>' + ((i + 1) * pool) + A(' م', ' m') + '</th>'; }).join('') + '<th>' + A('المجموع', 'Total') + '</th></tr>';
  sp.forEach(function (r, i) {
    var cum = 0, best = Math.min.apply(null, r);
    h += '<tr><td class="num"><b>' + (sp.length > 1 ? i + 1 : '—') + '</b></td>' + r.map(function (v) { cum += v; return '<td class="num"' + (v === best && r.length > 1 ? ' style="color:var(--ok);font-weight:700"' : '') + '>' + F(v, 1) + '<div class="small muted">' + F(cum, 1) + '</div></td>'; }).join('') + '<td class="num" style="font-weight:700">' + F(cum, 1) + '</td></tr>';
  });
  h += '</table></div>';
  if (sp.length === 1 && sp[0].length >= 4) { var r0 = sp[0], hf = Math.floor(r0.length / 2), a1 = r0.slice(0, hf).reduce(function (a, b) { return a + b; }, 0) / hf, a2 = r0.slice(r0.length - hf).reduce(function (a, b) { return a + b; }, 0) / hf;
    h += '<div class="small muted" style="margin-top:6px">' + A('متوسط الطولة: النص الأول ', 'Longueur moyenne : 1re moitié ') + '<b class="num">' + F(a1, 1) + '</b> · ' + A('النص الثاني ', '2e moitié ') + '<b class="num">' + F(a2, 1) + '</b> (' + (a2 >= a1 ? '+' : '') + R((a2 - a1) / a1 * 100, 1) + '%)</div>'; }
  return h + '<div class="small muted">' + A('الرقم الصغير = الوقت التراكمي. الأخضر = أسرع طولة.', 'Petit chiffre = temps cumulé. Vert = longueur la plus rapide.') + '</div></div>';
}

/* --- onglet « التقرير » : le nageur comparé à lui-même --- */
function rptHtml(s) {
  var items = catalog(s), nT = 0, up = 0, down = 0, last = null;
  var body = GROUPS.map(function (g) {
    var rows = items.filter(function (it) { return it.sys === g; }).map(function (it) { var hh = histOf(s, it); return hh.length ? { it: it, h: hh } : null; }).filter(Boolean);
    if (!rows.length) return '';
    rows.sort(function (a, b) { return a.h[a.h.length - 1].date < b.h[b.h.length - 1].date ? 1 : -1; });
    return '<div class="card grp g-' + g + '"><h3>' + T('g_' + g) + '</h3><div class="tlist">' + rows.map(function (x) {
      var hh = x.h, cur = hh[hh.length - 1], prev = hh.length > 1 ? hh[hh.length - 2] : null, vd = vdOf(x.it, cur, prev), isPb = hh.length > 1 && pbIdx(hh, x.it.better) === hh.length - 1;
      nT += hh.length; if (vd && vd.k === 'real') { if (vd.ch > 0) up++; else down++; } if (!last || cur.date > last) last = cur.date;
      return '<div class="it" data-tk="' + esc(x.it.key) + '" style="cursor:pointer"><span class="ic">' + x.it.icon + '</span><div class="sp" style="min-width:0"><b>' + esc(x.it.name) + '</b>' + (isPb ? ' <span class="chip ok">' + T('pb') + '</span>' : '') +
        '<div class="small muted">' + rdot(s, cur.date) + fmtDate(cur.date) + (cur.extra ? ' · ' + bdi(cur.extra) : '') + (prev ? ' · ' + T('prevR') + ' <span class="num">' + esc(prev.disp) + '</span>' : '') + ' · <span class="num">' + hh.length + '</span> ' + T('nRes') + '</div></div>' +
        '<div style="text-align:end"><div class="num" style="font-size:19px;font-weight:700">' + esc(cur.disp) + '</div>' + vChip(vd) + '</div></div>';
    }).join('') + '</div></div>';
  }).join('');
  if (!body) return '<div class="card empty">' + T('noRpt') + '<div style="margin-top:14px"><button class="btn pri big" data-pick="1">＋ ' + T('newTest') + '</button></div></div>';
  return '<div class="statbar"><div class="card"><div class="kpi"><div class="l">' + T('testsDone') + '</div><div class="v">' + nT + '</div></div></div>' +
    '<div class="card"><div class="kpi"><div class="l">' + T('lastTest') + '</div><div class="v" style="font-size:20px">' + fmtDate(last) + '</div></div></div>' +
    '<div class="card"><div class="kpi"><div class="l">' + T('upN') + '</div><div class="v" style="color:var(--ok)">▲ ' + up + '</div></div></div>' +
    '<div class="card"><div class="kpi"><div class="l">' + T('downN') + '</div><div class="v" style="color:var(--bad)">▼ ' + down + '</div></div></div></div>' + body;
}

/* --- choix du test, rangé par type --- */
function openItem(s, key) { if (key.indexOf('bt:') === 0) window.BTV.openEntry(s.id, key.slice(3)); else route('test', { sid: s.id, tid: null, type: key }); }
function vPick(app) {
  var s = sw(S.sid); if (!s) return route('home');
  var items = catalog(s).filter(function (it) { return !it.hide && !it.archived; }), B = window.BTV, cat = B ? B.catOf(s) : null;
  if (can('day')) items.push({ key: 'day', sys: 'FOL', icon: ICON.day, name: T('T_day'), desc: T('D_day'), ok: true, fol: true });
  if (can('vo2')) items.push({ key: 'time', sys: 'FOL', icon: ICON.time, name: T('T_time'), desc: T('points'), ok: true, fol: true });
  var h = '<button class="btn sm" id="bk">← ' + esc(s.name) + '</button><h1>＋ ' + T('pickT') + ' · ' + esc(s.name) + (cat && B ? ' <span class="chip">' + B.catName(cat) + '</span>' : '') + '</h1>';
  if (can('vo2') || can('bt')) h += '<button class="btn pri big" id="pk-live" style="width:100%;justify-content:center;margin-bottom:14px">⏱ ' + A('اختبار لايف بالـ Verity Sense (حتى 4 سباحين)', 'Test en direct Verity Sense (jusqu’à 4 nageurs)') + '</button>';
  if (!canBt()) h += '<div class="info" style="margin-bottom:14px">' + A('اختبارات البطارية (قوة، سرعة، بروتوكولات…) ما راهيش مفتوحة لهذا الحساب.', 'Tests de la batterie non autorisés pour ce compte.') + '</div>';
  GROUPS.concat(['FOL']).forEach(function (g) {
    var list = items.filter(function (it) { return it.sys === g; }); if (!list.length) return;
    list.sort(function (a, b) { return (b.ok ? 1 : 0) - (a.ok ? 1 : 0) || (a.proto ? 1 : 0) - (b.proto ? 1 : 0); });
    h += '<div class="card grp g-' + g + '"><h3>' + T('g_' + g) + '</h3><div class="grid g3">' + list.map(function (it) {
      var hh = it.fol ? [] : histOf(s, it), lastD = hh.length ? hh[hh.length - 1].date : null;
      return '<button class="btn" style="justify-content:flex-start;text-align:start;min-height:64px;' + (it.ok ? '' : 'opacity:.7') + '" data-pk="' + esc(it.key) + '"><span class="ic">' + it.icon + '</span><span style="min-width:0"><b>' + esc(it.name) + '</b>' +
        (it.desc ? '<br><span class="small muted' + (it.proto ? ' ltr' : '') + '" style="font-weight:400">' + esc(it.desc) + '</span>' : '') +
        (lastD || !it.ok ? '<br>' : '') + (lastD ? '<span class="chip" style="margin-top:3px">' + T('lastOn') + ' ' + fmtDate(lastD) + '</span> ' : '') + (!it.ok ? '<span class="chip warn" style="margin-top:3px">⚠ ' + T('notCat') + '</span>' : '') + '</span></button>';
    }).join('') + '</div></div>';
  });
  app.innerHTML = h;
  $('#bk').onclick = function () { route('swimmer', { tab: 'rpt' }); };
  $$('[data-pk]').forEach(function (b) { b.onclick = function () { openItem(s, b.dataset.pk); }; });
  if ($('#pk-live')) $('#pk-live').onclick = function () { LS = null; route('liveSetup', { liveSids: [s.id] }); };
}

/* --- page d'un test : toutes les résultats + courbe --- */
function vSwTest(app) {
  var s = sw(S.sid); if (!s) return route('home');
  var it = catalog(s).find(function (x) { return x.key === S.tkey; }); if (!it) return route('swimmer', { tab: 'rpt' });
  var hh = histOf(s, it), n = hh.length, cur = hh[n - 1], prev = n > 1 ? hh[n - 2] : null, first = hh[0], pi = pbIdx(hh, it.better), pb = hh[pi];
  var h = '<div class="row"><button class="btn sm" id="bk">← ' + esc(s.name) + '</button><span class="sp"></span>' + (it.archived ? '' : '<button class="btn pri" id="add">' + T('addRes') + '</button>') + '</div>' +
    '<h1 style="margin-top:12px">' + it.icon + ' ' + esc(it.name) + '</h1>' + (it.desc ? '<p class="muted' + (it.proto ? ' ltr' : '') + '" style="margin-top:-6px">' + esc(it.desc) + '</p>' : '');
  if (it.bt && window.BTV) h += '<div class="small muted" style="margin:-4px 0 10px">' + T('suitsFor') + ' : ' + BTV.catList(it.bt) + '</div>';
  var hasHr = function (x) { return x && x.rec && x.rec.data && x.rec.data.samples && x.rec.data.samples.length > 10; };
  if (S.hsel == null || S.hselKey !== s.id + '|' + it.key || !hh[S.hsel]) { S.hselKey = s.id + '|' + it.key; S.hsel = n - 1; for (var q = n - 1; q >= 0; q--) if (hasHr(hh[q])) { S.hsel = q; break; } }
  var hx = n ? hh[S.hsel] : null, canLink = !!(it.bt && can('editRes') && !it.archived);
  if (!n) h += '<div class="card empty">' + T('noTests') + '</div>';
  else {
    var box = function (l, v, sub) { return '<div class="card"><div class="kpi"><div class="l">' + l + '</div><div class="v" style="font-size:22px">' + v + '</div>' + (sub ? '<div class="small muted">' + sub + '</div>' : '') + '</div></div>'; };
    h += '<div class="statbar">' + box(T('lastRes'), esc(cur.disp), fmtDate(cur.date)) + box(T('bestRes'), esc(pb.disp), '🏆 ' + fmtDate(pb.date)) +
      box(T('vsPrev'), prev ? esc(prev.disp) : '—', prev ? vChip(vdOf(it, cur, prev)) : '') + box(T('vsFirst'), n > 2 ? esc(first.disp) : '—', n > 2 ? vChip(vdOf(it, cur, first)) : '') + '</div>';
    if (n >= 2) h += '<div class="card"><h3>' + T('evo') + ' <span class="small muted">· ' + T(it.better === 'low' ? 'lowB' : 'highB') + '</span></h3><div class="chart"><canvas id="ch-evo"></canvas></div></div>';
    if (hx) h += hrCardHtml(s, it, hx, canLink);
    if (hx && hx.rec && hx.rec.data && hx.rec.data.splits && hx.rec.data.splits.length) h += splitsHtml(hx.rec.data);
    h += '<div class="card"><h3>' + T('allRes') + '</h3><div class="tbl-wrap"><table><tr><th>' + T('date') + '</th><th>' + T('results') + '</th><th></th><th>' + T('delta') + '</th><th>♥</th></tr>' +
      hh.map(function (x, i) { return '<tr data-ed="' + i + '" style="cursor:pointer' + (i === S.hsel ? ';background:var(--sky2)' : '') + '"><td class="num">' + rdot(s, x.date) + fmtDate(x.date) + '</td><td class="num" style="font-weight:700">' + esc(x.disp) + (i === pi && n > 1 ? ' 🏆' : '') + '</td><td class="small muted" style="text-align:start">' + bdi(x.extra) + '</td><td>' + (i ? vChip(vdOf(it, x, hh[i - 1])) : '') + '</td><td><button type="button" class="btn sm" data-hs="' + i + '" title="' + esc(T('hrTest')) + '" style="' + (hasHr(x) ? 'color:var(--bad)' : 'opacity:.45') + '">♥</button></td></tr>'; }).reverse().join('') + '</table></div></div>';
  }
  app.innerHTML = h;
  $('#bk').onclick = function () { route('swimmer', { tab: 'rpt' }); };
  if ($('#add')) $('#add').onclick = function () { openItem(s, it.key); };
  $$('[data-ed]').forEach(function (b) { b.onclick = function (ev) { if (ev.target.closest('[data-hs]')) return; var x = hh[+b.dataset.ed]; if (it.bt) window.BTV.openEntry(s.id, it.bt.id, x.date); else route('test', { tid: x.rec.id, type: x.rec.type }); }; });
  $$('[data-hs]').forEach(function (b) { b.onclick = function (ev) { ev.stopPropagation(); S.hsel = +b.dataset.hs; S.plk = null; render(); setTimeout(function () { var c = $('#hr-card'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); }; });
  if (hx) hrCardBind(s, it, hx, canLink);
  if (n >= 2 && window.Chart) {
    var o = chartBase(); o.plugins.legend = { display: false };
    o.scales = { y: { reverse: it.better === 'low', ticks: { callback: function (v) { return it.time ? F(v, 1) : R(v, 1); } } } };
    o.plugins.tooltip = { callbacks: { label: function (c) { return hh[c.dataIndex].disp; } } };
    mk('ch-evo', { type: 'line', data: { labels: hh.map(function (x) { return fmtDate(x.date); }), datasets: [{ data: hh.map(function (x) { return x.v; }), borderColor: CH.blue, backgroundColor: CH.blue, borderWidth: 3, pointRadius: hh.map(function (x, i) { return i === pi ? 8 : 5; }), pointBackgroundColor: hh.map(function (x, i) { return i === pi ? CH.gold : CH.blue; }) }] }, options: o });
  }
}

/* ======================= ⏱ اختبار لايف · Verity Sense · حتى 4 سباحين (كل واحد يتحفظ في ملفو) ======================= */
var LV = null, LS = null, SENS = {};
var BT_LIVE = { m100: [1, 0, 100], m200: [1, 0, 200], f800: [1, 0, 800], s15: [1, 0, 15], s25: [1, 0, 25], tol: [4, 60, 50], rs: [6, 60, 25] };
var BT_DUR = { t12: [720, [['dist', 'المسافة الكلية (م)', 'Distance totale (m)']]], t20: [1200, [['dist', 'المسافة الكلية (م)', 'Distance totale (m)']]], t30: [1800, [['dist', 'المسافة الكلية (م)', 'Distance totale (m)']]],
  cs3: [180, [['d150', 'المسافة في 2:30 (م)', 'Distance à 2:30 (m)'], ['d180', 'المسافة في 3:00 (م)', 'Distance à 3:00 (m)']]] };
// 🏋 خارج الماء
var BT_TIMED = { push: 30, situp: 30, sqj: 30 };   // عمل بالوقت ← نكتبو العدد
var BT_MEAS = { plank: 1, hang: 1 };               // يقيس حتى يحبس ← الوقت
function liveEnv(it) { return it.bt ? (it.bt.w ? 'water' : 'land') : it.key === 'leger' || it.key === 'rest' ? 'land' : 'water'; }
function liveSpec(it, pid) {
  if (!it) return null;
  if (it.key === 'step') { var id = C.PROTOCOLS[pid] ? pid : '5x100', P = C.PROTOCOLS[id]; return { n: P.reps, next: 'send', send: P.cycle, dist: P.dist, pid: id }; }
  if (it.key === '400') return { n: 1, dist: 400 };
  if (it.key === 'css') return { n: 2, next: 'manual', dists: [400, 200] };
  if (it.key === 'leger') return { land: 'leger', forceAll: true };
  if (it.key === 'rest') return { land: 'rest', forceAll: true, phases: [{ k: 'pre', dur: 300 }] };
  if (!it.bt) return null;
  var tid = it.bt.id, p = it.bt.proto;
  if (BT_LIVE[tid]) { var b = BT_LIVE[tid]; return { n: b[0], next: 'send', send: b[1], dist: b[2] }; }
  if (BT_DUR[tid]) return { n: 0, dur: BT_DUR[tid][0], ask: BT_DUR[tid][1] };
  if (BT_TIMED[tid]) return { land: 'count', phases: [{ k: 'work', dur: BT_TIMED[tid], si: 0 }] };
  if (BT_MEAS[tid]) return { land: 'meas', unitS: true, phases: [{ k: 'meas', si: 0, ri: 0 }] };
  if (tid === 'cooper') return { n: 0, dur: 720, run: true, ask: [['dist', 'المسافة الكلية (م)', 'Distance totale (m)']] };
  if (tid === 'r30') return { n: 2, next: 'manual', dist: 30, run: true };
  if (tid === 'ruff') return { land: 'ruff', phases: [{ k: 'pre', dur: 60 }, { k: 'work', dur: 45, metro: 1.5, si: 0 }, { k: 'post', dur: 60 }] };
  if (p && /^(AER|LAC|ALA)$/.test(p.sys) && +p.dist > 0) { var sets = Math.max(1, +p.sets || 1), reps = Math.max(1, +p.reps || 1); return { n: sets * reps, next: 'rest', rest: +p.restRep || 0, restSet: +p.restSet || 0, setSize: reps, dist: +p.dist, proto: p }; }
  if (p && !/^(AER|LAC|ALA)$/.test(p.sys)) {
    var m = p.mode || 'count', ns = Math.max(1, +p.sets || 1), ph = [];
    if (m === 'count' && +p.work > 0) { for (var i = 0; i < ns; i++) { ph.push({ k: 'work', dur: +p.work, si: i }); if (i < ns - 1 && +p.restSet) ph.push({ k: 'rest', dur: +p.restSet }); } return { land: 'count', phases: ph, proto: p }; }
    if (m === 'measure') { var nr = Math.max(1, +p.reps || 1); for (var j = 0; j < ns; j++) for (var r = 0; r < nr; r++) { ph.push({ k: 'meas', si: j, ri: r }); var last = j === ns - 1 && r === nr - 1; if (!last) { var rs = r === nr - 1 ? +p.restSet : +p.restRep; if (rs) ph.push({ k: 'rest', dur: rs }); } } return { land: 'meas', unitS: p.unit === 's', phases: ph, proto: p }; }
  }
  // أي اختبار آخر: كرونو + نبض لايف، وفي اللخر نكتبو النتيجة
  if (!p && it.bt.inputs && it.bt.inputs.length) return { land: 'any', phases: [{ k: 'meas', si: 0, ri: 0 }], inputs: it.bt.inputs };
  return null;
}
function liveItems() { return catalog(null).filter(function (it) { return !it.hide && !it.archived && liveSpec(it, '5x100'); }); }
function isIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }

/* --- الحساسات (كل سباح بحساسو) --- */
function sensConnect(sid) {
  if (!BT.supported()) { toast(isIOS() ? A('في الآيباد/الآيفون حل التطبيق في متصفح Bluefy', 'Sur iPad/iPhone, ouvrez l’app dans le navigateur Bluefy') : T('btNo')); return; }
  navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] }).then(function (dev) {
    var old = SENS[sid]; if (old && old.dev && old.dev !== dev) { old.want = false; try { old.dev.gatt.disconnect(); } catch (e) {} }
    var x = SENS[sid] = { dev: dev, name: dev.name || 'Polar', want: true, hr: null, last: 0, on: false };
    try { var m = JSON.parse(ls('mr_sens') || '{}'); m[sid] = x.name; ls('mr_sens', JSON.stringify(m)); } catch (e) {}
    dev.addEventListener('gattserverdisconnected', function () {
      x.on = false; lvPaint();
      (function retry(n) { if (!x.want || n > 200) return; setTimeout(function () { sensGatt(sid).catch(function () { retry(n + 1); }); }, 1500); })(0);
    });
    return sensGatt(sid);
  }).catch(function (e) { if (e && e.name !== 'NotFoundError') toast(e.message || 'Bluetooth ✗'); });
}
function sensGatt(sid) {
  var x = SENS[sid]; if (!x || !x.dev) return Promise.reject(new Error('nodev'));
  return x.dev.gatt.connect().then(function (g) { return g.getPrimaryService('heart_rate'); })
    .then(function (sv) { return sv.getCharacteristic('heart_rate_measurement'); })
    .then(function (ch) {
      ch.addEventListener('characteristicvaluechanged', function (e) { var dv = e.target.value, fl = dv.getUint8(0), hr = fl & 1 ? dv.getUint16(1, true) : dv.getUint8(1); if (!(hr > 0)) return; x.hr = hr; x.last = Date.now(); x.on = true; lvSample(sid, hr); if (S.view === 'liveSetup') lvPaint(); });
      return ch.startNotifications();
    }).then(function () { x.on = true; if (S.view === 'liveSetup') render(); else lvPaint(); });
}
function sensOff(sid) { var x = SENS[sid]; if (!x) return; x.want = false; try { x.dev.gatt.disconnect(); } catch (e) {} delete SENS[sid]; lvPaint(); }
function sensState(sid) { // {cls, txt, hr}
  var x = SENS[sid]; if (!x) return { cls: 'none', txt: A('بلا حساس', 'Sans capteur'), hr: null };
  var age = x.last ? (Date.now() - x.last) / 1000 : 999;
  if (x.on && age < 4) return { cls: 'ok', txt: '● ' + esc(x.name), hr: x.hr };
  return { cls: 'warn', txt: '⚠ ' + A('الإشارة انقطعت', 'Signal perdu') + (x.last ? ' · ' + Math.round(age) + ' ' + A('ث', 's') : ''), hr: x.hr, lost: true };
}
function lvSample(sid, hr) { if (!LV || !LV.running) return; LV.lanes.forEach(function (L) { if (L.sid === sid) L.smp.push([(Date.now() - LV.T0) / 1000, hr]); }); }

/* --- المحرك --- */
function lvNow() { return (Date.now() - LV.T0) / 1000; }
function repDist(sp, i) { return sp.dists ? sp.dists[i] || 0 : sp.dist || 0; }
function lapsOf(sp, i) { var d = repDist(sp, i), st = +LV.split || 0; return st && d > st ? Math.round(d / st) : 1; }
function lvBegin(L, at) {
  L.first = at; L.repStart = at; L.sp = []; L.laps = [];
  if (LV.spec.land === 'leger') { L.state = 'lg'; if (!LV.lg) LV.lg = { t0: at, stage: 1, sh: 0, next: at + C.legerInterval(1) }; }
  else if (LV.spec.land) { L.state = 'land'; L.pi = 0; L.pStart = at; L.ph = []; L.mt = 0; } else L.state = 'swim';
  beep(1000, .4);
}
function landNext(L, t) {
  var sp = LV.spec, ph = sp.phases[L.pi]; L.ph.push({ k: ph.k, s: L.pStart, e: t, si: ph.si, ri: ph.ri });
  L.pi++; L.mt = 0;
  if (L.pi >= sp.phases.length) { L.end = t; L.state = sp.land === 'ruff' || sp.land === 'rest' ? 'done' : 'rec60'; beep(880, .6); return; }
  L.pStart = t; var nx = sp.phases[L.pi]; beep(nx.k === 'rest' ? 660 : 1000, nx.k === 'rest' ? .25 : .45);
}
function lvTick() {
  if (!LV || !LV.running) return;
  var t = lvNow(), sp = LV.spec;
  // 🏃 Léger: نفس البيبات للكل
  if (LV.lg && LV.lanes.some(function (L) { return L.state === 'lg'; }) && t >= LV.lg.next) {
    var G = LV.lg; G.sh++;
    if (G.sh >= C.legerShuttles(G.stage)) { G.stage++; G.sh = 0; beep(1000, .12); setTimeout(function () { beep(1000, .12); }, 200); setTimeout(function () { beep(1000, .12); }, 400); }
    else beep(880, .18);
    G.next += C.legerInterval(G.stage);
  }
  LV.lanes.forEach(function (L) {
    if (L.state === 'wait' && L.startAt != null) {
      if (t >= L.startAt) lvBegin(L, L.startAt);
      else if (L.startAt - t <= 3 && L.cd !== Math.ceil(L.startAt - t)) { L.cd = Math.ceil(L.startAt - t); beep(660, .12); }
    }
    if (L.state === 'land') {
      var ph = sp.phases[L.pi], el = t - L.pStart;
      if (ph.dur) {
        if (el >= ph.dur) landNext(L, L.pStart + ph.dur);
        else {
          var left = ph.dur - el;
          if (left <= 3 && L.cd !== Math.ceil(left)) { L.cd = Math.ceil(left); beep(ph.k === 'work' ? 520 : 660, .1); }
          if (ph.metro && Math.floor(el / ph.metro) > L.mt) { L.mt = Math.floor(el / ph.metro); if (L.mt <= Math.round(ph.dur / ph.metro)) beep(1200, .05); }
        }
      }
    }
    if (L.state === 'rest') {
      if (t >= L.nextAt) { L.repStart = L.nextAt; L.state = 'swim'; beep(1000, .35); }
      else if (L.nextAt - t <= 3 && L.cd !== Math.ceil(L.nextAt - t)) { L.cd = Math.ceil(L.nextAt - t); beep(660, .12); }
    }
    if (L.state === 'swim' && sp.dur && t - L.first >= sp.dur) { L.end = L.first + sp.dur; L.state = 'rec60'; beep(1000, .8); }
    if (L.state === 'rec60' && t - L.end >= 62) { L.state = 'done'; beep(880, .3); }
  });
  if (S.view === 'live') lvPaint();
}
// ⏱ لمسة الحيط: وقت متقطع، ولا الوصول إذا هي اللمسة الأخيرة
function lvTouch(i) {
  var L = LV.lanes[i], sp = LV.spec, t = lvNow();
  if (L.state === 'land') { if (sp.phases[L.pi].k === 'meas') { landNext(L, t); lvPaint(); } return; }
  if (L.state === 'lg') { L.lgStage = LV.lg.stage; L.lgSh = LV.lg.sh; L.end = t; L.state = 'rec60'; beep(660, .3); lvPaint(); return; }
  if (L.state !== 'swim') return;
  if (sp.dur) { if (!+LV.split) return; L.laps.push(t); beep(1100, .08); lvPaint(); return; }
  if (L.sp.length + 1 < lapsOf(sp, L.reps.length)) { L.sp.push(t); beep(1100, .08); lvPaint(); return; }
  lvArrive(i);
}
function lvArrive(i) {
  var L = LV.lanes[i], sp = LV.spec, t = lvNow(); if (L.state !== 'swim' || sp.dur) return;
  L.reps.push({ s: L.repStart, e: t, sp: L.sp.slice() }); L.sp = []; var k = L.reps.length;
  if (k >= sp.n) { L.end = t; L.state = 'rec60'; beep(880, .25); lvPaint(); return; }
  if (sp.next === 'send') { var nx = L.first + k * sp.send; if (nx <= t + .5) { L.repStart = t; L.state = 'swim'; } else { L.nextAt = nx; L.state = 'rest'; } }
  else if (sp.next === 'rest') { var endSet = sp.setSize && k % sp.setSize === 0; L.nextAt = t + ((endSet ? sp.restSet : sp.rest) || 0); L.state = L.nextAt > t + .5 ? 'rest' : 'swim'; if (L.state === 'swim') L.repStart = t; }
  else L.state = 'ready';
  beep(880, .15); lvPaint();
}
function lvUndo(i) {
  var L = LV.lanes[i], sp = LV.spec;
  if (sp.land) return;
  if (sp.dur) { L.laps.pop(); lvPaint(); return; }
  if (L.state === 'swim' && L.sp.length) { L.sp.pop(); lvPaint(); return; }
  var r = L.reps.pop(); if (!r) return; L.repStart = r.s; L.sp = (r.sp || []).slice(); L.state = 'swim'; L.end = null; lvPaint();
}
function lvGo(i) { var L = LV.lanes[i], t = lvNow(); if (L.state === 'wait') lvBegin(L, t); else if (L.state === 'ready') { L.repStart = t; L.sp = []; L.state = 'swim'; beep(1000, .35); } lvPaint(); }
function lvStart() {
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.resume) actx.resume(); } catch (e) {}
  LV.T0 = Date.now(); LV.running = true; keepAwake(true); LV.lg = null; if (LV.spec.forceAll) LV.mode = 'all';
  LV.lanes.forEach(function (L, i) { L.state = 'wait'; L.reps = []; L.smp = []; L.sp = []; L.laps = []; L.first = null; L.end = null; L.startAt = LV.mode === 'solo' ? null : LV.mode === 'stagger' ? 5 + i * LV.gap : 5; });
  clearInterval(LV.iv); LV.iv = setInterval(lvTick, 100);
  route('live');
}
function lvFinish() { if (!LV) return; clearInterval(LV.iv); LV.running = false; LV.T1 = lvNow(); keepAwake(false); route('liveRes'); }

/* --- الشاشة 1: التحضير --- */
function livePickHtml(items, it) {
  var env = LS.env || (it ? liveEnv(it) : 'water');
  var h = '<label>' + A('الاختبار', 'Test') + '</label>';
  if (it && !LS.pickOpen) return h + '<div class="row lv-sel"><span class="ic">' + it.icon + '</span><div class="sp"><b style="font-size:18px">' + esc(it.name) + '</b><div class="small muted">' + T('g_' + it.sys) + ' · ' + (liveEnv(it) === 'land' ? '🏋 ' + A('خارج الماء', 'Hors de l’eau') : '🏊 ' + A('في الماء', 'Dans l’eau')) + '</div></div><button type="button" class="btn sm" id="ls-chg">' + A('بدّل الاختبار', 'Changer') + '</button></div>';
  h += '<div class="seg" style="margin-bottom:10px">' + [['water', '🏊 ' + A('في الماء', 'Dans l’eau')], ['land', '🏋 ' + A('خارج الماء', 'Hors de l’eau')]].map(function (x) { return '<button type="button" class="btn sm' + (env === x[0] ? ' on' : '') + '" data-lenv="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
  GROUPS.forEach(function (g) {
    var l = items.filter(function (x) { return x.sys === g && liveEnv(x) === env; }); if (!l.length) return;
    h += '<div class="lv-gh g-' + g + '">' + T('g_' + g) + '</div><div class="grid g3" style="gap:8px;margin-bottom:6px">' + l.map(function (x) { return '<button type="button" class="btn' + (it && x.key === it.key ? ' pri' : '') + '" data-lk="' + esc(x.key) + '" style="justify-content:flex-start;text-align:start;min-height:52px"><span class="ic">' + x.icon + '</span><span style="min-width:0"><b>' + esc(x.name) + '</b>' + (x.desc ? '<br><span class="small" style="font-weight:400;opacity:.8">' + esc(x.desc) + '</span>' : '') + '</span></button>'; }).join('') + '</div>';
  });
  if (env === 'land') h += '<div class="small muted">' + A('خارج الماء: Léger، Cooper، سرعة 30 م، الدوائر بالوقت، Gainage، Ruffier-Dickson، نبض الراحة، وكل الاختبارات الأخرى (كرونو + نبض، والنتيجة تكتبها في اللخر). من 1 حتى 4 سباحين.', 'Hors de l’eau : Léger, Cooper, sprint 30 m, circuits, gainage, Ruffier-Dickson, FC de repos et tous les autres tests (chrono + FC, résultat saisi à la fin). De 1 à 4 nageurs.') + '</div>';
  return h;
}
function vLiveSetup(app) {
  var items = liveItems(), pre = (S.liveSids || []).slice(0, 4);
  LS = LS || { key: '', pid: '5x100', pool: '25', split: 0, mode: 'all', gap: 10, env: 'water', pickOpen: true, sids: [pre[0] || '', pre[1] || '', pre[2] || '', pre[3] || ''] };
  if (LV && LV.running) return route('live');
  var it = items.find(function (x) { return x.key === LS.key; }), sw0 = visibleSwimmers().slice().sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
  var spx = it ? liveSpec(it, LS.pid) : null, land = !!(spx && spx.land);
  var remembered = {}; try { remembered = JSON.parse(ls('mr_sens') || '{}'); } catch (e) {}
  var h = '<button class="btn sm" id="bk">← ' + T('home') + '</button><h1>⏱ ' + A('اختبار لايف · Verity Sense', 'Test en direct · Verity Sense') + '</h1>';
  if (!BT.supported()) h += '<div class="note" style="margin-bottom:14px">' + (isIOS() ? A('📱 في الآيباد والآيفون: نزّل المتصفح المجاني <b>Bluefy</b> من App Store وحل فيه التطبيق، باش يخدم البلوتوث.', '📱 Sur iPad/iPhone : installez le navigateur gratuit <b>Bluefy</b> (App Store) et ouvrez l’app dedans pour le Bluetooth.') : T('btNo')) + '</div>';
  h += '<div class="card">' + livePickHtml(items, it);
  if (it && !LS.pickOpen) {
    h += '<div class="fr" style="margin-top:10px">' + (LS.key === 'step' ? '<div class="f"><label>' + T('protocol') + '</label><select id="ls-p">' + Object.keys(C.PROTOCOLS).map(function (k) { return '<option value="' + k + '"' + (k === LS.pid ? ' selected' : '') + '>' + C.PROTOCOLS[k].label + '</option>'; }).join('') + '</select></div>' : '') +
      (land || spx.run ? '' : '<div class="f"><label>' + T('pool') + '</label><select id="ls-pool"><option value="25">25 m</option><option value="50"' + (LS.pool === '50' ? ' selected' : '') + '>50 m</option></select></div>') + '</div>' +
      (land ? '' : splitPickHtml(spx)) +
      (spx.forceAll ? '<div class="small muted" style="margin-bottom:6px">' + A('الانطلاق: الكل مع بعض (نفس البيبات).', 'Départ : tous ensemble (mêmes bips).') + '</div>' : '<label>' + A('الانطلاق', 'Départ') + '</label><div class="seg" style="margin-bottom:8px">') + (spx.forceAll ? '' : [['all', A('الكل مع بعض', 'Tous ensemble')], ['stagger', A('بفاصل', 'Décalé')], ['solo', A('كل واحد وحدو', 'Chacun son départ')]].map(function (m) { return '<button type="button" class="btn sm' + (LS.mode === m[0] ? ' on' : '') + '" data-lm="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>') +
      (LS.mode === 'stagger' && !spx.forceAll ? '<div class="f" style="max-width:220px"><label>' + A('الفاصل بين السباحين (ث)', 'Écart entre nageurs (s)') + '</label><input id="ls-gap" class="num mono" inputmode="numeric" value="' + LS.gap + '"></div>' : '') +
      '<div class="small muted">' + esc(it.desc || '') + '</div>' + liveHowHtml(it, spx);
  }
  h += '</div>';
  h += '<div class="grid g2">' + [0, 1, 2, 3].map(function (i) {
    var sid = LS.sids[i], st = sid ? sensState(sid) : null, used = LS.sids.filter(function (x, j) { return x && j !== i; });
    return '<div class="card"><div class="row" style="margin-bottom:8px"><span class="ic" style="width:36px;height:36px;font:700 17px Rubik">' + (i + 1) + '</span><select data-ls="' + i + '" class="sp" style="min-width:150px"><option value="">— ' + A('سباح', 'Nageur') + ' —</option>' + sw0.filter(function (s) { return used.indexOf(s.id) < 0; }).map(function (s) { return '<option value="' + esc(s.id) + '"' + (s.id === sid ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select></div>' +
      (sid ? '<div class="row"><div class="num" id="ls-hr-' + i + '" style="font:700 40px Rubik;color:var(--bad);min-width:90px">' + (st.hr || '--') + '</div><div class="sp"><div class="small" id="ls-st-' + i + '" style="color:var(--' + (st.cls === 'ok' ? 'ok' : st.cls === 'warn' ? 'warn' : 'mute') + ')">' + st.txt + '</div>' + (remembered[sid] && !SENS[sid] ? '<div class="small muted">' + A('آخر حساس: ', 'Dernier capteur : ') + esc(remembered[sid]) + '</div>' : '') + '</div>' +
        '<button type="button" class="btn sm' + (SENS[sid] ? '' : ' pri') + '" data-sc="' + i + '">' + (SENS[sid] ? A('بدّل', 'Changer') : A('ربط الحساس', 'Connecter')) + '</button>' + (SENS[sid] ? '<button type="button" class="btn sm dan" data-so="' + i + '">✕</button>' : '') + '</div>' : '<div class="small muted">' + A('اختار سباح', 'Choisissez un nageur') + '</div>') + '</div>';
  }).join('') + '</div>';
  var nSw = LS.sids.filter(Boolean).length;
  h += '<div class="row" style="margin-top:6px"><button class="btn pri big" id="ls-go"' + (!it || !nSw ? ' disabled' : '') + '>▶ ' + A('ابدا الاختبار', 'Démarrer le test') + ' (' + nSw + ')</button><span class="small muted">' + (it ? '' : A('اختار الاختبار الفوق. ', 'Choisissez le test. ')) + A('العد التنازلي 5 ثواني. البلوتوث ما يحتاجش أنترنت.', 'Compte à rebours 5 s. Le Bluetooth n’a pas besoin d’internet.') + '</span></div>';
  app.innerHTML = h;
  $('#bk').onclick = function () { route('home'); };
  $$('[data-lenv]').forEach(function (b) { b.onclick = function () { LS.env = b.dataset.lenv; render(); }; });
  $$('[data-lk]').forEach(function (b) { b.onclick = function () { LS.key = b.dataset.lk; LS.pickOpen = false; render(); }; });
  if ($('#ls-chg')) $('#ls-chg').onclick = function () { LS.pickOpen = true; LS.env = it ? liveEnv(it) : LS.env; render(); };
  if ($('#ls-p')) $('#ls-p').onchange = function () { LS.pid = this.value; };
  if ($('#ls-pool')) $('#ls-pool').onchange = function () { LS.pool = this.value; render(); };
  if ($('#ls-gap')) $('#ls-gap').oninput = function () { LS.gap = Math.max(1, C.num(this.value) || 10); };
  $$('[data-lm]').forEach(function (b) { b.onclick = function () { LS.mode = b.dataset.lm; render(); }; });
  $$('[data-lsp]').forEach(function (b) { b.onclick = function () { LS.split = +b.dataset.lsp; render(); }; });
  $$('[data-ls]').forEach(function (sel) { sel.onchange = function () { LS.sids[+sel.dataset.ls] = this.value; render(); }; });
  $$('[data-sc]').forEach(function (b) { b.onclick = function () { sensConnect(LS.sids[+b.dataset.sc]); }; });
  $$('[data-so]').forEach(function (b) { b.onclick = function () { sensOff(LS.sids[+b.dataset.so]); render(); }; });
  $('#ls-go').onclick = function () {
    var it2 = liveItems().find(function (x) { return x.key === LS.key; }), sp = liveSpec(it2, LS.pid); if (!it2 || !sp) return;
    LV = { key: LS.key, it: it2, spec: sp, mode: LS.mode, gap: LS.gap || 10, pool: sp.land ? 'land' : sp.run ? 'run' : LS.pool, split: sp.land ? 0 : splitOpts(sp).indexOf(+LS.split) >= 0 ? +LS.split : 0, date: today(), lanes: LS.sids.filter(Boolean).map(function (sid) { return { sid: sid, smp: [], reps: [] }; }) };
    lvStart();
  };
}
// ⏱ قبل الاختبار: المدرب يختار كل قداش ياخذ الوقت (25 / 50 / 100) ولا الوصول برك
function splitOpts(sp) {
  if (sp.run) return sp.dur ? [100, 200, 400] : [];
  var pl = +LS.pool || 25, mx = sp.dur ? 1e9 : Math.max.apply(null, (sp.dists || [sp.dist || 0]));
  return [25, 50, 100].filter(function (v) { return v >= pl && v % pl === 0 && v < mx; });
}
function splitPickHtml(sp) {
  if (!sp) return '';
  var o = splitOpts(sp); if (o.indexOf(+LS.split) < 0) LS.split = 0;
  if (!o.length) return '';
  return '<label>⏱ ' + (sp.run ? A('طول الدورة (لمسة في كل دورة)', 'Longueur du tour (touche à chaque tour)') : A('الأوقات المتقطعة', 'Temps intermédiaires')) + '</label><div class="seg" style="margin-bottom:8px">' +
    [[0, sp.dur ? A('بلا لمسات (نكتب المسافة في اللخر)', 'Sans touches (distance à la fin)') : A('وقت الوصول برك', 'Arrivée seulement')]].concat(o.map(function (v) { return [v, (sp.run ? A('دورة ', 'tour ') : A('كل ', 'tous les ')) + v + A(' م', ' m')]; }))
      .map(function (x) { return '<button type="button" class="btn sm' + (+LS.split === x[0] ? ' on' : '') + '" data-lsp="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
}
// كيفاش يخدم الاختبار هذا في اللايف (سطر قصير للمدرب)
function liveHowHtml(it, sp) {
  if (!sp) return '';
  var t;
  if (sp.land === 'leger') t = A('البيبات تخرج من الهاتف للكل. كي يحبس سباح (ما لحقش الخط مرتين) اضغط «⏹ وقف» في الخانة تاعو: المرحلة والذهاب والإياب يتسجلو وحدهم، والنبض الأقصى والاسترجاع 60 ث.', 'Bips pour tous. Quand un nageur s’arrête (2 lignes manquées), « ⏹ Stop » dans sa case : palier, navette, FC max et récup 60 s enregistrés.');
  else if (sp.land === 'rest') t = A('السباحين راقدين ساكتين 5 دقايق بالحساس. النتيجة = متوسط آخر 2 دقايق، تتحسب وحدها.', 'Allongés au calme 5 min avec le capteur. Résultat = moyenne des 2 dernières minutes.');
  else if (sp.land === 'any') t = A('الكرونو والنبض يتسجلو. اضغط «⏹ وقف» كي يكمّل، ومن بعد تكتب النتيجة.', 'Chrono et FC enregistrés. « ⏹ Stop » à la fin, puis saisissez le résultat.');
  else if (sp.run && !sp.dur) t = A('تضغط ▶ كي ينطلق و«🏁 وصل» كي يقطع خط 30 م. المحاولة الثانية: ▶ من جديد بعد الراحة.', '▶ au départ, « 🏁 Arrivée » aux 30 m. 2e essai : ▶ après la récup.');
  else if (sp.land === 'ruff') t = A('1 دقيقة راحة (P0) ← 45 ث: 30 squat مع الصوت (bip كل 1.5 ث) ← يرقد دقيقة (P1 وP2). كلش يتحسب وحدو من الحساس.', '1 min repos (P0) ← 45 s : 30 squats au bip (toutes les 1,5 s) ← allongé 1 min (P1, P2). Tout est calculé par le capteur.');
  else if (sp.land === 'count') t = A('العمل والراحة بالعداد والصوت. في اللخر تكتب العدد تاع كل سلسلة.', 'Travail et récup au chrono et au bip. À la fin, saisissez le nombre de chaque série.');
  else if (sp.land === 'meas') t = A('تضغط «⏹ وقف» كي يحبس السباح، والوقت يتسجل وحدو.', 'Appuyez « ⏹ Stop » quand le nageur s’arrête : le temps est enregistré.');
  else if (sp.dur) t = +LS.split ? A('اضغط «⏱ لمسة» كل ' + LS.split + ' م: التطبيق يحسب المسافة ووقت كل ' + LS.split + ' م. في اللخر تزيد الأمتار اللي بقاو.', 'Appuyez « ⏱ Touche » tous les ' + LS.split + ' m : distance et temps calculés ; ajoutez les mètres restants à la fin.') : A('العداد يخدم وحدو حتى اللخر، ومن بعد تكتب المسافة الكلية.', 'Le chrono tourne jusqu’à la fin ; saisissez ensuite la distance totale.');
  else t = +LS.split ? A('اضغط «⏱ لمسة» كل ' + LS.split + ' م، واللمسة الأخيرة تولي «🏁 وصل» وحدها. الزر الصغير 🏁 = وصل مباشرة.', 'Appuyez « ⏱ Touche » tous les ' + LS.split + ' m ; la dernière devient « 🏁 Arrivée ». Petit 🏁 = arrivée directe.') : A('تضغط «🏁 وصل» غير كي يوصل السباح.', 'Appuyez « 🏁 Arrivée » seulement à l’arrivée.');
  return '<div class="info" style="margin-top:10px">💡 ' + t + '</div>';
}

/* --- الشاشة 2: لايف --- */
var PH_L = { pre: ['🪑 راحة قبل الجهد', '🪑 Repos avant'], work: ['💪 عمل', '💪 Travail'], rest: ['😮‍💨 راحة', '😮‍💨 Récup'], meas: ['⏱ يقيس…', '⏱ En cours…'], post: ['🛌 استرجاع (راقد)', '🛌 Récup (allongé)'] };
function lvStateTxt(L) {
  var t = lvNow(), sp = LV.spec;
  if (L.state === 'lg') { var G = LV.lg; return '🏃 ' + A('المرحلة ', 'Palier ') + G.stage + ' · ' + G.sh + '/' + C.legerShuttles(G.stage) + ' · ' + C.legerSpeed(G.stage).toFixed(1) + ' km/h'; }
  if (L.state === 'land') {
    var ph = sp.phases[L.pi], el = t - L.pStart, nSets = sp.phases.filter(function (p) { return p.k === 'work' || p.k === 'meas'; }).length;
    var lab = Tv(PH_L[ph.k]) + (sp.land === 'ruff' && ph.k === 'work' ? ' · 30 squat' : '') + (ph.si != null && nSets > 1 ? ' · ' + A('سلسلة ', 'série ') + (ph.si + 1) + (ph.ri != null && ph.ri > 0 ? '.' + (ph.ri + 1) : '') : '');
    return lab + (ph.dur ? ' · ' + A('باقي ', 'reste ') + Math.max(0, Math.ceil(ph.dur - el)) + A(' ث', ' s') : '');
  }
  return { wait: L.startAt != null ? A('يبدا بعد ', 'Départ dans ') + Math.max(0, Math.ceil(L.startAt - t)) + A(' ث', ' s') : A('يستنى ▶', 'Attend ▶'), swim: A('يسبح', 'Nage'), rest: A('راحة · ينطلق بعد ', 'Récup · départ dans ') + Math.max(0, Math.ceil(L.nextAt - t)) + A(' ث', ' s'), ready: A('راحة · اضغط ▶ كي يبدا', 'Récup · ▶ au départ'), rec60: A('استرجاع 60 ث · ', 'Récup 60 s · ') + Math.max(0, Math.ceil(L.end + 60 - t)), done: '✅ ' + A('كمّل', 'Terminé') }[L.state] || '';
}
function vLive(app) {
  if (!LV) return route('liveSetup');
  var sp = LV.spec, nm = LV.it.name + (sp.pid ? ' · ' + C.PROTOCOLS[sp.pid].label : '');
  var h = '<div class="row" style="margin-bottom:12px"><div class="sp"><h1 style="margin:0">⏱ ' + esc(nm) + '</h1><div class="small muted">' + fmtDate(LV.date) + (sp.land ? ' · 🏋' : sp.run ? ' · 🏃' : ' · ' + LV.pool + ' m') + ' · ' + { all: A('الكل مع بعض', 'Tous ensemble'), stagger: A('بفاصل ', 'Décalé ') + LV.gap + A(' ث', ' s'), solo: A('كل واحد وحدو', 'Chacun son départ') }[LV.mode] + '</div></div>' +
    '<div class="num" id="lv-clock" style="font:700 40px Rubik;min-width:130px;text-align:center">0:00</div><button class="btn dan big" id="lv-end">■ ' + A('إنهاء', 'Terminer') + '</button></div>';
  h += '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr))">' + LV.lanes.map(function (L, i) {
    var s = sw(L.sid) || {}, info;
    if (sp.land) info = '<span id="lv-rep-' + i + '"></span>';
    else if (sp.dur) info = (sp.run ? A('الدورات', 'Tours') : A('الطولات', 'Longueurs')) + ' <b class="num" id="lv-rep-' + i + '" style="color:var(--ink)">0</b> · ' + A('المسافة', 'Distance') + ' <b class="num" id="lv-last-' + i + '" style="color:var(--ink)">0 m</b>';
    else info = A('التكرار', 'Rép.') + ' <b class="num" id="lv-rep-' + i + '" style="color:var(--ink)">0/' + sp.n + '</b> · ' + A('السابق', 'Préc.') + ' <b class="num" id="lv-last-' + i + '" style="color:var(--ink)">—</b>';
    return '<div class="card" style="margin:0;display:flex;flex-direction:column;gap:8px"><div class="row"><span class="ic" style="width:38px;height:38px;font:700 18px Rubik;background:var(--blue);color:#fff">' + (i + 1) + '</span><b class="sp" style="font-size:20px">' + esc(s.name || '') + '</b><span class="small" id="lv-sn-' + i + '"></span></div>' +
      '<div class="row" style="align-items:flex-end;gap:16px"><div><div class="num" id="lv-hr-' + i + '" style="font:700 80px/0.95 Rubik;color:var(--bad)">--</div><div class="small muted">bpm</div></div>' +
      '<div class="sp"><div style="font-weight:700" id="lv-st-' + i + '"></div><div class="small muted">' + info + '</div>' +
      '<div class="num" id="lv-cur-' + i + '" style="font:700 30px Rubik">0:00.0</div><div class="small muted num" id="lv-sp-' + i + '"></div></div></div>' +
      '<div class="row" style="margin-top:auto">' + (sp.land ? '' : '<button type="button" class="btn" data-lu="' + i + '" style="min-height:64px">↩ ' + A('تراجع', 'Annuler') + '</button>') +
      '<button type="button" class="btn" data-lg="' + i + '" style="min-height:64px;font-size:18px">▶</button>' +
      (sp.land === 'ruff' || sp.land === 'count' || sp.land === 'rest' ? '' : '<button type="button" class="btn pri" data-lt="' + i + '" style="flex:1;min-height:72px;font-size:24px;justify-content:center">🏁</button>') +
      (!sp.land && !sp.dur ? '<button type="button" class="btn" data-la="' + i + '" title="' + A('وصل مباشرة', 'Arrivée directe') + '" style="min-height:64px;font-size:20px">🏁</button>' : '') + '</div></div>';
  }).join('') + '</div>';
  app.innerHTML = h;
  $('#lv-end').onclick = function () { var open = LV.lanes.some(function (L) { return L.state !== 'done'; }); if (!open || confirm(A('نوقفو الاختبار؟ النتائج اللي تسجلت تبقى.', 'Arrêter le test ? Les résultats saisis sont conservés.'))) lvFinish(); };
  $$('[data-lt]').forEach(function (b) { b.onclick = function () { lvTouch(+b.dataset.lt); }; });
  $$('[data-la]').forEach(function (b) { b.onclick = function () { lvArrive(+b.dataset.la); }; });
  $$('[data-lu]').forEach(function (b) { b.onclick = function () { lvUndo(+b.dataset.lu); }; });
  $$('[data-lg]').forEach(function (b) { b.onclick = function () { lvGo(+b.dataset.lg); }; });
  lvPaint();
}
function lapTimes(r) { var a = [], p = r.s; (r.sp || []).forEach(function (x) { a.push(x - p); p = x; }); a.push(r.e - p); return a; }
function lvPaint() {
  if (S.view === 'liveSetup' && LS) { LS.sids.forEach(function (sid, i) { if (!sid) return; var st = sensState(sid), e = $('#ls-hr-' + i), f = $('#ls-st-' + i); if (e) e.textContent = st.hr || '--'; if (f) { f.innerHTML = st.txt; f.style.color = 'var(--' + (st.cls === 'ok' ? 'ok' : st.cls === 'warn' ? 'warn' : 'mute') + ')'; } }); return; }
  if (S.view !== 'live' || !LV) return;
  var t = LV.running ? lvNow() : LV.T1 || 0, ck = $('#lv-clock'), sp = LV.spec, pl = +LV.split || +LV.pool || 25; if (ck) ck.textContent = t < 0 ? '0:00' : F(t, 0);
  LV.lanes.forEach(function (L, i) {
    var st = sensState(L.sid), hr = $('#lv-hr-' + i), sn = $('#lv-sn-' + i);
    if (hr) { hr.textContent = st.hr || '--'; hr.style.color = st.lost ? 'var(--mute)' : 'var(--bad)'; }
    if (sn) { sn.innerHTML = st.txt; sn.style.color = 'var(--' + (st.cls === 'ok' ? 'ok' : st.cls === 'warn' ? 'warn' : 'mute') + ')'; }
    var se = $('#lv-st-' + i); if (se) se.textContent = lvStateTxt(L);
    var cur = $('#lv-cur-' + i), rp = $('#lv-rep-' + i), la = $('#lv-last-' + i), spl = $('#lv-sp-' + i), bt = $('[data-lt="' + i + '"]'), ba = $('[data-la="' + i + '"]');
    if (sp.land === 'leger') {
      if (cur) cur.textContent = L.first != null ? F((L.end != null ? L.end : t) - L.first, 0) : '0:00';
      if (rp) rp.textContent = L.lgStage ? A('وقف في المرحلة ', 'Arrêt palier ') + L.lgStage + ' · ' + L.lgSh : '';
      if (bt) { bt.disabled = L.state !== 'lg'; bt.textContent = '⏹ ' + A('وقف', 'Stop'); }
    } else if (sp.land) {
      var ph = L.state === 'land' ? sp.phases[L.pi] : null;
      if (cur) cur.textContent = ph ? (ph.dur ? F(Math.max(0, ph.dur - (t - L.pStart)), 0) : F(t - L.pStart, 1)) : L.first != null ? '✓' : '0:00';
      if (rp) rp.textContent = L.ph ? L.ph.filter(function (p) { return p.k === 'work' || p.k === 'meas'; }).length + '/' + sp.phases.filter(function (p) { return p.k === 'work' || p.k === 'meas'; }).length : '';
      if (bt) { bt.disabled = !(ph && ph.k === 'meas'); bt.textContent = '⏹ ' + A('وقف', 'Stop'); }
    } else {
      if (cur) cur.textContent = L.state === 'swim' ? F(t - (sp.dur ? L.first : L.repStart), 1) : L.reps.length ? F(L.reps[L.reps.length - 1].e - L.reps[L.reps.length - 1].s, 1) : L.state === 'rec60' && sp.dur ? F(sp.dur, 0) : '0:00.0';
      if (sp.dur) {
        if (rp) rp.textContent = L.laps.length; if (la) la.textContent = L.laps.length * pl + A(' م', ' m');
        if (spl) { var lp = L.laps.length ? L.laps[L.laps.length - 1] - (L.laps.length > 1 ? L.laps[L.laps.length - 2] : L.first) : null; spl.textContent = lp ? A('آخر طولة ', 'Dernière longueur ') + F(lp, 1) : ''; }
        if (bt) { bt.disabled = L.state !== 'swim'; bt.style.display = +LV.split ? '' : 'none'; bt.textContent = '⏱ ' + A('لمسة', 'Touche') + ' · ' + ((L.laps.length + 1) * pl) + A(' م', ' m'); }
      } else {
        if (rp) rp.textContent = L.reps.length + '/' + sp.n;
        if (la) la.textContent = L.reps.length ? F(L.reps[L.reps.length - 1].e - L.reps[L.reps.length - 1].s, 1) : '—';
        var laps = lapsOf(sp, L.reps.length), k = L.sp.length;
        if (spl) { var pv = L.repStart, ps = L.sp.map(function (x) { var d = x - pv; pv = x; return F(d, 1); }); spl.textContent = ps.length ? ps.join(' · ') : ''; }
        if (bt) { bt.disabled = L.state !== 'swim'; bt.textContent = laps > 1 && k + 1 < laps ? '⏱ ' + A('لمسة', 'Touche') + ' · ' + ((k + 1) * pl) + A(' م', ' m') : '🏁 ' + A('وصل', 'Arrivée'); }
        if (ba) { ba.disabled = L.state !== 'swim'; ba.style.display = laps > 1 && k + 1 < laps ? '' : 'none'; }
      }
    }
    var bg = $('[data-lg="' + i + '"]'); if (bg) bg.style.display = (L.state === 'wait' && L.startAt == null) || L.state === 'ready' ? '' : 'none';
    var bu = $('[data-lu="' + i + '"]'); if (bu) bu.disabled = !(L.reps.length || (L.sp && L.sp.length) || (L.laps && L.laps.length));
  });
}

/* --- الحسابات بعد الاختبار --- */
function lvHrAt(L, e) { var w = L.smp.filter(function (x) { return x[0] >= e - 3 && x[0] <= e + 10; }); return w.length ? Math.max.apply(null, w.map(function (x) { return x[1]; })) : null; }
function lvMean(L, a, b) { var w = L.smp.filter(function (x) { return x[0] >= a && x[0] <= b; }); return w.length ? Math.round(w.reduce(function (q, x) { return q + x[1]; }, 0) / w.length) : null; }
function lvMax(L, a, b) { var w = L.smp.filter(function (x) { return x[0] >= a && x[0] <= b; }); return w.length ? Math.max.apply(null, w.map(function (x) { return x[1]; })) : null; }
function lvHr60(L) { if (L.end == null) return null; var w = L.smp.filter(function (x) { return Math.abs(x[0] - (L.end + 60)) <= 3; }); return w.length ? Math.round(w.reduce(function (a, x) { return a + x[1]; }, 0) / w.length) : null; }
function lvWin(L) { var a = L.first != null ? L.first : 0, b = L.end != null ? L.end : (LV.T1 || a); return L.smp.filter(function (x) { return x[0] >= a && x[0] <= b + 1; }); }
function lvPeak(L) { var w = lvWin(L); return w.length ? Math.max.apply(null, w.map(function (x) { return x[1]; })) : null; }
function lvAvg(L) { var w = lvWin(L); return w.length ? Math.round(w.reduce(function (a, x) { return a + x[1]; }, 0) / w.length) : null; }
function lvGap(L) { // ثواني بلا نبض أثناء الاختبار
  if (L.first == null) return 0; var a = L.first, b = L.end != null ? L.end : (LV.T1 || a), w = lvWin(L), g = 0, prev = a;
  w.forEach(function (x) { if (x[0] - prev > 3) g += x[0] - prev; prev = x[0]; }); if (b - prev > 3) g += b - prev; return Math.round(g);
}
function lvRel(L) { var o = L.first || 0, a = (L.end != null ? L.end : (LV.T1 || 0)) + 75; return L.smp.filter(function (x) { return x[0] >= o - 30 && x[0] <= a; }).map(function (x) { return { t: x[0] - o, hr: x[1] }; }); }
// Ruffier: P0 = آخر 30 ث تاع الراحة · P1 = أول 15 ث بعد · P2 = من 45 حتى 60 ث بعد
function lvRuff(L) {
  var pre = (L.ph || []).find(function (p) { return p.k === 'pre'; }), wk = (L.ph || []).find(function (p) { return p.k === 'work'; }); if (!pre || !wk) return {};
  return { p0: lvMean(L, pre.e - 30, pre.e), p1: lvMean(L, wk.e, wk.e + 15), p2: lvMean(L, wk.e + 45, wk.e + 60) };
}
function lvSets(L) { return (L.ph || []).filter(function (p) { return p.k === 'work' || p.k === 'meas'; }); }
function lvRecord(L, asks) {
  var it = LV.it, sp = LV.spec, times = L.reps.map(function (r) { return r.e - r.s; }), hrs = L.reps.map(function (r) { return lvHrAt(L, r.e); });
  var now = new Date(), cond = { pool: LV.pool, timing: 'live', hour: ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) };
  var live = { peak: lvPeak(L), avg: lvAvg(L), hr60: lvHr60(L), gap: lvGap(L), sensor: SENS[L.sid] ? SENS[L.sid].name : '', pool: LV.pool }, smp = lvRel(L);
  var d, type, splits = null;
  if (sp.dur && L.laps && L.laps.length) { var pv = L.first; splits = [L.laps.map(function (x) { var q = x - pv; pv = x; return +q.toFixed(1); })]; }
  else if (L.reps.some(function (r) { return r.sp && r.sp.length; })) splits = L.reps.map(function (r) { return lapTimes(r).map(function (q) { return +q.toFixed(1); }); });
  if (it.key === 'step') { type = 'step'; d = { protocol: sp.pid, reps: times.map(function (x, i) { return { time: F(x, 1), hr: hrs[i] || '', lac: '', rpe: '' }; }), peak: live.peak || '', hr60: live.hr60 || '', hrmax: '', hrSrc: 'live', offset: '0:00', pool: LV.pool }; }
  else if (it.key === '400') { type = '400'; d = { dist: '400', time: times[0] != null ? F(times[0], 2) : '', hrEnd: hrs[0] || '', hr60: live.hr60 || '', sr: '', hrSrc: 'live', pool: LV.pool }; }
  else if (it.key === 'leger') { type = 'leger'; d = { stage: asks.stage || '', shuttle: asks.shuttle || '', hrmax: live.peak || '', hr60: live.hr60 || '', lastDone: '' }; }
  else if (it.key === 'rest') { type = 'rest'; d = { rows: asks.bpm ? [{ date: LV.date, bpm: asks.bpm, rmssd: '' }] : [] }; }
  else if (it.key === 'css') { type = 'css'; d = { d1: '400', t1: times[0] != null ? F(times[0], 2) : '', hr1: hrs[0] || '', d2: '200', t2: times[1] != null ? F(times[1], 2) : '', hr2: hrs[1] || '', pool: LV.pool }; }
  else {
    type = 'bt'; d = { test: it.bt.id, cond: cond };
    if (sp.land) {
      var sets = lvSets(L);
      if (sp.land === 'ruff') { d.p0 = asks.p0 || ''; d.p1 = asks.p1 || ''; d.p2 = asks.p2 || ''; }
      else if (sp.land === 'any') sp.inputs.forEach(function (x) { d[x.k] = asks[x.k] || ''; });
      else if (sp.proto) {
        var pr = JSON.parse(JSON.stringify(sp.proto)); delete pr.note; d.proto = pr; d.vals = []; d.hr = []; d.rpe = '';
        sets.forEach(function (p, k) { var v = asks['v' + k]; if (v == null || v === '') return; (d.vals[p.si] = d.vals[p.si] || [])[p.ri || 0] = v; var m = lvMax(L, p.s, p.e + 10); if (m) d.hr[p.si] = Math.max(d.hr[p.si] || 0, m); });
        d.vals = d.vals.map(function (r) { return r || []; }); d.hr = d.hr.map(function (x) { return x || ''; });
      }
      else if (sp.land === 'count') d.n = asks.v0 || '';
      else d.s = asks.v0 || '';
    }
    else if (sp.proto) { var pr2 = JSON.parse(JSON.stringify(sp.proto)); delete pr2.note; d.proto = pr2; d.vals = []; d.hr = []; d.rpe = '';
      times.forEach(function (x, i) { var si = Math.floor(i / sp.setSize); (d.vals[si] = d.vals[si] || []).push(F(x, 2)); if ((i + 1) % sp.setSize === 0 || i === times.length - 1) d.hr[si] = hrs[i] || ''; }); }
    else if (sp.dur) (sp.ask || []).forEach(function (a) { d[a[0]] = asks[a[0]] || ''; });
    else if (sp.n === 1) d.t = times[0] != null ? F(times[0], 2) : '';
    else times.forEach(function (x, i) { d['r' + (i + 1)] = F(x, 2); });
  }
  d.live = live; if (smp.length) d.samples = pack(smp);
  d.hrDur = Math.round(((L.end != null ? L.end : LV.T1 || 0) - (L.first || 0)) * 10) / 10; d.hrSrc = 'live';
  if (splits) { d.splits = splits; d.splitM = +LV.split; }
  return { id: uid(), swimmerId: L.sid, type: type, date: LV.date, data: d, notes: '' };
}

/* --- الشاشة 3: النتائج --- */
function vLiveRes(app) {
  if (!LV) return route('home');
  var sp = LV.spec, n = Math.max.apply(null, LV.lanes.map(function (L) { return L.reps.length; }).concat([sp.n || 0]));
  var h = '<h1>✅ ' + esc(LV.it.name) + ' · ' + A('النتائج', 'Résultats') + '</h1><div class="small muted" style="margin:-6px 0 12px">' + fmtDate(LV.date) + ' · ' + A('كل سباح تتحفظ نتيجتو في ملفو وحدو', 'Chaque nageur est enregistré dans sa propre fiche') + '</div>';
  var heads, cellsOf;
  if (sp.land === 'leger') {
    heads = '<th>' + A('المرحلة', 'Palier') + '</th><th>' + A('الذهاب والإياب', 'Navette') + '</th>';
    cellsOf = function (L, li) { return '<td><input data-ask="' + li + '" data-k="stage" class="num" inputmode="numeric" value="' + (L.lgStage || '') + '" style="min-width:60px"></td><td><input data-ask="' + li + '" data-k="shuttle" class="num" inputmode="numeric" value="' + (L.lgSh != null ? L.lgSh : '') + '" style="min-width:60px"></td>'; };
  } else if (sp.land === 'rest') {
    heads = '<th>' + A('نبض الراحة (متوسط آخر 2 د)', 'FC repos (moy. 2 dern. min)') + '</th>';
    cellsOf = function (L, li) { var e = L.end != null ? L.end : (LV.T1 || 0), v = L.first != null ? lvMean(L, e - 120, e) : null; return '<td><input data-ask="' + li + '" data-k="bpm" class="num" inputmode="numeric" value="' + (v || '') + '" style="min-width:80px"></td>'; };
  } else if (sp.land === 'any') {
    heads = sp.inputs.map(function (x) { return '<th>' + esc(x.l) + (x.u ? ' <span class="small muted">(' + esc(x.u) + ')</span>' : '') + '</th>'; }).join('');
    cellsOf = function (L, li) { return sp.inputs.map(function (x) { return '<td><input data-ask="' + li + '" data-k="' + esc(x.k) + '" class="num" inputmode="decimal" style="min-width:80px"></td>'; }).join(''); };
  } else if (sp.land === 'ruff') {
    heads = ['P0', 'P1', 'P2', A('المؤشر', 'Indice')].map(function (x) { return '<th>' + x + '</th>'; }).join('');
    cellsOf = function (L, li) { var r = lvRuff(L); return ['p0', 'p1', 'p2'].map(function (k) { return '<td><input data-ask="' + li + '" data-k="' + k + '" class="num" inputmode="numeric" value="' + (r[k] || '') + '" style="min-width:70px"></td>'; }).join('') + '<td class="num" style="font-weight:700" id="ruf-' + li + '">—</td>'; };
  } else if (sp.land) {
    var nS = sp.phases.filter(function (p) { return p.k === 'work' || p.k === 'meas'; }).length;
    heads = Array.apply(null, Array(nS)).map(function (_, k) { return '<th>' + (nS > 1 ? A('سلسلة ', 'Série ') + (k + 1) : sp.land === 'count' ? A('العدد', 'Nombre') : A('الوقت (ث)', 'Temps (s)')) + '</th>'; }).join('');
    cellsOf = function (L, li) { var ss = lvSets(L); return Array.apply(null, Array(nS)).map(function (_, k) { var p = ss[k], v = p && sp.land === 'meas' && sp.unitS ? R(p.e - p.s, 1) : '', m = p ? lvMax(L, p.s, p.e + 10) : null; return '<td>' + (p ? '<input data-ask="' + li + '" data-k="v' + k + '" class="num" inputmode="decimal" value="' + v + '" placeholder="' + (sp.land === 'count' ? A('العدد', 'nb') : 's') + '" style="min-width:70px"><div class="small" style="color:var(--bad)">♥ ' + (m || '—') + '</div>' : '<span class="muted">—</span>') + '</td>'; }).join(''); };
  } else if (sp.dur) {
    heads = (sp.ask || []).map(function (a) { return '<th>' + Tv([a[1], a[2]]) + '</th>'; }).join('');
    cellsOf = function (L, li) { return (sp.ask || []).map(function (a) { var pre = a[0] === 'dist' && L.laps && L.laps.length ? L.laps.length * (+LV.split || 25) : ''; return '<td><input data-ask="' + li + '" data-k="' + a[0] + '" class="num" inputmode="decimal" value="' + pre + '" style="min-width:90px">' + (pre ? '<div class="small muted">' + L.laps.length + ' ' + A('طولة + الباقي', 'long. + reste') + '</div>' : '') + '</td>'; }).join(''); };
  } else {
    heads = Array.apply(null, Array(n)).map(function (_, i) { return '<th>' + (i + 1) + '</th>'; }).join('');
    cellsOf = function (L) { return Array.apply(null, Array(n)).map(function (_, i) { var r = L.reps[i]; if (!r) return '<td class="muted">—</td>'; var hh = lvHrAt(L, r.e), lt = r.sp && r.sp.length ? lapTimes(r) : null; return '<td class="num"' + (hh ? '' : ' style="background:var(--warnbg)"') + '><div style="font-weight:700">' + F(r.e - r.s, 1) + '</div>' + (lt ? '<div class="small muted" style="white-space:nowrap">' + lt.map(function (q) { return F(q, 1); }).join(' · ') + '</div>' : '') + '<div class="small" style="color:' + (hh ? 'var(--bad)' : 'var(--warn)') + '">♥ ' + (hh || '—') + '</div></td>'; }).join(''); };
  }
  h += '<div class="card"><div class="tbl-wrap"><table><tr><th style="text-align:start">' + T('name') + '</th>' + heads +
    '<th>' + A('أعلى نبض', 'FC max') + '</th><th>' + A('المتوسط', 'Moy.') + '</th>' + (sp.land === 'ruff' || sp.land === 'rest' ? '' : '<th>' + A('استرجاع 60 ث', 'Récup 60 s') + '</th>') + '<th></th></tr>' + LV.lanes.map(function (L, li) {
      var s = sw(L.sid) || {}, pk = lvPeak(L), h60 = lvHr60(L), gap = lvGap(L), hrr = pk && h60 ? pk - h60 : null, none = L.first == null || (!sp.land && !sp.dur && !L.reps.length);
      return '<tr><td style="text-align:start"><b>' + esc(s.name || '') + '</b>' + (gap > 3 ? '<div class="small" style="color:var(--warn)">' + A('بلا نبض ', 'Sans FC ') + gap + A(' ث', ' s') + '</div>' : '') + (none ? '<div class="small" style="color:var(--bad)">' + A('ما تسجل والو', 'Rien d’enregistré') + '</div>' : '') + '</td>' + cellsOf(L, li) +
        '<td class="num" style="font-weight:700">' + (pk || '—') + '</td><td class="num">' + (lvAvg(L) || '—') + '</td>' + (sp.land === 'ruff' || sp.land === 'rest' ? '' : '<td class="num">' + (hrr != null ? hrr : '—') + '</td>') +
        '<td><label class="row" style="gap:6px;margin:0;font-weight:600;color:var(--ink)"><input type="checkbox" data-keep="' + li + '"' + (none ? '' : ' checked') + ' style="width:22px;height:22px;min-height:0"> ' + A('نحفظ', 'Garder') + '</label></td></tr>';
    }).join('') + '</table></div></div>';
  h += '<div class="info" style="margin-bottom:12px">' + (sp.land ? A('تقدر تصحح أي رقم قبل الحفظ. ♥ = أعلى نبض في كل سلسلة.', 'Vous pouvez corriger chaque valeur avant d’enregistrer. ♥ = FC max de chaque série.') : A('الخانات الصفرا = النبض ما وصلش في ذيك اللحظة (تحت الماء). بعد الحفظ تقدر تكمّلها من «⌚ Polar» في صفحة الاختبار إذا السباح مربوط.', 'Cases jaunes : FC non reçue (sous l’eau). Après l’enregistrement, complétez via « ⌚ Polar » dans le test si le nageur est connecté.')) + '</div>';
  h += '<div class="row"><button class="btn pri big" id="lr-save">💾 ' + T('saveAll') + '</button><button class="btn" id="lr-back">↩ ' + A('رجوع للاختبار', 'Retour au test') + '</button><span class="sp"></span><button class="btn dan" id="lr-drop">' + A('إلغاء بلا حفظ', 'Abandonner') + '</button></div>';
  app.innerHTML = h;
  if (sp.land === 'ruff') { var ruf = function (li) { var g = function (k) { var e = $('[data-ask="' + li + '"][data-k="' + k + '"]'); return e ? C.num(e.value) : null; }, a = g('p0'), b = g('p1'), c = g('p2'), o = $('#ruf-' + li); if (o) o.textContent = a && b && c ? R((a + b + c - 200) / 10, 1) : '—'; };
    LV.lanes.forEach(function (L, li) { ruf(li); $$('[data-ask="' + li + '"]').forEach(function (e) { e.oninput = function () { ruf(li); }; }); }); }
  $('#lr-back').onclick = function () { LV.running = true; LV.iv = setInterval(lvTick, 100); keepAwake(true); route('live'); };
  $('#lr-drop').onclick = function () { if (confirm(A('نمسحو نتائج هذا الاختبار؟', 'Supprimer les résultats de ce test ?'))) { LV = null; route('home'); } };
  $('#lr-save').onclick = function () {
    var k = 0;
    LV.lanes.forEach(function (L, li) {
      var keep = $('[data-keep="' + li + '"]'); if (keep && !keep.checked) return;
      var asks = {}; $$('[data-ask="' + li + '"]').forEach(function (i) { asks[i.dataset.k] = i.value.trim(); });
      var hasAsk = Object.keys(asks).some(function (x) { return asks[x]; });
      if (!L.reps.length && !((sp.dur || sp.land) && hasAsk)) return;
      mutate('saveTest', { rec: lvRecord(L, asks) }); k++;
    });
    toast(k ? '✅ ' + k + ' ' + A('سباحين تحفظو', 'nageurs enregistrés') : T('nothing'));
    var first = LV.lanes[0] && LV.lanes[0].sid; LV = null;
    if (k === 1 && first) route('swimmer', { sid: first, tab: 'rpt' }); else route('home');
  };
}
BT.on(function () {}); // (BT simple reste pour les tests individuels)

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
/* ---------- 📈 التطور: كل اختبار + الحصص (Polar) + VO2 إذا كاين ---------- */
function weekOf(iso) { var d = new Date(iso + 'T12:00:00'), k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return d.toISOString().slice(0, 10); }
function histData(s) {
  var tests = catalog(s).map(function (it) { var hh = histOf(s, it); return hh.length ? { it: it, h: hh } : null; }).filter(Boolean)
    .sort(function (a, b) { return GROUPS.indexOf(a.it.sys) - GROUPS.indexOf(b.it.sys) || (b.h.length - a.h.length); });
  var wk = {}, days = daysOf(s.id), t0 = addDays(today(), -7 * 12);
  days.forEach(function (d) { if (d.date < t0) return; (d.ex || []).forEach(function (e) {
    if (!isTraining(e)) return; var w = weekOf(d.date), o = wk[w] = wk[w] || { n: 0, min: 0, load: 0, hrS: 0, hrM: 0, max: 0 };
    o.n++; o.min += e.min || 0; o.load += e.load || 0; if (e.hrAvg && e.min) { o.hrS += e.hrAvg * e.min; o.hrM += e.min; } if (e.hrMax > o.max) o.max = e.hrMax;
  }); });
  var weeks = Object.keys(wk).sort(); if (weeks.length) { var w = weeks[0], L = []; while (w <= weekOf(today())) { L.push(w); w = addDays(w, 7); } weeks = L; }
  var all = testsOf(s.id).slice().reverse(), vo2 = 0; all.forEach(function (t) { var P = profile(s, t.date); if (P.final) vo2++; });
  var steps = all.filter(function (t) { return t.type === 'step'; }).length;
  return { tests: tests, wk: wk, weeks: weeks, vo2: vo2, steps: steps, all: all };
}
function historyHtml(s) {
  var D = histData(s), h = '';
  h += '<h2 style="margin:6px 0 10px">🧪 ' + A('الاختبارات', 'Tests') + '</h2>';
  if (!D.tests.length) h += '<div class="card empty">' + T('noRpt') + '</div>';
  else h += '<div class="grid g2">' + D.tests.map(function (x, i) {
    var hh = x.h, cur = hh[hh.length - 1], pb = hh[pbIdx(hh, x.it.better)], vd = hh.length > 1 ? vdOf(x.it, cur, hh[0]) : null;
    return '<div class="card" data-tk="' + esc(x.it.key) + '" style="cursor:pointer;margin:0"><div class="row"><b class="sp">' + x.it.icon + ' ' + esc(x.it.name) + '</b><span class="num" style="font-weight:700">' + esc(cur.disp) + '</span></div>' +
      '<div class="small muted">' + hh.length + ' ' + T('nRes') + ' · 🏆 ' + esc(pb.disp) + (vd ? ' · ' + A('من الأول: ', 'depuis le 1er : ') + vChip(vd) : '') + '</div>' +
      (hh.length >= 2 ? '<div class="chart" style="height:170px"><canvas id="ch-ev-' + i + '"></canvas></div>' : '<div class="info" style="margin-top:10px">' + A('نتيجة وحدة (', 'Un seul résultat (') + fmtDate(cur.date) + A('). يلزم نتيجتين على الأقل باش يبان التطور.', '). Il faut au moins 2 résultats pour voir l’évolution.') + '</div>') + '</div>';
  }).join('') + '</div>';
  h += '<h2 style="margin:18px 0 10px">⌚ ' + A('الحصص (Polar) · آخر 12 أسبوع', 'Séances (Polar) · 12 dernières semaines') + '</h2>';
  if (!D.weeks.length) h += '<div class="card empty">' + A('ما كاين حتى حصة من Polar. اربط السباح من 🌙 الاسترجاع ← «ربط Polar»، والحصص اللي يسجلها بالـ Verity Sense يبانو هنا.', 'Aucune séance Polar. Connectez le nageur (🌙 Récupération ← « Connecter Polar ») : ses séances Verity Sense apparaîtront ici.') + '</div>';
  else {
    var cw = D.wk[weekOf(today())] || { n: 0, min: 0, load: 0 }, prev = D.weeks.slice(-5, -1).map(function (w) { return D.wk[w] || { n: 0, min: 0, load: 0 }; }), avg = function (k) { return prev.length ? Math.round(prev.reduce(function (a, o) { return a + o[k]; }, 0) / prev.length) : 0; };
    var tot = D.weeks.reduce(function (a, w) { return a + (D.wk[w] ? D.wk[w].n : 0); }, 0);
    h += '<div class="statbar"><div class="card"><div class="kpi"><div class="l">' + A('الحصص المسجلة', 'Séances enregistrées') + '</div><div class="v">' + tot + '</div></div></div>' +
      '<div class="card"><div class="kpi"><div class="l">' + A('هاذ الأسبوع', 'Cette semaine') + '</div><div class="v">' + cw.n + '</div><div class="small muted">' + A('المعدل ', 'moy. ') + avg('n') + '</div></div></div>' +
      '<div class="card"><div class="kpi"><div class="l">' + A('الدقايق هاذ الأسبوع', 'Minutes cette semaine') + '</div><div class="v">' + cw.min + '</div><div class="small muted">' + A('المعدل ', 'moy. ') + avg('min') + '</div></div></div>' +
      '<div class="card"><div class="kpi"><div class="l">' + A('الحمل هاذ الأسبوع', 'Charge cette semaine') + '</div><div class="v">' + Math.round(cw.load) + '</div><div class="small muted">' + A('المعدل ', 'moy. ') + avg('load') + '</div></div></div></div>' +
      '<div class="grid g2"><div class="card"><h3>' + A('الدقايق والحمل كل أسبوع', 'Minutes et charge par semaine') + '</h3><div class="chart"><canvas id="ch-wk"></canvas></div></div>' +
      '<div class="card"><h3>' + A('متوسط النبض في الحصص', 'FC moyenne des séances') + '</h3><div class="chart"><canvas id="ch-wkhr"></canvas></div><div class="small muted">' + A('إذا النبض يهبط في نفس التدريب أسبوع بعد أسبوع = القلب ولا يخدم أخف (تحسن هوائي).', 'Si la FC baisse pour un entraînement comparable = cœur plus efficace (progrès aérobie).') + '</div></div></div>';
  }
  if (D.vo2 || D.steps) {
    h += '<h2 style="margin:18px 0 10px">🫁 VO2max</h2><div class="grid g2">' + (D.vo2 ? '<div class="card"><h3>VO2max</h3><div class="chart"><canvas id="ch-vo2"></canvas></div></div>' : '') +
      '<div class="card"><h3>' + T('pacesT') + '</h3><div class="chart"><canvas id="ch-pace"></canvas></div></div>' + (D.steps ? '<div class="card"><h3>' + T('hrCurve') + '</h3><div class="chart"><canvas id="ch-hrall"></canvas></div></div>' : '') +
      '<div class="card"><h3>' + T('hrrest') + ' / ' + T('hrr') + '</h3><div class="chart"><canvas id="ch-rest"></canvas></div></div></div>';
  }
  return h;
}
function drawHistory(s) {
  if (!window.Chart) return;
  var D = histData(s);
  D.tests.forEach(function (x, i) { if (x.h.length >= 2 && $('#ch-ev-' + i)) mk('ch-ev-' + i, evoCfg(x.h, x.it)); });
  if (D.weeks.length && $('#ch-wk')) {
    var lab = D.weeks.map(function (w) { return fmtDate(w).slice(0, 5); }), g = function (k) { return D.weeks.map(function (w) { return D.wk[w] ? Math.round(D.wk[w][k]) : 0; }); };
    var o = chartBase(); o.scales = { y: { title: { display: true, text: 'min' }, beginAtZero: true }, y2: { position: 'right', beginAtZero: true, grid: { display: false }, title: { display: true, text: A('الحمل', 'charge') } } };
    mk('ch-wk', { type: 'bar', data: { labels: lab, datasets: [{ label: A('الدقايق', 'Minutes'), data: g('min'), backgroundColor: '#8cbcf5', borderRadius: 4 }, { type: 'line', label: A('الحمل', 'Charge'), data: g('load'), borderColor: '#e8a317', backgroundColor: '#e8a317', yAxisID: 'y2', tension: .25 }] }, options: o });
    var hr = D.weeks.map(function (w) { var o2 = D.wk[w]; return o2 && o2.hrM ? Math.round(o2.hrS / o2.hrM) : null; }), mx = D.weeks.map(function (w) { return D.wk[w] && D.wk[w].max || null; });
    var o3 = chartBase(); o3.spanGaps = true; o3.scales = { y: { title: { display: true, text: 'bpm' } } };
    mk('ch-wkhr', { type: 'line', data: { labels: lab, datasets: [{ label: A('المتوسط', 'Moyenne'), data: hr, borderColor: CH.red, backgroundColor: CH.red, borderWidth: 3, tension: .25 }, { label: A('الأعلى', 'Max'), data: mx, borderColor: '#f0b4b4', borderDash: [4, 3], tension: .25 }] }, options: o3 });
  }
  if (!(D.vo2 || D.steps)) return;
  var all = D.all, dates = [];
  all.forEach(function (t) { if (dates.indexOf(t.date) < 0) dates.push(t.date); });
  var fin = [], lg = [], ut = [], lab2 = [];
  dates.forEach(function (d) {
    var P = profile(s, d); if (!P.final) return; lab2.push(fmtDate(d));
    fin.push(R(P.final.vo2, 1));
    var a = P.est.find(function (e) { return e.k === 'leger'; }), b = P.est.find(function (e) { return e.k === 'uth'; });
    lg.push(a ? R(a.vo2, 1) : null); ut.push(b ? R(b.vo2, 1) : null);
  });
  var o = chartBase(); o.scales = { y: { title: { display: true, text: T('unit') } } }; o.spanGaps = true;
  mk('ch-vo2', { type: 'line', data: { labels: lab2, datasets: [{ label: T('estFinal'), data: fin, borderColor: CH.blue, backgroundColor: CH.blue, borderWidth: 3 }, { label: 'Léger', data: lg, borderColor: CH.green, borderDash: [4, 3] }, { label: 'Uth', data: ut, borderColor: CH.red, borderDash: [4, 3] }] }, options: o });
  var pl = [], css = [], p4 = [];
  all.forEach(function (t) { var r = computeTest(t, s); if (r.css || r.m400) { pl.push(fmtDate(t.date)); css.push(r.css ? R(r.css.pace, 1) : null); p4.push(r.m400 ? R(r.m400.pace, 1) : r.p400 ? R(r.p400, 1) : null); } });
  var o2 = chartBase(); o2.spanGaps = true; o2.scales = { y: { reverse: true, ticks: { callback: function (v) { return F(v, 0); } }, title: { display: true, text: T('pace') } } };
  mk('ch-pace', { type: 'line', data: { labels: pl, datasets: [{ label: 'CSS', data: css, borderColor: CH.blue }, { label: '400', data: p4, borderColor: CH.red }] }, options: o2 });
  var cols = ['#2a3a5e', '#34548f', '#3f6fc0', '#4f8bf0', '#6fb0ff', '#2fd4f0'], ds = [];
  var steps = all.filter(function (t) { return t.type === 'step'; });
  steps.forEach(function (t, i) { var st = computeTest(t, s).step; if (!st || !st.rows) return; ds.push({ label: fmtDate(t.date), data: st.rows.filter(function (r) { return r.hr; }).map(function (r) { return { x: r.v, y: r.hr }; }), borderColor: cols[Math.max(0, cols.length - steps.length + i)], backgroundColor: cols[Math.max(0, cols.length - steps.length + i)], showLine: true }); });
  var o3b = chartBase(); o3b.scales = { x: Object.assign({ type: 'linear' }, paceAxis(T('pace'))), y: { title: { display: true, text: 'bpm' } } };
  mk('ch-hrall', { type: 'scatter', data: { datasets: ds }, options: o3b });
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
  var backTab = t.type === 'day' ? 'recovery' : t.type === 'time' ? 'times' : 'rpt';
  var h = '<button class="btn sm" id="bk">← ' + esc(s.name) + '</button><h1>' + ICON[t.type] + ' ' + T('T_' + t.type) + '</h1>' + (t.type !== 'time' && t.type !== 'day' ? guideHtml(t.type) : '') + '<div id="rdw"></div><form id="tf" autocomplete="off">' +
    '<div class="card"><div class="fr"><div class="f"><label>' + T('date') + '</label><input type="date" name="date" value="' + esc(t.date) + '"></div>' +
    (t.type !== 'leger' && t.type !== 'rest' && t.type !== 'day' && t.type !== 'time' ? '<div class="f"><label>' + T('pool') + '</label><select name="pool"><option value="25">25 m</option><option value="50"' + (t.data.pool == 50 ? ' selected' : '') + '>50 m</option></select></div>' : '') + '</div></div>';
  h += '<div id="form-body"></div>';
  h += '<div class="card"><div class="f"><label>' + T('notes') + '</label><textarea name="notes" rows="2">' + esc(t.notes) + '</textarea></div><div id="res"></div>' +
    (S.tid && t.type !== 'day' && !can('editRes') ? '<div class="note" style="margin-bottom:10px">🔒 ' + A('ما عندكش الصلاحية تعدّل نتيجة مسجلة: تقدر تشوفها برك.', 'Modification non autorisée : consultation seulement.') + '</div>' : '<div class="row"><button class="btn pri big" id="save">' + T('save') + '</button>' + (S.tid && can('editRes') ? '<span class="sp"></span><button type="button" class="btn dan" id="dl">' + T('del') + '</button>' : '') + '</div>') + '</div></form>';
  app.innerHTML = h;
  $('#bk').onclick = function () { route('swimmer', { tab: backTab }); };
  if ($('#dl')) $('#dl').onclick = function () { if (confirm(T('confirmDel'))) { mutate('delTest', { id: t.id }); toast(T('deleted')); route('swimmer', { tab: backTab }); } };
  ({ step: fStep, '400': f400, css: fCss, leger: fLeger, rest: fRest, day: fDay, time: fTime })[t.type]($('#form-body'));
  var rdw = function () { var r = t.type !== 'day' && t.type !== 'time' ? readyOf(s, val('date') || today()) : null; $('#rdw').innerHTML = r && r.level === 'red' ? '<div class="alert" style="margin-bottom:14px">🔴 ' + T('redTest') + '</div>' : ''; };
  $('#tf [name=date]').addEventListener('change', rdw); rdw();
  $('#tf').addEventListener('input', liveResults);
  liveResults();
  $('#tf').onsubmit = function (e) {
    e.preventDefault();
    if (!$('#save')) return;
    var rec = TMP.t; rec.date = e.target.date.value || today(); rec.notes = e.target.notes.value; rec.data = collect();
    if (TMP.samples && TMP.samples.length) rec.data.samples = pack(TMP.samples);
    mutate('saveTest', { rec: rec }); toast(T('saved')); route('swimmer', { tab: backTab });
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
  var nights = daysOf(TMP.s.id).filter(function (x) { return C.num(x.rhr); }).slice(-7).reverse();
  var loop = '<div class="card"><h3>🌙 ' + A('نبض الليل من الـ Loop', 'FC de nuit (Loop)') + ' <span class="srct" style="color:#a36a00;background:#fff4dc">' + A('للمقارنة برك', 'comparaison seulement') + '</span></h3>' +
    (nights.length ? '<div class="rp-chips">' + nights.map(function (x) { return '<span>' + fmtDate(x.date).slice(0, 5) + ' · <b>' + x.rhr + '</b> bpm</span>'; }).join('') + '</div>' : '<div class="small muted">' + A('ما كاينش بيانات ليل من Polar لهاذ السباح.', 'Aucune donnée de nuit Polar pour ce nageur.') + '</div>') +
    '<div class="small muted" style="margin-top:6px">' + A('هذا متوسط النبض وهو راقد (Polar Nightly Recharge)، وديما أقل من نبض الصباح وهو فايق. ما يدخلش في حساب VO2max (معادلة Uth)، لأنو يطلّع VO2max أعلى من الحقيقة. نبض الراحة الصحيح = 5 دقايق بالـ Verity Sense في الصباح.', 'Moyenne pendant le sommeil (Nightly Recharge), toujours plus basse que la FC de repos du matin éveillé. Non utilisée pour la VO2max (Uth), qu’elle surestimerait. FC de repos correcte = 5 min Verity Sense le matin.') + '</div></div>';
  box.innerHTML = '<div class="card"><div class="info small">' + T('restHelp') + '</div></div>' + loop + btPanel('<div class="row" style="margin-top:10px"><button type="button" class="btn pri" id="rec5">⏺ ' + T('rec5') + '</button><span class="num" id="rec-t" style="font-size:24px"></span></div>') +
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
  var h = '<button class="btn sm" id="bk">← ' + T('back') + '</button><h1>⚙ ' + T('settings') + ' <span class="chip" style="vertical-align:middle">' + A('النسخة ', 'Version ') + APP_V + '</span></h1>';
  if (isAdmin()) {
    h += '<div class="card"><div class="row" style="margin-bottom:8px"><h3 class="sp" style="margin:0">👥 ' + T('coaches') + '</h3><button class="btn pri sm" id="addc">＋ ' + T('addCoach') + '</button></div><div id="cform"></div>';
    var cs = DB.coaches || [];
    if (!cs.length) h += '<p class="muted">—</p>';
    else h += '<div class="tbl-wrap"><table><tr><th>' + T('name') + '</th><th>' + T('phone') + '</th><th>' + T('code') + '</th><th>' + T('swimmers') + '</th><th></th><th>📱 ' + A('الجهاز', 'Appareil') + '</th><th></th></tr>' + cs.map(function (c) {
      var n = DB.swimmers.filter(function (s) { return coachSees(c, s); }).length, pc = permOf(c), nOn = PERM_KEYS.filter(function (k) { return pc[k]; }).length;
      return '<tr><td style="text-align:start"><b>' + esc(c.name) + '</b> <span class="chip">🔑 ' + nOn + '/' + PERM_KEYS.length + '</span></td><td class="num">' + esc(c.phone || '') + '</td><td><span class="chip mono">' + esc(c.code) + '</span></td><td class="num">' + n + '</td><td><span class="chip ' + (c.active === false ? 'bad' : 'ok') + '">' + T(c.active === false ? 'inactive' : 'active') + '</span></td>' +
        '<td style="text-align:start;white-space:nowrap">' + (c.dev ? '<span class="chip ok">✅ ' + esc(c.dev.label || '') + ' · ' + esc(c.dev.code || '') + '</span>' + (c.dev.last ? '<div class="small muted">' + A('آخر دخول ', 'vu le ') + fmtDate(String(c.dev.last).slice(0, 10)) + '</div>' : '') : c.inv ? '<span class="chip warn">🔗 ' + A('الرابط ما تفتحش', 'lien non ouvert') + '</span>' : '<span class="chip">' + A('بلا جهاز', 'aucun') + '</span>') +
        '<div class="row" style="gap:4px;margin-top:4px"><button class="btn sm" data-lnk="' + c.id + '">🔗 ' + (c.dev ? A('رابط جديد', 'Nouveau lien') : A('الرابط', 'Lien')) + '</button>' + (c.dev || c.inv ? '<button class="btn sm dan" data-unb="' + c.id + '" title="' + A('فك الجهاز', 'Retirer l’appareil') + '">✕</button>' : '') + '</div><div id="lnk-' + c.id + '"></div></td>' +
        '<td style="white-space:nowrap"><button class="btn sm" data-view="' + c.id + '" title="' + T('viewAs') + '">👁</button> <button class="btn sm" data-ec="' + c.id + '">✎</button></td></tr>';
    }).join('') + '</table></div>';
    h += '<div class="info" style="margin-top:10px">📱 ' + A('كل مدرب يدخل من <b>جهاز واحد</b>. اضغط «🔗 الرابط» وابعثو للمدرب: يفتحو في الهاتف تاعو ويكتب الكود تاعو <b>مرة وحدة</b>، ومن بعد التطبيق يتحل وحدو. الرابط يخدم مرة وحدة: إذا تفتح في هاتف آخر ما يخدمش. «رابط جديد» يفك الجهاز القديم.', 'Chaque entraîneur utilise <b>un seul appareil</b>. « 🔗 Lien » : il l’ouvre sur son téléphone et saisit son code <b>une fois</b>. Le lien est à usage unique. « Nouveau lien » retire l’ancien appareil.') + '</div>';
    h += '</div><div class="card"><h3>📱 ' + A('أجهزة الإدارة', 'Appareils de l’administration') + '</h3><div id="devlist" class="small muted">…</div></div>';
    h += '<div class="card"><h3>🔐 ' + T('logT') + '</h3><div id="loglist" class="small muted">…</div></div><form class="card" id="pwf"><h3>🔑 ' + T('changePw') + '</h3><div class="fr"><div class="f"><label>' + T('oldPw') + '</label><input type="password" name="o"></div><div class="f"><label>' + T('newPw') + '</label><input type="password" name="n"></div></div><button class="btn pri">' + T('save') + '</button></form>';
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
  $('#bkp').onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(DB, null, 1)], { type: 'application/json' })); a.download = 'mr-wathba-performance-' + today() + '.json'; a.click(); };
  $('#addc').onclick = function () { coachForm({}); };
  API.call('log').then(function (r) {
    var el = $('#loglist'); if (!el) return;
    if (!r.ok || !r.log || !r.log.length) { el.textContent = '—'; return; }
    el.innerHTML = '<div class="tbl-wrap" style="max-height:320px;overflow:auto"><table><tr><th>' + T('when') + '</th><th>' + T('who') + '</th><th></th></tr>' + r.log.map(function (x) {
      var d = new Date(x.t); return '<tr><td class="num">' + fmtDate(d.toISOString().slice(0, 10)) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + '</td><td>' + esc(x.who || '—') + '</td><td><span class="chip ' + (x.ok ? 'ok' : 'bad') + '">' + T(x.ok ? 'okLogin' : 'failLogin') + '</span></td></tr>';
    }).join('') + '</table></div>';
  }).catch(function () {});
  $$('[data-ec]').forEach(function (b) { b.onclick = function () { coachForm(DB.coaches.find(function (c) { return c.id === b.dataset.ec; })); }; });
  $$('[data-lnk]').forEach(function (b) { b.onclick = function () {
    var c = DB.coaches.find(function (x) { return x.id === b.dataset.lnk; });
    if (c.dev && !confirm(A('رابط جديد يفك الجهاز تاع ' + c.name + ' (' + (c.dev.label || '') + '). نكملو؟', 'Un nouveau lien retire l’appareil actuel de ' + c.name + '. Continuer ?'))) return;
    b.disabled = true;
    API.call('coachLink', { id: c.id }).then(function (r) {
      b.disabled = false; if (!r.ok) return toast(T(r.err) || r.err);
      var url = location.origin + location.pathname + '#inv=' + r.tk, box = $('#lnk-' + c.id);
      var txt = 'MR WATHBA PERFORMANCE · BY OKBA\n' + A('السلام ' + c.name + '، هذا الرابط تاعك (يخدم في هاتف واحد، مرة وحدة). افتحو في الهاتف تاعك واكتب الكود تاعك:', 'Bonjour ' + c.name + ', votre lien personnel (un seul téléphone, une seule fois). Ouvrez-le sur votre téléphone et saisissez votre code :') + '\n' + url;
      box.innerHTML = '<div class="kbox" style="margin-top:6px;white-space:normal"><div class="small ltr" style="word-break:break-all">' + esc(url) + '</div><div class="row" style="gap:6px;margin-top:6px"><button class="btn sm" data-cp="1">📋 ' + A('نسخ', 'Copier') + '</button><a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/' + String(c.phone || '').replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(txt) + '">WhatsApp</a></div></div>';
      $('[data-cp]', box).onclick = function () { (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast('✅'); }).catch(function () { prompt('', url); }); };
      c.inv = { at: today() }; delete c.dev; persist();
    }).catch(function () { b.disabled = false; toast(T('neterr')); });
  }; });
  $$('[data-unb]').forEach(function (b) { b.onclick = function () {
    var c = DB.coaches.find(function (x) { return x.id === b.dataset.unb; });
    if (!confirm(A('نفكّو الجهاز تاع ' + c.name + '؟ يخرج من التطبيق ويحتاج رابط جديد.', 'Retirer l’appareil de ' + c.name + ' ? Il devra recevoir un nouveau lien.'))) return;
    API.call('coachUnbind', { id: c.id }).then(function (r) { if (!r.ok) return toast(T(r.err) || r.err); toast(T('saved')); load().then(render); }).catch(function () { toast(T('neterr')); });
  }; });
  var devPaint = function () {
    API.call('devs').then(function (r) {
      var el = $('#devlist'); if (!el) return; if (!r.ok) { el.textContent = '—'; return; }
      el.innerHTML = '<div class="tlist">' + r.list.map(function (d) {
        var me = d.id === r.me;
        return '<div class="it"><span class="ic">' + (d.blocked ? '⛔' : d.ok ? '✅' : '⏳') + '</span><div class="sp"><b>' + esc(d.label || '?') + '</b> <span class="chip mono">' + esc(d.code) + '</span>' + (me ? ' <span class="chip ok">' + A('هاذ الجهاز', 'cet appareil') + '</span>' : '') + '<div class="small muted">' + (d.blocked ? A('ممنوع', 'bloqué') : d.ok ? A('مقبول', 'accepté') : A('يستنى الموافقة', 'en attente')) + (d.last ? ' · ' + A('آخر دخول ', 'vu le ') + fmtDate(String(d.last).slice(0, 10)) : '') + '</div></div>' +
          (!d.ok ? '<button class="btn sm pri" data-dv="' + d.id + '" data-op="ok">✅ ' + A('قبول', 'Accepter') + '</button>' : '') + (!me && !d.blocked ? '<button class="btn sm" data-dv="' + d.id + '" data-op="block">⛔ ' + A('منع', 'Bloquer') + '</button>' : '') + (!me ? '<button class="btn sm dan" data-dv="' + d.id + '" data-op="del">🗑</button>' : '') + '</div>';
      }).join('') + '</div><div class="small muted" style="margin-top:6px">' + A('أي جهاز جديد يدخل بكلمة سر الإدارة يبان هنا «يستنى»، وما يتفتحلو والو حتى تقبلو. إذا ضاع هاتفك: امنعو من جهاز آخر.', 'Tout nouvel appareil utilisant le mot de passe admin apparaît « en attente » jusqu’à votre accord.') + '</div>';
      $$('[data-dv]', el).forEach(function (b) { b.onclick = function () { if (b.dataset.op !== 'ok' && !confirm('?')) return; API.call('devSet', { id: b.dataset.dv, op: b.dataset.op }).then(function (x) { if (!x.ok) return toast(x.err === 'lastDev' ? A('لازم يبقى جهاز مقبول واحد على الأقل', 'Il faut garder au moins un appareil accepté') : x.err); devPaint(); }).catch(function () { toast(T('neterr')); }); }; });
    }).catch(function () {});
  };
  devPaint();
  $$('[data-view]').forEach(function (b) { b.onclick = function () { VIEWAS = b.dataset.view; ls('vo2_viewas', VIEWAS); route('home'); }; });
}
var PERM_L = {
  add: ['➕ يزيد سباح', '➕ Ajouter un nageur'], edit: ['✎ يعدّل ملف السباح', '✎ Modifier la fiche'], del: ['🗑 يحذف سباح', '🗑 Supprimer un nageur'],
  vo2: ['🫁 اختبارات VO2max والأزمنة', '🫁 Tests VO2max et temps'], bt: ['🏋 اختبارات البطارية (قوة، سرعة، بروتوكولات)', '🏋 Tests de la batterie'],
  editRes: ['✎ يعدّل ولا يحذف نتيجة مسجلة', '✎ Modifier / supprimer un résultat'], rep: ['📋 يشوف التقارير', '📋 Voir les rapports'],
  day: ['🌙 يكتب الاسترجاع والتعب', '🌙 Saisir récupération et RPE'], polar: ['⌚ مزامنة Polar', '⌚ Synchroniser Polar'],
  proto: ['🧩 يخلق ولا يعدّل البروتوكولات', '🧩 Créer / modifier des protocoles'], print: ['🖨 يطبع ولا ينسخ للواتساب', '🖨 Imprimer / copier WhatsApp']
};
function coachForm(c) {
  var box = $('#cform'), isNew = !c.id, pc = isNew ? { add: false, edit: false, del: false, vo2: true, bt: false, editRes: false, rep: true, day: true, polar: false, proto: false, print: true, see: [] } : permOf(c);
  var see = pc.see ? pc.see.slice() : DB.swimmers.filter(function (s) { return s.coachId === c.id; }).map(function (s) { return String(s.id); });
  var list = DB.swimmers.slice().sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
  var catN = function (s) { return window.BTV && BTV.catOf(s) ? BTV.catName(BTV.catOf(s)) : ''; };
  box.innerHTML = '<form class="kbox" id="cf" style="margin-bottom:12px"><div class="fr"><div class="f"><label>' + T('name') + '</label><input name="name" required value="' + esc(c.name) + '"></div>' +
    '<div class="f"><label>' + T('phone') + '</label><input name="phone" inputmode="tel" class="ltr" value="' + esc(c.phone) + '"></div>' +
    '<div class="f"><label>' + T('code') + '<span class="hint">' + T('codeHint') + '</span></label><input name="code" required minlength="6" class="mono ltr" value="' + esc(c.code) + '"></div>' +
    '<div class="f"><label>' + T('active') + '</label><select name="active"><option value="1">' + T('active') + '</option><option value="0"' + (c.active === false ? ' selected' : '') + '>' + T('inactive') + '</option></select></div></div>' +
    '<h3 style="margin:14px 0 8px">🔑 ' + A('واش يقدر يدير', 'Ce qu’il peut faire') + '</h3><div class="grid g2" style="gap:6px">' +
    PERM_KEYS.map(function (k) { return '<label class="row" style="gap:8px;margin:0;padding:8px 10px;border:1px solid var(--line);border-radius:12px;font-weight:600;color:var(--ink);cursor:pointer"><input type="checkbox" data-pm="' + k + '"' + (pc[k] ? ' checked' : '') + ' style="width:22px;height:22px;min-height:0;flex:none"> ' + Tv(PERM_L[k]) + '</label>'; }).join('') + '</div>' +
    '<h3 style="margin:16px 0 8px">👁 ' + A('السباحين اللي يشوفهم', 'Nageurs visibles') + ' <span class="chip" id="cf-n">' + see.length + '</span></h3>' +
    '<div class="row" style="margin-bottom:8px"><input id="cf-q" placeholder="' + A('بحث…', 'Rechercher…') + '" style="flex:1;min-width:160px"><button type="button" class="btn sm" id="cf-all">' + A('الكل', 'Tous') + '</button><button type="button" class="btn sm" id="cf-none">' + A('حتى واحد', 'Aucun') + '</button></div>' +
    '<div id="cf-sw" style="max-height:300px;overflow:auto;border:1px solid var(--line);border-radius:12px;padding:4px 8px">' + (list.length ? list.map(function (s) { return '<label class="row" data-swn="' + esc((s.name || '').toLowerCase()) + '" style="gap:8px;margin:0;padding:7px 2px;border-bottom:1px solid var(--line);font-weight:600;color:var(--ink);cursor:pointer"><input type="checkbox" data-sv="' + esc(s.id) + '"' + (see.indexOf(String(s.id)) >= 0 ? ' checked' : '') + ' style="width:22px;height:22px;min-height:0;flex:none"> <span class="sp">' + esc(s.name) + '</span><span class="small muted">' + catN(s) + '</span></label>'; }).join('') : '<p class="muted small">—</p>') + '</div>' +
    '<p class="small muted" style="margin:8px 0">' + A('ربط Polar، كلمة السر وإدارة المدربين تبقى للإدارة وحدها. كل صلاحية يتحقق منها السيرفر تاني.', 'Connexion Polar, mot de passe et gestion des entraîneurs restent à l’administration. Chaque droit est aussi vérifié par le serveur.') + '</p>' +
    '<div class="row"><button class="btn pri">' + T('save') + '</button><button type="button" class="btn" id="cc">' + T('cancel') + '</button><span class="sp"></span>' + (c.id ? '<button type="button" class="btn dan" id="cd">' + T('del') + '</button>' : '') + '</div></form>';
  var cnt = function () { $('#cf-n').textContent = $$('[data-sv]').filter(function (i) { return i.checked; }).length; };
  $$('[data-sv]').forEach(function (i) { i.onchange = cnt; });
  $('#cf-q').oninput = function () { var q = this.value.trim().toLowerCase(); $$('[data-swn]').forEach(function (l) { l.style.display = !q || l.dataset.swn.indexOf(q) >= 0 ? '' : 'none'; }); };
  $('#cf-all').onclick = function () { $$('[data-swn]').forEach(function (l) { if (l.style.display !== 'none') $('[data-sv]', l).checked = true; }); cnt(); };
  $('#cf-none').onclick = function () { $$('[data-sv]').forEach(function (i) { i.checked = false; }); cnt(); };
  $('#cf [name=name]').focus();
  $('#cc').onclick = function () { box.innerHTML = ''; };
  if (c.id) $('#cd').onclick = function () { if (confirm(T('confirmDel'))) { API.call('delCoach', { id: c.id }).then(function (r) { if (!r.ok) return toast(T(r.err) || r.err); toast(T('deleted')); load().then(render); }); } };
  $('#cf').onsubmit = function (e) {
    e.preventDefault(); var f = e.target, perm = { see: $$('[data-sv]').filter(function (i) { return i.checked; }).map(function (i) { return i.dataset.sv; }) };
    $$('[data-pm]').forEach(function (i) { perm[i.dataset.pm] = i.checked; });
    var rec = Object.assign({}, c, { name: f.name.value.trim(), phone: f.phone.value.trim(), code: f.code.value.trim(), active: f.active.value === '1', perm: perm, head: perm.bt || perm.proto });
    if (!/^(?=.*[0-9])(?=.*[A-Za-z]).{6,}$/.test(rec.code)) return toast(T('weakCode'));
    f.querySelector('.pri').disabled = true;
    API.call('saveCoach', { rec: rec }).then(function (r) { if (!r.ok) { f.querySelector('.pri').disabled = false; return toast(T(r.err) || r.err); } toast(T('saved')); load().then(render); }).catch(function () { f.querySelector('.pri').disabled = false; toast(T('neterr')); });
  };
}

/* ======================= impression : التقرير الموحّد ======================= */
// منحنى يتصوّر بعيد على الشاشة (canvas مخفي) ويرجع صورة
function chartImg(cfg, w, h) {
  if (!window.Chart) return '';
  var cv = document.createElement('canvas'), box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:-9999px;top:0;width:' + w + 'px;height:' + h + 'px'; cv.width = w * 2; cv.height = h * 2; cv.style.width = w + 'px'; cv.style.height = h + 'px';
  box.appendChild(cv); document.body.appendChild(box);
  cfg.options = Object.assign({}, cfg.options, { responsive: false, animation: false, devicePixelRatio: 2 });
  var url = '';
  try { var c = new Chart(cv, cfg); url = c.toBase64Image(); c.destroy(); } catch (e) {}
  document.body.removeChild(box); return url;
}
function evoCfg(hh, it) {
  var pi = pbIdx(hh, it.better), o = chartBase(); o.plugins.legend = { display: false };
  o.scales = { y: { reverse: it.better === 'low', ticks: { callback: function (v) { return it.time ? F(v, 1) : R(v, 1); } } }, x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 6 } } };
  o.plugins.tooltip = { callbacks: { label: function (c) { return hh[c.dataIndex].disp; } } };
  return { type: 'line', data: { labels: hh.map(function (x) { return fmtDate(x.date); }), datasets: [{ data: hh.map(function (x) { return x.v; }), borderColor: '#1d6bff', backgroundColor: '#1d6bff', borderWidth: 3, tension: .2, pointRadius: hh.map(function (x, i) { return i === pi ? 7 : 4; }), pointBackgroundColor: hh.map(function (x, i) { return i === pi ? '#e8a317' : '#1d6bff'; }) }] }, options: o };
}
function printCard(s) { printReport(s); }
function printReport(s) {
  var P = profile(s), items = catalog(s), B = window.BTV, cat = B ? B.catOf(s) : null, nT = 0, up = 0, down = 0, last = null, imgs = [];
  var groups = GROUPS.map(function (g) {
    var rows = items.filter(function (it) { return it.sys === g; }).map(function (it) { var hh = histOf(s, it); return hh.length ? { it: it, h: hh } : null; }).filter(Boolean);
    if (!rows.length) return '';
    return '<div class="pr-g"><h3>' + T('g_' + g) + '</h3><table class="pr-t"><tr><th style="text-align:start">' + A('الاختبار', 'Test') + '</th><th>' + T('lastRes') + '</th><th>' + A('السابقة', 'Précédent') + '</th><th>' + A('التغيّر', 'Évolution') + '</th><th>' + T('bestRes') + '</th><th>' + A('عدد', 'Nb') + '</th></tr>' + rows.map(function (x) {
      var hh = x.h, cur = hh[hh.length - 1], prev = hh.length > 1 ? hh[hh.length - 2] : null, vd = vdOf(x.it, cur, prev), pi = pbIdx(hh, x.it.better), pb = hh[pi];
      nT += hh.length; if (vd && vd.k === 'real') { if (vd.ch > 0) up++; else down++; } if (!last || cur.date > last) last = cur.date;
      if (hh.length >= 2) imgs.push({ t: x.it.icon + ' ' + x.it.name, u: chartImg(evoCfg(hh, x.it), 360, 150) });
      var hs = hrStatsOf(cur.rec, s);
      return '<tr><td style="text-align:start"><b>' + esc(x.it.name) + '</b>' + (cur.extra ? '<div class="small muted">' + bdi(cur.extra) + '</div>' : '') + (hs ? '<div class="small" style="color:#b42318">♥ ' + A('متوسط', 'moy.') + ' ' + hs.avg + ' · max ' + hs.peak + (hs.good && hs.drift != null && hs.pace && hs.pace.cv <= 3 ? ' · ' + A('انحراف', 'dérive') + ' ' + (hs.drift > 0 ? '+' : '') + R(hs.drift, 1) + '%' : '') + '</div>' : '') + '</td>' +
        '<td class="num"><b>' + esc(cur.disp) + '</b><div class="small muted">' + fmtDate(cur.date) + '</div></td>' +
        '<td class="num">' + (prev ? esc(prev.disp) + '<div class="small muted">' + fmtDate(prev.date) + '</div>' : '—') + '</td>' +
        '<td>' + (vd ? vChip(vd) : '<span class="small muted">' + A('أول نتيجة', '1er résultat') + '</span>') + '</td>' +
        '<td class="num">' + esc(pb.disp) + (hh.length > 1 ? ' 🏆' : '') + '</td><td class="num">' + hh.length + '</td></tr>';
    }).join('') + '</table></div>';
  }).join('');
  var age = P.age ? R(P.age, 1) + ' ' + T('yrs') : '';
  var h = '<div class="pr" dir="' + (LANG === 'fr' ? 'ltr' : 'rtl') + '">' +
    '<div class="pr-hd"><img src="logo.png" alt=""><div style="flex:1"><div class="pr-brand">MR WATHBA PERFORMANCE <small>BY OKBA</small></div><div class="small muted">' + A('تقرير الاختبارات · السباح مقارن مع روحو', 'Rapport des tests · le nageur comparé à lui-même') + '</div></div>' +
    '<div style="text-align:end"><b style="font-size:19px">' + esc(s.name) + '</b><div class="small muted">' + [age, cat && B ? B.catName(cat) : '', s.weight ? s.weight + ' kg' : '', s.height ? s.height + ' cm' : '', isAdmin() && s.coachId ? '👤 ' + esc(coachName(s.coachId)) : ''].filter(Boolean).join(' · ') + '</div></div></div>';
  if (!groups) h += '<p>' + T('noRpt') + '</p>';
  else {
    h += '<div class="pr-k"><div><span>' + T('testsDone') + '</span><b>' + nT + '</b></div><div><span>' + T('lastTest') + '</span><b>' + fmtDate(last) + '</b></div><div><span>' + T('upN') + '</span><b style="color:#0e9f6e">▲ ' + up + '</b></div><div><span>' + T('downN') + '</span><b style="color:#d93a3a">▼ ' + down + '</b></div></div>' + groups;
    if (imgs.length) h += '<h3 style="margin-top:14px">📈 ' + T('evo') + '</h3><div class="pr-ch">' + imgs.map(function (x) { return '<div><div class="small"><b>' + esc(x.t) + '</b></div><img src="' + x.u + '" alt=""></div>'; }).join('') + '</div>';
    if (P.final) h += '<h3 style="margin-top:14px">🫁 VO2max</h3>' + summaryHtml(P).replace(/<canvas[^>]*><\/canvas>/g, '');
  }
  h += '<div class="small muted pr-ft">' + A('▲▼ «حقيقي» = التغيّر أكبر من خطأ القياس · «محتمل» = قريب منو · «ضجيج» = في حدود خطأ القياس', '▲▼ « réel » = au-delà de l’erreur de mesure · « probable » = proche · « bruit » = dans l’erreur de mesure') + '<br>' + T('printed') + ' ' + fmtDate(today()) + ' · MR WATHBA PERFORMANCE · BY OKBA</div></div>';
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
  initials: initials, readyOf: readyOf, n0: n0, n1: n1, lab: lab, can: can
};
document.addEventListener('DOMContentLoaded', function () { render(); if (API.tk()) flush(); });
window.VO2APP = { load: load,  DB: function () { return DB; }, profile: profile, computeTest: computeTest, route: route, BT: BT };
})();
