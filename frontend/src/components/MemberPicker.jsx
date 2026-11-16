import { Avatar, Group, Menu, Text, Tooltip, UnstyledButton } from '@mantine/core'
// Componente de interface: lê a lista de membros diretamente da store.
import { productMembers, user } from '../data/mockData.js'
import { memberById } from '../lib/members.js'
import { Icon } from './Icon.jsx'

export function MemberAvatar({ id, size = 24 }) {
  const m = memberById(id)
  if (!m) {
    return (
      <Avatar size={size} radius="xl" variant="outline" color="gray" style={{ borderStyle: 'dashed' }}>
        <Icon name="person_add" size={size * 0.6} />
      </Avatar>
    )
  }
  return <Avatar size={size} radius="xl" color={m.id === user.id ? 'teal' : 'stream'}>{m.initials}</Avatar>
}

// Escolher o responsável de uma funcionalidade.
// - canAssignOthers (Project Manager):escolhe qualquer membro da equipa
// - canSelfAssign (Developer): atribui-se a si próprio ou remove-se
export function MemberPicker({ value, team, onChange, canAssignOthers, canSelfAssign, variant = 'avatar', size = 24 }) {
  const current = memberById(value)
  const options = productMembers.filter((m) => !team || m.team === team)
  const enabled = canAssignOthers || canSelfAssign

  const target =
    variant === 'avatar' ? (
      <UnstyledButton
        aria-label={current ? `Responsável: ${current.name}` : 'Atribuir responsável'}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: 99, cursor: enabled ? 'pointer' : 'default' }}
      >
        <MemberAvatar id={value} size={size} />
      </UnstyledButton>
    ) : (
      <UnstyledButton
        className="row-link"
        px={8}
        py={4}
        style={{ borderRadius: 8, width: '100%', cursor: enabled ? 'pointer' : 'default' }}
        aria-label="Responsável"
      >
        <Group gap={8} wrap="nowrap">
          <MemberAvatar id={value} size={22} />
          <Text size="sm" c={current ? undefined : 'dimmed'} truncate>{current ? current.name : 'Sem responsável'}</Text>
        </Group>
      </UnstyledButton>
    )

  if (!enabled) {
    return <Tooltip label={current ? current.name : 'Sem responsável'}>{target}</Tooltip>
  }

  return (
    <Menu position="bottom-end" width={240} shadow="md" withinPortal>
      <Menu.Target>{target}</Menu.Target>
      <Menu.Dropdown onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        {canAssignOthers ? (
          <>
            <Menu.Label>{team ? `Equipa ${team}` : 'Membros do produto'}</Menu.Label>
            {options.map((m) => (
              <Menu.Item
                key={m.id}
                leftSection={<MemberAvatar id={m.id} size={22} />}
                rightSection={m.id === value && <Icon name="check" size={16} />}
                onClick={() => onChange(m.id)}
              >
                {m.name}
              </Menu.Item>
            ))}
            {options.length === 0 && <Text size="sm" c="dimmed" px="sm" py={6}>Esta equipa ainda não tem membros.</Text>}
            <Menu.Divider />
            <Menu.Item leftSection={<Icon name="person_remove" size={18} />} disabled={!value} onClick={() => onChange(null)}>
              Sem responsável
            </Menu.Item>
          </>
        ) : value === user.id ? (
          <Menu.Item leftSection={<Icon name="person_remove" size={18} />} onClick={() => onChange(null)}>Deixar de ser responsável</Menu.Item>
        ) : (
          <Menu.Item leftSection={<Icon name="person_add" size={18} />} onClick={() => onChange(user.id)}>
            {current ? `Atribuir a mim (em vez de ${current.name.split(' ')[0]})` : 'Atribuir a mim'}
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}
