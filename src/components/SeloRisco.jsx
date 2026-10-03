import estilos from './SeloRisco.module.css'

const ROTULOS = { alto: 'Risco alto', moderado: 'Risco moderado', baixo: 'Risco baixo' }

// Selo de nivel de risco do paciente. A cor nao e o unico sinal: o texto
// sempre nomeia o nivel.
export default function SeloRisco({ nivel }) {
  const classe = estilos[nivel] ?? estilos.baixo
  return <span className={`${estilos.selo} ${classe}`}>{ROTULOS[nivel] ?? 'Risco não informado'}</span>
}
