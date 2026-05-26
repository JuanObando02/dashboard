import { createContext, useContext, useState, useMemo } from 'react'
import rawData from '../data/Gobierno_TI_data.json'

const kpisRaw = rawData.filter(d => d.__tipo === 'kpi')
const contextRaw = rawData.filter(d => d.__tipo === 'contexto')

const iniciativas = contextRaw.filter(x => x.ID && x.ID.startsWith('I-'))
const objetivos_estrategicos = []
const seenOes = new Set()
contextRaw.forEach(x => {
  const oeId = x["Objetivo Estratégico"]
  const desc = x["Descripción"] || x["Descripción OE"]
  if (oeId && desc && !seenOes.has(oeId)) {
    seenOes.add(oeId)
    objetivos_estrategicos.push({
      "Objetivo Estratégico": oeId,
      "Descripción": desc
    })
  }
})

const _data = {
  iniciativas,
  objetivos_estrategicos
}

export const ISO_PRINCIPLES = [
  { id: 'Responsabilidad', iconName: 'Shield', hex: '#3b82f6' },
  { id: 'Estrategia', iconName: 'Target', hex: '#8b5cf6' },
  { id: 'Adquisición', iconName: 'Package', hex: '#f97316' },
  { id: 'Rendimiento', iconName: 'TrendingUp', hex: '#10b981' },
  { id: 'Conformidad', iconName: 'CheckCircle2', hex: '#06b6d4' },
  { id: 'Comportamiento Humano', iconName: 'Users', hex: '#ec4899' },
]

const Ctx = createContext(null)

export function DashboardProvider({ children }) {
  const [activePrinciple, setActivePrinciple] = useState(null)
  const [selectedKpiIdx, setSelectedKpiIdx] = useState(0)
  const [periodFilter, setPeriodFilter] = useState('6m')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const allKpis = useMemo(() => {
    return kpisRaw.map(k => {
      const valorActual = k['Valor Actual']
      const valSim = k.valor_actual_simulado
      const meta = k['Meta 2029']
      const critico = k['Umbral Crítico']
      const moderado = k['Umbral Moderado']

      let semaforo = 'rojo'
      if (valorActual !== null && valorActual !== undefined && moderado !== null && critico !== null) {
        if (k.Tipo === 'MIN') {
          if (valorActual <= moderado) semaforo = 'verde'
          else if (valorActual <= critico) semaforo = 'amarillo'
          else semaforo = 'rojo'
        } else {
          if (valorActual >= moderado) semaforo = 'verde'
          else if (valorActual >= critico) semaforo = 'amarillo'
          else semaforo = 'rojo'
        }
      }

      let cumplimiento_pct = 0
      if (valSim !== null && valSim !== undefined && meta) {
        if (k.Tipo === 'MIN') {
          cumplimiento_pct = Math.round((meta / valSim) * 100)
        } else {
          cumplimiento_pct = Math.round((valSim / meta) * 100)
        }
      }

      // Compute budget
      const initIds = (k.Iniciativas ?? '').split(',').map(s => s.trim()).filter(Boolean)
      const totalBudget = initIds.reduce((sum, id) => {
        const ini = iniciativas.find(i => i.ID === id)
        return sum + (ini ? (ini["Presupuesto (COP)"] || 0) : 0)
      }, 0)
      const presupuesto_cop = totalBudget > 0 ? `$${totalBudget.toLocaleString('en-US')}` : '—'

      return {
        ...k,
        semaforo,
        cumplimiento_pct,
        presupuesto_cop
      }
    })
  }, [])

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
        k.KPI?.toLowerCase().includes(q) ||
        k.rol_responsable?.toLowerCase().includes(q)
      )
    }
    return kpis
  }, [activePrinciple, allKpis, searchQuery, roleFilter])

  const safeIdx = selectedKpiIdx < filteredKpis.length ? selectedKpiIdx : 0
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
