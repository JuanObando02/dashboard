import { useState } from 'react'
import { ChevronRight, SearchX } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import KpiDetailModal from './KpiDetailModal'

const SEM = {
  verde:    { dot: '#22c55e', bg: 'rgba(34,197,94,0.1)',   text: '#4ade80',  label: 'Óptimo'    },
  amarillo: { dot: '#eab308', bg: 'rgba(234,179,8,0.1)',   text: '#facc15',  label: 'Precaución' },
  rojo:     { dot: '#ef4444', bg: 'rgba(239,68,68,0.1)',   text: '#f87171',  label: 'Crítico'   },
}

const PERSP_COLORS = {
  'Clientes':            { bg: 'rgba(59,130,246,0.12)', color: '#93c5fd' },
  'Procesos Internos':   { bg: 'rgba(139,92,246,0.12)', color: '#c4b5fd' },
  'Aprendizaje y Crec.': { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d' },
  'Finanzas':            { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7' },
}

export default function ExecutiveTable() {
  const { filteredKpis, selectedKpi, setSelectedKpiIdx } = useDashboard()
  const [modalKpi, setModalKpi] = useState(null)

  if (filteredKpis.length === 0) {
    return (
      <div className="bg-[#111e35] rounded-xl border border-slate-800 flex flex-col items-center justify-center py-16 gap-3 text-slate-600">
        <SearchX size={36} />
        <p className="text-sm">Sin KPIs para el principio seleccionado</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-[#111e35] rounded-xl border border-slate-800 overflow-hidden">
        {/* Table header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200">Tablero Ejecutivo de KPIs</h2>
          <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {filteredKpis.length} indicadores
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                <th className="text-left px-4 py-2.5 font-medium">KPI / Perspectiva</th>
                <th className="text-right px-3 py-2.5 font-medium whitespace-nowrap">Val. Actual</th>
                <th className="text-right px-3 py-2.5 font-medium whitespace-nowrap">Meta 2029</th>
                <th className="text-center px-3 py-2.5 font-medium">Estado</th>
                <th className="text-left px-3 py-2.5 font-medium hidden lg:table-cell">Responsable</th>
                <th className="text-center px-3 py-2.5 font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filteredKpis.map((kpi, i) => {
                const sem      = SEM[kpi.semaforo] ?? SEM.rojo
                const pColor   = PERSP_COLORS[kpi.perspectiva] ?? { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' }
                const isActive = kpi === selectedKpi

                return (
                  <tr
                    key={i}
                    onClick={() => setSelectedKpiIdx(i)}
                    className="border-b border-slate-800/60 cursor-pointer transition-colors"
                    style={{ background: isActive ? 'rgba(29,78,216,0.06)' : undefined }}
                    onMouseEnter={e  => { if (!isActive) e.currentTarget.style.background = 'rgba(30,41,59,0.5)' }}
                    onMouseLeave={e  => { e.currentTarget.style.background = isActive ? 'rgba(29,78,216,0.06)' : '' }}
                  >
                    {/* KPI name */}
                    <td className="px-4 py-3 max-w-[260px]">
                      <div className="flex items-start gap-2">
                        {isActive && (
                          <span className="w-0.5 h-full min-h-[2rem] rounded-full bg-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-slate-200 font-medium leading-snug line-clamp-2">
                            {kpi.kpi}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: pColor.bg, color: pColor.color }}
                            >
                              {kpi.perspectiva}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">{kpi.obj_bsc}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Valor actual */}
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <span className="text-slate-100 font-semibold">
                        {kpi.valor_actual_simulado ?? '—'}
                      </span>
                      <span className="text-slate-500 ml-1">{kpi.unidad}</span>
                    </td>

                    {/* Meta */}
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <span className="text-slate-400">
                        {kpi.meta_2029 ?? '—'}
                      </span>
                      <span className="text-slate-600 ml-1">{kpi.unidad}</span>
                    </td>

                    {/* Semáforo */}
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <span
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                          style={{ background: sem.bg }}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: sem.dot }}
                          />
                          <span
                            className="hidden sm:inline font-medium text-[10px]"
                            style={{ color: sem.text }}
                          >
                            {sem.label}
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* Responsable */}
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <p className="text-slate-400 max-w-[200px] truncate">{kpi.rol_responsable}</p>
                    </td>

                    {/* Ver detalle */}
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={e => { e.stopPropagation(); setModalKpi(kpi) }}
                        className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg border text-blue-400
                                   hover:text-blue-300 transition-colors"
                        style={{
                          background: 'rgba(59,130,246,0.06)',
                          borderColor: 'rgba(59,130,246,0.2)',
                        }}
                      >
                        Ver
                        <ChevronRight size={11} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalKpi && (
        <KpiDetailModal kpi={modalKpi} onClose={() => setModalKpi(null)} />
      )}
    </>
  )
}
