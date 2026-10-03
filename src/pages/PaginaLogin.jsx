import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import TracoEcg from '../components/TracoEcg'
import Mensagem from '../components/Mensagem'
import { CREDENCIAIS_DEMONSTRACAO } from '../services/authService'
import estilos from './PaginaLogin.module.css'

export default function PaginaLogin() {
  const { autenticado, entrar, carregando, erro } = useAuth()
  const navegar = useNavigate()
  const localizacao = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const destino = localizacao.state?.de ?? '/'

  // Quem ja esta autenticado nao precisa ver o login.
  if (autenticado) return <Navigate to={destino} replace />

  async function aoEnviar(evento) {
    evento.preventDefault()
    try {
      await entrar(email, senha)
      navegar(destino, { replace: true })
    } catch {
      // O erro ja fica disponivel no contexto; nada a fazer aqui.
    }
  }

  function preencher(credencial) {
    setEmail(credencial.email)
    setSenha(credencial.senha)
  }

  return (
    <main className={estilos.pagina}>
      <section className={estilos.apresentacao} aria-labelledby="titulo-login">
        <div className={estilos.marca}>
          <TracoEcg altura={120} cor="#9fd3c7" />
          <h1 id="titulo-login" className={estilos.titulo}>
            CardioIA
          </h1>
          <p className={estilos.subtitulo}>Portal de apoio à rotina de uma clínica de cardiologia: pacientes, agenda e indicadores em um só lugar.</p>
        </div>
        <p className={estilos.aviso}>
          Projeto acadêmico (FIAP, Fase 2, Ir Além 1). Autenticação simulada, dados fictícios, sem integração com sistemas reais.
        </p>
      </section>

      <section className={estilos.painel}>
        <form className={estilos.formulario} onSubmit={aoEnviar}>
          <h2 className={estilos.tituloFormulario}>Entrar no portal</h2>

          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input id="senha" name="senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>

          {erro ? <Mensagem tipo="erro">{erro}</Mensagem> : null}

          <button type="submit" className="botao" disabled={carregando}>
            {carregando ? 'Verificando...' : 'Entrar'}
          </button>

          <div className={estilos.demonstracao}>
            <p className={estilos.demonstracaoTitulo}>Credenciais de demonstração</p>
            <ul className={estilos.listaCredenciais}>
              {CREDENCIAIS_DEMONSTRACAO.map((c) => (
                <li key={c.email}>
                  <button type="button" className={estilos.botaoCredencial} onClick={() => preencher(c)}>
                    <span className={estilos.perfil}>{c.perfil}</span>
                    <span className={estilos.credencial}>
                      {c.email} / {c.senha}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="ajuda">Clique em um perfil para preencher o formulário.</p>
          </div>
        </form>
      </section>
    </main>
  )
}
