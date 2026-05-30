import { useState } from 'react'
import { useDashboard, DashboardProvider } from './context/DashboardContext'
import Header from './components/Header'
import IsoPrincipleCards from './components/IsoPrincipleCards'
import MainChartArea from './components/MainChartArea'
import ExecutiveTable from './components/ExecutiveTable'
import PerspectiveHealthCard from './components/PerspectiveHealthCard'
import SmartSearch from './components/SmartSearch'
import GapAnalysisBar from './components/GapAnalysisBar'
import MaturityRadar from './components/MaturityRadar'
import { Database, BrainCircuit, Construction } from 'lucide-react'
import IniciativasPanel from './components/IniciativasPanel'

const metadata = {
  nombre: "Hospital Departamental Psiquiátrico Universitario del Valle",
  modelo_gobierno: "ISO 38500 & Balanced Scorecard",
  fecha_actualizacion: "2026-05-27"
}

function KpiPillsBar() {
  const { filteredKpis, selectedKpi, setSelectedKpiIdx, activePrinciple, pauseAutoPlay } = useDashboard()

  if (!activePrinciple && filteredKpis.length === 0) return null
  if (filteredKpis.length === 0) return null

  const selectedIdx = filteredKpis.indexOf(selectedKpi)
  const dot = selectedKpi?.semaforo === 'verde' ? '#22c55e'
    : selectedKpi?.semaforo === 'amarillo' ? '#eab308'
    : '#ef4444'

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: '#111e35', border: '1px solid #1e293b' }}>
      <span className="text-[10px] text-slate-600 uppercase tracking-wide shrink-0">
        Indicador
      </span>
      <div className="relative flex-1">
        <select
          value={selectedIdx}
          onChange={e => { setSelectedKpiIdx(Number(e.target.value)); pauseAutoPlay() }}
          className="w-full text-xs rounded-lg pl-3 pr-8 py-1.5 appearance-none cursor-pointer transition-colors"
          style={{
            background: '#0b1829',
            border: '1px solid #1e3a5f',
            color: '#e2e8f0',
            outline: 'none',
          }}
        >
          {filteredKpis.map((k, i) => (
            <option key={i} value={i}>
              {k['Obj. BSC']} · {k.KPI}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
      </div>
      {selectedKpi && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full" style={{ background: dot }} />
          <span className="text-xs font-bold tabular-nums" style={{ color: dot }}>
            {selectedKpi.cumplimiento_pct}%
          </span>
        </div>
      )}
      <span className="text-[10px] text-slate-600 shrink-0">{filteredKpis.length} KPIs</span>
    </div>
  )
}

function ComingSoon({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="rounded-2xl p-5" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <Icon size={56} className="text-blue-400" strokeWidth={1.2} />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', color: '#eab308' }}>
        <Construction size={13} />
        En desarrollo
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('ti')

  return (
    <DashboardProvider>
      <div className="min-h-screen" style={{ background: '#0b1829', color: '#f1f5f9' }}>
        <Header metadata={metadata} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'ti' && (
          <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
            <SmartSearch />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-5 items-start">
              {/* Left column */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">
                  <MaturityRadar />
                  <div className="space-y-3">
                    <IniciativasPanel />
                    <MainChartArea />
                    <KpiPillsBar />
                  </div>
                </div>

                <ExecutiveTable />
              </div>

              {/* Right column */}
              <div className="space-y-4 xl:sticky xl:top-24">
                <IsoPrincipleCards />
                <PerspectiveHealthCard />
              </div>
            </div>
          </main>
        )}

        {activeTab === 'datos' && (
          <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
            <ComingSoon
              icon={Database}
              title="Gobierno de Datos"
              description="Panel de gestión y calidad de datos institucionales. Aquí se visualizarán métricas de gobierno de datos, linaje, calidad y cumplimiento normativo."
            />
          </main>
        )}

        {activeTab === 'ia' && (
          <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
            <ComingSoon
              icon={BrainCircuit}
              title="Gobierno de IA"
              description="Marco de gobernanza para modelos e iniciativas de inteligencia artificial. Aquí se gestionarán riesgos, ética, transparencia y cumplimiento de los sistemas de IA."
            />
          </main>
        )}
      </div>
    </DashboardProvider>
  )
}
