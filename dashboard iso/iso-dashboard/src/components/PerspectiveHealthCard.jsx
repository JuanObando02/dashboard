import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'

const PERSPECTIVAS = [
  { id: 'Clientes',            short: 'CLI', hex: '#3b82f6' },
  { id: 'Procesos Internos',   short: 'PRO', hex: '#8b5cf6' },
  { id: 'Aprendizaje y Crec.', short: 'APR', hex: '#f59e0b' },
  { id: 'Finanzas',            short: 'FIN', hex: '#10b981' },
]

function Bar_({ pct, color }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, pct)}%`, background: color }}
      />
    </div>
  )
}

export default function PerspectiveHealthCard() {
  const { allKpis } = useDashboard()
  const [active, setActive] = useState('Clientes')

  const pkpis = useMemo(
    () => allKpis.filter(k => k.perspectiva === active),
    [allKpis, active]
  )

  const total   = pkpis.length
  const rojos   = pkpis.filter(k => k.semaforo === 'rojo').length
  const amar    = pkpis.filter(k => k.semaforo === 'amarillo').length
  const verdes  = pkpis.filter(k => k.semaforo === 'verde').length

  const avgComp = total > 0
    ? Math.round(pkpis.reduce((s, k) => s + (k.cumplimiento_pct ?? 0), 0) / total)
    : 0

  const pctCrit = total > 0 ? Math.round((rojos  / total) * 100) : 0
  const pctOk   = total > 0 ? Math.round((verdes / total) * 100) : 0
  const pctAmar = total > 0 ? Math.round((amar   / total) * 100) : 0

  // Avg trend: delta between last and first historico value
  const avgDelta = useMemo(() => {
    const deltas = pkpis
      .filter(k => (k.historico_simulado?.length ?? 0) >= 2)
      .map(k => {
        const h = k.historico_simulado
        return h[h.length - 1].valor - h[0].valor
      })
    return deltas.length > 0
      ? deltas.reduce((s, d) => s + d, 0) / deltas.length
      : 0
  }, [pkpis])

  const activePConfig = PERSPECTIVAS.find(p => p.id === active)
  const hex = activePConfig?.hex ?? '#3b82f6'

  const TrendIcon  = avgDelta > 0.5 ? TrendingUp : avgDelta < -0.5 ? TrendingDown : Minus
  const trendColor = avgDelta > 0.5 ? '#22c55e'  : avgDelta < -0.5 ? '#ef4444'    : '#94a3b8'

  return (
    <div
      className="rounded-xl border overflow-hidden xl:sticky xl:top-20"
      style={{ background: '#111e35', borderColor: '#1e293b' }}
    >
      {/* Title */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#1e293b' }}>
        <Activity size={14} className="text-blue-400" />
        <h2 className="text-sm font-semibold text-slate-200">Salud por Perspectiva BSC</h2>
      </div>

      {/* Perspective selector */}
      <div className="grid grid-cols-4 gap-1.5 p-3 border-b" style={{ borderColor: '#1e293b' }}>
        {PERSPECTIVAS.map(p => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className="py-1.5 rounded-lg text-[11px] font-semibold border transition-all"
            style={active === p.id
              ? { background: p.hex, borderColor: p.hex, color: '#fff' }
              : { background: `${p.hex}15`, borderColor: `${p.hex}40`, color: p.hex }
            }
          >
            {p.short}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* Perspective name + compliance */}
        <div>
          <p className="text-xs text-slate-500 mb-0.5">{active}</p>
          <p className="text-4xl font-bold text-white leading-none">{avgComp}%</p>
          <p className="text-xs text-slate-500 mt-1">Cumplimiento promedio · {total} KPIs</p>
        </div>

        {/* Trend */}
        <div className="flex items-center gap-2">
          <TrendIcon size={15} style={{ color: trendColor }} />
          <div>
            <span className="text-sm font-semibold" style={{ color: trendColor }}>
              {avgDelta > 0 ? '+' : ''}{avgDelta.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 ml-1">variación histórica prom.</span>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-3">
          {[
            { label: 'Críticos',    n: rojos,  pct: pctCrit, color: '#ef4444' },
            { label: 'Precaución',  n: amar,   pct: pctAmar, color: '#eab308' },
            { label: 'Cumpliendo',  n: verdes, pct: pctOk,   color: '#22c55e' },
          ].map(({ label, n, pct, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-slate-400">{label}</span>
                </div>
                <span className="text-slate-300 font-semibold tabular-nums">
                  {n}/{total} ({pct}%)
                </span>
              </div>
              <Bar_ pct={pct} color={color} />
            </div>
          ))}
        </div>

        {/* KPI list */}
        <div className="space-y-1 pt-1 border-t" style={{ borderColor: '#1e293b' }}>
          <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-1.5 pt-1">
            Indicadores
          </p>
          {pkpis.map((k, i) => {
            const dot = k.semaforo === 'verde' ? '#22c55e'
                      : k.semaforo === 'amarillo' ? '#eab308'
                      : '#ef4444'
            return (
              <div key={i} className="flex items-start gap-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: dot }} />
                <p className="text-[11px] text-slate-400 leading-snug flex-1 min-w-0 line-clamp-2">
                  {k.kpi}
                </p>
                <span
                  className="text-[10px] font-bold tabular-nums shrink-0"
                  style={{ color: dot }}
                >
                  {k.cumplimiento_pct}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
