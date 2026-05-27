import { createContext, useContext, useState, useMemo, useEffect } from 'react'

export const ISO_PRINCIPLES = [
  { id: 'Responsabilidad',       iconName: 'Shield',       hex: '#3b82f6' },
  { id: 'Estrategia',            iconName: 'Target',       hex: '#8b5cf6' },
  { id: 'Adquisición',           iconName: 'Package',      hex: '#f97316' },
  { id: 'Rendimiento',           iconName: 'TrendingUp',   hex: '#10b981' },
  { id: 'Conformidad',           iconName: 'CheckCircle2', hex: '#06b6d4' },
  { id: 'Comportamiento Humano', iconName: 'Users',        hex: '#ec4899' },
]

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
  }))

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
          'Descripción Resumida':   '',
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

  // Carga el JSON en runtime desde /data/ (dev: servido por Vite plugin; prod: Nginx)
  useEffect(() => {
    fetch('/data/Gobierno_TI_data.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — ${r.url}`)
        return r.json()
      })
      .then(data => { setRawData(data); setLoading(false) })
      .catch(err  => { setLoadError(err.message); setLoading(false) })
  }, [])

  const _data = useMemo(
    () => rawData ? buildData(rawData) : { iniciativas: [], objetivos_estrategicos: [] },
    [rawData]
  )

  const allKpis = useMemo(
    () => rawData ? rawData.map(normalizeKpi) : [],
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
    const fromData = rawData?.[0]?.resumen_global
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

  if (loading)   return <LoadingScreen />
  if (loadError) return <ErrorScreen error={loadError} />

  return (
    <Ctx.Provider value={{
      data: _data,
      allKpis,
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
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useDashboard = () => useContext(Ctx)
