import { useState, useEffect } from 'react'
import SeguridadPrivacidad from './SeguridadPrivacidad'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import {
  Database,
  BarChart2, Layers, Network, FileText,
  AlertTriangle, CalendarDays,
} from 'lucide-react'

// ── constants ─────────────────────────────────────────────────────────────────

const WEBHOOK  = 'https://n8n.juanobando.dev/webhook/hdpuv-datos-refresh'
const DATA_URL  = '/data/DataGobierno.json'

const clr = {
  rojo: '#ef4444', amarillo: '#f59e0b', verde: '#22c55e',
  gris: '#6b7280', azul: '#3b82f6',
  cyan: '#06b6d4', card: '#0f172a', borde: '#1e293b', bg: '#0b1829',
}

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

function TwoLineTick({ x, y, payload, cx }) {
  const words  = (payload?.value || '').split(' ')
  const mid    = Math.ceil(words.length / 2)
  const line1  = words.slice(0, mid).join(' ')
  const line2  = words.slice(mid).join(' ')
  const anchor = Math.abs(x - cx) < 10 ? 'middle' : x > cx ? 'start' : 'end'
  return (
    <text x={x} y={y} textAnchor={anchor} fill="#94a3b8" fontSize={9}>
      <tspan x={x} dy={line2 ? '-0.5em' : '0.35em'}>{line1}</tspan>
      {line2 && <tspan x={x} dy="1.2em">{line2}</tspan>}
    </text>
  )
}

function BloqueDAMA({ d, seguridad }) {
  const areas = d.mdm_gobernanza.madurez_dama.areas
  const prom  = d.mdm_gobernanza.madurez_dama.promedio_global

  const radar = areas.map(a => ({
    sujeto:      a.nombre,

    'Actual':    a.valor_actual,
    'Meta 2026': a.meta_2026,
  }))

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
          {[['Actual', clr.azul, 'none'], ['Meta 2026', clr.verde, '3 2']].map(([n, c, dash]) => (
            <div key={n} className="flex items-center gap-1">
              <svg width="12" height="4"><line x1="0" y1="2" x2="12" y2="2" stroke={c} strokeWidth="1.5" strokeDasharray={dash} /></svg>
              <span className="text-slate-400">{n}</span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radar} margin={{ top: 18, right: 28, bottom: 18, left: 28 }}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="sujeto" tick={<TwoLineTick />} />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#334155', fontSize: 6 }} tickCount={4} />
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

// ── Main export ───────────────────────────────────────────────────────────────

export default function DatosIA() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    const fromLocal = () =>
      fetch(`${DATA_URL}?t=${Date.now()}`)
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
        .then(json => {
          const arr = Array.isArray(json) ? json : [json]
          setData(arr[0])
          setUsingFallback(true)
          setLoading(false)
        })
        .catch(err => {
          console.error('Error cargando DataGobierno.json:', err)
          setLoading(false)
        })

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
      .catch(() => fromLocal())
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: '#1e3a5f', borderTopColor: clr.azul }} />
          <p className="text-xs text-slate-500">Cargando DataGobierno.json...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <p className="text-sm text-red-400">No se pudo cargar <code>data/DataGobierno.json</code></p>
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
          <span className="text-xs font-bold text-slate-200">Gobierno de Datos</span>
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

      {/* Gobierno de Datos */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 pt-1">
          <Database size={13} style={{ color: clr.azul }} />
          <h2 className="text-sm font-bold text-slate-200">Gobierno de Datos</h2>
        </div>

        {/* Executive summary strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
    </div>
  )
}
