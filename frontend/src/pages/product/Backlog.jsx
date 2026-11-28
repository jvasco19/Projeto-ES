import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ActionIcon, Button, Card, Chip, Group, Modal, NumberInput, Select, Stack, Table, Text, TextInput, Textarea } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Icon } from '../../components/Icon.jsx'
import { Empty, PageHeader, PageLoader, StatusBadge } from '../../components/ui.jsx'
import { useApi } from '../../data/useApi.js'
import { api } from '../../lib/api.js'
import { getUser } from '../../lib/auth.js'
import { notifyError, notifySuccess } from '../../lib/feedback.jsx'
import { can, featureStatus } from '../../lib/labels.js'
import { useProduct } from '../../lib/useProduct.js'

const validScore = (v) => Number.isInteger(v) && v >= 1 && v <= 10
const stop = (e) => e.stopPropagation()
const emptyFilters = { query: '', team: null, status: null, release: null, noStory: false, mine: false }

function ScoreInput({ value, disabled, label, onCommit }) {
  const current = value ?? ''
  const [draft, setDraft] = useState(current)
  return (
    <NumberInput
      size="xs" w={56} value={draft} onChange={setDraft} disabled={disabled} hideControls clampBehavior="none"
      allowDecimal={false} aria-label={label} onClick={stop}
      onBlur={async () => {
        if (draft === current) return
        if (!validScore(draft)) {
          notifyError(`${label} tem de ser um número inteiro de 1 a 10. A prioridade manteve-se.`, 'Valor inválido')
          setDraft(current)
          return
        }
        const ok = await onCommit(draft)
        if (!ok) setDraft(current)
      }}
    />
  )
}

function Row({ f, index, canEdit, sortable, onOpen, onScore }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: f.id, disabled: !sortable })
  return (
    <Table.Tr
      ref={setNodeRef}
      className="row-link"
      onClick={onOpen}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: 'relative',
        zIndex: isDragging ? 2 : undefined,
        background: isDragging ? 'var(--mantine-color-body)' : undefined,
        boxShadow: isDragging ? 'var(--mantine-shadow-md)' : undefined,
      }}
    >
      <Table.Td onClick={stop}>
        <Group gap={2} wrap="nowrap">
          {sortable ? (
            <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Arrastar ${f.title}`} style={{ cursor: 'grab' }} {...attributes} {...listeners}>
              <Icon name="drag_indicator" size={18} />
            </ActionIcon>
          ) : null}
          <Text size="sm" c="dimmed" w={20} ta="right">{index + 1}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>{f.title}</Text>
        <Group gap={6} mt={2}>
          <Text size="xs" c="dimmed" ff="monospace">F-{f.id}</Text>
          {!f.hasStory && <Text size="xs" c="yellow.8">Sem User Story</Text>}
        </Group>
      </Table.Td>
      <Table.Td><ScoreInput value={f.impact} label="O impacto" disabled={!canEdit} onCommit={(v) => onScore({ impact: v })} /></Table.Td>
      <Table.Td><ScoreInput value={f.effort} label="O esforço" disabled={!canEdit} onCommit={(v) => onScore({ effort: v })} /></Table.Td>
      <Table.Td><Text fw={600}>{f.priority ?? '—'}</Text></Table.Td>
      <Table.Td><Text size="sm">{f.storyPoints ?? '—'}</Text></Table.Td>
      <Table.Td><StatusBadge status={f.status} kind="feature" size="sm" /></Table.Td>
      <Table.Td><Text size="sm" c={f.teamName ? undefined : 'dimmed'}>{f.teamName ?? 'Por atribuir'}</Text></Table.Td>
      <Table.Td><Text size="sm" c={f.assigneeName ? undefined : 'dimmed'}>{f.assigneeName ?? '—'}</Text></Table.Td>
      <Table.Td><Text size="sm" c={f.releaseName ? undefined : 'dimmed'}>{f.releaseName ?? '—'}</Text></Table.Td>
    </Table.Tr>
  )
}

export default function Backlog() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { role, base, product, productId } = useProduct()
  const backlogApi = useApi(`/products/${productId}/backlog`)
  const [items, setItems] = useState(null)
  const [newOpened, newModal] = useDisclosure(params.get('criar') === 'funcionalidade')
  const [form, setForm] = useState({ title: '', description: '' })
  const [titleError, setTitleError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [filters, setFilters] = useState(emptyFilters)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  if (backlogApi.loading) return <PageLoader rows={1} />

  const isNew = product?.isNew
  if (backlogApi.error && !isNew) {
    return (
      <Card>
        <Empty icon="error" title="Não foi possível carregar o backlog" description={backlogApi.error.message} />
      </Card>
    )
  }

  const list = items ?? (isNew ? [] : backlogApi.data)
  const canEdit = can(role, 'priority')
  const myId = String(getUser()?.id ?? '')
  const teamNames = [...new Set(list.map((f) => f.teamName).filter(Boolean))]
  const releaseNames = [...new Set(list.map((f) => f.releaseName).filter(Boolean))]
  const filtering = filters.query || filters.team || filters.status || filters.release || filters.noStory || filters.mine
  const visible = list.filter((f) =>
    (!filters.query || `F-${f.id} ${f.title}`.toLowerCase().includes(filters.query.toLowerCase())) &&
    (!filters.team || f.teamName === filters.team) &&
    (!filters.status || f.status === filters.status) &&
    (!filters.release || (filters.release === 'none' ? !f.releaseName : f.releaseName === filters.release)) &&
    (!filters.noStory || !f.hasStory) &&
    (!filters.mine || f.assigneeId === myId))

  async function changeScore(feature, changes) {
    try {
      const updated = await api(`/products/${productId}/features/${feature.id}/priority`, { method: 'PATCH', body: changes })
      setItems(updated)
      notifySuccess('Prioridade atualizada e backlog reordenado.')
      return true
    } catch (error) {
      notifyError(error.message, error.status === 403 ? 'Acesso negado' : 'Não foi possível mudar a prioridade')
      return false
    }
  }

  function openNew() {
    setTitleError(null)
    newModal.open()
  }

  function closeNew() {
    newModal.close()
    if (params.get('criar')) setParams({}, { replace: true })
  }

  async function create() {
    if (!form.title.trim()) return setTitleError('Indica o título da funcionalidade')
    setCreating(true)
    try {
      const created = await api(`/products/${productId}/features`, { method: 'POST', body: form })
      setItems(await api(`/products/${productId}/backlog`))
      setForm({ title: '', description: '' })
      closeNew()
      notifySuccess(`"${created.title}" adicionada ao Product Backlog, na posição ${created.position}.`)
    } catch (error) {
      if (error.field === 'title') setTitleError(error.message)
      else notifyError(error.message)
    } finally {
      setCreating(false)
    }
  }

  async function onDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const from = list.findIndex((f) => f.id === active.id)
    const to = list.findIndex((f) => f.id === over.id)
    const moved = list[from]
    setItems(arrayMove(list, from, to))
    try {
      const updated = await api(`/products/${productId}/features/${moved.id}/position`, { method: 'PATCH', body: { position: to + 1 } })
      setItems(updated)
      notifySuccess(`"${moved.title}" passou para a posição ${to + 1}.`)
    } catch (error) {
      setItems(list)
      notifyError(error.message, error.status === 403 ? 'Acesso negado' : 'Não foi possível mudar a posição')
    }
  }

  return (
    <>
      <PageHeader
        title="Product Backlog"
        description="O que a equipa deve fazer primeiro. Arrasta para reordenar à mão ou ajusta impacto e esforço (1 a 10)."
        actions={canEdit && <Button leftSection={<Icon name="add" size={18} />} onClick={openNew}>Nova funcionalidade</Button>}
      />

      <Group gap="sm" mb="md" wrap="wrap" display={list.length ? undefined : 'none'}>
        <TextInput placeholder="Pesquisar" leftSection={<Icon name="search" size={18} />} w={220} aria-label="Pesquisar funcionalidades"
          value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.currentTarget.value })} />
        <Select placeholder="Equipa" clearable w={140} data={teamNames} value={filters.team}
          onChange={(v) => setFilters({ ...filters, team: v })} aria-label="Filtrar por equipa" />
        <Select placeholder="Estado" clearable w={140} data={Object.entries(featureStatus).map(([value, s]) => ({ value, label: s.label }))}
          value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} aria-label="Filtrar por estado" />
        <Select placeholder="Release" clearable w={150} data={[{ value: 'none', label: 'Sem release' }, ...releaseNames]}
          value={filters.release} onChange={(v) => setFilters({ ...filters, release: v })} aria-label="Filtrar por release" />
        <Chip checked={filters.noStory} onChange={(v) => setFilters({ ...filters, noStory: v })} variant="outline">Sem User Story</Chip>
        <Chip checked={filters.mine} onChange={(v) => setFilters({ ...filters, mine: v })} variant="outline">Atribuídas a mim</Chip>
        {filtering && <Button variant="subtle" size="xs" onClick={() => setFilters(emptyFilters)}>Limpar filtros</Button>}
      </Group>

      <Card padding={0}>
        {list.length === 0 ? (
          canEdit ? (
            <Empty icon="format_list_numbered" title="O Product Backlog está vazio"
              description="Cria a primeira funcionalidade ou aprova pedidos de clientes para os trazer para aqui.">
              <Button leftSection={<Icon name="add" size={18} />} onClick={openNew}>Nova funcionalidade</Button>
            </Empty>
          ) : (
            <Empty icon="format_list_numbered" title="O Product Backlog está vazio"
              description="O backlog é criado pelo Product Manager (Product Owner). Convida um para a equipa.">
              {can(role, 'teams') && <Button component={Link} to={`${base}/teams?criar=convite`} leftSection={<Icon name="person_add" size={18} />}>Convidar Product Manager</Button>}
            </Empty>
          )
        ) : visible.length === 0 ? (
          <Empty icon="filter_alt_off" title="Nenhuma funcionalidade com estes filtros" />
        ) : (
          <Table.ScrollContainer minWidth={1000}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={visible.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <Table highlightOnHover={false}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={64}>#</Table.Th>
                      <Table.Th>Funcionalidade</Table.Th>
                      <Table.Th w={70}>Impacto</Table.Th>
                      <Table.Th w={70}>Esforço</Table.Th>
                      <Table.Th w={80}>Prioridade</Table.Th>
                      <Table.Th w={70}>Pontos</Table.Th>
                      <Table.Th w={110}>Estado</Table.Th>
                      <Table.Th w={120}>Equipa</Table.Th>
                      <Table.Th w={140}>Responsável</Table.Th>
                      <Table.Th w={80}>Release</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {visible.map((f) => (
                      <Row
                        key={f.id}
                        f={f}
                        index={list.indexOf(f)}
                        canEdit={canEdit}
                        sortable={canEdit && !filtering}
                        onOpen={() => navigate(`${base}/funcionalidades/${f.id}`)}
                        onScore={(changes) => changeScore(f, changes)}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </SortableContext>
            </DndContext>
          </Table.ScrollContainer>
        )}
      </Card>
      <Text size="xs" c="dimmed" mt="sm">
        {canEdit && filtering ? 'Limpa os filtros para reordenar arrastando. ' : ''}
        A prioridade é calculada a partir do impacto e do esforço (impacto × 10 / esforço).
      </Text>

      <Modal opened={newOpened} onClose={closeNew} title="Nova funcionalidade">
        <Stack>
          <TextInput label="Título" withAsterisk value={form.title} error={titleError} data-autofocus
            onChange={(e) => { setForm({ ...form, title: e.currentTarget.value }); setTitleError(null) }} />
          <Textarea label="Descrição" autosize minRows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.currentTarget.value })} />
          <Text size="xs" c="dimmed">Entra no fim do backlog, sem impacto nem esforço. Podes ajustá-los a seguir.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeNew}>Cancelar</Button>
            <Button loading={creating} onClick={create}>Adicionar ao backlog</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}