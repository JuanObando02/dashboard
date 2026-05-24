import { Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

const cards = [
  {
    key: 'total',
    label: 'Total KPIs',
    icon: Activity,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-700',
    valueColor: 'text-blue-900',
  },
  {
    key: 'verde',
    label: 'Óptimo',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    textColor: 'text-emerald-700',
    valueColor: 'text-emerald-900',
  },
  {
    key: 'amarillo',
    label: 'Precaución',
    icon: AlertTriangle,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-700',
    valueColor: 'text-yellow-900',
  },
  {
    key: 'rojo',
    label: 'Crítico',
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-600',
    textColor: 'text-red-700',
    valueColor: 'text-red-900',
  },
]

export default function Scorecards({ kpis }) {
  const counts = {
    total: kpis.length,
    verde: kpis.filter(k => k.semaforo === 'verde').length,
    amarillo: kpis.filter(k => k.semaforo === 'amarillo').length,
    rojo: kpis.filter(k => k.semaforo === 'rojo').length,
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 pb-0">
      {cards.map(({ key, label, icon: Icon, bg, border, iconColor, textColor, valueColor }) => (
        <div
          key={key}
          className={`${bg} ${border} border rounded-xl p-4 flex items-center gap-4`}
        >
          <div className={`${bg} p-2 rounded-lg border ${border}`}>
            <Icon size={24} className={iconColor} />
          </div>
          <div>
            <p className={`text-xs font-medium ${textColor} uppercase tracking-wide`}>{label}</p>
            <p className={`text-3xl font-bold ${valueColor} leading-none mt-0.5`}>{counts[key]}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
