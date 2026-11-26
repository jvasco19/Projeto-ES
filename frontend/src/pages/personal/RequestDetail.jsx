import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Anchor, Breadcrumbs, Button, Card, Grid, Group, Modal, Stack, Text, TextInput, Textarea, Timeline, Title, UnstyledButton } from '@mantine/core'
import { Icon } from '../../components/Icon.jsx'
import { Empty, PageLoader, StatusBadge } from '../../components/ui.jsx'
import { useApi } from '../../data/useApi.js'
import { notifyError, useAction } from '../../lib/feedback.jsx'
import { requestStatus } from '../../lib/labels.js'
import { formatDate } from '../../lib/format.js'
import { openAttachment } from '../../lib/api.js'

function EditModal({ request, onClose, onSave }) {
  const [form, setForm] = useState({ title: request.title, description: request.description })
  const [run, loading] = useAction()
  return (
    <Modal opened onClose={onClose} title="Editar pedido">
      <Stack>
        <TextInput label="Título" withAsterisk value={form.title} onChange={(e) => setForm({ ...form, title: e.currentTarget.value })} />
        <Textarea label="Descrição" withAsterisk autosize minRows={3} value={form.description}
          onChange={(e) => setForm({ ...form, description: e.currentTarget.value })} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button loading={loading} onClick={() => (!form.title.trim() || !form.description.trim()
            ? notifyError('O título e a descrição são obrigatórios.')
            : run('Pedido atualizado.', () => { onSave(form); onClose() }))}>Guardar</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default function RequestDetail() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  // 403 (pedido de outro cliente), 404 ou 400 deixam data a null e mostram "Acesso negado"
  const { data, loading } = useApi(`/me/requests/${requestId}`)
  const [edits, setEdits] = useState(null)
  const [modal, setModal] = useState(null)
  const [runWithdraw, withdrawing] = useAction()

  if (loading) return <PageLoader rows={1} />
  const request = data && { ...data, ...edits }

  if (!request) {
    return (
      <Card>
        <Empty icon="lock" title="Acesso negado" description="Este pedido não pertence à tua conta. Só podes acompanhar os pedidos que enviaste.">
          <Button component={Link} to="/me" variant="light">Ver os meus pedidos</Button>
        </Empty>
      </Card>
    )
  }

  const lastDone = request.timeline.filter((t) => t.date).length - 1

  return (
    <>
      <Breadcrumbs mb="md" separator={<Icon name="chevron_right" size={16} />}>
        <Anchor component={Link} to="/me" size="sm">Os meus pedidos</Anchor>
        <Text size="sm" c="dimmed">R-{request.id}</Text>
      </Breadcrumbs>

      <Group justify="space-between" align="flex-start" mb="xl">
        <div style={{ flex: '1 1 400px' }}>
          <Title order={1} size="h2">{request.title}</Title>
          <Text c="dimmed" mt={6}>{request.productName} · enviado a {formatDate(request.createdAt)}</Text>
        </div>
        <Group gap="sm">
          {request.status === 'submitted' && (
            <>
              <Button variant="default" leftSection={<Icon name="edit" size={18} />} onClick={() => setModal('edit')}>Editar</Button>
              <Button variant="subtle" color="red" onClick={() => setModal('withdraw')}>Retirar pedido</Button>
            </>
          )}
          <StatusBadge status={request.status} size="lg" />
        </Group>
      </Group>
      {request.status === 'submitted' && (
        <Text size="sm" c="dimmed" mt={-16} mb="lg">Podes editar ou retirar o pedido até a equipa o começar a analisar.</Text>
      )}
      {modal === 'edit' && <EditModal request={request} onClose={() => setModal(null)} onSave={setEdits} />}
      <Modal opened={modal === 'withdraw'} onClose={() => setModal(null)} title="Retirar pedido">
        <Stack>
          <Text size="sm">O pedido deixa de ser analisado pela equipa. Os votos de outros clientes também são removidos.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModal(null)}>Cancelar</Button>
            <Button color="red" loading={withdrawing} onClick={() => runWithdraw('Pedido retirado.', () => navigate('/me'))}>Retirar pedido</Button>
          </Group>
        </Stack>
      </Modal>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="lg">
            {request.status === 'rejected' && (
              <Alert color="red" variant="light" icon={<Icon name="info" />} title="Motivo da rejeição">
                {request.rejectionReason}
              </Alert>
            )}
            {request.release && (
              <Alert color="stream" variant="light" icon={<Icon name="rocket_launch" />} title="Release">
                {request.release}
              </Alert>
            )}
            <Card>
              <Text fw={600} mb="xs">O teu pedido</Text>
              <Text>{request.description}</Text>
              {request.attachments.length > 0 && (
                <Group gap="xs" mt="md">
                  {request.attachments.map((a) => (
                    <UnstyledButton
                      key={a.id}
                      onClick={() => openAttachment(a.id, a.fileName).catch((e) => notifyError(e.message))}
                      title={`Abrir ${a.fileName}`}
                    >
                      <Group gap={6} px="sm" py={4} style={{ border: '1px solid var(--ws-border)', borderRadius: 8 }}>
                        <Icon name="attach_file" size={16} />
                        <Text size="sm">{a.fileName}</Text>
                      </Group>
                    </UnstyledButton>
                  ))}
                </Group>
              )}
              <Group gap={6} mt="md" c="dimmed">
                <Icon name="thumb_up" size={16} />
                <Text size="sm">{request.votes ?? 0} clientes apoiam este pedido</Text>
              </Group>
            </Card>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card>
            <Text fw={600} mb="md">Percurso</Text>
            <Timeline active={lastDone} bulletSize={26} lineWidth={2}>
              {request.timeline.map((t) => {
                const info = requestStatus[t.status]
                return (
                  <Timeline.Item
                    key={t.status}
                    bullet={<Icon name={info.icon} size={15} />}
                    color={t.status === 'rejected' ? 'red' : 'stream'}
                    title={<Text size="sm" fw={500} c={t.date ? undefined : 'dimmed'}>{info.label}</Text>}
                  >
                    <Text size="xs" c="dimmed">{t.date ? formatDate(t.date) : 'Ainda não aconteceu'}</Text>
                  </Timeline.Item>
                )
              })}
            </Timeline>
            <Button component={Link} to={`/me/roadmap/${request.productId}`} variant="light" fullWidth mt="lg"
              leftSection={<Icon name="timeline" size={18} />}>
              Ver roadmap de {request.productName}
            </Button>
            <Button component={Link} to={`/me/products/${request.productId}`} variant="subtle" fullWidth mt="xs">
              Ver outros pedidos de {request.productName}
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </>
  )
}