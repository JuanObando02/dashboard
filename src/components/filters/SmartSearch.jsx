import { useState, useRef, useEffect } from 'react'
import { Search, X, User, ChevronDown, BarChart2 } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

const STATUS_OPTIONS = [
  { value: 'rojo', label: 'Crítico', dot: '#ef4444' },
  { value: 'amarillo', label: 'Moderado', dot: '#eab308' },
  { value: 'verde', label: 'Normal', dot: '#22c55e' },
]

const SELECT_STYLE = {
  background: '#111e35',
  border: '1px solid #1e293b',
  color: '#94a3b8',
  borderRadius: '0.75rem',
  padding: '0.5rem 2rem 0.5rem 0.75rem',
  fontSize: '0.8rem',
  outline: 'none',
  appearance: 'none',
  cursor: 'pointer',
}

function FilterSelect({ value, onChange, placeholder, options, dotKey }) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={SELECT_STYLE}
        className="pr-7"
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  )
}

export default function SmartSearch() {
  const {
    searchQuery, setSearchQuery,
    roleFilter, setRoleFilter,
    uniqueRoles, setSelectedKpiIdx,
    perspectiveFilter, setPerspectiveFilter,
    statusFilter, applyStatusFilter,
    uniquePerspectives,
    allKpis,
  } = useDashboard()

  const [inputValue, setInputValue] = useState('')
  const [showSuggest, setShowSuggest] = useState(false)
  const inputRef = useRef(null)
  const boxRef = useRef(null)

  const q = inputValue.trim().toLowerCase()
  const roleSuggestions = q.length > 0
    ? uniqueRoles.filter(r => r.toLowerCase().includes(q)).slice(0, 3)
    : []
  const kpiSuggestions = q.length > 1
    ? allKpis.filter(k => k.KPI?.toLowerCase().includes(q)).slice(0, 4)
    : []
  const hasSuggestions = roleSuggestions.length > 0 || kpiSuggestions.length > 0

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowSuggest(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleInput(e) {
    const val = e.target.value
    setInputValue(val)
    setRoleFilter('')
    setSearchQuery(val)
    setSelectedKpiIdx(0)
    setShowSuggest(true)
  }

  function applyRole(role) {
    setRoleFilter(role)
    setSearchQuery('')
    setInputValue('')
    setShowSuggest(false)
    setSelectedKpiIdx(0)
  }

  function applyKpi(kpi) {
    setSearchQuery(kpi.KPI)
    setRoleFilter('')
    setInputValue(kpi.KPI)
    setShowSuggest(false)
    const idx = allKpis.findIndex(k => k === kpi)
    setSelectedKpiIdx(idx >= 0 ? idx : 0)
  }

  function clearAll() {
    setInputValue('')
    applyStatusFilter('')
    inputRef.current?.focus()
  }

  const hasFilter = roleFilter || searchQuery.trim() || perspectiveFilter || statusFilter

  const perspectiveOptions = uniquePerspectives.map(p => ({ value: p, label: p }))

  return (
    <div className="flex flex-wrap items-start gap-2">
      {/* Search box */}
      <div ref={boxRef} className="relative flex-1 min-w-[220px]">
        <div
          className="flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors"
          style={{
            background: '#111e35',
            borderColor: showSuggest ? '#3b82f6' : '#1e293b',
          }}
        >
          <Search size={15} className="text-slate-500 shrink-0" />

          {roleFilter ? (
            <span className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs px-2 py-0.5 rounded-md shrink-0">
              <User size={11} />
              {roleFilter}
            </span>
          ) : null}

          <input
            ref={inputRef}
            value={inputValue}
            onChange={handleInput}
            onFocus={() => setShowSuggest(true)}
            placeholder={roleFilter ? 'Buscar otro rol o KPI…' : 'Buscar KPI o rol responsable…'}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none min-w-0"
          />

          {hasFilter && (
            <button onClick={clearAll} className="text-slate-500 hover:text-slate-300 shrink-0">
              <X size={14} />
            </button>
          )}
        </div>

        {showSuggest && hasSuggestions && (
          <div
            className="absolute z-50 w-full mt-1 rounded-xl border border-slate-700 overflow-hidden shadow-2xl"
            style={{ background: '#111e35' }}
          >
            {kpiSuggestions.length > 0 && (
              <>
                <p className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  KPIs
                </p>
                {kpiSuggestions.map((kpi, i) => (
                  <button
                    key={i}
                    onMouseDown={() => applyKpi(kpi)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-blue-600/10 hover:text-white text-left transition-colors border-b border-slate-800/50"
                  >
                    <BarChart2 size={12} className="text-blue-400 shrink-0" />
                    <span className="truncate">{kpi.KPI}</span>
                    <span className="ml-auto text-[10px] text-slate-600 shrink-0">{kpi.Perspectiva}</span>
                  </button>
                ))}
              </>
            )}
            {roleSuggestions.length > 0 && (
              <>
                <p className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  Roles responsables
                </p>
                {roleSuggestions.map(role => (
                  <button
                    key={role}
                    onMouseDown={() => applyRole(role)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-blue-600/10 hover:text-white text-left transition-colors"
                  >
                    <User size={13} className="text-blue-400 shrink-0" />
                    {role}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Perspectiva filter */}
      <FilterSelect
        value={perspectiveFilter}
        onChange={v => { setPerspectiveFilter(v); setSelectedKpiIdx(0) }}
        placeholder="Perspectiva BSC"
        options={perspectiveOptions}
      />

      {/* Estado filter */}
      <FilterSelect
        value={statusFilter}
        onChange={v => applyStatusFilter(v)}
        placeholder="Estado"
        options={STATUS_OPTIONS}
      />
    </div>
  )
}
