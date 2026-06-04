import { useState } from 'react'
import { useDashboard, DashboardProvider } from './context/DashboardContext'
import Header from './components/layout/Header'
import IsoPrincipleCards from './components/bsc/IsoPrincipleCards'
import MainChartArea from './components/charts/MainChartArea'
import ExecutiveTable from './components/reports/ExecutiveTable'
import PerspectiveHealthCard from './components/bsc/PerspectiveHealthCard'
import SmartSearch from './components/filters/SmartSearch'
import MaturityRadar from './components/maturity/MaturityRadar'
import IniciativasPanel from './components/iniciativas/IniciativasPanel'
import DatosIA from './components/ai/DatosIA'
import GobiernoIA from './components/ai/GobiernoIA'

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

        {activeTab === 'datos-ia' && (
          <main>
            <DatosIA />
          </main>
        )}

        {activeTab === 'gobierno-ia' && (
          <main>
            <GobiernoIA />
          </main>
        )}
      </div>
    </DashboardProvider>
  )
}
