import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, ComposedChart
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
  fairnessData: [
    { metric: 'IID (×0.1)', valor: 8.2, umbral: 7.5, fill: clr.verde },
    { metric: 'ICE %', valor: 74, umbral: 80, fill: clr.amarillo },
    { metric: '|EOD|×20', valor: 0.6, umbral: 1, fill: clr.verde },
    { metric: 'DI (×0.1)', valor: 9.1, umbral: 8.0, fill: clr.verde }
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
  ]
};

export default function GobiernoIA() {

  const Kpi = ({ label, val, sub, subIconColor, subText, mainColor = clr.text }) => (
    <div className="rounded-xl p-3 border" style={{ background: clr.card, borderColor: clr.borde }}>
      <p className="text-[10px] font-mono text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold leading-tight" style={{ color: mainColor }}>{val}</p>
      <div className="flex items-center gap-1.5 mt-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: subIconColor }}></div>
        <p className="text-[11px] text-slate-400">{subText}</p>
      </div>
    </div>
  );

  const BarRow = ({ label, pct, color }) => (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-[11px] text-slate-400 w-28 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: clr.bg }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }}></div>
      </div>
      <span className="text-[11px] font-mono font-semibold w-8 text-right" style={{ color }}>{pct}</span>
    </div>
  );

  const MetricRow = ({ name, val, thr, dotColor, valColor = '#e2e8f0' }) => (
    <div className="flex items-center gap-2 py-2 border-b last:border-b-0" style={{ borderColor: clr.borde }}>
      <span className="text-xs text-slate-400 flex-1">{name}</span>
      <span className="text-xs font-semibold w-12 text-right" style={{ color: valColor }}>{val}</span>
      <span className="text-[10px] font-mono text-slate-500 w-12 text-right">{thr}</span>
      <div className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: dotColor }}></div>
    </div>
  );

  const FairnessRow = ({ name, formula, val, thr, dotColor, valColor }) => (
    <div className="grid grid-cols-[1fr_auto_auto_10px] gap-2 items-center py-2 border-b last:border-b-0" style={{ borderColor: clr.borde }}>
      <div>
        <div className="text-xs text-slate-400">{name}</div>
        <div className="text-[10px] font-mono text-slate-500">{formula}</div>
      </div>
      <span className="text-sm font-semibold font-mono text-right" style={{ color: valColor }}>{val}</span>
      <span className="text-[10px] font-mono text-slate-500 text-right whitespace-nowrap">{thr}</span>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }}></div>
    </div>
  );

  const hmColor = (n) => {
    if (n === 'c') return { bg: 'rgba(239,68,68,0.18)', text: clr.rojo };
    if (n === 'h') return { bg: 'rgba(245,158,11,0.16)', text: clr.amarillo };
    if (n === 'm') return { bg: 'rgba(59,130,246,0.12)', text: clr.azul };
    return { bg: 'rgba(34,197,94,0.10)', text: clr.verde };
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6" style={{ background: clr.bg, color: '#e2e8f0' }}>
      
      {/* ══ HEADER ══════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b" style={{ borderColor: clr.borde }}>
        <div>
          <div className="text-lg font-semibold tracking-tight text-slate-100">Gobierno de IA — SIAGP <span style={{fontWeight: 300, color: 'var(--text3)'}}>/ HDPUV</span></div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">ISO/IEC 42001 · NIST AI RMF · EU AI Act · AIA · CONPES 3975 &nbsp;|&nbsp; v2.0 · Mayo 2026 · JSON v2</div>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Sbadge label="⚡ GO condicionado" color={clr.amarillo} />
          <Sbadge label="Riesgo ALTO" color={clr.rojo} />
          <Sbadge label="Kill-Switch armado" color={clr.verde} />
          <Sbadge label="5 condiciones pendientes" color={clr.azul} />
        </div>
      </div>
      
      {/* ══ FILA 1 — KPI EJECUTIVOS ════════════════════════ */}
      <SectionTitle eyebrow="Fila 1" title="Resumen ejecutivo" icon={Gauge} accent={clr.verde} />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi label="AI Governance Score" val={<span>82<span className="text-sm font-normal text-slate-400">%</span></span>} subIconColor={clr.amarillo} subText="Riesgo moderado" />
        <Kpi label="Madurez AIMS (ISO 42001)" val={<span>68<span className="text-sm font-normal text-slate-400">%</span></span>} subIconColor={clr.amarillo} subText="En curso" />
        <Kpi label="MAE Global" val={<span>11.3<span className="text-sm font-normal text-slate-400">%</span></span>} subIconColor={clr.verde} subText="Meta ≤15%" />
        <Kpi label="Incidentes activos" val="0" mainColor={clr.verde} subIconColor={clr.verde} subText="Meta = 0" />
        <Kpi label="HITL discrepancia" val={<span>3<span className="text-sm font-normal text-slate-400">%</span></span>} mainColor={clr.amarillo} subIconColor={clr.amarillo} subText="Rango sano: 10-30%" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi label="Concept Drift" val={<span>8<span className="text-sm font-normal text-slate-400">%</span></span>} subIconColor={clr.verde} subText="Umbral: <15%" />
        <Kpi label="Calidad DWH" val={<span>98.1<span className="text-sm font-normal text-slate-400">%</span></span>} subIconColor={clr.verde} subText="Meta ≥97%" />
        <Kpi label="Data Literacy" val={<span>83<span className="text-sm font-normal text-slate-400">%</span></span>} mainColor={clr.amarillo} subIconColor={clr.amarillo} subText="Meta 100%" />
        <Kpi label="ICE Territorial" val={<span>74<span className="text-sm font-normal text-slate-400">%</span></span>} mainColor={clr.amarillo} subIconColor={clr.amarillo} subText="Meta ≥80%" />
        <Kpi label="Riesgo residual" val={<span>72<span className="text-sm font-normal text-slate-400">%</span></span>} mainColor={clr.rojo} subIconColor={clr.rojo} subText="Apetito: 60%" />
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
            <BarRow label="Fairness" pct={74} color={clr.amarillo} />
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
              <div key={x.n} className="rounded-lg p-2 text-center" style={{ background: clr.bg }}>
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
              { n: 'Human-in-the-Loop (HITL)', ok: true, s: 'Cumple' },
              { n: 'K-anonimidad k≥5', ok: true, s: 'Cumple' },
              { n: 'Fail-Safe (MAE > 15%)', ok: true, s: 'Cumple' },
              { n: 'Monitoreo de Drift mensual', ok: true, s: 'Cumple' },
              { n: 'Auditoría externa ciberseguridad', ok: false, s: 'Jul 2026' },
              { n: 'Data Literacy 100% certificados', ok: false, s: '83% actual' }
            ].map(x => (
              <div key={x.n} className="flex items-center gap-2 py-1.5 border-b last:border-b-0" style={{ borderColor: clr.borde }}>
                <span className="text-sm font-bold w-4 text-center" style={{ color: x.ok ? clr.verde : clr.rojo }}>{x.ok ? '✓' : '✗'}</span>
                <span className="text-[11px] text-slate-400 flex-1">{x.n}</span>
                <Sbadge label={x.s} color={x.ok ? clr.verde : clr.amarillo} />
              </div>
            ))}
          </div>
        </Block>
      </div>
      
      {/* ══ BLOQUE 3 — RIESGOS NIST ════════════════════════ */}
      <SectionTitle eyebrow="Bloque 3" title="Mapa de riesgos NIST AI RMF (P × I)" icon={ShieldAlert} accent={clr.rojo} />
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <Block title="Heatmap 5×5 — Probabilidad × Impacto" icon={ShieldAlert} accent={clr.rojo}>
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
                  return (
                    <div key={`p${p}i${i}`} className="rounded h-9 flex flex-col items-center justify-center cursor-default font-mono transition-colors" 
                         style={{ background: hc.bg, color: hc.text }} title={`P=${p} × I=${i} = ${cell.v}${cell.r?' ('+cell.r+')':''}`}>
                      <span className="text-[11px] font-bold">{cell.v}</span>
                      {cell.r && <span className="text-[8px] opacity-85">{cell.r}</span>}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-[10px]">
            <span style={{color: clr.rojo}}>■ Crítico ≥16</span>
            <span style={{color: clr.amarillo}}>■ Alto 10–15</span>
            <span style={{color: clr.azul}}>■ Medio 5–9</span>
            <span style={{color: clr.verde}}>■ Bajo 1–4</span>
          </div>
        </Block>
        <Block title="Riesgos identificados" icon={AlertTriangle} accent={clr.amarillo}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[10px] uppercase font-mono text-slate-500" style={{ borderColor: clr.borde }}>
                  <th className="pb-1.5 font-medium">ID</th>
                  <th className="pb-1.5 font-medium">Riesgo</th>
                  <th className="pb-1.5 font-medium">P×I</th>
                  <th className="pb-1.5 font-medium">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {id:'RS-01', r:'Subregistro calidad HIS', pi:12, n:'Alto', c:clr.amarillo},
                  {id:'RS-02', r:'Concept Drift / obsolescencia', pi:12, n:'Alto', c:clr.amarillo},
                  {id:'RS-03', r:'Complacencia algorítmica', pi:12, n:'Alto', c:clr.amarillo},
                  {id:'RS-04', r:'Reidentificación municipios', pi:10, n:'Alto', c:clr.amarillo},
                  {id:'RS-05', r:'Trazabilidad / function creep', pi:9, n:'Medio', c:clr.azul},
                ].map(x => (
                  <tr key={x.id} className="border-b last:border-b-0" style={{ borderColor: clr.borde }}>
                    <td className="py-2 text-[11px] font-mono font-medium" style={{ color: clr.azul }}>{x.id}</td>
                    <td className="py-2 text-[11px] text-slate-400">{x.r}</td>
                    <td className="py-2 text-[11px] font-mono font-bold" style={{ color: x.c }}>{x.pi}</td>
                    <td className="py-2"><Sbadge label={x.n} color={x.c} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-2.5 rounded-lg text-[11px] border" style={{ background: 'rgba(239,68,68,0.05)', color: clr.rojo, borderColor: 'rgba(239,68,68,0.2)' }}>
            ⚠ Riesgo residual 72% supera apetito (60%). Revisión del Comité de Gobernanza requerida.
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
          <FairnessRow name="★ IID — Índice de Impacto Distribucional" formula="(Recursos_i/Total) ÷ (Necesidad_i/Total)" val="0.82" thr="0.75–1.25" dotColor={clr.verde} valColor={clr.verde} />
          <FairnessRow name="★ ICE — Índice de Cobertura Equitativa" formula="% municipios con IID ∈ [0.75, 1.25]" val="74%" thr="≥ 80%" dotColor={clr.amarillo} valColor={clr.amarillo} />
          <FairnessRow name="★ EOD — Equal Opportunity Difference" formula="TPR_rural − TPR_urbano" val="−0.03" thr="−0.05 a 0.05" dotColor={clr.verde} valColor={clr.verde} />
          <FairnessRow name="★ Data Literacy — Usuarios certificados" formula="(certificados / total directos) × 100" val="83%" thr="100%" dotColor={clr.amarillo} valColor={clr.amarillo} />
          <FairnessRow name="DI — Disparate Impact Ratio (apoyo)" formula="P(Ŷ=1|rural) / P(Ŷ=1|urbano)" val="0.91" thr="0.80–1.25" dotColor={clr.verde} valColor={clr.verde} />
          <FairnessRow name="ΔMAE — Delta error rural/urbano (apoyo)" formula="MAE_rural − MAE_urbano" val="8.2%" thr="≤ 5%" dotColor={clr.amarillo} valColor={clr.amarillo} />
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <p className="text-[10px] font-mono font-bold" style={{ color: clr.verde }}>Verde</p>
              <p className="text-[9px] mt-1 opacity-80" style={{ color: clr.verde }}>IID ≥0.75 · ICE ≥80%<br/>EOD ≤±0.05 · DI ≥0.80</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <p className="text-[10px] font-mono font-bold" style={{ color: clr.amarillo }}>Amarillo</p>
              <p className="text-[9px] mt-1 opacity-80" style={{ color: clr.amarillo }}>IID 0.60–0.75<br/>ICE 70–80%</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
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
                <th className="pb-1.5 font-medium">Real</th>
                <th className="pb-1.5 font-medium">Pred.</th>
                <th className="pb-1.5 font-medium">Error</th>
                <th className="pb-1.5 font-medium">IID</th>
                <th className="pb-1.5 font-medium">Rep.</th>
              </tr>
            </thead>
            <tbody>
              {[
                {m:'Cali', r:92, p:89, e:'3%', ec:clr.verde, i:'1.02', ic:clr.text, s:'Alta', sc:clr.verde},
                {m:'Palmira', r:47, p:44, e:'3%', ec:clr.verde, i:'0.95', ic:clr.text, s:'Media', sc:clr.azul},
                {m:'Buenaventura', r:38, p:31, e:'7%', ec:clr.amarillo, i:'0.81', ic:clr.text, s:'Media', sc:clr.azul},
                {m:'Dagua', r:16, p:10, e:'6%', ec:clr.rojo, i:'0.68', ic:clr.amarillo, s:'Baja ⚠', sc:clr.amarillo},
                {m:'El Dovio', r:12, p:7, e:'5%', ec:clr.rojo, i:'0.63', ic:clr.amarillo, s:'Baja ⚠', sc:clr.amarillo},
              ].map(x => (
                <tr key={x.m} className="border-b last:border-b-0" style={{ borderColor: clr.borde }}>
                  <td className="py-2 text-[11px] text-slate-400">{x.m}</td>
                  <td className="py-2 text-[11px] text-slate-400">{x.r}</td>
                  <td className="py-2 text-[11px] text-slate-400">{x.p}</td>
                  <td className="py-2 text-[11px] font-medium" style={{ color: x.ec }}>{x.e}</td>
                  <td className="py-2 text-[11px] font-mono" style={{ color: x.ic }}>{x.i}</td>
                  <td className="py-2"><Sbadge label={x.s} color={x.sc} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-slate-400 mb-4">
            Dagua (IID=0.68) y El Dovio (IID=0.63) en zona amarilla — próximos al umbral de alerta crítica (IID&lt;0.60).<br/>ICE global = 74% (meta ≥80%).
          </p>
          <div className="border-t pt-4" style={{ borderColor: clr.borde }}>
            <p className="text-xs font-semibold text-slate-200 mb-3">Fairness por dimensión</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={D.fairnessData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#475569', fontSize: 9 }} />
                  <Tooltip content={<DarkTip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                  <Bar dataKey="umbral" name="Umbral" fill="rgba(255,255,255,0.06)" barSize={22} radius={[3,3,0,0]} isAnimationActive={false} />
                  <Bar dataKey="valor" name="Valor" barSize={22} radius={[3,3,0,0]} isAnimationActive={false}>
                    {D.fairnessData.map((entry, index) => (
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
      <SectionTitle eyebrow="Bloque 5" title="Desempeño y seguridad" icon={TrendingUp} accent={clr.verde} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Block title="Evolución MAE mensual — detección de drift" icon={HeartPulse} accent={clr.cyan}>
          <div className="h-40 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={D.maeMonthly} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="periodo" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <YAxis domain={[0, 20]} tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={v => v+'%'} />
                <Tooltip content={<DarkTip />} />
                <Line type="monotone" dataKey="meta" name="Fail-Safe 15%" stroke="rgba(240,82,82,0.7)" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="val" name="MAE %" stroke={clr.azul} strokeWidth={2} dot={{ r: 3, fill: clr.azul }} fill="rgba(59,130,246,0.1)" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t pt-2" style={{ borderColor: clr.borde }}>
            <MetricRow name="MAE Global (backtesting)" val="12.4%" thr="≤15%" dotColor={clr.verde} />
            <MetricRow name="Nivel de confianza 95%" val="94.6%" thr="≥90%" dotColor={clr.verde} />
            <MetricRow name="TSD subestimación demanda" val="22%" thr="≤30%" dotColor={clr.verde} />
            <MetricRow name="RPP paridad rural/urbano" val="1.14" thr="0.8–1.2" dotColor={clr.verde} />
            <MetricRow name="Justificación HITL escrita" val="91%" thr="≥90%" dotColor={clr.verde} />
          </div>
        </Block>
        <Block title="Tendencias Mar–Jun 2026" icon={TrendingUp} accent={clr.verde}>
          <div className="h-44 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={D.tendencias} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="p" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={v => v+'%'} />
                <Tooltip content={<DarkTip />} />
                <Line type="monotone" dataKey="riesgo" name="Riesgo" stroke={clr.rojo} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: clr.rojo }} isAnimationActive={false} />
                <Line type="monotone" dataKey="cumplimiento" name="Cumplimiento" stroke={clr.verde} strokeWidth={2} dot={{ r: 3, fill: clr.verde }} isAnimationActive={false} />
                <Line type="monotone" dataKey="madurez" name="Madurez" stroke={clr.azul} strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3, fill: clr.azul }} isAnimationActive={false} />
                <Line type="monotone" dataKey="precision" name="Precisión" stroke={clr.amarillo} strokeWidth={2} dot={{ r: 3, fill: clr.amarillo }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t pt-2" style={{ borderColor: clr.borde }}>
            <p className="text-xs font-semibold text-slate-200 mb-2">Seguridad y privacidad</p>
            <MetricRow name="Incidentes seguridad activos" val="0" thr="=0" dotColor={clr.verde} valColor={clr.verde} />
            <MetricRow name="Cifrado DWH (AES-256)" val="Activo" thr="Mandatorio" dotColor={clr.verde} />
            <MetricRow name="K-anonimidad k≥5" val="100%" thr="100%" dotColor={clr.verde} />
            <MetricRow name="Filas riesgo reidentificación" val="0" thr="=0" dotColor={clr.verde} valColor={clr.verde} />
            <MetricRow name="Cumplimiento Ley 1581" val="87%" thr="Cond." dotColor={clr.amarillo} valColor={clr.amarillo} />
          </div>
        </Block>
      </div>
      
      {/* ══ VALOR PÚBLICO + HOJA DE RUTA ══════════════════ */}
      <SectionTitle eyebrow="Conclusión" title="Valor público y plan de gobernanza" icon={Sparkles} accent={clr.verde} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Block title="Recomendaciones emitidas — Mayo 2026" icon={Sparkles} accent={clr.verde}>
          <div className="flex h-2.5 rounded-full overflow-hidden mb-3">
            <div style={{flex: 48, background: clr.verde}}></div>
            <div style={{flex: 14, background: clr.amarillo}}></div>
            <div style={{flex: 2, background: clr.rojo}}></div>
          </div>
          <div className="flex gap-4 text-[11px] mb-4">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{background: clr.verde}}></div>Aplicadas 48</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{background: clr.amarillo}}></div>Modificadas 14</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{background: clr.rojo}}></div>Rechazadas 2</span>
          </div>
          <BarRow label="FURAG datos" pct="80%" color={clr.azul} />
          <BarRow label="MIPG evidencia" pct="82%" color={clr.azul} />
          <BarRow label="Ocupación planif." pct="82%" color={clr.verde} />
          <BarRow label="Reducción espera" pct="-15%" color={clr.verde} />
        </Block>
        <Block title="Hoja de ruta de gobernanza" icon={GitBranch} accent={clr.azul}>
          <div className="mb-4">
            {[
              {f:'Fundamentos', pct:'100%', w:'100%', c:clr.verde, p:'Ene–Mar 2026 · Completada'},
              {f:'Habilitadores', pct:'58%', w:'58%', c:clr.amarillo, p:'Abr–Jun 2026 · En curso'},
              {f:'Operación plena', pct:'0%', w:'0%', c:clr.gris, p:'Jul–Sep 2026 · Pendiente'},
              {f:'Madurez', pct:'0%', w:'0%', c:clr.gris, p:'Oct 2026–Dic 2027'},
            ].map(x => (
              <div key={x.f} className="mb-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-slate-400 w-28 shrink-0">{x.f}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: clr.bg }}>
                    <div className="h-full rounded-full transition-all" style={{ width: x.w, background: x.c }}></div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 w-8 text-right">{x.pct}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-600 pl-30">{x.p}</div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4" style={{ borderColor: clr.borde }}>
            <p className="text-xs font-semibold text-slate-200 mb-2">HITL — historial de supervisión humana</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={D.hitlHistorial} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="p" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={v=>v+'%'} />
                  <Tooltip content={<DarkTip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                  <Bar dataKey="deliberacion" name="Deliberación %" fill="rgba(59,130,246,0.6)" barSize={16} radius={[3,3,0,0]} isAnimationActive={false} />
                  <Bar dataKey="justificacion" name="Justificadas %" fill="rgba(34,197,94,0.5)" barSize={16} radius={[3,3,0,0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Block>
      </div>
      
      {/* ══ ALERTAS ESTRATÉGICAS ═══════════════════════════ */}
      <SectionTitle eyebrow="Alertas" title="Alertas estratégicas — alta dirección" icon={AlertTriangle} accent={clr.rojo} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="p-3 rounded-r-xl border-l-4" style={{ background: 'rgba(239,68,68,0.05)', borderLeftColor: clr.rojo }}>
            <p className="text-xs font-bold text-slate-200 mb-1">Go condicionado — sin certificar, no avanzar</p>
            <p className="text-[11px] text-slate-400">No avanzar a producción plena sin k-anonimidad certificada por tercero, logs explicables y Kill-Switch verificado. 5 condiciones pendientes.</p>
          </div>
          <div className="p-3 rounded-r-xl border-l-4" style={{ background: 'rgba(239,68,68,0.05)', borderLeftColor: clr.rojo }}>
            <p className="text-xs font-bold text-slate-200 mb-1">Discrepancia HITL por debajo del umbral saludable</p>
            <p className="text-[11px] text-slate-400">Tasa 3% (rango sano: 10–30%). Posible complacencia algorítmica o falta de registro deliberativo (RS-03 Automation Bias).</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="p-3 rounded-r-xl border-l-4" style={{ background: 'rgba(59,130,246,0.1)', borderLeftColor: clr.azul }}>
            <p className="text-xs font-bold text-slate-200 mb-1">ICE territorial en zona amarilla — 74%</p>
            <p className="text-[11px] text-slate-400">Dagua (IID=0.68) y El Dovio (IID=0.63) próximos al umbral crítico. Revisar modelo con filtro W_geo. Meta ICE ≥80%.</p>
          </div>
          <div className="p-3 rounded-r-xl border-l-4" style={{ background: 'rgba(245,158,11,0.05)', borderLeftColor: clr.amarillo }}>
            <p className="text-xs font-bold text-slate-200 mb-1">Function creep — líneas rojas operativas</p>
            <p className="text-[11px] text-slate-400">NLP, triaje, predicción individual o automatización vinculante quedan fuera del alcance aprobado. Excederlos reclasifica el sistema en EU AI Act.</p>
          </div>
        </div>
      </div>
      
      {/* ══ GLOSARIO EJECUTIVO ═════════════════════════════ */}
      <SectionTitle eyebrow="Glosario" title="Glosario ejecutivo" icon={Eye} accent={clr.violeta} />
      <div className="space-y-2 mb-4">
        {[
          { q: '¿Qué significa Go condicionado?', a: 'El sistema puede avanzar solo si se certifican privacidad (k≥5 por tercero), trazabilidad, supervisión humana, Data Literacy al 100% y controles de equidad antes de operación plena.' },
          { q: '¿Cuándo se activa el Fail-Safe?', a: 'Si el MAE supera el 15% durante dos semanas consecutivas, o si EOD supera ±0.15, la vista pasa a modo descriptivo hasta nueva autorización del Comité de Gobernanza.' },
          { q: '¿Qué debe revisar la alta dirección?', a: 'Riesgo global vs. apetito (72% > 60%), discrepancia HITL (3% bajo rango sano), ICE territorial (74% < 80%), 2 auditorías pendientes, Data Literacy (83%) y evidencia FURAG/MIPG.' },
        ].map(x => (
          <div key={x.q} className="rounded-xl p-3" style={{ background: clr.card }}>
            <p className="text-xs font-bold text-slate-200 mb-1">{x.q}</p>
            <p className="text-[11px] text-slate-400">{x.a}</p>
          </div>
        ))}
      </div>
      
      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <div className="flex justify-between items-center py-4 border-t mt-4" style={{ borderColor: clr.borde }}>
        <span className="text-[10px] font-mono text-slate-500">HDPUV · SIAGP v1.3 · JSON v2.0 · Uso Interno / Alta Dirección · 2026-05-31</span>
      </div>
      
    </div>
  );
}
