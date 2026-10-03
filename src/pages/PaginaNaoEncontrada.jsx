import { Link } from 'react-router-dom'
import Mensagem from '../components/Mensagem'

export default function PaginaNaoEncontrada() {
  return (
    <main style={{ padding: '3rem 1.25rem', maxWidth: '40rem', margin: '0 auto' }}>
      <Mensagem tipo="vazio" titulo="Página não encontrada" acao={<Link to="/" className="botao">Ir para o painel</Link>}>
        O endereço digitado não existe neste portal.
      </Mensagem>
    </main>
  )
}
