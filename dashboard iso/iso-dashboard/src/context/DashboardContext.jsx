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

  const allKpis = _data.kpis

  const filteredKpis = useMemo(
    () => activePrinciple
      ? allKpis.filter(k => k.principio_iso === activePrinciple)
      : allKpis,
    [activePrinciple, allKpis]
  )

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
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useDashboard = () => useContext(Ctx)
