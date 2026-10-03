import { useContext } from 'react'
import AuthContext from '../contexts/AuthContext'

// Hook de acesso ao contexto de autenticacao, com erro claro fora do provider.
export default function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  }
  return contexto
}
