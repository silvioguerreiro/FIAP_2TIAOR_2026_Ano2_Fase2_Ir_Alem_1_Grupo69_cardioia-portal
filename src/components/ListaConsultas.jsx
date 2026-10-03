import useAgenda from '../hooks/useAgenda'
import { formatarData } from '../services/agendaService'
import Mensagem from './Mensagem'
import estilos from './ListaConsultas.module.css'

// Lista das consultas agendadas, com cancelamento. Usada na pagina de
// agendamento (completa) e no painel (proximas, sem acoes).
export default function ListaConsultas({ limite, permitirCancelar = true, vazioAcao = null }) {
  const { agendadas, cancelar } = useAgenda()
  const lista = limite ? agendadas.slice(0, limite) : agendadas

  if (lista.length === 0) {
    return (
      <Mensagem tipo="vazio" titulo="Nenhuma consulta agendada" acao={vazioAcao}>
        As consultas marcadas no formulário aparecem aqui e entram na contagem do painel.
      </Mensagem>
    )
  }

  return (
    <ul className={estilos.lista}>
      {lista.map((c) => (
        <li key={c.id} className={estilos.item}>
          <div className={estilos.quando}>
            <span className={estilos.data}>{formatarData(c.data)}</span>
            <span className={estilos.hora}>{c.hora}</span>
          </div>
          <div className={estilos.detalhes}>
            <span className={estilos.paciente}>{c.pacienteNome}</span>
            <span className={estilos.tipo}>{c.tipo}</span>
            {c.observacoes ? <span className={estilos.observacoes}>{c.observacoes}</span> : null}
          </div>
          {permitirCancelar ? (
            <button type="button" className={`botao botaoPerigo ${estilos.cancelar}`} onClick={() => cancelar(c.id)}>
              Cancelar
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
