import { useState } from 'react'
import { Shield, Target, Package, TrendingUp, CheckCircle2, Users, Sparkles, X, Loader2 } from 'lucide-react'
import { useDashboard, ISO_PRINCIPLES } from '../context/DashboardContext'
import { askGeminiDirect } from '../services/geminiService'

const ICON_MAP = { Shield, Target, Package, TrendingUp, CheckCircle2, Users }

function buildPrinciplePrompt(principle, pkpis) {
  const kpiLines = pkpis.map(k => {
    const mult = k.Unidad === '%' ? 100 : 1
    const val = k['Valor Actual'] !== null && k['Valor Actual'] !== undefined
      ? `${(k['Valor Actual'] * mult).toFixed(k.Unidad === '%' ? 1 : 2)}${k.Unidad}`
      : 'N/D'
    const meta = k['Meta 2026'] !== null && k['Meta 2026'] !== undefined
      ? `${(k['Meta 2026'] * mult).toFixed(k.Unidad === '%' ? 1 : 2)}${k.Unidad}`
      : 'N/D'
    return `  - ${k.KPI}: ${val} (Meta 2026: ${meta}) | Cumplimiento: ${k.cumplimiento_pct}% | Estado: ${k.semaforo.toUpperCase()}`
  }).join('\n')

  return `Actúa como un consultor experto en Gobierno de TI en salud bajo el estándar ISO 38500.
Analiza los siguientes datos de un dashboard hospitalario y genera un resumen ejecutivo ultra-corto (máximo 3 líneas o 60 palabras) para mostrar en un elemento emergente (hover/modal).

[DATOS DEL DASHBOARD]
- Principio ISO 38500: ${principle.id}
- KPIs Actuales:
${kpiLines || '  - Sin KPIs registrados'}

[INSTRUCCIONES DE SALIDA]
Tu respuesta debe responder estrictamente a: ¿Qué significan estos números para la operación del hospital?
Usa un tono directo y profesional. Evita introducciones como "Basado en los datos...".
NO uses markdown, NO uses asteriscos, NO uses negritas, NO uses símbolos de formato.

[FORMATO DE SALIDA REQUERIDO]
🔴/🟡/🟢 [Estado General]: [Impacto crítico o beneficio directo en la operación médica, seguridad del paciente o eficiencia del hospital].`
}

export default function IsoPrincipleCards() {
  const { allKpis, activePrinciple, togglePrinciple } = useDashboard()
  const [aiModal, setAiModal] = useState(null)

  const activePrincipleObj = ISO_PRINCIPLES.find(p => p.id === activePrinciple) ?? null

  async function handleAiAnalysis() {
    if (!activePrincipleObj) return
    const pkpis = allKpis.filter(k => k.principio_iso === activePrincipleObj.id)
    setAiModal({ principleId: activePrincipleObj.id, hex: activePrincipleObj.hex, loading: true, response: null, error: null })
    try {
      const prompt = buildPrinciplePrompt(activePrincipleObj, pkpis)
      const result = await askGeminiDirect(prompt)
      setAiModal(prev => ({ ...prev, loading: false, response: result }))
    } catch (err) {
      setAiModal(prev => ({ ...prev, loading: false, error: err.message ?? 'Error al contactar Gemini' }))
    }
  }

  return (
    <>
      <div className="rounded-xl border overflow-hidden" style={{ background: '#111e35', borderColor: '#1e293b' }}>
        {/* Header */}
        <div className="px-3 py-2.5 border-b flex items-center justify-between" style={{ borderColor: '#1e293b' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Principios ISO 38500
          </p>
          <button
            onClick={handleAiAnalysis}
            disabled={!activePrincipleObj}
            title={activePrincipleObj ? `Analizar IA · ${activePrincipleObj.id}` : 'Selecciona un principio para analizar'}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all"
            style={{
              background: activePrincipleObj ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.06)',
              border: `1px solid ${activePrincipleObj ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.15)'}`,
              opacity: activePrincipleObj ? 1 : 0.45,
              cursor: activePrincipleObj ? 'pointer' : 'default',
            }}
          >
            <Sparkles size={10} className="text-indigo-400" />
            <span className="text-[10px] font-medium text-indigo-400">
              {activePrincipleObj ? `Analizar ${activePrincipleObj.id}` : 'Selecciona un principio'}
            </span>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-px p-px" style={{ background: '#1e293b' }}>
          {ISO_PRINCIPLES.map(p => {
            const Icon      = ICON_MAP[p.iconName]
            const pkpis     = allKpis.filter(k => k.principio_iso === p.id)
            const total     = pkpis.length
            const rojos     = pkpis.filter(k => k.semaforo === 'rojo').length
            const amarillos = pkpis.filter(k => k.semaforo === 'amarillo').length
            const verdes    = pkpis.filter(k => k.semaforo === 'verde').length
            // Promedio Ponderado de Cumplimiento ISO 38500
            // Si todos los KPIs tienen peso definido → Σ(cumplimiento_i × peso_i)
            // Si alguno no tiene peso → fallback a promedio simple igualitario
            const allWeighted = total > 0 && pkpis.every(k => k.peso !== null)
            const avg = total > 0
              ? allWeighted
                ? Math.round(pkpis.reduce((s, k) => s + (k.cumplimiento_pct ?? 0) * (k.peso ?? 0), 0))
                : Math.round(pkpis.reduce((s, k) => s + (k.cumplimiento_pct ?? 0), 0) / total)
              : 0
            const isActive  = activePrinciple === p.id

            return (
              <div
                key={p.id}
                className="relative text-left p-2.5 transition-all duration-150 cursor-pointer select-none min-h-[130px]"
                style={{ background: isActive ? `${p.hex}20` : '#111e35' }}
                onClick={() => togglePrinciple(p.id)}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute top-0 left-0 right-0 h-0.5" style={{ background: p.hex }} />
                )}

                {/* Icon + name */}
                <div className="flex items-center gap-1 mb-0.5">
                  <Icon size={14} style={{ color: isActive ? p.hex : '#475569' }} className="shrink-0" />
                  <p
                    className="text-sm font-semibold leading-tight truncate flex-1"
                    style={{ color: isActive ? p.hex : '#94a3b8' }}
                  >
                    {p.id}
                  </p>
                </div>

                {/* HDPUV principles — fixed height so all cards align */}
                <p
                  className="text-[11px] leading-tight mb-1.5 overflow-hidden"
                  style={{ color: '#475569', height: '28px' }}
                >
                  {p.hdpuv.join(' · ')}
                </p>

                {/* % */}
                <p
                  className="text-2xl font-bold leading-none mb-0.5"
                  style={{ color: isActive ? p.hex : '#cbd5e1' }}
                >
                  {avg}%
                </p>

                {/* Semaforo bar + tooltip */}
                <div className="relative group mt-1.5">
                  <div className="h-2 rounded-full overflow-hidden flex cursor-default" style={{ background: '#0b1829' }}>
                    {rojos     > 0 && <span style={{ width: `${(rojos     / total) * 100}%`, background: '#ef4444' }} />}
                    {amarillos > 0 && <span style={{ width: `${(amarillos / total) * 100}%`, background: '#eab308' }} />}
                    {verdes    > 0 && <span style={{ width: `${(verdes    / total) * 100}%`, background: '#22c55e' }} />}
                  </div>
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-36 rounded-lg p-2.5 space-y-1.5"
                    style={{ background: '#0b1829', border: '1px solid #1e3a5f', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                    {[
                      { n: rojos,     color: '#ef4444', label: 'Críticos'   },
                      { n: amarillos, color: '#eab308', label: 'Precaución' },
                      { n: verdes,    color: '#22c55e', label: 'Cumpliendo' },
                    ].map(({ n, color, label }) => n > 0 && (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                          <span className="text-[10px] text-slate-400">{label}</span>
                        </div>
                        <span className="text-[10px] font-bold tabular-nums" style={{ color }}>
                          {n}/{total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Analysis Modal */}
      {aiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setAiModal(null)}
        >
          <div
            className="rounded-2xl w-full max-w-md space-y-3 p-4"
            style={{
              background: '#0f1c2e',
              border: `1px solid ${aiModal.hex}40`,
              boxShadow: `0 0 40px ${aiModal.hex}18`,
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ background: `${aiModal.hex}20` }}>
                  <Sparkles size={14} style={{ color: aiModal.hex }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{aiModal.principleId}</p>
                  <p className="text-[10px] text-slate-500">Análisis IA · ISO 38500</p>
                </div>
              </div>
              <button onClick={() => setAiModal(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Loading */}
            {aiModal.loading && (
              <div className="flex items-center justify-center gap-2.5 py-6">
                <Loader2 size={16} className="animate-spin" style={{ color: aiModal.hex }} />
                <span className="text-sm text-slate-400">Analizando principio…</span>
              </div>
            )}

            {/* Error */}
            {aiModal.error && (
              <p className="text-xs text-red-400 py-2 px-1">{aiModal.error}</p>
            )}

            {/* Response */}
            {aiModal.response && (
              <div
                className="text-sm text-slate-300 leading-relaxed rounded-xl p-3"
                style={{ background: '#111e35', border: '1px solid #1e293b' }}
              >
                {aiModal.response.replace(/\*\*/g, '').replace(/\*/g, '')}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
