import estilos from './Indicador.module.css'

// Indicador numerico do painel: valor grande, rotulo e, opcionalmente, um
// detalhe. A variante "alerta" usa a cor coral, reservada a risco alto.
export default function Indicador({ rotulo, valor, detalhe, variante = 'padrao' }) {
  return (
    <article className={`${estilos.indicador} ${variante === 'alerta' ? estilos.alerta : ''}`}>
      <p className={estilos.valor}>{valor}</p>
      <h2 className={estilos.rotulo}>{rotulo}</h2>
      {detalhe ? <p className={estilos.detalhe}>{detalhe}</p> : null}
    </article>
  )
}
