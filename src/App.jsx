import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RotaProtegida from './components/RotaProtegida'
import PaginaLogin from './pages/PaginaLogin'
import PaginaPainel from './pages/PaginaPainel'
import PaginaPacientes from './pages/PaginaPacientes'
import PaginaAgendamento from './pages/PaginaAgendamento'
import PaginaNaoEncontrada from './pages/PaginaNaoEncontrada'

// Rotas: /login e publica; tudo o que esta sob RotaProtegida exige sessao.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PaginaLogin />} />
      <Route element={<RotaProtegida />}>
        <Route element={<Layout />}>
          <Route index element={<PaginaPainel />} />
          <Route path="pacientes" element={<PaginaPacientes />} />
          <Route path="agendamento" element={<PaginaAgendamento />} />
        </Route>
      </Route>
      <Route path="*" element={<PaginaNaoEncontrada />} />
    </Routes>
  )
}
