/* VO2max Al-Wathba — moteur de calcul (fonctions pures, sans DOM) */
(function (root) {
  'use strict';
  var C = {};

  /* ---------- utilitaires ---------- */
  function num(x) { var n = parseFloat(String(x == null ? '' : x).replace(',', '.')); return isFinite(n) ? n : null; }
  C.num = num;
  C.round = function (x, d) { if (x == null || !isFinite(x)) return null; var p = Math.pow(10, d || 0); return Math.round(x * p) / p; };

  // "5:15.3" | "1:05:02" | "75.4" -> secondes
  C.parseTime = function (s) {
    if (s == null) return null;
    s = String(s).trim().replace(',', '.');
    if (!s) return null;
    var parts = s.split(':');
    var t = 0;
    for (var i = 0; i < parts.length; i++) {
      var v = parseFloat(parts[i]);
      if (!isFinite(v) || v < 0) return null;
      t = t * 60 + v;
    }
    return t > 0 ? t : null;
  };
  C.fmtTime = function (sec, dec) {
    if (sec == null || !isFinite(sec)) return '—';
    dec = dec == null ? 1 : dec;
    var neg = sec < 0; sec = Math.abs(sec);
    var p = Math.pow(10, dec);
    sec = Math.round(sec * p) / p;
    var m = Math.floor(sec / 60), s = sec - m * 60;
    var ss = s.toFixed(dec); if (s < 10) ss = '0' + ss;
    return (neg ? '-' : '') + (m ? m + ':' + ss : s.toFixed(dec));
  };
  // allure /100 m à partir d'une vitesse m/s
  C.pace100 = function (v) { return v > 0 ? 100 / v : null; };

  // âge décimal (années) à une date
  C.ageAt = function (dob, date) {
    if (!dob) return null;
    var a = new Date(dob), b = date ? new Date(date) : new Date();
    if (isNaN(a) || isNaN(b)) return null;
    return (b - a) / (365.2425 * 24 * 3600 * 1000);
  };

  /* ---------- régressions ---------- */
  C.linreg = function (xs, ys) {
    var n = xs.length; if (n < 2) return null;
    var sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
    for (var i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; sxy += xs[i] * ys[i]; syy += ys[i] * ys[i]; }
    var d = n * sxx - sx * sx; if (Math.abs(d) < 1e-12) return null;
    var b = (n * sxy - sx * sy) / d, a = (sy - b * sx) / n;
    var mean = sy / n, ssTot = 0, ssRes = 0;
    for (i = 0; i < n; i++) { var f = a + b * xs[i]; ssRes += (ys[i] - f) * (ys[i] - f); ssTot += (ys[i] - mean) * (ys[i] - mean); }
    return { a: a, b: b, r2: ssTot > 0 ? 1 - ssRes / ssTot : 1, see: n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0 };
  };

  // moindres carrés polynomiaux (degré k), coefficients c0..ck
  C.polyfit = function (xs, ys, k) {
    var n = xs.length; if (n <= k) return null;
    var m = k + 1, A = [], i, j, r;
    // centrage pour la stabilité numérique
    var mx = 0; for (i = 0; i < n; i++) mx += xs[i]; mx /= n;
    for (i = 0; i < m; i++) { A.push([]); for (j = 0; j <= m; j++) A[i].push(0); }
    for (r = 0; r < n; r++) {
      var x = xs[r] - mx, pw = [1];
      for (i = 1; i <= 2 * k; i++) pw.push(pw[i - 1] * x);
      for (i = 0; i < m; i++) { for (j = 0; j < m; j++) A[i][j] += pw[i + j]; A[i][m] += pw[i] * ys[r]; }
    }
    for (i = 0; i < m; i++) { // Gauss
      var p = i; for (r = i + 1; r < m; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
      var t = A[i]; A[i] = A[p]; A[p] = t;
      if (Math.abs(A[i][i]) < 1e-14) return null;
      for (r = 0; r < m; r++) if (r !== i) { var f = A[r][i] / A[i][i]; for (j = i; j <= m; j++) A[r][j] -= f * A[i][j]; }
    }
    var c = []; for (i = 0; i < m; i++) c.push(A[i][m] / A[i][i]);
    return { c: c, mx: mx, f: function (v) { var x = v - mx, s = 0, pw = 1; for (var q = 0; q < c.length; q++) { s += c[q] * pw; pw *= x; } return s; } };
  };

  function interpX(xs, ys, target) { // premier x où y franchit target (interpolation linéaire)
    for (var i = 1; i < xs.length; i++) {
      var y0 = ys[i - 1], y1 = ys[i];
      if ((y0 - target) * (y1 - target) <= 0 && y1 !== y0) return xs[i - 1] + (target - y0) * (xs[i] - xs[i - 1]) / (y1 - y0);
    }
    return null;
  }
  C.interpX = interpX;

  /* ---------- 1. Léger navette 20 m (Léger et al. 1988, 6–18 ans) ---------- */
  C.LEGER = { start: 8.5, step: 0.5, stageSec: 60, see: 5.9 };
  C.legerSpeed = function (stage) { return C.LEGER.start + C.LEGER.step * (stage - 1); };
  C.legerShuttles = function (stage) { // nombre de navettes (20 m) dans le palier
    var v = C.legerSpeed(stage) / 3.6; return Math.round(C.LEGER.stageSec / (20 / v));
  };
  C.legerInterval = function (stage) { return 20 / (C.legerSpeed(stage) / 3.6); };
  // VO2max = 31.025 + 3.238 V − 3.248 A + 0.1536 A·V  (V = vitesse du dernier palier terminé)
  C.legerVO2 = function (lastStage, age) {
    if (!(lastStage >= 1) || !(age > 0)) return null;
    var V = C.legerSpeed(lastStage), A = age;
    if (A >= 18) return { vo2: -24.4 + 6.0 * V, V: V, see: C.LEGER.see, adult: true };
    return { vo2: 31.025 + 3.238 * V - 3.248 * A + 0.1536 * A * V, V: V, see: C.LEGER.see, ageUsed: A };
  };
  // palier/navette au moment de l'arrêt -> dernier palier entièrement terminé
  C.legerLastCompleted = function (stage, shuttle) {
    if (!(stage >= 1)) return null;
    return shuttle >= C.legerShuttles(stage) ? stage : stage - 1;
  };
  C.legerTotalShuttles = function (stage, shuttle) {
    var t = 0; for (var s = 1; s < stage; s++) t += C.legerShuttles(s); return t + (shuttle || 0);
  };

  /* ---------- 2. Uth–Sørensen (2004) ---------- */
  C.UTH = { k: 15.3, seeAdult: 5.7, seeYouth: 7.0 };
  C.uthVO2 = function (hrmax, hrrest, age) {
    if (!(hrmax > 0) || !(hrrest > 0) || hrrest >= hrmax) return null;
    return { vo2: C.UTH.k * hrmax / hrrest, see: age != null && age < 18 ? C.UTH.seeYouth : C.UTH.seeAdult };
  };

  /* ---------- FC de repos ---------- */
  // mesures: [{bpm}] ou valeurs ; renvoie moyenne et écart-type
  C.restHR = function (vals) {
    var v = vals.map(num).filter(function (x) { return x > 25 && x < 130; });
    if (!v.length) return null;
    var m = v.reduce(function (a, b) { return a + b; }, 0) / v.length;
    var sd = Math.sqrt(v.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / Math.max(1, v.length - 1));
    return { mean: m, sd: v.length > 1 ? sd : 0, n: v.length };
  };
  // à partir d'un enregistrement [{t,hr}] : moyenne des `win` dernières secondes, en excluant le début
  C.restFromRecording = function (samples, win) {
    win = win || 120;
    if (!samples || samples.length < 10) return null;
    var tEnd = samples[samples.length - 1].t, xs = samples.filter(function (s) { return s.t >= tEnd - win && s.hr > 0; });
    if (!xs.length) return null;
    var m = xs.reduce(function (a, s) { return a + s.hr; }, 0) / xs.length;
    var mn = Math.min.apply(null, xs.map(function (s) { return s.hr; }));
    return { mean: m, min: mn, n: xs.length };
  };
  // RMSSD (VFC) à partir des intervalles RR en ms
  C.rmssd = function (rr) {
    var v = (rr || []).filter(function (x) { return x > 300 && x < 2000; });
    // filtre des artefacts : écart > 20 % avec le précédent
    var clean = [v[0]];
    for (var i = 1; i < v.length; i++) if (Math.abs(v[i] - v[i - 1]) / v[i - 1] < 0.2) clean.push(v[i]);
    if (clean.length < 20) return null;
    var s = 0; for (i = 1; i < clean.length; i++) s += Math.pow(clean[i] - clean[i - 1], 2);
    return Math.sqrt(s / (clean.length - 1));
  };

  /* ---------- 3. Test progressif nage (step test) ---------- */
  C.PROTOCOLS = {
    '7x200': { reps: 7, dist: 200, cycle: 300, label: '7 × 200 m @ 5:00' },
    '5x200': { reps: 5, dist: 200, cycle: 300, label: '5 × 200 m @ 5:00' },
    '7x100': { reps: 7, dist: 100, cycle: 150, label: '7 × 100 m @ 2:30' },
    '5x100': { reps: 5, dist: 100, cycle: 150, label: '5 × 100 m @ 2:30' }
  };
  C.protocolForLevel = function (lvl) { lvl = +lvl || 0; return lvl >= 6 ? '7x200' : lvl === 5 ? '7x100' : '5x100'; };

  // reps: [{time (s), hr, lac, rpe}], dist
  C.stepTest = function (reps, dist, opts) {
    opts = opts || {};
    var rows = reps.map(function (r, i) {
      var t = num(r.time); return { i: i + 1, time: t, v: t ? dist / t : null, pace: t ? t * 100 / dist : null, hr: num(r.hr), lac: num(r.lac), rpe: num(r.rpe), sr: num(r.sr) };
    }).filter(function (r) { return r.v; });
    var out = { rows: rows, dist: dist };
    if (rows.length < 3) { out.error = 'min3'; return out; }
    // FC
    var hrRows = rows.filter(function (r) { return r.hr > 0; });
    out.hrPeak = hrRows.length ? Math.max.apply(null, hrRows.map(function (r) { return r.hr; })) : null;
    if (hrRows.length >= 3) {
      // régression sur les répétitions sous-maximales (exclure la dernière si elle est maximale)
      var sub = hrRows.length >= 4 ? hrRows.slice(0, -1) : hrRows;
      out.hrReg = C.linreg(sub.map(function (r) { return r.v; }), sub.map(function (r) { return r.hr; }));
      out.hrRegAll = C.linreg(hrRows.map(function (r) { return r.v; }), hrRows.map(function (r) { return r.hr; }));
      var hrmax = opts.hrmax || out.hrPeak;
      if (out.hrReg && out.hrReg.b > 0 && hrmax) {
        out.vAtHRmax = (hrmax - out.hrReg.a) / out.hrReg.b; // vitesse extrapolée à FCmax
      }
    }
    // lactate
    var lac = rows.filter(function (r) { return r.lac != null && r.lac >= 0; });
    if (lac.length >= 4) out.lactate = C.lactate(lac);
    out.vLast = rows[rows.length - 1].v;
    return out;
  };

  // seuils lactiques : Dmax, Dmax modifié, OBLA 4 mmol, LT1 (base + 1 mmol)
  C.lactate = function (rows) {
    rows = rows.slice().sort(function (a, b) { return a.v - b.v; });
    var xs = rows.map(function (r) { return r.v; }), ys = rows.map(function (r) { return r.lac; });
    var out = { n: rows.length };
    var fit = C.polyfit(xs, ys, Math.min(3, rows.length - 1));
    out.fit = fit;
    var base = Math.min.apply(null, ys);
    out.baseline = base;
    // OBLA 4 mmol & LT1 par interpolation des points mesurés (plus robuste)
    out.obla = interpX(xs, ys, 4.0);
    out.lt1 = interpX(xs, ys, base + 1.0);
    if (fit) {
      var dm = function (x0) {
        var y0 = fit.f(x0), x1 = xs[xs.length - 1], y1 = fit.f(x1);
        var m = (y1 - y0) / (x1 - x0), best = null, bx = null, N = 400;
        for (var k = 0; k <= N; k++) {
          var x = x0 + (x1 - x0) * k / N, d = (y0 + m * (x - x0) - fit.f(x)) / Math.sqrt(1 + m * m);
          if (best == null || d > best) { best = d; bx = x; }
        }
        return best > 0 ? bx : null;
      };
      out.dmax = dm(xs[0]);
      // Dmax modifié : point précédant la première hausse ≥ 0,4 mmol
      var start = null;
      for (var i = 1; i < ys.length; i++) if (ys[i] - ys[i - 1] >= 0.4) { start = i - 1; break; }
      if (start != null && start < xs.length - 2) out.mdmax = dm(xs[start]);
      out.lacAt = function (v) { return fit.f(v); };
    }
    return out;
  };

  /* ---------- 4. CSS (vitesse critique) ---------- */
  C.css = function (d1, t1, d2, t2) {
    d1 = num(d1); d2 = num(d2); t1 = num(t1); t2 = num(t2);
    if (!d1 || !d2 || !t1 || !t2 || d1 === d2) return null;
    if (d1 < d2) { var a = d1; d1 = d2; d2 = a; a = t1; t1 = t2; t2 = a; }
    var v = (d1 - d2) / (t1 - t2);
    if (!(v > 0)) return null;
    // capacité anaérobie (D') : distance nageable au-dessus de CSS
    var dprime = d1 - v * t1;
    return { v: v, pace: 100 / v, dprime: dprime };
  };

  /* ---------- 5. 400 m maximal ---------- */
  C.max400 = function (time, hrEnd, hr60, dist) {
    dist = dist || 400; var t = num(time); if (!t) return null;
    var out = { v: dist / t, pace: t * 100 / dist, time: t };
    if (num(hrEnd) && num(hr60)) out.hrr60 = num(hrEnd) - num(hr60);
    return out;
  };
  C.hrrRating = function (hrr) { // récupération 60 s
    if (hrr == null) return null;
    return hrr >= 50 ? 'exc' : hrr >= 40 ? 'good' : hrr >= 30 ? 'avg' : hrr >= 20 ? 'low' : 'poor';
  };

  /* ---------- zones & allures ---------- */
  C.ZONES_PCT = [[0, 0.68], [0.68, 0.78], [0.78, 0.87], [0.87, 0.95], [0.95, 1.0]];
  C.hrZones = function (hrmax, hrrest, lt1hr, lt2hr) {
    if (!hrmax) return null;
    var z = C.ZONES_PCT.map(function (p, i) { return { z: i + 1, lo: Math.round(hrmax * p[0]), hi: Math.round(hrmax * p[1]) }; });
    z[0].lo = Math.min(z[0].hi - 5, hrrest ? Math.round(hrrest + 0.5 * (hrmax - hrrest)) : Math.round(hrmax * 0.55));
    // ajustement par les seuils lactiques si disponibles
    if (lt1hr && lt2hr && lt2hr > lt1hr) {
      z[1].hi = z[2].lo = Math.round(lt1hr);
      z[2].hi = z[3].lo = Math.round(lt2hr);
      z[3].hi = z[4].lo = Math.round(Math.max(lt2hr + 4, hrmax * 0.95));
      z.source = 'lactate';
    } else z.source = 'hrmax';
    return z;
  };
  // allures /100 m (secondes) à partir de CSS (s/100) et du 400 m (s/100)
  C.paces = function (cssPace, p400) {
    if (!cssPace) return null;
    return {
      A1: [cssPace + 12, cssPace + 15],
      A2: [cssPace + 6, cssPace + 9],
      EN: [cssPace - 1, cssPace + 2],
      VO2: p400 ? [p400 - 1, p400 + 1] : [cssPace - 6, cssPace - 4],
      SP: p400 ? [p400 - 8, p400 - 5] : [cssPace - 14, cssPace - 10]
    };
  };

  /* ---------- combinaison des estimations ---------- */
  // ests: [{vo2, see, label}] -> moyenne pondérée par l'inverse de la variance
  C.combine = function (ests) {
    var e = ests.filter(function (x) { return x && x.vo2 > 0 && x.see > 0; });
    if (!e.length) return null;
    var w = 0, s = 0;
    e.forEach(function (x) { var wi = 1 / (x.see * x.see); w += wi; s += wi * x.vo2; });
    var vo2 = s / w, se = Math.sqrt(1 / w);
    // si les méthodes divergent plus que prévu, on élargit l'incertitude (Birge)
    if (e.length > 1) {
      var chi = 0; e.forEach(function (x) { chi += Math.pow((x.vo2 - vo2) / x.see, 2); });
      var rb = Math.sqrt(chi / (e.length - 1)); if (rb > 1) se *= rb;
    }
    return { vo2: vo2, se: se, pct: 100 * se / vo2, ci95: [vo2 - 1.96 * se, vo2 + 1.96 * se], n: e.length };
  };

  /* ---------- import CSV Polar Flow ---------- */
  // renvoie [{t (s depuis début), hr}]
  C.parsePolarCSV = function (text) {
    var lines = String(text).replace(/\r/g, '').split('\n');
    var hi = -1, sep = ',';
    for (var i = 0; i < lines.length; i++) {
      if (/HR \(bpm\)/i.test(lines[i])) { hi = i; sep = lines[i].indexOf(';') >= 0 && lines[i].indexOf(',') < 0 ? ';' : ','; break; }
    }
    if (hi < 0) return { error: 'nohr' };
    var head = lines[hi].split(sep).map(function (s) { return s.trim(); });
    var ti = head.findIndex(function (h) { return /^time$/i.test(h); }), hri = head.findIndex(function (h) { return /HR \(bpm\)/i.test(h); });
    if (ti < 0 || hri < 0) return { error: 'nohr' };
    var meta = {};
    if (hi >= 2) { // ligne de résumé (nom, date…)
      var mh = lines[0].split(sep), mv = lines[1].split(sep);
      mh.forEach(function (h, k) { meta[h.trim()] = (mv[k] || '').trim(); });
    }
    var out = [];
    for (i = hi + 1; i < lines.length; i++) {
      var c = lines[i].split(sep); if (c.length <= hri) continue;
      var t = C.parseTime(c[ti]), hr = num(c[hri]);
      if (t == null && /^0?0:00:00$/.test((c[ti] || '').trim())) t = 0;
      if (t != null && hr > 0) out.push({ t: t, hr: hr });
    }
    return { samples: out, meta: meta };
  };

  // aligne un enregistrement sur les répétitions : FC de fin = max dans [fin−5 s, fin+10 s]
  C.alignReps = function (samples, offset, cycle, times) {
    var res = [];
    for (var i = 0; i < times.length; i++) {
      var t = num(times[i]); if (!t) { res.push(null); continue; }
      var end = offset + i * cycle + t;
      var w = samples.filter(function (s) { return s.t >= end - 5 && s.t <= end + 10; });
      res.push(w.length ? { end: end, hr: Math.max.apply(null, w.map(function (s) { return s.hr; })) } : null);
    }
    var last = res.filter(Boolean).pop(), hr60 = null;
    if (last) {
      var w60 = samples.filter(function (s) { return Math.abs(s.t - (last.end + 60)) <= 2; });
      if (w60.length) hr60 = w60.reduce(function (a, s) { return a + s.hr; }, 0) / w60.length;
    }
    return { reps: res, hr60: hr60, peak: samples.length ? Math.max.apply(null, samples.map(function (s) { return s.hr; })) : null };
  };
  // détection du début de la 1re répétition : 1re montée franche après le plus long plateau bas
  C.guessOffset = function (samples, cycle, nReps) {
    if (!samples || samples.length < 30) return 0;
    var hrs = samples.map(function (s) { return s.hr; });
    var mn = Math.min.apply(null, hrs), mx = Math.max.apply(null, hrs), thr = mn + 0.35 * (mx - mn);
    var testDur = cycle * nReps, tEnd = samples[samples.length - 1].t;
    for (var i = 0; i < samples.length; i++) if (samples[i].hr > thr) {
      var t = Math.max(0, samples[i].t - 20);
      return Math.min(t, Math.max(0, tEnd - testDur));
    }
    return 0;
  };


  /* ---------- maturité (Mirwald 2002) ---------- */
  // h, sh (taille assise) en cm, w en kg, age en années -> {mo, aphv, see}
  C.maturity = function (sex, age, h, sh, w) {
    h = num(h); sh = num(sh); w = num(w);
    if (!(age > 0) || !h || !sh || !w || sh >= h) return null;
    var ll = h - sh, mo;
    if (sex === 'F') mo = -9.376 + 0.0001882 * ll * sh + 0.0022 * age * ll + 0.005841 * age * sh - 0.002658 * age * w + 0.07693 * (w / h * 100);
    else mo = -9.236 + 0.0002708 * ll * sh - 0.001663 * age * ll + 0.007216 * age * sh + 0.02292 * (w / h * 100);
    return { mo: mo, aphv: age - mo, see: sex === 'F' ? 0.57 : 0.59, legLen: ll };
  };
  C.maturityStage = function (mo) { return mo == null ? null : mo < -1 ? 'pre' : mo <= 1 ? 'circa' : 'post'; };
  C.apeIndex = function (span, h) { span = num(span); h = num(h); return span && h ? span / h : null; };
  C.bmi = function (w, h) { w = num(w); h = num(h); return w && h ? w / Math.pow(h / 100, 2) : null; };

  /* ---------- points World Aquatics : P = 1000 × (B/T)^3 ---------- */
  // temps de base SCM 2025 (01.09.2025–31.08.2026) et LCM 2026
  C.WA_BASE = {
    SCM: { M: { '50FR': 19.90, '100FR': 44.84, '200FR': 98.61, '400FR': 212.25, '800FR': 440.46, '1500FR': 846.88, '50BK': 22.11, '100BK': 48.33, '200BK': 105.63, '50BR': 24.95, '100BR': 55.28, '200BR': 120.16, '50FL': 21.32, '100FL': 47.71, '200FL': 106.85, '100IM': 49.28, '200IM': 108.88, '400IM': 234.81 },
           F: { '50FR': 22.83, '100FR': 50.25, '200FR': 110.31, '400FR': 230.25, '800FR': 477.42, '1500FR': 908.24, '50BK': 25.23, '100BK': 54.02, '200BK': 118.04, '50BR': 28.37, '100BR': 62.36, '200BR': 132.50, '50FL': 23.94, '100FL': 52.71, '200FL': 119.32, '100IM': 55.11, '200IM': 121.63, '400IM': 255.48 } },
    LCM: { M: { '50FR': 20.91, '100FR': 46.40, '200FR': 102.00, '400FR': 219.96, '800FR': 452.12, '1500FR': 870.67, '50BK': 23.55, '100BK': 51.60, '200BK': 111.92, '50BR': 25.95, '100BR': 56.88, '200BR': 125.48, '50FL': 22.27, '100FL': 49.45, '200FL': 110.34, '200IM': 112.69, '400IM': 242.50 },
           F: { '50FR': 23.61, '100FR': 51.71, '200FR': 112.23, '400FR': 234.18, '800FR': 484.12, '1500FR': 920.48, '50BK': 26.86, '100BK': 57.13, '200BK': 123.14, '50BR': 29.16, '100BR': 64.13, '200BR': 137.55, '50FL': 24.43, '100FL': 54.60, '200FL': 121.81, '200IM': 125.70, '400IM': 263.65 } }
  };
  C.EVENTS = ['50FR', '100FR', '200FR', '400FR', '800FR', '1500FR', '50BK', '100BK', '200BK', '50BR', '100BR', '200BR', '50FL', '100FL', '200FL', '100IM', '200IM', '400IM'];
  C.waPoints = function (ev, t, sex, course) {
    t = num(t); var b = ((C.WA_BASE[course || 'SCM'] || {})[sex === 'F' ? 'F' : 'M'] || {})[ev];
    return t && b ? Math.floor(1000 * Math.pow(b / t, 3)) : null;
  };
  // prédiction Riegel : T2 = T1 × (D2/D1)^1.06 (indicatif, même nage)
  C.riegel = function (t1, d1, d2, k) { return t1 * Math.pow(d2 / d1, k || 1.06); };

  /* ---------- récupération quotidienne & charge ---------- */
  function stats(arr) { var v = arr.filter(function (x) { return x != null && isFinite(x); }); if (!v.length) return null; var m = v.reduce(function (a, b) { return a + b; }, 0) / v.length; var sd = v.length > 1 ? Math.sqrt(v.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / (v.length - 1)) : 0; return { m: m, sd: sd, n: v.length }; }
  C.stats = stats;
  // days: [{date, hrv, rhr, sleepScore, sleepH, recharge (1..5), load}] ; cible = dernier jour
  C.readiness = function (days, targetDate, age) {
    var d = days.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var cur = d.filter(function (x) { return x.date === targetDate; })[0];
    if (!cur) return null;
    var t = new Date(targetDate), base = d.filter(function (x) { var k = (t - new Date(x.date)) / 864e5; return k >= 1 && k <= 28; });
    var hrvB = stats(base.map(function (x) { return num(x.hrv) ? Math.log(num(x.hrv)) : null; })), rhrB = stats(base.map(function (x) { return num(x.rhr); }));
    var flags = [], score = 0, res = { flags: flags, baseN: base.length };
    if (num(cur.hrv) && hrvB && hrvB.n >= 7) {
      var z = (Math.log(num(cur.hrv)) - hrvB.m) / Math.max(hrvB.sd, 0.07); res.hrvZ = z; res.hrvBase = Math.exp(hrvB.m);
      if (z < -1.5) { flags.push('hrv2'); score += 2; } else if (z < -0.75) { flags.push('hrv1'); score += 1; }
    }
    if (num(cur.rhr) && rhrB && rhrB.n >= 7) {
      var z2 = (num(cur.rhr) - rhrB.m) / Math.max(rhrB.sd, 2); res.rhrZ = z2; res.rhrBase = rhrB.m;
      if (z2 > 1.5) { flags.push('rhr2'); score += 2; } else if (z2 > 0.75) { flags.push('rhr1'); score += 1; }
    }
    var needH = age != null && age < 13 ? 9 : 8;
    if (num(cur.sleepH) && num(cur.sleepH) < needH - 1) { flags.push('sleep2'); score += 2; } else if (num(cur.sleepH) && num(cur.sleepH) < needH) { flags.push('sleep1'); score += 1; }
    if (num(cur.sleepScore) && num(cur.sleepScore) < 60) { flags.push('score'); score += 1; }
    if (num(cur.recharge) && num(cur.recharge) <= 2) { flags.push('recharge'); score += num(cur.recharge) === 1 ? 2 : 1; }
    res.score = score; res.level = score >= 3 ? 'red' : score >= 1 ? 'yellow' : 'green';
    res.sleepNeed = needH;
    return res;
  };
  // charge : sRPE = durée × RPE ; ACWR = charge 7 j / (charge 28 j / 4)
  C.acwr = function (days, targetDate) {
    var t = new Date(targetDate), a = 0, c = 0, n = 0;
    days.forEach(function (x) { var k = (t - new Date(x.date)) / 864e5, l = num(x.load); if (l == null || k < 0) return; if (k < 7) a += l; if (k < 28) { c += l; n++; } });
    if (!c) return null;
    var first = null; days.forEach(function (x) { if (num(x.load) != null && (!first || x.date < first)) first = x.date; });
    var span = first ? (t - new Date(first)) / 864e5 : 0;
    if (span < 21) return { acute: a, short: true, span: Math.floor(span) + 1 };
    var r = a / (c / 4);
    return { acute: a, chronic: c / 4, ratio: r, zone: r < 0.8 ? 'low' : r <= 1.3 ? 'ok' : r <= 1.5 ? 'warn' : 'risk', n: n };
  };

  root.VO2C = C;
  if (typeof module !== 'undefined') module.exports = C;
})(typeof window !== 'undefined' ? window : this);
