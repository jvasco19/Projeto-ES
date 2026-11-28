import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, Group, SegmentedControl, Stack, Text, TextInput, UnstyledButton } from '@mantine/core'
import { Icon } from '../../components/Icon.jsx'
import { Empty, PageHeader, PageLoader, StatusBadge } from '../../components/ui.jsx'
import { useApi } from '../../data/useApi.js'
import { api } from '../../lib/api.js'
import { notifyError, notifySuccess } from '../../lib/feedback.jsx'

const filters = {
  todos: () => true,
  abertos: (r) => ['in_review', 'approved', 'planned'].includes(r.status),
  entregues: (r) => r.status === 'delivered',
}

function VoteButton({ request, disabled, onToggle }) {
  return (
    <UnstyledButton
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={request.votedByMe}
      aria-label={request.votedByMe ? `Retirar voto de ${request.title}` : `Votar em ${request.title}`}
      w={56}
      py={6}
      style={{
        borderRadius: 10,
        textAlign: 'center',
        border: `1px solid ${request.votedByMe ? 'var(--mantine-color-stream-5)' : 'var(--ws-border)'}`,
        background: request.votedByMe ? 'var(--mantine-color-stream-light)' : undefined,
        opacity: disabled ? 0.6 : 1,
        flexShrink: 0,
      }}
    >
      <Icon name="arrow_upward" size={18} style={{ color: request.votedByMe ? 'var(--mantine-color-stream-6)' : undefined }} />
      <Text size="sm" fw={600} lh={1.2}>{request.votes}</Text>
    </UnstyledButton>
  )
}

export default function PublicRequests() {
  const { productId } = useParams()
  const me = useApi('/auth/me')
  const publicRequests = useApi(`/products/${productId}/requests/public`)
  const [items, setItems] = useState(null)
  const [pendingId, setPendingId] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('todos')

  if (me.loading || publicRequests.loading) return <PageLoader rows={1} />

  // Só os produtos onde o utilizador é cliente. Os ids da API são texto, tal como o do URL.
  const product = me.data?.products.find((p) => p.id === productId && p.role === 'customer')
  if (!product || publicRequests.error) {
    return (
      <Card>
        <Empty icon="apps" title="Este produto não existe ou já não está disponível" description="Abre o link que a equipa do produto te enviou.">
          <Button component={Link} to="/me" variant="light">Ver os meus pedidos</Button>
        </Empty>
      </Card>
    )
  }

  const list = items ?? publicRequests.data
  const visible = list.filter(filters[filter]).filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase()))

  // Vota ou retira o voto e atualiza o pedido com a resposta da API
  async function toggle(r) {
    setPendingId(r.id)
    try {
      const result = await api(`/products/${productId}/requests/${r.id}/vote`, { method: r.votedByMe ? 'DELETE' : 'POST' })
      setItems(list.map((x) => (x.id === r.id ? { ...x, votes: result.votes, votedByMe: result.votedByMe } : x)))
      notifySuccess(result.votedByMe ? 'Voto registado. Vais ser notificado quando o estado mudar.' : 'Voto retirado.')
    } catch (e) {
      notifyError(e.message)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title={`Pedidos de ${product.name}`}
        description="Pedidos de outros clientes. Vota nos que também precisas para a equipa saber o que é mais pedido."
        actions={
          <>
            <Button component={Link} to={`/me/roadmap/${productId}`} variant="default" leftSection={<Icon name="timeline" size={18} />}>Roadmap</Button>
            <Button component={Link} to={`/me/new/${productId}`} leftSection={<Icon name="add" size={18} />}>Novo pedido</Button>
          </>
        }
      />
      <Group mb="md" gap="sm">
        <TextInput placeholder="Pesquisar pedidos" leftSection={<Icon name="search" size={18} />} value={query}
          onChange={(e) => setQuery(e.currentTarget.value)} w={{ base: '100%', xs: 280 }} aria-label="Pesquisar pedidos" />
        <SegmentedControl value={filter} onChange={setFilter}
          data={[{ value: 'todos', label: 'Todos' }, { value: 'abertos', label: 'Em curso' }, { value: 'entregues', label: 'Entregues' }]} />
      </Group>
      <Card padding={0}>
        {visible.length === 0 ? (
          <Empty icon="search_off" title="Nenhum pedido corresponde à pesquisa" description="Se ninguém pediu isto ainda, cria um pedido novo.">
            <Button component={Link} to={`/me/new/${productId}`}>Criar novo pedido</Button>
          </Empty>
        ) : visible.map((r, i) => (
          <Group key={r.id} wrap="nowrap" gap="md" px="md" py="sm" style={{ borderTop: i ? '1px solid var(--ws-border)' : 0 }}>
            <VoteButton request={r} disabled={pendingId === r.id} onToggle={() => toggle(r)} />
            <Stack gap={4} style={{ minWidth: 0 }}>
              <Text fw={500}>{r.title}</Text>
              <Group gap="xs"><StatusBadge status={r.status} size="sm" /><Text size="xs" c="dimmed" ff="monospace">R-{r.id}</Text></Group>
            </Stack>
          </Group>
        ))}
      </Card>
    </>
  )
}
