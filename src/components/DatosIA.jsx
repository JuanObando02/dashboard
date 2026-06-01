import { useState, useEffect } from 'react'
import SeguridadPrivacidad from './SeguridadPrivacidad'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine,
  ResponsiveContainer, PieChart, Pie,
} from 'recharts'
import {
  Database, BrainCircuit, ShieldCheck, Lock,
  BarChart2, Layers, Network, FileText,
  Eye, Scale, AlertTriangle, CalendarDays,
  Timer, GitMerge,
} from 'lucide-react'

// ── constants ─────────────────────────────────────────────────────────────────

const WEBHOOK = 'https://n8n.juanobando.dev/webhook/hdpuv-datos-refresh'

const clr = {
  rojo: '#ef4444', amarillo: '#f59e0b', verde: '#22c55e',
  gris: '#6b7280', azul: '#3b82f6', violeta: '#8b5cf6',
  cyan: '#06b6d4', card: '#0f172a', borde: '#1e293b', bg: '#0b1829',
}

const FALLBACK = [{
  meta: {
    institucion: 'Hospital Departamental Psiquiátrico Universitario del Valle E.S.E.',
    documento_base: 'GD-HDPUV-01-2026 v1.0',
    generado_por: 'n8n — Google Sheets',
    fecha_generacion: '2026-05-31T22:45:25.384Z',
    periodo_reporte: '2026-05',
  },
  resumen_ejecutivo: {
    total_alertas_criticas: 18,
    madurez_promedio_actual: 1.64,
    madurez_meta_2026: 2.5,
    pct_series_conformes: 14,
  },
  calidad_datos: {
    periodo: '2026-05',
    fecha_registro: '31/05/2026',
    fuente_sistema: 'HOSVITAL-HIS',
    dimensiones: [
      { id: 'completitud', nombre: 'Completitud', valor_actual: 78, meta_2026: 95, unidad: '%', logica: 'mayor_es_mejor', estado: 'CRÍTICO' },
      { id: 'exactitud', nombre: 'Exactitud (Glosas)', valor_actual: 8.5, meta_2026: 5, unidad: '%', logica: 'menor_es_mejor', estado: 'CRÍTICO' },
      { id: 'oportunidad', nombre: 'Oportunidad HCE', valor_actual: 12, meta_2026: 8, unidad: 'horas', logica: 'menor_es_mejor', estado: 'CRÍTICO' },
      { id: 'consistencia', nombre: 'Consistencia CIE-10', valor_actual: 6.2, meta_2026: 3, unidad: '%', logica: 'menor_es_mejor', estado: 'CRÍTICO' },
      { id: 'unicidad', nombre: 'Unicidad Pacientes', valor_actual: 5.5, meta_2026: 2, unidad: '%', logica: 'menor_es_mejor', estado: 'CRÍTICO' },
      { id: 'integridad_referencial', nombre: 'Integridad Referencial', valor_actual: 2.1, meta_2026: 0, unidad: '%', logica: 'menor_es_mejor', estado: 'CRÍTICO' },
    ],
  },
  seguridad_privacidad: {
    cifrado: { aes256_activo: false, datos_criticos_cifrados_pct: 0, estado: 'CRÍTICO' },
    rbac: { incidentes: 0, estado: 'SEGURA' },
    arco: { solicitudes_mes: 3, resueltas_en_tiempo: 3, cumplimiento_pct: 100, limite_dias_habiles: 10, estado: 'CUMPLE' },
    mspi: { avance_pct: 0, meta_2028_pct: 50, estado: 'CRÍTICO' },
    data_masking_activo: false,
    violaciones_reportadas_sic: 0,
    revision_perfiles_fecha: 'Pendiente',
  },
  ciclo_vida_documental: {
    total_series: 7, conformes: 1, en_revision: 6, pct_cumplimiento: 14,
    series: [
      { id: 'S01', nombre: 'Historia Clínica (adulto)', sistema: 'HOSVITAL-HIS', retencion_años: '20', fundamento: 'Res.1995/1999 Art.15', estado: 'REVISAR' },
      { id: 'S02', nombre: 'Historia Clínica (menor de edad)', sistema: 'HOSVITAL-HIS', retencion_años: 'Mayoría edad+10', fundamento: 'Res.1995/1999', estado: 'REVISAR' },
      { id: 'S03', nombre: 'Datos de nómina y contrato', sistema: 'KACTUS-HCM', retencion_años: '10', fundamento: 'CST + UGPP', estado: 'REVISAR' },
      { id: 'S04', nombre: 'Datos financieros (RIPS/facturas)', sistema: 'HOSVITAL-HIS', retencion_años: '10', fundamento: 'E. Tributario Art.632', estado: 'REVISAR' },
      { id: 'S05', nombre: 'Auditoría y acceso a sistemas', sistema: 'HOSVITAL-HIS/KACTUS', retencion_años: '5', fundamento: 'MSPI MinTIC / Ley 1581', estado: 'REVISAR' },
      { id: 'S06', nombre: 'Datos anonimizados analítica', sistema: 'Data Warehouse', retencion_años: 'Indefinido', fundamento: 'CONPES 3975/2019', estado: 'CONFORME' },
      { id: 'S07', nombre: 'Documentos institucionales PQRSD', sistema: 'SIGDOC/SGDEA', retencion_años: '5', fundamento: 'Acuerdo 004/2019 AGN', estado: 'REVISAR' },
    ],
  },
  mdm_gobernanza: {
    unicidad_pacientes: { total_pacientes_his: 4500, duplicados_identificados: 225, pct_duplicados: 5, meta_pct_2026: 2, estado: 'CRÍTICO' },
    entidades_maestras: {
      total: 5, criticos: 3, en_revision: 2, conformes: 0,
      entidades: [
        { id: 'E01', nombre: 'Paciente (RUP)', sistema_autoritativo: 'HOSVITAL-HIS', data_owner: 'Subgerencia Científica', data_steward: 'Coord. Admisiones', meta_calidad_2026: 'Duplicados <2%', estado: 'CRÍTICO' },
        { id: 'E02', nombre: 'Colaborador', sistema_autoritativo: 'KACTUS-HCM', data_owner: 'Subgerencia Administrativa', data_steward: 'Coord. RRHH', meta_calidad_2026: 'Inconsistencias <1%', estado: 'REVISAR' },
        { id: 'E03', nombre: 'Diagnóstico CIE-10', sistema_autoritativo: 'Catálogo OPS/MinSalud', data_owner: 'Subgerencia Científica', data_steward: 'Líder Auditoría Médica', meta_calidad_2026: 'Inconsistencias <3%', estado: 'CRÍTICO' },
        { id: 'E04', nombre: 'Procedimiento CUPS', sistema_autoritativo: 'Resolución MSPS vigente', data_owner: 'Subgerencia Científica', data_steward: 'Líder Facturación', meta_calidad_2026: 'Glosas CUPS <1%', estado: 'CRÍTICO' },
        { id: 'E05', nombre: 'EPS/Aseguradora', sistema_autoritativo: 'BDUA-ADRES', data_owner: 'Subgerencia Administrativa', data_steward: 'Líder Facturación', meta_calidad_2026: 'RIPS rechazados <2%', estado: 'REVISAR' },
      ],
    },
    madurez_dama: {
      promedio_global: { lb_2025: 1.8, meta_2026: 2.5, valor_actual: 1.64, estado: 'CRÍTICO' },
      areas: [
        { id: 'A01', nombre: 'Gobierno de Datos', lb_2025: 1.5, meta_2026: 2.5, valor_actual: 1.5 },
        { id: 'A02', nombre: 'Arquitectura de Datos', lb_2025: 2, meta_2026: 2.5, valor_actual: 2 },
        { id: 'A03', nombre: 'Modelado y Diseño', lb_2025: 2, meta_2026: 2.5, valor_actual: 2 },
        { id: 'A04', nombre: 'Almacenamiento y Ops.', lb_2025: 2.5, meta_2026: 3, valor_actual: 2.5 },
        { id: 'A05', nombre: 'Seguridad de Datos', lb_2025: 2, meta_2026: 3, valor_actual: 2 },
        { id: 'A06', nombre: 'Integración e Interop.', lb_2025: 1.5, meta_2026: 2, valor_actual: 1.5 },
        { id: 'A07', nombre: 'Gestión Documental', lb_2025: 1, meta_2026: 1.5, valor_actual: 1 },
        { id: 'A08', nombre: 'Datos Maestros (MDM)', lb_2025: 1, meta_2026: 2, valor_actual: 1 },
        { id: 'A09', nombre: 'DW / BI / Analítica', lb_2025: 1.5, meta_2026: 2, valor_actual: 1.5 },
        { id: 'A10', nombre: 'Gestión de Metadatos', lb_2025: 1, meta_2026: 2, valor_actual: 1 },
        { id: 'A11', nombre: 'Calidad de Datos', lb_2025: 2, meta_2026: 3, valor_actual: 2 },
      ],
    },
  },
  interoperabilidad: {
    iniciativa: 'I-04',
    presupuesto_total_cop: 1200000000,
    ejecutado_total_cop: 0,
    pct_ejecucion: 0,
    fase_activa: 'F01',
    fases: [
      { id: 'F01', nombre: 'Fase 1 — Fundamentos', periodo: '2026', estandar: 'APIs REST internas. Inicio HL7 v2.x en admisiones', estado: 'EN CURSO', pct_avance: 0, presupuesto_cop: 400000000, sistemas: ['HOSVITAL-HIS', 'KACTUS-HCM', 'SIGDOC/SGDEA'] },
      { id: 'F02', nombre: 'Fase 2 — Interop. Institucional', periodo: '2027', estandar: 'HL7 v2.x intercambio clínico. APIs MinSalud/ADRES', estado: 'PLANIFICADO', pct_avance: 0, presupuesto_cop: 400000000, sistemas: ['HOSVITAL-HIS', 'KACTUS', 'RNEC', 'ADRES'] },
      { id: 'F03', nombre: 'Fase 3 — Interop. Avanzada', periodo: '2028-2029', estandar: 'FHIR R4. Servicios Ciudadanos Digitales MinTIC', estado: 'PLANIFICADO', pct_avance: 0, presupuesto_cop: 400000000, sistemas: ['Aseguradoras EPS', 'MSPS', 'Plataforma Estado'] },
    ],
  },
}]

// ── helpers ───────────────────────────────────────────────────────────────────

function semColor(estado) {
  const e = (estado || '').toUpperCase()
  if (['CRÍT', 'CRIT', 'NO ACTIVO', 'NO INIC'].some(x => e.includes(x))) return clr.rojo
  if (['REVIS'].some(x => e.includes(x))) return clr.amarillo
  if (['CONFORME', 'CUMPLE', 'SEGURA'].some(x => e.includes(x))) return clr.verde
  if (['EN CURSO', 'EN PROGR'].some(x => e.includes(x))) return clr.azul
  return clr.gris
}

function fmtCOP(n) {
  return `$${(n / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 0 })}M`
}

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return iso }
}

// ── micro-components ──────────────────────────────────────────────────────────

function Sbadge({ label, color }) {
  const c = color || semColor(label)
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}>
      {label}
    </span>
  )
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
  )
}

function DarkTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{ background: '#1e2d45', border: '1px solid #334155' }}>
      {label && <p className="text-slate-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color || clr.azul }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ── Block 1: Madurez DAMA-DMBOK2 ─────────────────────────────────────────────

function BloqueDAMA({ d, seguridad }) {
  const areas = d.mdm_gobernanza.madurez_dama.areas
  const prom  = d.mdm_gobernanza.madurez_dama.promedio_global

  const radar = areas.map(a => ({
    sujeto:      a.nombre.length > 16 ? a.nombre.slice(0, 15) + '…' : a.nombre,
    'LB 2025':   a.lb_2025,
    'Actual':    a.valor_actual,
    'Meta 2026': a.meta_2026,
  }))

  // Horizontal bar data: valor_actual vs meta_2026 por área
  const bars = areas.map(a => ({
    nombre:    a.nombre,
    actual:    a.valor_actual,
    meta:      a.meta_2026,
    color:     a.valor_actual < 1.5 ? clr.rojo : a.valor_actual < 2.5 ? clr.amarillo : clr.verde,
  }))

  const BarTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg px-3 py-2 text-xs shadow-xl" style={{ background: '#1e2d45', border: '1px solid #334155' }}>
        <p className="text-slate-300 font-bold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">

      {/* Card izquierda — Radar */}
      <Block title="Madurez DAMA-DMBOK2" icon={Layers} accent={clr.violeta}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tabular-nums" style={{ color: clr.rojo }}>
              {prom.valor_actual.toFixed(2)}
            </span>
            <span className="text-slate-500 text-xs">/ 5</span>
          </div>
          <Sbadge label={prom.estado} />
        </div>

        <div className="flex gap-3 mb-1 text-[9px] justify-center flex-wrap">
          {[['LB 2025', '#64748b', '4 3'], ['Actual', clr.azul, 'none'], ['Meta 2026', clr.verde, '3 2']].map(([n, c, dash]) => (
            <div key={n} className="flex items-center gap-1">
              <svg width="12" height="4"><line x1="0" y1="2" x2="12" y2="2" stroke={c} strokeWidth="1.5" strokeDasharray={dash} /></svg>
              <span className="text-slate-400">{n}</span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radar} margin={{ top: 10, right: 16, bottom: 10, left: 16 }}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="sujeto" tick={{ fill: '#94a3b8', fontSize: 7 }} />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#334155', fontSize: 6 }} tickCount={4} />
            <Radar name="LB 2025"   dataKey="LB 2025"   stroke="#64748b" fill="#64748b" fillOpacity={0.07} strokeWidth={1.5} strokeDasharray="4 3" />
            <Radar name="Actual"    dataKey="Actual"    stroke={clr.azul}  fill={clr.azul}  fillOpacity={0.2}  strokeWidth={2}   dot={{ r: 2, fill: clr.azul }} />
            <Radar name="Meta 2026" dataKey="Meta 2026" stroke={clr.verde} fill={clr.verde} fillOpacity={0.07} strokeWidth={1.5} strokeDasharray="3 2" />
            <Tooltip content={<DarkTip />} />
          </RadarChart>
        </ResponsiveContainer>
      </Block>

      {/* Card derecha — Seguridad y Privacidad */}
      <SeguridadPrivacidad data={seguridad} />

    </div>
  )
}

// ── Block 2: Calidad de Datos ─────────────────────────────────────────────────

function BloqueCalidad({ d }) {
  const dims = d.calidad_datos.dimensiones

  const chartData = dims.map(dim => {
    let cumpl
    if (dim.logica === 'mayor_es_mejor') {
      cumpl = Math.round(Math.min((dim.valor_actual / dim.meta_2026) * 100, 105))
    } else if (dim.meta_2026 === 0) {
      cumpl = dim.valor_actual === 0 ? 100 : 2
    } else {
      cumpl = Math.round(Math.min((dim.meta_2026 / dim.valor_actual) * 100, 105))
    }
    return { nombre: dim.nombre, cumpl, valor: dim.valor_actual, meta: dim.meta_2026, unidad: dim.unidad, estado: dim.estado, logica: dim.logica }
  })

  const CustomTip = ({ active, payload, label }) => {
    if (!active || !payload?.[0]) return null
    const item = chartData.find(x => x.nombre === label)
    return (
      <div className="rounded-lg px-3 py-2 text-xs shadow-xl" style={{ background: '#1e2d45', border: '1px solid #334155' }}>
        <p className="text-white font-bold mb-1">{label}</p>
        <p style={{ color: item?.estado === 'CRÍTICO' ? clr.rojo : clr.verde }}>
          Actual: {item?.valor} {item?.unidad}
        </p>
        <p className="text-blue-300">Meta 2026: {item?.meta} {item?.unidad}</p>
        <p className="text-slate-500 mt-1 text-[9px]">{item?.logica === 'menor_es_mejor' ? '↓ menor es mejor' : '↑ mayor es mejor'}</p>
      </div>
    )
  }

  return (
    <Block title="Calidad de Datos — 6 Dimensiones" icon={BarChart2} accent={clr.azul}>
      <p className="text-[10px] text-slate-500 mb-3">
        {d.calidad_datos.fuente_sistema} · {d.calidad_datos.fecha_registro} · % cumplimiento vs meta 2026
      </p>
      <ResponsiveContainer width="100%" height={235}>
        <BarChart layout="vertical" data={chartData} margin={{ top: 4, right: 28, bottom: 4, left: 0 }}>
          <XAxis type="number" domain={[0, 110]} tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="nombre" width={155} tick={{ fill: '#94a3b8', fontSize: 9 }} />
          <Tooltip content={<CustomTip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine x={100} stroke="#60a5fa" strokeDasharray="4 3" strokeWidth={1.5}
            label={{ value: 'Meta', fill: '#60a5fa', fontSize: 9, position: 'insideTopRight' }} />
          <Bar dataKey="cumpl" name="Cumplimiento" barSize={10} radius={[0, 3, 3, 0]}>
            {chartData.map((item, i) => (
              <Cell key={i} fill={item.estado === 'CRÍTICO' ? clr.rojo : clr.verde} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Block>
  )
}

// ── Block 3: Seguridad y Privacidad ──────────────────────────────────────────

// ── Block 4: Ciclo de Vida Documental ────────────────────────────────────────

function BloqueCiclo({ d }) {
  const ciclo = d.ciclo_vida_documental
  return (
    <Block title="Ciclo de Vida Documental" icon={FileText} accent={clr.cyan}>
      <div className="flex items-center gap-4 mb-3 text-[10px]">
        <span className="text-slate-400">{ciclo.total_series} series</span>
        <span style={{ color: clr.verde }}>{ciclo.conformes} conformes</span>
        <span style={{ color: clr.amarillo }}>{ciclo.en_revision} en revisión</span>
        <span className="ml-auto font-bold tabular-nums" style={{ color: clr.rojo }}>{ciclo.pct_cumplimiento}% cumplimiento</span>
      </div>

      <div className="space-y-0">
        {ciclo.series.map((s, i) => {
          const col = s.estado === 'CONFORME' ? clr.verde : s.estado === 'REVISAR' ? clr.amarillo : clr.rojo
          return (
            <div key={s.id}
              className="flex items-start gap-2.5 py-2"
              style={{ borderBottom: i < ciclo.series.length - 1 ? `1px solid ${clr.borde}` : 'none' }}>
              <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: col }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-slate-200 truncate">{s.nombre}</p>
                  <Sbadge label={s.estado} color={col} />
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  {s.sistema} · Retención: {s.retencion_años} años · {s.fundamento}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Block>
  )
}

// ── Block 5: MDM Entidades Maestras ──────────────────────────────────────────

function BloqueMDM({ d }) {
  const mdm = d.mdm_gobernanza.entidades_maestras
  const uniq = d.mdm_gobernanza.unicidad_pacientes

  return (
    <Block title="MDM — Entidades Maestras" icon={Database} accent={clr.azul}>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-3 text-[10px]">
        <span style={{ color: clr.rojo }}>{mdm.criticos} críticos</span>
        <span style={{ color: clr.amarillo }}>{mdm.en_revision} en revisión</span>
        <span style={{ color: clr.verde }}>{mdm.conformes} conformes</span>
        <span className="ml-auto text-slate-500">
          Unicidad: <span style={{ color: clr.rojo }} className="font-bold">{uniq.pct_duplicados}%</span> duplicados
          <span className="text-slate-600"> (meta {uniq.meta_pct_2026}%)</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${clr.borde}` }}>
              {['Entidad', 'Sistema', 'Data Owner', 'Meta 2026', 'Estado'].map(h => (
                <th key={h} className="text-left pb-1.5 pr-3 text-slate-500 font-semibold uppercase tracking-wider text-[8px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mdm.entidades.map((e, i) => (
              <tr key={e.id}
                style={{ borderBottom: i < mdm.entidades.length - 1 ? `1px solid ${clr.borde}` : 'none' }}
                className="hover:bg-white/[0.02]">
                <td className="py-2 pr-3 text-[10px] text-slate-200 font-medium">{e.nombre}</td>
                <td className="py-2 pr-3 text-[9px] text-slate-400 font-mono">{e.sistema_autoritativo.split('-')[0].split('/')[0]}</td>
                <td className="py-2 pr-3 text-[9px] text-slate-400">{e.data_owner.replace('Subgerencia ', 'Sbg. ')}</td>
                <td className="py-2 pr-3 text-[9px] text-slate-500">{e.meta_calidad_2026}</td>
                <td className="py-2"><Sbadge label={e.estado} color={semColor(e.estado)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Block>
  )
}

// ── Block 6: Interoperabilidad ────────────────────────────────────────────────

function BloqueInterop({ d }) {
  const interop = d.interoperabilidad

  return (
    <Block title={`Interoperabilidad — ${interop.iniciativa}`} icon={Network} accent={clr.cyan}>
      {/* Budget bar */}
      <div className="rounded-lg p-3 border mb-4" style={{ background: clr.bg, borderColor: clr.borde }}>
        <div className="flex items-center justify-between text-[10px] mb-1.5">
          <span className="text-slate-400">Presupuesto total I-04</span>
          <span className="text-slate-200 font-bold tabular-nums">{fmtCOP(interop.presupuesto_total_cop)} COP</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
          <div className="h-full rounded-full"
            style={{ width: `${Math.max(interop.pct_ejecucion, 1.5)}%`, background: interop.pct_ejecucion === 0 ? clr.gris : clr.azul }} />
        </div>
        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
          <span>Ejecutado: {fmtCOP(interop.ejecutado_total_cop)} ({interop.pct_ejecucion}%)</span>
          <span>Pendiente: {fmtCOP(interop.presupuesto_total_cop - interop.ejecutado_total_cop)}</span>
        </div>
      </div>

      {/* Phase timeline */}
      <div className="space-y-2">
        {interop.fases.map((fase, idx) => {
          const col = fase.estado === 'EN CURSO' ? clr.azul : fase.estado === 'PLANIFICADO' ? clr.gris : clr.verde
          const isActive = fase.id === interop.fase_activa
          return (
            <div key={fase.id} className="flex gap-3">
              {/* Step indicator */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: `${col}18`, border: `2px solid ${col}`, color: col }}>
                  {idx + 1}
                </div>
                {idx < interop.fases.length - 1 && (
                  <div className="w-px mt-1 flex-1" style={{ background: clr.borde, minHeight: 12 }} />
                )}
              </div>

              {/* Phase card */}
              <div className="flex-1 min-w-0 rounded-lg p-2.5 border mb-1"
                style={{ background: isActive ? `${col}08` : clr.bg, borderColor: isActive ? `${col}30` : clr.borde }}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[11px] font-bold text-slate-200 truncate">{fase.nombre}</p>
                  <Sbadge label={fase.estado} color={col} />
                </div>
                <p className="text-[9px] text-slate-500 mb-1.5">{fase.periodo} · {fase.estandar}</p>
                <div className="flex flex-wrap gap-1">
                  {fase.sistemas.map(s => (
                    <span key={s} className="text-[8px] px-1.5 py-0.5 rounded"
                      style={{ background: '#1e293b', color: '#64748b' }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Block>
  )
}

// ── Right column: Gobierno de IA ─────────────────────────────────────────────

const SIAGP = [
  {
    id: 'M01', nombre: 'Motor de Series de Tiempo', icon: Timer, color: clr.violeta,
    descripcion: 'Predicción de ocupación hospitalaria para las 266 camas. Anticipa picos de demanda y optimiza la asignación de recursos clínicos en tiempo real.',
    kpi: 'RMSE < 5 camas · Horizonte 7 días',
  },
  {
    id: 'M02', nombre: 'Process Mining', icon: GitMerge, color: clr.cyan,
    descripcion: 'Descubrimiento y análisis de cuellos de botella en flujos clínicos y procesos PQRSD. Identifica variantes y realiza conformance checking contra el proceso estándar.',
    kpi: 'Reducción tiempos de atención > 15%',
  },
  {
    id: 'M03', nombre: 'Módulo FURAG', icon: Scale, color: clr.amarillo,
    descripcion: 'Automatización del reporte de valor público para el sistema FURAG del DAFP. Consolidación de evidencias y generación automática de informes de gestión.',
    kpi: 'Formulario FURAG precargado ≥ 80%',
  },
]

function GobiernoIA() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border p-4" style={{ background: clr.card, borderColor: clr.borde }}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg shrink-0"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <BrainCircuit size={18} style={{ color: clr.violeta }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white">Gobierno de IA</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Hub de Valor Público — SIAGP</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
            style={{ background: 'rgba(234,179,8,0.12)', color: clr.amarillo, border: '1px solid rgba(234,179,8,0.3)' }}>
            En construcción
          </span>
        </div>
        <div className="mt-3 px-3 py-2 rounded-lg text-[10px] text-slate-400 leading-relaxed"
          style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
          Documento v1.3 pendiente · Marco ético y metodológico en elaboración — requiere aprobación del Comité de Ética e Investigación del HDPUV
        </div>
      </div>

      {/* Module cards */}
      {SIAGP.map(mod => (
        <div key={mod.id} className="rounded-xl border p-4" style={{ background: clr.card, borderColor: clr.borde }}>
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg shrink-0 mt-0.5"
              style={{ background: `${mod.color}15`, border: `1px solid ${mod.color}30` }}>
              <mod.icon size={14} style={{ color: mod.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-xs font-bold text-slate-200">{mod.nombre}</p>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: 'rgba(107,114,128,0.15)', color: clr.gris, border: '1px solid rgba(107,114,128,0.3)' }}>
                  NO INICIADO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">{mod.descripcion}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px]"
            style={{ background: `${mod.color}0a`, border: `1px solid ${mod.color}20` }}>
            <span className="text-slate-500 shrink-0">KPI de éxito:</span>
            <span style={{ color: mod.color }} className="font-semibold">{mod.kpi}</span>
          </div>
        </div>
      ))}

      {/* Principles placeholder */}
      <div className="rounded-xl border p-4" style={{ background: clr.card, borderColor: clr.borde }}>
        <div className="flex items-center gap-2 mb-3">
          <Eye size={12} style={{ color: '#94a3b8' }} />
          <p className="text-[11px] font-bold text-slate-300">Principios de Gobierno IA</p>
        </div>
        {['Transparencia algorítmica', 'Equidad y no discriminación', 'Supervisión humana', 'Privacidad by design', 'Trazabilidad de decisiones'].map((p, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 text-[10px]"
            style={{ borderBottom: i < 4 ? `1px solid ${clr.borde}` : 'none' }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#334155' }} />
            <span className="text-slate-400 flex-1">{p}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(107,114,128,0.12)', color: clr.gris }}>Pendiente</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function DatosIA() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'dashboard' }),
    })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
      .then(json => {
        const arr = Array.isArray(json) ? json : [json]
        setData(arr[0])
        setLoading(false)
      })
      .catch(() => {
        setData(FALLBACK[0])
        setUsingFallback(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: '#1e3a5f', borderTopColor: clr.azul }} />
          <p className="text-xs text-slate-500">Cargando datos de gobierno...</p>
        </div>
      </div>
    )
  }

  const d = data
  const resumen = d.resumen_ejecutivo

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 rounded-xl px-4 py-3 border"
        style={{ background: clr.card, borderColor: clr.borde }}>
        <div className="flex items-center gap-3 flex-wrap">
          <Database size={14} style={{ color: clr.azul }} />
          <span className="text-xs font-bold text-slate-200">Gobierno de Datos e IA</span>
          <span className="text-[10px] text-slate-500">Doc. {d.meta.documento_base}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-500 flex-wrap">
          {usingFallback && (
            <span className="flex items-center gap-1" style={{ color: clr.amarillo }}>
              <AlertTriangle size={10} />
              Datos locales (webhook no disponible)
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarDays size={10} />
            Periodo: <strong className="text-slate-300 ml-1">{d.meta.periodo_reporte}</strong>
          </span>
          <span>Generado: <strong className="text-slate-300">{fmtDate(d.meta.fecha_generacion)}</strong></span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* ── Left: Gobierno de Datos ── */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pt-1">
            <Database size={13} style={{ color: clr.azul }} />
            <h2 className="text-sm font-bold text-slate-200">Gobierno de Datos</h2>
          </div>

          {/* Executive summary strip */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Alertas Críticas', value: resumen.total_alertas_criticas, color: clr.rojo, suffix: '' },
              { label: 'Madurez Actual', value: resumen.madurez_promedio_actual.toFixed(2), color: clr.rojo, suffix: ' / 5' },
              { label: 'Meta Madurez 2026', value: resumen.madurez_meta_2026, color: clr.amarillo, suffix: ' / 5' },
              { label: 'Series Conformes', value: `${resumen.pct_series_conformes}%`, color: clr.rojo, suffix: '' },
            ].map(({ label, value, color, suffix }) => (
              <div key={label} className="rounded-xl p-3 border flex items-center gap-3"
                style={{ background: `${color}06`, borderColor: `${color}20` }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">{label}</p>
                  <p className="text-lg font-bold tabular-nums leading-tight" style={{ color }}>
                    {value}<span className="text-xs text-slate-500 font-normal">{suffix}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <BloqueDAMA d={d} seguridad={d.seguridad_privacidad} />
          <BloqueCalidad d={d} />
          <BloqueCiclo d={d} />
          <BloqueMDM d={d} />
          <BloqueInterop d={d} />
        </div>

        {/* ── Right: Gobierno de IA ── */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pt-1">
            <BrainCircuit size={13} style={{ color: clr.violeta }} />
            <h2 className="text-sm font-bold text-slate-200">Gobierno de IA</h2>
          </div>
          <GobiernoIA />
        </div>
      </div>
    </div>
  )
}
