import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, RotateCcw, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import { buildDashboardContext, askGemini } from '../services/geminiService'

const PRESET_PROMPTS = [
  { label: 'KPIs críticos', prompt: 'Analiza los KPIs en estado crítico (rojo) e identifica los 3 más urgentes. Para cada uno, explica la causa probable y una acción correctiva concreta.' },
  { label: 'Brechas ISO 38500', prompt: 'Identifica las principales brechas de cumplimiento según los principios de ISO 38500. ¿Cuáles principios presentan mayor riesgo para el hospital?' },
  { label: 'Plan de acción', prompt: 'Genera un plan de acción priorizado con las 5 iniciativas más importantes para mejorar el gobierno de TI en los próximos 90 días.' },
  { label: 'Análisis BSC', prompt: 'Evalúa el desempeño por perspectiva del Balanced Scorecard. ¿Qué perspectiva necesita más atención? ¿Hay correlaciones importantes entre perspectivas?' },
]

function formatMarkdown(text) {
  const inline = (s) =>
    s.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f1f5f9;font-weight:600">$1</strong>')
     .replace(/`(.+?)`/g, '<code style="background:#1e293b;padding:1px 5px;border-radius:3px;color:#7dd3fc;font-size:10px">$1</code>')

  const lines = text.split('\n')
  const out = []
  let inList = false

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (/^-{3,}$/.test(line.trim())) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push('<hr style="border:none;border-top:1px solid rgba(51,65,85,0.5);margin:10px 0"/>')
      continue
    }
    if (line.startsWith('#### ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<p style="color:#fbbf24;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.07em;margin:12px 0 3px">${inline(line.slice(5))}</p>`)
      continue
    }
    if (line.startsWith('### ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<p style="color:#93c5fd;font-weight:600;font-size:12px;margin:10px 0 3px">${inline(line.slice(4))}</p>`)
      continue
    }
    if (line.startsWith('## ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<p style="color:#bfdbfe;font-weight:700;font-size:13px;margin:12px 0 5px">${inline(line.slice(3))}</p>`)
      continue
    }
    if (line.startsWith('# ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<p style="color:#f1f5f9;font-weight:700;font-size:14px;margin:12px 0 5px">${inline(line.slice(2))}</p>`)
      continue
    }
    const numMatch = line.match(/^(\d+)\. (.+)/)
    if (numMatch) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(
        `<div style="display:flex;align-items:flex-start;gap:8px;margin:14px 0 3px">` +
        `<span style="flex-shrink:0;width:17px;height:17px;border-radius:50%;background:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.45);color:#a5b4fc;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px">${numMatch[1]}</span>` +
        `<span style="color:#c7d2fe;font-weight:600;font-size:12px;line-height:1.5">${inline(numMatch[2])}</span></div>`
      )
      continue
    }
    const bulletMatch = line.match(/^[*-] (.+)/)
    if (bulletMatch) {
      if (!inList) { out.push('<ul style="margin:5px 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:3px">'); inList = true }
      out.push(`<li style="display:flex;gap:6px;font-size:11px;color:#cbd5e1;line-height:1.65"><span style="color:#60a5fa;flex-shrink:0;margin-top:3px;font-size:9px">▸</span><span>${inline(bulletMatch[1])}</span></li>`)
      continue
    }
    if (line.trim() === '') {
      if (inList) { out.push('</ul>'); inList = false }
      out.push('<div style="height:5px"></div>')
      continue
    }
    if (inList) { out.push('</ul>'); inList = false }
    out.push(`<p style="font-size:11px;color:#94a3b8;line-height:1.75;margin:1px 0">${inline(line)}</p>`)
  }

  if (inList) out.push('</ul>')
  return out.join('')
}

export default function GeminiPanel() {
  const { allKpis, globalCounts, madurezData } = useDashboard()
  const [open, setOpen] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activePreset, setActivePreset] = useState(null)
  const textareaRef = useRef(null)
  const responseRef = useRef(null)

  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [response])

  async function handleSubmit(promptText) {
    if (!promptText.trim()) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const context = buildDashboardContext(allKpis, globalCounts, madurezData)
      const result = await askGemini(promptText, context)
      setResponse(result)
    } catch (err) {
      setError(err.message ?? 'Error al contactar Gemini API')
    } finally {
      setLoading(false)
    }
  }

  function handlePreset(preset, idx) {
    setActivePreset(idx)
    setCustomPrompt(preset.prompt)
    handleSubmit(preset.prompt)
  }

  function handleCustomSubmit() {
    setActivePreset(null)
    handleSubmit(customPrompt)
  }

  function reset() {
    setResponse(null)
    setError(null)
    setCustomPrompt('')
    setActivePreset(null)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#0f1c2e', border: '1px solid rgba(59,130,246,0.2)' }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-500/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Sparkles size={15} className="text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-white">Análisis con IA</span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
          >
            Gemini
          </span>
        </div>
        {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'rgba(30,41,59,0.8)' }}>
          {/* Preset buttons */}
          <div className="pt-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Análisis rápido</p>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePreset(p, i)}
                  disabled={loading}
                  className="text-xs px-3 py-2 rounded-lg text-left transition-all disabled:opacity-40"
                  style={{
                    background: activePreset === i ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activePreset === i ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    color: activePreset === i ? '#a5b4fc' : '#94a3b8',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom prompt */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Pregunta personalizada</p>
            <div
              className="flex gap-2 items-end rounded-xl p-2"
              style={{ background: '#111e35', border: '1px solid #1e293b' }}
            >
              <textarea
                ref={textareaRef}
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCustomSubmit() } }}
                placeholder="Escribe una pregunta sobre el dashboard…"
                rows={2}
                disabled={loading}
                className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none resize-none"
              />
              <button
                onClick={handleCustomSubmit}
                disabled={loading || !customPrompt.trim()}
                className="p-2 rounded-lg transition-all disabled:opacity-30"
                style={{ background: customPrompt.trim() ? 'rgba(99,102,241,0.3)' : 'transparent' }}
              >
                <Send size={13} className={customPrompt.trim() ? 'text-indigo-300' : 'text-slate-600'} />
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2.5 py-3 px-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Loader2 size={14} className="text-indigo-400 animate-spin shrink-0" />
              <span className="text-xs text-indigo-300">Analizando datos del dashboard…</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="py-2.5 px-3 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          {/* Response */}
          {response && (
            <div ref={responseRef} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Respuesta</p>
                <button onClick={reset} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-400 transition-colors">
                  <RotateCcw size={10} />
                  Limpiar
                </button>
              </div>
              <div
                className="text-xs text-slate-300 leading-relaxed rounded-xl p-3 max-h-72 overflow-y-auto"
                style={{ background: '#0b1829', border: '1px solid #1e293b', lineHeight: '1.7', maxHeight: '520px' }}
                dangerouslySetInnerHTML={{ __html: formatMarkdown(response) }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}