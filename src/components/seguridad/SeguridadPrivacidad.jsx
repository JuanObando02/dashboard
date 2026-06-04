import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Lock, ShieldCheck, ShieldAlert, FileText, BarChart3, Info } from 'lucide-react'

const C = {
  rojo:    '#ef4444',
  verde:   '#22c55e',
  amarillo:'#f59e0b',
  gris:    '#6b7280',
  card:    '#0f172a',
  bloque:  '#1e293b',
  borde:   '#1e293b',
  texto:   '#f1f5f9',
  muted:   '#94a3b8',
}

function semColor(estado) {
  const e = (estado || '').toUpperCase()
  if (e.includes('CRÍT') || e.includes('CRIT') || e.includes('NO ACTIV')) return C.rojo
  if (e.includes('REVIS') || e.includes('PREC') || e.includes('MODER'))   return C.amarillo
  if (e.includes('CONF') || e.includes('CUMPL') || e.includes('SEGUR') || e.includes('OK')) return C.verde
  return C.gris
}

function Sbadge({ label, color }) {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {label}
    </span>
  )
}

function BoolPill({ active, label }) {
  const color = active ? C.verde : C.rojo
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold w-fit"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      {label ? `${label}: ` : ''}{active ? 'ACTIVO' : 'INACTIVO'}
    </span>
  )
}

function MiniGaugeSVG({ pct, color }) {
  const cx = 55, cy = 50, R = 40, sw = 10
  const clamped  = Math.min(100, Math.max(0, pct))
  const angleDeg = 180 - clamped * 1.8
  const rad      = (angleDeg * Math.PI) / 180
  const ex       = cx + R * Math.cos(rad)
  const ey       = cy - R * Math.sin(rad)
  return (
    <svg viewBox="0 0 110 76" style={{ width: '100%', display: 'block' }}>
      <path d={`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${cx+R} ${cy}`}
            fill="none" stroke="#0f172a" strokeWidth={sw} strokeLinecap="round" />
      {clamped > 0 && (
        <path d={`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${ex} ${ey}`}
              fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      )}
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize="22" fontWeight="800"
            fill="white" fontFamily="Inter,sans-serif">{pct}%</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="10" fill="#64748b"
            fontFamily="Inter,sans-serif" fontWeight="600" letterSpacing="0.08em">CIFRADO</text>
    </svg>
  )
}

function SubBlock({ icon: Icon, iconColor, title, headerRight, children }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2 relative"
      style={{ background: C.bloque, border: `1px solid ${C.borde}` }}>
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={12} style={{ color: iconColor }} />
          <p className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: C.muted }}>
            {title}
          </p>
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  )
}

export function SeguridadContent({ data }) {
  if (!data) return null

  const { cifrado, rbac, arco, mspi } = data
  const rbacColor    = semColor(rbac.estado)
  const mspiColor    = semColor(mspi.estado)
  const cifradoLabel = cifrado.estado ?? (cifrado.aes256_activo ? 'ACTIVO' : 'NO ACTIVO')
  const e            = cifradoLabel.toUpperCase()
  const cifradoColor = e.includes('CONF') || e.includes('CUMPL') || e.includes('SEGUR')
    ? C.verde : e.includes('REVIS') || e.includes('PREC') ? C.amarillo : C.rojo
  const arcoColor = arco.cumplimiento_pct >= 80 ? C.verde : arco.cumplimiento_pct >= 50 ? C.amarillo : C.rojo
  const mspiPct   = mspi.meta_2028_pct > 0 ? Math.round((mspi.avance_pct / mspi.meta_2028_pct) * 100) : 0
  const arcoData  = [{ value: arco.cumplimiento_pct }, { value: 100 - arco.cumplimiento_pct }]

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {/* Cifrado AES-256 */}
        <SubBlock icon={Lock} iconColor={cifradoColor} title="Cifrado AES-256"
          headerRight={
            <div className="relative group shrink-0 ml-auto">
              <Info size={12} className="text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
              <div className="absolute right-0 top-5 z-20 w-64 rounded-lg p-3 text-[10px] leading-relaxed text-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-normal normal-case text-left"
                style={{ background: '#0b1829', border: '1px solid #1e3a5f', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                <p className="font-bold text-white mb-1.5 border-b pb-1" style={{ borderColor: '#1e3a5f' }}>Glosario · Seguridad de Datos</p>
                <div className="space-y-2">
                  <div>
                    <p className="font-semibold text-blue-400">Cifrado AES-256</p>
                    <p className="text-slate-400 text-[9.5px]">Estándar de cifrado militar y gubernamental que protege la información médica en reposo.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-400">Data Masking</p>
                    <p className="text-slate-400 text-[9.5px]">Ofuscación dinámica de datos de identificación para usuarios sin privilegios.</p>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <div className="flex items-center gap-3 mt-1">
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <BoolPill active={cifrado.aes256_activo} />
              <BoolPill active={data.data_masking_activo} label="Data Masking" />
              {!cifrado.aes256_activo && (
                <p className="text-[10px] leading-tight" style={{ color: C.rojo }}>Diagnósticos psiquiátricos sin cifrar</p>
              )}
              <Sbadge label={cifradoLabel} color={cifradoColor} />
            </div>
            <div className="relative shrink-0" style={{ width: 135, height: 95 }}>
              <MiniGaugeSVG pct={cifrado.datos_criticos_cifrados_pct} color={cifradoColor} />
            </div>
          </div>
        </SubBlock>

        {/* RBAC */}
        <SubBlock icon={ShieldAlert} iconColor={rbacColor} title="Matriz RBAC">
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold tabular-nums" style={{ color: rbacColor }}>{rbac.incidentes}</span>
            <span className="text-[11px] font-semibold text-slate-300">incidentes</span>
          </div>
          <p className="text-[10px]" style={{ color: C.muted }}>Accesos no autorizados este período</p>
          <div className="flex flex-col gap-1.5 mt-1.5">
            <Sbadge label={rbac.estado} color={rbacColor} />
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit"
              style={{ background: 'rgba(245,158,11,0.12)', color: C.amarillo, border: '1px solid rgba(245,158,11,0.25)' }}>
              Revisión perfiles: {data.revision_perfiles_fecha}
            </span>
          </div>
        </SubBlock>

        {/* ARCO */}
        <SubBlock icon={FileText} iconColor={arcoColor} title="Derechos ARCO · Ley 1581/2012">
          <div className="flex items-center gap-3 mt-1">
            <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
              <ResponsiveContainer width={64} height={64}>
                <PieChart>
                  <Pie data={arcoData} cx="50%" cy="50%" innerRadius={20} outerRadius={29}
                    dataKey="value" startAngle={90} endAngle={450} strokeWidth={0}>
                    <Cell fill={arcoColor} />
                    <Cell fill="#0f172a" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold" style={{ color: arcoColor }}>{arco.cumplimiento_pct}%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: C.texto }}>{arco.resueltas_en_tiempo} de {arco.solicitudes_mes} solicitudes</p>
              <p className="text-[10px]" style={{ color: C.muted }}>Límite legal: {arco.limite_dias_habiles} días hábiles</p>
              <Sbadge label={arco.estado} color={arcoColor} />
            </div>
          </div>
        </SubBlock>

        {/* MSPI */}
        <SubBlock icon={BarChart3} iconColor={mspiColor} title="MSPI MinTIC">
          <Sbadge label={mspi.estado} color={mspiColor} />
          <div className="mt-1">
            <div className="flex justify-between text-[10px] mb-1" style={{ color: C.muted }}>
              <span><span className="font-bold text-white">{mspi.avance_pct}%</span> implementado</span>
              <span>meta 2028: <span className="font-bold text-white">{mspi.meta_2028_pct}%</span></span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#0f172a' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(mspiPct, 1.5)}%`, background: mspiPct === 0 ? C.rojo : C.amarillo }} />
            </div>
            <p className="text-[10px] mt-1.5" style={{ color: C.muted }}>{mspiPct}% del objetivo — Modelo de Seguridad y Privacidad</p>
          </div>
        </SubBlock>
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t mt-1" style={{ borderColor: C.borde }}>
        {[
          { label: `Violaciones SIC: ${data.violaciones_reportadas_sic}`, color: data.violaciones_reportadas_sic === 0 ? C.verde : C.rojo },
          { label: `Revisión RBAC: ${data.revision_perfiles_fecha}`, color: C.amarillo },
        ].map(({ label, color }) => (
          <span key={label} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${color}12`, color, border: `1px solid ${color}28` }}>
            {label}
          </span>
        ))}
      </div>
    </>
  )
}

export default function SeguridadPrivacidad({ data }) {
  if (!data) return null
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: C.card, borderColor: C.borde }}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b"
        style={{ borderColor: C.borde, background: 'rgba(34,197,94,0.05)' }}>
        <div className="p-1.5 rounded-lg shrink-0"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <ShieldCheck size={13} style={{ color: C.verde }} />
        </div>
        <h3 className="text-xs font-bold text-white">Seguridad y Privacidad</h3>
      </div>
      <div className="p-4">
        <SeguridadContent data={data} />
      </div>
    </div>
  )
}
