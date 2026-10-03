import { useMemo, useState } from 'react'
import usePacientes from '../hooks/usePacientes'
import TabelaPacientes from '../components/TabelaPacientes'
import Mensagem from '../components/Mensagem'
import estilos from './Pagina.module.css'

// Lista de pacientes com busca por nome, condicao ou cidade e filtro de risco.
export default function PaginaPacientes() {
  const { pacientes, fonte, carregando, erro, recarregar } = usePacientes()
  const [busca, setBusca] = useState('')
  const [risco, setRisco] = useState('todos')

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return pacientes.filter((p) => {
      const combinaRisco = risco === 'todos' || p.risco === risco
      const combinaTermo = !termo || [p.nome, p.condicao, p.cidade].some((v) => String(v).toLowerCase().includes(termo))
      return combinaRisco && combinaTermo
    })
  }, [pacientes, busca, risco])

  return (
    <>
      <header className={estilos.cabecalho}>
        <h1>Pacientes</h1>
        <p className={estilos.descricao}>
          {carregando ? 'Carregando a lista de pacientes...' : `${pacientes.length} pacientes. Fonte: ${fonte}.`}
        </p>
      </header>

      <div className={estilos.filtros}>
        <div className="campo">
          <label htmlFor="busca">Buscar</label>
          <input id="busca" type="search" placeholder="Nome, condição ou cidade" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="risco">Risco</label>
          <select id="risco" value={risco} onChange={(e) => setRisco(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="alto">Alto</option>
            <option value="moderado">Moderado</option>
            <option value="baixo">Baixo</option>
          </select>
        </div>
      </div>

      {carregando ? <Mensagem tipo="carregando">Buscando pacientes na API de exemplo...</Mensagem> : null}

      {erro ? (
        <Mensagem tipo="erro" titulo="Não foi possível carregar os pacientes" acao={<button type="button" className="botao botaoSecundario" onClick={recarregar}>Tentar novamente</button>}>
          {erro}
        </Mensagem>
      ) : null}

      {!carregando && !erro && filtrados.length === 0 ? (
        <Mensagem tipo="vazio" titulo="Nenhum paciente corresponde à busca">
          Ajuste o termo ou o filtro de risco.
        </Mensagem>
      ) : null}

      {!carregando && !erro && filtrados.length > 0 ? <TabelaPacientes pacientes={filtrados} /> : null}
    </>
  )
}
