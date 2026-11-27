import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Accordion, Alert, Badge, Button, Card, Grid, Group, Modal, ScrollArea, SegmentedControl, Select, Stack, Switch,
  TagsInput, Text, TextInput, Textarea, Title, Tooltip, UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Icon } from '../../components/Icon.jsx'
import { Empty, PageHeader, PageLoader, StatusBadge } from '../../components/ui.jsx'
import { useApi } from '../../data/useApi.js'
import { api, openAttachment } from '../../lib/api.js'
import { notifyError, notifySuccess } from '../../lib/feedback.jsx'
import { formatDate } from '../../lib/format.js'
import { can } from '../../lib/labels.js'
import { useProduct } from '../../lib/useProduct.js'

const filters = {
  analisar: (r) => ['submitted', 'in_review'].includes(r.status),
  aprovados: (r) => ['approved', 'planned', 'delivered'].includes(r.status),
  rejeitados: (r) => r.status === 'rejected',
  todos: () => true,
}

// Valores do enum request_category (API) e o texto mostrado no ecrã.
const categories = [
  { value: 'reports', label: 'Relatórios' },
  { value: 'integrations', label: 'Integrações' },
  { value: 'notifications', label: 'Notificações' },
  { value: 'usability', label: 'Usabilidade' },
  { value: 'performance', label: 'Desempenho' },
  { value: 'security', label: 'Segurança' },
]

const STATE_LIMIT_DAYS = 7

// Dias desde a última mudança de estado
function daysInState(request) {
  return Math.floor((Date.now() - new Date(request.statusChangedAt)) / (1000 * 60 * 60 * 24))
}

function RequestPanel({ request, editable, path, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(request.description)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState(null)
  const [rejectOpened, rejectModal] = useDisclosure(false)
  const [loading, setLoading] = useState(null) // 'save' | 'approve' | 'reject'

  const decided = ['approved', 'planned', 'delivered', 'rejected'].includes(request.status)
  const lockedHint = 'Só o Product Manager pode analisar pedidos'
  const days = daysInState(request)

  // Envia uma alteração; a API devolve o pedido atualizado, que substitui o da lista
  async function send(method, suffix, body, successMessage, kind) {
    setLoading(kind)
    try {
      const updated = await api(`${path}/${request.id}${suffix}`, { method, body })
      onChange(updated)
      if (successMessage) notifySuccess(successMessage)
      return true
    } catch (e) {
      if (e.field === 'reason') setReasonError(e.message)
      else notifyError(e.message)
      return false
    } finally {
      setLoading(null)
    }
  }

  async function saveDescription() {
    if (!draft.trim()) return notifyError('A descrição não pode ficar vazia.')
    const ok = await send('PATCH', '', { description: draft }, 'Descrição atualizada. A versão anterior ficou guardada.', 'save')
    if (ok) setEditing(false)
  }

  async function reject() {
    if (!reason.trim()) return setReasonError('Indica o motivo. O cliente vai vê-lo no pedido.')
    const ok = await send('POST', '/reject', { reason }, 'Pedido rejeitado. O cliente foi notificado com o motivo.', 'reject')
    if (ok) rejectModal.close()
  }

  return (
    <Card padding="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" ff="monospace">R-{request.id}</Text>
          <Title order={2} size="h3" mt={2}>{request.title}</Title>
          <Text size="sm" c="dimmed" mt={4}>{request.authorName} · {formatDate(request.createdAt)}</Text>
        </div>
        <StatusBadge status={request.status} />
      </Group>

      {days > STATE_LIMIT_DAYS && !decided && (
        <Alert color="yellow" variant="light" mt="md" icon={<Icon name="schedule" />}>
          Parado há {days} dias neste estado (limite de {STATE_LIMIT_DAYS}).
        </Alert>
      )}
      {request.status === 'rejected' && (
        <Alert color="red" variant="light" mt="md" icon={<Icon name="info" />} title="Motivo enviado ao cliente">
          {request.rejectionReason}
        </Alert>
      )}

      <Group gap="lg" mt="md">
        <Group gap={6}><Icon name="thumb_up" size={16} /><Text size="sm">{request.votes ?? 0} votos</Text></Group>
        <Switch
          label="Visível para outros clientes"
          checked={request.isPublic}
          disabled={!editable}
          onChange={(e) => {
            const value = e.currentTarget.checked
            send('PATCH', '', { isPublic: value }, value ? 'Pedido tornado público.' : 'Pedido tornado privado.')
          }}
        />
      </Group>

      <Stack gap="xs" mt="lg">
        <Group justify="space-between">
          <Text fw={600} size="sm">Descrição</Text>
          {editable && !editing && (
            <Button variant="subtle" size="xs" leftSection={<Icon name="edit" size={16} />} onClick={() => { setDraft(request.description); setEditing(true) }}>
              Editar
            </Button>
          )}
        </Group>
        {editing ? (
          <>
            <Textarea autosize minRows={3} value={draft} onChange={(e) => setDraft(e.currentTarget.value)} aria-label="Descrição do pedido" />
            <Group justify="flex-end" gap="xs">
              <Button variant="default" size="xs" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button size="xs" loading={loading === 'save'} onClick={saveDescription}>Guardar nova versão</Button>
            </Group>
          </>
        ) : (
          <Text size="sm">{request.description}</Text>
        )}
        {request.attachments.length > 0 && (
          <Group gap="xs">
            {request.attachments.map((a) => (
              <UnstyledButton key={a.id} title={`Abrir ${a.fileName}`}
                onClick={() => openAttachment(a.id, a.fileName).catch((e) => notifyError(e.message))}>
                <Badge variant="default" leftSection={<Icon name="attach_file" size={14} />} style={{ cursor: 'pointer' }}>{a.fileName}</Badge>
              </UnstyledButton>
            ))}
          </Group>
        )}
      </Stack>

      <Grid mt="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select label="Categoria" data={categories} value={request.category} disabled={!editable} allowDeselect={false}
            onChange={(v) => send('PATCH', '', { category: v }, 'Categoria guardada.')} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TagsInput label="Etiquetas" placeholder="Escreve e carrega Enter" value={request.tags} disabled={!editable}
            onChange={(tags) => send('PUT', '/tags', { tags })} />
        </Grid.Col>
      </Grid>

      {request.versions.length > 0 && (
        <Accordion variant="contained" mt="md">
          <Accordion.Item value="versions">
            <Accordion.Control icon={<Icon name="history" size={18} />}>Versões anteriores ({request.versions.length})</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                {request.versions.map((v) => (
                  <div key={v.version}>
                    <Text size="xs" c="dimmed">Versão {v.version} · {v.editedBy} · {formatDate(v.createdAt)}</Text>
                    <Text size="sm">{v.description}</Text>
                  </div>
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      {!decided && (
        <Group justify="flex-end" mt="xl" gap="sm">
          <Tooltip label={lockedHint} disabled={editable}>
            <Button variant="default" color="red" disabled={!editable} onClick={() => { setReason(''); setReasonError(null); rejectModal.open() }}>
              Rejeitar
            </Button>
          </Tooltip>
          <Tooltip label={lockedHint} disabled={editable}>
            <Button disabled={!editable} loading={loading === 'approve'} leftSection={<Icon name="check" size={18} />}
              onClick={() => send('POST', '/approve', undefined, 'Pedido aprovado. O cliente foi notificado.', 'approve')}>
              Aprovar
            </Button>
          </Tooltip>
        </Group>
      )}

      <Modal opened={rejectOpened} onClose={rejectModal.close} title="Rejeitar pedido">
        <Stack>
          <Text size="sm" c="dimmed">O motivo fica visível para o cliente na área pessoal dele.</Text>
          <Textarea label="Motivo" withAsterisk autosize minRows={3} value={reason} error={reasonError}
            onChange={(e) => { setReason(e.currentTarget.value); setReasonError(null) }} data-autofocus />
          <Group justify="flex-end">
            <Button variant="default" onClick={rejectModal.close}>Cancelar</Button>
            <Button color="red" loading={loading === 'reject'} onClick={reject}>Rejeitar pedido</Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  )
}

export default function Requests() {
  const { role, productId } = useProduct()
  const [params] = useSearchParams()
  const path = `/products/${productId}/triage`
  const { data, loading, error } = useApi(path)
  const [items, setItems] = useState(null)
  const [filter, setFilter] = useState(params.get('filtro') ?? 'analisar')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(params.get('pedido'))

  if (!can(role, 'triage')) {
    return (
      <Card>
        <Empty icon="lock" title="Acesso reservado ao Product Manager"
          description="A análise de pedidos de clientes é feita pelo Product Owner. O trabalho que te foi atribuído está no board do sprint." />
      </Card>
    )
  }
  if (loading) return <PageLoader rows={2} />
  if (error) {
    return <Card><Empty icon="error" title="Não foi possível carregar os pedidos" description={error.message} /></Card>
  }

  const list = items ?? data
  const visible = list.filter(filters[filter]).filter((r) => r.title.toLowerCase().includes(query.toLowerCase()))
  const selected = list.find((r) => r.id === selectedId)

  // Substitui um pedido da lista pela versão devolvida pela API
  function replace(updated) {
    setItems(list.map((r) => (r.id === updated.id ? updated : r)))
  }

  // Abrir um pedido submetido passa-o a "Em análise"
  async function open(r) {
    setSelectedId(r.id)
    if (r.status !== 'submitted') return
    try {
      replace(await api(`${path}/${r.id}/review`, { method: 'POST' }))
    } catch (e) {
      notifyError(e.message)
    }
  }

  return (
    <>
      <PageHeader
        title="Pedidos dos clientes"
        description="Analisa os pedidos recebidos pelo link do produto, organiza-os e decide se entram no Product Backlog."
      />
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card padding={0}>
            <Stack p="md" gap="sm" style={{ borderBottom: '1px solid var(--ws-border)' }}>
              <SegmentedControl fullWidth value={filter} onChange={setFilter} size="xs"
                data={[
                  { value: 'analisar', label: 'Por analisar' },
                  { value: 'aprovados', label: 'Aprovados' },
                  { value: 'rejeitados', label: 'Rejeitados' },
                  { value: 'todos', label: 'Todos' },
                ]} />
              <TextInput placeholder="Pesquisar pedidos" leftSection={<Icon name="search" size={18} />}
                value={query} onChange={(e) => setQuery(e.currentTarget.value)} aria-label="Pesquisar pedidos" />
            </Stack>
            <ScrollArea.Autosize mah={620}>
              {visible.length === 0 ? (
                <Empty icon="inbox" title="Sem pedidos nesta lista" />
              ) : (
                visible.map((r, i) => {
                  const days = daysInState(r)
                  return (
                    <UnstyledButton
                      key={r.id}
                      className="row-link"
                      onClick={() => open(r)}
                      w="100%"
                      px="md"
                      py="sm"
                      style={{
                        borderTop: i ? '1px solid var(--ws-border)' : 0,
                        background: r.id === selectedId ? 'var(--mantine-color-stream-light)' : undefined,
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap" align="flex-start">
                        <div style={{ minWidth: 0 }}>
                          <Text size="sm" fw={500} truncate>{r.title}</Text>
                          <Text size="xs" c="dimmed" mt={2}>{r.authorName} · {r.votes ?? 0} votos · {formatDate(r.createdAt)}</Text>
                        </div>
                        <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
                          <StatusBadge status={r.status} size="sm" />
                          {days > STATE_LIMIT_DAYS && ['submitted', 'in_review'].includes(r.status) && (
                            <Text size="xs" c="yellow.8" fw={500}>{days} dias parado</Text>
                          )}
                        </Stack>
                      </Group>
                    </UnstyledButton>
                  )
                })
              )}
            </ScrollArea.Autosize>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          {selected ? (
            <RequestPanel
              key={selected.id}
              request={selected}
              editable={can(role, 'triage')}
              path={path}
              onChange={replace}
            />
          ) : (
            <Card><Empty icon="touch_app" title="Escolhe um pedido para o analisar" /></Card>
          )}
        </Grid.Col>
      </Grid>
    </>
  )
}