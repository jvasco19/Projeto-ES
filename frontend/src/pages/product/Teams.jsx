import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ActionIcon, Avatar, Button, Card, Group, Menu, Modal, NumberInput, Progress, Select, SimpleGrid, Stack, Table, Tabs, Text,
  TextInput, Tooltip,
} from '@mantine/core'
import { Icon } from '../../components/Icon.jsx'
import { Empty, PageHeader, PageLoader } from '../../components/ui.jsx'
import { useApi } from '../../data/useApi.js'
import { api } from '../../lib/api.js'
import { getUser } from '../../lib/auth.js'
import { notifyError, notifySuccess } from '../../lib/feedback.jsx'
import { can, roleLabels } from '../../lib/labels.js'
import { useProduct } from '../../lib/useProduct.js'

const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({ value, label }))

// Iniciais a partir do nome (a API não as devolve)
function initials(name = '') {
  return name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

// Erro de um campo (400/404/409 com field) fica no formulário; os outros vão para uma notificação
function showError(e, setFieldError) {
  if (e.field && setFieldError) setFieldError(e.field, e.message)
  else notifyError(e.message)
}

function InviteModal({ onClose, teams, onInvite }) {
  const [form, setForm] = useState({ email: '', role: 'developer', teamId: null })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setErrors({ email: 'Introduz um email válido' })
    setLoading(true)
    try {
      await onInvite(form)
      onClose()
    } catch (e) {
      showError(e, (field, message) => setErrors({ [field]: message }))
      setLoading(false)
    }
  }

  return (
    <Modal opened onClose={onClose} title="Convidar para o produto">
      <Stack>
        <TextInput label="Email" withAsterisk value={form.email} error={errors.email} data-autofocus
          description="A pessoa tem de já ter conta no Workstream."
          onChange={(e) => { setForm({ ...form, email: e.currentTarget.value }); setErrors({}) }} />
        <Select label="Papel" data={roleOptions} value={form.role} onChange={(v) => setForm({ ...form, role: v })} allowDeselect={false}
          error={errors.role} description="Define o que a pessoa pode ver e fazer neste produto." />
        <Select label="Equipa" placeholder="Sem equipa por agora" clearable error={errors.teamId}
          data={teams.map((t) => ({ value: t.id, label: t.name }))} value={form.teamId}
          onChange={(v) => setForm({ ...form, teamId: v })} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button loading={loading} onClick={send}>Enviar convite</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function TeamModal({ team, onClose, onSave }) {
  const [form, setForm] = useState(team ? { name: team.name, capacity: team.capacity } : { name: '', capacity: 30 })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  async function save() {
    if (!form.name.trim()) return setErrors({ name: 'Dá um nome à equipa' })
    setLoading(true)
    try {
      await onSave({ name: form.name.trim(), capacity: Number(form.capacity) || 0 })
      onClose()
    } catch (e) {
      showError(e, (field, message) => setErrors({ [field]: message }))
      setLoading(false)
    }
  }

  return (
    <Modal opened onClose={onClose} title={team ? `Editar ${team.name}` : 'Nova equipa'}>
      <Stack>
        <TextInput label="Nome" withAsterisk value={form.name} error={errors.name} data-autofocus
          onChange={(e) => { setForm({ ...form, name: e.currentTarget.value }); setErrors({}) }} />
        <NumberInput label="Capacidade por sprint" suffix=" pts" min={1} value={form.capacity} error={errors.capacity}
          onChange={(v) => setForm({ ...form, capacity: v })}
          description="Usada para avisar quando a equipa fica sobrecarregada." />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button loading={loading} onClick={save}>{team ? 'Guardar' : 'Criar equipa'}</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function TeamCard({ team, members, canManage, onEdit, onDelete, onAdd, onRemove }) {
  const ratio = team.capacity > 0 ? team.load / team.capacity : 0
  const full = team.capacity > 0 && team.load >= team.capacity
  const outside = members.filter((m) => m.teamId !== team.id)
  return (
    <Card>
      <Group justify="space-between" wrap="nowrap">
        <Text fw={600}>{team.name}</Text>
        <Group gap={4} wrap="nowrap">
          <Text size="sm" c={full ? 'red' : 'dimmed'} fw={full ? 600 : 400}>{team.load} / {team.capacity} pts</Text>
          {canManage && (
            <Menu position="bottom-end">
              <Menu.Target><ActionIcon variant="subtle" color="gray" aria-label={`Ações da equipa ${team.name}`}><Icon name="more_vert" size={18} /></ActionIcon></Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<Icon name="edit" size={18} />} onClick={onEdit}>Editar nome e capacidade</Menu.Item>
                <Menu.Item color="red" leftSection={<Icon name="delete" size={18} />} onClick={onDelete}>Apagar equipa</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>
      <Progress value={Math.min(ratio, 1) * 100} color={full ? 'red' : ratio > 0.85 ? 'yellow' : 'stream'} mt="sm" mb="lg" />
      <Stack gap="sm">
        {team.members.map((m) => (
          <Group key={m.id} justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
              <Avatar size={30} radius="xl" color="stream">{initials(m.name)}</Avatar>
              <div style={{ minWidth: 0 }}>
                <Text size="sm" truncate>{m.name}</Text>
                <Text size="xs" c="dimmed">{roleLabels[m.role]}</Text>
              </div>
            </Group>
            {canManage && (
              <Tooltip label="Retirar da equipa">
                <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Retirar ${m.name} da equipa`} onClick={() => onRemove(m)}>
                  <Icon name="close" size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        ))}
        {team.members.length === 0 && <Text size="sm" c="dimmed">Ainda sem membros.</Text>}
      </Stack>
      {canManage && (
        <Menu position="bottom-start" width={240}>
          <Menu.Target>
            <Button variant="subtle" size="xs" mt="md" leftSection={<Icon name="person_add" size={16} />}>Adicionar membro</Button>
          </Menu.Target>
          <Menu.Dropdown>
            {outside.length === 0 && <Text size="xs" c="dimmed" px="sm" py={6}>Todos os membros já estão nesta equipa.</Text>}
            {outside.map((m) => (
              <Menu.Item key={m.id} leftSection={<Avatar size={22} radius="xl" color="stream">{initials(m.name)}</Avatar>} onClick={() => onAdd(m)}>
                <Text size="sm">{m.name}</Text>
                <Text size="xs" c="dimmed">{m.teamName ? `Sai da equipa ${m.teamName}` : 'Sem equipa'}</Text>
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
    </Card>
  )
}

export default function Teams() {
  const [params, setParams] = useSearchParams()
  const { role, productId } = useProduct()
  const teamsApi = useApi(`/products/${productId}/teams`)
  const membersApi = useApi(`/products/${productId}/members`)
  // Depois de cada alteração os dados são recarregados para aqui (sem voltar a mostrar o "a carregar")
  const [teams, setTeams] = useState(null)
  const [members, setMembers] = useState(null)
  const [modal, setModal] = useState(params.get('criar') ?? null) // 'equipa' | 'convite' | team
  const [tab, setTab] = useState(params.get('criar') === 'convite' ? 'membros' : 'equipas')

  if (teamsApi.loading || membersApi.loading) return <PageLoader rows={1} />
  if (teamsApi.error || membersApi.error) {
    return (
      <Card>
        <Empty icon="lock" title="Não foi possível carregar as equipas"
          description={(teamsApi.error ?? membersApi.error).message} />
      </Card>
    )
  }

  const canManage = can(role, 'teams')
  const myId = String(getUser()?.id ?? '')
  const memberList = members ?? membersApi.data
  // As pessoas de cada equipa vêm da lista de membros (teamId), para os dois separadores mostrarem o mesmo
  const teamList = (teams ?? teamsApi.data).map((t) => ({ ...t, members: memberList.filter((m) => m.teamId === t.id) }))

  async function refresh() {
    const [newTeams, newMembers] = await Promise.all([
      api(`/products/${productId}/teams`),
      api(`/products/${productId}/members`),
    ])
    setTeams(newTeams)
    setMembers(newMembers)
  }

  // Executa uma alteração na API, recarrega os dados e mostra a mensagem de sucesso
  async function change(request, successMessage) {
    try {
      await request()
      await refresh()
      notifySuccess(successMessage)
    } catch (e) {
      notifyError(e.message)
    }
  }

  function closeModal() {
    setModal(null)
    if (params.get('criar')) setParams({}, { replace: true })
  }

  function setMemberTeam(m, team) {
    change(
      () => api(`/products/${productId}/members/${m.id}`, { method: 'PATCH', body: { teamId: team?.id ?? null } }),
      team ? `${m.name} passa a fazer parte da equipa ${team.name}.` : `${m.name} saiu da equipa.`
    )
  }

  return (
    <>
      <PageHeader
        title="Equipas"
        description="Quem trabalha no produto, com que papel e em que equipa. As funcionalidades são atribuídas a uma equipa e, dentro dela, a um developer."
        actions={canManage && (
          <>
            <Button variant="default" leftSection={<Icon name="group_add" size={18} />} onClick={() => setModal('equipa')}>Nova equipa</Button>
            <Button leftSection={<Icon name="person_add" size={18} />} onClick={() => setModal('convite')}>Convidar</Button>
          </>
        )}
      />

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="equipas" leftSection={<Icon name="groups" size={18} />}>Equipas ({teamList.length})</Tabs.Tab>
          <Tabs.Tab value="membros" leftSection={<Icon name="badge" size={18} />}>Membros ({memberList.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="equipas">
          {teamList.length === 0 ? (
            <Card>
              <Empty icon="groups" title="Ainda não há equipas" description="Cria uma equipa para poderes atribuir-lhe funcionalidades.">
                {canManage && <Button onClick={() => setModal('equipa')}>Criar equipa</Button>}
              </Empty>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="lg">
              {teamList.map((t) => (
                <TeamCard key={t.id} team={t} members={memberList} canManage={canManage}
                  onEdit={() => setModal(t)}
                  onDelete={() => change(
                    () => api(`/products/${productId}/teams/${t.id}`, { method: 'DELETE' }),
                    `Equipa ${t.name} apagada. As funcionalidades dela ficaram por atribuir.`
                  )}
                  onAdd={(m) => setMemberTeam(m, t)}
                  onRemove={(m) => setMemberTeam(m, null)} />
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="membros">
          <Card padding={0}>
            <Table.ScrollContainer minWidth={720}>
              <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr><Table.Th>Pessoa</Table.Th><Table.Th w={210}>Papel</Table.Th><Table.Th w={170}>Equipa</Table.Th><Table.Th w={50} /></Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {memberList.map((m) => {
                    const isMe = String(m.id) === myId
                    return (
                      <Table.Tr key={m.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <Avatar size={30} radius="xl" color={isMe ? 'teal' : 'stream'}>{initials(m.name)}</Avatar>
                            <div>
                              <Text size="sm">{m.name}{isMe ? ' (tu)' : ''}</Text>
                              <Text size="xs" c="dimmed">{m.email}</Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Select size="xs" data={roleOptions} value={m.role} allowDeselect={false} disabled={!canManage || isMe}
                            aria-label={`Papel de ${m.name}`}
                            onChange={(v) => change(
                              () => api(`/products/${productId}/members/${m.id}`, { method: 'PATCH', body: { role: v } }),
                              `${m.name} passa a ${roleLabels[v]}. As permissões foram atualizadas.`
                            )} />
                        </Table.Td>
                        <Table.Td>
                          <Select size="xs" placeholder="Sem equipa" clearable disabled={!canManage}
                            data={teamList.map((t) => ({ value: t.id, label: t.name }))} value={m.teamId}
                            aria-label={`Equipa de ${m.name}`}
                            onChange={(v) => setMemberTeam(m, teamList.find((t) => t.id === v) ?? null)} />
                        </Table.Td>
                        <Table.Td>
                          {canManage && !isMe && (
                            <Menu position="bottom-end">
                              <Menu.Target><ActionIcon variant="subtle" color="gray" aria-label={`Ações para ${m.name}`}><Icon name="more_vert" size={18} /></ActionIcon></Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item color="red" leftSection={<Icon name="person_remove" size={18} />}
                                  onClick={() => change(
                                    () => api(`/products/${productId}/members/${m.id}`, { method: 'DELETE' }),
                                    `${m.name} foi removido do produto. As funcionalidades dele ficaram sem responsável.`
                                  )}>
                                  Remover do produto
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    )
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {modal === 'convite' && (
        <InviteModal onClose={closeModal} teams={teamList}
          onInvite={async (form) => {
            const member = await api(`/products/${productId}/members`, { method: 'POST', body: form })
            await refresh()
            notifySuccess(`${member.name} foi adicionado ao produto.`)
          }} />
      )}
      {(modal === 'equipa' || typeof modal === 'object') && modal && (
        <TeamModal team={modal === 'equipa' ? null : modal} onClose={closeModal}
          onSave={async (form) => {
            if (modal === 'equipa') {
              await api(`/products/${productId}/teams`, { method: 'POST', body: form })
              notifySuccess(`Equipa "${form.name}" criada.`)
            } else {
              await api(`/products/${productId}/teams/${modal.id}`, { method: 'PATCH', body: form })
              notifySuccess('Equipa atualizada.')
            }
            await refresh()
          }} />
      )}
    </>
  )
} 