// Config
const perspectives = ['Clientes', 'Procesos', 'Aprendizaje', 'Financiera', 'PETI'];
const pColors = {
    'Clientes': '#3b82f6', 
    'Procesos': '#10b981', 
    'Aprendizaje': '#f59e0b', 
    'Financiera': '#8b5cf6', 
    'PETI': '#ec4899'
};

let selectedKpi = null;
let histChartInstance = null;
let histFilter = 0; // 0 = all

// MRAE Static Data
const mraeData = [
    { name: 'Estrategia y Gobierno', asis: 2.0, tobe: 3.9 },
    { name: 'Gestión de Información', asis: 2.0, tobe: 3.7 },
    { name: 'Sistemas de Información', asis: 3.0, tobe: 3.9 },
    { name: 'Servicios Tecnológicos', asis: 3.0, tobe: 3.8 },
    { name: 'Seguridad de la Información', asis: 2.0, tobe: 3.8 },
    { name: 'Uso y Apropiación TI', asis: 2.0, tobe: 3.1 }
];

// PETI Mock Data
const petiData = Array.from({length: 15}, (_, i) => {
    let prog = Math.floor(Math.random() * 100);
    let state = prog >= 80 ? 'green' : (prog >= 40 ? 'yellow' : 'gray');
    return { id: `I-${(i+1).toString().padStart(2, '0')}`, name: `Iniciativa PETI ${(i+1)}`, progress: prog, state: state };
});

// Logic Helpers
function getCompliance(kpiName, valor, meta) {
    if (kpiName === 'Incidentes Criticos Seguridad' || kpiName === 'Incidentes Criticos HC') {
        if (valor === 0) return { pct: 100, color: 'green' };
        if (valor < 0.5) return { pct: 85, color: 'yellow' };
        return { pct: 0, color: 'red' };
    }
    if (kpiName === 'Glosas Facturacion') {
        let pct = (1.2 / valor) * 100;
        return { pct: pct > 100 ? 100 : pct, color: getTrafficLight(pct) };
    }
    let pct = (valor / meta) * 100;
    return { pct: pct > 100 ? 100 : pct, color: getTrafficLight(pct) };
}

function getTrafficLight(pct) {
    if (pct >= 100) return 'green';
    if (pct >= 80) return 'yellow';
    return 'red';
}

function getTrend(dataArr) {
    if (dataArr.length < 4) return '→';
    const last = dataArr[dataArr.length - 1].v;
    const avg3 = (dataArr[dataArr.length - 2].v + dataArr[dataArr.length - 3].v + dataArr[dataArr.length - 4].v) / 3;
    if (last > avg3 * 1.02) return '↑';
    if (last < avg3 * 0.98) return '↓';
    return '→';
}

function fVal(val, u) {
    return Number.isInteger(val) ? val + u : val.toFixed(1) + u;
}

function init() {
    Object.keys(kpiData).forEach(k => {
        kpiData[k].data.sort((a,b) => new Date(a.f) - new Date(b.f));
        const d = kpiData[k].data;
        const last = d.length ? d[d.length - 1].v : 0;
        const comp = getCompliance(k, last, kpiData[k].m);
        kpiData[k].latest = last;
        kpiData[k].comp = comp;
        kpiData[k].trend = getTrend(d);
    });

    buildCards();
    buildAlerts();
    buildBSCGrid();
    
    const defaultKpi = kpiData['Disponibilidad HIS'] ? 'Disponibilidad HIS' : Object.keys(kpiData)[0];
    selectKpi(defaultKpi);
    
    buildMRAE();
    buildRadar();
    buildPETI();
    
    buildFinances();
    buildDigitalTrans();
}

function buildCards() {
    const c = document.getElementById('cards-container');
    perspectives.forEach(p => {
        const kpis = Object.values(kpiData).filter(k => k.p === p);
        const total = kpis.length;
        let avg = 0;
        let onTarget = 0;
        if (total > 0) {
            avg = kpis.reduce((acc, k) => acc + k.comp.pct, 0) / total;
            onTarget = kpis.filter(k => k.comp.pct >= 100).length;
        }
        
        c.innerHTML += `
            <div class="p-card" style="border-top-color: ${pColors[p]}">
                <h3>${p}</h3>
                <div class="avg-score">${avg.toFixed(1)}%</div>
                <div class="meta-stats">KPIs en meta: <strong>${onTarget}/${total}</strong></div>
            </div>
        `;
    });
}

function buildAlerts() {
    const arr = Object.entries(kpiData).filter(([k, v]) => v.comp.color !== 'green');
    const txt = arr.map(([k, v]) => `<span class="color-${v.comp.color}">■</span> ${k} (${fVal(v.latest, v.u)} vs Meta: ${fVal(v.m, v.u)})`).join(' &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ');
    document.getElementById('alert-marquee').innerHTML = txt || "Todos los KPIs están en estado óptimo.";
}

function buildBSCGrid() {
    const grid = document.getElementById('bsc-grid');
    perspectives.forEach(p => {
        const kpis = Object.entries(kpiData).filter(([k, v]) => v.p === p);
        
        let html = `<div class="bsc-panel"><h4>${p}</h4>`;
        kpis.forEach(([k, v]) => {
            const idSafe = k.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
            html += `
                <div class="kpi-item" id="item-${idSafe}" onclick="selectKpi('${k}')">
                    <div class="kpi-item-top">
                        <div class="kpi-name-container">
                            <div class="kpi-dot bg-${v.comp.color}"></div>
                            <div class="kpi-name" title="${k}">${k}</div>
                        </div>
                        <div class="kpi-values">
                            ${fVal(v.latest, v.u)} / ${fVal(v.m, v.u)} <span class="kpi-trend color-${v.comp.color}">${v.trend}</span>
                        </div>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill bg-${v.comp.color}" style="width: ${v.comp.pct}%"></div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        grid.innerHTML += html;
    });
}

function selectKpi(kpiName) {
    if (selectedKpi) {
        const idSafe = selectedKpi.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
        const old = document.getElementById(`item-${idSafe}`);
        if(old) old.classList.remove('active');
    }
    selectedKpi = kpiName;
    const newIdSafe = selectedKpi.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    const cur = document.getElementById(`item-${newIdSafe}`);
    if(cur) cur.classList.add('active');
    
    document.getElementById('hist-title').innerText = `Evolución Histórica: ${kpiName}`;
    updateHistChart();
}

function setHistFilter(months) {
    histFilter = months;
    document.querySelectorAll('.chart-filters button').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${months}`).classList.add('active');
    updateHistChart();
}

function updateHistChart() {
    if (!selectedKpi || !kpiData[selectedKpi]) return;
    const obj = kpiData[selectedKpi];
    
    let data = obj.data;
    if (histFilter > 0) {
        data = data.slice(-histFilter);
    }

    const labels = data.map(d => d.f.substring(0, 7));
    const vals = data.map(d => d.v);
    const metaArr = data.map(() => obj.m);

    if (histChartInstance) histChartInstance.destroy();

    const ctx = document.getElementById('hist-chart').getContext('2d');
    histChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Valor',
                    data: vals,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Meta',
                    data: metaArr,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8' } } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

function buildMRAE() {
    const c = document.getElementById('mrae-container');
    let html = '';
    mraeData.forEach(d => {
        const w1 = (d.asis / 5) * 100;
        const w2 = ((d.tobe - d.asis) / 5) * 100;
        html += `
            <div class="mrae-item">
                <div class="mrae-labels">
                    <span>${d.name}</span>
                    <span>${d.asis} → ${d.tobe}</span>
                </div>
                <div class="mrae-bar-wrapper">
                    <div class="mrae-bar-asis" style="width: ${w1}%"></div>
                    <div class="mrae-bar-tobe" style="width: ${w2}%"></div>
                </div>
            </div>
        `;
    });
    c.innerHTML = html;
}

function buildRadar() {
    const dataPts = perspectives.map(p => {
        const kpis = Object.values(kpiData).filter(k => k.p === p);
        return kpis.length ? (kpis.reduce((acc, k) => acc + k.comp.pct, 0) / kpis.length) : 0;
    });

    const ctx = document.getElementById('radar-chart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: perspectives,
            datasets: [{
                label: '% Cumplimiento',
                data: dataPts,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: '#10b981',
                pointBackgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { color: '#94a3b8', font: { size: 11 } },
                    ticks: { display: false, min: 0, max: 100 }
                }
            }
        }
    });
}

function buildPETI() {
    const c = document.getElementById('peti-list');
    let html = '';
    petiData.forEach(p => {
        html += `
            <div class="peti-item">
                <div>
                    <strong>${p.id}</strong> <span style="color:#94a3b8; font-size:0.75rem;">${p.name}</span>
                </div>
                <div class="peti-badge bg-${p.state}">${p.progress}%</div>
            </div>
        `;
    });
    c.innerHTML = html;
}

function buildFinances() {
    const ctx = document.getElementById('finance-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2026', '2027', '2028', '2029'],
            datasets: [
                { label: 'Inversión', data: [545, 530, 350, 160], backgroundColor: '#3b82f6' },
                { label: 'Funcionamiento', data: [280, 295, 310, 320], backgroundColor: '#8b5cf6' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8' } } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

function buildDigitalTrans() {
    const years = ['2024', '2025', '2026', '2027', '2028', '2029'];
    
    function getDecData(kpiName, mockData) {
        if(kpiData[kpiName]) {
            return years.map(y => {
                const pt = kpiData[kpiName].data.find(d => d.f.startsWith(y + '-12'));
                return pt ? pt.v : mockData.shift(); 
            });
        }
        return mockData;
    }

    const interop = getDecData('Interoperabilidad', [29, 45, 54, 62, 73, 85]);
    const citas = getDecData('Citas Digitales Consulta Externa', [10, 20, 35, 45, 55, 60]);
    const pqrs = getDecData('PQRSDF Gestionadas Digital', [20, 40, 60, 80, 95, 100]);
    const tele = getDecData('Teleconsultas Mes', [5, 15, 30, 50, 80, 100]);

    const ctx = document.getElementById('digital-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                { label: 'Interoperabilidad', data: interop, borderColor: '#10b981', tension: 0.4 },
                { label: 'Citas Dig.', data: citas, borderColor: '#3b82f6', tension: 0.4 },
                { label: 'PQRSDF', data: pqrs, borderColor: '#f59e0b', tension: 0.4 },
                { label: 'Teleconsultas', data: tele, borderColor: '#ec4899', tension: 0.4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8', font: {size: 10} }, position: 'right' } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

function exportToPNG() {
    const target = document.getElementById('export-container');
    html2canvas(target, { backgroundColor: '#0f172a' }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'HDPUV-Dashboard.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

document.addEventListener('DOMContentLoaded', init);
