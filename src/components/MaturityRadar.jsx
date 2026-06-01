import { useState, useEffect, useRef } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { Hexagon, CalendarDays } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import MaturityDetailModal from './MaturityDetailModal'

const COLORS = ['#3b82f6', '#f59e0b']

const MATURITY_LEVELS = {
  0: { short: 'Sin capacidad básica',                       desc: 'El trabajo puede o no completarse hacia el propósito de gobernanza. No hay enfoque básico para abordar los objetivos. Puede o no estar cumpliendo con el intento de ninguna práctica de proceso.' },
  1: { short: 'Intuitivo, no organizado',                   desc: 'El trabajo se completa, pero no se logra el objetivo completo del área de enfoque. Se aplica un conjunto incompleto de actividades que puede caracterizarse como inicial o intuitivo — no muy organizado.' },
  2: { short: 'Planificado, pero no estandarizado',         desc: 'La planificación y la medición del desempeño tienen lugar, aunque aún no de manera estandarizada. Se logra el propósito mediante un conjunto básico pero completo de actividades.' },
  3: { short: 'Estándares a nivel de toda la organización', desc: 'Los estándares en toda la organización proporcionan orientación en toda la empresa. El propósito se logra de manera mucho más organizada usando activos institucionales. Los procesos típicamente están bien definidos.' },
  4: { short: 'Basado en datos, mejora cuantitativa',       desc: 'La organización es impulsada por datos, con mejora cuantitativa del desempeño. El propósito se logra, está bien definido y su desempeño se mide cuantitativamente.' },
  5: { short: 'Mejora continua',                            desc: 'La organización está enfocada en la mejora continua. El propósito se logra, está bien definido, su desempeño se mide y se persigue la mejora continua.' },
}

function formatFecha(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`
}

function RadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1e2d45] border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{payload[0]?.payload?.seccion}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  )
}

function LevelBadge({ record }) {
  const [hovered, setHovered] = useState(false)
  const info = MATURITY_LEVELS[record.maturityLevel]

  return (
    <div className="relative shrink-0">
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-default"
        style={{ background: `${record.maturityColor}18`, border: `1px solid ${record.maturityColor}40` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="text-2xl font-bold leading-none" style={{ color: record.maturityColor }}>
          {record.maturityLevel}
        </span>
        <div>
          <p className="text-[9px] text-slate-500 leading-none uppercase tracking-wide">Nivel actual</p>
          <p className="text-xs font-bold leading-tight" style={{ color: record.maturityColor }}>
            {record.maturityName}
          </p>
        </div>
      </div>

      {/* Hover tooltip */}
      {hovered && info && (
        <div
          className="absolute bottom-full left-0 mb-2 z-50 rounded-xl p-3 shadow-2xl text-xs"
          style={{
            width: 240,
            background: '#1e2d45',
            border: `1px solid ${record.maturityColor}50`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px ${record.maturityColor}20`,
          }}
        >
          <p className="font-bold mb-1" style={{ color: record.maturityColor }}>
            Nivel {record.maturityLevel} — {record.maturityName}
          </p>
          <p className="text-slate-400 leading-relaxed">{info.desc}</p>
        </div>
      )}
    </div>
  )
}

function ClickableTick({ x, y, payload, cx, onSectionClick }) {
  const anchor = Math.abs(x - cx) < 10 ? 'middle' : x > cx ? 'start' : 'end'
  const words  = payload.value.split(' ')
  const mid    = Math.ceil(words.length / 2)
  const line1  = words.slice(0, mid).join(' ')
  const line2  = words.slice(mid).join(' ')

  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill="#94a3b8"
      fontSize={9}
      style={{ cursor: 'pointer', userSelect: 'none' }}
      onClick={() => onSectionClick(payload.value)}
    >
      <tspan x={x} dy={line2 ? '-0.5em' : '0'}>{line1}</tspan>
      {line2 && <tspan x={x} dy="1.2em">{line2}</tspan>}
    </text>
  )
}

export default function MaturityRadar() {
  const { madurezData } = useDashboard()
  const [activeIdx, setActiveIdx] = useState(0)
  const [compareIdx, setCompareIdx] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!madurezData?.length) return null

  // Always default to latest (last) evaluation
  const latestIdx = madurezData.length - 1
  const effectiveIdx = activeIdx <= latestIdx ? activeIdx : latestIdx
  const record = madurezData[effectiveIdx]

  const radarData = madurezData[0].radar.map(r => {
    const obj = { seccion: r.seccion }
    madurezData.forEach((m, i) => {
      const found = m.radar.find(x => x.seccion === r.seccion)
      obj[`Eval ${i + 1}`] = found?.pct ?? 0
    })
    return obj
  })

  return (
    <div
      className="rounded-xl border overflow-visible"
      style={{ background: '#111e35', borderColor: '#1e293b' }}
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-2.5 border-b space-y-2" style={{ borderColor: '#1e293b' }}>
        {/* Title row */}
        <div className="flex items-center gap-2">
          <Hexagon size={14} className="text-indigo-400 shrink-0" />
          <h2 className="text-sm font-semibold text-slate-200">Madurez ISO 38500</h2>
        </div>

        {/* Eval selector row — full width */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-colors"
            style={{ background: `${record.maturityColor}18`, border: `1px solid ${record.maturityColor}40` }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <CalendarDays size={10} style={{ color: record.maturityColor }} className="shrink-0" />
              <span className="text-[10px] font-semibold truncate" style={{ color: record.maturityColor }}>
                Eval {effectiveIdx + 1} · {formatFecha(record.fecha)}
                {compareIdx !== null && (
                  <span className="text-slate-500 font-normal"> · vs Eval {compareIdx + 1} · {formatFecha(madurezData[compareIdx].fecha)}</span>
                )}
              </span>
            </div>
            <span className="text-[9px] shrink-0" style={{ color: record.maturityColor }}>▾</span>
          </button>

          {dropdownOpen && madurezData.length > 1 && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-2xl overflow-hidden flex flex-col"
              style={{ background: '#0b1829', border: '1px solid #1e3a5f', minWidth: '230px', maxHeight: '250px' }}>
              {/* Section header — fixed */}
              <div className="px-3 py-1.5 border-b shrink-0" style={{ borderColor: '#1e293b' }}>
                <p className="text-[9px] uppercase tracking-wider text-slate-600 font-semibold">Evaluación activa</p>
              </div>
              {/* Scrollable list */}
              <div className="overflow-y-auto scrollbar-thin">
              {[...madurezData].reverse().map((m, ri) => {
                const i = madurezData.length - 1 - ri
                const isActive = i === effectiveIdx
                const isCompare = i === compareIdx
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-white/5"
                    style={{ borderBottom: ri < madurezData.length - 1 ? '1px solid #1e293b' : 'none' }}
                  >
                    {/* Select as active */}
                    <button
                      onClick={() => { setActiveIdx(i); if (compareIdx === i) setCompareIdx(null); setDropdownOpen(false) }}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m.maturityColor }} />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold" style={{ color: isActive ? m.maturityColor : '#e2e8f0' }}>
                          Evaluación {i + 1}
                          {i === madurezData.length - 1 && <span className="ml-1.5 text-[9px] text-slate-500">(Actual)</span>}
                        </p>
                        <p className="text-[10px] text-slate-500">{formatFecha(m.fecha)}</p>
                      </div>
                      {isActive && <span className="text-[9px] shrink-0" style={{ color: m.maturityColor }}>✓</span>}
                    </button>

                    {/* Compare toggle */}
                    {!isActive && (
                      <button
                        onClick={e => { e.stopPropagation(); setCompareIdx(isCompare ? null : i) }}
                        className="shrink-0 text-[9px] px-1.5 py-0.5 rounded font-semibold transition-all"
                        style={{
                          background: isCompare ? 'rgba(100,116,139,0.3)' : 'rgba(100,116,139,0.1)',
                          border: `1px solid ${isCompare ? '#64748b' : 'rgba(100,116,139,0.3)'}`,
                          color: isCompare ? '#94a3b8' : '#475569',
                        }}
                      >
                        {isCompare ? 'vs ✓' : 'vs'}
                      </button>
                    )}
                  </div>
                )
              })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Level + score */}
      <div className="flex items-center gap-4 px-4 pt-3 pb-1">
        <LevelBadge record={record} />

        <div className="flex-1">
          <p className="text-[10px] text-slate-500 mb-0.5">Score global</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-200">{record.totalScore}</span>
            <span className="text-xs text-slate-500">/ {record.totalMax}</span>
            <span className="text-sm font-bold ml-1" style={{ color: record.maturityColor }}>
              {Math.round(record.ratio * 100)}%
            </span>
          </div>
          {/* Score bar */}
          <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: '#1e293b' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round(record.ratio * 100)}%`, background: record.maturityColor }}
            />
          </div>
        </div>
      </div>

      {/* Radar */}
      <div className="px-2">
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData} margin={{ top: 18, right: 28, bottom: 18, left: 28 }}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis
              dataKey="seccion"
              tick={(props) => <ClickableTick {...props} onSectionClick={setSelectedSection} />}
            />
            <Radar
              name={`Eval ${effectiveIdx + 1}`}
              dataKey={`Eval ${effectiveIdx + 1}`}
              stroke={COLORS[effectiveIdx] ?? '#3b82f6'}
              fill={COLORS[effectiveIdx] ?? '#3b82f6'}
              fillOpacity={0.18}
              strokeWidth={2}
              dot={{ r: 3, fill: COLORS[effectiveIdx] ?? '#3b82f6' }}
            />
            {compareIdx !== null && (
              <Radar
                name={`Eval ${compareIdx + 1}`}
                dataKey={`Eval ${compareIdx + 1}`}
                stroke="#64748b"
                fill="#64748b"
                fillOpacity={0.06}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={{ r: 2, fill: '#64748b' }}
              />
            )}
            <Tooltip content={<RadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Section bars */}
      <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: '#1e293b' }}>
        <div className="flex items-center justify-between pt-3">
          <p className="text-[9px] uppercase tracking-wider text-slate-600 font-semibold">
            Detalle por sección
          </p>
          <div className="flex items-center gap-2">
            {[
              { color: '#22c55e', label: '≥70%' },
              { color: '#eab308', label: '50–69%' },
              { color: '#ef4444', label: '<50%' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[8px] text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
        {record.radar.map(r => {
          const barColor = r.pct >= 70 ? '#22c55e' : r.pct >= 50 ? '#eab308' : '#ef4444'
          return (
            <div
              key={r.seccion}
              onClick={() => setSelectedSection(r.seccion)}
              className="cursor-pointer rounded-lg px-1.5 py-1 -mx-1.5 transition-colors hover:bg-white/[0.03]"
            >
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-slate-400 truncate">{r.seccion}</span>
                <span className="font-semibold tabular-nums shrink-0 ml-2" style={{ color: barColor }}>
                  {r.pct}%
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${r.pct}%`, background: barColor }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {selectedSection && (
        <MaturityDetailModal
          record={record}
          sectionName={selectedSection}
          onClose={() => setSelectedSection(null)}
        />
      )}
    </div>
  )
}
