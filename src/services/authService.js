// Servico de autenticacao simulada.
// Nao ha back-end: as credenciais vem de um JSON local e o "JWT" e um token
// falso com a mesma estrutura de um JWT real (cabecalho.payload.assinatura em
// base64url), guardado no localStorage. Serve apenas para demonstrar o fluxo
// de login, sessao e protecao de rotas em uma aplicacao React.

import usuarios from '../data/usuarios.json'

export const CHAVE_TOKEN = 'cardioia.token'
const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000 // 8 horas
const LATENCIA_SIMULADA_MS = 600

// Codifica um objeto em base64url (como no JWT), preservando acentos.
function base64url(objeto) {
  const texto = JSON.stringify(objeto)
  const bytes = new TextEncoder().encode(texto)
  let binario = ''
  bytes.forEach((b) => {
    binario += String.fromCharCode(b)
  })
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodificarBase64url(trecho) {
  const base64 = trecho.replace(/-/g, '+').replace(/_/g, '/')
  const preenchido = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binario = atob(preenchido)
  const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

// Gera o JWT falso: cabecalho e payload reais, assinatura apenas ilustrativa.
export function gerarTokenFalso(usuario) {
  const agora = Date.now()
  const cabecalho = { alg: 'none', typ: 'JWT' }
  const payload = {
    sub: String(usuario.id),
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    iat: Math.floor(agora / 1000),
    exp: Math.floor((agora + DURACAO_SESSAO_MS) / 1000),
  }
  return `${base64url(cabecalho)}.${base64url(payload)}.assinatura-simulada`
}

// Le o payload do token e devolve o usuario, ou null se invalido ou expirado.
export function decodificarToken(token) {
  try {
    const partes = token.split('.')
    if (partes.length !== 3) return null
    const payload = decodificarBase64url(partes[1])
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null
    return { id: Number(payload.sub), nome: payload.nome, email: payload.email, perfil: payload.perfil, expiraEm: payload.exp * 1000 }
  } catch {
    return null
  }
}

// Recupera a sessao salva no localStorage (usado ao carregar a aplicacao).
export function recuperarSessao() {
  const token = localStorage.getItem(CHAVE_TOKEN)
  if (!token) return null
  const usuario = decodificarToken(token)
  if (!usuario) localStorage.removeItem(CHAVE_TOKEN)
  return usuario
}

// Simula a chamada de login a uma API, com latencia e validacao de credenciais.
export function entrar(email, senha) {
  return new Promise((resolver, rejeitar) => {
    setTimeout(() => {
      const usuario = usuarios.find(
        (u) => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.senha === senha,
      )
      if (!usuario) {
        rejeitar(new Error('E-mail ou senha incorretos. Confira as credenciais de demonstração.'))
        return
      }
      const token = gerarTokenFalso(usuario)
      localStorage.setItem(CHAVE_TOKEN, token)
      resolver(decodificarToken(token))
    }, LATENCIA_SIMULADA_MS)
  })
}

export function sair() {
  localStorage.removeItem(CHAVE_TOKEN)
}

// Credenciais exibidas na tela de login para facilitar a demonstracao.
export const CREDENCIAIS_DEMONSTRACAO = usuarios.map(({ email, senha, perfil }) => ({ email, senha, perfil }))
