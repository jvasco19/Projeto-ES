import { Link } from 'react-router-dom'
import { Badge, Card, Group, Skeleton, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { Icon } from './Icon.jsx'
import { featureStatus, releaseStatus, requestStatus } from '../lib/labels.js'

export function Logo({ size = 28, withName = true }) {
  return (
    <Group gap={10} wrap="nowrap">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--mantine-color-stream-6)" />
        <path
          d="M8 11.5c4 0 4-3 8-3s4 3 8 3M8 16.5c4 0 4-3 8-3s4 3 8 3M8 21.5c4 0 4-3 8-3s4 3 8 3"
          fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"
        />
      </svg>
      {withName && <Text fw={600} size="lg" style={{ letterSpacing: '-0.01em' }}>Workstream</Text>}
    </Group>
  )
}

export function PageHeader({ title, description, actions }) {
  return (
    <Group justify="space-between" align="flex-start" mb="xl" gap="md">
      <div style={{ flex: '1 1 320px', minWidth: 0 }}>
        {typeof title === 'string' ? <Title order={1} size="h2">{title}</Title> : title}
        {description && <Text c="dimmed" mt={6} maw={640}>{description}</Text>}
      </div>
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  )
}

export function StatusBadge({ status, kind = 'request', size = 'md' }) {
  const map = kind === 'feature' ? featureStatus : kind === 'release' ? releaseStatus : requestStatus
  const item = map[status] ?? { label: status, color: 'gray' }
  return <Badge color={item.color} size={size}>{item.label}</Badge>
}

export function StatCard({ label, value, hint, icon, color = 'stream', to }) {
  return (
    <Card padding="lg" component={to ? Link : 'div'} to={to} className={to ? 'card-link' : undefined}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text size="sm" c="dimmed">{label}</Text>
          <Text fz={28} fw={600} mt={4} style={{ letterSpacing: '-0.02em' }}>{value}</Text>
          {hint && <Text size="xs" c="dimmed" mt={2}>{hint}</Text>}
        </div>
        {icon && (
          <ThemeIcon variant="light" color={color} size={36} radius="md">
            <Icon name={icon} size={20} />
          </ThemeIcon>
        )}
      </Group>
    </Card>
  )
}

export function ChartCard({ title, description, action, children, h }) {
  return (
    <Card padding="lg" h={h}>
      <Group justify="space-between" align="flex-start" mb="md" wrap="nowrap">
        <div>
          <Title order={2} size="h4">{title}</Title>
          {description && <Text size="sm" c="dimmed" mt={2}>{description}</Text>}
        </div>
        {action}
      </Group>
      {children}
    </Card>
  )
}

export function PageLoader({ rows = 3 }) {
  return (
    <Stack gap="lg" aria-busy="true" aria-label="A carregar">
      <Skeleton h={34} w={280} />
      <Skeleton h={16} w={420} />
      <Group grow mt="md">
        <Skeleton h={110} />
        <Skeleton h={110} />
        <Skeleton h={110} />
      </Group>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} h={180} />
      ))}
    </Stack>
  )
}

export function Empty({ icon = 'inbox', title, description, children }) {
  return (
    <Stack align="center" gap={6} py={48} px="md" ta="center">
      <ThemeIcon variant="light" color="gray" size={48} radius="xl">
        <Icon name={icon} size={26} />
      </ThemeIcon>
      <Text fw={500} mt="xs">{title}</Text>
      {description && <Text size="sm" c="dimmed" maw={360}>{description}</Text>}
      {children && <div style={{ marginTop: 8 }}>{children}</div>}
    </Stack>
  )
}
