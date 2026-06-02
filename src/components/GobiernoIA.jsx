import { useEffect, useMemo, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  AlertTriangle, BrainCircuit, CalendarDays, ClipboardCheck,
  Eye, FileSearch, Gauge, GitBranch, HeartPulse, Info, LockKeyhole,
  Scale, ShieldAlert, ShieldCheck, Sparkles, Target, TrendingUp,
  UserCheck, X,
} from 'lucide-react'

const DATA_URL = '/data/Gobierno_IA_data.json'

const clr = {
  rojo: '#ef4444', amarillo: '#f59e0b', verde: '#22c55e',
  gris: '#6b7280', azul: '#3b82f6', violeta: '#8b5cf6',
  cyan: '#06b6d4', card: '#0f172a', borde: '#1e293b', bg: '#0b1829',
}

const iconMap = {
  go: ClipboardCheck, switch: Gauge, risk: ShieldAlert, maturity: TrendingUp,
  law: Scale, iso: ShieldCheck, privacy: LockKeyhole, ethics: Eye,
}

function statusColor(status) {
  const s = (status || '').toUpperCase()
  if (['CRITICO', 'CRÍTICO', 'ALTO', 'ALTA', 'ALTO RIESGO'].some(x => s.includes(x))) return clr.rojo
  if (['MEDIO', 'MEDIA', 'ALERTA', 'CONDICIONADO', 'PENDIENTE', 'EN CURSO', 'PROGRAMADA', 'IMPLEMENTACION', 'LIMITADO', 'PARCIAL', 'VIGILANCIA', 'AMARILLO'].some(x => s.includes(x))) return clr.amarillo
  if (['CONFORME', 'CUBIERTA', 'ALINEADO', 'CONTROL', 'COMPLETADA', 'GOBERNADO', 'OBJETIVO', 'ARMADO'].some(x => s.includes(x))) return clr.verde
  return clr.gris
}

function fmtDate(iso) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return iso }
}

function Sbadge({ label, color }) {
  const c = color || statusColor(label)
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}>
      {label}
    </span>
  )
}

function Block({ title, icon: Icon, accent = clr.azul, children }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: clr.card, borderColor: clr.borde }}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b"
        style={{ borderColor: clr.borde, background: `${accent}08` }}>
        <div className="p-1.5 rounded-lg shrink-0"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
          <Icon size={13} style={{ color: accent }} />
        </div>
        <h3 className="text-xs font-bold text-white">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function SectionTitle({ eyebrow, title, icon: Icon, accent }) {
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <div className="flex items-center gap-2">
        <Icon size={13} style={{ color: accent }} />
        <div>
          <p className="text-[8px] uppercase tracking-wider font-semibold text-slate-600">{eyebrow}</p>
          <h2 className="text-sm font-bold text-slate-200">{title}</h2>
        </div>
      </div>
    </div>
  )
}

function DarkTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl max-w-xs"
      style={{ background: '#1e2d45', border: '1px solid #334155' }}>
      {label && <p className="text-slate-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color || clr.azul }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

function KpiStrip({ items }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {items.map(item => {
        const color = statusColor(item.estado)
        const Icon = iconMap[item.icon] || Target
        return (
          <div key={item.label} className="rounded-xl p-3 border flex items-center gap-3"
            style={{ background: `${color}06`, borderColor: `${color}20` }}>
            <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${color}16`, border: `1px solid ${color}30` }}>
              <Icon size={13} style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 truncate">{item.label}</p>
              <p className="text-lg font-bold tabular-nums leading-tight truncate" style={{ color }}>
                {item.value}<span className="text-xs text-slate-500 font-normal">{item.suffix}</span>
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function GovernanceScore({ data, resumen }) {
  const scoreColor = statusColor(data.estado_semaforo)
  return (
    <Block title="Estado General de Gobernanza" icon={Gauge} accent={scoreColor}>
      <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-4">
        <div className="rounded-lg p-4 border flex flex-col justify-between" style={{ background: `${scoreColor}06`, borderColor: `${scoreColor}20` }}>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">AI Governance Score</p>
            <p className="text-4xl font-bold tabular-nums leading-tight" style={{ color: scoreColor }}>{data.ai_governance_score}%</p>
            <Sbadge label={data.estado_semaforo} color={scoreColor} />
          </div>
          <div className="space-y-1 mt-4 text-[10px] text-slate-500">
            <p>Ultima auditoria: <strong className="text-slate-300">{fmtDate(data.ultima_auditoria)}</strong></p>
            <p>Proxima auditoria: <strong className="text-slate-300">{fmtDate(data.proxima_auditoria)}</strong></p>
            <p>Clasificacion: <strong className="text-slate-300">{resumen.clasificacion_eu_ai_act}</strong></p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={data.dimensiones} margin={{ top: 4, right: 20, bottom: 4, left: -20 }}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey="nombre" tick={{ fill: '#94a3b8', fontSize: 9 }} interval={0} />
            <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
            <Tooltip content={<DarkTip />} />
            <Bar dataKey="valor" name="Score" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.dimensiones.map(item => <Cell key={item.nombre} fill={statusColor(item.estado)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Block>
  )
}

function IsoGovernance({ data }) {
  const maturity = data.madurez_dominios.map(item => ({ ...item, pct: Math.round((item.nivel / item.max) * 100) }))
  return (
    <Block title="Gobierno y Cumplimiento ISO 42001" icon={ShieldCheck} accent={clr.azul}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {[
          ['Auditorias realizadas', data.auditorias_realizadas, clr.verde],
          ['Hallazgos abiertos', data.hallazgos_abiertos, clr.amarillo],
          ['Acciones pendientes', data.acciones_correctivas_pendientes, clr.rojo],
          ['Riesgos mitigados', `${data.riesgos_mitigados}/${data.riesgos_identificados}`, clr.azul],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-lg p-2.5 border" style={{ background: `${color}06`, borderColor: `${color}20` }}>
            <p className="text-[8px] uppercase tracking-wider text-slate-500">{label}</p>
            <p className="text-lg font-bold tabular-nums" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart layout="vertical" data={maturity} margin={{ top: 4, right: 22, bottom: 4, left: 0 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
          <YAxis type="category" dataKey="dominio" width={145} tick={{ fill: '#94a3b8', fontSize: 9 }} />
          <Tooltip content={<DarkTip />} />
          <Bar dataKey="pct" name="Madurez" fill={clr.azul} barSize={10} radius={[0, 3, 3, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </Block>
  )
}

function RiskEthics({ data, risks, onSelect }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Riesgos abiertos', data.riesgos_abiertos, clr.rojo],
          ['Mitigados', data.riesgos_mitigados, clr.verde],
          ['Aceptados', data.riesgos_aceptados, clr.azul],
          ['Escalados al Comite', data.riesgos_escalados_comite, clr.amarillo],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl p-3 border" style={{ background: `${color}06`, borderColor: `${color}20` }}>
            <p className="text-[9px] uppercase tracking-wider text-slate-500">{label}</p>
            <p className="text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>
      <RiskHeatmap risks={risks} onSelect={onSelect} />
      <EthicalFrameworks frameworks={data.marcos_eticos} />
    </div>
  )
}

function EthicalFrameworks({ frameworks }) {
  return (
    <Block title="Supervision Etica UE - UNESCO - CONPES" icon={Eye} accent={clr.violeta}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {frameworks.map(frame => (
          <div key={frame.marco} className="rounded-lg p-3 border" style={{ background: clr.bg, borderColor: clr.borde }}>
            <p className="text-xs font-bold text-slate-200 mb-2">{frame.marco}</p>
            <div className="space-y-2">
              {frame.principios.map(p => {
                const color = statusColor(p.estado)
                return (
                  <div key={p.nombre}>
                    <div className="flex items-center justify-between gap-2 text-[9px] mb-1">
                      <span className="text-slate-400 truncate">{p.nombre}</span>
                      <span className="font-bold tabular-nums" style={{ color }}>{p.valor}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                      <div className="h-full rounded-full" style={{ width: `${p.valor}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Block>
  )
}

function ModelData({ data }) {
  return (
    <div className="space-y-5">
      <Block title="Modelo y Datos" icon={HeartPulse} accent={clr.cyan}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            ['Calidad datos', `${data.calidad_general_datos}%`, clr.verde],
            ['MAE actual', `${data.mae_actual_pct}%`, data.mae_actual_pct > 15 ? clr.rojo : clr.verde],
            ['RMSE', data.rmse_actual, clr.azul],
            ['Estado predictivo', data.estado_predictivo, clr.amarillo],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-lg p-2.5 border" style={{ background: `${color}06`, borderColor: `${color}20` }}>
              <p className="text-[8px] uppercase tracking-wider text-slate-500">{label}</p>
              <p className="text-lg font-bold tabular-nums leading-tight" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.calidad_fuentes} margin={{ top: 4, right: 16, bottom: 4, left: -20 }}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis dataKey="fuente" tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
              <Tooltip content={<DarkTip />} />
              <Bar dataKey="calidad" name="Calidad" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                {data.calidad_fuentes.map(item => <Cell key={item.fuente} fill={statusColor(item.estado)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.error_municipios} margin={{ top: 4, right: 16, bottom: 4, left: -20 }}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis dataKey="municipio" tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} />
              <Tooltip content={<DarkTip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
              <Bar dataKey="demanda_real" name="Real" fill={clr.cyan} radius={[3, 3, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="demanda_predicha" name="Predicha" fill={clr.violeta} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Block>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Anonimizacion exitosa', data.anonimizacion_exitosa_pct, clr.verde],
          ['k-anonimidad', data.cumplimiento_k_anonimidad_pct, clr.verde],
          ['Drift datos', data.data_drift, clr.amarillo],
          ['Alertas inequidad', data.fairness.alertas_inequidad, clr.rojo],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl p-3 border" style={{ background: `${color}06`, borderColor: `${color}20` }}>
            <p className="text-[9px] uppercase tracking-wider text-slate-500">{label}</p>
            <p className="text-xl font-bold tabular-nums" style={{ color }}>{value}{typeof value === 'number' && label !== 'Alertas inequidad' ? '%' : ''}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecurityPrivacy({ data }) {
  return (
    <Block title="Seguridad y Privacidad" icon={LockKeyhole} accent={clr.amarillo}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          ['Eventos seguridad', data.eventos_seguridad, clr.verde],
          ['Accesos no autorizados', data.intentos_acceso_no_autorizado, clr.verde],
          ['Usuarios DWH', data.usuarios_dwh, clr.azul],
          ['Ley 1581', `${data.cumplimiento_ley_1581}%`, clr.amarillo],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-lg p-2.5 border" style={{ background: `${color}06`, borderColor: `${color}20` }}>
            <p className="text-[8px] uppercase tracking-wider text-slate-500">{label}</p>
            <p className="text-lg font-bold tabular-nums" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_180px] gap-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.accesos_por_rol} margin={{ top: 4, right: 16, bottom: 4, left: -20 }}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey="rol" tick={{ fill: '#94a3b8', fontSize: 9 }} interval={0} />
            <YAxis tick={{ fill: '#475569', fontSize: 9 }} />
            <Tooltip content={<DarkTip />} />
            <Bar dataKey="usuarios" name="Usuarios" fill={clr.amarillo} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
        <div className="rounded-lg p-3 border" style={{ background: clr.bg, borderColor: clr.borde }}>
          <p className="text-[9px] uppercase tracking-wider text-slate-500">Cifrado AES-256</p>
          <p className="text-xl font-bold text-green-400">{data.estado_aes_256}</p>
          <p className="text-[9px] text-slate-500 mt-2">Logs auditoria: <strong className="text-slate-300">{data.logs_auditoria}%</strong></p>
          <p className="text-[9px] text-slate-500">Consultas DWH mes: <strong className="text-slate-300">{data.consultas_dwh_mes}</strong></p>
        </div>
      </div>
    </Block>
  )
}

function PublicValue({ data }) {
  return (
    <Block title="Valor Publico e Impacto Institucional" icon={Sparkles} accent={clr.verde}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.indicadores} margin={{ top: 4, right: 16, bottom: 4, left: -20 }}>
          <CartesianGrid stroke="#1e293b" vertical={false} />
          <XAxis dataKey="nombre" tick={{ fill: '#94a3b8', fontSize: 9 }} interval={0} />
          <YAxis tick={{ fill: '#475569', fontSize: 9 }} />
          <Tooltip content={<DarkTip />} />
          <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
          <Bar dataKey="antes" name="Antes SIAGP" fill={clr.gris} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="despues" name="Despues SIAGP" fill={clr.verde} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mt-3">
        {data.indicadores.map(item => (
          <div key={item.nombre} className="rounded-lg p-2.5 border" style={{ background: clr.bg, borderColor: clr.borde }}>
            <p className="text-[9px] text-slate-500 truncate">{item.nombre}</p>
            <p className="text-lg font-bold tabular-nums text-green-400">+{item.mejora}<span className="text-[10px] text-slate-500 ml-1">{item.unidad}</span></p>
          </div>
        ))}
      </div>
    </Block>
  )
}

function RiskHeatmap({ risks, onSelect }) {
  return (
    <Block title="Mapa Ejecutivo de Riesgos IA - NIST AI RMF" icon={ShieldAlert} accent={clr.rojo}>
      <div className="grid grid-cols-[52px_repeat(5,minmax(0,1fr))] gap-1.5 text-[8px] text-slate-500 mb-2">
        <div />
        {[1, 2, 3, 4, 5].map(n => <div key={n} className="text-center">P{n}</div>)}
      </div>
      <div className="grid grid-cols-[52px_repeat(5,minmax(0,1fr))] gap-1.5">
        {[5, 4, 3, 2, 1].map(impacto => (
          <div key={impacto} className="contents">
            <div className="text-[8px] text-slate-500 flex items-center">I{impacto}</div>
            {[1, 2, 3, 4, 5].map(probabilidad => {
              const risk = risks.find(r => r.probabilidad === probabilidad && r.impacto === impacto)
              const score = probabilidad * impacto
              const bg = score >= 15 ? 'rgba(239,68,68,0.18)' : score >= 10 ? 'rgba(245,158,11,0.14)' : 'rgba(59,130,246,0.08)'
              return (
                <button
                  key={`${impacto}-${probabilidad}`}
                  onClick={() => risk && onSelect(risk)}
                  title={risk ? `${risk.categoria}: ${risk.riesgo}` : `Probabilidad ${probabilidad} / Impacto ${impacto}`}
                  className="relative h-14 rounded-lg border outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  style={{ background: bg, borderColor: risk ? `${statusColor(risk.nivel)}55` : clr.borde, cursor: risk ? 'pointer' : 'default' }}
                >
                  {risk && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{
                          width: 22 + risk.score * 1.7,
                          height: 22 + risk.score * 1.7,
                          background: `${statusColor(risk.nivel)}28`,
                          border: `2px solid ${statusColor(risk.nivel)}`,
                          color: statusColor(risk.nivel),
                        }}>
                        {risk.categoria.slice(0, 3)}
                      </span>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
        {risks.map(r => (
          <button key={r.id} onClick={() => onSelect(r)}
            className="text-left rounded-lg p-2.5 border hover:bg-white/[0.03] transition-colors"
            style={{ background: clr.bg, borderColor: clr.borde }}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[11px] font-bold text-slate-200 truncate">{r.categoria}</p>
              <Sbadge label={r.nivel} />
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed line-clamp-2">{r.riesgo}</p>
          </button>
        ))}
      </div>
    </Block>
  )
}

function Compliance({ items }) {
  return (
    <Block title="Cumplimiento Regulatorio" icon={Scale} accent={clr.azul}>
      <div className="space-y-2">
        {items.map(m => {
          const color = statusColor(m.estado)
          return (
            <div key={m.nombre} className="rounded-lg p-3 border" style={{ background: clr.bg, borderColor: clr.borde }}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-[11px] font-bold text-slate-200">{m.nombre}</p>
                <Sbadge label={m.estado} color={color} />
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: '#1e293b' }}>
                <div className="h-full rounded-full" style={{ width: `${m.valor}%`, background: color }} />
              </div>
              <p className="text-[9px] text-slate-500 leading-relaxed">{m.detalle}</p>
            </div>
          )
        })}
      </div>
    </Block>
  )
}

function SystemIdentity({ meta, roles }) {
  return (
    <Block title="Identificacion del Sistema SIAGP" icon={BrainCircuit} accent={clr.violeta}>
      <p className="text-[10px] text-slate-400 leading-relaxed mb-3">{meta.tipo_sistema}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        {Object.entries(roles).map(([k, v]) => (
          <div key={k} className="rounded-lg p-2.5 border" style={{ background: clr.bg, borderColor: clr.borde }}>
            <p className="text-[8px] uppercase tracking-wider text-slate-600">{k.replaceAll('_', ' ')}</p>
            <p className="text-[10px] font-semibold text-slate-300">{v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg p-2.5 border" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.18)' }}>
        <p className="text-[9px] text-red-300 font-bold mb-1">Lineas rojas</p>
        <p className="text-[9px] text-slate-500 leading-relaxed">{meta.exclusiones}</p>
      </div>
    </Block>
  )
}

function Ethics({ data }) {
  const radar = data.radar.map(item => ({ dimension: item.nombre, valor: item.valor }))

  return (
    <Block title="Etica y Confianza" icon={Eye} accent={clr.violeta}>
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
        <div>
          <div className="rounded-lg p-3 border mb-3" style={{ background: clr.bg, borderColor: clr.borde }}>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">Indice Global de Confianza IA</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold tabular-nums" style={{ color: statusColor(data.estado) }}>{data.indice_global}%</p>
              <Sbadge label={data.estado} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radar} margin={{ top: 12, right: 28, bottom: 12, left: 28 }}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 8 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#334155', fontSize: 6 }} tickCount={4} />
              <Radar name="Confianza" dataKey="valor" stroke={clr.violeta} fill={clr.violeta} fillOpacity={0.18} strokeWidth={2} dot={{ r: 2, fill: clr.violeta }} isAnimationActive={false} />
              <Tooltip content={<DarkTip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.radar.map(item => (
            <div key={item.nombre} className="flex items-start gap-2.5 rounded-lg p-2.5 border"
              style={{ background: clr.bg, borderColor: clr.borde }}>
              <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: statusColor(item.estado) }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold text-slate-200">{item.nombre}</p>
                  <span className="text-[10px] font-bold tabular-nums" style={{ color: statusColor(item.estado) }}>{item.valor}%</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">{item.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Block>
  )
}

function HumanSupervision({ data }) {
  const alert = data.tasa_discrepancia < data.rango_discrepancia_min || data.tasa_discrepancia > data.rango_discrepancia_max
  return (
    <Block title="Supervision Humana HITL" icon={UserCheck} accent={alert ? clr.amarillo : clr.verde}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          ['Deliberacion humana', data.tasa_deliberacion, clr.verde, '%'],
          ['Discrepancia Humano vs IA', data.tasa_discrepancia, alert ? clr.rojo : clr.verde, '%'],
          ['Decisiones justificadas', data.decisiones_justificadas, clr.verde, '%'],
          ['Muestra auditoria HITL', data.muestra_auditoria, clr.azul, '%'],
        ].map(([label, value, color, suffix]) => (
          <div key={label} className="rounded-lg p-3 border" style={{ background: `${color}06`, borderColor: `${color}20` }}>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">{label}</p>
            <p className="text-xl font-bold tabular-nums leading-tight" style={{ color }}>{value}{suffix}</p>
          </div>
        ))}
      </div>
      {alert && (
        <div className="rounded-lg px-3 py-2 text-[10px] text-slate-300 flex items-start gap-2 mb-4"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)' }}>
          <AlertTriangle size={13} style={{ color: clr.rojo }} className="mt-0.5 shrink-0" />
          <span>{data.alerta}</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data.historial} margin={{ top: 4, right: 14, bottom: 4, left: -20 }}>
          <CartesianGrid stroke="#1e293b" vertical={false} />
          <XAxis dataKey="periodo" tick={{ fill: '#94a3b8', fontSize: 9 }} />
          <YAxis tick={{ fill: '#475569', fontSize: 9 }} />
          <Tooltip content={<DarkTip />} />
          <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
          <Bar dataKey="deliberacion" name="Deliberacion" fill={clr.verde} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="discrepancia" name="Discrepancia" fill={alert ? clr.rojo : clr.amarillo} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="justificacion" name="Justificacion" fill={clr.azul} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </Block>
  )
}

function CitizenChallenge({ data }) {
  return (
    <Block title="Impugnaciones Ciudadanas" icon={FileSearch} accent={clr.cyan}>
      <div className="flex items-center justify-between mb-3">
        <Sbadge label={data.estado} />
        <span className="text-[10px] text-slate-500">SLA: {data.sla_horas}h</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          ['Abiertas', data.abiertas, clr.amarillo],
          ['En revision', data.en_revision, clr.azul],
          ['Resueltas', data.resueltas, clr.verde],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-lg p-2.5 border" style={{ background: `${color}06`, borderColor: `${color}20` }}>
            <p className="text-[8px] uppercase tracking-wider text-slate-500">{label}</p>
            <p className="text-lg font-bold tabular-nums" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">{data.descripcion}</p>
    </Block>
  )
}

function SystemHealth({ data }) {
  return (
    <Block title="Salud del Sistema IA" icon={HeartPulse} accent={clr.cyan}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {data.map(item => {
          const color = statusColor(item.estado)
          return (
            <div key={item.nombre} className="rounded-lg p-2.5 border" style={{ background: `${color}06`, borderColor: `${color}20` }}>
              <p className="text-[9px] text-slate-500 leading-tight min-h-8">{item.nombre}</p>
              <p className="text-lg font-bold tabular-nums leading-tight" style={{ color }}>{item.valor}%</p>
              <p className="text-[8px] text-slate-500 leading-tight">{item.meta}</p>
            </div>
          )
        })}
      </div>
    </Block>
  )
}

function Trends({ data }) {
  return (
    <Block title="Tendencias de Gobierno IA" icon={TrendingUp} accent={clr.verde}>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -18 }}>
          <CartesianGrid stroke="#1e293b" vertical={false} />
          <XAxis dataKey="periodo" tick={{ fill: '#94a3b8', fontSize: 9 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
          <Tooltip content={<DarkTip />} />
          <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
          <Line type="monotone" dataKey="riesgo" name="Riesgo" stroke={clr.rojo} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="cumplimiento" name="Cumplimiento" stroke={clr.azul} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="madurez" name="Madurez" stroke={clr.violeta} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="precision" name="Precision" stroke={clr.verde} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="calidad_datos" name="Calidad datos" stroke={clr.cyan} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </Block>
  )
}

function Auditability({ data }) {
  const pie = [
    { name: 'Ejecutadas', value: data.ejecutadas, color: clr.verde },
    { name: 'Programadas', value: data.programadas, color: clr.azul },
    { name: 'Pendientes', value: data.pendientes, color: clr.amarillo },
  ]

  return (
    <Block title="Auditoria, Trazabilidad y Evidencias" icon={FileSearch} accent={clr.amarillo}>
      <div className="grid grid-cols-1 xl:grid-cols-[230px_1fr] gap-4">
        <div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={3} isAnimationActive={false}>
                {pie.map(item => <Cell key={item.name} fill={item.color} />)}
              </Pie>
              <Tooltip content={<DarkTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2">
            {pie.map(item => (
              <div key={item.name} className="text-center">
                <p className="text-base font-bold tabular-nums" style={{ color: item.color }}>{item.value}</p>
                <p className="text-[8px] text-slate-500">{item.name}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-2.5 border mt-3" style={{ background: clr.bg, borderColor: clr.borde }}>
            <p className="text-[9px] text-slate-500">Trazabilidad</p>
            <p className="text-xl font-bold tabular-nums" style={{ color: clr.amarillo }}>{data.trazabilidad}%</p>
            <p className="text-[8px] text-slate-500">{data.evidencias} evidencias clave</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${clr.borde}` }}>
                {['Auditoria', 'Frecuencia', 'Responsable', 'Estado'].map(h => (
                  <th key={h} className="text-left pb-1.5 pr-3 text-slate-500 font-semibold uppercase tracking-wider text-[8px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((a, i) => (
                <tr key={a.tipo} style={{ borderBottom: i < data.items.length - 1 ? `1px solid ${clr.borde}` : 'none' }}>
                  <td className="py-2 pr-3">
                    <p className="text-[10px] text-slate-200 font-medium">{a.tipo}</p>
                    <p className="text-[8px] text-slate-500">{a.artefacto}</p>
                  </td>
                  <td className="py-2 pr-3 text-[9px] text-slate-400">{a.frecuencia}</td>
                  <td className="py-2 pr-3 text-[9px] text-slate-400">{a.responsable}</td>
                  <td className="py-2"><Sbadge label={a.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Block>
  )
}

function StrategicAlerts({ items }) {
  return (
    <Block title="Alertas Estrategicas" icon={AlertTriangle} accent={clr.rojo}>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.titulo} className="rounded-lg p-3 border" style={{ background: clr.bg, borderColor: clr.borde }}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[11px] font-bold text-slate-200">{item.titulo}</p>
              <Sbadge label={item.prioridad} />
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">{item.descripcion}</p>
          </div>
        ))}
      </div>
    </Block>
  )
}

function StrategicImpact({ items }) {
  return (
    <Block title="Impacto Estrategico SIAGP" icon={Sparkles} accent={clr.violeta}>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {items.map(item => (
          <div key={item.nombre} className="rounded-lg p-3 border" style={{ background: clr.bg, borderColor: clr.borde }}>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 min-h-7">{item.nombre}</p>
            <p className="text-lg font-bold text-slate-100 leading-tight mt-1">
              {item.valor}<span className="text-[10px] text-slate-500 ml-1">{item.suffix}</span>
            </p>
            <div className="h-1.5 rounded-full overflow-hidden my-2" style={{ background: '#1e293b' }}>
              <div className="h-full rounded-full" style={{ width: `${item.impacto}%`, background: clr.violeta }} />
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">{item.descripcion}</p>
          </div>
        ))}
      </div>
    </Block>
  )
}

function ExecutiveExplainability({ items }) {
  return (
    <Block title="Explicabilidad Ejecutiva" icon={Info} accent={clr.cyan}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map(item => (
          <div key={item.pregunta} className="rounded-lg p-3 border" style={{ background: clr.bg, borderColor: clr.borde }}>
            <p className="text-[11px] font-bold text-slate-200 mb-1">{item.pregunta}</p>
            <p className="text-[9px] text-slate-500 leading-relaxed">{item.respuesta}</p>
          </div>
        ))}
      </div>
    </Block>
  )
}

function Roadmap({ items }) {
  return (
    <Block title="Hoja de Ruta AIMS" icon={GitBranch} accent={clr.verde}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {items.map((item, idx) => {
          const color = statusColor(item.estado)
          return (
            <div key={item.fase} className="rounded-lg p-3 border" style={{ background: clr.bg, borderColor: clr.borde }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}>
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-200 truncate">{item.fase}</p>
                  <p className="text-[8px] text-slate-500">{item.periodo}</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: '#1e293b' }}>
                <div className="h-full rounded-full" style={{ width: `${item.avance}%`, background: color }} />
              </div>
              <Sbadge label={item.estado} color={color} />
            </div>
          )
        })}
      </div>
    </Block>
  )
}

function RiskModal({ risk, onClose }) {
  if (!risk) return null
  const color = statusColor(risk.nivel)
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: 'rgba(2,6,23,0.72)' }}>
      <div className="w-full max-w-xl rounded-xl border shadow-2xl" style={{ background: clr.card, borderColor: clr.borde }}>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: clr.borde }}>
          <div className="flex items-center gap-2">
            <ShieldAlert size={15} style={{ color }} />
            <div>
              <p className="text-sm font-bold text-white">{risk.categoria}</p>
              <p className="text-[10px] text-slate-500">{risk.id} - P{risk.probabilidad} / I{risk.impacto}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5" aria-label="Cerrar detalle">
            <X size={15} className="text-slate-400" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Sbadge label={risk.nivel} color={color} />
            <span className="text-[10px] text-slate-500">Score ejecutivo: <strong className="text-slate-300">{risk.score}</strong></span>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">Riesgo</p>
            <p className="text-[12px] text-slate-200 leading-relaxed">{risk.riesgo}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">Control principal</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">{risk.control}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">Lectura ejecutiva</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">{risk.detalle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GobiernoIA() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('2026-06')
  const [selectedRisk, setSelectedRisk] = useState(null)

  useEffect(() => {
    fetch(`${DATA_URL}?t=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
      .then(json => {
        const arr = Array.isArray(json) ? json : [json]
        setData(arr[0])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error cargando Gobierno_IA_data.json:', err)
        setLoading(false)
      })
  }, [])

  const trendData = useMemo(() => {
    if (!data) return []
    const idx = data.filtros_temporales.findIndex(f => f.id === selectedPeriod)
    return data.capa3_salud_auditoria_valor.tendencias.slice(0, idx + 1)
  }, [data, selectedPeriod])

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: '#1e3a5f', borderTopColor: clr.violeta }} />
          <p className="text-xs text-slate-500">Cargando Gobierno_IA_data.json...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <p className="text-sm text-red-400">No se pudo cargar <code>data/Gobierno_IA_data.json</code></p>
      </div>
    )
  }

  const capa1 = data.capa1_gobierno_riesgo_cumplimiento
  const capa2 = data.capa2_etica_confianza_supervision
  const capa3 = data.capa3_salud_auditoria_valor
  const modulos = data.modulos_ejecutivos
  const resumen = data.resumen_ejecutivo

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 rounded-xl px-4 py-3 border"
        style={{ background: clr.card, borderColor: clr.borde }}>
        <div className="flex items-center gap-3 flex-wrap">
          <BrainCircuit size={14} style={{ color: clr.violeta }} />
          <span className="text-xs font-bold text-slate-200">Gobierno de IA</span>
          <span className="text-[10px] text-slate-500">SIAGP - Doc. {data.meta.documento_base} v{data.meta.version}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="text-xs rounded-lg px-2 py-1.5 outline-none"
            style={{ background: clr.bg, border: `1px solid ${clr.borde}`, color: '#e2e8f0' }}
          >
            {data.filtros_temporales.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
          <span className="flex items-center gap-1" style={{ color: statusColor(resumen.dictamen) }}>
            <ClipboardCheck size={10} />
            {resumen.go_no_go}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays size={10} />
            Periodo: <strong className="text-slate-300 ml-1">{data.meta.periodo_reporte}</strong>
          </span>
          <span>Generado: <strong className="text-slate-300">{fmtDate(data.meta.fecha_generacion)}</strong></span>
        </div>
      </div>

      <SectionTitle eyebrow="Modulo 1" title="Estado General de Gobernanza" icon={Gauge} accent={clr.verde} />
      <KpiStrip items={resumen.indicadores} />
      <div className="rounded-xl px-4 py-3 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2"
        style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
        <Target size={13} style={{ color: clr.violeta }} className="mt-0.5 shrink-0" />
        <span>{resumen.lectura}</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5 items-start">
        <div className="space-y-5">
          <GovernanceScore data={modulos.estado_general_gobernanza} resumen={resumen} />
          <IsoGovernance data={modulos.gobierno_iso_42001} />
        </div>
        <div className="space-y-5">
          <SystemIdentity meta={data.meta} roles={capa1.sistema} />
          <Compliance items={capa1.cumplimiento} />
        </div>
      </div>

      <SectionTitle eyebrow="Modulo 2" title="Riesgos y Etica" icon={ShieldAlert} accent={clr.rojo} />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5 items-start">
        <div className="space-y-5">
          <RiskEthics data={modulos.riesgos_etica} risks={capa1.riesgos_nist} onSelect={setSelectedRisk} />
        </div>
        <div className="space-y-5">
          <Ethics data={capa2} />
          <CitizenChallenge data={capa2.impugnaciones_ciudadanas} />
        </div>
      </div>

      <SectionTitle eyebrow="Modulo 3" title="Modelo y Datos" icon={HeartPulse} accent={clr.cyan} />
      <ModelData data={modulos.modelo_datos} />
      <HumanSupervision data={capa2.supervision_humana} />

      <SectionTitle eyebrow="Modulo 4" title="Seguridad y Privacidad" icon={LockKeyhole} accent={clr.amarillo} />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5 items-start">
        <div className="space-y-5">
          <SecurityPrivacy data={modulos.seguridad_privacidad} />
          <SystemHealth data={capa3.salud_sistema} />
          <Trends data={trendData} />
          <Auditability data={capa3.auditoria} />
        </div>
        <div className="space-y-5 xl:sticky xl:top-24">
          <StrategicAlerts items={capa3.alertas_estrategicas} />
          <Roadmap items={data.hoja_ruta} />
          <ExecutiveExplainability items={capa3.explicabilidad} />
        </div>
      </div>

      <SectionTitle eyebrow="Modulo 5" title="Valor Publico" icon={Sparkles} accent={clr.verde} />
      <PublicValue data={modulos.valor_publico} />
      <StrategicImpact items={capa3.impacto_estrategico} />

      <RiskModal risk={selectedRisk} onClose={() => setSelectedRisk(null)} />
    </div>
  )
}
