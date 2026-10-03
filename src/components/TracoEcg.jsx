import estilos from './TracoEcg.module.css'

// Traçado de ECG estilizado: a marca visual do portal.
// Desenhado uma unica vez ao aparecer (animacao de stroke-dashoffset);
// respeita prefers-reduced-motion via CSS global.
export default function TracoEcg({ altura = 72, cor = 'currentColor', animado = true, rotulo = 'Traçado de eletrocardiograma estilizado' }) {
  return (
    <svg
      className={`${estilos.traco} ${animado ? estilos.animado : ''}`}
      viewBox="0 0 320 72"
      height={altura}
      width="100%"
      preserveAspectRatio="none"
      role="img"
      aria-label={rotulo}
    >
      <path
        d="M0 40 H60 l8 -10 l8 10 H110 l6 -28 l10 52 l8 -34 l6 10 H200 l8 -8 l8 8 H320"
        fill="none"
        stroke={cor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="100"
      />
    </svg>
  )
}
