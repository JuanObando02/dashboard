import { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react'

export const ISO_PRINCIPLES = [
  { id: 'Responsabilidad',       iconName: 'Shield',       hex: '#3b82f6', hdpuv: ['Honestidad', 'Compromiso y Diligencia', 'Servicios'] },
  { id: 'Estrategia',            iconName: 'Target',       hex: '#8b5cf6', hdpuv: ['Conocimiento', 'Compromiso'] },
  { id: 'Adquisición',           iconName: 'Package',      hex: '#f97316', hdpuv: ['Honestidad', 'Diligencia', 'Servicio'] },
  { id: 'Rendimiento',           iconName: 'TrendingUp',   hex: '#10b981', hdpuv: ['Diligencia', 'Servicio', 'Compromiso'] },
  { id: 'Conformidad',           iconName: 'CheckCircle2', hex: '#06b6d4', hdpuv: ['Honestidad', 'Seguridad'] },
  { id: 'Comportamiento Humano', iconName: 'Users',        hex: '#ec4899', hdpuv: ['Respeto', 'Justicia e Inclusión', 'Humanización'] },
]

/**
 * Pesos estratégicos por KPI para el cálculo de Promedio Ponderado de Cumplimiento
 * por Principio ISO 38500. Suma dentro de cada principio = 1.0 (100%).
 * Fuente: definición estratégica del equipo de Gobierno TI – HDPUV.
 */
export const KPI_WEIGHTS = {
  // ── Rendimiento (20 KPIs, suma = 1.00) ─────────────────────────────
   1: 0.12,   // % uptime HIS (HOSVITAL)                         → 12%
   2: 0.10,   // % incidentes críticos resueltos dentro del SLA  → 10%
  13: 0.08,   // % módulos críticos HIS implementados y operativos→  8%
  19: 0.08,   // MTTR ante incidente mayor (horas)               →  8%
  46: 0.06,   // Tiempo promedio activación plan contingencia     →  6%
  // Otros 15 operacionales → 56% / 15 ≈ 3.73% c/u
   3: 0.0373,
   5: 0.0373,
   6: 0.0373,
   7: 0.0373,
   8: 0.0373,
  10: 0.0373,
  11: 0.0373,
  15: 0.0373,
  23: 0.0373,
  24: 0.0373,
  26: 0.0373,
  27: 0.0373,
  32: 0.0373,
  36: 0.0373,
  45: 0.0373,

  // ── Adquisición (12 KPIs, suma = 1.00) ─────────────────────────────
  39: 0.15,   // % ejecución presupuestal TI sin desviación >15%  → 15%
  38: 0.10,   // % proyectos TI con ficha presupuestal completa   → 10%
  40: 0.10,   // Nivel madurez gestión de costos TI               → 10%
  41: 0.10,   // % reducción costos operativos TI año a año       → 10%
  43: 0.10,   // % servicios TI migrados a nube con reducción de costo → 10%
  44: 0.10,   // % riesgos financieros TI con plan mitigación     → 10%
  // Otros 6 → 35% / 6 ≈ 5.83% c/u
   9: 0.0583,
  12: 0.0583,
  14: 0.0583,
  25: 0.0583,
  37: 0.0583,
  42: 0.0583,

  // ── Conformidad (4 KPIs, suma = 1.00) ──────────────────────────────
  17: 0.30,   // % datos clínicos sensibles con criptografía activa → 30%
  16: 0.25,   // % controles MSPI implementados                    → 25%
  18: 0.25,   // N.º incidentes de seguridad con impacto clínico   → 25%
  28: 0.20,   // % cumplimiento normativo trazabilidad HCE         → 20%

  // ── Comportamiento Humano (4 KPIs, suma = 1.00) ────────────────────
  29: 0.30,   // % personal con formación TI completada y evaluada → 30%
   4: 0.25,   // Índice satisfacción usuarios internos             → 25%
  30: 0.25,   // Índice de apropiación tecnológica                 → 25%
  31: 0.20,   // % formación vía plataforma virtual vs. presencial → 20%

  // ── Responsabilidad (4 KPIs, suma = 1.00) ──────────────────────────
  20: 0.30,   // % cumplimiento POA TI bajo modelo gobierno        → 30%
  21: 0.30,   // Nivel madurez gobierno TI (COBIT/MIPG)            → 30%
  22: 0.20,   // % sesiones Comité Gobierno TI realizadas          → 20%
  35: 0.20,   // % roles críticos TI cubiertos con perfil esp.     → 20%

  // ── Estrategia (2 KPIs, suma = 1.00) ───────────────────────────────
  33: 0.60,   // % decisiones soportadas por datos estructurados   → 60%
  34: 0.40,   // Tiempo promedio incorporación nueva fuente datos   → 40%
}

function normalizeKpi(k) {
  const semaforo       = (k.estado_codigo ?? 'ROJO').toLowerCase()
  const cumplimiento_pct = k.cumplimiento_meta_pct ?? 0

  const totalBudget = (k.contexto?.iniciativas ?? []).reduce(
    (sum, i) => sum + (i.presupuesto ?? 0), 0
  )
  const presupuesto_cop = totalBudget > 0
    ? `$${totalBudget.toLocaleString('en-US')}`
    : '—'

  const historico_simulado = (k.mediciones ?? []).map(m => ({
    periodo: m.fecha ? m.fecha.substring(0, 7) : '',
    valor:   m.valor ?? null,
    observaciones: m.observaciones ?? '',
  }))

  // Soporta formato nuevo (k.auditoria) y formato antiguo (k.ultima_auditoria)
  const rawAuditoria = k.auditoria ?? k.ultima_auditoria ?? null
  const auditoria = rawAuditoria ? {
    ...rawAuditoria,
    plan_accion: typeof rawAuditoria.plan_accion === 'string'
      ? (() => { try { return JSON.parse(rawAuditoria.plan_accion) } catch { return [] } })()
      : (rawAuditoria.plan_accion ?? []),
  } : null

  return {
    ...k,
    KPI:                k.kpi,
    Perspectiva:        k.perspectiva,
    'Obj. BSC':         k.obj_bsc,
    Unidad:             k.unidad,
    'Valor Actual':     k.valor_actual,
    linea_base_2025:    k.linea_base_2025 ?? null,
    'Meta 2026':        k.meta_2026 ?? null,
    'Meta 2027':        k.meta_2027 ?? null,
    'Meta 2028':        k.meta_2028 ?? null,
    'Meta 2029':        k.meta_2029 ?? null,
    Tipo:               k.tipo,
    Frecuencia:         k.frecuencia,
    Fuente:             k.contexto?.fuente?.descripcion ?? null,
    rol_responsable:    k.responsable,
    Iniciativas:        (k.contexto?.iniciativas ?? []).map(i => i.id).join(', '),
    'OEs Relacionados': (k.contexto?.objetivos_estrategicos ?? []).map(oe => oe.id).join(', '),
    historico_simulado,
    semaforo,
    cumplimiento_pct,
    presupuesto_cop,
    auditoria,
    peso: KPI_WEIGHTS[k.id_kpi] ?? null,   // null = sin peso definido → usa igual en agregación
  }
}

function buildData(rawData) {
  const seenInits = new Set()
  const iniciativas = []
  rawData.forEach(k => {
    ;(k.contexto?.iniciativas ?? []).forEach(ini => {
      if (!seenInits.has(ini.id)) {
        seenInits.add(ini.id)
        iniciativas.push({
          ID:                     ini.id,
          'Nombre Iniciativa':    ini.nombre,
          'Presupuesto (COP)':    ini.presupuesto,
          'Período':              `${ini.inicio} – ${ini.fin}`,
          'Objetivo(s) BSC':      ini.obj_bsc,
          'Objetivos Estratégicos': '',
          'Descripción Resumida':   ini.descripcion ?? '',
          inicio:                 ini.inicio ?? null,
          fin:                    ini.fin ?? null,
          ejecucion:              ini.ejecucion ?? null,
        })
      }
    })
  })

  const seenOes = new Set()
  const objetivos_estrategicos = []
  rawData.forEach(k => {
    ;(k.contexto?.objetivos_estrategicos ?? []).forEach(oe => {
      if (!seenOes.has(oe.id)) {
        seenOes.add(oe.id)
        objetivos_estrategicos.push({
          'Objetivo Estratégico': oe.id,
          'Descripción':          oe.nombre,
          'Descripción Completa': oe.descripcion ?? null,
          'Ruta':                 oe.ruta ?? null,
          'Objetivos BSC':        oe.objetivos_bsc ?? null,
        })
      }
    })
  })

  return { iniciativas, objetivos_estrategicos }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b1829' }}>
      <div className="text-center space-y-3">
        <div
          className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"
        />
        <p className="text-slate-400 text-sm">Cargando datos del dashboard…</p>
      </div>
    </div>
  )
}

function ErrorScreen({ error }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b1829' }}>
      <div className="text-center space-y-2 max-w-sm px-4">
        <p className="text-red-400 font-semibold text-sm">Error al cargar datos</p>
        <p className="text-slate-500 text-xs font-mono break-all">{error}</p>
        <p className="text-slate-600 text-xs mt-1">
          Verifica que el archivo exista en{' '}
          <code className="text-slate-500">data/Gobierno_TI_data.json</code>
        </p>
      </div>
    </div>
  )
}

const Ctx = createContext(null)

export function DashboardProvider({ children }) {
  const [rawData,   setRawData]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [activePrinciple, setActivePrinciple]       = useState(null)
  const [selectedKpiIdx, setSelectedKpiIdx]         = useState(0)
  const [periodFilter, setPeriodFilter]             = useState('6m')
  const [searchQuery, setSearchQuery]               = useState('')
  const [roleFilter, setRoleFilter]                 = useState('')
  const [perspectiveFilter, setPerspectiveFilter]   = useState('')
  const [statusFilter, setStatusFilter]             = useState('')

  useEffect(() => {
    const timestamp = new Date().getTime()
    fetch(`/data/Gobierno_TI_data.json?t=${timestamp}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — ${r.url}`)
        return r.json()
      })
      .then(raw => {
        // Soporta formato nuevo [{"data":[...]}] y formato plano antiguo [...]
        const data = Array.isArray(raw) && raw.length > 0 && raw[0]?.data
          ? raw[0].data
          : raw
        setRawData(data)
        setLoading(false)
      })
      .catch(err => { setLoadError(err.message); setLoading(false) })
  }, [])

  const _data = useMemo(
    () => rawData ? buildData(rawData) : { iniciativas: [], objetivos_estrategicos: [] },
    [rawData]
  )

  const madurezData = useMemo(
    () => rawData ? rawData.filter(k => k.__tipo === 'MADUREZ') : [],
    [rawData]
  )

  const allKpis = useMemo(
    () => rawData
      ? rawData.filter(k => k.__tipo !== 'MADUREZ' && (k.kpi || k.KPI)).map(normalizeKpi)
      : [],
    [rawData]
  )

  const uniqueRoles = useMemo(
    () => [...new Set(allKpis.map(k => k.rol_responsable).filter(Boolean))].sort(),
    [allKpis]
  )

  const uniquePerspectives = useMemo(
    () => [...new Set(allKpis.map(k => k.Perspectiva).filter(Boolean))].sort(),
    [allKpis]
  )

  const globalCounts = useMemo(() => {
    // resumen_global puede estar en cada KPI (nuevo formato) o en el primer item del array plano
    const fromData = allKpis[0]?.resumen_global ?? rawData?.[0]?.resumen_global
    if (fromData) return fromData
    return {
      total_kpis: allKpis.length,
      criticos:   allKpis.filter(k => k.semaforo === 'rojo').length,
      moderados:  allKpis.filter(k => k.semaforo === 'amarillo').length,
      normales:   allKpis.filter(k => k.semaforo === 'verde').length,
    }
  }, [rawData, allKpis])

  const filteredKpis = useMemo(() => {
    let kpis = activePrinciple
      ? allKpis.filter(k => k.principio_iso === activePrinciple)
      : allKpis

    if (roleFilter) {
      kpis = kpis.filter(k => k.rol_responsable?.toLowerCase().includes(roleFilter.toLowerCase()))
    } else if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      kpis = kpis.filter(k =>
        k.KPI?.toLowerCase().includes(q) ||
        k.rol_responsable?.toLowerCase().includes(q)
      )
    }

    if (perspectiveFilter) {
      kpis = kpis.filter(k => k.Perspectiva === perspectiveFilter)
    }

    if (statusFilter) {
      kpis = kpis.filter(k => k.semaforo === statusFilter)
    }

    return kpis
  }, [activePrinciple, allKpis, searchQuery, roleFilter, perspectiveFilter, statusFilter])

  const safeIdx     = selectedKpiIdx < filteredKpis.length ? selectedKpiIdx : 0
  const selectedKpi = filteredKpis[safeIdx] ?? null

  function togglePrinciple(id) {
    setActivePrinciple(prev => (prev === id ? null : id))
    setSelectedKpiIdx(0)
  }

  function applyStatusFilter(status) {
    setStatusFilter(status)
    setActivePrinciple(null)
    setSearchQuery('')
    setRoleFilter('')
    setPerspectiveFilter('')
    setSelectedKpiIdx(0)
  }

  // ── Auto-play ──────────────────────────────────────────────────
  const AUTOPLAY_MS      = 12000
  const RESUME_HOVER_MS  = 4000
  const RESUME_INTERACT_MS = 12000

  const filteredLenRef = useRef(0)
  const apRef = useRef({ paused: false, hovered: false, resumeTimer: null })

  useEffect(() => { filteredLenRef.current = filteredKpis.length }, [filteredKpis])

  useEffect(() => {
    const id = setInterval(() => {
      const { paused, hovered } = apRef.current
      const len = filteredLenRef.current
      if (!paused && !hovered && len > 1) {
        setSelectedKpiIdx(prev => (prev + 1) % len)
      }
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [])

  function pauseAutoPlay(ms = RESUME_INTERACT_MS) {
    apRef.current.paused = true
    clearTimeout(apRef.current.resumeTimer)
    apRef.current.resumeTimer = setTimeout(() => {
      apRef.current.paused = false
    }, ms)
  }

  function setAutoPlayHovered(val) {
    apRef.current.hovered = val
    clearTimeout(apRef.current.resumeTimer)
    if (!val) {
      apRef.current.resumeTimer = setTimeout(() => {
        apRef.current.paused = false
      }, RESUME_HOVER_MS)
    }
  }
  // ───────────────────────────────────────────────────────────────

  if (loading)   return <LoadingScreen />
  if (loadError) return <ErrorScreen error={loadError} />

  return (
    <Ctx.Provider value={{
      data: _data,
      allKpis,
      madurezData,
      filteredKpis,
      selectedKpi,
      setSelectedKpiIdx,
      activePrinciple,
      togglePrinciple,
      periodFilter,
      setPeriodFilter,
      searchQuery,
      setSearchQuery,
      roleFilter,
      setRoleFilter,
      uniqueRoles,
      perspectiveFilter,
      setPerspectiveFilter,
      statusFilter,
      setStatusFilter,
      applyStatusFilter,
      uniquePerspectives,
      globalCounts,
      pauseAutoPlay,
      setAutoPlayHovered,
      autoPlayMs: 12000,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useDashboard = () => useContext(Ctx)
