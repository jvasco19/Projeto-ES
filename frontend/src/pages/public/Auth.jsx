import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Anchor, Button, Card, Center, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { Icon } from '../../components/Icon.jsx'
import { Logo } from '../../components/ui.jsx'
import { customerProducts, products } from '../../data/mockData.js'
import { fakeRequest } from '../../data/useData.js'
import { login } from '../../lib/auth.js'

const emailPattern = /^\S+@\S+\.\S+$/

function AuthFrame({ title, description, children, footer }) {
  return (
    <Center mih="100vh" p="md" className="hero">
      <Stack w="100%" maw={420} gap="lg" pos="relative" className="page">
        <Anchor component={Link} to="/" underline="never" c="inherit" w="fit-content" aria-label="Página inicial">
          <Logo />
        </Anchor>
        <Card padding="xl" shadow="sm">
          <Title order={1} size="h3">{title}</Title>
          {description && <Text size="sm" c="dimmed" mt={4}>{description}</Text>}
          <Stack mt="lg">{children}</Stack>
        </Card>
        {footer && <Text size="sm" ta="center" c="dimmed">{footer}</Text>}
      </Stack>
    </Center>
  )
}

// Quando o utilizador chega pelo link de um produto, mostra para onde vai o pedido.
function LinkContext({ next }) {
  const id = next?.match(/^\/me\/novo\/([^/]+)/)?.[1]
  const product = [...products, ...customerProducts].find((p) => p.id === id)
  if (!product) return null
  return (
    <Alert variant="light" icon={<Icon name="link" />} title={`Pedido para ${product.name}`}>
      Inicia sessão ou cria conta para enviares o teu pedido e acompanhares o estado.
    </Alert>
  )
}

function useAuthSubmit() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    await fakeRequest(700)
    login()
    navigate(next && next.startsWith('/') ? next : '/me', { replace: true })
  }

  return { next, loading, submit }
}

export function Login() {
  const { next, loading, submit } = useAuthSubmit()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  function onSubmit(e) {
    e.preventDefault()
    const err = {}
    if (!emailPattern.test(form.email)) err.email = 'Introduz um email válido'
    if (!form.password) err.password = 'Introduz a palavra-passe'
    setErrors(err)
    if (!Object.keys(err).length) submit()
  }

  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : ''

  return (
    <AuthFrame
      title="Entrar no Workstream"
      description="Acede aos teus pedidos e aos produtos da tua equipa."
      footer={<>Ainda não tens conta? <Anchor component={Link} to={`/register${nextQuery}`}>Criar conta</Anchor></>}
    >
      <LinkContext next={next} />
      <form onSubmit={onSubmit} noValidate>
        <Stack>
          <TextInput label="Email" type="email" autoComplete="email" placeholder="nome@empresa.pt"
            value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.currentTarget.value })} />
          <PasswordInput label="Palavra-passe" autoComplete="current-password"
            value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.currentTarget.value })} />
          <Anchor component={Link} to="/forgot-password" size="sm" w="fit-content">Esqueceste-te da palavra-passe?</Anchor>
          <Button type="submit" loading={loading} fullWidth mt="xs">Entrar</Button>
        </Stack>
      </form>
    </AuthFrame>
  )
}

export function Register() {
  const { next, loading, submit } = useAuthSubmit()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})

  function onSubmit(e) {
    e.preventDefault()
    const err = {}
    if (!form.name.trim()) err.name = 'Introduz o teu nome'
    if (!emailPattern.test(form.email)) err.email = 'Introduz um email válido'
    if (form.password.length < 8) err.password = 'A palavra-passe precisa de pelo menos 8 caracteres'
    setErrors(err)
    if (!Object.keys(err).length) submit()
  }

  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : ''

  return (
    <AuthFrame
      title="Criar conta"
      description="Gere os teus produtos ou acompanha os pedidos que fizeste."
      footer={<>Já tens conta? <Anchor component={Link} to={`/login${nextQuery}`}>Entrar</Anchor></>}
    >
      <LinkContext next={next} />
      <form onSubmit={onSubmit} noValidate>
        <Stack>
          <TextInput label="Nome" autoComplete="name" value={form.name} error={errors.name}
            onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} />
          <TextInput label="Email" type="email" autoComplete="email" placeholder="nome@empresa.pt"
            value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.currentTarget.value })} />
          <PasswordInput label="Palavra-passe" autoComplete="new-password" description="Mínimo de 8 caracteres"
            value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.currentTarget.value })} />
          <Button type="submit" loading={loading} fullWidth mt="xs">Criar conta</Button>
        </Stack>
      </form>
    </AuthFrame>
  )
}

export function Recover() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    if (!emailPattern.test(email)) return setError('Introduz um email válido')
    setError(null)
    setLoading(true)
    await fakeRequest()
    setLoading(false)
    setSent(true)
  }

  return (
    <AuthFrame
      title="Recuperar palavra-passe"
      description="Enviamos-te um link para definires uma nova palavra-passe."
      footer={<Anchor component={Link} to="/login">Voltar a entrar</Anchor>}
    >
      {sent ? (
        <Alert color="teal" icon={<Icon name="mark_email_read" />} title="Verifica o teu email">
          Se existir uma conta associada a {email}, vais receber um link nos próximos minutos.
        </Alert>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <Stack>
            <TextInput label="Email" type="email" autoComplete="email" value={email} error={error}
              onChange={(e) => setEmail(e.currentTarget.value)} />
            <Button type="submit" loading={loading} fullWidth>Enviar link</Button>
          </Stack>
        </form>
      )}
    </AuthFrame>
  )
}
