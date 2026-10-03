// Servico de pacientes.
// Fonte principal: API publica de exemplo JSONPlaceholder (/users), cujos
// registros sao convertidos em "pacientes": nome, sexo e cidade vem da base
// simulada local (nomes brasileiros; os do JSONPlaceholder sao ficticios em
// ingles) e os campos clinicos sao simulados, derivados de forma
// deterministica do id. Se a API nao responder (sem rede, bloqueio ou erro
// HTTP), o servico recorre a base simulada local src/data/pacientes.json e
// informa a origem usada.

import pacientesLocais from '../data/pacientes.json'

const URL_API = 'https://jsonplaceholder.typicode.com/users'
const TEMPO_LIMITE_MS = 6000

const CONDICOES = [
  'Hipertensão arterial',
  'Insuficiência cardíaca',
  'Palpitações em investigação',
  'Dislipidemia',
  'Fibrilação atrial',
  'Avaliação pré-operatória',
  'Angina estável',
  'Sopro cardíaco em investigação',
]
const RISCOS = ['baixo', 'moderado', 'alto']
const CONVENIOS = ['SUS', 'Plano Vida', 'Particular']

// Converte um usuario do JSONPlaceholder em um paciente do portal.
function usuarioParaPaciente(usuario) {
  const id = Number(usuario.id)
  const base = pacientesLocais[(id - 1) % pacientesLocais.length] // nome brasileiro para o mesmo id
  return {
    id,
    nome: base?.nome ?? usuario.name,
    idade: 28 + ((id * 7) % 50),
    sexo: base?.sexo ?? (id % 2 === 0 ? 'F' : 'M'),
    cidade: base?.cidade ?? usuario.address?.city ?? 'Não informada',
    convenio: CONVENIOS[id % CONVENIOS.length],
    condicao: CONDICOES[id % CONDICOES.length],
    risco: RISCOS[(id * 5) % RISCOS.length],
    ultimaConsulta: `2026-0${1 + (id % 9)}-${String(1 + ((id * 3) % 27)).padStart(2, '0')}`,
  }
}

// Busca a lista de pacientes. Devolve { pacientes, fonte }.
export async function listarPacientes({ signal } = {}) {
  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS)
  // Encadeia o cancelamento externo (desmontagem do componente) ao interno (tempo limite).
  signal?.addEventListener('abort', () => controlador.abort())

  try {
    const resposta = await fetch(URL_API, { signal: controlador.signal })
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
    const usuarios = await resposta.json()
    if (!Array.isArray(usuarios) || usuarios.length === 0) throw new Error('resposta vazia')
    return { pacientes: usuarios.map(usuarioParaPaciente), fonte: 'JSONPlaceholder (API pública de exemplo)' }
  } catch (erro) {
    if (signal?.aborted) throw erro // componente desmontado: nao usar fallback
    // Fallback: base simulada local, com uma pequena latencia para manter o estado de carregamento visivel.
    await new Promise((r) => setTimeout(r, 300))
    return { pacientes: pacientesLocais, fonte: 'base simulada local (src/data/pacientes.json)' }
  } finally {
    clearTimeout(temporizador)
  }
}
