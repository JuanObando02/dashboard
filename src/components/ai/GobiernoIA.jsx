import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, ComposedChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  BrainCircuit, CalendarDays, ClipboardCheck, AlertTriangle, ShieldCheck,
  ShieldAlert, Scale, Target, TrendingUp, LockKeyhole, HeartPulse, Eye,
  Sparkles, GitBranch, Gauge
} from 'lucide-react';

const clr = {
  rojo: '#ef4444', amarillo: '#f59e0b', verde: '#22c55e',
  gris: '#6b7280', azul: '#3b82f6', violeta: '#8b5cf6',
  cyan: '#06b6d4', card: '#0f172a', borde: '#1e293b', bg: '#0b1829',
};

function statusColor(status) {
  const s = (status || '').toUpperCase();
  if (['CRITICO', 'CRÍTICO', 'ALTO', 'ALTA', 'ALTO RIESGO', 'BAJA ⚠', 'RECHAZADAS'].some(x => s.includes(x))) return clr.rojo;
  if (['MEDIO', 'MEDIA', 'ALERTA', 'CONDICIONADO', 'PENDIENTE', 'EN CURSO', 'PROGRAMADA', 'LIMITADO', 'COND.', 'AMARILLO'].some(x => s.includes(x))) return clr.amarillo;
  if (['CONFORME', 'CUBIERTA', 'ALINEADO', 'CONTROL', 'COMPLETADA', 'ARMADO', 'ALTA', 'APLICADAS', 'CUMPLE'].some(x => s.includes(x))) return clr.verde;
  return clr.gris;
}

function Sbadge({ label, color }) {
  const c = color || statusColor(label);
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}>
      {label}
    </span>
  );
}

function Block({ title, icon: Icon, accent = clr.azul, children }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: clr.card, borderColor: clr.borde }}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b"
        style={{ borderColor: clr.borde, background: `${accent}08` }}>
        <div className="p-1.5 rounded-lg shrink-0"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
          <Icon size={13} style={{ color: accent }} />
        </div>
        <h3 className="text-xs font-bold text-white">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, icon: Icon, accent }) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4 mb-2">
      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color: accent }} />
        <div>
          <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">{eyebrow}</p>
          <h2 className="text-sm font-bold text-slate-200">{title}</h2>
        </div>
      </div>
    </div>
  );
}

function DarkTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{ background: '#1e2d45', border: '1px solid #334155' }}>
      {label && <p className="text-slate-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color || p.stroke || clr.azul }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function RadarTick({ x, y, payload, cx }) {
  const anchor = Math.abs(x - cx) < 10 ? 'middle' : x > cx ? 'start' : 'end';
  const words = payload.value.split(' ');
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(' ');
  const line2 = words.slice(mid).join(' ');

  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill="#94a3b8"
      fontSize={9}
    >
      <tspan x={x} dy={line2 ? '-0.5em' : '0'}>{line1}</tspan>
      {line2 && <tspan x={x} dy="1.2em">{line2}</tspan>}
    </text>
  );
}

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl p-3 cursor-pointer transition-colors hover:bg-slate-800/50" style={{ background: clr.card, border: `1px solid ${clr.borde}` }} onClick={() => setOpen(!open)}>
      <div className="flex justify-between items-center">
        <p className="text-xs font-bold text-slate-200">{q}</p>
        <span className="text-slate-400 font-bold">{open ? '−' : '+'}</span>
      </div>
      {open && <p className="text-[11px] text-slate-400 mt-2 animate-in fade-in zoom-in duration-200">{a}</p>}
    </div>
  );
}

const monthsData = [
  {
    name: 'Marzo 2026',
    radarData: [ { subject: 'Public purpose', v: 35.00 }, { subject: 'Human-centred Values', v: 35.00 }, { subject: 'Transparency & Exp.', v: 10.00 }, { subject: 'Robustness & Safety', v: 30.18 }, { subject: 'Accountability', v: 35.00 } ],
    kpis: { score: 35, scoreColor: clr.rojo, scoreSub: 'Riesgo Crítico', mae: 13.2, maeSub: 'Alerta', incidentes: 2, incColor: clr.rojo, hitl: 0, hitlColor: clr.rojo, drift: 12, driftColor: clr.amarillo, dwh: 92.1, dwhColor: clr.amarillo, lit: 40, litColor: clr.rojo, ice: 65, iceColor: clr.rojo, riesgo: 82, rsgColor: clr.rojo },
    fairnessData: [ { metric: 'IID (×0.1)', valor: 6.8, umbral: 7.5, fill: clr.amarillo }, { metric: 'ICE %', valor: 65, umbral: 80, fill: clr.amarillo }, { metric: '|EOD|×20', valor: 2.1, umbral: 1, fill: clr.rojo }, { metric: 'DI (×0.1)', valor: 7.2, umbral: 8.0, fill: clr.amarillo } ],
    municipios: [
      {m:'Cali', r:92, p:85, e:'7%', ec:clr.amarillo, i:'1.08', ic:clr.text, s:'Alta', sc:clr.verde},
      {m:'Palmira', r:47, p:40, e:'15%', ec:clr.rojo, i:'0.85', ic:clr.text, s:'Media', sc:clr.azul},
      {m:'Buenaventura', r:38, p:30, e:'21%', ec:clr.rojo, i:'0.71', ic:clr.amarillo, s:'Media', sc:clr.azul},
      {m:'Dagua', r:16, p:8, e:'50%', ec:clr.rojo, i:'0.55', ic:clr.rojo, s:'Baja ⚠', sc:clr.rojo},
      {m:'El Dovio', r:12, p:5, e:'58%', ec:clr.rojo, i:'0.51', ic:clr.rojo, s:'Baja ⚠', sc:clr.rojo}
    ],
    alertas: 12
  },
  {
    name: 'Abril 2026',
    radarData: [ { subject: 'Public purpose', v: 45.00 }, { subject: 'Human-centred Values', v: 45.00 }, { subject: 'Transparency & Exp.', v: 15.00 }, { subject: 'Robustness & Safety', v: 38.18 }, { subject: 'Accountability', v: 45.00 } ],
    kpis: { score: 48, scoreColor: clr.rojo, scoreSub: 'Riesgo Alto', mae: 12.1, maeSub: 'Atención', incidentes: 1, incColor: clr.amarillo, hitl: 1, hitlColor: clr.rojo, drift: 10, driftColor: clr.verde, dwh: 95.1, dwhColor: clr.amarillo, lit: 60, litColor: clr.amarillo, ice: 70, iceColor: clr.amarillo, riesgo: 78, rsgColor: clr.rojo },
    fairnessData: [ { metric: 'IID (×0.1)', valor: 7.2, umbral: 7.5, fill: clr.amarillo }, { metric: 'ICE %', valor: 70, umbral: 80, fill: clr.amarillo }, { metric: '|EOD|×20', valor: 1.5, umbral: 1, fill: clr.rojo }, { metric: 'DI (×0.1)', valor: 8.1, umbral: 8.0, fill: clr.verde } ],
    municipios: [
      {m:'Cali', r:92, p:87, e:'5%', ec:clr.amarillo, i:'1.05', ic:clr.text, s:'Alta', sc:clr.verde},
      {m:'Palmira', r:47, p:42, e:'10%', ec:clr.amarillo, i:'0.90', ic:clr.text, s:'Media', sc:clr.azul},
      {m:'Buenaventura', r:38, p:31, e:'18%', ec:clr.rojo, i:'0.75', ic:clr.amarillo, s:'Media', sc:clr.azul},
      {m:'Dagua', r:16, p:9, e:'43%', ec:clr.rojo, i:'0.60', ic:clr.rojo, s:'Baja ⚠', sc:clr.amarillo},
      {m:'El Dovio', r:12, p:6, e:'50%', ec:clr.rojo, i:'0.58', ic:clr.rojo, s:'Baja ⚠', sc:clr.amarillo}
    ],
    alertas: 8
  },
  {
    name: 'Mayo 2026',
    radarData: [ { subject: 'Public purpose', v: 50.00 }, { subject: 'Human-centred Values', v: 50.00 }, { subject: 'Transparency & Exp.', v: 25.00 }, { subject: 'Robustness & Safety', v: 43.18 }, { subject: 'Accountability', v: 50.00 } ],
    kpis: { score: 82, scoreColor: clr.amarillo, scoreSub: 'Riesgo moderado', mae: 11.3, maeSub: 'Meta ≤15%', incidentes: 0, incColor: clr.verde, hitl: 3, hitlColor: clr.amarillo, drift: 8, driftColor: clr.verde, dwh: 98.1, dwhColor: clr.verde, lit: 83, litColor: clr.amarillo, ice: 74, iceColor: clr.amarillo, riesgo: 72, rsgColor: clr.rojo },
    fairnessData: [ { metric: 'IID (×0.1)', valor: 8.2, umbral: 7.5, fill: clr.verde }, { metric: 'ICE %', valor: 74, umbral: 80, fill: clr.amarillo }, { metric: '|EOD|×20', valor: 0.6, umbral: 1, fill: clr.verde }, { metric: 'DI (×0.1)', valor: 9.1, umbral: 8.0, fill: clr.verde } ],
    municipios: [
      {m:'Cali', r:92, p:89, e:'3%', ec:clr.verde, i:'1.02', ic:clr.text, s:'Alta', sc:clr.verde},
      {m:'Palmira', r:47, p:44, e:'3%', ec:clr.verde, i:'0.95', ic:clr.text, s:'Media', sc:clr.azul},
      {m:'Buenaventura', r:38, p:31, e:'7%', ec:clr.amarillo, i:'0.81', ic:clr.text, s:'Media', sc:clr.azul},
      {m:'Dagua', r:16, p:10, e:'6%', ec:clr.rojo, i:'0.68', ic:clr.amarillo, s:'Baja ⚠', sc:clr.amarillo},
      {m:'El Dovio', r:12, p:7, e:'5%', ec:clr.rojo, i:'0.63', ic:clr.amarillo, s:'Baja ⚠', sc:clr.amarillo},
    ],
    alertas: 5
  },
  {
    name: 'Junio 2026 (Proy.)',
    radarData: [ { subject: 'Public purpose', v: 60.00 }, { subject: 'Human-centred Values', v: 65.00 }, { subject: 'Transparency & Exp.', v: 40.00 }, { subject: 'Robustness & Safety', v: 55.18 }, { subject: 'Accountability', v: 65.00 } ],
    kpis: { score: 88, scoreColor: clr.verde, scoreSub: 'Riesgo bajo', mae: 10.5, maeSub: 'Meta ≤15%', incidentes: 0, incColor: clr.verde, hitl: 12, hitlColor: clr.verde, drift: 5, driftColor: clr.verde, dwh: 99.2, dwhColor: clr.verde, lit: 100, litColor: clr.verde, ice: 82, iceColor: clr.verde, riesgo: 68, rsgColor: clr.amarillo },
    fairnessData: [ { metric: 'IID (×0.1)', valor: 8.8, umbral: 7.5, fill: clr.verde }, { metric: 'ICE %', valor: 82, umbral: 80, fill: clr.verde }, { metric: '|EOD|×20', valor: 0.4, umbral: 1, fill: clr.verde }, { metric: 'DI (×0.1)', valor: 9.5, umbral: 8.0, fill: clr.verde } ],
    municipios: [
      {m:'Cali', r:92, p:90, e:'2%', ec:clr.verde, i:'1.01', ic:clr.text, s:'Alta', sc:clr.verde},
      {m:'Palmira', r:47, p:45, e:'2%', ec:clr.verde, i:'0.98', ic:clr.text, s:'Media', sc:clr.azul},
      {m:'Buenaventura', r:38, p:35, e:'4%', ec:clr.verde, i:'0.92', ic:clr.text, s:'Media', sc:clr.azul},
      {m:'Dagua', r:16, p:12, e:'4%', ec:clr.amarillo, i:'0.75', ic:clr.text, s:'Media', sc:clr.azul},
      {m:'El Dovio', r:12, p:9, e:'3%', ec:clr.verde, i:'0.72', ic:clr.text, s:'Media', sc:clr.azul},
    ],
    alertas: 2
  }
];

const D = {
  isoClausulas: [
    {id:'6.1',v:90,u:85}, {id:'6.2',v:85,u:80}, {id:'7.2',v:80,u:100},
    {id:'8.4',v:88,u:85}, {id:'9.1',v:75,u:80}, {id:'10.1',v:70,u:80}
  ],
  maeMonthly: [
    { periodo: 'Dic', val: 9.1, meta: 15 },
    { periodo: 'Ene', val: 10.4, meta: 15 },
    { periodo: 'Feb', val: 11.8, meta: 15 },
    { periodo: 'Mar', val: 13.2, meta: 15 },
    { periodo: 'Abr', val: 12.1, meta: 15 },
    { periodo: 'May', val: 11.3, meta: 15 }
  ],
  tendencias: [
    {p:'Mar', riesgo:82, cumplimiento:45, madurez:35, precision:0},
    {p:'Abr', riesgo:78, cumplimiento:58, madurez:48, precision:72},
    {p:'May', riesgo:72, cumplimiento:68, madurez:58, precision:80},
    {p:'Jun', riesgo:68, cumplimiento:76, madurez:68, precision:85}
  ],
  hitlHistorial: [
    {p:'Mar', deliberacion:0,  discrepancia:0,  justificacion:0},
    {p:'Abr', deliberacion:30, discrepancia:1,  justificacion:35},
    {p:'May', deliberacion:65, discrepancia:2,  justificacion:70},
    {p:'Jun', deliberacion:90, discrepancia:3,  justificacion:91}
  ],
  heatmap: [
    {p:5,i:1,v:5,n:'m'},{p:5,i:2,v:10,n:'h'},{p:5,i:3,v:15,n:'h'},{p:5,i:4,v:20,n:'c'},{p:5,i:5,v:25,n:'c'},
    {p:4,i:1,v:4,n:'l'},{p:4,i:2,v:8,n:'m'},{p:4,i:3,v:12,n:'h',r:'RS-01/03'},{p:4,i:4,v:16,n:'c'},{p:4,i:5,v:20,n:'c'},
    {p:3,i:1,v:3,n:'l'},{p:3,i:2,v:6,n:'m'},{p:3,i:3,v:9,n:'m',r:'RS-05'},{p:3,i:4,v:12,n:'h',r:'RS-02'},{p:3,i:5,v:15,n:'h'},
    {p:2,i:1,v:2,n:'l'},{p:2,i:2,v:4,n:'l'},{p:2,i:3,v:6,n:'m'},{p:2,i:4,v:8,n:'m'},{p:2,i:5,v:10,n:'h',r:'RS-04'},
    {p:1,i:1,v:1,n:'l'},{p:1,i:2,v:2,n:'l'},{p:1,i:3,v:3,n:'l'},{p:1,i:4,v:4,n:'l'},{p:1,i:5,v:5,n:'m'}
  ],
  riesgosIdentificados: [
    {id:'RS-01', r:'Subregistro calidad HIS', pi:12, p:4, i:3, n:'Alto', c:clr.amarillo},
    {id:'RS-02', r:'Concept Drift / obsolescencia', pi:12, p:3, i:4, n:'Alto', c:clr.amarillo},
    {id:'RS-03', r:'Complacencia algorítmica', pi:12, p:4, i:3, n:'Alto', c:clr.amarillo},
    {id:'RS-04', r:'Reidentificación municipios', pi:10, p:2, i:5, n:'Alto', c:clr.amarillo},
    {id:'RS-05', r:'Trazabilidad / function creep', pi:9, p:3, i:3, n:'Medio', c:clr.azul},
  ]
};

export default function GobiernoIA() {
  const [activeMonthIdx, setActiveMonthIdx] = useState(2); // Default Mayo 2026
  const [selectedRiskCell, setSelectedRiskCell] = useState(null);

  const activeData = monthsData[activeMonthIdx];

  const filteredRiesgos = selectedRiskCell 
    ? D.riesgosIdentificados.filter(r => r.p === selectedRiskCell.p && r.i === selectedRiskCell.i)
    : D.riesgosIdentificados;

  const Kpi = ({ label, val, valUnit, subIconColor, subText, mainColor = clr.text, tooltip }) => {
    const [hover, setHover] = useState(false);
    return (
      <div 
        className="rounded-xl p-3 border relative transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:border-slate-600" 
        style={{ background: clr.card, borderColor: clr.borde }}
      >
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
            {label}
          </p>
          {tooltip && (
            <div 
              className="text-slate-500 hover:text-slate-300 cursor-help relative" 
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-bold bg-slate-800/50 hover:bg-slate-700 transition-colors">
                ?
              </div>
              {/* Hover Tooltip */}
              {hover && (
                <div className="absolute top-full right-0 mt-2 z-50 rounded-lg p-3 text-xs shadow-xl w-56 border animate-in fade-in zoom-in duration-200 text-left font-sans font-normal"
                     style={{ background: '#1e293b', borderColor: clr.azul, color: '#e2e8f0', cursor: 'default' }}>
                  <div className="text-[9px] uppercase tracking-wider text-blue-400 mb-1 font-bold">Modo de cálculo</div>
                  <p className="leading-relaxed text-[11px] text-slate-300">{tooltip}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold leading-tight transition-colors duration-300" style={{ color: mainColor }}>
          {val}<span className="text-sm font-normal text-slate-400 ml-0.5">{valUnit}</span>
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-1.5 h-1.5 rounded-full transition-colors duration-300" style={{ background: subIconColor }}></div>
          <p className="text-[11px] text-slate-400 transition-colors duration-300">{subText}</p>
        </div>
      </div>
    );
  };

  const BarRow = ({ label, pct, color }) => (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-[11px] text-slate-400 w-28 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: clr.bg }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }}></div>
      </div>
      <span className="text-[11px] font-mono font-semibold w-8 text-right" style={{ color }}>{pct}</span>
    </div>
  );

  const MetricRow = ({ name, val, thr, dotColor, valColor = '#e2e8f0' }) => (
    <div className="flex items-center gap-2 py-2 border-b last:border-b-0 hover:bg-slate-800/30 transition-colors px-1 -mx-1 rounded" style={{ borderColor: clr.borde }}>
      <span className="text-xs text-slate-400 flex-1">{name}</span>
      <span className="text-xs font-semibold w-12 text-right transition-colors duration-300" style={{ color: valColor }}>{val}</span>
      <span className="text-[10px] font-mono text-slate-500 w-12 text-right">{thr}</span>
      <div className="w-1.5 h-1.5 rounded-full ml-1 transition-colors duration-300" style={{ background: dotColor }}></div>
    </div>
  );

  const FairnessRow = ({ name, formula, val, thr, dotColor, valColor }) => (
    <div className="grid grid-cols-[1fr_auto_auto_10px] gap-2 items-center py-2 border-b last:border-b-0 hover:bg-slate-800/30 transition-colors px-2 -mx-2 rounded cursor-default" style={{ borderColor: clr.borde }}>
      <div>
        <div className="text-xs text-slate-400">{name}</div>
        <div className="text-[10px] font-mono text-slate-500">{formula}</div>
      </div>
      <span className="text-sm font-semibold font-mono text-right transition-colors duration-300" style={{ color: valColor }}>{val}</span>
      <span className="text-[10px] font-mono text-slate-500 text-right whitespace-nowrap">{thr}</span>
      <div className="w-1.5 h-1.5 rounded-full transition-colors duration-300" style={{ background: dotColor }}></div>
    </div>
  );

  const hmColor = (n) => {
    if (n === 'c') return { bg: 'rgba(239,68,68,0.18)', text: clr.rojo, border: 'rgba(239,68,68,0.3)' };
    if (n === 'h') return { bg: 'rgba(245,158,11,0.16)', text: clr.amarillo, border: 'rgba(245,158,11,0.3)' };
    if (n === 'm') return { bg: 'rgba(59,130,246,0.12)', text: clr.azul, border: 'rgba(59,130,246,0.3)' };
    return { bg: 'rgba(34,197,94,0.10)', text: clr.verde, border: 'rgba(34,197,94,0.3)' };
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6" style={{ background: clr.bg, color: '#e2e8f0' }}>
      
      {/* ══ HEADER ══════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b" style={{ borderColor: clr.borde }}>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-lg font-semibold tracking-tight text-slate-100">Gobierno de IA — SIAGP <span style={{fontWeight: 300, color: 'var(--text3)'}}>/ HDPUV</span></h1>
            {/* Period Selector */}
            <div className="relative inline-block ml-4">
              <select 
                value={activeMonthIdx}
                onChange={(e) => setActiveMonthIdx(Number(e.target.value))}
                className="appearance-none bg-slate-800/80 border border-slate-700 text-slate-200 text-xs py-1 pl-3 pr-8 rounded-lg cursor-pointer hover:bg-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {monthsData.map((m, i) => (
                  <option key={i} value={i}>{m.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">ISO/IEC 42001 · NIST AI RMF · EU AI Act · AIA · CONPES 3975 &nbsp;|&nbsp; v2.0 · JSON v2</div>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Sbadge label="⚡ GO condicionado" color={clr.amarillo} />
          <Sbadge label="Riesgo ALTO" color={activeData.kpis.rsgColor} />
          <Sbadge label="Kill-Switch armado" color={clr.verde} />
          <Sbadge label={`${activeData.alertas} condiciones pendientes`} color={activeData.alertas > 5 ? clr.rojo : clr.azul} />
        </div>
      </div>
      
      {/* ══ ALERTAS ESTRATÉGICAS ═══════════════════════════ */}
      <SectionTitle eyebrow="Alertas" title="Alertas estratégicas — alta dirección" icon={AlertTriangle} accent={clr.rojo} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="p-3 rounded-r-xl border-l-4 transition-all duration-300 hover:bg-red-500/10" style={{ background: 'rgba(239,68,68,0.05)', borderLeftColor: clr.rojo }}>
            <p className="text-xs font-bold text-slate-200 mb-1">Go condicionado — sin certificar, no avanzar</p>
            <p className="text-[11px] text-slate-400">No avanzar a producción plena sin k-anonimidad certificada por tercero, logs explicables y Kill-Switch verificado. {activeData.alertas} condiciones pendientes.</p>
          </div>
          <div className="p-3 rounded-r-xl border-l-4 transition-all duration-300 hover:bg-red-500/10" style={{ background: 'rgba(239,68,68,0.05)', borderLeftColor: activeData.kpis.hitlColor }}>
            <p className="text-xs font-bold text-slate-200 mb-1">Discrepancia HITL por debajo del umbral saludable</p>
            <p className="text-[11px] text-slate-400">Tasa {activeData.kpis.hitl}% (rango sano: 10–30%). Posible complacencia algorítmica o falta de registro deliberativo (RS-03 Automation Bias).</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="p-3 rounded-r-xl border-l-4 transition-all duration-300 hover:bg-blue-500/10" style={{ background: 'rgba(59,130,246,0.1)', borderLeftColor: clr.azul }}>
            <p className="text-xs font-bold text-slate-200 mb-1">ICE territorial en zona de atención — {activeData.kpis.ice}%</p>
            <p className="text-[11px] text-slate-400">Municipios críticos detectados en el dashboard. Revisar modelo con filtro W_geo. Meta ICE ≥80%.</p>
          </div>
          <div className="p-3 rounded-r-xl border-l-4 transition-all duration-300 hover:bg-amber-500/10" style={{ background: 'rgba(245,158,11,0.05)', borderLeftColor: clr.amarillo }}>
            <p className="text-xs font-bold text-slate-200 mb-1">Function creep — líneas rojas operativas</p>
            <p className="text-[11px] text-slate-400">NLP, triaje, predicción individual o automatización vinculante quedan fuera del alcance aprobado. Excederlos reclasifica el sistema en EU AI Act.</p>
          </div>
        </div>
      </div>

      {/* ══ FILA 1 — KPI EJECUTIVOS ════════════════════════ */}
      <SectionTitle eyebrow={`Mes: ${activeData.name}`} title="Resumen ejecutivo dinámico" icon={Gauge} accent={clr.verde} />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_3fr] gap-4">
        <Block title="Madurez de IA" icon={BrainCircuit} accent={clr.violeta}>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={activeData.radarData} margin={{ top: 15, right: 30, bottom: 15, left: 30 }}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={(props) => <RadarTick {...props} />} />
                <Radar name="Madurez" dataKey="v" stroke={clr.violeta} fill={clr.violeta} fillOpacity={0.18} strokeWidth={2} dot={{ r: 3, fill: clr.violeta }} isAnimationActive={true} animationDuration={800} />
                <Tooltip content={<DarkTip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Block>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Kpi label="AI Governance Score" val={activeData.kpis.score} valUnit="%" mainColor={activeData.kpis.scoreColor} subIconColor={activeData.kpis.scoreColor} subText={activeData.kpis.scoreSub} tooltip="Puntuación compuesta de madurez, riesgo normativo y robustez técnica evaluada según ISO 42001." />
          <Kpi label="MAE Global" val={activeData.kpis.mae} valUnit="%" mainColor={clr.text} subIconColor={activeData.kpis.mae > 15 ? clr.rojo : clr.verde} subText={activeData.kpis.maeSub} tooltip="Error Absoluto Medio. Define la asertividad del modelo algorítmico global frente a la realidad." />
          <Kpi label="Incidentes activos" val={activeData.kpis.incidentes} mainColor={activeData.kpis.incColor} subIconColor={activeData.kpis.incColor} subText="Meta = 0" tooltip="Alertas de ciberseguridad, violación de privacidad (re-identificación) detectadas en la plataforma." />
          <Kpi label="HITL discrepancia" val={activeData.kpis.hitl} valUnit="%" mainColor={activeData.kpis.hitlColor} subIconColor={activeData.kpis.hitlColor} subText="Rango sano: 10-30%" tooltip="Porcentaje de predicciones algorítmicas corregidas manualmente por un médico. Si es <10%, podría indicar sesgo de complacencia (Automation Bias)." />
          <Kpi label="Concept Drift" val={activeData.kpis.drift} valUnit="%" mainColor={clr.text} subIconColor={activeData.kpis.driftColor} subText="Umbral: <15%" tooltip="Nivel de desviación estadística de los datos actuales frente a los datos con los que el modelo fue entrenado." />
          <Kpi label="Calidad DWH" val={activeData.kpis.dwh} valUnit="%" mainColor={clr.text} subIconColor={activeData.kpis.dwhColor} subText="Meta ≥97%" tooltip="Índice de completitud y veracidad del Data Warehouse que alimenta los modelos." />
          <Kpi label="Data Literacy" val={activeData.kpis.lit} valUnit="%" mainColor={activeData.kpis.litColor} subIconColor={activeData.kpis.litColor} subText="Meta 100%" tooltip="Personal clínico certificado y capacitado para interpretar resultados predictivos y utilizar sistemas de IA de forma ética." />
          <Kpi label="ICE Territorial" val={activeData.kpis.ice} valUnit="%" mainColor={activeData.kpis.iceColor} subIconColor={activeData.kpis.iceColor} subText="Meta ≥80%" tooltip="Índice de Cobertura Equitativa: indica que el modelo no margina zonas rurales con poca información." />
          <Kpi label="Riesgo residual" val={activeData.kpis.riesgo} valUnit="%" mainColor={activeData.kpis.rsgColor} subIconColor={activeData.kpis.rsgColor} subText="Apetito: 60%" tooltip="Riesgo global remanente tras aplicar las salvaguardas actuales. Valores por encima del apetito bloquean el paso a producción." />
        </div>
      </div>
      
      {/* ══ BLOQUE 2 — GOBERNANZA Y CUMPLIMIENTO ═══════════ */}
      <SectionTitle eyebrow="Bloque 2" title="Gobernanza y cumplimiento ISO/IEC 42001" icon={ShieldCheck} accent={clr.azul} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Block title="Dimensiones de gobernanza" icon={ShieldCheck} accent={clr.azul}>
          <div className="mb-4">
            <BarRow label="Cumplimiento" pct={100} color={clr.verde} />
            <BarRow label="Seguridad" pct={95} color={clr.verde} />
            <BarRow label="Ética" pct={92} color={clr.verde} />
            <BarRow label="Calidad de datos" pct={89} color={clr.amarillo} />
            <BarRow label="Riesgos" pct={87} color={clr.amarillo} />
            <BarRow label="Fairness" pct={activeData.kpis.ice} color={activeData.kpis.iceColor} />
            <BarRow label="Supervisión humana" pct={83} color={clr.amarillo} />
          </div>
          <div className="border-t pt-4" style={{ borderColor: clr.borde }}>
            <p className="text-xs font-semibold text-slate-200 mb-3">Madurez ISO 42001 por cláusula</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart layout="vertical" data={D.isoClausulas} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                  <YAxis type="category" dataKey="id" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <Tooltip content={<DarkTip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                  <Bar dataKey="u" name="Umbral" fill="rgba(255,255,255,0.06)" barSize={14} radius={[0,3,3,0]} isAnimationActive={false} />
                  <Bar dataKey="v" name="Implementado" barSize={14} radius={[0,3,3,0]} isAnimationActive={false}>
                    {D.isoClausulas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.v >= entry.u ? 'rgba(34,197,94,0.6)' : 'rgba(245,158,11,0.6)'} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Block>
        <Block title="Cumplimiento normativo multi-marco" icon={Scale} accent={clr.azul}>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[
              { n: 'ISO 42001', v: '100%', c: clr.verde, st: 'Cubierta' },
              { n: 'EU AI Act', v: '74%', c: clr.amarillo, st: 'Limitado' },
              { n: 'Ley 1581', v: '87%', c: clr.amarillo, st: 'Cond.' },
              { n: 'UNESCO', v: '82%', c: clr.azul, st: 'Medio/A' },
              { n: 'CONPES IA', v: '80%', c: clr.verde, st: 'Alineado' }
            ].map(x => (
              <div key={x.n} className="rounded-lg p-2 text-center transition-colors hover:bg-slate-800" style={{ background: clr.bg }}>
                <p className="text-[9px] font-mono text-slate-500 mb-1 truncate">{x.n}</p>
                <p className="text-lg font-bold leading-none mb-2" style={{ color: x.c }}>{x.v}</p>
                <Sbadge label={x.st} color={x.c} />
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mb-4" style={{ borderColor: clr.borde }}>
            <p className="text-xs font-semibold text-slate-200 mb-3">Auditorías 2026</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg p-2 text-center" style={{ background: clr.bg }}>
                <p className="text-xl font-bold" style={{ color: clr.verde }}>4</p>
                <p className="text-[9px] font-mono text-slate-500 mt-1">Realizadas</p>
              </div>
              <div className="rounded-lg p-2 text-center" style={{ background: clr.bg }}>
                <p className="text-xl font-bold" style={{ color: clr.amarillo }}>2</p>
                <p className="text-[9px] font-mono text-slate-500 mt-1">Pendientes</p>
              </div>
              <div className="rounded-lg p-2 text-center" style={{ background: clr.bg }}>
                <p className="text-xl font-bold text-slate-200">6</p>
                <p className="text-[9px] font-mono text-slate-500 mt-1">Total año</p>
              </div>
            </div>
          </div>
          <div className="border-t pt-4" style={{ borderColor: clr.borde }}>
            <p className="text-xs font-semibold text-slate-200 mb-2">Salvaguardas de gobernanza</p>
            {[
              { n: 'Human-in-the-Loop (HITL)', ok: activeData.kpis.hitl >= 10, s: activeData.kpis.hitl >= 10 ? 'Cumple' : 'Alerta' },
              { n: 'K-anonimidad k≥5', ok: true, s: 'Cumple' },
              { n: 'Fail-Safe (MAE > 15%)', ok: activeData.kpis.mae <= 15, s: activeData.kpis.mae <= 15 ? 'Cumple' : 'Falló' },
              { n: 'Monitoreo de Drift mensual', ok: true, s: 'Cumple' },
              { n: 'Auditoría externa ciberseguridad', ok: false, s: 'Jul 2026' },
              { n: 'Data Literacy 100% certificados', ok: activeData.kpis.lit === 100, s: `${activeData.kpis.lit}% actual` }
            ].map((x, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1.5 border-b last:border-b-0 hover:bg-slate-800/30 px-1 -mx-1 transition-colors" style={{ borderColor: clr.borde }}>
                <span className="text-sm font-bold w-4 text-center transition-colors duration-300" style={{ color: x.ok ? clr.verde : clr.rojo }}>{x.ok ? '✓' : '✗'}</span>
                <span className="text-[11px] text-slate-400 flex-1">{x.n}</span>
                <Sbadge label={x.s} color={x.ok ? clr.verde : clr.amarillo} />
              </div>
            ))}
          </div>
        </Block>
      </div>
      
      {/* ══ BLOQUE 3 — RIESGOS NIST ════════════════════════ */}
      <SectionTitle eyebrow="Filtro Interactivo" title="Mapa de riesgos NIST AI RMF (P × I)" icon={ShieldAlert} accent={clr.rojo} />
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <Block title="Heatmap 5×5 — Haz clic para filtrar tabla" icon={ShieldAlert} accent={clr.rojo}>
          <div style={{display: 'grid', gridTemplateColumns: '22px repeat(5,1fr)', gap: 2, fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 3}}>
            <div></div><div className="text-center text-slate-500">I=1</div><div className="text-center text-slate-500">I=2</div><div className="text-center text-slate-500">I=3</div><div className="text-center text-slate-500">I=4</div><div className="text-center text-slate-500">I=5</div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '22px repeat(5,1fr)', gap: 3}}>
            {[5, 4, 3, 2, 1].map((p) => (
              <React.Fragment key={`p-${p}`}>
                <div className="flex items-center justify-center text-[9px] text-slate-500 font-mono">P{p}</div>
                {[1, 2, 3, 4, 5].map((i) => {
                  const cell = D.heatmap.find(c => c.p === p && c.i === i);
                  if (!cell) return <div key={`p${p}i${i}`} className="rounded bg-slate-800/50 h-9" />;
                  const hc = hmColor(cell.n);
                  const isSelected = selectedRiskCell && selectedRiskCell.p === p && selectedRiskCell.i === i;
                  return (
                    <div 
                      key={`p${p}i${i}`} 
                      onClick={() => setSelectedRiskCell(isSelected ? null : {p, i})}
                      className={`rounded h-9 flex flex-col items-center justify-center cursor-pointer font-mono transition-all duration-200 ${isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white z-10 shadow-lg scale-110' : 'hover:scale-105 hover:shadow-md'}`} 
                      style={{ background: isSelected ? hc.border : hc.bg, color: hc.text, border: `1px solid ${hc.border}` }} 
                      title={`P=${p} × I=${i} = ${cell.v}${cell.r?' ('+cell.r+')':''}`}
                    >
                      <span className="text-[11px] font-bold">{cell.v}</span>
                      {cell.r && <span className="text-[8px] opacity-85">{cell.r}</span>}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between mt-4">
            <div className="flex gap-4 text-[10px]">
              <span style={{color: clr.rojo}}>■ Crítico ≥16</span>
              <span style={{color: clr.amarillo}}>■ Alto 10–15</span>
              <span style={{color: clr.azul}}>■ Medio 5–9</span>
              <span style={{color: clr.verde}}>■ Bajo 1–4</span>
            </div>
            {selectedRiskCell && (
              <button onClick={() => setSelectedRiskCell(null)} className="text-[10px] text-slate-400 hover:text-white transition-colors underline">
                Limpiar filtro
              </button>
            )}
          </div>
        </Block>
        <Block title={selectedRiskCell ? `Riesgos en P${selectedRiskCell.p}×I${selectedRiskCell.i}` : "Riesgos identificados (Todos)"} icon={AlertTriangle} accent={clr.amarillo}>
          <div className="overflow-x-auto min-h-[140px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[10px] uppercase font-mono text-slate-500" style={{ borderColor: clr.borde }}>
                  <th className="pb-1.5 font-medium">ID</th>
                  <th className="pb-1.5 font-medium">Riesgo</th>
                  <th className="pb-1.5 font-medium text-center">P×I</th>
                  <th className="pb-1.5 font-medium">Nivel</th>
                </tr>
              </thead>
              <tbody className="animate-in fade-in duration-300">
                {filteredRiesgos.length > 0 ? filteredRiesgos.map(x => (
                  <tr key={x.id} className="border-b last:border-b-0 hover:bg-slate-800/40 transition-colors" style={{ borderColor: clr.borde }}>
                    <td className="py-2.5 text-[11px] font-mono font-medium" style={{ color: clr.azul }}>{x.id}</td>
                    <td className="py-2.5 text-[11px] text-slate-400">{x.r}</td>
                    <td className="py-2.5 text-[11px] font-mono font-bold text-center" style={{ color: x.c }}>{x.pi}</td>
                    <td className="py-2.5"><Sbadge label={x.n} color={x.c} /></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[11px] text-slate-500">
                      No hay riesgos asignados a esta celda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-2.5 rounded-lg text-[11px] border transition-colors duration-500" style={{ background: activeData.kpis.riesgo > 60 ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)', color: activeData.kpis.riesgo > 60 ? clr.rojo : clr.verde, borderColor: activeData.kpis.riesgo > 60 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)' }}>
            {activeData.kpis.riesgo > 60 
              ? `⚠ Riesgo residual ${activeData.kpis.riesgo}% supera apetito (60%). Revisión requerida.`
              : `✓ Riesgo residual ${activeData.kpis.riesgo}% dentro del apetito aceptable (≤60%).`}
          </div>
        </Block>
      </div>
      
      {/* ══ BLOQUE 4 — FAIRNESS ════════════════════════════ */}
      <SectionTitle eyebrow="Bloque 4" title="Fairness (semáforo de equidad territorial)" icon={Scale} accent={clr.azul} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Block title="Métricas prioritarias ★ — valores técnicos corregidos" icon={Scale} accent={clr.azul}>
          <div className="grid grid-cols-[1fr_auto_auto_10px] gap-2 pb-1 border-b mb-1" style={{ borderColor: clr.borde }}>
            <span className="text-[10px] font-mono text-slate-500">MÉTRICA</span>
            <span className="text-[10px] font-mono text-slate-500 text-right">VALOR</span>
            <span className="text-[10px] font-mono text-slate-500 text-right">UMBRAL V.</span>
            <span></span>
          </div>
          {activeData.fairnessData.map((f, i) => (
             <FairnessRow key={i} name={`★ ${f.metric.replace(' (×0.1)','').replace(' %','')}`} formula={f.metric} val={f.valor} thr={f.umbral} dotColor={f.fill} valColor={f.fill} />
          ))}
          <FairnessRow name="ΔMAE — Delta error rural/urbano (apoyo)" formula="MAE_rural − MAE_urbano" val="8.2%" thr="≤ 5%" dotColor={clr.amarillo} valColor={clr.amarillo} />
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="rounded-lg p-2 text-center transition-colors hover:bg-green-500/10" style={{ background: 'rgba(34,197,94,0.05)', border: `1px solid rgba(34,197,94,0.15)` }}>
              <p className="text-[10px] font-mono font-bold" style={{ color: clr.verde }}>Verde</p>
              <p className="text-[9px] mt-1 opacity-80" style={{ color: clr.verde }}>IID ≥0.75 · ICE ≥80%<br/>EOD ≤±0.05</p>
            </div>
            <div className="rounded-lg p-2 text-center transition-colors hover:bg-yellow-500/10" style={{ background: 'rgba(245,158,11,0.05)', border: `1px solid rgba(245,158,11,0.15)` }}>
              <p className="text-[10px] font-mono font-bold" style={{ color: clr.amarillo }}>Amarillo</p>
              <p className="text-[9px] mt-1 opacity-80" style={{ color: clr.amarillo }}>IID 0.60–0.75<br/>ICE 70–80%</p>
            </div>
            <div className="rounded-lg p-2 text-center transition-colors hover:bg-red-500/10" style={{ background: 'rgba(239,68,68,0.05)', border: `1px solid rgba(239,68,68,0.15)` }}>
              <p className="text-[10px] font-mono font-bold" style={{ color: clr.rojo }}>Rojo</p>
              <p className="text-[9px] mt-1 opacity-80" style={{ color: clr.rojo }}>IID &lt;0.60 o ICE &lt;70%<br/>EOD &gt;±0.15 → KS</p>
            </div>
          </div>
        </Block>
        <Block title="Evaluación de impacto — municipios del Valle" icon={Target} accent={clr.azul}>
          <table className="w-full text-left border-collapse mb-3">
            <thead>
              <tr className="border-b text-[10px] uppercase font-mono text-slate-500" style={{ borderColor: clr.borde }}>
                <th className="pb-1.5 font-medium">Municipio</th>
                <th className="pb-1.5 font-medium text-center">Real</th>
                <th className="pb-1.5 font-medium text-center">Pred.</th>
                <th className="pb-1.5 font-medium text-center">Error</th>
                <th className="pb-1.5 font-medium text-center">IID</th>
                <th className="pb-1.5 font-medium text-center">Rep.</th>
              </tr>
            </thead>
            <tbody>
              {activeData.municipios.map(x => (
                <tr key={x.m} className="border-b last:border-b-0 hover:bg-slate-800/40 transition-colors cursor-pointer group" style={{ borderColor: clr.borde }}>
                  <td className="py-2.5 text-[11px] text-slate-400 group-hover:text-white transition-colors">{x.m}</td>
                  <td className="py-2.5 text-[11px] text-slate-400 text-center">{x.r}</td>
                  <td className="py-2.5 text-[11px] text-slate-400 text-center">{x.p}</td>
                  <td className="py-2.5 text-[11px] font-medium text-center transition-colors duration-300" style={{ color: x.ec }}>{x.e}</td>
                  <td className="py-2.5 text-[11px] font-mono text-center transition-colors duration-300" style={{ color: x.ic }}>{x.i}</td>
                  <td className="py-2.5 text-center"><Sbadge label={x.s} color={x.sc} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-slate-400 mb-4 transition-all duration-300">
            Dagua (IID={activeData.municipios.find(m=>m.m==='Dagua')?.i}) y El Dovio (IID={activeData.municipios.find(m=>m.m==='El Dovio')?.i}) requieren monitoreo para sesgos. ICE global = {activeData.kpis.ice}% (meta ≥80%).
          </p>
          <div className="border-t pt-4" style={{ borderColor: clr.borde }}>
            <p className="text-xs font-semibold text-slate-200 mb-3">Fairness por dimensión</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeData.fairnessData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#475569', fontSize: 9 }} />
                  <Tooltip content={<DarkTip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                  <Bar dataKey="umbral" name="Umbral" fill="rgba(255,255,255,0.06)" barSize={22} radius={[3,3,0,0]} isAnimationActive={false} />
                  <Bar dataKey="valor" name="Valor" barSize={22} radius={[3,3,0,0]} isAnimationActive={true} animationDuration={800}>
                    {activeData.fairnessData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Block>
      </div>
      
      {/* ══ BLOQUE 5 — DESEMPEÑO Y SEGURIDAD ══════════════ */}
      <SectionTitle eyebrow="Bloque 5" title="Desempeño y seguridad histórica" icon={TrendingUp} accent={clr.verde} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Block title="Evolución MAE mensual — detección de drift" icon={HeartPulse} accent={clr.cyan}>
          <div className="h-40 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={D.maeMonthly} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="periodo" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <YAxis domain={[0, 20]} tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={v => v+'%'} />
                <Tooltip content={<DarkTip />} cursor={{stroke: 'rgba(255,255,255,0.1)'}} />
                <Line type="monotone" dataKey="meta" name="Fail-Safe 15%" stroke="rgba(240,82,82,0.7)" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="val" name="MAE %" stroke={clr.azul} strokeWidth={2} dot={{ r: 4, fill: clr.azul, strokeWidth: 2, stroke: clr.bg }} activeDot={{ r: 6, fill: clr.cyan }} fill="rgba(59,130,246,0.1)" isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t pt-2" style={{ borderColor: clr.borde }}>
            <MetricRow name="MAE Global (backtesting)" val={`${activeData.kpis.mae}%`} thr="≤15%" dotColor={activeData.kpis.mae > 15 ? clr.rojo : clr.verde} />
            <MetricRow name="Nivel de confianza 95%" val="94.6%" thr="≥90%" dotColor={clr.verde} />
            <MetricRow name="TSD subestimación demanda" val="22%" thr="≤30%" dotColor={clr.verde} />
            <MetricRow name="RPP paridad rural/urbano" val="1.14" thr="0.8–1.2" dotColor={clr.verde} />
            <MetricRow name="Justificación HITL escrita" val={`${activeData.kpis.lit}%`} thr="≥90%" dotColor={activeData.kpis.lit < 90 ? clr.amarillo : clr.verde} />
          </div>
        </Block>
        <Block title="Tendencias Históricas e Incidentes" icon={TrendingUp} accent={clr.verde}>
          <div className="h-44 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={D.tendencias} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="p" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={v => v+'%'} />
                <Tooltip content={<DarkTip />} cursor={{stroke: 'rgba(255,255,255,0.1)'}} />
                <Line type="monotone" dataKey="riesgo" name="Riesgo" stroke={clr.rojo} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: clr.rojo }} activeDot={{ r: 5 }} isAnimationActive={true} />
                <Line type="monotone" dataKey="cumplimiento" name="Cumplimiento" stroke={clr.verde} strokeWidth={2} dot={{ r: 3, fill: clr.verde }} activeDot={{ r: 5 }} isAnimationActive={true} />
                <Line type="monotone" dataKey="madurez" name="Madurez" stroke={clr.azul} strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3, fill: clr.azul }} activeDot={{ r: 5 }} isAnimationActive={true} />
                <Line type="monotone" dataKey="precision" name="Precisión" stroke={clr.amarillo} strokeWidth={2} dot={{ r: 3, fill: clr.amarillo }} activeDot={{ r: 5 }} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t pt-2" style={{ borderColor: clr.borde }}>
            <p className="text-xs font-semibold text-slate-200 mb-2">Seguridad y privacidad (Actual)</p>
            <MetricRow name="Incidentes seguridad activos" val={activeData.kpis.incidentes} thr="=0" dotColor={activeData.kpis.incColor} valColor={activeData.kpis.incColor} />
            <MetricRow name="Cifrado DWH (AES-256)" val="Activo" thr="Mandatorio" dotColor={clr.verde} />
            <MetricRow name="K-anonimidad k≥5" val="100%" thr="100%" dotColor={clr.verde} />
            <MetricRow name="Filas riesgo reidentificación" val="0" thr="=0" dotColor={clr.verde} valColor={clr.verde} />
            <MetricRow name="Cumplimiento Ley 1581" val="87%" thr="Cond." dotColor={clr.amarillo} valColor={clr.amarillo} />
          </div>
        </Block>
      </div>
      
      {/* ══ GLOSARIO EJECUTIVO ═════════════════════════════ */}
      <SectionTitle eyebrow="Glosario" title="Glosario interactivo" icon={Eye} accent={clr.violeta} />
      <div className="space-y-3 mb-4">
        {[
          { q: '¿Qué significa Go condicionado?', a: 'El sistema puede avanzar solo si se certifican privacidad (k≥5 por tercero), trazabilidad, supervisión humana, Data Literacy al 100% y controles de equidad antes de operación plena. Todo ello en el marco ISO/IEC 42001.' },
          { q: '¿Cuándo se activa el Fail-Safe?', a: 'Si el MAE supera el 15% durante dos semanas consecutivas, o si EOD supera ±0.15, el Kill-Switch deshabilita automáticamente las decisiones en tiempo real y la vista pasa a modo descriptivo puro hasta una revisión manual.' },
          { q: '¿Qué debe revisar la alta dirección?', a: 'El mapa de calor de Riesgos (que no existan riesgos críticos sin mitigar), el Riesgo global vs. apetito, la discrepancia HITL (no debe bajar del rango sano), ICE territorial (equidad regional) y auditorías pendientes.' },
          { q: '¿Qué es HITL discrepancia?', a: 'Human-In-The-Loop. Mide el porcentaje de veces que el experto humano (médico) rechaza o modifica la sugerencia predictiva del modelo. Una tasa por debajo del 10% podría evidenciar "Automation Bias" (confianza ciega en la máquina).' }
        ].map((x, i) => (
          <AccordionItem key={i} q={x.q} a={x.a} />
        ))}
      </div>
      
      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <div className="flex justify-between items-center py-4 border-t mt-4" style={{ borderColor: clr.borde }}>
        <span className="text-[10px] font-mono text-slate-500">HDPUV · SIAGP v2.0 Dinámico · Uso Interno / Alta Dirección</span>
      </div>
      
    </div>
  );
}
