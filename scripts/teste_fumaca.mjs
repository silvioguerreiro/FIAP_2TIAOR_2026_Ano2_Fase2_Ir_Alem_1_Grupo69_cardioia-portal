// Teste de fumaca de ponta a ponta com Playwright.
// Sobe o build de producao (vite preview), percorre o fluxo completo do portal
// e grava capturas de tela em document/capturas/. Executar: npm run build && npm run test:e2e
//
// Variavel opcional CHROMIUM_PATH: caminho de um Chromium ja instalado
// (quando o download automatico do Playwright nao esta disponivel).

import { spawn } from 'node:child_process'
import { mkdir, readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const PORTA = 4173
const BASE = `http://localhost:${PORTA}`
const PASTA_CAPTURAS = 'document/capturas'
// Credencial do primeiro usuario de demonstracao (a mesma fonte usada pela tela de login)
const USUARIOS = JSON.parse(await readFile(new URL('../src/data/usuarios.json', import.meta.url), 'utf-8'))
const CREDENCIAL = { email: USUARIOS[0].email, senha: USUARIOS[0].senha }

function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function aguardarServidor(url, tentativas = 40) {
  for (let i = 0; i < tentativas; i += 1) {
    try {
      const resposta = await fetch(url)
      if (resposta.ok) return
    } catch {
      // servidor ainda subindo
    }
    await esperar(250)
  }
  throw new Error(`Servidor de preview nao respondeu em ${url}`)
}

function verificar(condicao, mensagem) {
  if (!condicao) throw new Error(`Falha: ${mensagem}`)
  console.log(`ok   ${mensagem}`)
}

function amanhaISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

const servidor = spawn('npx', ['vite', 'preview', '--port', String(PORTA), '--strictPort'], { stdio: 'ignore' })
let navegador

try {
  await aguardarServidor(BASE)
  await mkdir(PASTA_CAPTURAS, { recursive: true })

  navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR' })
  const pagina = await contexto.newPage()

  // 1. Rota protegida sem sessao redireciona para o login
  await pagina.goto(`${BASE}/pacientes`)
  await pagina.waitForURL(/\/login$/)
  verificar(pagina.url().endsWith('/login'), 'rota protegida sem sessao redireciona para /login')
  await esperar(2000) // aguarda o tracado de ECG terminar de ser desenhado
  await pagina.screenshot({ path: `${PASTA_CAPTURAS}/01_login_desktop.png`, fullPage: false })

  // 2. Credenciais incorretas mostram erro
  await pagina.fill('#email', 'alguem@cardioia.local')
  await pagina.fill('#senha', 'errada')
  await pagina.click('button[type="submit"]')
  await pagina.getByRole('alert').waitFor()
  verificar(await pagina.getByRole('alert').isVisible(), 'credenciais incorretas exibem mensagem de erro')

  // 3. Login valido leva ao painel e volta para a rota pretendida
  await pagina.fill('#email', CREDENCIAL.email)
  await pagina.fill('#senha', CREDENCIAL.senha)
  await pagina.click('button[type="submit"]')
  await pagina.waitForURL(/\/pacientes$/)
  verificar(pagina.url().endsWith('/pacientes'), 'apos o login, volta para a rota pretendida (/pacientes)')

  const token = await pagina.evaluate(() => localStorage.getItem('cardioia.token'))
  verificar(typeof token === 'string' && token.split('.').length === 3, 'JWT falso com tres partes gravado no localStorage')

  // 4. Lista de pacientes carregada (API ou base local)
  await pagina.locator('table tbody tr').first().waitFor()
  const linhas = await pagina.locator('table tbody tr').count()
  const descricao = await pagina.locator('header p').first().innerText()
  verificar(linhas === 10, `lista de pacientes com 10 registros (${descricao})`)
  await pagina.screenshot({ path: `${PASTA_CAPTURAS}/03_pacientes_desktop.png`, fullPage: true })

  // 5. Busca filtra a lista
  await pagina.fill('#busca', 'hipertens')
  await esperar(100)
  const filtradas = await pagina.locator('table tbody tr').count()
  verificar(filtradas > 0 && filtradas < 10, `busca por texto filtra a lista (${filtradas} de 10)`)
  await pagina.fill('#busca', '')

  // 6. Agendar a partir da lista pre-preenche o paciente
  await pagina.locator('table tbody tr').first().getByRole('link', { name: 'Agendar consulta' }).click()
  await pagina.waitForURL(/\/agendamento\?paciente=\d+$/)
  await pagina.locator('#pacienteId').waitFor()
  const pacienteSelecionado = await pagina.locator('#pacienteId').inputValue()
  verificar(pacienteSelecionado !== '', 'formulario pre-preenchido com o paciente escolhido')

  // 7. Validacao impede envio sem data e hora
  await pagina.click('button[type="submit"]')
  verificar((await pagina.locator('text=Informe a data.').count()) === 1, 'validacao bloqueia agendamento sem data')

  // 8. Agendamento valido entra na lista
  await pagina.fill('#data', amanhaISO())
  await pagina.fill('#hora', '09:00')
  await pagina.selectOption('#tipo', 'Retorno')
  await pagina.fill('#observacoes', 'Trazer exames recentes')
  await pagina.click('button[type="submit"]')
  await pagina.getByText('Consulta agendada').first().waitFor()
  verificar((await pagina.locator('ul li').count()) >= 1, 'consulta agendada aparece na lista')
  await pagina.screenshot({ path: `${PASTA_CAPTURAS}/04_agendamento_desktop.png`, fullPage: true })

  // 9. Conflito de horario e recusado
  await pagina.selectOption('#pacienteId', { index: 2 })
  await pagina.fill('#data', amanhaISO())
  await pagina.fill('#hora', '09:00')
  await pagina.click('button[type="submit"]')
  verificar((await pagina.locator('text=Horário já ocupado').count()) === 1, 'conflito de horario e recusado')

  // 10. Painel reflete a contagem
  await pagina.goto(`${BASE}/`)
  await pagina.getByRole('heading', { name: 'Painel' }).waitFor()
  const indicadores = await pagina.locator('article').allInnerTexts()
  const consultas = indicadores.find((t) => t.includes('Consultas agendadas'))
  verificar(consultas && consultas.startsWith('1'), 'painel mostra 1 consulta agendada')
  await pagina.locator('article').first().waitFor()
  await pagina.waitForFunction(() => !document.body.innerText.includes('Carregando'))
  await pagina.screenshot({ path: `${PASTA_CAPTURAS}/02_painel_desktop.png`, fullPage: false })

  // 11. Recarregar mantem a sessao e os dados
  await pagina.reload()
  await pagina.getByRole('heading', { name: 'Painel' }).waitFor()
  verificar(pagina.url() === `${BASE}/`, 'sessao sobrevive ao recarregamento da pagina')

  // 12. Capturas no celular
  const movel = await navegador.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR', storageState: await contexto.storageState() })
  const paginaMovel = await movel.newPage()
  await paginaMovel.goto(`${BASE}/`)
  await paginaMovel.getByRole('heading', { name: 'Painel' }).waitFor()
  await paginaMovel.waitForFunction(() => !document.body.innerText.includes('Carregando'))
  await paginaMovel.screenshot({ path: `${PASTA_CAPTURAS}/05_painel_celular.png`, fullPage: true })
  await paginaMovel.goto(`${BASE}/pacientes`)
  await paginaMovel.locator('table tbody tr').first().waitFor()
  await paginaMovel.screenshot({ path: `${PASTA_CAPTURAS}/06_pacientes_celular.png`, fullPage: true })
  const semScrollHorizontal = await paginaMovel.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  verificar(semScrollHorizontal, 'layout no celular sem rolagem horizontal')
  await movel.close()

  // 13. Sair encerra a sessao e volta a proteger as rotas
  await pagina.getByRole('button', { name: 'Sair' }).click()
  await pagina.waitForURL(/\/login$/)
  const tokenDepois = await pagina.evaluate(() => localStorage.getItem('cardioia.token'))
  verificar(tokenDepois === null, 'sair remove o token do localStorage')
  await pagina.goto(`${BASE}/agendamento`)
  await pagina.waitForURL(/\/login$/)
  verificar(pagina.url().endsWith('/login'), 'apos sair, rotas protegidas voltam a exigir login')

  console.log('\nTeste de fumaca concluido com sucesso.')
} catch (erro) {
  console.error(`\n${erro.message}`)
  process.exitCode = 1
} finally {
  await navegador?.close()
  servidor.kill()
}
