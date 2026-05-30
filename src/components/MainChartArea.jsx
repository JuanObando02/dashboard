import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Brush,
} from 'recharts'
import { useDashboard } from '../context/DashboardContext'
import { BarChart2, TrendingUp, Info } from 'lucide-react'

const SEM_COLOR = { verde: '#22c55e', amarillo: '#eab308', rojo: '#ef4444' }

function Tooltip_({ active, payload, label, unit, meta }) {
  if (!active || !payload?.length) return null
  const obs = payload[0].payload?.observaciones
  const obsText = obs && obs.trim() !== '' ? obs : 'Sin obs'
  return (
    <div className="bg-[#1e2d45] border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl max-w-[240px]">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-white font-bold text-sm">{payload[0].value} {unit}</p>
      {meta != null && (
        <p className="text-slate-500 mt-0.5">Meta: {meta} {unit}</p>
      )}
      <div className="border-t border-slate-700/60 mt-1.5 pt-1.5">
        <p className="text-[10px] text-slate-400 italic leading-relaxed">
          <span className="font-semibold text-slate-300 not-italic block mb-0.5">Observación:</span>
          {obsText}
        </p>
      </div>
    </div>
  )
}

export default function MainChartArea() {
  const {
    selectedKpi,
    periodFilter,
    setPeriodFilter,
    setAutoPlayHovered,
    autoPlayMs,
  } = useDashboard()

  const [yZoom, setYZoom] = useState(20)
  const [metaYear, setMetaYear] = useState('2029')
  const [hovered, setHovered] = useState(false)

  function handleMouseEnter() { setHovered(true);  setAutoPlayHovered(true)  }
  function handleMouseLeave() { setHovered(false); setAutoPlayHovered(false) }

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
    valor: h.valor !== null && h.valor !== undefined ? h.valor * mult : null,
    observaciones: h.observaciones ?? '',
  }))
  const chartData  = periodFilter === 'all' ? historico
    : historico.slice(-parseInt(periodFilter))
  const color      = SEM_COLOR[selectedKpi.semaforo] ?? '#3b82f6'
  const useBar     = chartData.length <= 4
  const metaRaw = selectedKpi[`Meta ${metaYear}`]
  const metaScaled = metaRaw !== null && metaRaw !== undefined ? metaRaw * mult : null
  const valSimScaled = selectedKpi['Valor Actual'] !== null && selectedKpi['Valor Actual'] !== undefined ? selectedKpi['Valor Actual'] * mult : null
  const hasDelta = chartData.length >= 2
  const deltaVal = hasDelta ? (chartData[chartData.length - 1].valor - chartData[0].valor) : null
  const cumplimientoDynamic = (() => {
    if (metaScaled === null || valSimScaled === null || metaScaled === 0) {
      return selectedKpi.cumplimiento_pct ?? 0
    }
    if (selectedKpi.Tipo === 'MIN') {
      if (valSimScaled <= metaScaled) return 100
      const pct = (metaScaled / valSimScaled) * 100
      return Math.max(0, parseFloat(pct.toFixed(1)))
    } else {
      const pct = (valSimScaled / metaScaled) * 100
      if (pct >= 100) return 100
      return parseFloat(pct.toFixed(1))
    }
  })()
  const isGood = deltaVal !== null && (
    (selectedKpi.Tipo === 'MIN' && deltaVal < -0.001) ||
    (selectedKpi.Tipo !== 'MIN' && deltaVal > 0.001)
  )
  const isBad = deltaVal !== null && (
    (selectedKpi.Tipo === 'MIN' && deltaVal > 0.001) ||
    (selectedKpi.Tipo !== 'MIN' && deltaVal < -0.001)
  )
  const varColor = isGood ? '#22c55e' : isBad ? '#ef4444' : '#94a3b8'

  const yDomain = (() => {
    const vals = chartData.map(d => d.valor).filter(v => v != null)
    if (metaScaled != null) vals.push(metaScaled)
    if (vals.length === 0) return ['auto', 'auto']
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const range = max - min || Math.abs(max) * 0.1 || 1
    const pad = range * (0.05 + (yZoom / 100) * 1.5)
    const dec = isPct ? 1 : 2
    const lower = parseFloat((min - pad).toFixed(dec))
    return [
      min >= 0 ? Math.max(0, lower) : lower,
      parseFloat((max + pad).toFixed(dec)),
    ]
  })()

  return (
    <div
      className="bg-[#111e35] rounded-xl border border-slate-800 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Auto-play progress bar */}
      <div style={{ height: 2, background: '#1e293b' }}>
        <div
          key={selectedKpi.KPI}
          className="autoplay-bar"
          style={{
            '--autoplay-ms': `${autoPlayMs}ms`,
            animationPlayState: hovered ? 'paused' : 'running',
          }}
        />
      </div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 border-b border-slate-800">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <TrendingUp size={15} className="text-blue-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
              Tendencia histórica
              <span className="relative group">
                <Info size={11} className="text-slate-500 hover:text-slate-300 cursor-help" />
                <span className="absolute left-0 top-5 z-20 w-64 rounded-lg p-3 text-[11px] font-normal leading-relaxed text-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 normal-case"
                  style={{ background: '#0b1829', border: '1px solid #1e3a5f', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                  <p className="font-semibold text-white mb-1.5">Cálculos en Gráfica:</p>
                  <p className="mb-2"><strong className="text-blue-400">Variación:</strong> Es la diferencia entre el último valor y el primero correspondientes únicamente al período seleccionado en la esquina superior derecha.</p>
                  <p><strong className="text-blue-400">Cumplimiento:</strong> Porcentaje del valor actual con respecto a la meta del año seleccionado. Si es <strong className="text-slate-200">MIN</strong> (minimizar), es 100% si se cumple la meta o proporcional si se excede; si es <strong className="text-slate-200">MAX</strong> (maximizar), es la proporción del avance.</p>
                </span>
              </span>
            </p>
            <h3 className="text-sm font-semibold text-white leading-snug">
              {selectedKpi.KPI}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedKpi.Perspectiva} · {selectedKpi['Obj. BSC']} · {selectedKpi.principio_iso}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {/* Period filter */}
          <select
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
            className="text-xs bg-[#0b1829] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300
                       focus:outline-none focus:border-blue-500"
          >
            <option value="3">Últimos 3 períodos</option>
            <option value="6">Últimos 6 períodos</option>
            <option value="12">Últimos 12 períodos</option>
            <option value="all">Todo el histórico</option>
          </select>

          {/* Escala Y + Meta year — same row */}
          <div className="flex items-center gap-3">
            {/* Y-axis zoom */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Escala Y</span>
              <button
                onClick={() => setYZoom(z => Math.max(0, z - 10))}
                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-colors"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}
              >−</button>
              <span className="text-[10px] font-mono text-slate-400 w-7 text-center">{yZoom}%</span>
              <button
                onClick={() => setYZoom(z => Math.min(100, z + 10))}
                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-colors"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}
              >+</button>
            </div>

            <div className="w-px h-4 bg-slate-700" />

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
          </div>
        </div>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-4 divide-x divide-slate-800 border-b border-slate-800">
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
            value: `${cumplimientoDynamic}%`,
            unit:  '',
            color,
          },
          {
            label: periodFilter === 'all' ? 'Variación Hist.' : `Var. últ. ${periodFilter} per.`,
            value: deltaVal !== null
              ? `${deltaVal > 0.001 ? '+' : ''}${Number(deltaVal.toFixed(isPct ? 1 : 2))}`
              : '—',
            unit:  selectedKpi.Unidad,
            color: varColor,
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
      <div className="pt-4 pb-2">
        <div className="pr-2">
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

    </div>
  )
}
