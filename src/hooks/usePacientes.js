import { useCallback, useEffect, useState } from 'react'
import { listarPacientes } from '../services/pacientesService'

// Hook que carrega a lista de pacientes com estados de carregamento, erro e
// origem dos dados. O useEffect cancela a requisicao se o componente for
// desmontado antes da resposta (AbortController).
export default function usePacientes() {
  const [pacientes, setPacientes] = useState([])
  const [fonte, setFonte] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])

  useEffect(() => {
    const controlador = new AbortController()
    setCarregando(true)
    setErro(null)

    listarPacientes({ signal: controlador.signal })
      .then(({ pacientes: lista, fonte: origem }) => {
        setPacientes(lista)
        setFonte(origem)
      })
      .catch((e) => {
        if (!controlador.signal.aborted) setErro('Não foi possível carregar os pacientes. Tente novamente.')
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCarregando(false)
      })

    return () => controlador.abort()
  }, [versao])

  return { pacientes, fonte, carregando, erro, recarregar }
}
