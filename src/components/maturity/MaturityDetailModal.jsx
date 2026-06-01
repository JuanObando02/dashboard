import { X, CheckCircle2, MinusCircle, XCircle } from 'lucide-react'

const ANSWER = {
  Yes:     { label: 'Sí',      color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  Icon: CheckCircle2 },
  Partial: { label: 'Parcial', color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', Icon: MinusCircle },
  No:      { label: 'No',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', Icon: XCircle },
}

export default function MaturityDetailModal({ record, sectionName, onClose }) {
  const sectionDetail = Object.values(record.detalle ?? {}).find(d => d.nombre === sectionName)
  const sectionRadar  = record.radar?.find(r => r.seccion === sectionName)
  if (!sectionDetail || !sectionRadar) return null

  const totalScore = sectionDetail.preguntas.reduce((s, q) => s + (q.puntaje ?? 0), 0)
  const totalMax   = sectionDetail.preguntas.length * 2
  const pct        = sectionRadar.pct
  const barColor   = pct >= 70 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444'
  const barColorMuted = pct >= 70 ? 'rgba(34,197,94,0.55)' : pct >= 50 ? 'rgba(234,179,8,0.5)' : 'rgba(239,68,68,0.5)'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: '#0f1c2e',
          border: '1px solid #1e293b',
          maxHeight: 'min(82vh, 680px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: '#1e293b' }}>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
              Evaluación · {record.fecha}
            </p>
            <h2 className="text-base font-bold text-white leading-tight">{sectionName}</h2>
          </div>

          <div className="flex items-center gap-3 ml-4 shrink-0">
            <div className="text-right">
              <p className="text-2xl font-bold leading-none" style={{ color: barColor }}>{pct}%</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{totalScore} / {totalMax} pts</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <X size={15} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Score bar */}
        <div className="px-5 pt-3 pb-2 shrink-0">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: barColorMuted }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-slate-600">0%</span>
            <span className="text-[9px] text-slate-600">100%</span>
          </div>
        </div>

        {/* Questions */}
        <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-2">
          {sectionDetail.preguntas.map((q) => {
            const cfg = ANSWER[q.respuesta] ?? ANSWER.No
            const Icon = cfg.Icon
            return (
              <div
                key={q.numero}
                className="flex gap-3 p-3 rounded-xl"
                style={{ background: '#111e35', border: '1px solid #1e293b' }}
              >
                {/* Number circle */}
                <div
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                  style={{
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: '#a5b4fc',
                  }}
                >
                  {q.numero}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-300 leading-relaxed">{q.titulo}</p>

                  <div className="flex items-center gap-2 mt-2">
                    {/* Answer badge */}
                    <span
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                    >
                      <Icon size={10} />
                      {cfg.label}
                    </span>

                    {/* Score dots */}
                    <div className="flex gap-1 items-center">
                      {[1, 2].map(dot => (
                        <div
                          key={dot}
                          className="w-2 h-2 rounded-full transition-colors"
                          style={{ background: dot <= (q.puntaje ?? 0) ? cfg.color : '#1e293b' }}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] text-slate-500">{q.puntaje ?? 0} / 2 pts</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer summary */}
        <div
          className="px-5 py-3 border-t shrink-0 flex items-center justify-between"
          style={{ borderColor: '#1e293b', background: '#0b1829' }}
        >
          <div className="flex gap-4 text-[10px]">
            {Object.entries(ANSWER).map(([key, cfg]) => {
              const count = sectionDetail.preguntas.filter(q => q.respuesta === key).length
              return (
                <span key={key} className="flex items-center gap-1" style={{ color: cfg.color }}>
                  <cfg.Icon size={10} />
                  {cfg.label}: {count}
                </span>
              )
            })}
          </div>
          <span className="text-[10px] text-slate-500">
            {sectionDetail.preguntas.length} preguntas en total
          </span>
        </div>
      </div>
    </div>
  )
}
