import { useState, useEffect } from 'react'
import { Zap, CalendarDays, Banknote, Info, Loader2 } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import IniciativaDetailModal from './IniciativaDetailModal'
import { askGeminiDirect } from '../../services/geminiService'

function parseDate(str) {
  if (!str) return null
  const [d, m, y] = str.split('/')
  return new Date(+y, +m - 1, +d)
}

function getStatus(inicio, fin) {
  const today = new Date()
  const start = parseDate(inicio)
  const end = parseDate(fin)
  if (!start || !end) return null
  if (today < start) return { label: 'Próxima', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' }
  if (today > end) return { label: 'Finalizada', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' }
  return { label: 'En curso', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
}

export default function IniciativasPanel() {
  const { data, allKpis } = useDashboard()
  const [idx, setIdx] = useState(0)
  const [modalIni, setModalIni] = useState(null)
  const [budgetAi, setBudgetAi] = useState(null)       // null | 'loading' | string
  const [showBudgetAi, setShowBudgetAi] = useState(false)
  const [budgetAiPos, setBudgetAiPos] = useState(null)

  const LS_KEY = 'hdpuv_budget_ai'
  // Limpia el caché en cada recarga de página
  useEffect(() => { localStorage.removeItem(LS_KEY) }, [])
  // Cierra el tooltip al hacer scroll
  useEffect(() => {
    if (!showBudgetAi) return
    const close = () => setShowBudgetAi(false)
    window.addEventListener('scroll', close, true)
    return () => window.removeEventListener('scroll', close, true)
  }, [showBudgetAi])

  const iniciativas = data.iniciativas
  const enCurso = iniciativas.filter(i => getStatus(i.inicio, i.fin)?.label === 'En curso')
  const proximas = iniciativas.filter(i => getStatus(i.inicio, i.fin)?.label === 'Próxima')
  const visible = [...enCurso, ...proximas]

  // ── Budget summary calculations (component scope for handleBudgetAlert) ──
  const totalPresupuesto = iniciativas.reduce((s, i) => s + (i['Presupuesto (COP)'] ?? 0), 0)
  const totalEjecutado = iniciativas.reduce((s, i) =>
    s + (i.ejecucion != null ? Math.round(i['Presupuesto (COP)'] * i.ejecucion) : 0), 0)
  const pctGlobal = totalPresupuesto > 0 ? Math.round((totalEjecutado / totalPresupuesto) * 100) : 0

  const weightedExpected = (() => {
    const today = new Date()
    let sumWeight = 0, sumExpected = 0
    iniciativas.forEach(i => {
      const budget = i['Presupuesto (COP)'] ?? 0
      const start = parseDate(i.inicio)
      const end = parseDate(i.fin)
      if (!start || !end || end <= start) return
      const elapsed = Math.min(1, Math.max(0, (today - start) / (end - start)))
      sumExpected += elapsed * budget
      sumWeight += budget
    })
    return sumWeight > 0 ? Math.round((sumExpected / sumWeight) * 100) : 0
  })()

  const overBudget = totalEjecutado > totalPresupuesto
  const deviation = pctGlobal - weightedExpected
  const barCol = overBudget ? '#ef4444'
    : deviation >= 0  ? '#22c55e'
    : deviation >= -2 ? '#eab308'
    : '#ef4444'
  const alertLevel = (overBudget || deviation < -2) ? 'red'
    : deviation < 0 ? 'yellow'
    : null

  async function handleBudgetAlert(e) {
    if (budgetAi === 'loading') return
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = { top: rect.bottom + 8, right: window.innerWidth - rect.right }

    // Si ya tenemos respuesta, solo alternar visibilidad
    if (budgetAi) {
      setBudgetAiPos(pos)
      setShowBudgetAi(v => !v)
      return
    }

    // Buscar en localStorage (dentro de la misma sesión, antes de recargar)
    const cached = localStorage.getItem(LS_KEY)
    if (cached) {
      setBudgetAi(cached)
      setBudgetAiPos(pos)
      setShowBudgetAi(true)
      return
    }

    setBudgetAiPos(pos)
    setBudgetAi('loading')
    setShowBudgetAi(true)

    const iniList = iniciativas
      .map(i => {
        const ej = i.ejecucion != null ? Math.round(i.ejecucion * 100) : null
        return `• ${i['Nombre Iniciativa']}: presupuesto $${Number(i['Presupuesto (COP)']).toLocaleString('es-CO')} COP, ejecutado ${ej != null ? ej + '%' : 'sin iniciar'}`
      })
      .join('\n')

    const prompt = `Eres un analista financiero TI de un hospital colombiano. Analiza esta situación presupuestal:

Iniciativas habilitadoras:
${iniList}

Situación global: presupuesto ejecutado ${pctGlobal}% vs ${weightedExpected}% esperado según cronograma (brecha de ${Math.abs(deviation).toFixed(1)} puntos porcentuales por debajo).

Responde en máximo 70 palabras, sin markdown, sin asteriscos, en español. Estructura:
CONSECUENCIAS: [1-2 oraciones sobre el impacto operativo/financiero de esta brecha].
RECOMENDACIONES: [2 acciones concretas para corregirla].`

    try {
      const result = await askGeminiDirect(prompt)
      const text = result.replace(/\*+/g, '').trim()
      setBudgetAi(text)
      localStorage.setItem(LS_KEY, text)
    } catch {
      setBudgetAi('Error al contactar el servicio de IA. Intente de nuevo.')
    }
  }

  if (visible.length === 0) return null

  const ini = visible[idx]
  const status = getStatus(ini.inicio, ini.fin)
  const ejPct = ini.ejecucion != null ? Math.round(ini.ejecucion * 100) : null

  const barColor = (() => {
    if (ejPct == null) return '#334155'
    const start = parseDate(ini.inicio)
    const end = parseDate(ini.fin)
    const today = new Date()
    if (start && end && end > start) {
      const elapsed = Math.min(1, Math.max(0, (today - start) / (end - start)))
      const expected = Math.round(elapsed * 100)
      const dev = ejPct - expected
      if (dev >= -10) return '#22c55e'
      if (dev >= -25) return '#f59e0b'
      return '#ef4444'
    }
    return '#6366f1'
  })()

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: '#0d1b2e', borderColor: '#1e293b' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: '#1e293b' }}>
        <Zap size={11} className="text-indigo-400 shrink-0" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Iniciativas habilitadoras
        </p>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            {enCurso.length} en curso
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
            {proximas.length} próximas
          </span>
        </div>
      </div>

      {/* Body: budget left + initiative center + timeline right */}
      <div className="flex justify-between gap-3 p-3">

        {/* Left: budget summary */}
        <div className="rounded-lg border p-3 space-y-2.5 min-w-0" style={{ background: '#111e35', borderColor: '#1e293b', flex: '3.5' }}>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[11px] text-slate-600 uppercase tracking-wide">Presupuesto total</p>
              {alertLevel && (
                <div className="relative">
                  <button
                    onClick={handleBudgetAlert}
                    className="alert-blink text-[9px] font-bold px-1.5 py-0.5 rounded-full focus:outline-none flex items-center gap-1"
                    style={{
                      background: alertLevel === 'red' ? '#ef444420' : '#eab30820',
                      color:      alertLevel === 'red' ? '#ef4444'   : '#eab308',
                      border:     `1px solid ${alertLevel === 'red' ? '#ef444450' : '#eab30850'}`,
                    }}
                  >
                    {budgetAi === 'loading'
                      ? <><Loader2 size={9} className="animate-spin" /> Analizando…</>
                      : alertLevel === 'red' ? '● ALERTA IA' : '● PRECAUCIÓN IA'
                    }
                  </button>

                  {/* Tooltip flotante con resultado IA */}
                  {showBudgetAi && budgetAi && budgetAi !== 'loading' && budgetAiPos && (
                    <div
                      className="w-72 rounded-xl p-3 space-y-2"
                      style={{
                        position: 'fixed',
                        top: budgetAiPos.top,
                        right: budgetAiPos.right,
                        zIndex: 9999,
                        background: '#0b1829',
                        border: '1px solid #1e3a5f',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Análisis IA · Presupuesto
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); setShowBudgetAi(false) }}
                          className="text-slate-600 hover:text-slate-300 text-xs leading-none transition-colors"
                        >✕</button>
                      </div>
                      {/* Content */}
                      <p className="text-[11px] leading-relaxed text-slate-300 whitespace-pre-line">
                        {budgetAi}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm font-bold text-slate-200 tabular-nums">
              ${totalPresupuesto.toLocaleString('es-CO')} <span className="text-[11px] font-normal text-slate-600">COP</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[11px] text-slate-600 uppercase tracking-wide mb-0.5">Ejecutado</p>
              <p className="text-xs font-bold tabular-nums" style={{ color: barCol }}>${totalEjecutado.toLocaleString('es-CO')}</p>
              <p className="text-[10px] text-slate-600">{pctGlobal}% real</p>
              {alertLevel && (
                <p className="text-[9px] tabular-nums font-semibold" style={{ color: barCol }}>
                  {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}% vs esperado
                </p>
              )}
            </div>
            <div>
              <p className="text-[11px] text-slate-600 uppercase tracking-wide mb-0.5">Esperado</p>
              <p className="text-xs font-bold text-slate-400 tabular-nums">${Math.round(totalPresupuesto * weightedExpected / 100).toLocaleString('es-CO')}</p>
              <p className="text-[10px] text-slate-600">{weightedExpected}% cronograma</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-slate-600 uppercase tracking-wide">Global</p>
              <p className="text-sm font-bold tabular-nums" style={{ color: barCol }}>{pctGlobal}%</p>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pctGlobal}%`, background: barCol }} />
            </div>
          </div>
        </div>

        {/* Center: initiative detail */}
        <div className="min-w-0 space-y-2.5" style={{ flex: '3' }}>
          {/* ID + status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">{ini.ID}</span>
            {status && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: status.bg, color: status.color }}>
                {status.label}
              </span>
            )}
          </div>

          {/* Name + detail button */}
          <div className="flex items-start gap-2">
            <p className="text-sm font-semibold text-slate-200 leading-snug flex-1">
              {ini['Nombre Iniciativa']}
            </p>
            <button
              onClick={() => setModalIni(ini)}
              className="shrink-0 p-1 rounded-lg transition-colors hover:bg-white/10"
              style={{ border: '1px solid #1e293b' }}
              title="Ver detalle: objetivos y KPIs"
            >
              <Info size={12} className="text-slate-400" />
            </button>
          </div>

          {/* Execution bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-600 uppercase tracking-wide">Ejecución</span>
                {ejPct != null && (
                  <span className="text-[10px] tabular-nums" style={{ color: barColor }}>
                    ${Math.round(ini['Presupuesto (COP)'] * (ejPct / 100)).toLocaleString('es-CO')}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold tabular-nums" style={{ color: barColor }}>
                {ejPct != null ? `${ejPct}%` : '—'}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${ejPct ?? 0}%`, background: barColor }} />
            </div>
          </div>

          {/* Dates + budget */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={10} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-300">{ini.inicio} → {ini.fin}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Banknote size={10} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-300">
                ${Number(ini['Presupuesto (COP)']).toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>
        </div>

        {/* Right: timeline list nav */}
        {(() => {
          const fmt = str => {
            const d = parseDate(str)
            if (!d) return ''
            return d.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
              .replace('.', '').replace(/^\w/, c => c.toUpperCase())
          }
          const groupKey = str => {
            const d = parseDate(str)
            return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : ''
          }
          const groupLabel = str => {
            const d = parseDate(str)
            if (!d) return ''
            return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
              .replace(' de ', ' ').replace(/^\w/, c => c.toUpperCase())
          }

          const sorted = [...visible].sort((a, b) => {
            const da = parseDate(a.inicio), db = parseDate(b.inicio)
            return (da ?? 0) - (db ?? 0)
          })

          const groups = []
          let lastKey = null
          sorted.forEach((item) => {
            const key = groupKey(item.inicio)
            if (key !== lastKey) { groups.push({ key, label: groupLabel(item.inicio), items: [] }); lastKey = key }
            groups[groups.length - 1].items.push(item)
          })

          return (
            <div className="overflow-y-auto overflow-x-hidden scrollbar-thin min-w-0" style={{ flex: '4', maxHeight: '180px' }}>
              <div className="relative pl-4">
                <div className="absolute left-[7px] top-0 bottom-0 w-px" style={{ background: '#1e293b' }} />
                {groups.map(({ key, label, items }) => (
                  <div key={key}>
                    <div className="flex items-center gap-1.5 mb-1 mt-2 first:mt-0">
                      <div className="w-2 h-2 rounded-full border shrink-0 -ml-4" style={{ background: '#0d1b2e', borderColor: '#334155' }} />
                      <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-600">{label}</span>
                    </div>
                    {items.map(item => {
                      const st = getStatus(item.inicio, item.fin)
                      const origIdx = visible.indexOf(item)
                      const isActive = origIdx === idx
                      return (
                        <button
                          key={item.ID}
                          onClick={() => setIdx(origIdx)}
                          className="w-full text-left rounded-lg pl-2.5 pr-2 py-1.5 mb-1 transition-all relative"
                          style={{
                            background: isActive ? `${st?.color ?? '#6366f1'}18` : 'transparent',
                            border: `1px solid ${isActive ? (st?.color ?? '#6366f1') : 'transparent'}`,
                          }}
                        >
                          <div
                            className="absolute rounded-full"
                            style={{
                              left: '-13px', top: '50%', transform: 'translateY(-50%)',
                              width: isActive ? '8px' : '6px',
                              height: isActive ? '8px' : '6px',
                              background: st?.color ?? '#475569',
                              boxShadow: isActive ? `0 0 6px ${st?.color}` : 'none',
                              transition: 'all 0.15s',
                            }}
                          />
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-xs font-bold" style={{ color: isActive ? (st?.color ?? '#e2e8f0') : '#94a3b8' }}>
                              {item.ID}
                            </span>
                            {st && (
                              <span className="text-[10px] font-semibold px-1 py-px rounded-full" style={{ background: st.bg, color: st.color }}>
                                {st.label}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-snug line-clamp-1">
                            {item['Nombre Iniciativa']}
                          </p>
                          <p className="text-[9px] text-slate-600 mt-0.5">
                            {fmt(item.inicio)} – {fmt(item.fin)}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

      </div>

      {modalIni && (
        <IniciativaDetailModal
          ini={modalIni}
          allKpis={allKpis}
          onClose={() => setModalIni(null)}
        />
      )}
    </div>
  )
}
