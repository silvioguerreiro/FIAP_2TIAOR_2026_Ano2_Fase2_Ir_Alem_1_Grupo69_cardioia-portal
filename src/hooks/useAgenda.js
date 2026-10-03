import { useContext } from 'react'
import AgendaContext from '../contexts/AgendaContext'

// Hook de acesso ao contexto da agenda de consultas.
export default function useAgenda() {
  const contexto = useContext(AgendaContext)
  if (!contexto) {
    throw new Error('useAgenda deve ser usado dentro de <AgendaProvider>.')
  }
  return contexto
}
