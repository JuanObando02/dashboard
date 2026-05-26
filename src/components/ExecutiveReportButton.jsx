import { FileDown } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'

function parseBudget(raw) {
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') return parseFloat(raw.replace(/[^0-9.]/g, '')) || 0
  return 0
}

function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
}

function semLabel(s) {
  return s === 'verde' ? 'Verde' : s === 'amarillo' ? 'Amarillo' : 'Rojo'
}

function semRgb(s) {
  if (s === 'verde')    return [34, 197, 94]
  if (s === 'amarillo') return [234, 179, 8]
  return [239, 68, 68]
}

export default function ExecutiveReportButton() {
  const { filteredKpis, activePrinciple, data } = useDashboard()

  async function generatePDF() {
    const { default: jsPDF }   = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const W = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()

    // ── Header band ──────────────────────────────────────────────────────────
    doc.setFillColor(15, 45, 82)
    doc.rect(0, 0, W, 22, 'F')

    doc.setFontSize(13)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text(data?.hospital_metadata?.nombre ?? 'Hospital', 12, 10)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(147, 197, 253)
    doc.text(data?.hospital_metadata?.modelo_gobierno ?? 'ISO 38500 & BSC', 12, 16)

    const principleLabel = activePrinciple ? `Principio: ${activePrinciple}` : 'Todos los principios'
    doc.setTextColor(200, 220, 255)
    doc.text(principleLabel, W - 12, 10, { align: 'right' })
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, W - 12, 16, { align: 'right' })

    // ── Summary strip ────────────────────────────────────────────────────────
    const rojos    = filteredKpis.filter(k => k.semaforo === 'rojo').length
    const amarillos = filteredKpis.filter(k => k.semaforo === 'amarillo').length
    const verdes   = filteredKpis.filter(k => k.semaforo === 'verde').length
    const avgCump  = filteredKpis.length
      ? (filteredKpis.reduce((s, k) => s + (k.cumplimiento_pct ?? 0), 0) / filteredKpis.length).toFixed(1)
      : 0

    const cards = [
      { label: 'Total KPIs',    value: filteredKpis.length, color: [59, 130, 246] },
      { label: 'Rojos',         value: rojos,               color: [239, 68, 68] },
      { label: 'Amarillos',     value: amarillos,           color: [234, 179, 8] },
      { label: 'Verdes',        value: verdes,              color: [34, 197, 94] },
      { label: 'Cumpl. prom.',  value: `${avgCump}%`,       color: [100, 116, 139] },
    ]

    const cardW = (W - 24) / cards.length
    cards.forEach((c, i) => {
      const x = 12 + i * (cardW + 1)
      doc.setFillColor(...c.color)
      doc.roundedRect(x, 25, cardW, 14, 2, 2, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(255, 255, 255)
      doc.text(String(c.value), x + cardW / 2, 33, { align: 'center' })
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(c.label, x + cardW / 2, 37, { align: 'center' })
    })

    // ── KPI table ─────────────────────────────────────────────────────────────
    const rows = filteredKpis.map(k => {
      const isPct = k.Unidad === '%'
      const mult = isPct ? 100 : 1
      const valSimScaled = k.valor_actual_simulado != null ? k.valor_actual_simulado * mult : null
      const metaScaled = k['Meta 2029'] != null ? k['Meta 2029'] * mult : null

      return [
        k.KPI ?? '—',
        k.principio_iso ?? '—',
        k.rol_responsable ?? '—',
        valSimScaled != null ? `${Number(valSimScaled.toFixed(isPct ? 1 : 2))} ${k.Unidad ?? ''}` : '—',
        metaScaled != null ? `${Number(metaScaled.toFixed(isPct ? 1 : 2))} ${k.Unidad ?? ''}` : '—',
        `${k.cumplimiento_pct ?? 0}%`,
        semLabel(k.semaforo),
      ]
    })

    autoTable(doc, {
      startY: 43,
      head: [['KPI', 'Principio ISO', 'Responsable', 'Valor Actual', 'Meta 2029', 'Cumpl.', 'Estado']],
      body: rows,
      styles:      { fontSize: 7.5, cellPadding: 2, textColor: [241, 245, 249] },
      headStyles:  { fillColor: [17, 30, 53], textColor: [148, 163, 184], fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: [15, 25, 45] },
      bodyStyles:  { fillColor: [11, 24, 41] },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 28 },
        2: { cellWidth: 42 },
        3: { cellWidth: 24, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 16, halign: 'center' },
        6: { cellWidth: 18, halign: 'center' },
      },
      didDrawCell(hookData) {
        if (hookData.section === 'body' && hookData.column.index === 6) {
          const kpi = filteredKpis[hookData.row.index]
          if (!kpi) return
          const [r, g, b] = semRgb(kpi.semaforo)
          doc.setFillColor(r, g, b)
          const cx = hookData.cell.x + hookData.cell.width / 2
          const cy = hookData.cell.y + hookData.cell.height / 2
          doc.circle(cx - 14, cy, 2, 'F')
        }
      },
    })

    // ── Budget section ────────────────────────────────────────────────────────
    const redKpis = filteredKpis.filter(k => k.semaforo === 'rojo')
    if (redKpis.length > 0 && data?.iniciativas?.length > 0) {
      const initiativeMap = Object.fromEntries(data.iniciativas.map(i => [i.ID, i]))
      const seen = new Set()
      let totalBudget = 0
      const budgetRows = []

      redKpis.forEach(k => {
        const ids = (k.Iniciativas ?? '').split(',').map(s => s.trim()).filter(Boolean)
        ids.forEach(id => {
          if (seen.has(id)) return
          seen.add(id)
          const ini = initiativeMap[id]
          if (!ini) return
          const amt = parseBudget(ini['Presupuesto (COP)'])
          totalBudget += amt
          budgetRows.push([id, ini['Nombre Iniciativa'] ?? '—', ini['Período'] ?? '—', formatCOP(amt)])
        })
      })

      const finalY = (doc.lastAutoTable?.finalY ?? 43) + 8
      if (finalY < pageH - 30) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(239, 68, 68)
        doc.text('Inversión Requerida — KPIs en Rojo', 12, finalY)

        autoTable(doc, {
          startY: finalY + 4,
          head: [['ID', 'Iniciativa', 'Período', 'Presupuesto (COP)']],
          body: budgetRows,
          foot: [['', '', 'TOTAL', formatCOP(totalBudget)]],
          styles:      { fontSize: 7.5, textColor: [241, 245, 249] },
          headStyles:  { fillColor: [90, 20, 20], textColor: [252, 165, 165], fontStyle: 'bold', fontSize: 7 },
          footStyles:  { fillColor: [40, 10, 10], textColor: [252, 165, 165], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [20, 18, 30] },
          bodyStyles:  { fillColor: [15, 14, 26] },
          columnStyles: {
            0: { cellWidth: 18 },
            1: { cellWidth: 100 },
            2: { cellWidth: 45 },
            3: { cellWidth: 40, halign: 'right' },
          },
        })
      }
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const pages = doc.getNumberOfPages()
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p)
      doc.setFontSize(7)
      doc.setTextColor(71, 85, 105)
      doc.text(`Página ${p} de ${pages} · Confidencial`, W / 2, pageH - 4, { align: 'center' })
    }

    doc.save(`Informe_ISO38500_${activePrinciple ?? 'Global'}_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <button
      onClick={generatePDF}
      title="Descargar informe ejecutivo PDF"
      className="flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-2 transition-colors"
      style={{ background: '#1e4d8c', color: '#bfdbfe' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
      onMouseLeave={e => (e.currentTarget.style.background = '#1e4d8c')}
    >
      <FileDown size={14} />
      Exportar PDF
    </button>
  )
}
