// Contexto de autenticacao (Context API).
// Guarda o usuario da sessao, expõe entrar/sair e e consumido pelo hook useAuth.
// A sessao vive em um JWT falso no localStorage (ver services/authService.js).

import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Inicializa a partir do token salvo, para que recarregar a pagina nao derrube a sessao.
  const [usuario, setUsuario] = useState(() => authService.recuperarSessao())
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  // Mantem a sessao sincronizada entre abas: sair em uma aba desloga as outras.
  useEffect(() => {
    function aoMudarStorage(evento) {
      if (evento.key === authService.CHAVE_TOKEN) {
        setUsuario(authService.recuperarSessao())
      }
    }
    window.addEventListener('storage', aoMudarStorage)
    return () => window.removeEventListener('storage', aoMudarStorage)
  }, [])

  // Encerra a sessao automaticamente quando o token expira.
  useEffect(() => {
    if (!usuario?.expiraEm) return undefined
    const restante = usuario.expiraEm - Date.now()
    const temporizador = setTimeout(() => {
      authService.sair()
      setUsuario(null)
    }, Math.max(restante, 0))
    return () => clearTimeout(temporizador)
  }, [usuario])

  const entrar = useCallback(async (email, senha) => {
    setCarregando(true)
    setErro(null)
    try {
      const sessao = await authService.entrar(email, senha)
      setUsuario(sessao)
      return sessao
    } catch (e) {
      setErro(e.message)
      throw e
    } finally {
      setCarregando(false)
    }
  }, [])

  const sair = useCallback(() => {
    authService.sair()
    setUsuario(null)
  }, [])

  const valor = useMemo(
    () => ({ usuario, autenticado: Boolean(usuario), carregando, erro, entrar, sair }),
    [usuario, carregando, erro, entrar, sair],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export default AuthContext
