import { X, Target, DollarSign, FileText, ShieldCheck, User, Lightbulb, TrendingUp } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const SEMAFORO_STYLES = {
  verde:    { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Óptimo' },
  amarillo: { dot: 'bg-yellow-400',  badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',   label: 'Precaución' },
  rojo:     { dot: 'bg-red-500',     badge: 'bg-red-100 text-red-800 border-red-200',            label: 'Crítico' },
}

const CHART_COLOR = {
  verde: '#10b981',
  amarillo: '#f59e0b',
  rojo: '#ef4444',
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="mt-0.5 p-1.5 rounded-md bg-slate-100">
        <Icon size={14} className="text-slate-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label, unidad }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-base font-bold text-[#1e4d8c]">
          {payload[0].value} {unidad}
        </p>
      </div>
    )
  }
  return null
}

export default function KpiModal({ kpi, onClose, iniciativas = [] }) {
  if (!kpi) return null

  const semaforo = SEMAFORO_STYLES[kpi.semaforo] ?? SEMAFORO_STYLES.rojo
  const chartColor = CHART_COLOR[kpi.semaforo] ?? '#3b82f6'
  const historico = kpi.historico_simulado ?? []
  const meta = kpi.meta_2029

  const useBar = historico.length <= 4
  const ChartComp = useBar ? BarChart : LineChart
  const DataComp = useBar ? Bar : Line

  const kpiIniciativas = iniciativas.filter(ini => {
    const ids = (kpi.iniciativas ?? '').split(',').map(s => s.trim())
    return ids.includes(ini.ID)
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-[#0f2d52] to-[#1e4d8c] px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className={`mt-1 w-3 h-3 rounded-full shrink-0 ${semaforo.dot}`} />
            <div>
              <h2 className="text-white font-bold text-base leading-snug">{kpi.kpi ?? 'KPI'}</h2>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${semaforo.badge}`}>
                  {semaforo.label}
                </span>
                {kpi.perspectiva && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                    {kpi.perspectiva}
                  </span>
                )}
                {kpi.obj_bsc && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                    BSC: {kpi.obj_bsc}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Left: info */}
            <div className="px-6 py-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Información del KPI</h3>

              <InfoRow icon={Target}      label="Meta 2029"      value={meta != null ? `${meta} ${kpi.unidad ?? ''}` : null} />
              <InfoRow icon={TrendingUp}  label="Valor actual"   value={kpi.valor_actual_simulado != null ? `${kpi.valor_actual_simulado} ${kpi.unidad ?? ''}` : 'N/D'} />
              <InfoRow icon={ShieldCheck} label="Principio ISO"  value={kpi.principio_iso} />
              <InfoRow icon={User}        label="Responsable"    value={kpi.rol_responsable} />
              <InfoRow icon={FileText}    label="Frecuencia"     value={kpi.frecuencia} />
              <InfoRow icon={DollarSign}  label="Presupuesto"    value={kpi.presupuesto_cop} />
              <InfoRow icon={FileText}    label="Fuente"         value={kpi.fuente} />
              <InfoRow icon={Lightbulb}   label="Justificación ISO" value={kpi.justificacion_iso} />
              <InfoRow icon={Target}      label="OEs relacionados" value={kpi.oes_relacionados} />

              {/* Iniciativas */}
              {kpiIniciativas.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Iniciativas habilitadoras</p>
                  <ul className="space-y-2">
                    {kpiIniciativas.map(ini => (
                      <li key={ini.ID} className="bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-xs font-bold text-[#1e4d8c]">{ini.ID}</p>
                        <p className="text-xs text-slate-700">{ini['Nombre Iniciativa']}</p>
                        {ini['Presupuesto (COP)'] && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            COP {Number(ini['Presupuesto (COP)']).toLocaleString('es-CO')}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: chart */}
            <div className="px-6 py-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Histórico simulado
              </h3>

              {historico.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                  Sin datos históricos disponibles
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <ChartComp data={historico} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="periodo"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip unidad={kpi.unidad ?? ''} />} />
                    {meta != null && (
                      <ReferenceLine
                        y={meta}
                        stroke="#1e4d8c"
                        strokeDasharray="4 3"
                        label={{ value: `Meta: ${meta}`, position: 'right', fontSize: 10, fill: '#1e4d8c' }}
                      />
                    )}
                    {useBar ? (
                      <Bar dataKey="valor" fill={chartColor} radius={[4, 4, 0, 0]} />
                    ) : (
                      <Line
                        type="monotone"
                        dataKey="valor"
                        stroke={chartColor}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: chartColor }}
                        activeDot={{ r: 5 }}
                      />
                    )}
                  </ChartComp>
                </ResponsiveContainer>
              )}

              {/* Stats summary */}
              {historico.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Mínimo', value: Math.min(...historico.map(h => h.valor)) },
                    { label: 'Máximo', value: Math.max(...historico.map(h => h.valor)) },
                    { label: 'Promedio', value: (historico.reduce((a, b) => a + b.valor, 0) / historico.length).toFixed(1) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-bold text-slate-700">{value} {kpi.unidad ?? ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#1e4d8c] text-white text-sm font-medium hover:bg-[#163d70] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
