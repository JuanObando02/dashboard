// ═══════════════════════════════════════════════════════════
// DATASET — cargado desde data_BSC_HDPUV.json
// ═══════════════════════════════════════════════════════════
let D = {};
let bscData = null;

// Funciones de utilidad para búsqueda
function normalizeStr(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}
function getWords(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 3);
}
function getMatchScore(str1, str2) {
    const s1 = normalizeStr(str1);
    const s2 = normalizeStr(str2);
    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    
    const w1 = getWords(str1);
    const w2 = getWords(str2);
    if (w1.length === 0 || w2.length === 0) return 0;
    
    let intersection = 0;
    const union = new Set([...w1, ...w2]);
    for (const w of w1) {
        if (w2.includes(w)) intersection++;
    }
    return intersection / union.size;
}// ═══════════════════════════════════════════════════════════
// CONFIG PERSPECTIVAS
// ═══════════════════════════════════════════════════════════
const PERSP = {
    Clientes:    { label: 'Clientes',               color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',   cls: 'sc-cli', dot: '--cli' },
    Procesos:    { label: 'Procesos Internos',      color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  cls: 'sc-pro', dot: '--pro' },
    Aprendizaje: { label: 'Aprendizaje y Crecimiento', color: '#10b981', bg: 'rgba(16,185,129,0.1)', cls: 'sc-apr', dot: '--apr' },
    Finanzas:    { label: 'Finanzas',               color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', cls: 'sc-fin', dot: '--fin' },
};

// Estado
let activePeriod = 0; // 0 = todo
let activeKPI = null;
let filterDate = '2029-12-01';
let allDates = [];
let chartMain = null, chartBar = null, chartRadar = null, chartCosto = null, chartModal = null;

// ── HELPERS ────────────────────────────────────────────────
function lastVal(k) { 
    const d = D[k].data;
    const filtered = d.filter(x => x.f <= filterDate);
    if (filtered.length === 0) return d[0].v;
    return filtered[filtered.length - 1].v;
}

function cumpl(k) {
    const v = lastVal(k), m = D[k].m;
    if (D[k].inv) { return m === 0 ? (v === 0 ? 100 : 0) : Math.min(130, (m / Math.max(v, 0.001)) * 100); }
    return m === 0 ? 100 : Math.min(130, (v / m) * 100);
}

function status(k) {
    const c = cumpl(k);
    return c >= 100 ? 'g' : c >= 80 ? 'y' : 'r';
}

function stColor(s) { return s === 'g' ? '#1A7C4F' : s === 'y' ? '#9B6C00' : '#B52D2D'; }
function stBg(s) { return s === 'g' ? '#EBF5EF' : s === 'y' ? '#FEF7E5' : '#FDEAEA'; }

function fmt(k, v) {
    const u = D[k].u;
    if (u === '%') return v.toFixed(1) + '%';
    if (u === 'Puntos') return v.toFixed(2);
    if (u === '#') return Math.round(v) + '';
    if (u === '$M') return '$' + v.toFixed(1) + 'M';
    return v.toFixed(1);
}

function slice(k) {
    const all = D[k].data.filter(x => x.f <= filterDate);
    if (activePeriod === 0) return all;
    if (activePeriod === 'YTD') {
        const year = filterDate.slice(0, 4);
        return all.filter(x => x.f.startsWith(year));
    }
    return all.slice(-activePeriod);
}

function perspScore(p) {
    const ks = Object.keys(D).filter(k => D[k].p === p);
    if (!ks.length) return 0;
    return Math.round(ks.reduce((s, k) => s + cumpl(k), 0) / ks.length);
}

function trend(k) {
    const data = D[k].data, n = data.length;
    if (n < 4) return '→';
    const last = data[n - 1].v;
    const avg = (data[n - 2].v + data[n - 3].v + data[n - 4].v) / 3;
    const delta = (last - avg) / Math.max(Math.abs(avg), 0.001) * 100;
    if (D[k].inv) { return delta < -2 ? '↑' : delta > 2 ? '↓' : '→'; }
    return delta > 2 ? '↑' : delta < -2 ? '↓' : '→';
}

// ── RENDER ALERTAS ─────────────────────────────────────────
function renderAlerts() {
    const el = document.getElementById('alerts');
    const reds = Object.keys(D).filter(k => status(k) === 'r');
    const yels = Object.keys(D).filter(k => status(k) === 'y');
    const greens = Object.keys(D).filter(k => status(k) === 'g');
    let h = '';
    greens.slice(0, 3).forEach(k => {
        h += `<div class="alert-chip g">✓ ${k.split(' ').slice(0, 3).join(' ')}: ${fmt(k, lastVal(k))}</div>`;
    });
    yels.forEach(k => {
        h += `<div class="alert-chip y">⚠ ${k.split(' ').slice(0, 3).join(' ')}: ${fmt(k, lastVal(k))} / meta ${fmt(k, D[k].m)}</div>`;
    });
    reds.forEach(k => {
        h += `<div class="alert-chip r">✗ ${k.split(' ').slice(0, 3).join(' ')}: ${fmt(k, lastVal(k))} / meta ${fmt(k, D[k].m)}</div>`;
    });
    el.innerHTML = h;
}

// ── RENDER SCORE CARDS ─────────────────────────────────────
function renderScores() {
    const el = document.getElementById('score-row');
    el.innerHTML = '';
    Object.entries(PERSP).forEach(([p, pc]) => {
        const sc = perspScore(p);
        const cls = sc >= 100 ? 'g' : sc >= 80 ? 'y' : 'r';
        const ks = Object.keys(D).filter(k => D[k].p === p);
        const ok = ks.filter(k => status(k) === 'g').length;
        el.innerHTML += `
      <div class="score-card ${pc.cls}" onclick="filterPersp('${p}')">
        <div class="score-label">${pc.label}</div>
        <div class="score-num ${cls}">${sc}<span style="font-family:'DM Mono';font-size:16px">%</span></div>
        <div class="score-meta">${ok} de ${ks.length} en meta</div>
        <div class="score-bar">
          <div class="score-bar-fill" style="width:${Math.min(sc, 100)}%;background:${pc.color}"></div>
        </div>
      </div>`;
    });
}

// ── RENDER BSC GRID ────────────────────────────────────────
function renderBSC() {
    const el = document.getElementById('bsc-grid');
    el.innerHTML = '';
    Object.entries(PERSP).forEach(([p, pc]) => {
        const ks = Object.keys(D).filter(k => D[k].p === p);
        const sc = perspScore(p);
        const scCls = sc >= 100 ? 'g' : sc >= 80 ? 'y' : 'r';
        let rows = '';
        ks.forEach(k => {
            const v = lastVal(k), m = D[k].m;
            const st = status(k);
            const c = Math.min(cumpl(k), 100);
            const tr = trend(k);
            const sel = activeKPI === k ? 'selected' : '';
            rows += `
        <div class="kpi-row ${sel}" onclick="selectKPI('${k}')">
          <div class="kpi-dot" style="background:${stColor(st)}"></div>
          <div class="kpi-name">${k}</div>
          <div class="kpi-bar-wrap">
            <div class="kpi-bar-fill" style="width:${c}%;background:${stColor(st)}"></div>
          </div>
          <div class="kpi-val" style="color:${stColor(st)}">${fmt(k, v)} <span style="color:#aaa;font-size:10px">${tr}</span></div>
          <div class="kpi-meta">meta ${fmt(k, m)}</div>
        </div>`;
        });
        el.innerHTML += `
      <div class="persp-card">
        <div class="persp-head">
          <div class="persp-dot" style="background:${pc.color}"></div>
          <div class="persp-title">${pc.label}</div>
          <button class="btn-strat" onclick="openPerspModal('${p}')">Objetivos e Iniciativas</button>
          <div class="persp-badge" style="background:${stBg(scCls)};color:${stColor(scCls)}">${sc}%</div>
        </div>
        ${rows}
      </div>`;
    });
}

// ── CHART PRINCIPAL ────────────────────────────────────────
function renderMain(k) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (chartMain) chartMain.destroy();
    const sl = slice(k);
    const pc = PERSP[D[k].p];
    document.getElementById('main-title').textContent = k;
    document.getElementById('main-sub').textContent =
        `${D[k].p} · Meta: ${fmt(k, D[k].m)} · LB: ${fmt(k, D[k].lb)} · Unidad: ${D[k].u}`;
    chartMain = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sl.map(r => r.f.slice(0, 7)),
            datasets: [
                {
                    label: k, data: sl.map(r => r.v),
                    borderColor: pc.color, backgroundColor: pc.color + '18',
                    borderWidth: 2, fill: true, tension: .35, pointRadius: 0, pointHoverRadius: 4
                },
                {
                    label: 'Meta', data: Array(sl.length).fill(D[k].m),
                    borderColor: '#475569', borderWidth: 1.5, borderDash: [5, 4],
                    pointRadius: 0, fill: false
                },
                {
                    label: 'Línea base', data: Array(sl.length).fill(D[k].lb),
                    borderColor: '#E2C97E', borderWidth: 1, borderDash: [3, 4],
                    pointRadius: 0, fill: false
                },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10, family: 'DM Mono' } } } },
            scales: {
                x: {
                    ticks: { color: '#94a3b8', font: { size: 9 }, maxRotation: 0, maxTicksLimit: 8 },
                    grid: { color: '#1e2a3a' }
                },
                y: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: '#1e2a3a' } }
            }
        }
    });
}

// ── BAR CHART ──────────────────────────────────────────────
function renderBar() {
    const ctx = document.getElementById('barChart').getContext('2d');
    if (chartBar) chartBar.destroy();
    const labels = Object.keys(PERSP).map(p => PERSP[p].label.split(' ')[0]);
    const vals = Object.keys(PERSP).map(p => Math.min(perspScore(p), 120));
    const colors = Object.values(PERSP).map(pc => pc.color);
    chartBar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: '% Cumplimiento', data: vals,
                    backgroundColor: colors.map(c => c + '99'), borderColor: colors,
                    borderWidth: 2, borderRadius: 5
                },
                {
                    label: 'Meta (100%)', data: Array(4).fill(100),
                    backgroundColor: 'transparent', borderColor: '#475569',
                    borderWidth: 1.5, borderDash: [4, 3], type: 'line', pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10, family: 'DM Mono' } } } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                y: {
                    max: 120, ticks: { color: '#94a3b8', font: { size: 9 }, callback: v => v + '%' },
                    grid: { color: '#1e2a3a' }
                }
            }
        }
    });
}

// ── RADAR ──────────────────────────────────────────────────
function renderRadar() {
    const ctx = document.getElementById('radarChart').getContext('2d');
    if (chartRadar) chartRadar.destroy();
    
    // Labels más descriptivos para el radar
    const labels = Object.keys(PERSP).map(p => PERSP[p].label);
    
    const initData = Object.keys(PERSP).map(p => {
        const ks = Object.keys(D).filter(k => D[k].p === p);
        const avg = ks.reduce((s, k) => {
            const v0 = D[k].data[0].v, m = D[k].m;
            const c = D[k].inv ? (m === 0 ? 0 : Math.min(100, (m / Math.max(v0, .001)) * 100)) : Math.min(100, (v0 / m) * 100);
            return s + c;
        }, 0) / ks.length;
        return Math.round(avg);
    });
    
    const now = Object.keys(PERSP).map(p => Math.min(perspScore(p), 110));
    
    chartRadar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Inicio 2024',
                    data: initData,
                    borderColor: '#64748b',
                    backgroundColor: 'rgba(100, 116, 139, 0.15)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true
                },
                {
                    label: 'Corte actual',
                    data: now,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.25)',
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#00d4ff',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { 
                        color: '#94a3b8', 
                        font: { size: 12, weight: '500' },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%`
                    }
                }
            },
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    ticks: {
                        display: true,
                        color: '#64748b',
                        font: { size: 10 },
                        stepSize: 20,
                        showLabelBackdrop: false,
                        backdropColor: 'transparent'
                    },
                    pointLabels: {
                        color: '#cbd5e1',
                        font: { size: 13, weight: '600' },
                        padding: 15
                    },
                    min: 0,
                    max: 100, // Limitar a 100 para claridad, los valores superiores se verán al borde
                    beginAtZero: true
                }
            }
        }
    });
}

// ── GAUGE AVANCE LB ────────────────────────────────────────
function renderGauge() {
    const el = document.getElementById('gauge-grid');
    const topKPIs = Object.keys(D).filter(k => D[k].u !== '$M').slice(0, 10);
    el.innerHTML = topKPIs.map(k => {
        const v = lastVal(k), m = D[k].m, lb = D[k].lb;
        const maxScale = Math.max(m, v, lb) * 1.05;
        const pctV = Math.min((v / maxScale) * 100, 100);
        const pctLB = Math.min((lb / maxScale) * 100, 100);
        const pctM = Math.min((m / maxScale) * 100, 100);
        const st = status(k);
        return `<div class="gauge-item">
      <div class="gauge-label" title="${k}">${k}</div>
      <div class="gauge-track">
        <div class="gauge-fill" style="width:${pctV}%;background:${stColor(st)}"></div>
        <div class="gauge-lb" style="left:${pctLB}%" title="LB: ${fmt(k, lb)}"></div>
      </div>
      <div class="gauge-val" style="color:${stColor(st)}">${fmt(k, v)}</div>
    </div>`;
    }).join('');
}

// ── COSTO MANTENIMIENTO ────────────────────────────────────
function renderCosto() {
    const ctx = document.getElementById('costoChart').getContext('2d');
    if (chartCosto) chartCosto.destroy();
    const k = 'Reduccion de costos de mantenimiento';
    const data = D[k].data.filter(x => x.f <= filterDate);
    chartCosto = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(r => r.f.slice(0, 7)),
            datasets: [
                {
                    label: 'Costo real ($M)', data: data.map(r => r.v),
                    borderColor: '#975A16', backgroundColor: '#975A1615',
                    borderWidth: 2, fill: true, tension: .35, pointRadius: 0
                },
                {
                    label: 'Meta $146.9M', data: Array(data.length).fill(D[k].m),
                    borderColor: '#1A7C4F', borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, fill: false
                },
                {
                    label: 'LB $195.8M', data: Array(data.length).fill(D[k].lb),
                    borderColor: '#B52D2D', borderWidth: 1, borderDash: [3, 4], pointRadius: 0, fill: false
                },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10, family: 'DM Mono' } } } },
            scales: {
                x: { ticks: { color: '#94a3b8', font: { size: 9 }, maxRotation: 0, maxTicksLimit: 8 }, grid: { color: '#1e2a3a' } },
                y: { ticks: { color: '#94a3b8', font: { size: 9 }, callback: v => '$' + v + 'M' }, grid: { color: '#1e2a3a' } }
            }
        }
    });
}

// ── SELECT KPI ─────────────────────────────────────────────
function selectKPI(k) {
    activeKPI = k;
    renderBSC();
    renderMain(k);
    renderStrategicInfo(k);
}

// ── INFO ESTRATÉGICA ───────────────────────────────────────
function renderStrategicInfo(k) {
    const el = document.getElementById('kpi-strat-info');
    if (!el || !bscData) return;
    
    let foundObj = null;
    let foundPersp = null;
    let bestScore = 0;
    if (bscData.perspectivas) {
        for (const persp of bscData.perspectivas) {
            for (const obj of persp.objetivos) {
                for (const kpi of obj.kpis) {
                    const score = getMatchScore(kpi.nombre, k);
                    if (score > bestScore) {
                        bestScore = score;
                        foundObj = obj;
                        foundPersp = persp;
                    }
                }
            }
        }
    }
    
    if (bestScore < 0.4) {
        foundObj = null;
    }
    
    if (foundObj) {
        let inisHtml = foundObj.iniciativas.map(i => `
            <div class="strat-ini">
                <div class="strat-ini-name">• ${i.nombre}</div>
                <div class="strat-ini-budget">Presupuesto: USD $${(i.presupuesto_usd / 1000000).toFixed(1)}M | COP $${(i.presupuesto_cop / 1000000).toFixed(1)}M</div>
            </div>
        `).join('');
        
        el.style.display = 'block';
        el.innerHTML = `
            <div class="strat-section">
                <div class="strat-label">Objetivo Estratégico (${foundObj.id})</div>
                <div class="strat-desc">${foundObj.descripcion}</div>
            </div>
            <div class="strat-section">
                <div class="strat-label">Iniciativas Asociadas</div>
                <div class="strat-inis">
                    ${inisHtml}
                </div>
            </div>
        `;
    } else {
        el.style.display = 'none';
        el.innerHTML = '';
    }
}

// ── MODAL PERSPECTIVA ──────────────────────────────────────
function openPerspModal(pName) {
    if (!bscData || !bscData.perspectivas) return;
    
    let targetName = pName;
    if (pName === 'Procesos') targetName = 'Procesos internos';
    if (pName === 'Aprendizaje') targetName = 'Aprendizaje y crecimiento';
    
    const p = bscData.perspectivas.find(x => x.nombre === targetName || x.nombre === pName);
    if (!p) return;
    
    const pc = PERSP[pName] || { color: '#ffffff' };
    
    document.getElementById('p-title').innerHTML = `<span style="color:${pc.color}">Perspectiva:</span> ${p.nombre}`;
    document.getElementById('p-budget').innerHTML = `Presupuesto asignado: USD $${(p.presupuesto_usd / 1000000).toFixed(1)}M | COP $${(p.presupuesto_cop / 1000000).toFixed(1)}M`;
    
    let objsHtml = '';
    p.objetivos.forEach(o => {
        let inisHtml = o.iniciativas.map(i => `
            <div class="strat-ini-item">
                • ${i.nombre}
                <span class="strat-ini-item-budget" style="color:${pc.color}">USD $${(i.presupuesto_usd / 1000000).toFixed(1)}M | COP $${(i.presupuesto_cop / 1000000).toFixed(1)}M</span>
            </div>
        `).join('');
        
        objsHtml += `
            <div class="strat-obj-card" style="margin-bottom:12px;">
                <div class="strat-obj-id">${o.id}</div>
                <div class="strat-obj-desc">${o.descripcion}</div>
                <div class="strat-ini-list">
                    ${inisHtml}
                </div>
            </div>
        `;
    });
    
    document.getElementById('p-content').innerHTML = objsHtml;
    document.getElementById('persp-overlay').classList.add('open');
}

function closePerspModal() {
    document.getElementById('persp-overlay').classList.remove('open');
}

// ── MODAL ──────────────────────────────────────────────────
function openModal(k) {
    const v = lastVal(k), m = D[k].m, lb = D[k].lb;
    const c = Math.round(cumpl(k));
    const st = status(k);
    const stc = stColor(st);
    const delta = ((v - lb) / Math.max(Math.abs(lb), .001) * 100).toFixed(1);
    const pc = PERSP[D[k].p];

    document.getElementById('m-title').textContent = k;
    document.getElementById('m-stats').innerHTML = `
<div class="mstat">
<div class="mstat-val" style="color:${stc}">${fmt(k, v)}</div>
<div class="mstat-lbl">Valor actual</div>
</div>
<div class="mstat">
<div class="mstat-val">${fmt(k, m)}</div>
<div class="mstat-lbl">Meta destino</div>
</div>
<div class="mstat">
<div class="mstat-val" style="color:#8A8078">${fmt(k, lb)}</div>
<div class="mstat-lbl">Línea base</div>
</div>
<div class="mstat">
<div class="mstat-val" style="color:${stc}">${c}%</div>
<div class="mstat-lbl">Cumplimiento</div>
</div>`;

    const ctx2 = document.getElementById('mChart').getContext('2d');
    if (chartModal) chartModal.destroy();
    const all = D[k].data.filter(x => x.f <= filterDate);
    chartModal = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: all.map(r => r.f.slice(0, 7)),
            datasets: [
                {
                    label: k, data: all.map(r => r.v),
                    borderColor: pc.color, backgroundColor: pc.color + '15',
                    borderWidth: 2, fill: true, tension: .35, pointRadius: 0, pointHoverRadius: 4
                },
                {
                    label: 'Meta', data: Array(all.length).fill(m),
                    borderColor: '#1A7C4F', borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, fill: false
                },
                {
                    label: 'Línea base', data: Array(all.length).fill(lb),
                    borderColor: '#9B6C00', borderWidth: 1, borderDash: [3, 4], pointRadius: 0, fill: false
                },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10, family: 'DM Mono' } } } },
            scales: {
                x: { ticks: { color: '#94a3b8', font: { size: 9 }, maxRotation: 0, maxTicksLimit: 10 }, grid: { color: '#1e2a3a' } },
                y: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: '#1e2a3a' } }
            }
        }
    });

    const dirWord = D[k].inv ? 'reducción' : 'incremento';
    document.getElementById('m-insight').innerHTML =
        `<strong>Análisis:</strong> Este indicador partió de una línea base de <strong>${fmt(k, lb)}</strong> en 2024 
y cerró en <strong>${fmt(k, v)}</strong> en diciembre 2029, representando un ${dirWord} de 
<strong>${Math.abs(parseFloat(delta)).toFixed(1)}%</strong> frente a la referencia inicial. 
La meta establecida es <strong>${fmt(k, m)}</strong>. 
Estado: <strong style="color:${stc}">${st === 'g' ? 'En meta ✓' : st === 'y' ? 'En progreso ⚠' : 'Por debajo de meta ✗'}</strong>.`;

    document.getElementById('overlay').classList.add('open');
}

function closeModal() { document.getElementById('overlay').classList.remove('open'); }

function openInfo() { document.getElementById('info-overlay').classList.add('open'); }
function closeInfo() { document.getElementById('info-overlay').classList.remove('open'); }

// ── PERÍODO ────────────────────────────────────────────────
function setPeriod(n, btn) {
    activePeriod = n;
    document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    if (activeKPI) renderMain(activeKPI);
}

// ── DOBLE CLIC → MODAL ────────────────────────────────────
document.addEventListener('dblclick', e => {
    const row = e.target.closest('.kpi-row');
    if (row) {
        const k = activeKPI;
        if (k) openModal(k);
    }
});

// ── INIT ──────────────────────────────────────────────────
function init() {
    Chart.defaults.font.family = 'Outfit';
    
    // Extraer todas las fechas únicas
    const dateSet = new Set();
    Object.values(D).forEach(kpi => kpi.data.forEach(d => dateSet.add(d.f)));
    allDates = Array.from(dateSet).sort();
    
    const slider = document.getElementById('date-slider');
    slider.max = allDates.length - 1;
    slider.value = allDates.length - 1;
    filterDate = allDates[allDates.length - 1];
    
    updateDateDisplay();
    
    renderAlerts();
    renderScores();
    renderBSC();
    renderBar();
    renderRadar();
    renderGauge();
    renderCosto();
    
    const first = Object.keys(D)[0];
    selectKPI(first);
}

function changeDate(idx) {
    filterDate = allDates[idx];
    updateDateDisplay();
    
    // Re-renderizar todo
    renderAlerts();
    renderScores();
    renderBSC();
    renderBar();
    renderRadar();
    renderGauge();
    renderCosto();
    if (activeKPI) selectKPI(activeKPI);
}

function updateDateDisplay() {
    const date = new Date(filterDate + 'T00:00:00');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dateStr = `${months[date.getMonth()]} ${date.getFullYear()}`;
    document.getElementById('date-display').textContent = dateStr;
    document.getElementById('live-indicator').textContent = dateStr;
    document.getElementById('bar-sub').textContent = `% de logro por perspectiva (${dateStr.toLowerCase()})`;
}

document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        fetch('data_BSC_HDPUV.json').then(r => {
            if (!r.ok) throw new Error('No se pudo cargar data_BSC_HDPUV.json');
            return r.json();
        }),
        fetch('bsc_hdpuv.json').then(r => {
            if (!r.ok) throw new Error('No se pudo cargar bsc_hdpuv.json');
            return r.json();
        }).catch(err => {
            console.warn("Could not load bsc_hdpuv.json", err);
            return null;
        })
    ])
    .then(([dataJSON, bscJSON]) => {
        D = dataJSON;
        if (bscJSON && bscJSON.bsc) {
            bscData = bscJSON.bsc;
        }
        init();
    })
    .catch(err => {
        console.error(err);
        document.body.innerHTML = `<div style="color:#ef4444;padding:40px;font-family:monospace">
            <b>Error al cargar datos:</b> ${err.message}<br><br>
            Asegúrate de servir el dashboard desde un servidor HTTP (no file://).
        </div>`;
    });
});
