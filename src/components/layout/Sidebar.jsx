import { LayoutDashboard, TrendingUp, Users, Cpu, BookOpen, ChevronRight } from 'lucide-react'

const PERSPECTIVAS = [
  { id: 'all', label: 'Todos los KPIs', icon: LayoutDashboard, color: 'text-slate-500' },
  { id: 'Finanzas', label: 'Finanzas', icon: TrendingUp, color: 'text-emerald-600' },
  { id: 'Clientes', label: 'Clientes', icon: Users, color: 'text-blue-600' },
  { id: 'Procesos Internos', label: 'Procesos Internos', icon: Cpu, color: 'text-violet-600' },
  { id: 'Aprendizaje y Crecimiento', label: 'Aprendizaje', icon: BookOpen, color: 'text-amber-600' },
]

export default function Sidebar({ activePerspectiva, onSelect }) {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <div className="px-4 py-5 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perspectiva BSC</p>
      </div>
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {PERSPECTIVAS.map(({ id, label, icon: Icon, color }) => {
          const active = activePerspectiva === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${active
                  ? 'bg-[#1e4d8c] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <Icon size={17} className={active ? 'text-white' : color} />
              <span className="flex-1 text-left">{label}</span>
              {active && <ChevronRight size={14} className="text-white/60" />}
            </button>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 leading-relaxed">
          Dashboard Gobierno TI<br />
          <span className="font-semibold text-slate-500">ISO 38500 + BSC</span>
        </p>
      </div>
    </aside>
  )
}
