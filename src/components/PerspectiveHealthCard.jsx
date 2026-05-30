import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Activity, Shield, Target, Package, CheckCircle2, Users } from 'lucide-react'
import { useDashboard, ISO_PRINCIPLES } from '../context/DashboardContext'
import KpiDetailModal from './KpiDetailModal'

const PERSPECTIVAS = [
  { id: 'Clientes', short: 'CLI', hex: '#3b82f6' },
  { id: 'Procesos Internos', short: 'PRO', hex: '#8b5cf6' },
  { id: 'Aprendizaje y Crec.', short: 'APR', hex: '#f59e0b' },
  { id: 'Finanzas', short: 'FIN', hex: '#10b981' },
]

const ICON_MAP = { Shield, Target, Package, TrendingUp, CheckCircle2, Users }

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

function BscHealthView({ allKpis }) {
  const [active, setActive] = useState('Clientes')
  const [modalKpi, setModalKpi] = useState(null)

  const pkpis = useMemo(
    () => allKpis.filter(k => k.Perspectiva === active),
    [allKpis, active]
  )

  const total = pkpis.length
  const rojos = pkpis.filter(k => k.semaforo === 'rojo').length
  const amar = pkpis.filter(k => k.semaforo === 'amarillo').length
  const verdes = pkpis.filter(k => k.semaforo === 'verde').length

  // Para el BSC siempre calculamos con pesos iguales (promedio simple) para evitar distorsiones
  const avgComp = total > 0
    ? Math.round(pkpis.reduce((s, k) => s + (k.cumplimiento_pct ?? 0), 0) / total)
    : 0

  const pctCrit = total > 0 ? Math.round((rojos / total) * 100) : 0
  const pctOk = total > 0 ? Math.round((verdes / total) * 100) : 0
  const pctAmar = total > 0 ? Math.round((amar / total) * 100) : 0

  const avgDelta = useMemo(() => {
    const deltas = pkpis
      .filter(k => (k.historico_simulado?.length ?? 0) >= 2)
      .map(k => {
        const h = k.historico_simulado
        const isPct = k.Unidad === '%'
        const mult = isPct ? 100 : 1
        return (h[h.length - 1].valor - h[0].valor) * mult
      })
    return deltas.length > 0
      ? deltas.reduce((s, d) => s + d, 0) / deltas.length
      : 0
  }, [pkpis])

  const activePConfig = PERSPECTIVAS.find(p => p.id === active)
  const hex = activePConfig?.hex ?? '#3b82f6'

  const TrendIcon = avgDelta > 0.5 ? TrendingUp : avgDelta < -0.5 ? TrendingDown : Minus
  const trendColor = avgDelta > 0.5 ? '#22c55e' : avgDelta < -0.5 ? '#ef4444' : '#94a3b8'
  const gaugeColor = avgComp >= 70 ? '#22c55e' : avgComp >= 50 ? '#eab308' : '#ef4444'

  return (
    <>
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

      <div className="p-4 space-y-3">
        {/* Perspective header */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: hex }} />
          <p className="text-xs font-semibold text-slate-200">{active}</p>
          <span className="ml-auto text-[10px] text-slate-600">
            Promedio · {total} KPIs
          </span>
        </div>

        {/* Two-column layout: stats on left, gauge on right */}
        <div className="flex items-center gap-3">
          {/* Left Column: Progress bars & trend */}
          <div className="flex-1 space-y-2.5 min-w-0">
            {/* Cumulative semáforo bar */}
            <div className="h-2 rounded-full overflow-hidden flex">
              {rojos  > 0 && <span style={{ width: `${(rojos  / total) * 100}%`, background: '#ef4444' }} />}
              {amar   > 0 && <span style={{ width: `${(amar   / total) * 100}%`, background: '#eab308' }} />}
              {verdes > 0 && <span style={{ width: `${(verdes / total) * 100}%`, background: '#22c55e' }} />}
            </div>
            {/* Progress bars */}
            {[
              { label: 'Críticos',   n: rojos,  pct: pctCrit, color: '#ef4444' },
              { label: 'Precaución', n: amar,   pct: pctAmar, color: '#eab308' },
              { label: 'Cumpliendo', n: verdes, pct: pctOk,   color: '#22c55e' },
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

            {/* Trend */}
            <div className="flex items-center gap-1.5 pt-1">
              <TrendIcon size={11} style={{ color: trendColor }} className="shrink-0" />
              <p className="text-[10px] text-slate-500">
                <span className="font-semibold" style={{ color: trendColor }}>
                  {avgDelta > 0 ? '+' : ''}{avgDelta.toFixed(1)}
                </span>{' '}
                variación histórica prom.
              </p>
            </div>
          </div>

          {/* Gauge */}
          <div style={{ width: '42%', flexShrink: 0 }}>
            <GaugeSVG pct={avgComp} color={gaugeColor} />
          </div>
        </div>

        {/* KPI list */}
        <div className="space-y-2 pt-1 border-t" style={{ borderColor: '#1e293b' }}>
          <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-2 pt-1">
            Indicadores
          </p>
          {pkpis.map((k, i) => {
            const dot = k.semaforo === 'verde' ? '#22c55e'
              : k.semaforo === 'amarillo' ? '#eab308'
                : '#ef4444'
            const metaKey = ['Meta 2026', 'Meta 2027', 'Meta 2028', 'Meta 2029']
              .find(m => k[m] != null)
            const metaVal = metaKey ? k[metaKey] : null

            return (
              <button
                key={i}
                onClick={() => setModalKpi(k)}
                className="w-full text-left rounded-lg p-2.5 space-y-1 transition-all duration-150 focus:outline-none"
                style={{ background: '#0b1829', border: `1px solid ${dot}22` }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${dot}66`; e.currentTarget.style.background = '#0f2040' }}
                onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${dot}22`; e.currentTarget.style.background = '#0b1829' }}
              >
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: dot }} />
                  <p className="text-[11px] text-slate-300 leading-snug flex-1 min-w-0">{k.KPI}</p>
                  <span className="text-[10px] font-bold tabular-nums shrink-0" style={{ color: dot }}>
                    {k.cumplimiento_pct}%
                  </span>
                </div>
                {k.rol_responsable && (
                  <div className="flex items-center gap-1.5 pl-3.5">
                    <Users size={10} className="text-slate-600 shrink-0" />
                    <p className="text-[10px] text-slate-500 truncate">{k.rol_responsable}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 pl-3.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] uppercase tracking-wide text-slate-600">Actual</span>
                    <span className="text-[10px] font-semibold text-slate-400 tabular-nums">
                      {k['Valor Actual'] != null
                        ? `${k['Valor Actual']}${k.Unidad === '%' ? '%' : ''}`
                        : '—'}
                    </span>
                  </div>
                  {metaVal != null && (
                    <>
                      <span className="text-[9px] text-slate-700">→</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] uppercase tracking-wide text-slate-600">Meta</span>
                        <span className="text-[10px] font-semibold tabular-nums" style={{ color: dot }}>
                          {metaVal}{k.Unidad === '%' ? '%' : ''}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {modalKpi && <KpiDetailModal kpi={modalKpi} onClose={() => setModalKpi(null)} />}
    </>
  )
}

function GaugeSVG({ pct, color }) {
  const cx = 55, cy = 50, R = 40, sw = 10
  const clamped  = Math.min(100, Math.max(0, pct))
  const angleDeg = 180 - clamped * 1.8
  const rad      = (angleDeg * Math.PI) / 180
  const ex       = cx + R * Math.cos(rad)
  const ey       = cy - R * Math.sin(rad)

  return (
    <svg viewBox="0 0 110 76" style={{ width: '100%', display: 'block' }}>
      {/* Track */}
      <path d={`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${cx+R} ${cy}`}
            fill="none" stroke="#1e293b" strokeWidth={sw} strokeLinecap="round" />
      {/* Value */}
      {clamped > 0 && (
        <path d={`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${ex} ${ey}`}
              fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      )}
      {/* Labels */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800"
            fill="white" fontFamily="Inter,sans-serif">{pct}%</text>
      <text x={cx} y={cy + 7} textAnchor="middle" fontSize="6.5" fill="#64748b"
            fontFamily="Inter,sans-serif" fontWeight="600" letterSpacing="0.08em">CUMPLIMIENTO</text>
      <text x={cx - R} y={cy + 18} textAnchor="middle" fontSize="7" fill="#475569"
            fontFamily="Inter,sans-serif" fontWeight="500">0</text>
      <text x={cx + R} y={cy + 18} textAnchor="middle" fontSize="7" fill="#475569"
            fontFamily="Inter,sans-serif" fontWeight="500">100</text>
    </svg>
  )
}

function IsoPrincipleView({ allKpis, principleId }) {
  const [modalKpi, setModalKpi] = useState(null)
  const principle = ISO_PRINCIPLES.find(p => p.id === principleId)
  const hex = principle?.hex ?? '#3b82f6'
  const Icon = principle ? ICON_MAP[principle.iconName] : Activity

  const pkpis = useMemo(
    () => allKpis.filter(k => k.principio_iso === principleId),
    [allKpis, principleId]
  )

  const total = pkpis.length
  const rojos = pkpis.filter(k => k.semaforo === 'rojo').length
  const amar = pkpis.filter(k => k.semaforo === 'amarillo').length
  const verdes = pkpis.filter(k => k.semaforo === 'verde').length

  const allWeightedIso = total > 0 && pkpis.every(k => k.peso !== null)
  const avgComp = total > 0
    ? allWeightedIso
      ? Math.round(pkpis.reduce((s, k) => s + (k.cumplimiento_pct ?? 0) * (k.peso ?? 0), 0))
      : Math.round(pkpis.reduce((s, k) => s + (k.cumplimiento_pct ?? 0), 0) / total)
    : 0

  const pctCrit = total > 0 ? Math.round((rojos / total) * 100) : 0
  const pctOk   = total > 0 ? Math.round((verdes / total) * 100) : 0
  const pctAmar = total > 0 ? Math.round((amar / total) * 100) : 0
  const gaugeColor = avgComp >= 70 ? '#22c55e' : avgComp >= 50 ? '#eab308' : '#ef4444'

  return (
    <div className="p-4 space-y-3">
      {/* Principle header */}
      <div className="flex items-center gap-2">
        <Icon size={15} style={{ color: hex }} />
        <p className="text-xs font-semibold" style={{ color: hex }}>{principleId}</p>
        <span className="ml-auto text-[10px] text-slate-600">
          {allWeightedIso ? 'Ponderado' : 'Promedio'} · {total} KPIs
        </span>
      </div>

      {/* Two-column: bars left, gauge right */}
      <div className="flex items-center gap-3">
        {/* Left: semáforo bar + progress bars */}
        <div className="flex-1 space-y-2.5 min-w-0">
          {/* Semáforo bar */}
          <div className="h-2 rounded-full overflow-hidden flex">
            {rojos  > 0 && <span style={{ width: `${(rojos / total) * 100}%`,  background: '#ef4444' }} />}
            {amar   > 0 && <span style={{ width: `${(amar  / total) * 100}%`,  background: '#eab308' }} />}
            {verdes > 0 && <span style={{ width: `${(verdes / total) * 100}%`, background: '#22c55e' }} />}
          </div>
          {/* Progress bars */}
          {[
            { label: 'Críticos',   n: rojos,  pct: pctCrit, color: '#ef4444' },
            { label: 'Precaución', n: amar,   pct: pctAmar, color: '#eab308' },
            { label: 'Cumpliendo', n: verdes, pct: pctOk,   color: '#22c55e' },
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

        {/* Right: Gauge */}
        <div style={{ width: '42%', flexShrink: 0 }}>
          <GaugeSVG pct={avgComp} color={gaugeColor} />
        </div>
      </div>

      {/* KPI list with responsible and critical value */}
      <div className="space-y-2 pt-1 border-t" style={{ borderColor: '#1e293b' }}>
        <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-2 pt-1">
          Indicadores
        </p>
        {pkpis.map((k, i) => {
          const dot = k.semaforo === 'verde' ? '#22c55e'
            : k.semaforo === 'amarillo' ? '#eab308'
              : '#ef4444'
          const metaKey = ['Meta 2026', 'Meta 2027', 'Meta 2028', 'Meta 2029']
            .find(m => k[m] != null)
          const metaVal = metaKey ? k[metaKey] : null

          return (
            <button
              key={i}
              onClick={() => setModalKpi(k)}
              className="w-full text-left rounded-lg p-2.5 space-y-1 transition-all duration-150 focus:outline-none"
              style={{ background: '#0b1829', border: `1px solid ${dot}22` }}
              onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${dot}66`; e.currentTarget.style.background = '#0f2040' }}
              onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${dot}22`; e.currentTarget.style.background = '#0b1829' }}
            >
              {/* KPI name + compliance */}
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: dot }} />
                <p className="text-[11px] text-slate-300 leading-snug flex-1 min-w-0">
                  {k.KPI}
                </p>
                <span
                  className="text-[10px] font-bold tabular-nums shrink-0"
                  style={{ color: dot }}
                >
                  {k.cumplimiento_pct}%
                </span>
              </div>

              {/* Responsible */}
              {k.rol_responsable && (
                <div className="flex items-center gap-1.5 pl-3.5">
                  <Users size={10} className="text-slate-600 shrink-0" />
                  <p className="text-[10px] text-slate-500 truncate">{k.rol_responsable}</p>
                </div>
              )}

              {/* Current value vs target vs weight */}
              <div className="flex items-center gap-3 pl-3.5">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] uppercase tracking-wide text-slate-600">Actual</span>
                  <span className="text-[10px] font-semibold text-slate-400 tabular-nums">
                    {k['Valor Actual'] != null
                      ? `${k['Valor Actual']}${k.Unidad === '%' ? '%' : ''}`
                      : '—'}
                  </span>
                </div>
                {metaVal != null && (
                  <>
                    <span className="text-[9px] text-slate-700">→</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] uppercase tracking-wide text-slate-600">Meta</span>
                      <span
                        className="text-[10px] font-semibold tabular-nums"
                        style={{ color: dot }}
                      >
                        {metaVal}{k.Unidad === '%' ? '%' : ''}
                      </span>
                    </div>
                  </>
                )}
                {k.peso != null && (
                  <>
                    <span className="text-[9px] text-slate-700">·</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] uppercase tracking-wide text-slate-600">Peso</span>
                      <span className="text-[10px] font-semibold text-slate-400 tabular-nums">
                        {(k.peso * 100).toFixed(0)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {modalKpi && <KpiDetailModal kpi={modalKpi} onClose={() => setModalKpi(null)} />}
    </div>
  )
}

export default function PerspectiveHealthCard() {
  const { allKpis, activePrinciple } = useDashboard()

  const title = activePrinciple
    ? `ISO 38500 · ${activePrinciple}`
    : 'Salud por Perspectiva BSC'

  const principleConfig = activePrinciple
    ? ISO_PRINCIPLES.find(p => p.id === activePrinciple)
    : null

  return (
    <div
      className="rounded-xl border overflow-hidden xl:sticky xl:top-20"
      style={{ background: '#111e35', borderColor: principleConfig?.hex ?? '#1e293b' }}
    >
      {/* Title */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#1e293b' }}>
        <Activity size={14} style={{ color: principleConfig?.hex ?? '#60a5fa' }} />
        <h2 className="text-sm font-semibold text-slate-200 truncate">{title}</h2>
        {activePrinciple && (
          <span className="ml-auto text-[9px] uppercase tracking-wide text-slate-600">
            Principio activo
          </span>
        )}
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 540 }}>
        {activePrinciple
          ? <IsoPrincipleView allKpis={allKpis} principleId={activePrinciple} />
          : <BscHealthView allKpis={allKpis} />
        }
      </div>
    </div>
  )
}
