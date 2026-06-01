import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts'
import {
  AlertTriangle, BrainCircuit, CalendarDays, CheckCircle2, ClipboardCheck,
  Eye, FileSearch, Gauge, GitBranch, HeartPulse, Scale, ShieldAlert,
  ShieldCheck, Sparkles, Target, TrendingUp,
} from 'lucide-react'

const DATA_URL = '/data/Gobierno_IA_data.json'

const clr = {
  rojo: '#ef4444', amarillo: '#f59e0b', verde: '#22c55e',
  gris: '#6b7280', azul: '#3b82f6', violeta: '#8b5cf6',
  cyan: '#06b6d4', card: '#0f172a', borde: '#1e293b', bg: '#0b1829',
}

function statusColor(status) {
  const s = (status || '').toUpperCase()
  if (['CRITICO', 'CRÍTICO', 'ALTO', 'ALTA', 'ALTO RIESGO'].some(x => s.includes(x))) return clr.rojo
  if (['MEDIO', 'MEDIA', 'ALERTA', 'CONDICIONADO', 'PENDIENTE', 'EN CURSO', 'IMPLEMENTACION'].some(x => s.includes(x))) return clr.amarillo
  if (['CONFORME', 'CUBIERTA', 'ALINEADO', 'CONTROL', 'COMPLETADA', 'GOBERNADO'].some(x => s.includes(x))) return clr.verde
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

function DarkTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl"
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

function RiskOverview({ data }) {
  const bars = data.categorias.map(c => ({ ...c, color: statusColor(c.nivel) }))

  return (
    <Block title="Riesgo de IA - NIST AI RMF" icon={ShieldAlert} accent={clr.rojo}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          ['Criticos', data.criticos, clr.rojo],
          ['Altos', data.altos, clr.amarillo],
          ['Medios', data.medios, clr.azul],
          ['Total riesgos', data.total_riesgos, clr.violeta],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-lg p-3 border" style={{ background: `${color}06`, borderColor: `${color}20` }}>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">{label}</p>
            <p className="text-xl font-bold tabular-nums leading-tight" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart layout="vertical" data={bars} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
          <YAxis type="category" dataKey="nombre" width={88} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip content={<DarkTip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="score" name="Exposicion" barSize={10} radius={[0, 3, 3, 0]} isAnimationActive={false}>
            {bars.map(item => <Cell key={item.nombre} fill={item.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="space-y-2 mt-3">
        {data.categorias.map(item => (
          <div key={item.nombre} className="rounded-lg p-2.5 border" style={{ background: clr.bg, borderColor: clr.borde }}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[11px] font-bold text-slate-200">{item.nombre}</p>
              <Sbadge label={item.nivel} />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">{item.riesgos}</p>
            <p className="text-[9px] text-slate-400 mt-1">{item.control}</p>
          </div>
        ))}
      </div>
    </Block>
  )
}

function Compliance({ data }) {
  return (
    <Block title="Cumplimiento y Gobierno" icon={Scale} accent={clr.azul}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">Madurez SGIA/AIMS</p>
          <p className="text-2xl font-bold tabular-nums" style={{ color: clr.amarillo }}>{data.madurez}%</p>
        </div>
        <Sbadge label={data.estado} />
      </div>
      <div className="space-y-2">
        {data.marcos.map(m => {
          const color = statusColor(m.estado)
          return (
            <div key={m.nombre} className="rounded-lg p-3 border" style={{ background: clr.bg, borderColor: clr.borde }}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-[11px] font-bold text-slate-200">{m.nombre}</p>
                <Sbadge label={m.estado} color={color} />
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: '#1e293b' }}>
                <div className="h-full rounded-full" style={{ width: `${m.alineacion}%`, background: color }} />
              </div>
              <p className="text-[9px] text-slate-500 leading-relaxed">{m.detalle}</p>
            </div>
          )
        })}
      </div>
    </Block>
  )
}

function Ethics({ data }) {
  const radar = data.semaforo.map(item => ({ dimension: item.nombre, valor: item.valor }))

  return (
    <Block title="Etica y Confianza" icon={Eye} accent={clr.violeta}>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        <div>
          <div className="rounded-lg p-3 border mb-3" style={{ background: clr.bg, borderColor: clr.borde }}>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">Indice global</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold tabular-nums" style={{ color: statusColor(data.estado) }}>{data.indice_global}%</p>
              <Sbadge label={data.estado} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
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
          {data.semaforo.map(item => (
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

function SystemHealth({ data }) {
  return (
    <Block title="Desempeno y Salud del Sistema" icon={HeartPulse} accent={clr.cyan}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-slate-500">Estado general de operacion gobernada</p>
        <Sbadge label={data.estado_general} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
        {data.indicadores.map(item => {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {data.modulos.map(mod => (
          <div key={mod.id} className="rounded-lg p-3 border" style={{ background: clr.bg, borderColor: clr.borde }}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[11px] font-bold text-slate-200">{mod.nombre}</p>
              <Sbadge label={mod.estado} />
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">{mod.uso}</p>
          </div>
        ))}
      </div>
    </Block>
  )
}

function Auditability({ data }) {
  return (
    <Block title="Auditoria y Trazabilidad" icon={FileSearch} accent={clr.amarillo}>
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
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
              {data.auditorias.map((a, i) => (
                <tr key={a.tipo} style={{ borderBottom: i < data.auditorias.length - 1 ? `1px solid ${clr.borde}` : 'none' }}>
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
        <div className="space-y-2">
          {data.hallazgos.map(item => (
            <div key={item.titulo} className="rounded-lg p-3 border" style={{ background: clr.bg, borderColor: clr.borde }}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-[11px] font-bold text-slate-200">{item.titulo}</p>
                <Sbadge label={item.prioridad} />
              </div>
              <p className="text-[9px] text-slate-500 leading-relaxed">{item.descripcion}</p>
            </div>
          ))}
        </div>
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

function StrategicImpact({ items }) {
  return (
    <Block title="Impacto Estrategico" icon={Sparkles} accent={clr.violeta}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {items.map(item => (
          <div key={item.nombre} className="rounded-lg p-3 border" style={{ background: clr.bg, borderColor: clr.borde }}>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">{item.nombre}</p>
            <p className="text-base font-bold text-slate-100 leading-tight mt-1">{item.valor}</p>
            <p className="text-[9px] text-slate-500 leading-relaxed mt-1">{item.descripcion}</p>
          </div>
        ))}
      </div>
    </Block>
  )
}

export default function GobiernoIA() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

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

  const resumen = data.resumen_ejecutivo

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 rounded-xl px-4 py-3 border"
        style={{ background: clr.card, borderColor: clr.borde }}>
        <div className="flex items-center gap-3 flex-wrap">
          <BrainCircuit size={14} style={{ color: clr.violeta }} />
          <span className="text-xs font-bold text-slate-200">Gobierno de IA</span>
          <span className="text-[10px] text-slate-500">Doc. {data.meta.documento_base} v{data.meta.version}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-500 flex-wrap">
          <span className="flex items-center gap-1" style={{ color: statusColor(resumen.dictamen) }}>
            <ClipboardCheck size={10} />
            {resumen.dictamen}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays size={10} />
            Periodo: <strong className="text-slate-300 ml-1">{data.meta.periodo_reporte}</strong>
          </span>
          <span>Generado: <strong className="text-slate-300">{fmtDate(data.meta.fecha_generacion)}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {resumen.indicadores.map(item => {
          const color = statusColor(item.estado)
          return (
            <div key={item.label} className="rounded-xl p-3 border flex items-center gap-3"
              style={{ background: `${color}06`, borderColor: `${color}20` }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">{item.label}</p>
                <p className="text-lg font-bold tabular-nums leading-tight" style={{ color }}>
                  {item.value}<span className="text-xs text-slate-500 font-normal">{item.suffix}</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl px-4 py-3 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2"
        style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
        <Target size={13} style={{ color: clr.violeta }} className="mt-0.5 shrink-0" />
        <span>{resumen.impacto_estrategico}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5 items-start">
        <div className="space-y-5">
          <RiskOverview data={data.riesgo_ia} />
          <Ethics data={data.etica_confianza} />
          <SystemHealth data={data.desempeno_salud} />
          <Auditability data={data.auditoria_trazabilidad} />
        </div>
        <div className="space-y-5 xl:sticky xl:top-24">
          <Compliance data={data.cumplimiento_gobierno} />
          <StrategicImpact items={data.impacto_estrategico} />
          <Roadmap items={data.hoja_ruta} />

          <div className="rounded-xl border p-4" style={{ background: clr.card, borderColor: clr.borde }}>
            <div className="flex items-center gap-2 mb-3">
              <Gauge size={13} style={{ color: clr.cyan }} />
              <p className="text-xs font-bold text-slate-200">Controles obligatorios de salida</p>
            </div>
            <div className="space-y-2">
              {data.etica_confianza.salvaguardas.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed">
                  {i < 2 ? <CheckCircle2 size={12} style={{ color: clr.verde }} className="mt-0.5 shrink-0" /> : <AlertTriangle size={12} style={{ color: clr.amarillo }} className="mt-0.5 shrink-0" />}
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ background: clr.card, borderColor: clr.borde }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={13} style={{ color: clr.verde }} />
              <p className="text-xs font-bold text-slate-200">Lectura ejecutiva</p>
            </div>
            <div className="space-y-2 text-[10px] text-slate-400 leading-relaxed">
              <p><ShieldCheck size={12} className="inline mr-1" style={{ color: clr.verde }} /> Arquitectura gobernable y alineada con ISO/IEC 42001.</p>
              <p><AlertTriangle size={12} className="inline mr-1" style={{ color: clr.amarillo }} /> Paso a produccion condicionado a privacidad, trazabilidad y equidad.</p>
              <p><BrainCircuit size={12} className="inline mr-1" style={{ color: clr.violeta }} /> SIAGP debe operar como soporte a decisiones, no como decisor autonomo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
