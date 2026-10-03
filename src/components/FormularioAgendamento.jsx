import { useEffect, useReducer, useState } from 'react'
import useAgenda from '../hooks/useAgenda'
import { TIPOS_CONSULTA, hojeISO } from '../services/agendaService'
import Mensagem from './Mensagem'
import estilos from './FormularioAgendamento.module.css'

// Estado dos campos do formulario, gerido por useReducer: cada alteracao e uma
// acao explicita, o que facilita validar, limpar e pre-preencher o paciente.
const estadoInicial = {
  pacienteId: '',
  data: '',
  hora: '',
  tipo: TIPOS_CONSULTA[0],
  observacoes: '',
}

function formularioReducer(estado, acao) {
  switch (acao.type) {
    case 'alterar':
      return { ...estado, [acao.campo]: acao.valor }
    case 'prePreencher':
      return { ...estado, pacienteId: acao.pacienteId }
    case 'limpar':
      return { ...estadoInicial, pacienteId: acao.manterPaciente ? estado.pacienteId : '' }
    default:
      return estado
  }
}

function validar(campos) {
  const erros = {}
  if (!campos.pacienteId) erros.pacienteId = 'Escolha o paciente.'
  if (!campos.data) erros.data = 'Informe a data.'
  else if (campos.data < hojeISO()) erros.data = 'A data não pode ser anterior a hoje.'
  if (!campos.hora) erros.hora = 'Informe o horário.'
  else {
    const [h] = campos.hora.split(':').map(Number)
    if (h < 7 || h >= 19) erros.hora = 'O atendimento vai das 07:00 às 19:00.'
  }
  return erros
}

export default function FormularioAgendamento({ pacientes, pacienteInicial = '' }) {
  const { agendar, agendadas } = useAgenda()
  // useReducer para os campos; useState para o que e feedback de interface.
  const [campos, dispatch] = useReducer(formularioReducer, { ...estadoInicial, pacienteId: pacienteInicial })
  const [erros, setErros] = useState({})
  const [confirmacao, setConfirmacao] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // Se a pagina for aberta com ?paciente=ID (vindo da lista), pre-preenche o campo.
  useEffect(() => {
    if (pacienteInicial) dispatch({ type: 'prePreencher', pacienteId: pacienteInicial })
  }, [pacienteInicial])

  function aoAlterar(evento) {
    const { name, value } = evento.target
    dispatch({ type: 'alterar', campo: name, valor: value })
    if (erros[name]) setErros((atual) => ({ ...atual, [name]: undefined }))
  }

  function aoEnviar(evento) {
    evento.preventDefault()
    const encontrados = validar(campos)
    const conflito = agendadas.find((c) => c.data === campos.data && c.hora === campos.hora)
    if (conflito) encontrados.hora = `Horário já ocupado por ${conflito.pacienteNome}.`
    setErros(encontrados)
    setConfirmacao(null)
    if (Object.keys(encontrados).length > 0) return

    setEnviando(true)
    const paciente = pacientes.find((p) => String(p.id) === String(campos.pacienteId))
    const consulta = agendar({
      pacienteId: paciente.id,
      pacienteNome: paciente.nome,
      data: campos.data,
      hora: campos.hora,
      tipo: campos.tipo,
      observacoes: campos.observacoes.trim(),
    })
    setEnviando(false)
    setConfirmacao(consulta)
    dispatch({ type: 'limpar', manterPaciente: false })
  }

  return (
    <form className={estilos.formulario} onSubmit={aoEnviar} noValidate>
      <div className={estilos.grade}>
        <div className={`campo ${estilos.largo}`}>
          <label htmlFor="pacienteId">Paciente</label>
          <select id="pacienteId" name="pacienteId" value={campos.pacienteId} onChange={aoAlterar} required>
            <option value="">Selecione um paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
          {erros.pacienteId ? <span className={estilos.erro}>{erros.pacienteId}</span> : null}
        </div>

        <div className="campo">
          <label htmlFor="data">Data</label>
          <input id="data" name="data" type="date" min={hojeISO()} value={campos.data} onChange={aoAlterar} required />
          {erros.data ? <span className={estilos.erro}>{erros.data}</span> : null}
        </div>

        <div className="campo">
          <label htmlFor="hora">Horário</label>
          <input id="hora" name="hora" type="time" min="07:00" max="19:00" step="900" value={campos.hora} onChange={aoAlterar} required />
          {erros.hora ? <span className={estilos.erro}>{erros.hora}</span> : <span className="ajuda">Das 07:00 às 19:00</span>}
        </div>

        <div className="campo">
          <label htmlFor="tipo">Tipo de consulta</label>
          <select id="tipo" name="tipo" value={campos.tipo} onChange={aoAlterar}>
            {TIPOS_CONSULTA.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className={`campo ${estilos.largo}`}>
          <label htmlFor="observacoes">Observações (opcional)</label>
          <textarea id="observacoes" name="observacoes" rows={3} value={campos.observacoes} onChange={aoAlterar} placeholder="Exames a trazer, sintomas relatados, preferências de horário" />
        </div>
      </div>

      <div className={estilos.acoes}>
        <button type="submit" className="botao" disabled={enviando}>
          {enviando ? 'Agendando...' : 'Agendar consulta'}
        </button>
        <button type="button" className="botao botaoSecundario" onClick={() => dispatch({ type: 'limpar' })}>
          Limpar
        </button>
      </div>

      {confirmacao ? (
        <Mensagem tipo="sucesso" titulo="Consulta agendada">
          {confirmacao.pacienteNome}, {confirmacao.tipo.toLowerCase()}, em {confirmacao.data.split('-').reverse().join('/')} às {confirmacao.hora}.
        </Mensagem>
      ) : null}
    </form>
  )
}
