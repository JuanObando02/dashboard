import { Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const SEMAFORO_STYLES = {
  verde: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    label: 'Óptimo',
    bar: 'bg-emerald-500',
  },
  amarillo: {
    dot: 'bg-yellow-400',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Precaución',
    bar: 'bg-yellow-400',
  },
  rojo: {
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-800 border-red-200',
    label: 'Crítico',
    bar: 'bg-red-500',
  },
}

const PERSPECTIVA_COLORS = {
  'Finanzas': 'bg-emerald-100 text-emerald-700',
  'Clientes': 'bg-blue-100 text-blue-700',
  'Procesos Internos': 'bg-violet-100 text-violet-700',
  'Aprendizaje y Crecimiento': 'bg-amber-100 text-amber-700',
}

export default function KpiCard({ kpi, onDetail }) {
  const semaforo = SEMAFORO_STYLES[kpi.semaforo] ?? SEMAFORO_STYLES.rojo
  const perspColor = PERSPECTIVA_COLORS[kpi.Perspectiva] ?? 'bg-slate-100 text-slate-600'

  const isPct = kpi.Unidad === '%'
  const mult = isPct ? 100 : 1

  const rawVal = kpi['Valor Actual']
  const valorActual = rawVal !== null && rawVal !== undefined ? rawVal * mult : null
  const meta = kpi['Meta 2029'] !== null && kpi['Meta 2029'] !== undefined ? kpi['Meta 2029'] * mult : null
  const pct = kpi.cumplimiento_pct ?? 0

  const TrendIcon = pct >= 90 ? TrendingUp : pct >= 50 ? Minus : TrendingDown
  const trendColor = pct >= 90 ? 'text-emerald-500' : pct >= 50 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Top strip */}
      <div className={`h-1 rounded-t-xl ${semaforo.bar}`} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <span className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${semaforo.dot}`} />
            <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
              {kpi.KPI ?? 'KPI sin nombre'}
            </p>
          </div>
          <TrendIcon size={16} className={`${trendColor} shrink-0 mt-0.5`} />
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-500">Avance hacia meta 2029</span>
            <span className="text-xs font-bold text-slate-700">{pct}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${semaforo.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Values */}
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-slate-400">Valor actual</p>
            <p className="text-base font-bold text-slate-800">
              {valorActual != null ? `${Number(valorActual.toFixed(isPct ? 1 : 2))} ${kpi.Unidad ?? ''}` : 'N/D'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Meta 2029</p>
            <p className="text-base font-bold text-slate-500">
              {meta != null ? `${Number(meta.toFixed(isPct ? 1 : 2))} ${kpi.Unidad ?? ''}` : 'N/D'}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${semaforo.badge}`}>
            {semaforo.label}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${perspColor}`}>
            {kpi.Perspectiva ?? 'N/D'}
          </span>
          {kpi.principio_iso && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
              {kpi.principio_iso}
            </span>
          )}
        </div>

        {/* Rol */}
        {kpi.rol_responsable && (
          <p className="text-xs text-slate-400 truncate">
            <span className="font-medium text-slate-500">Responsable:</span> {kpi.rol_responsable}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <button
          onClick={() => onDetail(kpi)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#1e4d8c] hover:bg-[#163d70] text-white text-sm font-medium transition-colors"
        >
          <Eye size={14} />
          Ver Detalle
        </button>
      </div>
    </div>
  )
}
