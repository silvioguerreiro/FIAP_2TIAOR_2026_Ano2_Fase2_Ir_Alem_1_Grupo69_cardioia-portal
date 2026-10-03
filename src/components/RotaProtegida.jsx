import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

// Protege um grupo de rotas: sem sessao, redireciona para o login e guarda a
// rota pretendida para voltar a ela depois de autenticar.
export default function RotaProtegida() {
  const { autenticado } = useAuth()
  const localizacao = useLocation()

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ de: localizacao.pathname }} />
  }
  return <Outlet />
}
