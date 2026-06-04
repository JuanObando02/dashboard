import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export function buildDashboardContext(allKpis, globalCounts, madurezData) {
  const criticos = allKpis.filter(k => k.semaforo === 'rojo')
  const moderados = allKpis.filter(k => k.semaforo === 'amarillo')
  const normales = allKpis.filter(k => k.semaforo === 'verde')

  const kpiSummary = allKpis.slice(0, 30).map(k =>
    `- ${k.KPI} | Perspectiva: ${k.Perspectiva} | Estado: ${k.semaforo.toUpperCase()} | Cumplimiento: ${k.cumplimiento_pct}% | Responsable: ${k.rol_responsable ?? 'N/A'} | Principio ISO: ${k.principio_iso ?? 'N/A'}`
  ).join('\n')

  const madurezSummary = madurezData.map(m =>
    `- ${m.principio ?? m.kpi}: ${m.valor_actual ?? m['Valor Actual'] ?? 'N/D'}/5`
  ).join('\n')

  return `Eres un consultor experto en Gobierno de TI con especialización en ISO 38500 y Balanced Scorecard para instituciones de salud colombianas.

CONTEXTO DEL DASHBOARD - Hospital Departamental Psiquiátrico Universitario del Valle:
Fecha de análisis: ${new Date().toLocaleDateString('es-CO')}
Modelo de Gobierno: ISO 38500 & Balanced Scorecard

RESUMEN EJECUTIVO:
- Total KPIs monitoreados: ${globalCounts.total_kpis ?? allKpis.length}
- KPIs críticos (rojo): ${globalCounts.criticos ?? criticos.length}
- KPIs en alerta (amarillo): ${globalCounts.moderados ?? moderados.length}
- KPIs en cumplimiento (verde): ${globalCounts.normales ?? normales.length}

KPIs CRÍTICOS:
${criticos.slice(0, 10).map(k => `- ${k.KPI} | ${k.Perspectiva} | ${k.cumplimiento_pct}% | Responsable: ${k.rol_responsable ?? 'N/A'}`).join('\n') || 'Ninguno'}

DETALLE DE KPIs (primeros 30):
${kpiSummary}

NIVELES DE MADUREZ ISO 38500:
${madurezSummary || 'No disponible'}

`
}

export async function askGemini(prompt, context) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })
  const fullPrompt = context + '\nPREGUNTA/SOLICITUD:\n' + prompt
  const result = await model.generateContent(fullPrompt)
  return result.response.text()
}

export async function askGeminiDirect(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function askGeminiFlashLite(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}