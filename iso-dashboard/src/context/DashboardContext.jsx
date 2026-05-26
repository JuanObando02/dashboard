import { createContext, useContext, useState, useMemo } from 'react'
import rawData from '../data/dashboard_data.json'

const _data = rawData[0]

export const ISO_PRINCIPLES = [
  { id: 'Responsabilidad',       iconName: 'Shield',       hex: '#3b82f6' },
  { id: 'Estrategia',            iconName: 'Target',       hex: '#8b5cf6' },
  { id: 'Adquisición',           iconName: 'Package',      hex: '#f97316' },
  { id: 'Rendimiento',           iconName: 'TrendingUp',   hex: '#10b981' },
  { id: 'Conformidad',           iconName: 'CheckCircle2', hex: '#06b6d4' },
  { id: 'Comportamiento Humano', iconName: 'Users',        hex: '#ec4899' },
]

const Ctx = createContext(null)

export function DashboardProvider({ children }) {
  const [activePrinciple, setActivePrinciple] = useState(null)
  const [selectedKpiIdx,  setSelectedKpiIdx]  = useState(0)
  const [periodFilter,    setPeriodFilter]     = useState('6m')
  const [searchQuery,     setSearchQuery]      = useState('')
  const [roleFilter,      setRoleFilter]       = useState('')

  const allKpis = _data.kpis

  const uniqueRoles = useMemo(
    () => [...new Set(allKpis.map(k => k.rol_responsable).filter(Boolean))].sort(),
    [allKpis]
  )

  const filteredKpis = useMemo(() => {
    let kpis = activePrinciple
      ? allKpis.filter(k => k.principio_iso === activePrinciple)
      : allKpis

    if (roleFilter) {
      kpis = kpis.filter(k => k.rol_responsable?.toLowerCase().includes(roleFilter.toLowerCase()))
    } else if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      kpis = kpis.filter(k =>
        k.kpi?.toLowerCase().includes(q) ||
        k.rol_responsable?.toLowerCase().includes(q)
      )
    }
    return kpis
  }, [activePrinciple, allKpis, searchQuery, roleFilter])

  const safeIdx     = selectedKpiIdx < filteredKpis.length ? selectedKpiIdx : 0
  const selectedKpi = filteredKpis[safeIdx] ?? null

  function togglePrinciple(id) {
    setActivePrinciple(prev => (prev === id ? null : id))
    setSelectedKpiIdx(0)
  }

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
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useDashboard = () => useContext(Ctx)
