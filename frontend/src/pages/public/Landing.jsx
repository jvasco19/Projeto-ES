import { Link } from 'react-router-dom'
import { AreaChart } from '@mantine/charts'
import { Avatar, Box, Button, Card, Container, Grid, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { Icon } from '../../components/Icon.jsx'
import { Logo, StatusBadge } from '../../components/ui.jsx'
import { backlog, metrics } from '../../data/mockData.js'

// Percurso de um pedido real, mostrado na pré-visualização do produto.
const journey = [
  { label: 'Pedido do cliente', detail: 'R-2190 · via link do produto', icon: 'inbox', done: true },
  { label: 'Aprovado e priorizado', detail: 'Impacto 8 · Esforço 3', icon: 'check_circle', done: true },
  { label: 'User Story no Sprint 14', detail: '3 critérios de aceitação', icon: 'view_kanban', done: true },
  { label: 'Release v3.0', detail: 'Prevista para 15 dez', icon: 'rocket_launch', done: false },
]

function ProductPreview() {
  return (
    <div className="hero-window">
      <Group gap={6} px="md" py={10} style={{ borderBottom: '1px solid var(--ws-border)', background: 'var(--ws-subtle)' }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{ width: 10, height: 10, borderRadius: 99, background: c, opacity: 0.8 }} />
        ))}
        <Text size="xs" c="dimmed" ml="sm">Atlas CRM · Visão geral</Text>
      </Group>

      <Box p={{ base: 'md', sm: 'lg' }}>
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 5 }}>
          {/* Percurso do pedido: a funcionalidade principal */}
          <Card padding="md" h="100%">
            <Text size="sm" fw={600}>Exportar relatórios para Excel</Text>
            <Text size="xs" c="dimmed" mb="md">Pedido de Carlos Mendes · 41 votos</Text>
            <Stack gap={14}>
              {journey.map((step, i) => (
                <Group key={step.label} gap="sm" wrap="nowrap" className="hero-float" style={{ animationDelay: `${500 + i * 160}ms` }}>
                  <Avatar size={30} radius="xl" color={step.done ? 'stream' : 'gray'} variant={step.done ? 'filled' : 'light'}>
                    <Icon name={step.icon} size={17} />
                  </Avatar>
                  <div>
                    <Text size="sm" fw={500}>{step.label}</Text>
                    <Text size="xs" c="dimmed">{step.detail}</Text>
                  </div>
                </Group>
              ))}
            </Stack>
          </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="lg">
            <Card padding="md">
              <Group justify="space-between" mb={4}>
                <Text size="sm" fw={600}>Burn-down · Sprint 14</Text>
                <Text size="xs" c="dimmed">6 dias restantes</Text>
              </Group>
              <AreaChart
                h={120}
                data={metrics.burndown}
                dataKey="dia"
                series={[{ name: 'real', label: 'Real', color: 'stream.6' }, { name: 'ideal', label: 'Ideal', color: 'gray.5' }]}
                curveType="monotone"
                withXAxis={false}
                withYAxis={false}
                gridAxis="none"
                withDots={false}
                withTooltip={false}
                fillOpacity={0.15}
              />
            </Card>
            <Card padding={0}>
              {backlog.slice(0, 3).map((f, i) => (
                <Group key={f.id} justify="space-between" px="md" py={10} wrap="nowrap"
                  style={{ borderTop: i ? '1px solid var(--ws-border)' : 0 }}>
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Text size="xs" c="dimmed" ff="monospace">{f.id}</Text>
                    <Text size="sm" truncate>{f.title}</Text>
                  </Group>
                  <StatusBadge status={f.status} kind="feature" size="sm" />
                </Group>
              ))}
            </Card>
          </Stack>
          </Grid.Col>
        </Grid>
      </Box>
    </div>
  )
}

export default function Landing() {
  return (
    <main className="hero">
      <svg className="hero-stream" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M-40 ${520 + i * 70} C 360 ${380 + i * 70}, 720 ${700 + i * 50}, 1480 ${460 + i * 70}`}
            fill="none"
            stroke="var(--mantine-color-stream-4)"
            strokeWidth="1.5"
            style={{ animationDelay: `${i * -3}s` }}
          />
        ))}
      </svg>

      <Container size={1120} py={{ base: 32, sm: 56 }} pos="relative">
        <Logo />

        <Stack align="center" ta="center" gap="lg" mt={{ base: 56, sm: 80 }} mb={{ base: 40, sm: 56 }}>
          <Title order={1} fz={{ base: 36, sm: 56 }} lh={1.08} maw={820} style={{ letterSpacing: '-0.03em' }}>
            Do pedido do cliente à release, sem perder o rasto
          </Title>
          <Text size="lg" c="dimmed" maw={620}>
            Cada produto tem um link para os clientes enviarem pedidos. A equipa prioriza, planeia sprints e
            releases no mesmo sítio, e o cliente acompanha o pedido até à entrega.
          </Text>
          <Group mt="sm">
            <Button size="md" component={Link} to="/register">Criar conta</Button>
            <Button size="md" variant="default" component={Link} to="/login">Entrar</Button>
          </Group>
        </Stack>

        <ProductPreview />

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mt={56} mb="xl">
          {[
            { icon: 'how_to_vote', title: 'Pedidos sem duplicados', text: 'Antes de submeter, o cliente pesquisa e vota nos pedidos que já existem.' },
            { icon: 'auto_awesome', title: 'Prioridade com critério', text: 'Impacto, esforço e votos lado a lado, com sugestões de ordem assistidas por IA.' },
            { icon: 'warning', title: 'Riscos antes de acontecerem', text: 'Alertas quando uma milestone perde ritmo ou um pedido fica parado.' },
          ].map((f) => (
            <Group key={f.title} align="flex-start" gap="md" wrap="nowrap">
              <Icon name={f.icon} size={22} style={{ color: 'var(--mantine-color-stream-6)', marginTop: 2 }} />
              <div>
                <Text fw={600}>{f.title}</Text>
                <Text size="sm" c="dimmed" mt={4}>{f.text}</Text>
              </div>
            </Group>
          ))}
        </SimpleGrid>
      </Container>
    </main>
  )
}
