import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, pointerWithin, rectIntersection, useDraggable, useDroppable,
  useSensor, useSensors,
} from '@dnd-kit/core'
import {
  ActionIcon, Alert, Badge, Button, Card, Drawer, Grid, Group, Menu, Modal, NumberInput, Progress, Radio, SegmentedControl,
  Select, SimpleGrid, Stack, Text, TextInput, Textarea, Tooltip,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { Icon } from '../../components/Icon.jsx'
import { FeatureProperties } from '../../components/FeatureProperties.jsx'
import { Empty, PageHeader, PageLoader } from '../../components/ui.jsx'
import { useData } from '../../data/useData.js'
import { useApi } from '../../data/useApi.js'
import { api } from '../../lib/api.js'
import { getUser } from '../../lib/auth.js'
import { notifyError, notifySuccess, useAction } from '../../lib/feedback.jsx'
import { formatRange } from '../../lib/format.js'
import { can, featureFlow, featureStatus, sprintState } from '../../lib/labels.js'
import { useProduct } from '../../lib/useProduct.js'

// ---------- Board ----------
function BoardCard({ item, disabled, overlay, onOpen }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id, disabled })
  return (
    <Card
      ref={overlay ? undefined : setNodeRef}
      padding="sm"
      className="board-card"
      data-dragging={isDragging && !overlay}
      shadow={overlay ? 'lg' : undefined}
      onClick={overlay ? undefined : onOpen}
      style={{ cursor: disabled ? 'pointer' : undefined }}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
    >
      <Group justify="space-between" mb={6} wrap="nowrap">
        <Text size="xs" c="dimmed" ff="monospace">F-{item.id}</Text>
      </Group>
      <Text size="sm" fw={500}>{item.title}</Text>
      <Group justify="space-between" mt="sm" wrap="nowrap">
        <Text size="xs" c="dimmed">{item.teamName ?? 'Sem equipa'} · {item.storyPoints ?? '—'} pts</Text>
        {item.assigneeName && <Text size="xs" c="dimmed" truncate>{item.assigneeName}</Text>}
      </Group>
    </Card>
  )
}

function Column({ status, children, count, points, activeId }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const info = featureStatus[status]
  return (
    <Card ref={setNodeRef} padding="sm" bg="var(--ws-subtle)" className="board-column" data-over={isOver && !!activeId} mih={360}>
      <Group justify="space-between" mb="sm" px={4}>
        <Group gap={8}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: `var(--mantine-color-${info.color}-6)` }} />
          <Text size="sm" fw={600}>{info.label}</Text>
          <Text size="sm" c="dimmed">{count}</Text>
        </Group>
        <Text size="xs" c="dimmed">{points} pts</Text>
      </Group>
      <Stack gap="sm">
        {children}
        {count === 0 && <Text size="xs" c="dimmed" ta="center" py="lg">Sem funcionalidades neste estado</Text>}
      </Stack>
    </Card>
  )
}

function Board({ items, myTeamName, onOpen, onMove }) {
  const [activeId, setActiveId] = useState(null)
  const [view, setView] = useState('todos')
  const [team, setTeam] = useState(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor))
  const me = getUser()
  // canMove vem da API: true nos cartões que este utilizador pode mover (developer da equipa)
  const canDrag = items.some((i) => i.canMove)
  const teamNames = [...new Set(items.map((i) => i.teamName).filter(Boolean))]
  const active = items.find((i) => i.id === activeId)
  const visible = items.filter((i) =>
    (view === 'meu' ? String(i.assigneeId) === String(me?.id) : true) && (!team || i.teamName === team))

  // As regras (não saltar estados, só a própria equipa) são validadas no backend:
  // aqui só se envia o pedido; a mensagem de erro, se houver, vem da API.
  function onDragEnd({ active: dragged, over }) {
    setActiveId(null)
    if (!over) return
    const item = items.find((i) => i.id === dragged.id)
    if (item.status !== over.id) onMove(item, over.id)
  }

  return (
    <>
      <Group justify="space-between" mb="md" gap="sm">
        <Group gap="sm">
          <SegmentedControl size="xs" value={view} onChange={setView}
            data={[{ value: 'todos', label: 'Todo o sprint' }, { value: 'meu', label: 'O meu trabalho' }]} />
          <Select size="xs" w={150} placeholder="Todas as equipas" clearable data={teamNames}
            value={team} onChange={setTeam} aria-label="Filtrar por equipa" />
        </Group>
        <Text size="xs" c="dimmed">
          {canDrag ? `Arrasta os cartões da equipa ${myTeamName} para mudar o estado.` : 'Só os developers da equipa atribuída mudam o estado.'}
        </Text>
      </Group>
      <DndContext sensors={sensors}
        collisionDetection={(args) => (pointerWithin(args).length ? pointerWithin(args) : rectIntersection(args))}
        onDragStart={(e) => setActiveId(e.active.id)} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
        <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
          {featureFlow.map((status) => {
            const col = visible.filter((i) => i.status === status)
            return (
              <Column key={status} status={status} count={col.length} points={col.reduce((s, i) => s + (i.storyPoints ?? 0), 0)} activeId={activeId}>
                {col.map((item) => (
                  <BoardCard key={item.id} item={item} disabled={!item.canMove} onOpen={() => onOpen(item)} />
                ))}
              </Column>
            )
          })}
        </SimpleGrid>
        {createPortal(
          <DragOverlay dropAnimation={{ duration: 180 }}>
            {active ? <BoardCard item={active} overlay /> : null}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </>
  )
}

// ---------- Sprint planeado (US22) ----------
function Planning({ sprint, planned, candidates, canPlan, canManage, onStart }) {
  const [items, setItems] = useState(planned)
  const [pending, setPending] = useState(null)
  const [run, loading] = useAction()
  const committed = items.reduce((s, i) => s + i.storyPoints, 0)

  function add(c, confirmed = false) {
    if (c.sprint) return notifyError(`${c.id} já está no ${c.sprint}. Retira-a desse sprint primeiro.`, 'Funcionalidade já planeada')
    if (!confirmed && committed + c.storyPoints > sprint.capacity) return setPending(c)
    run(`${c.id} adicionada ao ${sprint.name}.`, () => { setItems([...items, { ...c, assignee: null }]); setPending(null) })
  }

  function remove(c) {
    setItems(items.filter((i) => i.id !== c.id))
    notifySuccess(`${c.id} voltou ao Product Backlog.`)
  }

  const percent = Math.min(100, Math.round((committed / sprint.capacity) * 100))
  const over = committed > sprint.capacity
  const available = candidates.filter((c) => !items.some((i) => i.id === c.id))

  return (
    <Grid gutter="lg">
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Card padding={0}>
          <Stack gap={6} p="md" style={{ borderBottom: '1px solid var(--ws-border)' }}>
            <Group justify="space-between">
              <Text fw={600}>Sprint Backlog</Text>
              <Text size="sm" fw={600} c={over ? 'red' : undefined}>{committed} / {sprint.capacity} pts</Text>
            </Group>
            <Progress value={percent} color={over ? 'red' : percent > 85 ? 'yellow' : 'stream'} size="md" radius="xl" />
          </Stack>
          {items.length === 0 && <Empty icon="playlist_add" title="Ainda sem funcionalidades" description="Adiciona trabalho a partir do Product Backlog." />}
          {items.map((c) => (
            <Group key={c.id} justify="space-between" px="md" py="sm" wrap="nowrap" style={{ borderTop: '1px solid var(--ws-border)' }}>
              <div style={{ minWidth: 0 }}>
                <Text size="sm" fw={500}>{c.title}</Text>
                <Text size="xs" c="dimmed">{c.id} · {c.storyPoints} pts</Text>
              </div>
              {canPlan && (
                <Tooltip label="Retirar do sprint">
                  <ActionIcon variant="subtle" color="gray" aria-label={`Retirar ${c.id}`} onClick={() => remove(c)}><Icon name="remove_circle" size={18} /></ActionIcon>
                </Tooltip>
              )}
            </Group>
          ))}
          {canManage && (
            <Group justify="flex-end" p="md" style={{ borderTop: '1px solid var(--ws-border)' }}>
              <Button leftSection={<Icon name="play_arrow" size={18} />} disabled={!items.length} onClick={onStart}>Iniciar sprint</Button>
            </Group>
          )}
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 5 }}>
        <Card padding={0}>
          <Text fw={600} p="md" pb="xs">Do Product Backlog</Text>
          {available.length === 0 && <Text size="sm" c="dimmed" px="md" pb="md">Não há funcionalidades estimadas no backlog para adicionar.</Text>}
          {available.map((c) => (
            <Group key={c.id} justify="space-between" px="md" py="sm" wrap="nowrap" style={{ borderTop: '1px solid var(--ws-border)' }}>
              <div style={{ minWidth: 0 }}>
                <Text size="sm" fw={500}>{c.title}</Text>
                <Text size="xs" c="dimmed">{c.id} · {c.storyPoints} pts{c.sprint ? ` · no ${c.sprint}` : ''}</Text>
              </div>
              <Tooltip label="Só o Product Manager define o Sprint Backlog" disabled={canPlan}>
                <Button size="xs" variant="default" disabled={!canPlan} leftSection={<Icon name="add" size={16} />} onClick={() => add(c)}>
                  Adicionar
                </Button>
              </Tooltip>
            </Group>
          ))}
        </Card>
      </Grid.Col>

      <Modal opened={!!pending} onClose={() => setPending(null)} title="Sprint sobrecarregado">
        {pending && (
          <Stack>
            <Alert color="yellow" variant="light" icon={<Icon name="warning" />}>
              Com {pending.id} o {sprint.name} fica com {committed + pending.storyPoints} pts para uma capacidade de {sprint.capacity}.
            </Alert>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setPending(null)}>Cancelar</Button>
              <Button color="yellow" loading={loading} onClick={() => add(pending, true)}>Adicionar mesmo assim</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Grid>
  )
}

// ---------- Sprint concluído ----------
function Summary({ sprint, summary, base }) {
  return (
    <Grid gutter="lg">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card>
          <Text size="sm" c="dimmed">Concluído</Text>
          <Text fz={32} fw={600}>{sprint.done} <Text span size="md" c="dimmed">/ {sprint.committed} pts</Text></Text>
          <Progress value={(sprint.done / sprint.committed) * 100} color="green" mt="sm" />
          <Text size="sm" c="dimmed" mt="md">Objetivo: {sprint.goal}</Text>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Card padding={0}>
          {[['Entregues', summary.delivered, 'check_circle', 'green'], ['Passaram para o sprint seguinte', summary.carriedOver, 'redo', 'yellow']].map(([title, list, icon, color]) => (
            <div key={title}>
              <Group gap="xs" p="md" pb="xs"><Icon name={icon} size={18} style={{ color: `var(--mantine-color-${color}-6)` }} /><Text fw={600} size="sm">{title}</Text></Group>
              {list.map((f) => (
                <Group key={f.id} justify="space-between" px="md" py="xs" component={Link} to={`${base}/funcionalidades/${f.id}`}
                  className="row-link" style={{ color: 'inherit', textDecoration: 'none' }}>
                  <Text size="sm">{f.title}</Text>
                  <Text size="xs" c="dimmed">{f.storyPoints} pts</Text>
                </Group>
              ))}
            </div>
          ))}
        </Card>
      </Grid.Col>
    </Grid>
  )
}

// ---------- Criar / editar sprint ----------
function SprintForm({ onClose, sprint, onSave }) {
  const [form, setForm] = useState(sprint ?? { name: 'Sprint 16', goal: '', capacity: 40 })
  const [dates, setDates] = useState(sprint ? [sprint.start, sprint.end] : [null, null])
  const [errors, setErrors] = useState({})
  const [run, loading] = useAction()

  function save() {
    const err = {}
    if (!form.name.trim()) err.name = 'Indica o nome'
    if (!dates[0] || !dates[1]) err.dates = 'Escolhe o início e o fim'
    if (!form.capacity || form.capacity < 1) err.capacity = 'Indica a capacidade em story points'
    setErrors(err)
    if (Object.keys(err).length) return
    run(sprint ? 'Sprint atualizado.' : `${form.name} criado. Já podes planear o Sprint Backlog.`, () => { onSave({ ...form, start: dates[0], end: dates[1] }); onClose() })
  }

  return (
    <Modal opened onClose={onClose} title={sprint ? `Editar ${sprint.name}` : 'Novo sprint'}>
      <Stack>
        <TextInput label="Nome" withAsterisk value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} />
        <DatePickerInput type="range" label="Datas" withAsterisk locale="pt" valueFormat="D MMM YYYY" value={dates} onChange={setDates}
          error={errors.dates} placeholder="Início – fim" />
        <NumberInput label="Capacidade da equipa" description="Story points que a equipa consegue entregar" suffix=" pts" min={1}
          value={form.capacity} error={errors.capacity} onChange={(v) => setForm({ ...form, capacity: v })} />
        <Textarea label="Objetivo do sprint" autosize minRows={2} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.currentTarget.value })} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button loading={loading} onClick={save}>{sprint ? 'Guardar' : 'Criar sprint'}</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function CloseSprint({ onClose, sprint, items, nextName, onConfirm }) {
  const [target, setTarget] = useState('next')
  const [run, loading] = useAction()
  const unfinished = items.filter((i) => i.status !== 'done')
  const donePts = items.filter((i) => i.status === 'done').reduce((s, i) => s + (i.storyPoints ?? 0), 0)
  return (
    <Modal opened onClose={onClose} title={`Fechar ${sprint.name}`}>
      <Stack>
        <Text size="sm">{donePts} de {sprint.committed} story points concluídos. {unfinished.length} funcionalidades ficaram por terminar.</Text>
        {unfinished.length > 0 && (
          <Radio.Group label="O que fazer ao trabalho por terminar?" value={target} onChange={setTarget}>
            <Stack gap="xs" mt="xs">
              <Radio value="next" label={`Passar para o ${nextName}`} />
              <Radio value="backlog" label="Devolver ao Product Backlog" />
            </Stack>
          </Radio.Group>
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button loading={loading} onClick={() => run(`${sprint.name} fechado. ${unfinished.length ? (target === 'next' ? `Trabalho por terminar passou para o ${nextName}.` : 'Trabalho por terminar voltou ao backlog.') : ''}`, onConfirm)}>
            Fechar sprint
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default function Sprints() {
  const [params, setParams] = useSearchParams()
  const { role, base, product, productId } = useProduct()
  // Sprints, planeamento e resumo ainda são dados de teste (não há tabela de sprints)
  const { data, loading } = useData((s) => ({
    list: s.sprintList, candidates: s.sprintCandidates,
    planned: s.plannedSprintItems, summary: s.sprintSummary, backlog: s.backlog,
  }))
  // US11: o board vem da API
  const boardApi = useApi(`/products/${productId}/board`)
  const [sprints, setSprints] = useState(null)
  const [selected, setSelected] = useState('s14')
  const [items, setItems] = useState(null)
  const [quick, setQuick] = useState(null)
  const [form, setForm] = useState(params.get('criar') === 'sprint' ? 'new' : null)
  const [closing, setClosing] = useState(false)

  if (loading || boardApi.loading) return <PageLoader rows={1} />

  const isNew = product?.isNew
  if (boardApi.error && !isNew) {
    return (
      <Card>
        <Empty icon="error" title="Não foi possível carregar o board" description={boardApi.error.message} />
      </Card>
    )
  }
  const list = sprints ?? (isNew ? [] : data.list)
  const sprint = list.find((s) => s.id === selected) ?? list[0]
  const boardItems = items ?? (isNew ? [] : boardApi.data.features)
  const myTeamName = boardItems.find((i) => i.teamId === boardApi.data?.myTeamId)?.teamName
  const candidates = isNew ? [] : data.candidates
  const canManage = can(role, 'sprints')
  const next = list.find((s) => s.state === 'planeado')

  function closeForm() {
    setForm(null)
    if (params.get('criar')) setParams({}, { replace: true })
  }

  function openQuick(item) {
    setQuick({ ...item, team: item.teamName, assignee: item.assigneeId, canChangeStatus: item.canMove, sprint: sprint.name })
  }

  // US11: muda o estado na API e atualiza o cartão (e a vista rápida, se estiver aberta)
  async function moveFeature(item, status) {
    try {
      const updated = await api(`/products/${productId}/features/${item.id}/status`, { method: 'PATCH', body: { status } })
      setItems(boardItems.map((i) => (i.id === item.id ? { ...i, status: updated.status } : i)))
      if (quick?.id === item.id) setQuick({ ...quick, status: updated.status, allowedStatuses: updated.allowedStatuses })
      notifySuccess(`"${item.title}" passou para "${featureStatus[updated.status].label}". Registado com data e autor.`)
    } catch (error) {
      notifyError(error.message, error.status === 403 ? 'Acesso negado' : 'Não é possível mudar o estado')
    }
  }

  const sprintForm = form && (
    <SprintForm onClose={closeForm} sprint={form === 'edit' ? sprint : null}
      onSave={(values) => {
        if (form === 'edit') setSprints(list.map((s) => (s.id === sprint.id ? { ...s, ...values } : s)))
        else {
          setSprints([{ ...values, id: 's16', state: 'planeado', committed: 0 }, ...list])
          setSelected('s16')
        }
      }} />
  )

  if (!sprint) {
    return (
      <>
        <PageHeader title="Sprints" description="Iterações de trabalho da equipa, com objetivo, datas e capacidade." />
        <Card>
          <Empty icon="view_kanban" title="Ainda não existem sprints"
            description={canManage ? 'Cria o primeiro sprint. O Product Manager escolhe depois o trabalho que entra nele.' : 'O primeiro sprint é criado pelo Project Manager (Scrum Master).'}>
            {canManage && <Button leftSection={<Icon name="add" size={18} />} onClick={() => setForm('new')}>Criar sprint</Button>}
          </Empty>
        </Card>
        {sprintForm}
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={
          <Group gap="sm" component="span" wrap="nowrap">
            <Select
              data={list.map((s) => ({ value: s.id, label: s.name }))}
              value={sprint.id}
              onChange={(v) => v && setSelected(v)}
              allowDeselect={false}
              variant="unstyled"
              w={170}
              styles={{ input: { fontSize: 'var(--mantine-h2-font-size)', fontWeight: 600, height: 40, paddingLeft: 0 } }}
              aria-label="Escolher sprint"
              rightSection={<Icon name="expand_more" size={22} />}
            />
            <Badge color={sprintState[sprint.state].color} size="lg">{sprintState[sprint.state].label}</Badge>
          </Group>
        }
        description={`${formatRange(sprint.start, sprint.end)} · Objetivo: ${sprint.goal || 'por definir'}`}
        actions={canManage && (
          <>
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="default" size="lg" aria-label="Ações do sprint"><Icon name="more_horiz" size={20} /></ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<Icon name="edit" size={18} />} onClick={() => setForm('edit')}>Editar sprint</Menu.Item>
                {sprint.state === 'ativo' && (
                  <Menu.Item leftSection={<Icon name="flag" size={18} />} onClick={() => setClosing(true)}>Fechar sprint</Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
            <Button leftSection={<Icon name="add" size={18} />} onClick={() => setForm('new')}>Novo sprint</Button>
          </>
        )}
      />

      {sprint.state === 'ativo' && (
        <Board items={boardItems} myTeamName={myTeamName} onOpen={openQuick} onMove={moveFeature} />
      )}
      {sprint.state === 'planeado' && (
        <Planning key={sprint.id} sprint={sprint} planned={sprint.id === 's15' && !isNew ? data.planned : []} candidates={candidates}
          canPlan={can(role, 'sprintPlan')} canManage={canManage}
          onStart={() => {
            if (list.some((s) => s.state === 'ativo')) return notifyError('Fecha o sprint ativo antes de iniciar outro.', 'Já existe um sprint ativo')
            setSprints(list.map((s) => (s.id === sprint.id ? { ...s, state: 'ativo' } : s)))
            notifySuccess(`${sprint.name} iniciado.`)
          }} />
      )}
      {sprint.state === 'concluido' && <Summary sprint={sprint} summary={data.summary} base={base} />}

      <Drawer opened={!!quick} onClose={() => setQuick(null)} position="right" size="md"
        title={quick && <Text size="xs" c="dimmed" ff="monospace">{quick.id}</Text>}>
        {quick && (
          <Stack>
            <Text fw={600} size="lg">{quick.title}</Text>
            <FeatureProperties key={quick.id} feature={quick} role={role} base={base}
              onChange={(f) => setQuick(f)} onStatusChange={(status) => moveFeature(quick, status)} />
            <Button component={Link} to={`${base}/funcionalidades/${quick.id}`} variant="light" rightSection={<Icon name="arrow_forward" size={18} />}>
              Abrir página completa
            </Button>
          </Stack>
        )}
      </Drawer>

      {sprintForm}
      {closing && (
        <CloseSprint onClose={() => setClosing(false)} sprint={sprint} items={boardItems} nextName={next?.name ?? 'próximo sprint'}
          onConfirm={() => {
            setSprints(list.map((s) => (s.id === sprint.id ? { ...s, state: 'concluido', done: 20 } : s)))
            setClosing(false)
            if (next) setSelected(next.id)
          }} />
      )}
    </>
  )
}
