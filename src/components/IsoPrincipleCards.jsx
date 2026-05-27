import { Shield, Target, Package, TrendingUp, CheckCircle2, Users } from 'lucide-react'
import { useDashboard, ISO_PRINCIPLES } from '../context/DashboardContext'

const ICON_MAP = { Shield, Target, Package, TrendingUp, CheckCircle2, Users }

export default function IsoPrincipleCards() {
  const { allKpis, activePrinciple, togglePrinciple } = useDashboard()

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: '#111e35', borderColor: '#1e293b' }}
    >
      <div className="px-3 py-2.5 border-b" style={{ borderColor: '#1e293b' }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Principios ISO 38500
        </p>
      </div>

      <div className="grid grid-cols-3 gap-px p-px" style={{ background: '#1e293b' }}>
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
              className="relative text-left p-2.5 transition-all duration-150 focus:outline-none"
              style={{
                background: isActive ? `${p.hex}20` : '#111e35',
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <span
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-none"
                  style={{ background: p.hex }}
                />
              )}

              {/* Icon + name row */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon size={12} style={{ color: isActive ? p.hex : '#475569' }} className="shrink-0" />
                <p
                  className="text-[10px] font-semibold leading-tight truncate"
                  style={{ color: isActive ? p.hex : '#94a3b8' }}
                >
                  {p.id}
                </p>
              </div>

              {/* % */}
              <p
                className="text-lg font-bold leading-none mb-0.5"
                style={{ color: isActive ? p.hex : '#cbd5e1' }}
              >
                {avg}%
              </p>

              {/* Mini semaforo bar */}
              <div className="h-1 rounded-full overflow-hidden flex mt-1.5" style={{ background: '#0b1829' }}>
                {rojos     > 0 && <span style={{ width: `${(rojos     / total) * 100}%`, background: '#ef4444' }} />}
                {amarillos > 0 && <span style={{ width: `${(amarillos / total) * 100}%`, background: '#eab308' }} />}
                {verdes    > 0 && <span style={{ width: `${(verdes    / total) * 100}%`, background: '#22c55e' }} />}
              </div>

              {/* Counts */}
              <div className="flex items-center gap-1.5 mt-1">
                {rojos > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] text-slate-500">
                    <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />{rojos}
                  </span>
                )}
                {amarillos > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] text-slate-500">
                    <span className="w-1 h-1 rounded-full bg-yellow-400 inline-block" />{amarillos}
                  </span>
                )}
                {verdes > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] text-slate-500">
                    <span className="w-1 h-1 rounded-full bg-green-500 inline-block" />{verdes}
                  </span>
                )}
                <span className="ml-auto text-[9px] text-slate-600">{total}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
