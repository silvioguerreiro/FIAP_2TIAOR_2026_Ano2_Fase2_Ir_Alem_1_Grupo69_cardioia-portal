import estilos from './Mensagem.module.css'

// Mensagem de estado: carregando, erro, sucesso ou vazio.
// Erros dizem o que aconteceu e o que fazer; estados vazios convidam a agir.
export default function Mensagem({ tipo = 'info', titulo, children, acao }) {
  const papel = tipo === 'erro' ? 'alert' : 'status'
  return (
    <div className={`${estilos.mensagem} ${estilos[tipo] ?? ''}`} role={papel}>
      {titulo ? <p className={estilos.titulo}>{titulo}</p> : null}
      {children ? <div className={estilos.corpo}>{children}</div> : null}
      {acao ? <div className={estilos.acao}>{acao}</div> : null}
    </div>
  )
}
