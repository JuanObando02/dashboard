import { Search, X } from 'lucide-react'

const PRINCIPIOS_ISO = [
  'Todos',
  'Responsabilidad',
  'Estrategia',
  'Adquisición',
  'Rendimiento',
  'Conformidad',
  'Comportamiento Humano',
]

export default function FilterBar({ filters, onChange, roles }) {
  function handleChange(key, value) {
    onChange({ ...filters, [key]: value })
  }

  function clearAll() {
    onChange({ perspectiva: 'all', principio: 'Todos', rol: 'Todos', search: '' })
  }

  const hasActiveFilter =
    filters.principio !== 'Todos' ||
    filters.rol !== 'Todos' ||
    filters.search !== ''

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar KPI..."
          value={filters.search}
          onChange={e => handleChange('search', e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      </div>

      {/* Principio ISO */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Principio ISO:</label>
        <select
          value={filters.principio}
          onChange={e => handleChange('principio', e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {PRINCIPIOS_ISO.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Rol */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Responsable:</label>
        <select
          value={filters.rol}
          onChange={e => handleChange('rol', e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="Todos">Todos</option>
          {roles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Clear */}
      {hasActiveFilter && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-2 py-1.5 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <X size={13} />
          Limpiar
        </button>
      )}
    </div>
  )
}
