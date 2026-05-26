import { useState, useRef, useEffect } from 'react'
import { Search, X, User } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'

export default function SmartSearch() {
  const { searchQuery, setSearchQuery, roleFilter, setRoleFilter, uniqueRoles, setSelectedKpiIdx } = useDashboard()
  const [inputValue, setInputValue]   = useState('')
  const [showSuggest, setShowSuggest] = useState(false)
  const inputRef = useRef(null)
  const boxRef   = useRef(null)

  const suggestions = inputValue.trim().length > 0
    ? uniqueRoles.filter(r => r.toLowerCase().includes(inputValue.trim().toLowerCase())).slice(0, 6)
    : []

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

  function clearAll() {
    setInputValue('')
    setSearchQuery('')
    setRoleFilter('')
    setSelectedKpiIdx(0)
    inputRef.current?.focus()
  }

  const hasFilter = roleFilter || searchQuery.trim()

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <div
        className="flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors"
        style={{
          background:   '#111e35',
          borderColor:  showSuggest ? '#3b82f6' : '#1e293b',
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

      {showSuggest && suggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl border border-slate-700 overflow-hidden shadow-2xl"
          style={{ background: '#111e35' }}
        >
          <p className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
            Roles responsables
          </p>
          {suggestions.map(role => (
            <button
              key={role}
              onMouseDown={() => applyRole(role)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-blue-600/10 hover:text-white text-left transition-colors"
            >
              <User size={13} className="text-blue-400 shrink-0" />
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
