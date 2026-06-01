import { CalendarDays, ShieldCheck, Monitor, BrainCircuit, Database, RefreshCw } from 'lucide-react'
import ExecutiveReportButton from './ExecutiveReportButton'
import { useDashboard } from '../context/DashboardContext'

const SEM_BADGES = [
  { key: 'criticos',  label: 'Crítico',  dot: '#ef4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.35)'  },
  { key: 'moderados', label: 'Moderado', dot: '#eab308', bg: 'rgba(234,179,8,0.15)',  border: 'rgba(234,179,8,0.35)'  },
  { key: 'normales',  label: 'Normal',   dot: '#22c55e', bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.35)'  },
]

const TABS = [
  { id: 'ti',           label: 'Gobierno de TI',  icon: Monitor },
  { id: 'datos-ia',     label: 'Datos',            icon: Database },
  { id: 'gobierno-ia',  label: 'Gobierno de IA',   icon: BrainCircuit },
]

export default function Header({ metadata, activeTab, onTabChange }) {
  const { globalCounts, refreshData, refreshing } = useDashboard()
  const nombre = metadata?.nombre ?? 'Hospital'
  const modelo = metadata?.modelo_gobierno ?? 'ISO 38500 & BSC'
  const fecha  = metadata?.fecha_actualizacion ?? '—'

  return (
    <header className="sticky top-0 z-50 shadow-lg" style={{ background: 'linear-gradient(to right, #0f2d52, #1e4d8c)' }}>
      <div className="px-6 py-3 flex items-center gap-4">

        {/* Left: logo + name */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="rounded-lg p-1 bg-white flex-shrink-0 flex items-center justify-center" style={{ width: 46, height: 46 }}>
            <img
              src="https://psiquiatricocali.gov.co/wp/wp-content/uploads/2023/11/logo-HPVC-1.png"
              alt="Logo"
              style={{ maxWidth: 38, maxHeight: 38, objectFit: 'contain' }}
            />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-white">{nombre}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={12} className="text-blue-300" />
              <span className="text-xs text-blue-200 font-medium">{modelo}</span>
            </div>
          </div>
        </div>

        {/* Center: folder tabs */}
        <div className="flex items-center gap-1 flex-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                style={{
                  borderRadius: '8px 8px 0 0',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
                  borderBottom: isActive ? '2px solid #60a5fa' : '1px solid transparent',
                  boxShadow: isActive ? 'inset 0 -1px 0 #60a5fa, 0 -2px 10px rgba(96,165,250,0.12)' : 'none',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            )
          })}
        </div>

        {/* Right: semáforo + button + date */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {SEM_BADGES.map(({ key, label, dot, bg, border }) => (
              <div
                key={key}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
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

          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
            <CalendarDays size={14} className="text-blue-300" />
            <div>
              <p className="text-[10px] text-blue-300 leading-none">Última actualización</p>
              <p className="text-xs font-semibold text-white">{fecha}</p>
            </div>
          </div>

          <button
            onClick={refreshData}
            disabled={refreshing}
            title="Actualizar datos"
            className="p-2 rounded-lg transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <RefreshCw
              size={14}
              className="text-blue-300"
              style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}
            />
          </button>
        </div>

      </div>
    </header>
  )
}
