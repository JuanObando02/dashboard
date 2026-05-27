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
import GeminiPanel from './components/GeminiPanel'

const metadata = {
  nombre: "Hospital Departamental Psiquiátrico Universitario del Valle",
  modelo_gobierno: "ISO 38500 & Balanced Scorecard",
  fecha_actualizacion: "2026-05-27"
}

function KpiPillsBar() {
  const { filteredKpis, selectedKpi, setSelectedKpiIdx, activePrinciple } = useDashboard()

  if (!activePrinciple && filteredKpis.length === 0) return null

  return (
    <div className="rounded-xl px-3 py-2.5 flex flex-wrap gap-1.5" style={{ background: '#111e35', border: '1px solid #1e293b' }}>
      {filteredKpis.length > 1 ? (
        <>
          {filteredKpis.slice(0, 20).map((k, i) => {
            const isSelected = k === selectedKpi
            return (
              <button
                key={i}
                onClick={() => setSelectedKpiIdx(i)}
                title={k.KPI}
                className="text-[10px] px-2 py-0.5 rounded-md border transition-colors"
                style={{
                  background:  isSelected ? '#1d4ed8' : '#1e293b',
                  borderColor: isSelected ? '#3b82f6' : '#334155',
                  color:       isSelected ? '#fff' : '#94a3b8',
                }}
              >
                {k['Obj. BSC']} – K{i + 1}
              </button>
            )
          })}
          {filteredKpis.length > 20 && (
            <span className="text-[10px] text-slate-500 self-center">+{filteredKpis.length - 20} más</span>
          )}
        </>
      ) : (
        <p className="text-[10px] text-slate-600">Filtra por principio ISO para navegar entre KPIs</p>
      )}
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
                    <GeminiPanel />
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
