import { Shield, Target, Package, TrendingUp, CheckCircle2, Users } from 'lucide-react'
import { useDashboard, ISO_PRINCIPLES } from '../context/DashboardContext'

const ICON_MAP = { Shield, Target, Package, TrendingUp, CheckCircle2, Users }

export default function IsoPrincipleCards() {
  const { allKpis, activePrinciple, togglePrinciple } = useDashboard()

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
        Principios ISO 38500 — Haz clic para filtrar
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {ISO_PRINCIPLES.map(p => {
          const Icon      = ICON_MAP[p.iconName]
          const pkpis     = allKpis.filter(k => k.principio_iso === p.id)
          const total     = pkpis.length
          const rojos     = pkpis.filter(k => k.semaforo === 'rojo').length
          const amarillos = pkpis.filter(k => k.semaforo === 'amarillo').length
          const verdes    = pkpis.filter(k => k.semaforo === 'verde').length
          const avg       = total > 0
            ? Math.round(pkpis.reduce((s, k) => s + (k.cumplimiento_pct ?? 0), 0) / total)
            : 0
          const isActive  = activePrinciple === p.id

          return (
            <button
              key={p.id}
              onClick={() => togglePrinciple(p.id)}
              className="relative text-left rounded-xl border p-4 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b1829]"
              style={{
                background:   isActive ? `${p.hex}22` : '#111e35',
                borderColor:  isActive ? p.hex : '#1e293b',
                boxShadow:    isActive ? `0 0 0 1px ${p.hex}` : 'none',
              }}
            >
              {/* Active dot */}
              {isActive && (
                <span
                  className="absolute top-3 right-3 w-2 h-2 rounded-full"
                  style={{ background: p.hex }}
                />
              )}

              {/* Icon */}
              <Icon
                size={18}
                className="mb-2"
                style={{ color: isActive ? p.hex : '#64748b' }}
              />

              {/* Name */}
              <p className="text-xs font-semibold text-slate-200 leading-tight mb-2 min-h-[2rem]">
                {p.id}
              </p>

              {/* Big % */}
              <p
                className="text-2xl font-bold leading-none"
                style={{ color: isActive ? p.hex : '#cbd5e1' }}
              >
                {avg}%
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 mb-2">cumplimiento prom.</p>

              {/* Semáforo mini bar */}
              <div className="h-1.5 rounded-full overflow-hidden bg-slate-800 flex">
                {rojos     > 0 && <span style={{ width: `${(rojos     / total) * 100}%`, background: '#ef4444' }} />}
                {amarillos > 0 && <span style={{ width: `${(amarillos / total) * 100}%`, background: '#eab308' }} />}
                {verdes    > 0 && <span style={{ width: `${(verdes    / total) * 100}%`, background: '#22c55e' }} />}
              </div>

              {/* Counts */}
              <div className="flex items-center gap-2 mt-1.5">
                {rojos > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                    {rojos}
                  </span>
                )}
                {amarillos > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                    {amarillos}
                  </span>
                )}
                {verdes > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    {verdes}
                  </span>
                )}
                <span className="ml-auto text-[10px] text-slate-500">{total} KPIs</span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
