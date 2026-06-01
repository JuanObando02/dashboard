import { useState, useEffect } from 'react'
import SeguridadPrivacidad from '../seguridad/SeguridadPrivacidad'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine,
  ResponsiveContainer, PieChart, Pie,
} from 'recharts'
import {
  Database, Users,
  BarChart2, Network, FileText,
  AlertTriangle, CalendarDays, CheckCircle2, XCircle,
} from 'lucide-react'

// ── constants ─────────────────────────────────────────────────────────────────

const WEBHOOK  = 'https://n8n.juanobando.dev/webhook/hdpuv-datos-refresh'
const DATA_URL  = '/data/DataGobierno.json'

const clr = {
  rojo: '#ef4444', amarillo: '#f59e0b', verde: '#22c55e',
  gris: '#6b7280', azul: '#3b82f6',
  cyan: '#06b6d4', violeta: '#8b5cf6', card: '#0f172a', borde: '#1e293b', bg: '#0b1829',
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

function sysColor(sistema) {
  const s = (sistema || '').toUpperCase()
  if (s.includes('HOSVITAL') || s.includes('HIS'))
    return { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: 'rgba(59,130,246,0.3)' }
  if (s.includes('KACTUS') || s.includes('HCM'))
    return { bg: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: 'rgba(139,92,246,0.3)' }
  if (s.includes('WAREHOUSE') || s.includes('DATA W') || s.includes('DW'))
    return { bg: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)' }
  if (s.includes('SIGDOC') || s.includes('SGDEA'))
    return { bg: 'rgba(6,182,212,0.15)', color: '#67e8f9', border: 'rgba(6,182,212,0.3)' }
  if (s.includes('BDUA') || s.includes('ADRES') || s.includes('CAT') || s.includes('OPS'))
    return { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' }
  if (s.includes('RESOL') || s.includes('MSPS') || s.includes('MINSALUD'))
    return { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)' }
  return { bg: 'rgba(107,114,128,0.15)', color: '#94a3b8', border: 'rgba(107,114,128,0.3)' }
}

function SysChip({ nombre }) {
  const { bg, color, border } = sysColor(nombre)
  return (
    <span className="inline-block text-[11px] font-mono px-1.5 py-0.5 rounded truncate max-w-[120px] shrink-0"
      title={nombre}
      style={{ background: bg, color, border: `1px solid ${border}` }}>
      {nombre}
    </span>
  )
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
    <span className="text-[12px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}>
      {label}
    </span>
  )
}

function Block({ title, icon: Icon, accent = clr.azul, headerRight, children }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: clr.card, borderColor: clr.borde }}>
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: clr.borde, background: `${accent}08` }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg shrink-0"
            style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
            <Icon size={13} style={{ color: accent }} />
          </div>
          <h3 className="text-xs font-bold text-white truncate">{title}</h3>
        </div>
        {headerRight}
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
    <text x={x} y={y} textAnchor={anchor} fill="#94a3b8" fontSize={12}>
      <tspan x={x} dy={line2 ? '-0.5em' : '0.35em'}>{line1}</tspan>
      {line2 && <tspan x={x} dy="1.2em">{line2}</tspan>}
    </text>
  )
}

function MiniOperationalGauge({ title, val, target, unit, lowerIsBetter }) {
  const cx = 55, cy = 50, R = 40, sw = 10
  
  let displayPct = 0
  if (unit === '%') {
    displayPct = val
  } else {
    displayPct = Math.min(100, (val / (target * 1.5)) * 100)
  }
  
  const clamped  = Math.min(100, Math.max(0, displayPct))
  const angleDeg = 180 - clamped * 1.8
  const rad      = (angleDeg * Math.PI) / 180
  const ex       = cx + R * Math.cos(rad)
  const ey       = cy - R * Math.sin(rad)

  const isCompliant = lowerIsBetter ? val <= target : val >= target
  const statusColor = isCompliant ? clr.verde : clr.rojo

  return (
    <div className="rounded-lg p-2 border flex flex-col items-center justify-between"
      style={{ background: '#0b1829', borderColor: clr.borde }}>
      <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1 text-center truncate w-full">{title}</p>
      
      <div className="relative w-24 h-16 shrink-0">
        <svg viewBox="0 0 110 76" className="w-full h-full block">
          {/* Track */}
          <path d={`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${cx+R} ${cy}`}
                fill="none" stroke="#1e293b" strokeWidth={sw} strokeLinecap="round" />
          {/* Value */}
          {clamped > 0 && (
            <path d={`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${ex} ${ey}`}
                  fill="none" stroke={statusColor} strokeWidth={sw} strokeLinecap="round" />
          )}
          {/* Labels */}
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="21" fontWeight="800"
                fill="white" fontFamily="Inter,sans-serif">{val}{unit}</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#64748b"
                fontFamily="Inter,sans-serif" fontWeight="600" letterSpacing="0.08em">META: {target}{unit}</text>
        </svg>
      </div>

      <div className="flex items-center gap-1 mt-1 text-[11px]" style={{ color: statusColor }}>
        <span className="w-1 h-1 rounded-full" style={{ background: statusColor }} />
        <span className="font-bold uppercase tracking-wide text-[11px]">
          {isCompliant ? 'OK' : 'CRIT'}
        </span>
      </div>
    </div>
  )
}

const METAS = [
  { key: 'meta_2026', label: 'Meta 2026', color: clr.verde },
  { key: 'meta_2027', label: 'Meta 2027', color: clr.amarillo },
  { key: 'meta_2029', label: 'Meta 2029', color: clr.violeta },
]

function BloqueDAMA({ d, seguridad, resumen }) {
  const [damaTab,       setDamaTab]       = useState('radar')
  const [selectedMeta,  setSelectedMeta]  = useState('meta_2026')
  const [hoveredSegment, setHoveredSegment] = useState(null)

  const areas = d.mdm_gobernanza.madurez_dama.areas
  const prom  = d.mdm_gobernanza.madurez_dama.promedio_global

  const metaCfg = METAS.find(m => m.key === selectedMeta)

  const radar = areas.map(a => ({
    sujeto:   a.nombre,
    'Actual': a.valor_actual,
    [metaCfg.label]: a[selectedMeta],
  }))

  const ENTIDADES_DATA = d.mdm_gobernanza.entidades_maestras.entidades.map(e => ({
    id: e.nombre,
    nombre: e.nombre,
    estado: e.estado,
    problema: e.problema_actual,
  }))

  const uniq = d.mdm_gobernanza.unicidad_pacientes
  const unicidadData = [
    { name: 'Pacientes Únicos',    value: uniq.total_pacientes_his - uniq.duplicados_identificados, color: clr.verde },
    { name: 'Registros Duplicados', value: uniq.duplicados_identificados,                            color: clr.rojo  },
  ]
  const unicidadTotal = uniq.total_pacientes_his

  return (
    <div className="grid grid-cols-2 gap-4">

      {/* Columna izquierda: Resumen e Indicador Radar */}
      <div className="space-y-3">
        {/* Executive summary strip unificado al ancho del radar */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Alertas Críticas */}
          <div className="rounded-xl p-2.5 border flex items-center gap-2"
            style={{ background: `${clr.rojo}06`, borderColor: `${clr.rojo}20` }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: clr.rojo }} />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 truncate">Alertas Críticas</p>
              <p className="text-base font-bold tabular-nums leading-tight" style={{ color: clr.rojo }}>
                {resumen.total_alertas_criticas}
              </p>
            </div>
          </div>

          {/* Card 2: Madurez DAMA */}
          <div className="rounded-xl p-2.5 border flex items-center gap-2"
            style={{ background: `${clr.azul}06`, borderColor: `${clr.azul}20` }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: clr.azul }} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 truncate">Madurez DAMA</p>
              <p className="text-base font-bold tabular-nums text-white leading-tight mt-0.5">
                {resumen.madurez_promedio_actual.toFixed(2)}
                <span className="text-[12px] text-slate-500 font-normal"> / 5</span>
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: clr.amarillo }}>
                Meta: {resumen.madurez_meta_2026.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Card 3: Series Conformes */}
          <div className="rounded-xl p-2.5 border flex items-center gap-2"
            style={{ background: `${clr.verde}06`, borderColor: `${clr.verde}20` }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: clr.verde }} />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 truncate">Series Conformes</p>
              <p className="text-base font-bold tabular-nums leading-tight" style={{ color: clr.verde }}>
                {resumen.pct_series_conformes}%
              </p>
            </div>
          </div>
        </div>

        {/* Card izquierda — Radar */}
        <Block
          title={damaTab === 'radar' ? "Madurez DAMA-DMBOK2" : "Panel Operativo de Calidad"}
          icon={damaTab === 'radar' ? BarChart2 : Database}
          accent={clr.violeta}
          headerRight={
            <div className="flex items-center gap-1 p-0.5 rounded-md bg-[#0b1829] border border-[#1e293b] shrink-0">
              <button
                onClick={() => setDamaTab('radar')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                  damaTab === 'radar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Radar DAMA
              </button>
              <button
                onClick={() => setDamaTab('operativo')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                  damaTab === 'operativo' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Operativo
              </button>
            </div>
          }
        >
          {damaTab === 'radar' ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold tabular-nums" style={{ color: clr.rojo }}>
                    {prom.valor_actual.toFixed(2)}
                  </span>
                  <span className="text-slate-500 text-xs">/ 5</span>
                </div>
                <Sbadge label={prom.estado} />
              </div>

              {/* Selector de meta */}
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mr-1">Meta:</span>
                {METAS.map(m => (
                  <button
                    key={m.key}
                    onClick={() => setSelectedMeta(m.key)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold transition-all"
                    style={{
                      borderColor: selectedMeta === m.key ? m.color : '#1e293b',
                      background:  selectedMeta === m.key ? `${m.color}18` : 'transparent',
                      color:       selectedMeta === m.key ? m.color : '#64748b',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: selectedMeta === m.key ? m.color : '#334155' }} />
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mb-1 text-[11px] justify-center flex-wrap">
                {[['Actual', clr.azul, 'none'], [metaCfg.label, metaCfg.color, '3 2']].map(([n, c, dash]) => (
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
                  <Radar name="Actual"        dataKey="Actual"        stroke={clr.azul}    fill={clr.azul}      fillOpacity={0.2}  strokeWidth={2}   dot={{ r: 2, fill: clr.azul }} />
                  <Radar name={metaCfg.label} dataKey={metaCfg.label} stroke={metaCfg.color} fill={metaCfg.color} fillOpacity={0.07} strokeWidth={1.5} strokeDasharray="3 2" />
                  <Tooltip content={<DarkTip />} />
                </RadarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="space-y-4" style={{ minHeight: 334 }}>
              {/* Gauges */}
              {(() => {
                const dims = d.calidad_datos.dimensiones
                const comp = dims.find(x => x.id === 'completitud')
                const exac = dims.find(x => x.id === 'exactitud')
                const opor = dims.find(x => x.id === 'oportunidad')
                return (
                  <div className="grid grid-cols-3 gap-2">
                    <MiniOperationalGauge title={comp.nombre}  val={comp.valor_actual} target={comp.meta_2026} unit="%" lowerIsBetter={false} />
                    <MiniOperationalGauge title={exac.nombre}  val={exac.valor_actual} target={exac.meta_2026} unit="%" lowerIsBetter={true}  />
                    <MiniOperationalGauge title={opor.nombre}  val={opor.valor_actual} target={opor.meta_2026} unit="h"  lowerIsBetter={true}  />
                  </div>
                )
              })()}

              {/* Table & Donut */}
              <div className="grid grid-cols-1 md:grid-cols-[1.8fr_0.8fr] gap-3 pt-2.5 border-t border-[#1e293b]">
                {/* Tabla */}
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Entidades Maestras</p>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#1e293b]">
                        <th className="pb-1 text-slate-500 font-semibold uppercase tracking-wider text-[11px] pr-1 w-[110px]">Entidad</th>
                        <th className="pb-1 text-slate-500 font-semibold uppercase tracking-wider text-[11px] text-center pr-1">Estado</th>
                        <th className="pb-1 text-slate-500 font-semibold uppercase tracking-wider text-[11px] pr-1">Problema</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ENTIDADES_DATA.map((e, idx) => (
                        <tr key={e.id} style={{ borderBottom: idx < ENTIDADES_DATA.length - 1 ? '1px solid #1e293b' : 'none' }}>
                          <td className="py-1.5 text-[11px] text-slate-200 font-semibold pr-1 truncate max-w-[110px] w-[110px]" title={e.nombre}>{e.id}</td>
                          <td className="py-1.5 text-center pr-1">
                            {(() => {
                              const s = e.estado
                              const c = s === 'CRÍTICO' ? clr.rojo : s === 'EN REVISIÓN' ? clr.amarillo : clr.verde
                              const label = s === 'CRÍTICO' ? 'CRIT' : s === 'EN REVISIÓN' ? 'REV' : 'OK'
                              return (
                                <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full"
                                  style={{ background: `${c}1e`, color: c, border: `1px solid ${c}40` }}>
                                  {label}
                                </span>
                              )
                            })()}
                          </td>
                          <td className="py-1.5 text-[12px] text-slate-400 pr-1 truncate max-w-[150px]" title={e.problema}>{e.problema}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Donut */}
                <div className="flex flex-col items-center border-l border-[#1e293b] pl-2 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Unicidad Censo</p>
                    <div className="relative group">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-600 text-slate-500 text-[9px] font-bold flex items-center justify-center cursor-default select-none hover:border-slate-400 hover:text-slate-300 transition-colors">i</span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[9999] hidden group-hover:block w-48 rounded-lg px-2.5 py-2 text-[11px] text-slate-300 leading-snug shadow-2xl"
                        style={{ background: '#1e2d45', border: '1px solid #334155' }}>
                        Mide el porcentaje de registros de pacientes sin duplicidad en el sistema HIS. Un alto % de duplicados afecta la calidad clínica y operativa.
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: '#334155' }} />
                      </div>
                    </div>
                  </div>
                  <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={unicidadData}
                          cx="50%"
                          cy="50%"
                          innerRadius={32}
                          outerRadius={50}
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                          strokeWidth={0}
                          onMouseEnter={(data) => setHoveredSegment(data)}
                          onMouseLeave={() => setHoveredSegment(null)}
                        >
                          {unicidadData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      {hoveredSegment ? (
                        <>
                          <span className="text-[13px] font-bold leading-none tabular-nums" style={{ color: hoveredSegment.color }}>{hoveredSegment.value.toLocaleString()}</span>
                          <span className="text-[11px] font-semibold tabular-nums mt-0.5" style={{ color: hoveredSegment.color }}>{((hoveredSegment.value / unicidadTotal) * 100).toFixed(1)}%</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[12px] font-bold text-white leading-none">{unicidadTotal >= 1000 ? `${(unicidadTotal / 1000).toFixed(1)}K` : unicidadTotal}</span>
                          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Regs</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-full mt-1.5 space-y-1">
                    {unicidadData.map(u => {
                      const pctVal = ((u.value / unicidadTotal) * 100).toFixed(0)
                      return (
                        <div key={u.name} className="flex items-center justify-between text-[12px] px-1 py-0.5 rounded border border-[#1e293b]"
                          style={{ background: '#0b1829' }}>
                          <span className="text-slate-400 truncate max-w-[70px]">{u.name.split(' ')[1] || u.name}</span>
                          <span className="font-bold text-white tabular-nums">{pctVal}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Block>
      </div>

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
        <p className="text-slate-500 mt-1 text-[11px]">{item?.logica === 'menor_es_mejor' ? '↓ menor es mejor' : '↑ mayor es mejor'}</p>
      </div>
    )
  }

  return (
    <Block title="Calidad de Datos — 6 Dimensiones" icon={BarChart2} accent={clr.azul}>
      <p className="text-[12px] text-slate-500 mb-3">
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

function BoolBadge({ label, active }) {
  const color = active ? clr.verde : clr.rojo
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      {label}: {active ? 'ACTIVO' : 'INACTIVO'}
    </span>
  )
}

function BloqueCiclo({ d }) {
  const ciclo = d.ciclo_vida_documental
  return (
    <Block title="Ciclo de Vida Documental" icon={FileText} accent={clr.cyan}>
      <div className="flex items-center gap-4 mb-3 text-[12px]">
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
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-200 truncate" title={s.nombre}>{s.nombre}</p>
                  <Sbadge label={s.estado} color={col} />
                </div>
                <div className="flex items-center gap-1 mt-0.5 min-w-0">
                  <SysChip nombre={s.sistema} />
                  <span className="text-[11px] text-slate-600 shrink-0">· Ret: {s.retencion_años}a ·</span>
                  <span className="text-[11px] text-slate-500 truncate" title={s.fundamento}>{s.fundamento}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <BoolBadge label="Trigger bloqueo" active={s.trigger_bloqueo_activo} />
                  <BoolBadge label="Almac. frío" active={s.almacenamiento_frio_activo} />
                </div>
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
  const dupColor = uniq.pct_duplicados > uniq.meta_pct_2026 ? clr.rojo : clr.verde

  return (
    <Block title="MDM — Entidades Maestras" icon={Database} accent={clr.azul}>

      {/* Unicidad — 2 mini-cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg p-3 border flex items-center gap-2.5"
          style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.2)' }}>
          <Users size={14} style={{ color: '#93c5fd' }} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Censo Pacientes</p>
            <p className="text-lg font-bold tabular-nums text-white leading-tight">
              {uniq.total_pacientes_his.toLocaleString('es-CO')}
            </p>
          </div>
        </div>
        <div className="rounded-lg p-3 border flex items-center gap-2.5"
          style={{ background: `${dupColor}08`, borderColor: `${dupColor}25` }}>
          <AlertTriangle size={14} style={{ color: dupColor }} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Tasa Duplicidad</p>
            <p className="text-lg font-bold tabular-nums leading-tight" style={{ color: dupColor }}>
              {uniq.pct_duplicados}%
              <span className="text-[11px] font-normal text-slate-500 ml-1">meta {uniq.meta_pct_2026}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Semáforo resumen */}
      <div className="flex items-center gap-4 mb-3 text-[12px]">
        <span style={{ color: clr.rojo }}>{mdm.criticos} críticos</span>
        <span style={{ color: clr.amarillo }}>{mdm.en_revision} en revisión</span>
        <span style={{ color: clr.verde }}>{mdm.conformes} conformes</span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${clr.borde}` }}>
              <th className="text-left pb-1.5 pr-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Entidad</th>
              <th className="text-left pb-1.5 pr-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Sistema</th>
              <th className="text-center pb-1.5 pr-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Glosario</th>
              <th className="text-center pb-1.5 pr-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Catálogo</th>
              <th className="text-left pb-1.5 pr-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Meta 2026</th>
              <th className="text-center pb-1.5 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Estado</th>
            </tr>
          </thead>
          <tbody>
            {mdm.entidades.map((e, i) => (
              <tr key={e.id}
                style={{ borderBottom: i < mdm.entidades.length - 1 ? `1px solid ${clr.borde}` : 'none' }}
                className="hover:bg-white/[0.02]">
                <td className="py-2 pr-3 text-[12px] text-slate-200 font-medium">{e.nombre}</td>
                <td className="py-2 pr-3">
                  <SysChip nombre={e.sistema_autoritativo.split('-')[0].split('/')[0]} />
                </td>
                <td className="py-2 pr-3 text-center">
                  {e.glosario_validado
                    ? <CheckCircle2 size={13} style={{ color: clr.verde }} className="mx-auto" />
                    : <XCircle size={13} style={{ color: clr.rojo }} className="mx-auto" />}
                </td>
                <td className="py-2 pr-3 text-center">
                  {e.catalogo_registrado
                    ? <CheckCircle2 size={13} style={{ color: clr.verde }} className="mx-auto" />
                    : <XCircle size={13} style={{ color: clr.rojo }} className="mx-auto" />}
                </td>
                <td className="py-2 pr-3 text-[11px] text-slate-500">{e.meta_calidad_2026}</td>
                <td className="py-2 text-center">
                  <Sbadge label={e.estado} color={semColor(e.estado)} />
                </td>
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
        <div className="flex items-center justify-between text-[12px] mb-1.5">
          <span className="text-slate-400">Presupuesto total I-04</span>
          <span className="text-slate-200 font-bold tabular-nums">{fmtCOP(interop.presupuesto_total_cop)} COP</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
          <div className="h-full rounded-full"
            style={{ width: `${Math.max(interop.pct_ejecucion, 1.5)}%`, background: interop.pct_ejecucion === 0 ? clr.gris : clr.azul }} />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
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
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
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
                <p className="text-[11px] text-slate-500 mb-1.5">{fase.periodo} · {fase.estandar}</p>
                <div className="flex flex-wrap gap-1">
                  {fase.sistemas.map(s => (
                    <span key={s} className="text-[11px] px-1.5 py-0.5 rounded"
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
          <span className="text-[12px] text-slate-500">Doc. {d.meta.documento_base}</span>
          

        </div>
        
        <div className="flex items-center gap-4 text-[12px] text-slate-500 flex-wrap">
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
          <h2 className="text-sm font-bold text-slate-200">Gobierno de Datos - Vista Estratégica</h2>
        </div>

        <BloqueDAMA d={d} seguridad={d.seguridad_privacidad} resumen={resumen} />
        <BloqueCalidad d={d} />
        <BloqueCiclo d={d} />
        <BloqueMDM d={d} />
        <BloqueInterop d={d} />
      </div>
    </div>
  )
}
