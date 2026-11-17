import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DonutChart } from '@mantine/charts'
import { Button, Card, Grid, Group, Menu, SegmentedControl, Stack, Text, TextInput } from '@mantine/core'
import { Icon } from '../../components/Icon.jsx'
import { ChartCard, Empty, PageHeader, PageLoader, StatusBadge } from '../../components/ui.jsx'
import { useData } from '../../data/useData.js'

const filters = {
  todos: () => true,
  curso: (r) => ['submetido', 'em_analise', 'aprovado', 'planeado'].includes(r.status),
  entregues: (r) => r.status === 'entregue',
  rejeitados: (r) => r.status === 'rejeitado',
}

export default function MyRequests() {
  const navigate = useNavigate()
  const { data, loading } = useData((s) => ({ requests: s.myRequests, stats: s.myRequestStats, products: s.customerProducts }))
  const [filter, setFilter] = useState('todos')
  const [query, setQuery] = useState('')

  if (loading) return <PageLoader rows={1} />

  const list = data.requests
    .filter(filters[filter])
    .filter((r) => r.title.toLowerCase().includes(query.toLowerCase()))

  const donut = [
    { name: 'Em análise', value: data.stats.emAnalise, color: 'yellow.5' },
    { name: 'Planeados', value: data.stats.planeados, color: 'stream.6' },
    { name: 'Entregues', value: data.stats.entregues, color: 'green.6' },
    { name: 'Rejeitados', value: data.stats.rejeitados, color: 'red.5' },
  ]

  return (
    <>
      <PageHeader
        title="Os meus pedidos"
        description="Acompanha os pedidos que enviaste às equipas de produto, do envio até à entrega."
        actions={
          <Menu position="bottom-end" width={240}>
            <Menu.Target>
              <Button leftSection={<Icon name="add" size={18} />}>Novo pedido</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Enviar pedido para</Menu.Label>
              {data.products.map((p) => (
                <Menu.Item key={p.id} onClick={() => navigate(`/me/new/${p.id}`)}>
                  <Text size="sm">{p.name}</Text>
                  <Text size="xs" c="dimmed">{p.company}</Text>
                </Menu.Item>
              ))}
              <Menu.Divider />
              <Text size="xs" c="dimmed" px="sm" py={6}>
                Para outro produto, abre o link que a equipa desse produto te enviou.
              </Text>
            </Menu.Dropdown>
          </Menu>
        }
      />

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card padding={0}>
            <Group p="md" justify="space-between" gap="sm" style={{ borderBottom: '1px solid var(--ws-border)' }}>
              <SegmentedControl
                size="xs"
                fullWidth
                w={{ base: '100%', sm: 'auto' }}
                value={filter}
                onChange={setFilter}
                data={[
                  { value: 'todos', label: 'Todos' },
                  { value: 'curso', label: 'Em curso' },
                  { value: 'entregues', label: 'Entregues' },
                  { value: 'rejeitados', label: 'Rejeitados' },
                ]}
              />
              <TextInput
                placeholder="Pesquisar"
                leftSection={<Icon name="search" size={18} />}
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                w={{ base: '100%', xs: 220 }}
                aria-label="Pesquisar pedidos"
              />
            </Group>

            {list.length === 0 ? (
              <Empty icon="search_off" title="Nenhum pedido encontrado" description="Experimenta outro filtro ou pesquisa." />
            ) : (
              list.map((r, i) => (
                <Group
                  key={r.id}
                  component={Link}
                  to={`/me/requests/${r.id}`}
                  className="row-link"
                  justify="space-between"
                  wrap="nowrap"
                  px="md"
                  py="sm"
                  style={{ borderTop: i ? '1px solid var(--ws-border)' : 0, color: 'inherit', textDecoration: 'none' }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Text fw={500} lineClamp={2}>{r.title}</Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      {r.productName} · enviado a {r.submittedAt} · {r.votes} votos
                    </Text>
                  </div>
                  <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
                    <StatusBadge status={r.status} />
                    <Icon name="chevron_right" size={18} style={{ color: 'var(--mantine-color-dimmed)' }} />
                  </Group>
                </Group>
              ))
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            <ChartCard title="Estado dos pedidos" description={`${data.stats.total} pedidos enviados`}>
              <Group justify="center">
                <DonutChart data={donut} size={160} thickness={22} withTooltip chartLabel={data.stats.total} />
              </Group>
              <Stack gap={6} mt="md">
                {donut.map((d) => (
                  <Group key={d.name} justify="space-between">
                    <Group gap={8}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: `var(--mantine-color-${d.color.replace('.', '-')})` }} />
                      <Text size="sm">{d.name}</Text>
                    </Group>
                    <Text size="sm" fw={500}>{d.value}</Text>
                  </Group>
                ))}
              </Stack>
            </ChartCard>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  )
}
