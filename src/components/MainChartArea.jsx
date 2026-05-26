import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Brush,
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
        <p className="text-slate-500 mt-0.5">Meta: {meta} {unit}</p>
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

  const [yZoom, setYZoom] = useState(20)
  const [metaYear, setMetaYear] = useState('2029')

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

  const isPct = selectedKpi.Unidad === '%'
  const mult = isPct ? 100 : 1

  const rawHistorico  = selectedKpi.historico_simulado ?? []
  const historico = rawHistorico.map(h => ({
    periodo: h.periodo,
    valor: h.valor !== null && h.valor !== undefined ? h.valor * mult : null
  }))
  const chartData  = periodFilter === '6m' ? historico.slice(-6) : historico
  const color      = SEM_COLOR[selectedKpi.semaforo] ?? '#3b82f6'
  const useBar     = chartData.length <= 4
  const metaRaw = selectedKpi[`Meta ${metaYear}`]
  const metaScaled = metaRaw !== null && metaRaw !== undefined ? metaRaw * mult : null
  const valSimScaled = selectedKpi.valor_actual_simulado !== null && selectedKpi.valor_actual_simulado !== undefined ? selectedKpi.valor_actual_simulado * mult : null

  const yDomain = (() => {
    const vals = chartData.map(d => d.valor).filter(v => v != null)
    if (metaScaled != null) vals.push(metaScaled)
    if (vals.length === 0) return ['auto', 'auto']
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const range = max - min || Math.abs(max) * 0.1 || 1
    const pad = range * (0.05 + (yZoom / 100) * 1.5)
    const dec = isPct ? 1 : 2
    return [
      parseFloat((min - pad).toFixed(dec)),
      parseFloat((max + pad).toFixed(dec)),
    ]
  })()

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
              {selectedKpi.KPI}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedKpi.Perspectiva} · {selectedKpi['Obj. BSC']} · {selectedKpi.principio_iso}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Meta year selector */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider mr-0.5">Meta</span>
            {['2026', '2027', '2028', '2029'].map(year => {
              const hasVal = selectedKpi[`Meta ${year}`] != null
              const isActive = metaYear === year
              return (
                <button
                  key={year}
                  onClick={() => hasVal && setMetaYear(year)}
                  disabled={!hasVal}
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors"
                  style={{
                    background:  isActive ? '#1d4ed8' : 'rgba(30,41,59,0.8)',
                    color:       isActive ? '#fff' : hasVal ? '#94a3b8' : '#334155',
                    border:      `1px solid ${isActive ? '#3b82f6' : '#334155'}`,
                    cursor:      hasVal ? 'pointer' : 'default',
                  }}
                >
                  {year}
                </button>
              )
            })}
          </div>

          {/* Period filter */}
          <select
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
            className="text-xs bg-[#0b1829] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300
                       focus:outline-none focus:border-blue-500"
          >
            <option value="6m">Últimos 6 períodos</option>
            <option value="all">Todo el histórico</option>
          </select>
        </div>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
        {[
          {
            label: 'Valor actual',
            value: valSimScaled !== null ? Number(valSimScaled.toFixed(isPct ? 1 : 2)) : '—',
            unit:  selectedKpi.Unidad,
            color: '#f1f5f9',
          },
          {
            label: `Meta ${metaYear}`,
            value: metaScaled !== null ? Number(metaScaled.toFixed(isPct ? 1 : 2)) : '—',
            unit:  selectedKpi.Unidad,
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
      <div className="pt-4 pb-2 flex gap-1">
        {/* Y-axis zoom slider (vertical, left) */}
        <div className="flex flex-col items-center justify-center shrink-0 pl-2" style={{ width: 28 }}>
          <span className="text-[8px] text-slate-600 select-none">+</span>
          <input
            type="range"
            min={0}
            max={100}
            value={yZoom}
            onChange={e => setYZoom(Number(e.target.value))}
            title={`Zoom Y: ${yZoom}%`}
            style={{
              transform: 'rotate(-90deg)',
              width: 140,
              cursor: 'pointer',
              accentColor: '#3b82f6',
            }}
          />
          <span className="text-[8px] text-slate-600 select-none">−</span>
        </div>

        {/* Chart area */}
        <div className="flex-1 pr-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              {useBar ? (
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="periodo" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} domain={yDomain} />
                  {metaScaled != null && (
                    <ReferenceLine y={metaScaled} stroke="#22c55e" strokeDasharray="4 2" strokeOpacity={0.5} />
                  )}
                  <Tooltip content={<Tooltip_ unit={selectedKpi.Unidad} meta={metaScaled} />} cursor={false} />
                  <Bar dataKey="valor" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Brush
                    dataKey="periodo"
                    height={18}
                    stroke="#1e293b"
                    fill="#0b1829"
                    travellerWidth={6}
                    tick={{ fontSize: 8, fill: '#475569' }}
                  />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="periodo" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} domain={yDomain} />
                  {metaScaled != null && (
                    <ReferenceLine y={metaScaled} stroke="#22c55e" strokeDasharray="4 2" strokeOpacity={0.5} />
                  )}
                  <Tooltip content={<Tooltip_ unit={selectedKpi.Unidad} meta={metaScaled} />} />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke={color}
                    strokeWidth={2}
                    dot={{ fill: color, r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Brush
                    dataKey="periodo"
                    height={18}
                    stroke="#1e293b"
                    fill="#0b1829"
                    travellerWidth={6}
                    tick={{ fontSize: 8, fill: '#475569' }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-600 text-sm">
              Sin datos históricos disponibles
            </div>
          )}
        </div>
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
                title={k.KPI}
                className="text-[10px] px-2 py-0.5 rounded-md border transition-colors"
                style={{
                  background:   isSelected ? '#1d4ed8' : '#1e293b',
                  borderColor:  isSelected ? '#3b82f6' : '#334155',
                  color:        isSelected ? '#fff' : '#94a3b8',
                }}
              >
                {k['Obj. BSC']} – K{i + 1}
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
