import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ActionIcon, Button, Card, FileInput, Group, Select, Stack, Stepper, Text, TextInput, Textarea, Title, Tooltip,
} from '@mantine/core'
import { Icon } from '../../components/Icon.jsx'
import { Empty, PageLoader, StatusBadge } from '../../components/ui.jsx'
import { useApi } from '../../data/useApi.js'
import { api } from '../../lib/api.js'
import { notifyError, notifyInfo, notifySuccess } from '../../lib/feedback.jsx'

const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const maxSize = 5 * 1024 * 1024

// Valores do enum request_category (API) e o texto mostrado no ecrã.
const categories = [
  { value: 'reports', label: 'Relatórios' },
  { value: 'integrations', label: 'Integrações' },
  { value: 'notifications', label: 'Notificações' },
  { value: 'usability', label: 'Usabilidade' },
  { value: 'performance', label: 'Desempenho' },
  { value: 'security', label: 'Segurança' },
]

// Passo 1: pesquisar pedidos existentes e votar (US14)
function SearchStep({ requests, onVote, onCreate }) {
  const [query, setQuery] = useState('')
  const results = requests.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <Stack>
      <TextInput
        size="md"
        placeholder="Ex.: exportar relatórios"
        leftSection={<Icon name="search" />}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        label="O que gostavas de ver no produto?"
        description="Se alguém já pediu o mesmo, vota nesse pedido em vez de criar um novo."
        data-autofocus
      />

      {results.length === 0 ? (
        <Card>
          <Empty icon="search_off" title="Não encontrámos pedidos parecidos" description="Cria um pedido novo e a equipa vai analisá-lo.">
            <Button onClick={() => onCreate(query)}>Criar novo pedido</Button>
          </Empty>
        </Card>
      ) : (
        <Card padding={0}>
          {results.map((r, i) => (
            <Group key={r.id} justify="space-between" wrap="nowrap" px="md" py="sm"
              style={{ borderTop: i ? '1px solid var(--ws-border)' : 0 }}>
              <div style={{ minWidth: 0 }}>
                <Text fw={500}>{r.title}</Text>
                <Group gap="xs" mt={4}>
                  <StatusBadge status={r.status} size="sm" />
                  <Text size="xs" c="dimmed">{r.votes ?? 0} votos</Text>
                </Group>
              </div>
              <Tooltip label={r.votedByMe ? 'Já votaste' : 'Votar neste pedido'}>
                <ActionIcon
                  size="lg"
                  variant={r.votedByMe ? 'filled' : 'default'}
                  aria-label={`Votar em ${r.title}`}
                  onClick={() => onVote(r.id)}
                >
                  <Icon name="thumb_up" size={18} filled={r.votedByMe} />
                </ActionIcon>
              </Tooltip>
            </Group>
          ))}
        </Card>
      )}

      {results.length > 0 && (
        <Group justify="space-between" mt="xs">
          <Text size="sm" c="dimmed">Nenhum corresponde ao que precisas?</Text>
          <Button variant="light" onClick={() => onCreate(query)}>Criar novo pedido</Button>
        </Group>
      )}
    </Stack>
  )
}

// Passo 2: formulário do pedido (US13)
function FormStep({ productId, initialTitle, onBack, onSubmitted }) {
  const [form, setForm] = useState({ title: initialTitle, description: '', category: null })
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function onFiles(selected) {
    const valid = []
    for (const f of selected) {
      if (!allowedTypes.includes(f.type)) notifyError(`"${f.name}" não é um formato permitido (PNG, JPG, PDF, DOCX ou TXT).`, 'Anexo não adicionado')
      else if (f.size > maxSize) notifyError(`"${f.name}" tem mais de 5 MB.`, 'Anexo não adicionado')
      else valid.push(f)
    }
    setFiles(valid)
  }

  async function submit() {
    const err = {}
    if (!form.title.trim()) err.title = 'Indica um título'
    if (!form.description.trim()) err.description = 'Descreve o que precisas'
    if (!form.category) err.category = 'Escolhe uma categoria'
    setErrors(err)
    if (Object.keys(err).length) return notifyError('Preenche os campos assinalados.', 'Faltam campos obrigatórios')

    setLoading(true)
    let created
    try {
      created = await api(`/products/${productId}/requests`, { method: 'POST', body: form })
    } catch (e) {
      // Erro de um campo (400): aparece por baixo desse campo. Outros erros: notificação.
      if (e.field) setErrors({ [e.field]: e.message })
      else notifyError(e.message)
      setLoading(false)
      return
    }

    // O backend aceita um ficheiro por envio. Se um anexo falhar, o pedido mantém-se.
    const failed = []
    for (const file of files) {
      const data = new FormData()
      data.append('file', file)
      try {
        await api(`/requests/${created.id}/attachments`, { method: 'POST', body: data })
      } catch (e) {
        failed.push(`${file.name} (${e.message})`)
      }
    }
    if (failed.length) {
      notifyError(`O pedido foi enviado, mas não foi possível anexar: ${failed.join(', ')}.`, 'Anexo não enviado')
    }

    onSubmitted(created)
  }

  return (
    <Card>
      <Stack>
        <TextInput label="Título" withAsterisk placeholder="Resume o pedido numa frase" value={form.title} error={errors.title}
          onChange={(e) => setForm({ ...form, title: e.currentTarget.value })} />
        <Textarea label="Descrição" withAsterisk autosize minRows={4}
          placeholder="Que problema queres resolver? Como fazes hoje?" value={form.description} error={errors.description}
          onChange={(e) => setForm({ ...form, description: e.currentTarget.value })} />
        <Select label="Categoria" withAsterisk data={categories} value={form.category} error={errors.category}
          onChange={(v) => setForm({ ...form, category: v })} placeholder="Escolhe uma" />
        <FileInput
          label="Anexos"
          description="Imagens ou documentos (PNG, JPG, PDF, DOCX, TXT) até 5 MB cada"
          placeholder="Escolher ficheiros"
          multiple
          clearable
          value={files}
          onChange={onFiles}
          leftSection={<Icon name="attach_file" size={18} />}
        />
        <Group justify="space-between" mt="sm">
          <Button variant="default" onClick={onBack} leftSection={<Icon name="arrow_back" size={18} />}>Voltar à pesquisa</Button>
          <Button onClick={submit} loading={loading}>Enviar pedido</Button>
        </Group>
      </Stack>
    </Card>
  )
}

export default function SubmitRequest() {
  const { productId } = useParams()
  const me = useApi('/auth/me')
  const publicRequests = useApi(`/products/${productId}/requests/public`)
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [requests, setRequests] = useState(null)
  const [submitted, setSubmitted] = useState(null)

  if (me.loading || publicRequests.loading) return <PageLoader rows={1} />

  // Só os produtos onde o utilizador é cliente. Os ids da API são texto, tal como o do URL.
  const product = me.data?.products.find((p) => p.id === productId && p.role === 'customer')
  const data = { product, requests: publicRequests.data ?? [] }
  if (!data.product || publicRequests.error) {
    return <Empty icon="link_off" title="Produto não encontrado" description="Abre novamente o link que a equipa te enviou." />
  }

  const list = requests ?? data.requests

  function vote(id) {
    const target = list.find((r) => r.id === id)
    if (target.votedByMe) return notifyInfo('O teu voto já está registado neste pedido.', 'Já votaste')
    setRequests(list.map((r) => (r.id === id ? { ...r, votes: (r.votes ?? 0) + 1, votedByMe: true } : r)))
    notifySuccess('Voto registado. Vais ser notificado quando o estado mudar.')
  }

  return (
    <Stack maw={760} mx="auto" gap="xl">
      <div>
        <Text size="sm" c="dimmed">Novo pedido</Text>
        <Title order={1} size="h2" mt={4}>Pedido para {data.product.name}</Title>
      </div>

      <Stepper active={step} size="sm" allowNextStepsSelect={false} onStepClick={setStep}>
        <Stepper.Step label="Procurar" description="Evitar duplicados">
          <SearchStep requests={list} onVote={vote} onCreate={(q) => { setTitle(q); setStep(1) }} />
        </Stepper.Step>
        <Stepper.Step label="Descrever" description="Detalhes e anexos">
          <FormStep productId={productId} initialTitle={title} onBack={() => setStep(0)} onSubmitted={(created) => { setSubmitted(created); setStep(2) }} />
        </Stepper.Step>
        <Stepper.Completed>
          <Card>
            <Stack align="center" ta="center" py="lg" gap="sm">
              <Icon name="check_circle" size={48} filled style={{ color: 'var(--mantine-color-teal-6)' }} />
              <Title order={2} size="h3">Pedido enviado</Title>
              <Text c="dimmed" maw={440}>
                A equipa do {data.product.name} vai analisar o pedido. Recebes uma notificação sempre que o estado mudar.
              </Text>
              <Card w="100%" maw={480} ta="left" mt="sm" bg="var(--ws-subtle)">
                <Group justify="space-between" wrap="nowrap">
                  <Text size="xs" c="dimmed" ff="monospace">R-{submitted?.id}</Text>
                  <StatusBadge status={submitted?.status} size="sm" />
                </Group>
                <Text fw={500} mt={4}>{submitted?.title}</Text>
                <Text size="sm" c="dimmed" lineClamp={2}>{submitted?.description}</Text>
                <Text size="xs" c="dimmed" mt="sm">Podes editá-lo ou retirá-lo até a equipa o começar a analisar.</Text>
              </Card>
              <Group mt="md">
                <Button component={Link} to="/me">Ver os meus pedidos</Button>
                <Button component={Link} to={`/me/products/${productId}`} variant="default">Pedidos de {data.product.name}</Button>
              </Group>
            </Stack>
          </Card>
        </Stepper.Completed>
      </Stepper>
    </Stack>
  )
}
