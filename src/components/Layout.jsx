import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import TracoEcg from './TracoEcg'
import estilos from './Layout.module.css'

const LINKS = [
  { para: '/', rotulo: 'Painel', fim: true },
  { para: '/pacientes', rotulo: 'Pacientes' },
  { para: '/agendamento', rotulo: 'Agendamento' },
]

// Estrutura das paginas autenticadas: navegacao lateral no desktop, barra
// superior no celular, conteudo e rodape com o aviso academico.
export default function Layout() {
  const { usuario, sair } = useAuth()
  const navegar = useNavigate()

  function aoSair() {
    sair()
    navegar('/login', { replace: true })
  }

  return (
    <div className={estilos.aplicacao}>
      <header className={estilos.rail}>
        <div className={estilos.marca}>
          <TracoEcg altura={28} animado={false} cor="#9fd3c7" rotulo="" />
          <span className={estilos.nomeMarca}>CardioIA</span>
        </div>
        <nav className={estilos.navegacao} aria-label="Seções do portal">
          {LINKS.map((link) => (
            <NavLink
              key={link.para}
              to={link.para}
              end={link.fim}
              className={({ isActive }) => `${estilos.link} ${isActive ? estilos.linkAtivo : ''}`}
            >
              {link.rotulo}
            </NavLink>
          ))}
        </nav>
        <div className={estilos.sessao}>
          <div className={estilos.usuario}>
            <span className={estilos.nomeUsuario}>{usuario?.nome}</span>
            <span className={estilos.perfilUsuario}>{usuario?.perfil}</span>
          </div>
          <button type="button" className={estilos.botaoSair} onClick={aoSair}>
            Sair
          </button>
        </div>
      </header>

      <main className={estilos.conteudo}>
        <Outlet />
        <footer className={estilos.rodape}>
          Projeto acadêmico da FIAP (CardioIA, Fase 2, Ir Além 1) com dados simulados. Não é um sistema real de
          saúde e não substitui a avaliação de um profissional.
        </footer>
      </main>
    </div>
  )
}
