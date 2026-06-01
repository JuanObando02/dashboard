import { BrainCircuit, Timer, GitMerge, Scale, Eye, AlertTriangle } from 'lucide-react'

const clr = {
  rojo: '#ef4444', amarillo: '#f59e0b', verde: '#22c55e',
  gris: '#6b7280', azul: '#3b82f6', violeta: '#8b5cf6',
  cyan: '#06b6d4', card: '#0f172a', borde: '#1e293b', bg: '#0b1829',
}

const SIAGP = [
  {
    id: 'M01', nombre: 'Motor de Series de Tiempo', icon: Timer, color: clr.violeta,
    descripcion: 'Predicción de ocupación hospitalaria para las 266 camas. Anticipa picos de demanda y optimiza la asignación de recursos clínicos en tiempo real.',
    kpi: 'RMSE < 5 camas · Horizonte 7 días',
  },
  {
    id: 'M02', nombre: 'Process Mining', icon: GitMerge, color: clr.cyan,
    descripcion: 'Descubrimiento y análisis de cuellos de botella en flujos clínicos y procesos PQRSD. Identifica variantes y realiza conformance checking contra el proceso estándar.',
    kpi: 'Reducción tiempos de atención > 15%',
  },
  {
    id: 'M03', nombre: 'Módulo FURAG', icon: Scale, color: clr.amarillo,
    descripcion: 'Automatización del reporte de valor público para el sistema FURAG del DAFP. Consolidación de evidencias y generación automática de informes de gestión.',
    kpi: 'Formulario FURAG precargado ≥ 80%',
  },
]

export default function GobiernoIA() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3 rounded-xl px-4 py-3 border"
        style={{ background: clr.card, borderColor: clr.borde }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <BrainCircuit size={16} style={{ color: clr.violeta }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Gobierno de IA</h2>
            <p className="text-[11px] text-slate-400">Hub de Valor Público — SIAGP</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(234,179,8,0.12)', color: clr.amarillo, border: '1px solid rgba(234,179,8,0.3)' }}>
          En construcción
        </span>
      </div>

      {/* Warning banner */}
      <div className="rounded-xl px-4 py-3 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2"
        style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
        <AlertTriangle size={13} style={{ color: clr.amarillo }} className="mt-0.5 shrink-0" />
        Documento v1.3 pendiente · Marco ético y metodológico en elaboración — requiere aprobación del Comité de Ética e Investigación del HDPUV
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {SIAGP.map(mod => (
          <div key={mod.id} className="rounded-xl border p-4 flex flex-col gap-3"
            style={{ background: clr.card, borderColor: clr.borde }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg shrink-0 mt-0.5"
                style={{ background: `${mod.color}15`, border: `1px solid ${mod.color}30` }}>
                <mod.icon size={16} style={{ color: mod.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-bold text-slate-200">{mod.nombre}</p>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: 'rgba(107,114,128,0.15)', color: clr.gris, border: '1px solid rgba(107,114,128,0.3)' }}>
                    NO INICIADO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{mod.descripcion}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] mt-auto"
              style={{ background: `${mod.color}0a`, border: `1px solid ${mod.color}20` }}>
              <span className="text-slate-500 shrink-0">KPI de éxito:</span>
              <span style={{ color: mod.color }} className="font-semibold">{mod.kpi}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Principles */}
      <div className="rounded-xl border p-4" style={{ background: clr.card, borderColor: clr.borde }}>
        <div className="flex items-center gap-2 mb-4">
          <Eye size={13} style={{ color: '#94a3b8' }} />
          <p className="text-sm font-bold text-slate-200">Principios de Gobierno IA</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            'Transparencia algorítmica',
            'Equidad y no discriminación',
            'Supervisión humana',
            'Privacidad by design',
            'Trazabilidad de decisiones',
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg text-[10px]"
              style={{ background: clr.bg, border: `1px solid ${clr.borde}` }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#334155' }} />
              <span className="text-slate-400 flex-1">{p}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(107,114,128,0.12)', color: clr.gris }}>Pendiente</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
