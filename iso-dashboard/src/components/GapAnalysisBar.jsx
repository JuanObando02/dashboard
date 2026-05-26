import { useState } from 'react'
import { TrendingDown, Info } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'

function parseBudget(raw) {
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') return parseFloat(raw.replace(/[^0-9.]/g, '')) || 0
  return 0
}

function formatCOP(amount) {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(2)}B`
  if (amount >= 1_000_000)     return `$${(amount / 1_000_000).toFixed(0)}M`
  return `$${amount.toLocaleString('es-CO')}`
}

export default function GapAnalysisBar() {
  const { selectedKpi, data } = useDashboard()
  const [tooltip, setTooltip] = useState(null)

  if (!selectedKpi || selectedKpi.semaforo !== 'rojo') return null

  const initiativeMap = Object.fromEntries(
    (data?.iniciativas ?? []).map(i => [i.ID, i])
  )

  const ids = (selectedKpi.iniciativas ?? '').split(',').map(s => s.trim()).filter(Boolean)
  const linked = ids.map(id => ({ id, ...initiativeMap[id] })).filter(i => i['Nombre Iniciativa'])

  const totalBudget = linked.reduce((s, i) => s + parseBudget(i['Presupuesto (COP)']), 0)
  const cumplPct    = selectedKpi.cumplimiento_pct ?? 0

  if (linked.length === 0) return null

  return (
    <div
      className="rounded-xl border border-slate-800 overflow-hidden"
      style={{ background: '#111e35' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
        <TrendingDown size={15} className="text-red-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Análisis de Brecha — Inversión Requerida
          </p>
          <p className="text-sm font-semibold text-white truncate mt-0.5">
            {selectedKpi.kpi}
          </p>
        </div>
        <span className="shrink-0 text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-md">
          {linked.length} {linked.length === 1 ? 'iniciativa' : 'iniciativas'}
        </span>
      </div>

      {/* Budget bar */}
      <div className="px-4 py-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Adquisición (actual {cumplPct}%)</span>
          <span className="font-semibold text-white">{formatCOP(totalBudget)}</span>
        </div>

        {/* Progress track */}
        <div className="relative h-4 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.max(cumplPct, 2)}%`,
              background: 'linear-gradient(90deg, #dc2626, #f97316)',
            }}
          />
          {/* Gap overlay arrow */}
          <div
            className="absolute top-0 right-0 h-full flex items-center pr-2 text-[9px] text-green-400 font-bold"
            style={{ left: `${cumplPct}%` }}
          >
            <div className="w-px h-full bg-green-400/40 mr-1" />
            Meta
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>0%</span>
          <span className="text-green-500">Meta 2029: {selectedKpi.meta_2029} {selectedKpi.unidad}</span>
          <span>100%</span>
        </div>
      </div>

      {/* Initiative breakdown */}
      <div className="px-4 pb-4 space-y-1.5">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Desglose por iniciativa</p>
        {linked.map(ini => {
          const amt = parseBudget(ini['Presupuesto (COP)'])
          const pct = totalBudget > 0 ? (amt / totalBudget) * 100 : 0
          return (
            <div
              key={ini.id}
              className="flex items-center gap-3 group cursor-default"
              onMouseEnter={() => setTooltip(ini.id)}
              onMouseLeave={() => setTooltip(null)}
            >
              <span className="text-[10px] text-slate-500 w-10 shrink-0">{ini.id}</span>
              <div className="flex-1 relative h-5 rounded" style={{ background: '#1e293b' }}>
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${Math.max(pct, 1)}%`,
                    background: '#f97316',
                    opacity: 0.7,
                  }}
                />
                {tooltip === ini.id && (
                  <div
                    className="absolute left-0 -top-10 z-50 text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-xl border border-slate-700"
                    style={{ background: '#1e2d45', color: '#f1f5f9' }}
                  >
                    <span className="font-semibold">{ini['Nombre Iniciativa']}</span>
                    <span className="text-slate-400 ml-2">{formatCOP(amt)}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-orange-400 w-14 text-right shrink-0">{formatCOP(amt)}</span>
            </div>
          )
        })}
      </div>

      {/* Footer total */}
      <div
        className="flex justify-between items-center px-4 py-2 border-t border-slate-800 text-xs"
        style={{ background: '#0b1829' }}
      >
        <span className="flex items-center gap-1 text-slate-500">
          <Info size={11} />
          Presupuesto total de iniciativas vinculadas al KPI rojo
        </span>
        <span className="font-bold text-orange-400">{formatCOP(totalBudget)}</span>
      </div>
    </div>
  )
}
