// Persistencia simulada das consultas agendadas (localStorage).
// Em uma aplicacao real, estas funcoes chamariam a API do back-end.

export const CHAVE_AGENDA = 'cardioia.consultas'

export const TIPOS_CONSULTA = [
  'Consulta de rotina',
  'Retorno',
  'Avaliação de exames',
  'Teste ergométrico',
  'Ecocardiograma',
  'Holter 24 horas',
]

export function carregarConsultas() {
  try {
    const bruto = localStorage.getItem(CHAVE_AGENDA)
    const lista = bruto ? JSON.parse(bruto) : []
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

export function salvarConsultas(consultas) {
  localStorage.setItem(CHAVE_AGENDA, JSON.stringify(consultas))
}

// Identificador simples e unico o bastante para a demonstracao.
export function gerarId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

// Data de hoje no formato YYYY-MM-DD, no fuso local.
export function hojeISO() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function formatarData(iso) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}
