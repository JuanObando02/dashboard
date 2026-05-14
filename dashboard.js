// ══════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════
const perspectives = ['Clientes','Procesos','Aprendizaje','Financiera','PETI'];
const pColors = {
    Clientes:   '#00d4ff',
    Procesos:   '#7c3aed',
    Aprendizaje:'#10b981',
    Financiera: '#f59e0b',
    PETI:       '#f97316'
};
const pCls = {
    Clientes:'clientes', Procesos:'procesos',
    Aprendizaje:'aprendizaje', Financiera:'financiera', PETI:'peti'
};
const LOWER_IS_BETTER = new Set([
    'Glosas Facturacion','Incidentes Criticos HC','Incidentes Criticos Seguridad'
]);

// Un KPI representativo por perspectiva para el bar chart
const REP_KPI = {
    Clientes:    'Satisfaccion Usuario',
    Procesos:    'Interoperabilidad',
    Aprendizaje: 'Personal Capacitado TI',
    Financiera:  'Ejecucion Presupuestal %',
    PETI:        'Madurez MRAE Promedio'
};

// MRAE
const mraeData = [
    { name:'Estrategia y Gobierno',       asis:2.0, tobe:3.9, color:'#10b981' },
    { name:'Gestión de Información',      asis:2.0, tobe:3.7, color:'#10b981' },
    { name:'Sistemas de Información',     asis:3.0, tobe:3.9, color:'#00d4ff' },
    { name:'Servicios Tecnológicos',      asis:3.0, tobe:3.8, color:'#00d4ff' },
    { name:'Seguridad de la Información', asis:2.0, tobe:3.8, color:'#f59e0b' },
    { name:'Uso y Apropiación TI',        asis:2.0, tobe:3.1, color:'#7c3aed' }
];

// PETI roadmap
const petiRoadmap = [
    { id:'I-01', name:'Gobierno TI',            pct:100, st:'done'     },
    { id:'I-02', name:'Migración Legados',       pct:100, st:'done'     },
    { id:'I-03', name:'MSPI Seguridad',          pct:98,  st:'done'     },
    { id:'I-04', name:'HOSVITAL Módulos',        pct:96,  st:'done'     },
    { id:'I-05', name:'DataCenter / DRP',        pct:88,  st:'progress' },
    { id:'I-06', name:'Analítica BI',            pct:95,  st:'done'     },
    { id:'I-07', name:'Nube y Conectividad',     pct:85,  st:'progress' },
    { id:'I-08', name:'HIS–ERP Integración',     pct:90,  st:'done'     },
    { id:'I-09', name:'Interoperabilidad HL7',   pct:80,  st:'progress' },
    { id:'I-10', name:'Telemedicina',            pct:95,  st:'done'     },
    { id:'I-11', name:'Portal Paciente',         pct:88,  st:'progress' },
    { id:'I-12', name:'Datos Abiertos',          pct:92,  st:'done'     },
    { id:'I-13', name:'Firma Digital',           pct:78,  st:'progress' },
    { id:'I-14', name:'Competencias Digitales',  pct:100, st:'done'     },
    { id:'I-15', name:'Gestión Conocimiento',    pct:70,  st:'pending'  }
];

// State
let selectedKpi = null;
let histFilter = 0;
let histChartInst = null, barChartInst = null, modalChartInst = null;

// ══════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════
function lastVal(name) {
    const d = kpiData[name];
    if (!d || !d.data.length) return 0;
    return d.data[d.data.length - 1].v;
}

function calcPct(name, val, meta) {
    if (LOWER_IS_BETTER.has(name)) {
        if (meta === 0) return val === 0 ? 100 : Math.max(0, 100 - val * 40);
        return Math.min(100, (meta / Math.max(val, 0.01)) * 100);
    }
    return meta > 0 ? Math.min(120, (val / meta) * 100) : 100;
}

function getCompliance(name) {
    const d = kpiData[name];
    const v = lastVal(name);
    const pct = calcPct(name, v, d.m);
    const color = pct >= 100 ? 'green' : pct >= 80 ? 'yellow' : 'red';
    return { pct, color };
}

function cssColor(c) {
    return c === 'green' ? '#10b981' : c === 'yellow' ? '#f59e0b' : '#ef4444';
}

function fVal(val, u) {
    if (u === '%')   return val.toFixed(1) + '%';
    if (u === '1-5') return val.toFixed(2);
    if (u === 'pts') return Math.round(val) + ' pts';
    return Number.isInteger(val) ? val : val.toFixed(1);
}

function getTrend(dataArr) {
    if (dataArr.length < 4) return '→';
    const last = dataArr[dataArr.length-1].v;
    const avg3 = (dataArr[dataArr.length-2].v + dataArr[dataArr.length-3].v + dataArr[dataArr.length-4].v) / 3;
    if (last > avg3 * 1.02) return '↑';
    if (last < avg3 * 0.98) return '↓';
    return '→';
}

function perspScore(p) {
    const kpis = Object.keys(kpiData).filter(k => kpiData[k].p === p);
    if (!kpis.length) return 0;
    return Math.round(kpis.reduce((s, k) => s + calcPct(k, lastVal(k), kpiData[k].m), 0) / kpis.length);
}

// ══════════════════════════════════════════
// BUILD CARDS
// ══════════════════════════════════════════
function buildCards() {
    const c = document.getElementById('cards-container');
    perspectives.forEach(p => {
        const kpis = Object.keys(kpiData).filter(k => kpiData[k].p === p);
        const score = perspScore(p);
        const onTarget = kpis.filter(k => calcPct(k, lastVal(k), kpiData[k].m) >= 100).length;
        const col = score >= 100 ? '#10b981' : score >= 80 ? '#f59e0b' : '#ef4444';
        const scoreCol = score >= 100 ? 'color:#10b981' : score >= 80 ? 'color:#f59e0b' : 'color:#ef4444';
        c.innerHTML += `
        <div class="p-card" style="border-top-color:${pColors[p]}">
            <h3>${p}</h3>
            <div class="avg-score" style="${scoreCol}">${score}%</div>
            <div class="meta-stats">KPIs en meta: <strong>${onTarget}/${kpis.length}</strong></div>
            <div class="score-bar"><div class="score-bar-fill" style="width:${Math.min(score,100)}%;background:${pColors[p]}"></div></div>
        </div>`;
    });
}

// ══════════════════════════════════════════
// BUILD ALERTS (CHIPS)
// ══════════════════════════════════════════
function buildAlerts() {
    const strip = document.getElementById('alerts-strip');
    const chips = [];
    Object.entries(kpiData).forEach(([k, v]) => {
        const pct = calcPct(k, lastVal(k), v.m);
        const val = lastVal(k);
        if (pct >= 100) {
            chips.push(`<div class="alert-chip ok">✓ ${k}: ${fVal(val, v.u)} — Meta cumplida</div>`);
        } else if (pct >= 80) {
            chips.push(`<div class="alert-chip warn">⚠ ${k}: ${fVal(val, v.u)} — Cerca de la meta</div>`);
        } else {
            chips.push(`<div class="alert-chip bad">✕ ${k}: ${fVal(val, v.u)} — Bajo meta ${fVal(v.m, v.u)}</div>`);
        }
    });
    strip.innerHTML = chips.join('');
}

// ══════════════════════════════════════════
// BUILD BSC GRID
// ══════════════════════════════════════════
function buildBSCGrid() {
    const grid = document.getElementById('bsc-grid');
    perspectives.forEach(p => {
        const kpis = Object.entries(kpiData).filter(([, v]) => v.p === p);
        const score = perspScore(p);
        const badgeCol = score >= 100 ? '#10b981' : score >= 80 ? '#f59e0b' : '#ef4444';
        let rows = '';
        kpis.forEach(([k, v]) => {
            const idSafe = k.replace(/\W/g,'');
            const comp = getCompliance(k);
            const col = cssColor(comp.color);
            const trend = getTrend(v.data);
            rows += `
            <div class="kpi-item" id="item-${idSafe}" onclick="selectKpi('${k}')">
                <div class="kpi-item-top">
                    <div class="kpi-name-container">
                        <div class="kpi-dot" style="background:${col}"></div>
                        <div class="kpi-name" title="${k}">${k}</div>
                    </div>
                    <div class="kpi-values" style="color:${col}">
                        ${fVal(lastVal(k), v.u)} / ${fVal(v.m, v.u)}
                        <span class="kpi-trend">${trend}</span>
                    </div>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width:${Math.min(comp.pct,100)}%;background:${col}"></div>
                </div>
            </div>`;
        });
        grid.innerHTML += `
        <div class="bsc-panel">
            <h4>
                <span class="panel-dot" style="background:${pColors[p]}"></span>
                ${p}
                <span style="margin-left:auto;font-size:11px;padding:2px 9px;border-radius:20px;background:${badgeCol}22;color:${badgeCol}">${score}%</span>
            </h4>
            ${rows}
        </div>`;
    });
}

// ══════════════════════════════════════════
// HISTORICAL CHART
// ══════════════════════════════════════════
function selectKpi(name) {
    if (selectedKpi) {
        const old = document.getElementById(`item-${selectedKpi.replace(/\W/g,'')}`);
        if (old) old.classList.remove('active');
    }
    selectedKpi = name;
    const cur = document.getElementById(`item-${name.replace(/\W/g,'')}`);
    if (cur) cur.classList.add('active');
    document.getElementById('hist-title').innerText = `Evolución: ${name}`;
    updateHistChart();
    openModal(name);
}

function setHistFilter(months) {
    histFilter = months;
    document.querySelectorAll('.chart-filters button').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${months}`).classList.add('active');
    if (selectedKpi) updateHistChart();
}

function updateHistChart() {
    if (!selectedKpi || !kpiData[selectedKpi]) return;
    const obj = kpiData[selectedKpi];
    let data = histFilter > 0 ? obj.data.slice(-histFilter) : obj.data;
    const labels = data.map(d => d.f.substring(0,7));
    const vals   = data.map(d => d.v);
    const col    = pColors[obj.p] || '#00d4ff';

    if (histChartInst) histChartInst.destroy();
    histChartInst = new Chart(document.getElementById('hist-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label:'Valor', data:vals, borderColor:col, backgroundColor:col+'22',
                  borderWidth:2, fill:true, tension:0.35, pointRadius:0, pointHoverRadius:5 },
                { label:'Meta', data:data.map(()=>obj.m), borderColor:'#ffffff30',
                  borderWidth:1.5, borderDash:[6,4], pointRadius:0, fill:false }
            ]
        },
        options: chartOpts()
    });
}

// ══════════════════════════════════════════
// BAR CHART — COMPARACIÓN VS META
// ══════════════════════════════════════════
function buildBarChart() {
    const labels = [], vals = [], colors = [];
    Object.entries(REP_KPI).forEach(([p, k]) => {
        if (!kpiData[k]) return;
        const v = lastVal(k), m = kpiData[k].m;
        const pct = Math.min(130, Math.round(calcPct(k, v, m)));
        labels.push(p.split(' ')[0]);
        vals.push(pct);
        colors.push(pColors[p]);
    });
    barChartInst = new Chart(document.getElementById('bar-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label:'% Cumplimiento', data:vals,
                  backgroundColor:colors.map(c=>c+'99'), borderColor:colors,
                  borderWidth:2, borderRadius:6 },
                { label:'Meta (100%)', data:Array(labels.length).fill(100),
                  backgroundColor:'#ffffff10', borderColor:'#ffffff25',
                  borderWidth:1, borderRadius:6 }
            ]
        },
        options: {
            ...chartOpts(),
            scales: {
                x: { ticks:{color:'#64748b'}, grid:{display:false} },
                y: { ticks:{color:'#64748b',callback:v=>v+'%'}, grid:{color:'#1e2a3a'}, max:130 }
            }
        }
    });
}

// ══════════════════════════════════════════
// MRAE
// ══════════════════════════════════════════
function buildMRAE() {
    const c = document.getElementById('mrae-container');
    let html = '';
    mraeData.forEach(d => {
        const w1 = (d.asis/5)*100;
        const w2 = ((d.tobe-d.asis)/5)*100;
        html += `
        <div class="mrae-item">
            <div class="mrae-labels">
                <span>${d.name}</span>
                <span>${d.asis} → ${d.tobe}</span>
            </div>
            <div class="mrae-bar-wrapper">
                <div class="mrae-bar-asis" style="width:${w1}%"></div>
                <div class="mrae-bar-tobe" style="width:${w2}%;background:${d.color}"></div>
            </div>
        </div>`;
    });
    c.innerHTML = html;
}

// ══════════════════════════════════════════
// RADAR
// ══════════════════════════════════════════
function buildRadar() {
    const dataPts = perspectives.map(p => perspScore(p));
    new Chart(document.getElementById('radar-chart').getContext('2d'), {
        type:'radar',
        data:{
            labels:perspectives,
            datasets:[{
                label:'% Cumplimiento', data:dataPts,
                backgroundColor:'rgba(0,212,255,0.15)',
                borderColor:'#00d4ff', borderWidth:2, pointBackgroundColor:'#00d4ff', pointRadius:4
            }]
        },
        options:{
            responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{display:false} },
            scales:{ r:{
                angleLines:{color:'#1e2a3a'}, grid:{color:'#1e2a3a'},
                pointLabels:{color:'#94a3b8',font:{size:10,family:"'IBM Plex Mono'"}},
                ticks:{display:false}, min:0, max:120
            }}
        }
    });
}

// ══════════════════════════════════════════
// PETI ROADMAP
// ══════════════════════════════════════════
function buildPETI() {
    const c = document.getElementById('peti-list');
    const stColor = { done:'#10b981', progress:'#f59e0b', pending:'#64748b', critical:'#ef4444' };
    c.innerHTML = petiRoadmap.map(i => {
        const col = stColor[i.st] || '#64748b';
        return `
        <div class="peti-item" style="border-left-color:${col}">
            <strong style="color:${col};font-size:10px">${i.id}</strong>
            <span class="peti-item-name">${i.name}</span>
            <div class="peti-item-prog"><div class="peti-item-prog-fill" style="width:${i.pct}%;background:${col}"></div></div>
            <span class="peti-badge" style="background:${col}22;color:${col}">${i.pct}%</span>
        </div>`;
    }).join('');
}

// ══════════════════════════════════════════
// FINANCES
// ══════════════════════════════════════════
function buildFinances() {
    new Chart(document.getElementById('finance-chart').getContext('2d'), {
        type:'bar',
        data:{
            labels:['2026','2027','2028','2029'],
            datasets:[
                { label:'Inversión (M COP)',      data:[545,530,350,160], backgroundColor:'#00d4ff99', borderColor:'#00d4ff', borderWidth:2, borderRadius:6 },
                { label:'Funcionamiento (M COP)', data:[280,295,310,320], backgroundColor:'#7c3aed99', borderColor:'#7c3aed', borderWidth:2, borderRadius:6 }
            ]
        },
        options:{
            responsive:true, maintainAspectRatio:false,
            plugins:{legend:{labels:{color:'#94a3b8',font:{size:10,family:"'IBM Plex Mono'"}}}},
            scales:{
                x:{ticks:{color:'#64748b'},grid:{display:false}},
                y:{ticks:{color:'#64748b',callback:v=>v+'M'},grid:{color:'#1e2a3a'}}
            }
        }
    });
}

// ══════════════════════════════════════════
// DIGITAL TRANSFORMATION
// ══════════════════════════════════════════
function buildDigitalTrans() {
    const years = ['2024','2025','2026','2027','2028','2029'];
    const kpis  = ['Citas Digitales Consulta Externa','PQRSDF Gestionadas Digital','Interoperabilidad','Teleconsultas Mes'];
    const cols  = ['#00d4ff','#10b981','#7c3aed','#f59e0b'];
    const datasets = kpis.map((k, i) => ({
        label: k.split(' ').slice(0,2).join(' '),
        data: years.map(y => {
            const pt = kpiData[k]?.data.find(d => d.f.startsWith(y+'-12'));
            return pt ? pt.v : null;
        }),
        borderColor:cols[i], backgroundColor:cols[i]+'22',
        borderWidth:2, tension:0.4, fill:false, pointRadius:4
    }));
    new Chart(document.getElementById('digital-chart').getContext('2d'), {
        type:'line',
        data:{ labels:years, datasets },
        options:{
            responsive:true, maintainAspectRatio:false,
            plugins:{legend:{labels:{color:'#94a3b8',font:{size:10,family:"'IBM Plex Mono'"}},position:'right'}},
            scales:{
                x:{ticks:{color:'#64748b'},grid:{color:'#1e2a3a'}},
                y:{ticks:{color:'#64748b'},grid:{color:'#1e2a3a'}}
            }
        }
    });
}

// ══════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════
function openModal(name) {
    const d = kpiData[name];
    const v = lastVal(name);
    const pct = calcPct(name, v, d.m);
    const col = cssColor(pct >= 100 ? 'green' : pct >= 80 ? 'yellow' : 'red');

    document.getElementById('modal-title').textContent = name;
    document.getElementById('modal-stats').innerHTML = `
        <div class="modal-stat">
            <div class="modal-stat-val" style="color:${col}">${fVal(v, d.u)}</div>
            <div class="modal-stat-lbl">Valor Actual</div>
        </div>
        <div class="modal-stat">
            <div class="modal-stat-val" style="color:#94a3b8">${fVal(d.m, d.u)}</div>
            <div class="modal-stat-lbl">Meta</div>
        </div>
        <div class="modal-stat">
            <div class="modal-stat-val" style="color:${col}">${Math.round(pct)}%</div>
            <div class="modal-stat-lbl">Cumplimiento</div>
        </div>`;

    if (modalChartInst) modalChartInst.destroy();
    const pcol = pColors[d.p] || '#00d4ff';
    modalChartInst = new Chart(document.getElementById('modal-chart').getContext('2d'), {
        type:'line',
        data:{
            labels: d.data.map(r => r.f.slice(0,7)),
            datasets:[
                { label:name, data:d.data.map(r=>r.v),
                  borderColor:pcol, backgroundColor:pcol+'18',
                  borderWidth:2, fill:true, tension:0.35, pointRadius:2, pointHoverRadius:5 },
                { label:'Meta', data:d.data.map(()=>d.m),
                  borderColor:'#ffffff30', borderWidth:1.5, borderDash:[6,4],
                  pointRadius:0, fill:false }
            ]
        },
        options: chartOpts()
    });
    document.getElementById('modal').classList.add('open');
}

function closeModal() {
    document.getElementById('modal').classList.remove('open');
}

// ══════════════════════════════════════════
// SHARED CHART OPTIONS
// ══════════════════════════════════════════
function chartOpts() {
    return {
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{labels:{color:'#94a3b8',font:{size:10,family:"'IBM Plex Mono'"}}}},
        scales:{
            x:{ticks:{color:'#64748b',font:{size:9},maxRotation:0,maxTicksLimit:8},grid:{color:'#1e2a3a'}},
            y:{ticks:{color:'#64748b',font:{size:9}},grid:{color:'#1e2a3a'}}
        }
    };
}

// ══════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════
function exportToPNG() {
    const target = document.getElementById('export-container');
    html2canvas(target, { backgroundColor:'#06080f', scale:1.5 }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'HDPUV-Dashboard.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
function init() {
    // Sort data
    Object.keys(kpiData).forEach(k => {
        kpiData[k].data.sort((a,b) => new Date(a.f) - new Date(b.f));
    });

    buildCards();
    buildAlerts();
    buildBSCGrid();

    const defaultKpi = kpiData['Disponibilidad HIS'] ? 'Disponibilidad HIS' : Object.keys(kpiData)[0];
    selectedKpi = defaultKpi;
    const el = document.getElementById(`item-${defaultKpi.replace(/\W/g,'')}`);
    if (el) el.classList.add('active');
    document.getElementById('hist-title').innerText = `Evolución: ${defaultKpi}`;
    updateHistChart();

    buildBarChart();
    buildMRAE();
    buildRadar();
    buildPETI();
    buildFinances();
    buildDigitalTrans();
}

document.addEventListener('DOMContentLoaded', init);
