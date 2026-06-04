import { X, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const SEM = { rojo: '#ef4444', amarillo: '#f59e0b', verde: '#22c55e', gris: '#6b7280' }

function parseAnyDate(str) {
  if (!str) return null
  if (str.includes('-')) {
    const d = new Date(str)
    return isNaN(d.getTime()) ? null : d
  }
  const parts = str.split('/')
  if (parts.length === 3) {
    const [d, m, y] = parts
    return new Date(+y, +m - 1, +d)
  }
  return null
}

function toDisplay(val, unidad) {
  if (val == null) return null
  if (unidad === '%' && val <= 1) return Math.round(val * 1000) / 10
  return val
}

function fmtDate(str) {
  const d = parseAnyDate(str)
  if (!d) return str ?? '—'
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Cumplimiento promedio de un conjunto de KPIs → escala 0–5
function calcScore(kpis) {
  const valids = kpis.filter(k => k.cumplimiento_pct != null)
  if (!valids.length) return null
  const avg = valids.reduce((s, k) => s + k.cumplimiento_pct, 0) / valids.length
  return Math.round((avg / 100) * 5 * 10) / 10   // 1 decimal, ej. 3.8
}

function ScoreBadge({ score, kpisCount }) {
  if (score == null) return null
  const color = score >= 4 ? '#22c55e' : score >= 2.5 ? '#f59e0b' : '#ef4444'
  const pct   = Math.min(100, (score / 5) * 100)
  return (
    <div className="relative group flex items-center gap-2.5 shrink-0 cursor-default">
      {/* Mini arc */}
      <svg width="48" height="27" viewBox="0 0 48 27">
        <path d="M5 24 A19 19 0 0 1 43 24" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M5 24 A19 19 0 0 1 43 24" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${pct * 0.596} 59.6`}
        />
      </svg>
      <div className="text-right leading-none">
        <span className="text-lg font-bold tabular-nums" style={{ color }}>{score}</span>
        <span className="text-[11px] text-slate-600">/5</span>
      </div>

      {/* Tooltip hover */}
      <div className="absolute top-full right-0 mt-2 z-[9999] hidden group-hover:block w-60 rounded-xl px-3 py-2.5 text-xs text-slate-300 leading-snug shadow-2xl pointer-events-none"
        style={{ background: '#1e2d45', border: `1px solid ${color}40` }}>
        <span className="absolute bottom-full right-4 border-4 border-transparent" style={{ borderBottomColor: color + '40' }} />
        <p className="font-bold mb-1.5" style={{ color }}>Cumplimiento del objetivo</p>
        <p className="text-slate-400 mb-2">
          Promedio del <span className="text-slate-200 font-semibold">% de cumplimiento</span> de
          los <span className="text-slate-200 font-semibold">{kpisCount} KPI{kpisCount !== 1 ? 's' : ''}</span> vinculados
          a este objetivo, convertido a escala 0–5.
        </p>
        <div className="rounded-lg px-2 py-1.5 space-y-0.5 text-[11px]" style={{ background: '#0d1b2e' }}>
          <p className="text-slate-500">Fórmula:</p>
          <p className="font-mono text-slate-300">promedio(% cumpl. KPIs) ÷ 100 × 5</p>
        </div>
        <div className="flex gap-3 mt-2 text-[11px]">
          <span style={{ color: '#22c55e' }}>● ≥ 4.0 óptimo</span>
          <span style={{ color: '#f59e0b' }}>● ≥ 2.5 moderado</span>
          <span style={{ color: '#ef4444' }}>● &lt; 2.5 crítico</span>
        </div>
      </div>
    </div>
  )
}

function KpiRow({ k }) {
  const c        = SEM[k.semaforo] ?? SEM.gris
  const varColor = k.isNeutral ? SEM.gris : k.isGood ? '#22c55e' : '#ef4444'
  const VarIcon  = k.isNeutral ? Minus : k.isGood ? TrendingUp : TrendingDown
  return (
    <div className="flex items-start justify-between gap-3 px-2.5 py-2 rounded-lg border"
      style={{ background: '#0b1829', borderColor: '#1e293b' }}>
      <p className="text-xs text-slate-300 leading-snug flex-1 min-w-0">{k.name}</p>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[15px] font-bold tabular-nums" style={{ color: c }}>
          {k.dispCur != null ? `${k.dispCur}${k.unidad}` : '—'}
        </span>
        {k.delta != null && (
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md"
            style={{ background: `${varColor}18`, border: `1px solid ${varColor}30` }}>
            <VarIcon size={10} style={{ color: varColor }} />
            <span className="text-[11px] font-bold tabular-nums" style={{ color: varColor }}>
              {k.delta > 0 ? '+' : ''}{k.delta}{k.unidad}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function IniciativaDetailModal({ ini, allKpis, onClose }) {
  const iniStart = parseAnyDate(ini.inicio)

  // ── KPIs vinculados a esta iniciativa ─────────────────────────────────────
  const kpiCards = allKpis
    .filter(k => (k.Iniciativas || '').split(',').map(s => s.trim()).includes(ini.ID))
    .map(k => {
      const mediciones = (k.mediciones ?? [])
        .map(m => ({ ...m, _date: parseAnyDate(m.fecha) }))
        .filter(m => m._date)
        .sort((a, b) => a._date - b._date)

      const afterStart = iniStart
        ? mediciones.filter(m => m._date >= iniStart)
        : mediciones

      let baseRaw   = k.linea_base_2025
      let baseLabel = 'Línea base 2025'

      if (afterStart.length > 0) {
        baseRaw   = afterStart[0].valor
        baseLabel = `Med. ${fmtDate(afterStart[0].fecha)}`
      }

      const dispCur  = toDisplay(k['Valor Actual'], k.Unidad)
      const dispBase = toDisplay(baseRaw, k.Unidad)
      const delta    = dispCur != null && dispBase != null
        ? Math.round((dispCur - dispBase) * 10) / 10
        : null
      const isGood    = delta == null ? null : k.Tipo === 'MAX' ? delta > 0 : delta < 0
      const isNeutral = delta == null || delta === 0

      return {
        id: k.id_kpi,
        name: k.KPI,
        semaforo: k.semaforo,
        objBsc: (k['Obj. BSC'] || '').trim(),
        cumplimiento_pct: k.cumplimiento_pct ?? null,
        dispCur, dispBase, delta, baseLabel, isGood, isNeutral,
        unidad: k.Unidad,
      }
    })

  // ── Objetivos estratégicos que listan esta iniciativa como habilitadora ────
  const objetivos = []
  const seenOes   = new Set()
  allKpis.forEach(k => {
    ;(k.contexto?.objetivos_estrategicos ?? []).forEach(oe => {
      if (seenOes.has(oe.id)) return
      const habs = (oe.iniciativas_habilitadoras || '').split(',').map(s => s.trim())
      if (habs.includes(ini.ID)) {
        seenOes.add(oe.id)
        objetivos.push(oe)
      }
    })
  })

  // ── Para cada OE, encontrar KPIs cuyo obj_bsc esté en objetivos_bsc del OE ─
  function kpisForOe(oe) {
    const bscList = (oe.objetivos_bsc || '').split(',').map(s => s.trim())
    return kpiCards.filter(k => bscList.includes(k.objBsc))
  }

  // KPIs que no entran en ningún OE (huérfanos)
  const kpisEnOes = new Set(objetivos.flatMap(oe => kpisForOe(oe).map(k => k.id)))
  const kpisHuerfanos = kpiCards.filter(k => !kpisEnOes.has(k.id))

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border shadow-2xl"
        style={{ background: '#0d1b2e', borderColor: '#1e3a5f' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-start justify-between px-5 pt-4 pb-3 border-b"
          style={{ borderColor: '#1e293b' }}>
          <div className="min-w-0 pr-4">
            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1.5"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
              {ini.ID}
            </span>
            <h2 className="text-base font-bold text-white leading-snug">{ini['Nombre Iniciativa']}</h2>
            {ini['Descripción Resumida'] && (
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{ini['Descripción Resumida']}</p>
            )}
            {ini.inicio && (
              <p className="text-[11px] text-slate-600 mt-1">
                Inicio: <span className="text-slate-500">{fmtDate(ini.inicio)}</span>
                {ini.fin && <> · Fin: <span className="text-slate-500">{fmtDate(ini.fin)}</span></>}
              </p>
            )}
          </div>
          <button onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={15} className="text-slate-400" />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="overflow-y-auto scrollbar-thin px-5 py-4 space-y-4">

          {/* Objetivos estratégicos con KPIs anidados */}
          {objetivos.length > 0 && (
            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2.5 flex items-center gap-1.5">
                <Target size={11} /> Objetivos estratégicos habilitados
              </p>
              <div className="space-y-3">
                {objetivos.map(oe => {
                  const oeKpis = kpisForOe(oe)
                  const score  = calcScore(oeKpis)
                  return (
                    <div key={oe.id} className="rounded-xl border overflow-visible"
                      style={{ borderColor: 'rgba(59,130,246,0.22)' }}>

                      {/* OE header */}
                      <div className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-t-xl"
                        style={{ background: 'rgba(59,130,246,0.06)' }}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-blue-400 shrink-0">{oe.id}</span>
                            <span className="text-[13px] font-semibold text-slate-200">{oe.nombre}</span>
                          </div>
                          {oe.descripcion && (
                            <p className="text-xs text-slate-500 leading-relaxed">{oe.descripcion}</p>
                          )}
                          {oe.ruta && (
                            <p className="text-[11px] text-slate-600 mt-1 font-mono">Ruta: {oe.ruta}</p>
                          )}
                        </div>
                        {/* Cumplimiento del objetivo 0-5 */}
                        <ScoreBadge score={score} kpisCount={oeKpis.length} />
                      </div>

                      {/* KPIs anidados */}
                      {oeKpis.length > 0 && (
                        <div className="px-3 py-2 space-y-1.5 rounded-b-xl"
                          style={{ background: '#0d1b2e', borderTop: '1px solid rgba(59,130,246,0.12)' }}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                            KPIs · variación desde inicio de iniciativa
                          </p>
                          {oeKpis.map(k => <KpiRow key={k.id} k={k} />)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* KPIs que no pertenecen a ningún OE */}
          {kpisHuerfanos.length > 0 && (
            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Otros KPIs vinculados
              </p>
              <div className="space-y-1.5">
                {kpisHuerfanos.map(k => <KpiRow key={k.id} k={k} />)}
              </div>
            </section>
          )}

          {kpiCards.length === 0 && objetivos.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-6">
              No se encontraron KPIs ni objetivos vinculados a esta iniciativa.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
