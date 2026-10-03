import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { AgendaProvider } from './contexts/AgendaContext'
import './styles/global.css'

// Ordem dos provedores: autenticacao por fora (a agenda so existe para quem
// esta logado), agenda por dentro, roteador envolvendo a aplicacao.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AgendaProvider>
          <App />
        </AgendaProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
