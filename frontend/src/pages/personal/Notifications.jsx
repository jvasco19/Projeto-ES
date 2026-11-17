import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionIcon, Button, Card, Group, SegmentedControl, Text, ThemeIcon, Tooltip, UnstyledButton } from '@mantine/core'
import { Icon } from '../../components/Icon.jsx'
import { Empty, PageHeader, PageLoader } from '../../components/ui.jsx'
import { useData } from '../../data/useData.js'
import { notifySuccess } from '../../lib/feedback.jsx'

const types = {
  risk: { icon: 'warning', color: 'red' },
  stale: { icon: 'schedule', color: 'yellow' },
  mention: { icon: 'alternate_email', color: 'stream' },
  requirement: { icon: 'edit_note', color: 'violet' },
  status: { icon: 'published_with_changes', color: 'teal' },
}

export default function Notifications() {
  const navigate = useNavigate()
  const { data, loading } = useData((s) => s.notifications)
  const [items, setItems] = useState(null)
  const [filter, setFilter] = useState('todas')

  if (loading) return <PageLoader rows={1} />

  const list = items ?? data
  const visible = filter === 'todas' ? list : list.filter((n) => !n.read)

  return (
    <>
      <PageHeader
        title="Notificações"
        description="Menções, alterações de requisitos, alertas de risco e mudanças de estado dos teus pedidos."
        actions={
          <Button variant="default" leftSection={<Icon name="done_all" size={18} />}
            onClick={() => { setItems(list.map((n) => ({ ...n, read: true }))); notifySuccess('Todas as notificações marcadas como lidas.') }}>
            Marcar todas como lidas
          </Button>
        }
      />
      <SegmentedControl mb="md" value={filter} onChange={setFilter}
        data={[{ value: 'todas', label: 'Todas' }, { value: 'nao_lidas', label: 'Não lidas' }]} />

      <Card padding={0}>
        {visible.length === 0 ? (
          <Empty icon="notifications_off" title="Sem notificações por ler" />
        ) : (
          visible.map((n, i) => (
            <UnstyledButton
              key={n.id}
              className="row-link"
              onClick={() => { setItems(list.map((x) => (x.id === n.id ? { ...x, read: true } : x))); navigate(n.link) }}
              w="100%"
              px="md"
              py="sm"
              style={{ borderTop: i ? '1px solid var(--ws-border)' : 0 }}
            >
              <Group wrap="nowrap" align="flex-start">
                <ThemeIcon variant="light" color={types[n.type].color} radius="xl" size={34}>
                  <Icon name={types[n.type].icon} size={18} />
                </ThemeIcon>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={n.read ? 400 : 600}>{n.title}</Text>
                  <Text size="sm" c="dimmed" truncate>{n.detail}</Text>
                </div>
                <Group gap={8} wrap="nowrap">
                  <Text size="xs" c="dimmed">{n.time}</Text>
                  {!n.read && (
                    <Tooltip label="Marcar como lida">
                      <ActionIcon component="span" variant="subtle" size="sm" aria-label="Marcar como lida"
                        onClick={(e) => { e.stopPropagation(); setItems(list.map((x) => (x.id === n.id ? { ...x, read: true } : x))) }}>
                        <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--mantine-color-stream-6)' }} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Group>
            </UnstyledButton>
          ))
        )}
      </Card>
    </>
  )
}
