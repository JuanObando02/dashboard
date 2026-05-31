import {
  Database, BrainCircuit, ShieldCheck, BarChart2,
  FlaskConical, FileSearch, Lock, GitBranch,
  Cpu, Eye, Scale, AlertTriangle,
} from 'lucide-react'

function MacroBadge({ icon: Icon, label, value, sub, color, bg, border }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-3 border" style={{ background: bg, borderColor: border }}>
      <div className="p-2 rounded-lg shrink-0" style={{ background: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: `${color}99` }}>{label}</p>
        <p className="text-xl font-bold leading-none" style={{ color }}>{value}</p>
        {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function SectionCard({ icon: Icon, title, description, color, children }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: '#111e35', borderColor: '#1e293b' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: '#1e293b', background: `${color}08` }}>
        <div className="p-2 rounded-lg shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function PlaceholderBlock({ icon: Icon, label, color = '#334155' }) {
  return (
    <div className="rounded-lg border p-4 flex items-center gap-3" style={{ background: '#0b1829', borderColor: '#1e293b' }}>
      <Icon size={14} style={{ color }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <div className="mt-2 space-y-1.5">
          <div className="h-2 rounded-full" style={{ background: '#1e293b', width: '75%' }} />
          <div className="h-2 rounded-full" style={{ background: '#1e293b', width: '50%' }} />
        </div>
      </div>
      <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold shrink-0"
        style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308', border: '1px solid rgba(234,179,8,0.25)' }}>
        En desarrollo
      </span>
    </div>
  )
}

export default function DatosIAPanel() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Fila superior — Macro KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MacroBadge
          icon={ShieldCheck}
          label="Confianza del dato clínico"
          value="—"
          sub="Índice MSPI · Sin datos"
          color="#22c55e"
          bg="rgba(34,197,94,0.06)"
          border="rgba(34,197,94,0.2)"
        />
        <MacroBadge
          icon={Database}
          label="Cobertura de datos gobernados"
          value="—"
          sub="% fuentes registradas"
          color="#3b82f6"
          bg="rgba(59,130,246,0.06)"
          border="rgba(59,130,246,0.2)"
        />
        <MacroBadge
          icon={Cpu}
          label="Modelos IA activos"
          value="—"
          sub="Hub de Valor Público"
          color="#8b5cf6"
          bg="rgba(139,92,246,0.06)"
          border="rgba(139,92,246,0.2)"
        />
        <MacroBadge
          icon={Scale}
          label="Auditorías éticas IA"
          value="—"
          sub="Revisiones completadas"
          color="#f59e0b"
          bg="rgba(245,158,11,0.06)"
          border="rgba(245,158,11,0.2)"
        />
      </div>

      {/* Cuerpo — Dos columnas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* ── Columna Izquierda: Gobierno de Datos ── */}
        <SectionCard
          icon={Database}
          title="Gobierno de Datos"
          description="Calidad, seguridad y ciclo de vida del dato clínico y administrativo"
          color="#3b82f6"
        >
          <PlaceholderBlock icon={FileSearch}    label="Catálogo de datos institucional · Linaje y trazabilidad" color="#3b82f6" />
          <PlaceholderBlock icon={ShieldCheck}   label="Cumplimiento MSPI · Controles de privacidad activos"    color="#22c55e" />
          <PlaceholderBlock icon={Lock}          label="Cifrado de datos clínicos sensibles · Estado HCE"       color="#06b6d4" />
          <PlaceholderBlock icon={AlertTriangle} label="Incidentes de calidad de dato · Alertas de integridad"  color="#ef4444" />
          <PlaceholderBlock icon={GitBranch}     label="Interoperabilidad HIS–KACTUS · Flujos activos"          color="#8b5cf6" />
        </SectionCard>

        {/* ── Columna Derecha: Gobierno de IA ── */}
        <SectionCard
          icon={BrainCircuit}
          title="Gobierno de IA y Analítica"
          description="Hub de Valor Público · Modelos predictivos, eficiencia y auditoría ética"
          color="#8b5cf6"
        >
          <PlaceholderBlock icon={Cpu}           label="Modelos predictivos activos · Rendimiento y drift"      color="#8b5cf6" />
          <PlaceholderBlock icon={BarChart2}     label="Dashboards analíticos · Decisiones soportadas por datos" color="#3b82f6" />
          <PlaceholderBlock icon={Eye}           label="Transparencia algorítmica · Explicabilidad de modelos"  color="#f59e0b" />
          <PlaceholderBlock icon={Scale}         label="Auditoría ética · Revisión de sesgos y equidad"         color="#10b981" />
          <PlaceholderBlock icon={FlaskConical}  label="Pipeline MLOps · Ciclo de vida de modelos clínicos"     color="#06b6d4" />
        </SectionCard>

      </div>
    </div>
  )
}