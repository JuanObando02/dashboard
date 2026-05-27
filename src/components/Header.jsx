import { Building2, CalendarDays, ShieldCheck } from 'lucide-react'
import ExecutiveReportButton from './ExecutiveReportButton'
import { useDashboard } from '../context/DashboardContext'

const SEM_BADGES = [
  { key: 'criticos',  label: 'Crítico',  dot: '#ef4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.35)'  },
  { key: 'moderados', label: 'Moderado', dot: '#eab308', bg: 'rgba(234,179,8,0.15)',  border: 'rgba(234,179,8,0.35)'  },
  { key: 'normales',  label: 'Normal',   dot: '#22c55e', bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.35)'  },
]

export default function Header({ metadata }) {
  const { globalCounts } = useDashboard()
  const nombre = metadata?.nombre ?? 'Hospital'
  const modelo = metadata?.modelo_gobierno ?? 'ISO 38500 & BSC'
  const fecha  = metadata?.fecha_actualizacion ?? '—'

  return (
    <header className="bg-gradient-to-r from-[#0f2d52] to-[#1e4d8c] text-white shadow-lg">
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="bg-white/10 rounded-lg p-2 mt-0.5">
            <Building2 size={28} className="text-blue-200" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">{nombre}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <ShieldCheck size={14} className="text-blue-300" />
              <span className="text-sm text-blue-200 font-medium">{modelo}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Semáforo global */}
          <div className="flex items-center gap-2">
            {SEM_BADGES.map(({ key, label, dot, bg, border }) => (
              <div
                key={key}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
                <span className="text-xs font-bold" style={{ color: dot }}>
                  {globalCounts?.[key] ?? '—'}
                </span>
                <span className="text-[10px] text-white/60 hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>

          <ExecutiveReportButton />

          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
            <CalendarDays size={16} className="text-blue-300" />
            <div>
              <p className="text-xs text-blue-300 leading-none">Última actualización</p>
              <p className="text-sm font-semibold">{fecha}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
