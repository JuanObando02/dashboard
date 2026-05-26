import KpiCard from './KpiCard'
import { SearchX } from 'lucide-react'

export default function KpiGrid({ kpis, onDetail }) {
  if (kpis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <SearchX size={40} />
        <p className="text-base font-medium">Sin resultados para los filtros seleccionados</p>
        <p className="text-sm">Intenta ajustar los filtros o la búsqueda</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-6">
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.kpi ?? i} kpi={kpi} onDetail={onDetail} />
      ))}
    </div>
  )
}
