// Contexto da agenda de consultas.
// O estado da lista de consultas e gerido por useReducer (acoes explicitas:
// agendar, cancelar, restaurar) e persistido no localStorage por useEffect.
// Compartilhado entre o formulario de agendamento e o dashboard.

import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react'
import { carregarConsultas, gerarId, salvarConsultas } from '../services/agendaService'

const AgendaContext = createContext(null)

export function agendaReducer(estado, acao) {
  switch (acao.type) {
    case 'agendar':
      return [...estado, acao.consulta]
    case 'cancelar':
      return estado.map((c) => (c.id === acao.id ? { ...c, status: 'cancelada' } : c))
    case 'restaurar':
      return acao.consultas
    default:
      return estado
  }
}

export function AgendaProvider({ children }) {
  const [consultas, dispatch] = useReducer(agendaReducer, undefined, carregarConsultas)

  // Persiste toda mudanca de estado.
  useEffect(() => {
    salvarConsultas(consultas)
  }, [consultas])

  const agendar = useCallback((dados) => {
    const consulta = {
      id: gerarId(),
      status: 'agendada',
      criadaEm: new Date().toISOString(),
      ...dados,
    }
    dispatch({ type: 'agendar', consulta })
    return consulta
  }, [])

  const cancelar = useCallback((id) => dispatch({ type: 'cancelar', id }), [])

  const valor = useMemo(() => {
    const agendadas = consultas
      .filter((c) => c.status === 'agendada')
      .sort((a, b) => `${a.data}T${a.hora}`.localeCompare(`${b.data}T${b.hora}`))
    return { consultas, agendadas, agendar, cancelar }
  }, [consultas, agendar, cancelar])

  return <AgendaContext.Provider value={valor}>{children}</AgendaContext.Provider>
}

export default AgendaContext
