import { CalendarDays, ShieldCheck, Monitor, BrainCircuit, Database, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import ExecutiveReportButton from '../reports/ExecutiveReportButton'
import { useDashboard } from '../../context/DashboardContext'

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
  const { globalCounts, webhookStatus = 'idle', triggerWebhookRefresh, refreshing } = useDashboard()

  const syncIsRunning = webhookStatus === 'running' || refreshing
  const syncLabel = syncIsRunning        ? 'Ejecutando…'
                  : webhookStatus === 'success' ? '¡Actualizado!'
                  : webhookStatus === 'error'   ? 'Error'
                  : 'Sincronizar'
  const syncBorder = webhookStatus === 'success' ? 'rgba(34,197,94,0.5)'
                   : webhookStatus === 'error'   ? 'rgba(239,68,68,0.5)'
                   : 'rgba(255,255,255,0.15)'
  const syncIcon = syncIsRunning               ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
                 : webhookStatus === 'success' ? <CheckCircle2 size={13} className="text-green-400" />
                 : webhookStatus === 'error'   ? <XCircle size={13} className="text-red-400" />
                 : <RefreshCw size={13} className="text-blue-300" />
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
          {activeTab === 'ti' && (
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
          )}

          <ExecutiveReportButton />

          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
            <CalendarDays size={14} className="text-blue-300" />
            <div>
              <p className="text-[10px] text-blue-300 leading-none">Última actualización</p>
              <p className="text-xs font-semibold text-white">{fecha}</p>
            </div>
          </div>

          <button
            onClick={() => {
              console.log('[Header] click sync — webhookStatus:', webhookStatus, '| refreshing:', refreshing, '| fn:', typeof triggerWebhookRefresh)
              if (triggerWebhookRefresh) triggerWebhookRefresh()
              else console.warn('[Header] triggerWebhookRefresh is undefined!')
            }}
            title="Ejecutar flujo n8n y recargar datos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: webhookStatus === 'success' ? 'rgba(34,197,94,0.15)'
                        : webhookStatus === 'error'   ? 'rgba(239,68,68,0.15)'
                        : 'rgba(255,255,255,0.08)',
              border: `1px solid ${syncBorder}`,
              color: webhookStatus === 'success' ? '#4ade80'
                   : webhookStatus === 'error'   ? '#f87171'
                   : '#93c5fd',
              cursor: syncIsRunning ? 'not-allowed' : 'pointer',
            }}
          >
            {syncIcon}
            <span className="hidden sm:inline">{syncLabel}</span>
          </button>
        </div>

      </div>
    </header>
  )
}
