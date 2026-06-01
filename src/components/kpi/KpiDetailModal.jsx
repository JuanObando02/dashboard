import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronDown, ChevronUp, Target, Zap, Shield, TrendingUp, TrendingDown, Minus, AlertTriangle, AlertCircle, Clock, User } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'

const SEM = {
  verde:    { dot: '#22c55e', badge: 'rgba(34,197,94,0.15)',  text: '#4ade80',  label: 'Óptimo'     },
  amarillo: { dot: '#eab308', badge: 'rgba(234,179,8,0.15)',  text: '#facc15',  label: 'Precaución'  },
  rojo:     { dot: '#ef4444', badge: 'rgba(239,68,68,0.15)',  text: '#f87171',  label: 'Crítico'    },
}

function ExpandCard({ title, icon: Icon, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: '#1e293b', background: '#0b1829' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon size={13} className="text-blue-400 shrink-0" />
          <span className="text-xs font-medium text-slate-300">{title}</span>
        </div>
        {open
          ? <ChevronUp size={13} className="text-slate-600" />
          : <ChevronDown size={13} className="text-slate-600" />}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t text-xs text-slate-400 leading-relaxed"
          style={{ borderColor: '#1e293b' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1e2d45] border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-0.5">{label}</p>
      <p className="text-white font-bold">{payload[0].value} {unit}</p>
    </div>
  )
}

export default function KpiDetailModal({ kpi, onClose }) {
  const { data } = useDashboard()
  const sem      = SEM[kpi.semaforo] ?? SEM.rojo

  const isPct    = kpi.Unidad === '%'
  const mult     = isPct ? 100 : 1

  const kpiInitIds  = (kpi.Iniciativas    ?? '').split(',').map(s => s.trim()).filter(Boolean)
  const kpiOeIds    = (kpi['OEs Relacionados'] ?? '').split(',').map(s => s.trim()).filter(Boolean)

  const relInits    = data.iniciativas.filter(i => kpiInitIds.includes(i.ID))
  const relOes      = data.objetivos_estrategicos.filter(oe =>
    kpiOeIds.includes(oe['Objetivo Estratégico'])
  )

  const historico   = useMemo(() => {
    return (kpi.historico_simulado ?? []).map(h => ({
      periodo: h.periodo,
      valor: h.valor !== null && h.valor !== undefined ? h.valor * mult : null
    }))
  }, [kpi.historico_simulado, mult])

  const useBar      = historico.length <= 4
  const chartColor  = sem.dot
  const metaScaled       = kpi['Meta 2029'] != null ? kpi['Meta 2029'] * mult : null
  const meta2026Scaled   = kpi['Meta 2026'] != null ? kpi['Meta 2026'] * mult : null
  const lineaBaseScaled  = kpi.linea_base_2025 != null ? kpi.linea_base_2025 * mult : null
  const valSimScaled     = kpi['Valor Actual'] != null ? kpi['Valor Actual'] * mult : null

  const yDomain = useMemo(() => {
    const vals = historico.map(d => d.valor).filter(v => v != null)
    if (metaScaled != null)      vals.push(metaScaled)
    if (meta2026Scaled != null)  vals.push(meta2026Scaled)
    if (lineaBaseScaled != null) vals.push(lineaBaseScaled)
    if (vals.length === 0) return ['auto', 'auto']
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const range = max - min
    const pad = range < 0.001 ? Math.abs(max) * 0.05 || 1 : range * 0.2
    const dec = isPct ? 1 : 2
    return [
      parseFloat((min - pad).toFixed(dec)),
      parseFloat((max + pad).toFixed(dec)),
    ]
  }, [historico, metaScaled, meta2026Scaled, lineaBaseScaled, isPct])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#111e35', border: '1px solid #1e293b' }}
      >
        {/* Modal header */}
        <div
          className="flex items-start gap-3 px-5 py-4 shrink-0"
          style={{ background: 'linear-gradient(135deg, #0f2d52, #1e4d8c)', borderBottom: '1px solid #1e3a5f' }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: sem.badge, color: sem.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: sem.dot }} />
                {sem.label}
              </span>
              <span className="text-[10px] text-blue-300 bg-white/10 px-2 py-0.5 rounded-full">
                {kpi.principio_iso}
              </span>
              <span className="text-[10px] text-blue-300 bg-white/10 px-2 py-0.5 rounded-full">
                {kpi.Perspectiva} · {kpi['Obj. BSC']}
              </span>
              {kpi.tendencia && (() => {
                const up   = kpi.tendencia === 'Mejorando'
                const flat = kpi.tendencia === 'Estable'
                const Icon = flat ? Minus : up ? TrendingUp : TrendingDown
                const color = flat ? '#94a3b8' : up ? '#4ade80' : '#f87171'
                return (
                  <span
                    className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${color}22`, color }}
                  >
                    <Icon size={10} />
                    {kpi.tendencia}
                  </span>
                )
              })()}
            </div>
            <h2 className="text-sm font-bold text-white leading-snug">{kpi.KPI}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors shrink-0 p-1 rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* AI Audit Alert */}
          {kpi.auditoria && (kpi.semaforo === 'rojo' || kpi.semaforo === 'amarillo') && (() => {
            const isRojo    = kpi.semaforo === 'rojo'
            const alertColor = isRojo ? '#ef4444' : '#eab308'
            const alertBg    = isRojo ? 'rgba(239,68,68,0.08)' : 'rgba(234,179,8,0.08)'
            const alertBorder = isRojo ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'
            const AlertIcon   = isRojo ? AlertTriangle : AlertCircle
            const { hallazgo, impacto_operacional, causa_probable, plan_accion, plazo_revision, responsable_seguimiento } = kpi.auditoria
            return (
              <div className="mx-5 mt-4 mb-0 rounded-xl border overflow-hidden" style={{ borderColor: alertBorder, background: alertBg }}>
                {/* Alert header */}
                <div
                  className="flex items-center gap-2 px-4 py-2.5 border-b"
                  style={{ borderColor: alertBorder, background: isRojo ? 'rgba(239,68,68,0.12)' : 'rgba(234,179,8,0.12)' }}
                >
                  <AlertIcon size={14} style={{ color: alertColor }} className="shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: alertColor }}>
                    Auditoría IA — {kpi.auditoria.nivel_alerta}
                  </span>
                </div>

                <div className="px-4 py-3 space-y-3 text-xs">
                  {/* Hallazgo */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: alertColor }}>Hallazgo</p>
                    <p className="text-slate-300 leading-relaxed">{hallazgo}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Impacto */}
                    <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${alertBorder}` }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-slate-400">Impacto Operacional</p>
                      <p className="text-slate-300 leading-relaxed">{impacto_operacional}</p>
                    </div>
                    {/* Causa */}
                    <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${alertBorder}` }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-slate-400">Causa Probable</p>
                      <p className="text-slate-300 leading-relaxed">{causa_probable}</p>
                    </div>
                  </div>

                  {/* Plan de acción */}
                  {plan_accion?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: alertColor }}>Plan de Acción</p>
                      <ol className="space-y-1.5">
                        {plan_accion.map((paso, i) => (
                          <li key={i} className="flex gap-2">
                            <span
                              className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5"
                              style={{ background: alertColor, color: '#fff' }}
                            >
                              {i + 1}
                            </span>
                            <span className="text-slate-300 leading-relaxed">{paso}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Plazo & Responsable */}
                  <div className="flex flex-wrap gap-3 pt-1 border-t" style={{ borderColor: alertBorder }}>
                    {plazo_revision && (
                      <span className="flex items-center gap-1.5 text-[10px]" style={{ color: alertColor }}>
                        <Clock size={11} />
                        <span className="text-slate-400">Plazo:</span>
                        <span className="font-semibold">{plazo_revision}</span>
                      </span>
                    )}
                    {responsable_seguimiento && (
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <User size={11} />
                        <span>Responsable:</span>
                        <span className="font-semibold text-slate-300">{responsable_seguimiento}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Metrics */}
          <div className="grid grid-cols-3 border-b mt-4" style={{ borderColor: '#1e293b' }}>
            {[
              { label: 'Valor Actual', value: valSimScaled !== null ? `${Number(valSimScaled.toFixed(isPct ? 1 : 2))} ${kpi.Unidad ?? ''}` : '—', color: '#f1f5f9' },
              { label: 'Meta 2029',    value: metaScaled !== null ? `${Number(metaScaled.toFixed(isPct ? 1 : 2))} ${kpi.Unidad ?? ''}` : '—',             color: '#94a3b8' },
              { label: 'Cumplimiento', value: `${kpi.cumplimiento_pct ?? 0}%`,                      color: sem.dot  },
            ].map(m => (
              <div key={m.label} className="px-4 py-3 border-r last:border-r-0" style={{ borderColor: '#1e293b' }}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{m.label}</p>
                <p className="text-base font-bold leading-tight" style={{ color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="p-5 space-y-5">
            {/* Chart */}
            {historico.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
                  Histórico simulado
                </p>
                <ResponsiveContainer width="100%" height={160}>
                  {useBar ? (
                    <BarChart data={historico} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="periodo" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} domain={yDomain} />
                      {lineaBaseScaled != null && (
                        <ReferenceLine y={lineaBaseScaled} stroke="#64748b" strokeDasharray="3 3" strokeOpacity={0.6} label={{ value: 'Base', position: 'insideTopRight', fontSize: 8, fill: '#64748b' }} />
                      )}
                      {meta2026Scaled != null && (
                        <ReferenceLine y={meta2026Scaled} stroke="#3b82f6" strokeDasharray="4 2" strokeOpacity={0.6} label={{ value: '2026', position: 'insideTopRight', fontSize: 8, fill: '#3b82f6' }} />
                      )}
                      {metaScaled != null && (
                        <ReferenceLine y={metaScaled} stroke="#22c55e" strokeDasharray="4 2" strokeOpacity={0.6} label={{ value: '2029', position: 'insideTopRight', fontSize: 8, fill: '#22c55e' }} />
                      )}
                      <Tooltip content={<ChartTooltip unit={kpi.Unidad} />} cursor={false} />
                      <Bar dataKey="valor" fill={chartColor} radius={[3, 3, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  ) : (
                    <LineChart data={historico} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="periodo" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} domain={yDomain} />
                      {lineaBaseScaled != null && (
                        <ReferenceLine y={lineaBaseScaled} stroke="#64748b" strokeDasharray="3 3" strokeOpacity={0.6} label={{ value: 'Base', position: 'insideTopRight', fontSize: 8, fill: '#64748b' }} />
                      )}
                      {meta2026Scaled != null && (
                        <ReferenceLine y={meta2026Scaled} stroke="#3b82f6" strokeDasharray="4 2" strokeOpacity={0.6} label={{ value: '2026', position: 'insideTopRight', fontSize: 8, fill: '#3b82f6' }} />
                      )}
                      {metaScaled != null && (
                        <ReferenceLine y={metaScaled} stroke="#22c55e" strokeDasharray="4 2" strokeOpacity={0.6} label={{ value: '2029', position: 'insideTopRight', fontSize: 8, fill: '#22c55e' }} />
                      )}
                      <Tooltip content={<ChartTooltip unit={kpi.Unidad} />} />
                      <Line
                        type="monotone" dataKey="valor" stroke={chartColor} strokeWidth={2}
                        dot={{ fill: chartColor, r: 3, strokeWidth: 0 }} activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {(() => {
                    const valores = historico.map(h => h.valor).filter(v => v != null && !Number.isNaN(v))
                    if (valores.length === 0) return null
                    const dec = isPct ? 1 : 2
                    const fmt = n => Number(n.toFixed(dec))
                    return [
                      { l: 'Mínimo',   v: fmt(Math.min(...valores)) },
                      { l: 'Máximo',   v: fmt(Math.max(...valores)) },
                      { l: 'Promedio', v: fmt(valores.reduce((a, b) => a + b, 0) / valores.length) },
                    ].map(({ l, v }) => (
                      <div key={l} className="rounded-lg px-3 py-2 text-center" style={{ background: '#0b1829' }}>
                        <p className="text-[10px] text-slate-500">{l}</p>
                        <p className="text-xs font-bold text-slate-300">{v} {kpi.Unidad}</p>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            )}

            {/* ISO Justification */}
            <div
              className="rounded-lg p-4 border"
              style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield size={13} className="text-blue-400 shrink-0" />
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Justificación ISO 38500 — {kpi.principio_iso}
                </p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{kpi.justificacion_iso}</p>
            </div>

            {/* Meta details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ['Tipo de KPI',    kpi.Tipo === 'MAX' ? 'Maximizar' : 'Minimizar'],
                ['Frecuencia',     kpi.Frecuencia],
                ['Responsable',    kpi.rol_responsable],
                ['Presupuesto',    kpi.presupuesto_cop],
                ['Línea base 2025', kpi.linea_base_2025 != null ? `${Number((kpi.linea_base_2025 * mult).toFixed(isPct ? 1 : 2))} ${kpi.Unidad ?? ''}`.trim() : null],
                ['Fuente',         kpi.Fuente, true],
              ].map(([l, v, full]) => v ? (
                <div key={l} className={full ? 'col-span-2' : ''}>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">{l}</p>
                  <p className="text-slate-300">{v}</p>
                </div>
              ) : null)}
            </div>

            {/* Objetivos Estratégicos */}
            {relOes.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  Objetivos Estratégicos
                </p>
                <div className="space-y-1.5">
                  {relOes.map(oe => (
                    <ExpandCard
                      key={oe['Objetivo Estratégico']}
                      title={`${oe['Objetivo Estratégico']} — ${oe['Descripción']}`}
                      icon={Target}
                    >
                      <div className="space-y-2">
                        {oe['Descripción Completa'] && (
                          <p className="text-slate-300 leading-relaxed">{oe['Descripción Completa']}</p>
                        )}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t" style={{ borderColor: '#1e293b' }}>
                          {oe['Objetivos BSC'] && (
                            <span>
                              <span className="text-slate-500">BSC: </span>
                              <span className="text-slate-300">{oe['Objetivos BSC']}</span>
                            </span>
                          )}
                          {oe['Ruta'] && (
                            <span className="col-span-2">
                              <span className="text-slate-500">Ruta: </span>
                              <span className="text-slate-300">{oe['Ruta']}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </ExpandCard>
                  ))}
                </div>
              </div>
            )}

            {/* Iniciativas */}
            {relInits.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  Iniciativas Habilitadoras
                </p>
                <div className="space-y-1.5">
                  {relInits.map(ini => (
                    <ExpandCard
                      key={ini.ID}
                      title={`${ini.ID} — ${ini['Nombre Iniciativa']}`}
                      icon={Zap}
                    >
                      <p className="text-slate-300 mb-2">{ini['Descripción Resumida']}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t"
                        style={{ borderColor: '#1e293b' }}>
                        <span>
                          <span className="text-slate-500">Período: </span>
                          <span className="text-slate-300">{ini['Período']}</span>
                        </span>
                        <span>
                          <span className="text-slate-500">Presupuesto: </span>
                          <span className="text-slate-300">
                            COP {Number(ini['Presupuesto (COP)']).toLocaleString('es-CO')}
                          </span>
                        </span>
                        <span>
                          <span className="text-slate-500">BSC: </span>
                          <span className="text-slate-300">{ini['Objetivo(s) BSC']}</span>
                        </span>
                      </div>
                    </ExpandCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex justify-end shrink-0"
          style={{ background: '#0b1829', borderTop: '1px solid #1e293b' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg text-white transition-colors"
            style={{ background: '#1e4d8c' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#163d70' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1e4d8c' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
