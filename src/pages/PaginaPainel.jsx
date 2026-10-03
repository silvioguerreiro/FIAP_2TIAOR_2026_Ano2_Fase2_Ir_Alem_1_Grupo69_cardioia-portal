import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useAgenda from '../hooks/useAgenda'
import usePacientes from '../hooks/usePacientes'
import Indicador from '../components/Indicador'
import ListaConsultas from '../components/ListaConsultas'
import Mensagem from '../components/Mensagem'
import { hojeISO } from '../services/agendaService'
import estilos from './Pagina.module.css'

// Painel: contagens de pacientes e consultas, mais as proximas consultas.
export default function PaginaPainel() {
  const { usuario } = useAuth()
  const { pacientes, fonte, carregando, erro, recarregar } = usePacientes()
  const { agendadas } = useAgenda()

  const hoje = hojeISO()
  const consultasHoje = agendadas.filter((c) => c.data === hoje).length
  const altoRisco = pacientes.filter((p) => p.risco === 'alto').length

  return (
    <>
      <header className={estilos.cabecalho}>
        <h1>Painel</h1>
        <p className={estilos.descricao}>Visão geral da clínica para {usuario?.nome}. Os números acompanham a lista de pacientes e a agenda em tempo real.</p>
      </header>

      {erro ? (
        <Mensagem tipo="erro" titulo="Pacientes indisponíveis" acao={<button type="button" className="botao botaoSecundario" onClick={recarregar}>Tentar novamente</button>}>
          {erro}
        </Mensagem>
      ) : null}

      <section className={estilos.gradeIndicadores} aria-label="Indicadores">
        <Indicador rotulo="Pacientes cadastrados" valor={carregando ? '...' : pacientes.length} detalhe={carregando ? 'Carregando' : `Fonte: ${fonte}`} />
        <Indicador rotulo="Consultas agendadas" valor={agendadas.length} detalhe="Com status agendada" />
        <Indicador rotulo="Consultas hoje" valor={consultasHoje} detalhe={hoje.split('-').reverse().join('/')} />
        <Indicador rotulo="Pacientes de risco alto" valor={carregando ? '...' : altoRisco} detalhe="Prioridade de acompanhamento" variante={altoRisco > 0 ? 'alerta' : 'padrao'} />
      </section>

      <section className={estilos.secao} aria-labelledby="titulo-proximas">
        <div className={estilos.cabecalhoSecao}>
          <h2 id="titulo-proximas">Próximas consultas</h2>
          <Link to="/agendamento" className="botao botaoSecundario">
            Agendar consulta
          </Link>
        </div>
        <ListaConsultas
          limite={5}
          permitirCancelar={false}
          vazioAcao={
            <Link to="/agendamento" className="botao">
              Agendar a primeira consulta
            </Link>
          }
        />
      </section>
    </>
  )
}
