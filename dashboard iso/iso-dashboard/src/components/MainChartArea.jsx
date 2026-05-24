import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useDashboard } from '../context/DashboardContext'
import { BarChart2, TrendingUp } from 'lucide-react'

const SEM_COLOR = { verde: '#22c55e', amarillo: '#eab308', rojo: '#ef4444' }

function Tooltip_({ active, payload, label, unit, meta }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1e2d45] border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-white font-bold text-sm">{payload[0].value} {unit}</p>
      {meta != null && (
        <p className="text-slate-500 mt-0.5">Meta 2029: {meta} {unit}</p>
      )}
    </div>
  )
}

export default function MainChartArea() {
  const {
    selectedKpi,
    filteredKpis,
    setSelectedKpiIdx,
    periodFilter,
    setPeriodFilter,
    activePrinciple,
  } = useDashboard()

  if (!selectedKpi) {
    return (
      <div className="bg-[#111e35] rounded-xl border border-slate-800 flex items-center justify-center h-64">
        <div className="text-center text-slate-600">
          <BarChart2 size={36} className="mx-auto mb-2" />
          <p className="text-sm">Selecciona un principio ISO para explorar KPIs</p>
        </div>
      </div>
    )
  }

  const historico  = selectedKpi.historico_simulado ?? []
  const chartData  = periodFilter === '6m' ? historico.slice(-6) : historico
  const color      = SEM_COLOR[selectedKpi.semaforo] ?? '#3b82f6'
  const useBar     = chartData.length <= 4

  return (
    <div className="bg-[#111e35] rounded-xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 border-b border-slate-800">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <TrendingUp size={15} className="text-blue-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">
              Tendencia histórica
            </p>
            <h3 className="text-sm font-semibold text-white leading-snug">
              {selectedKpi.kpi}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedKpi.perspectiva} · {selectedKpi.obj_bsc} · {selectedKpi.principio_iso}
            </p>
          </div>
        </div>

        <select
          value={periodFilter}
          onChange={e => setPeriodFilter(e.target.value)}
          className="text-xs bg-[#0b1829] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300
                     focus:outline-none focus:border-blue-500 shrink-0"
        >
          <option value="6m">Últimos 6 períodos</option>
          <option value="all">Todo el histórico</option>
        </select>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
        {[
          {
            label: 'Valor actual',
            value: selectedKpi.valor_actual_simulado ?? '—',
            unit:  selectedKpi.unidad,
            color: '#f1f5f9',
          },
          {
            label: 'Meta 2029',
            value: selectedKpi.meta_2029 ?? '—',
            unit:  selectedKpi.unidad,
            color: '#94a3b8',
          },
          {
            label: 'Cumplimiento',
            value: `${selectedKpi.cumplimiento_pct ?? 0}%`,
            unit:  '',
            color,
          },
        ].map(m => (
          <div key={m.label} className="px-4 py-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{m.label}</p>
            <p className="text-xl font-bold leading-none" style={{ color: m.color }}>
              {m.value}
              {m.unit && <span className="text-xs text-slate-500 ml-1">{m.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-2 pt-4 pb-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            {useBar ? (
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="periodo" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                {selectedKpi.meta_2029 != null && (
                  <ReferenceLine y={selectedKpi.meta_2029} stroke="#22c55e" strokeDasharray="4 2" strokeOpacity={0.5} />
                )}
                <Tooltip content={<Tooltip_ unit={selectedKpi.unidad} meta={selectedKpi.meta_2029} />} cursor={false} />
                <Bar dataKey="valor" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="periodo" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                {selectedKpi.meta_2029 != null && (
                  <ReferenceLine y={selectedKpi.meta_2029} stroke="#22c55e" strokeDasharray="4 2" strokeOpacity={0.5} />
                )}
                <Tooltip content={<Tooltip_ unit={selectedKpi.unidad} meta={selectedKpi.meta_2029} />} />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm">
            Sin datos históricos disponibles
          </div>
        )}
      </div>

      {/* KPI pills */}
      {filteredKpis.length > 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {filteredKpis.slice(0, 20).map((k, i) => {
            const isSelected = k === selectedKpi
            return (
              <button
                key={i}
                onClick={() => setSelectedKpiIdx(i)}
                title={k.kpi}
                className="text-[10px] px-2 py-0.5 rounded-md border transition-colors"
                style={{
                  background:   isSelected ? '#1d4ed8' : '#1e293b',
                  borderColor:  isSelected ? '#3b82f6' : '#334155',
                  color:        isSelected ? '#fff' : '#94a3b8',
                }}
              >
                {k.obj_bsc} – K{i + 1}
              </button>
            )
          })}
          {filteredKpis.length > 20 && (
            <span className="text-[10px] text-slate-500 self-center">
              +{filteredKpis.length - 20} más
            </span>
          )}
        </div>
      )}

      {!activePrinciple && (
        <p className="px-4 pb-3 text-[10px] text-slate-600">
          Filtra por principio ISO para navegar entre KPIs relacionados
        </p>
      )}
    </div>
  )
}
