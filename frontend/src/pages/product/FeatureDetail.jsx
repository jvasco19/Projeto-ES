import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Background, Controls, MarkerType, ReactFlow } from '@xyflow/react'
import {
  ActionIcon, Alert, Anchor, Avatar, Badge, Breadcrumbs, Button, Card, Grid, Group, Menu, Modal, Paper, Select, SimpleGrid,
  Stack, Tabs, Text, TextInput, Textarea, Timeline, Title, Tooltip, useComputedColorScheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Icon } from '../../components/Icon.jsx'
import { FeatureProperties } from '../../components/FeatureProperties.jsx'
import { Empty, PageLoader, StatusBadge } from '../../components/ui.jsx'
import { useData } from '../../data/useData.js'
import { useApi } from '../../data/useApi.js'
import { api } from '../../lib/api.js'
import { formatDate } from '../../lib/format.js'
import { notifyError, notifySuccess, useAction } from '../../lib/feedback.jsx'
import { can, featureStatus } from '../../lib/labels.js'
import { useProduct } from '../../lib/useProduct.js'

function Traceability({ feature, hasStory }) {
  const steps = [
    { icon: 'inbox', title: 'Pedido do cliente', body: feature.request ? `"${feature.request.text}"` : 'Criada pela equipa, sem pedido de cliente.', meta: feature.request ? `${feature.request.id} · ${feature.request.customer} · ${feature.request.submittedAt}` : null },
    { icon: 'description', title: 'User Story', body: hasStory ? `Como ${feature.userStory.role}, quero ${feature.userStory.goal}, para ${feature.userStory.benefit}.` : 'Ainda não há requisitos definidos.', meta: hasStory ? `${feature.criteria.length} critérios de aceitação` : null, warn: !hasStory },
    { icon: 'code', title: 'Implementação', body: `${featureStatus[feature.status].label}${feature.team ? ` na equipa ${feature.team}` : ''}${feature.sprint ? `, ${feature.sprint}` : ''}.`, meta: feature.release ? `Release ${feature.release}: ${feature.releaseObjective}` : 'Ainda sem release' },
  ]
  return (
    <Stack gap="lg">
      <Timeline bulletSize={30} lineWidth={2} active={hasStory ? 2 : 0}>
        {steps.map((s) => (
          <Timeline.Item key={s.title} bullet={<Icon name={s.icon} size={16} />} color={s.warn ? 'yellow' : 'stream'}
            title={<Text fw={600} size="sm">{s.title}</Text>}>
            <Text size="sm" mt={4}>{s.body}</Text>
            {s.meta && <Text size="xs" c="dimmed" mt={4}>{s.meta}</Text>}
          </Timeline.Item>
        ))}
      </Timeline>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Card>
          <Text size="sm" c="dimmed">Lead time · da submissão à entrega</Text>
          {feature.leadTime ? <Text fz={24} fw={600}>{feature.leadTime}</Text> : (
            <Group gap="xs" mt={6}><Badge color="stream">Em curso</Badge><Text size="sm" c="dimmed">Calculado na entrega</Text></Group>
          )}
        </Card>
        <Card>
          <Text size="sm" c="dimmed">Cycle time · do início do desenvolvimento à entrega</Text>
          {feature.status !== 'todo' && feature.cycleTime
            ? <Text fz={24} fw={600}>{feature.cycleTime} <Text span size="sm" c="dimmed">até agora</Text></Text>
            : <Text size="sm" c="dimmed" mt={6}>O desenvolvimento ainda não começou</Text>}
        </Card>
      </SimpleGrid>
    </Stack>
  )
}

const APPROVED_REQUEST = ['approved', 'planned', 'delivered']

function StoryEditor({ initial, draft, onSave, onCancel }) {
  const [story, setStory] = useState(initial)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  async function save() {
    const err = {}
    for (const k of ['role', 'goal', 'benefit']) if (!story[k].trim()) err[k] = 'Campo obrigatório'
    setErrors(err)
    if (Object.keys(err).length) return notifyError('Preenche o papel, o objetivo e o benefício.', 'User Story não guardada')
    setLoading(true)
    try {
      await onSave({ role: story.role, goal: story.goal, benefit: story.benefit })
      notifySuccess(draft ? 'Rascunho confirmado. A User Story ficou guardada.' : 'User Story guardada.')
    } catch (e) {

      if (e.field) setErrors({ [e.field]: e.message })
      notifyError(e.message, 'User Story não guardada')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={draft ? { borderColor: 'var(--mantine-color-violet-4)' } : undefined}>
      {draft && <Badge color="violet" mb="md" leftSection={<Icon name="auto_awesome" size={14} />}>Rascunho por confirmar</Badge>}
      <Stack>
        <TextInput label="Como…" withAsterisk value={story.role} error={errors.role} onChange={(e) => setStory({ ...story, role: e.currentTarget.value })} />
        <TextInput label="Quero…" withAsterisk value={story.goal} error={errors.goal} onChange={(e) => setStory({ ...story, goal: e.currentTarget.value })} />
        <TextInput label="Para…" withAsterisk value={story.benefit} error={errors.benefit} onChange={(e) => setStory({ ...story, benefit: e.currentTarget.value })} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>{draft ? 'Descartar' : 'Cancelar'}</Button>
          <Button loading={loading} onClick={save}>{draft ? 'Confirmar User Story' : 'Guardar'}</Button>
        </Group>
      </Stack>
    </Card>
  )
}

function Criteria({ items, editable, send }) {
  const [text, setText] = useState('')
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)

  async function run(method, suffix, body, message) {
    setBusy(true)
    try {
      await send(method, `/criteria${suffix}`, body)
      notifySuccess(message)
      return true
    } catch (e) {
      notifyError(e.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function add() {
    if (!text.trim()) return notifyError('Escreve o critério antes de o adicionar.')
    if (await run('POST', '', { text }, 'Critério de aceitação adicionado.')) setText('')
  }

  async function save() {
    if (!editing.text.trim()) return notifyError('O critério não pode ficar vazio.')
    if (await run('PATCH', `/${editing.id}`, { text: editing.text }, 'Critério atualizado.')) setEditing(null)
  }

  return (
    <Card>
      <Text fw={600} mb="md">Critérios de aceitação</Text>
      <Stack gap="sm">
        {items.map((c, i) => (
          <Group key={c.id} align="flex-start" wrap="nowrap" gap="sm">
            <Text size="sm" c="dimmed" w={20}>{i + 1}.</Text>
            {editing?.id === c.id ? (
              <Group style={{ flex: 1 }} wrap="nowrap" gap="xs">
                <TextInput style={{ flex: 1 }} value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.currentTarget.value })} aria-label="Editar critério" />
                <Button size="xs" loading={busy} onClick={save}>Guardar</Button>
                <Button size="xs" variant="default" onClick={() => setEditing(null)}>Cancelar</Button>
              </Group>
            ) : (
              <Text size="sm" style={{ flex: 1 }}>{c.text}</Text>
            )}
            {editable && editing?.id !== c.id && (
              <Group gap={2} wrap="nowrap">
                <ActionIcon variant="subtle" color="gray" aria-label="Editar critério" onClick={() => setEditing(c)}><Icon name="edit" size={18} /></ActionIcon>
                <ActionIcon variant="subtle" color="red" aria-label="Remover critério" disabled={busy}
                  onClick={() => run('DELETE', `/${c.id}`, undefined, 'Critério removido.')}>
                  <Icon name="delete" size={18} />
                </ActionIcon>
              </Group>
            )}
          </Group>
        ))}
        {items.length === 0 && <Text size="sm" c="dimmed">Ainda sem critérios.</Text>}
      </Stack>
      {editable && (
        <Group mt="md" gap="xs" wrap="nowrap">
          <TextInput style={{ flex: 1 }} placeholder="Dado… quando… então…" value={text} onChange={(e) => setText(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()} aria-label="Novo critério" />
          <Button variant="light" loading={busy} onClick={add}>Adicionar</Button>
        </Group>
      )}
    </Card>
  )
}

function StoryTab({ feature, storyData, editable, send }) {
  const { request, story, criteria } = storyData
  const [mode, setMode] = useState(null) // 'edit' | 'manual'

  const requestPending = request && !APPROVED_REQUEST.includes(request.status)

  async function save(values) {
    await send(story ? 'PATCH' : 'POST', '', values)
    setMode(null)
  }

  return (
    <Stack gap="lg">
      {feature.release && (
        <Text size="sm" c="dimmed">
          Objetivo da release {feature.release}: <Text span c="var(--mantine-color-text)" fw={500}>{feature.releaseObjective}</Text>
        </Text>
      )}
      {request && (
        <Text size="sm" c="dimmed">
          Pedido de origem: <Text span c="var(--mantine-color-text)" fw={500}>R-{request.id} · {request.title}</Text>
        </Text>
      )}
      {!story && !mode && (
        requestPending ? (
          <Alert color="yellow" variant="light" icon={<Icon name="warning" />} title="O pedido ainda não foi aprovado">
            <Text size="sm">A User Story só pode ser criada depois de o pedido R-{request.id} ser aprovado na análise de pedidos.</Text>
          </Alert>
        ) : (
          <Alert color="yellow" variant="light" icon={<Icon name="warning" />} title="Ainda não há requisitos definidos">
            <Text size="sm">Cria a User Story para que a equipa saiba exatamente o que desenvolver.</Text>
            {editable ? (
              <Group mt="md" gap="sm">
                <Button size="xs" variant="default" onClick={() => setMode('manual')}>Escrever manualmente</Button>
              </Group>
            ) : <Text size="sm" mt={4}>O Product Manager vai escrevê-la.</Text>}
          </Alert>
        )
      )}
      {mode === 'manual' && <StoryEditor initial={{ role: '', goal: '', benefit: '' }} onSave={save} onCancel={() => setMode(null)} />}
      {mode === 'edit' && <StoryEditor initial={story} onSave={save} onCancel={() => setMode(null)} />}
      {story && !mode && (
        <Card>
          <Group justify="space-between" mb="sm">
            <Text fw={600}>User Story</Text>
            {editable && <Button variant="subtle" size="xs" leftSection={<Icon name="edit" size={16} />} onClick={() => setMode('edit')}>Editar</Button>}
          </Group>
          <Text size="lg" lh={1.5}>
            Como <b>{story.role}</b>, quero <b>{story.goal}</b>, para <b>{story.benefit}</b>.
          </Text>
        </Card>
      )}
      {story && <Criteria items={criteria} editable={editable} send={send} />}
    </Stack>
  )
}

function statusColor(n) {
  if (n.late) return 'red'
  return featureStatus[n.status]?.color ?? 'gray'
}

function Dependencies({ feature, backlog, base }) {
  const scheme = useComputedColorScheme('light')
  const navigate = useNavigate()
  const deps = feature.dependencies
  const [edges, setEdges] = useState(deps.edges)
  const [choice, setChoice] = useState(null)
  const [error, setError] = useState(null)
  const [run, loading] = useAction()

  const nodes = deps.nodes.map((n) => ({
    id: n.id,
    position: { x: n.x, y: n.y },
    data: {
      label: (
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--mantine-font-family-monospace)', fontSize: 11, opacity: 0.7 }}>{n.id}{n.late ? ' · atrasada' : ''}</div>
          <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{n.title}</div>
        </div>
      ),
    },
    sourcePosition: 'right',
    targetPosition: 'left',
    style: {
      width: 220,
      borderRadius: 10,
      padding: 10,
      cursor: n.current ? 'default' : 'pointer',
      background: 'var(--mantine-color-body)',
      color: 'var(--mantine-color-text)',
      border: `${n.current ? 2 : 1}px solid var(--mantine-color-${statusColor(n)}-${n.current ? 6 : 4})`,
      boxShadow: n.current ? '0 0 0 4px var(--mantine-color-stream-light)' : 'none',
    },
  }))

  const flowEdges = edges.map((e) => {
    const late = deps.nodes.find((n) => n.id === e.from)?.late
    return {
      id: `${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      animated: late,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: `var(--mantine-color-${late ? 'red-5' : 'gray-5'})`, strokeWidth: 1.5 },
    }
  })

  function add() {
    if (!choice) return setError('Escolhe a funcionalidade de que esta depende.')
    if (deps.dependents.includes(choice)) {
      return setError(`${choice} já depende de ${feature.id}. Esta dependência criaria um ciclo e não foi guardada.`)
    }
    run(`${feature.id} passa a depender de ${choice}.`, () => { setEdges([...edges, { from: choice, to: feature.id }]); setChoice(null) })
  }

  function remove(edge) {
    setEdges(edges.filter((e) => e !== edge))
    notifySuccess(`Dependência entre ${edge.from} e ${edge.to} removida.`)
  }

  const options = backlog.filter((f) => f.id !== feature.id && !edges.some((e) => e.from === f.id && e.to === feature.id))
    .map((f) => ({ value: f.id, label: `${f.id} · ${f.title}` }))
  const mine = edges.filter((e) => e.to === feature.id || e.from === feature.id)

  return (
    <Stack gap="lg">
      <Card padding={0} h={340} style={{ overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={flowEdges}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          colorMode={scheme}
          nodesConnectable={false}
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, n) => n.id !== feature.id && navigate(`${base}/features/${n.id}`)}
        >
          <Background gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </Card>
      <Text size="xs" c="dimmed" mt={-8}>As setas apontam de uma funcionalidade para as que dependem dela. Clica num nó para o abrir.</Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Card>
          <Group gap="xs" mb="sm">
            <Icon name="warning" size={18} style={{ color: 'var(--mantine-color-red-6)' }} />
            <Text fw={600} size="sm">Afetado pelo atraso de F-302</Text>
          </Group>
          {[['Funcionalidades', deps.affected.features], ['Sprints', deps.affected.sprints], ['Releases', deps.affected.releases]].map(([label, list]) => (
            <div key={label} style={{ marginTop: 10 }}>
              <Text size="xs" c="dimmed">{label}</Text>
              {list.map((x) => <Text key={x} size="sm">{x}</Text>)}
            </div>
          ))}
        </Card>
        <Card>
          <Text fw={600} size="sm" mb="sm">Dependências</Text>
          <Stack gap={6} mb="md">
            {mine.map((e) => (
              <Group key={`${e.from}-${e.to}`} justify="space-between" wrap="nowrap">
                <Text size="sm">{e.to === feature.id ? `Depende de ${e.from}` : `${e.to} depende desta`}</Text>
                <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Remover dependência" onClick={() => remove(e)}>
                  <Icon name="close" size={16} />
                </ActionIcon>
              </Group>
            ))}
            {mine.length === 0 && <Text size="sm" c="dimmed">Esta funcionalidade não tem dependências.</Text>}
          </Stack>
          <Select placeholder={`${feature.id} depende de…`} data={options} searchable value={choice}
            onChange={(v) => { setChoice(v); setError(null) }} aria-label="Funcionalidade de que depende" />
          {error && <Alert color="red" variant="light" mt="sm" icon={<Icon name="error" />}>{error}</Alert>}
          <Button fullWidth mt="sm" variant="light" loading={loading} onClick={add}>Adicionar dependência</Button>
        </Card>
      </SimpleGrid>
    </Stack>
  )
}

const memberNames = ['rui', 'beatriz', 'tiago', 'daniel', 'leonor', 'inês', 'ines', 'miguel', 'joana']

function checkMentions(text) {
  const mentions = [...text.matchAll(/@([\p{L}]+)/gu)].map((m) => m[1])
  return mentions.find((m) => !memberNames.includes(m.toLowerCase()))
}

function Composer({ placeholder, submitLabel, onSubmit, onCancel, compact }) {
  const [text, setText] = useState('')
  const [error, setError] = useState(null)
  const [run, loading] = useAction()

  function submit() {
    if (!text.trim()) return setError('Escreve alguma coisa antes de enviar.')
    const unknown = checkMentions(text)
    if (unknown) return setError(`Não encontrámos "@${unknown}" na equipa. Corrige a menção; nenhuma notificação foi enviada.`)
    run(text.includes('@') ? 'Comentário publicado. As pessoas mencionadas foram notificadas.' : 'Comentário publicado.', () => {
      onSubmit(text)
      setText('')
    })
  }

  return (
    <Stack gap="xs">
      <Textarea autosize minRows={compact ? 1 : 2} placeholder={placeholder} value={text} error={error}
        onChange={(e) => { setText(e.currentTarget.value); setError(null) }} aria-label={placeholder} />
      <Group justify="flex-end" gap="xs">
        {onCancel && <Button size="xs" variant="default" onClick={onCancel}>Cancelar</Button>}
        <Button size="xs" loading={loading} onClick={submit}>{submitLabel}</Button>
      </Group>
    </Stack>
  )
}

function Discussion({ feature, canDecide }) {
  const [comments, setComments] = useState(feature.comments)
  const [decision, setDecision] = useState(feature.officialDecision)
  const [replyTo, setReplyTo] = useState(null)

  function addComment(text) {
    setComments([...comments, { id: `k${Date.now()}`, author: 'Inês Carvalho', initials: 'IC', date: 'agora', text, replies: [], mine: true }])
  }

  function addReply(commentId, text) {
    setComments(comments.map((c) => (c.id === commentId
      ? { ...c, replies: [...c.replies, { id: `r${Date.now()}`, author: 'Inês Carvalho', initials: 'IC', date: 'agora', text }] }
      : c)))
    setReplyTo(null)
  }

  function remove(id) {
    setComments(comments.filter((c) => c.id !== id))
    notifySuccess('Comentário apagado.')
  }

  return (
    <Stack gap="lg">
      {decision && (
        <Paper p="md" withBorder style={{ borderColor: 'var(--mantine-color-teal-5)', background: 'var(--mantine-color-teal-light)' }}>
          <Group justify="space-between" mb={4}>
            <Group gap="xs">
              <Icon name="push_pin" size={18} filled style={{ color: 'var(--mantine-color-teal-7)' }} />
              <Text size="sm" fw={600}>Decisão oficial</Text>
            </Group>
            {canDecide && (
              <Button variant="subtle" color="gray" size="compact-xs" onClick={() => { setDecision(null); notifySuccess('Decisão oficial removida.') }}>Desafixar</Button>
            )}
          </Group>
          <Text size="sm">{decision.text}</Text>
          <Text size="xs" c="dimmed" mt={6}>{decision.author} · {decision.date}</Text>
        </Paper>
      )}
      {comments.map((c) => (
        <Card key={c.id}>
          <Group gap="sm" align="flex-start" wrap="nowrap">
            <Avatar size={32} radius="xl" color="stream">{c.initials}</Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs"><Text size="sm" fw={600}>{c.author}</Text><Text size="xs" c="dimmed">{c.date}</Text></Group>
                {c.mine && (
                  <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Apagar comentário" onClick={() => remove(c.id)}>
                    <Icon name="delete" size={16} />
                  </ActionIcon>
                )}
              </Group>
              <Text size="sm" mt={2}>{c.text}</Text>
              <Stack gap="sm" mt="sm" pl="md" style={{ borderLeft: '2px solid var(--ws-border)' }}>
                {c.replies.map((r) => (
                  <Group key={r.id} gap="sm" align="flex-start" wrap="nowrap">
                    <Avatar size={26} radius="xl" color="teal">{r.initials}</Avatar>
                    <div style={{ flex: 1 }}>
                      <Group gap="xs">
                        <Text size="sm" fw={600}>{r.author}</Text>
                        <Text size="xs" c="dimmed">{r.date}</Text>
                        {decision?.text === r.text && <Badge size="xs" color="teal">Decisão oficial</Badge>}
                      </Group>
                      <Text size="sm">{r.text}</Text>
                      {canDecide && r.author === 'Inês Carvalho' && decision?.text !== r.text && (
                        <Button variant="subtle" size="compact-xs" mt={4} leftSection={<Icon name="push_pin" size={14} />}
                          onClick={() => { setDecision({ author: r.author, date: r.date, text: r.text }); notifySuccess('Resposta fixada como decisão oficial. Toda a equipa a vê na User Story.') }}>
                          Fixar como decisão oficial
                        </Button>
                      )}
                    </div>
                  </Group>
                ))}
                {replyTo === c.id ? (
                  <Composer compact placeholder="Escreve a resposta" submitLabel="Responder" onSubmit={(t) => addReply(c.id, t)} onCancel={() => setReplyTo(null)} />
                ) : (
                  <Button variant="subtle" size="compact-sm" w="fit-content" leftSection={<Icon name="reply" size={16} />} onClick={() => setReplyTo(c.id)}>
                    Responder
                  </Button>
                )}
              </Stack>
            </div>
          </Group>
        </Card>
      ))}
      <Card>
        <Text fw={600} size="sm" mb="xs">Nova dúvida ou comentário</Text>
        <Composer placeholder="Escreve @ e o nome para mencionar alguém (ex.: @Rui)" submitLabel="Comentar" onSubmit={addComment} />
      </Card>
    </Stack>
  )
}

function History({ feature }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
      <Card>
        <Text fw={600} mb="md">Versões dos requisitos</Text>
        <Timeline active={0} bulletSize={22}>
          {feature.history.map((h) => (
            <Timeline.Item key={h.version} title={<Text size="sm" fw={500}>{h.version} · {h.change}</Text>}>
              <Text size="xs" c="dimmed">{h.author} · {h.date}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
      <Card>
        <Text fw={600} mb="md">Mudanças de estado</Text>
        <Timeline active={0} bulletSize={22}>
          {feature.statusLog.map((s) => (
            <Timeline.Item key={`${s.changedAt}-${s.status}`} title={<Text size="sm" fw={500}>{featureStatus[s.status].label}</Text>}>
              <Text size="xs" c="dimmed">{s.changedBy} · {formatDate(s.changedAt)}</Text>
            </Timeline.Item>
          ))}
          {feature.statusLog.length === 0 && <Text size="sm" c="dimmed">Ainda sem mudanças de estado.</Text>}
        </Timeline>
      </Card>
    </SimpleGrid>
  )
}

// ---------- Cabeçalho editável ----------
function EditableHeader({ feature, editable, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ title: feature.title, description: feature.description })
  const [run, loading] = useAction()

  if (editing) {
    return (
      <Stack gap="sm" style={{ flex: '1 1 400px' }}>
        <TextInput size="md" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.currentTarget.value })} aria-label="Título" data-autofocus />
        <Textarea autosize minRows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.currentTarget.value })} aria-label="Descrição" />
        <Group gap="xs">
          <Button size="xs" loading={loading} onClick={() => {
            if (!draft.title.trim()) return notifyError('O título não pode ficar vazio.')
            run('Funcionalidade atualizada. A versão anterior ficou no histórico.', () => { onChange(draft); setEditing(false) })
          }}>Guardar</Button>
          <Button size="xs" variant="default" onClick={() => setEditing(false)}>Cancelar</Button>
        </Group>
      </Stack>
    )
  }

  return (
    <div style={{ flex: '1 1 400px', minWidth: 0 }}>
      <Group gap="xs" wrap="nowrap" align="flex-start">
        <Title order={1} size="h2">{feature.title}</Title>
        {editable && (
          <Tooltip label="Editar título e descrição">
            <ActionIcon variant="subtle" color="gray" mt={4} aria-label="Editar título e descrição"
              onClick={() => { setDraft({ title: feature.title, description: feature.description }); setEditing(true) }}>
              <Icon name="edit" size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      <Text c="dimmed" mt={6} maw={720}>{feature.description}</Text>
    </div>
  )
}

export default function FeatureDetail() {
  const { featureId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { role, base, productId } = useProduct()

  const { data, loading } = useData((s) => ({
    detail: s.featureDetail, backlog: s.backlog,
  }))

  const featureApi = useApi(`/products/${productId}/features/${featureId}`)

  const storyPath = `/products/${productId}/features/${featureId}/story`
  const storyApi = useApi(storyPath)
  const [storyUpdated, setStoryUpdated] = useState(null)
  const [updated, setUpdated] = useState(null)
  const [changing, setChanging] = useState(false)
  const [overrides, setOverrides] = useState({})
  const [archiveOpened, archiveModal] = useDisclosure(false)
  const [runArchive, archiving] = useAction()

  if (loading || featureApi.loading || storyApi.loading) return <PageLoader rows={2} />

  if (featureApi.error) {
    return (
      <Card>
        <Empty icon="search_off" title="Funcionalidade não encontrada" description={featureApi.error.message}>
          <Button component={Link} to={`${base}/sprints`} variant="light">Voltar ao board</Button>
        </Empty>
      </Card>
    )
  }

  const f = updated ?? featureApi.data
  const feature = {
    ...data.detail,
    id: f.id,
    title: f.title,
    description: f.description ?? 'Sem descrição.',
    storyPoints: f.storyPoints,
    team: f.teamName,
    assignee: f.assigneeId,
    ...overrides,
    status: f.status,
    allowedStatuses: f.allowedStatuses,
    canChangeStatus: f.canChangeStatus,
    statusLog: f.statusLog,
  }

  const storyData = storyUpdated ?? storyApi.data ?? { request: null, story: null, criteria: [] }
  feature.userStory = storyData.story
  feature.criteria = storyData.criteria
  const hasStory = Boolean(storyData.story)
  const nextStatus = f.nextStatus
  const canEdit = can(role, 'editFeature')


  async function sendStory(method, suffix, body) {
    setStoryUpdated(await api(`${storyPath}${suffix}`, { method, body }))
  }

  async function changeStatus(status) {
    setChanging(true)
    try {
      setUpdated(await api(`/products/${productId}/features/${featureId}/status`, { method: 'PATCH', body: { status } }))
      notifySuccess(`Estado alterado para "${featureStatus[status].label}". Registado com data e autor.`)
    } catch (error) {
      notifyError(error.message, error.status === 403 ? 'Acesso negado' : 'Não foi possível mudar o estado')
    } finally {
      setChanging(false)
    }
  }

  return (
    <>
      <Breadcrumbs mb="md" separator={<Icon name="chevron_right" size={16} />}>
        <Anchor component={Link} to={`${base}/backlog`} size="sm">Backlog</Anchor>
        <Text size="sm" c="dimmed" ff="monospace">{feature.id}</Text>
      </Breadcrumbs>

      <Group justify="space-between" align="flex-start" mb="xl" gap="md">
        <EditableHeader key={feature.id} feature={feature} editable={canEdit} onChange={(d) => setOverrides({ ...overrides, ...d })} />
        <Group gap="xs">
          {feature.canChangeStatus && nextStatus && (
            <Button rightSection={<Icon name="arrow_forward" size={18} />} loading={changing} onClick={() => changeStatus(nextStatus)}>
              Passar a {featureStatus[nextStatus].label}
            </Button>
          )}
          <Menu position="bottom-end" width={220}>
            <Menu.Target>
              <ActionIcon variant="default" size="lg" aria-label="Mais ações"><Icon name="more_horiz" size={20} /></ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Icon name="link" size={18} />}
                onClick={() => { navigator.clipboard?.writeText(window.location.href); notifySuccess('Link copiado.') }}>
                Copiar link
              </Menu.Item>
              <Menu.Item leftSection={<Icon name="view_kanban" size={18} />} component={Link} to={`${base}/sprints`}>Ver no board</Menu.Item>
              {canEdit && (
                <>
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<Icon name="archive" size={18} />} onClick={archiveModal.open}>Arquivar</Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
          <Tabs defaultValue={searchParams.get('tab') ?? 'trace'} keepMounted={false}>
            <Tabs.List mb="lg">
              <Tabs.Tab value="trace" leftSection={<Icon name="account_tree" size={18} />}>Rastreabilidade</Tabs.Tab>
              <Tabs.Tab value="story" leftSection={<Icon name="description" size={18} />}
                rightSection={!hasStory && <span style={{ width: 6, height: 6, borderRadius: 9, background: 'var(--mantine-color-yellow-6)' }} />}>
                User Story
              </Tabs.Tab>
              <Tabs.Tab value="deps" leftSection={<Icon name="hub" size={18} />}>Dependências</Tabs.Tab>
              <Tabs.Tab value="talk" leftSection={<Icon name="forum" size={18} />}
                rightSection={<Badge size="xs" variant="light" circle>{feature.comments.length}</Badge>}>Discussão</Tabs.Tab>
              <Tabs.Tab value="history" leftSection={<Icon name="history" size={18} />}>Histórico</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="trace"><Traceability feature={feature} hasStory={hasStory} /></Tabs.Panel>
            <Tabs.Panel value="story"><StoryTab feature={feature} storyData={storyData} editable={can(role, 'story')} send={sendStory} /></Tabs.Panel>
            <Tabs.Panel value="deps"><Dependencies feature={feature} backlog={data.backlog} base={base} /></Tabs.Panel>
            <Tabs.Panel value="talk"><Discussion feature={feature} canDecide={can(role, 'decision')} /></Tabs.Panel>
            <Tabs.Panel value="history"><History feature={feature} /></Tabs.Panel>
          </Tabs>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
          <Card style={{ position: 'sticky', top: 24 }}>
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Propriedades</Text>
              <StatusBadge status={feature.status} kind="feature" size="sm" />
            </Group>
            <FeatureProperties feature={feature} role={role} base={base} onChange={(changes) => setOverrides({ ...overrides, ...changes })} onStatusChange={changeStatus} />
          </Card>
        </Grid.Col>
      </Grid>

      <Modal opened={archiveOpened} onClose={archiveModal.close} title="Arquivar funcionalidade">
        <Stack>
          <Text size="sm">
            {feature.id} sai do backlog, do sprint e da release. Os pedidos de clientes ligados a ela continuam visíveis.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={archiveModal.close}>Cancelar</Button>
            <Button color="red" loading={archiving}
              onClick={() => runArchive(`${feature.id} arquivada.`, () => navigate(`${base}/backlog`))}>Arquivar</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}