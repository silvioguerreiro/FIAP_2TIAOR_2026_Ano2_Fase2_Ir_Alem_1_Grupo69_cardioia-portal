import { useSearchParams } from 'react-router-dom'
import usePacientes from '../hooks/usePacientes'
import useAgenda from '../hooks/useAgenda'
import FormularioAgendamento from '../components/FormularioAgendamento'
import ListaConsultas from '../components/ListaConsultas'
import Mensagem from '../components/Mensagem'
import estilos from './Pagina.module.css'

// Agendamento: formulario (useState + useReducer) e lista das consultas marcadas.
export default function PaginaAgendamento() {
  const { pacientes, carregando, erro, recarregar } = usePacientes()
  const { agendadas } = useAgenda()
  const [parametros] = useSearchParams()
  const pacienteInicial = parametros.get('paciente') ?? ''

  return (
    <>
      <header className={estilos.cabecalho}>
        <h1>Agendamento de consultas</h1>
        <p className={estilos.descricao}>Marque consultas para os pacientes cadastrados. {agendadas.length === 1 ? '1 consulta agendada.' : `${agendadas.length} consultas agendadas.`}</p>
      </header>

      {carregando ? <Mensagem tipo="carregando">Carregando pacientes para o formulário...</Mensagem> : null}
      {erro ? (
        <Mensagem tipo="erro" titulo="Pacientes indisponíveis" acao={<button type="button" className="botao botaoSecundario" onClick={recarregar}>Tentar novamente</button>}>
          {erro}
        </Mensagem>
      ) : null}
      {!carregando && !erro ? <FormularioAgendamento pacientes={pacientes} pacienteInicial={pacienteInicial} /> : null}

      <section className={estilos.secao} aria-labelledby="titulo-agendadas">
        <h2 id="titulo-agendadas">Consultas agendadas</h2>
        <ListaConsultas />
      </section>
    </>
  )
}
