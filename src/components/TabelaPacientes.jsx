import { Link } from 'react-router-dom'
import SeloRisco from './SeloRisco'
import { formatarData } from '../services/agendaService'
import estilos from './TabelaPacientes.module.css'

// Lista de pacientes: tabela no desktop e cartoes empilhados no celular,
// com o mesmo markup (a troca e feita apenas por CSS).
export default function TabelaPacientes({ pacientes }) {
  return (
    <div className={estilos.envoltorio}>
      <table className={estilos.tabela}>
        <thead>
          <tr>
            <th scope="col">Paciente</th>
            <th scope="col">Idade</th>
            <th scope="col">Condição acompanhada</th>
            <th scope="col">Convênio</th>
            <th scope="col">Última consulta</th>
            <th scope="col">Risco</th>
            <th scope="col">
              <span className="visualmenteOculto">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((p) => (
            <tr key={p.id}>
              <td data-rotulo="Paciente">
                <span className={estilos.nome}>{p.nome}</span>
                <span className={estilos.cidade}>{p.cidade}</span>
              </td>
              <td data-rotulo="Idade">
                {p.idade} anos, {p.sexo === 'F' ? 'feminino' : 'masculino'}
              </td>
              <td data-rotulo="Condição">{p.condicao}</td>
              <td data-rotulo="Convênio">{p.convenio}</td>
              <td data-rotulo="Última consulta">{formatarData(p.ultimaConsulta)}</td>
              <td data-rotulo="Risco">
                <SeloRisco nivel={p.risco} />
              </td>
              <td data-rotulo="">
                <Link className={`botao botaoSecundario ${estilos.botaoLinha}`} to={`/agendamento?paciente=${p.id}`}>
                  Agendar consulta
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
