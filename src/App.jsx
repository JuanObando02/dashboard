import { DashboardProvider } from './context/DashboardContext'
import Header from './components/Header'
import IsoPrincipleCards from './components/IsoPrincipleCards'
import MainChartArea from './components/MainChartArea'
import ExecutiveTable from './components/ExecutiveTable'
import PerspectiveHealthCard from './components/PerspectiveHealthCard'
import SmartSearch from './components/SmartSearch'
import GapAnalysisBar from './components/GapAnalysisBar'

const metadata = {
  nombre: "Hospital Departamental Psiquiátrico Universitario del Valle",
  modelo_gobierno: "ISO 38500 & Balanced Scorecard",
  fecha_actualizacion: "2026-05-27"
}

export default function App() {
  return (
    <DashboardProvider>
      <div className="min-h-screen" style={{ background: '#0b1829', color: '#f1f5f9' }}>
        <Header metadata={metadata} />

        <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          <SmartSearch />
          <IsoPrincipleCards />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">
            {/* Left column */}
            <div className="space-y-5">
              <MainChartArea />
              <GapAnalysisBar />
              <ExecutiveTable />
            </div>

            {/* Right column */}
            <PerspectiveHealthCard />
          </div>
        </main>
      </div>
    </DashboardProvider>
  )
}
