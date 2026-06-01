import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Lock, ShieldCheck, ShieldAlert, FileText, BarChart3 } from 'lucide-react'

const C = {
  rojo:    '#ef4444',
  verde:   '#22c55e',
  amarillo:'#f59e0b',
  card:    '#0f172a',
  bloque:  '#1e293b',
  borde:   '#1e293b',
  texto:   '#f1f5f9',
  muted:   '#94a3b8',
}

function Sbadge({ label, color }) {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {label}
    </span>
  )
}

function SubBlock({ icon: Icon, iconColor, title, children }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: C.bloque, border: `1px solid ${C.borde}` }}>
      <div className="flex items-center gap-2">
        <Icon size={12} style={{ color: iconColor }} />
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>
          {title}
        </p>
      </div>
      {children}
    </div>
  )
}

export default function SeguridadPrivacidad({ data }) {
  if (!data) return null

  const { cifrado, rbac, arco, mspi } = data
  const arcoColor   = arco.cumplimiento_pct >= 80 ? C.verde : arco.cumplimiento_pct >= 50 ? C.amarillo : C.rojo
  const mspiPct     = mspi.meta_2028_pct > 0 ? Math.round((mspi.avance_pct / mspi.meta_2028_pct) * 100) : 0
  const arcoData    = [
    { value: arco.cumplimiento_pct },
    { value: 100 - arco.cumplimiento_pct },
  ]

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ background: C.card, borderColor: C.borde }}>

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b"
        style={{ borderColor: C.borde, background: 'rgba(34,197,94,0.05)' }}>
        <div className="p-1.5 rounded-lg shrink-0"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <ShieldCheck size={13} style={{ color: C.verde }} />
        </div>
        <h3 className="text-xs font-bold text-white">Seguridad y Privacidad</h3>
      </div>

      {/* Grid 2×2 */}
      <div className="p-4 grid grid-cols-2 gap-3">

        {/* Bloque 1 — Cifrado AES-256 */}
        <SubBlock icon={Lock} iconColor={C.rojo} title="Cifrado AES-256">
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-base font-bold" style={{ color: C.rojo }}>
              {cifrado.aes256_activo ? 'ACTIVO' : 'NO ACTIVO'}
            </span>
          </div>
          <p className="text-[10px]" style={{ color: C.muted }}>
            Datos críticos cifrados: <span className="font-bold text-white">{cifrado.datos_criticos_cifrados_pct}%</span>
          </p>
          <p className="text-[9px]" style={{ color: C.rojo }}>
            Diagnósticos psiquiátricos sin cifrar
          </p>
          <Sbadge label={cifrado.estado} color={C.rojo} />
        </SubBlock>

        {/* Bloque 2 — RBAC */}
        <SubBlock icon={ShieldAlert} iconColor={C.verde} title="Matriz RBAC">
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold tabular-nums" style={{ color: C.verde }}>
              {rbac.incidentes}
            </span>
            <span className="text-[11px]" style={{ color: C.muted }}>incidentes</span>
          </div>
          <p className="text-[10px]" style={{ color: C.muted }}>Accesos no autorizados este período</p>
          <Sbadge label={rbac.estado} color={C.verde} />
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full w-fit"
            style={{ background: 'rgba(245,158,11,0.12)', color: C.amarillo, border: '1px solid rgba(245,158,11,0.25)' }}>
            Revisión perfiles: {data.revision_perfiles_fecha}
          </span>
        </SubBlock>

        {/* Bloque 3 — ARCO */}
        <SubBlock icon={FileText} iconColor={arcoColor} title="Derechos ARCO · Ley 1581/2012">
          <div className="flex items-center gap-3 mt-1">
            {/* Donut */}
            <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
              <ResponsiveContainer width={64} height={64}>
                <PieChart>
                  <Pie data={arcoData} cx="50%" cy="50%"
                    innerRadius={20} outerRadius={29}
                    dataKey="value" startAngle={90} endAngle={450}
                    strokeWidth={0}>
                    <Cell fill={arcoColor} />
                    <Cell fill="#0f172a" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold" style={{ color: arcoColor }}>
                  {arco.cumplimiento_pct}%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold" style={{ color: C.texto }}>
                {arco.resueltas_en_tiempo} de {arco.solicitudes_mes} solicitudes
              </p>
              <p className="text-[9px]" style={{ color: C.muted }}>
                Límite legal: {arco.limite_dias_habiles} días hábiles
              </p>
              <Sbadge label={arco.estado} color={arcoColor} />
            </div>
          </div>
        </SubBlock>

        {/* Bloque 4 — MSPI */}
        <SubBlock icon={BarChart3} iconColor={C.rojo} title="MSPI MinTIC">
          <Sbadge label={mspi.estado} color={C.rojo} />
          <div className="mt-1">
            <div className="flex justify-between text-[9px] mb-1" style={{ color: C.muted }}>
              <span><span className="font-bold text-white">{mspi.avance_pct}%</span> implementado</span>
              <span>meta 2028: <span className="font-bold text-white">{mspi.meta_2028_pct}%</span></span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#0f172a' }}>
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(mspiPct, 1.5)}%`,
                  background: mspiPct === 0 ? C.rojo : C.amarillo,
                }} />
            </div>
            <p className="text-[9px] mt-1.5" style={{ color: C.muted }}>
              {mspiPct}% del objetivo — Modelo de Seguridad y Privacidad de la Información
            </p>
          </div>
        </SubBlock>
      </div>

      {/* Fila pills inferior */}
      <div className="px-4 pb-4 flex flex-wrap gap-2">
        {[
          { label: 'Data Masking: ' + (data.data_masking_activo ? 'Activo' : 'No activo'), color: data.data_masking_activo ? C.verde : C.rojo },
          { label: `Violaciones SIC: ${data.violaciones_reportadas_sic}`, color: data.violaciones_reportadas_sic === 0 ? C.verde : C.rojo },
          { label: `Revisión RBAC: ${data.revision_perfiles_fecha}`, color: C.amarillo },
        ].map(({ label, color }) => (
          <span key={label}
            className="text-[9px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${color}12`, color, border: `1px solid ${color}28` }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
