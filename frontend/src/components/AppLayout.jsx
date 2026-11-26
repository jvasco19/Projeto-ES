import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom'
import {
  ActionIcon, AppShell, Avatar, Badge, Burger, Button, Center, Divider, Group, Indicator, Menu, Modal, NavLink,
  ScrollArea, Stack, Text, TextInput, Textarea, Tooltip, UnstyledButton, useComputedColorScheme, useMantineColorScheme,
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { Spotlight, spotlight } from '@mantine/spotlight'
import '@mantine/spotlight/styles.css'
// A barra lateral lê diretamente dos dados de teste para não piscar entre páginas.
import { backlog, myRequests, products, releases, triageRequests } from '../data/mockData.js'
import { useApi } from '../data/useApi.js'
import { getReadIds } from '../lib/readNotifications.js'
import { can, roleLabels } from '../lib/labels.js'
import { isLoggedIn, logout } from '../lib/auth.js'
import { notifyError, useAction } from '../lib/feedback.jsx'
import { Icon } from './Icon.jsx'
import { Empty, Logo } from './ui.jsx'
import { ErrorBoundary } from './ErrorBoundary.jsx'

const productNav = [
  { to: '', label: 'Visão geral', icon: 'space_dashboard' },
  { to: '/pedidos', label: 'Pedidos', icon: 'inbox', count: 4, needs: 'triage' },
  { to: '/backlog', label: 'Backlog', icon: 'format_list_numbered' },
  { to: '/requisitos', label: 'Requisitos', icon: 'description' },
  { to: '/sprints', label: 'Sprints', icon: 'view_kanban' },
  { to: '/roadmap', label: 'Roadmap', icon: 'timeline' },
  { to: '/metricas', label: 'Métricas', icon: 'monitoring' },
  { to: '/equipas', label: 'Equipas', icon: 'groups' },
  { to: '/definicoes', label: 'Definições', icon: 'settings' },
]

// Opções do botão "Criar", de acordo com o papel no produto
const createOptions = [
  { label: 'Funcionalidade', icon: 'add_task', to: '/backlog?criar=funcionalidade', needs: 'backlog' },
  { label: 'Sprint', icon: 'view_kanban', to: '/sprints?criar=sprint', needs: 'sprints' },
  { label: 'Release', icon: 'rocket_launch', to: '/roadmap?criar=release', needs: 'releases' },
  { label: 'Milestone', icon: 'flag', to: '/roadmap?criar=milestone', needs: 'milestones' },
  { label: 'Equipa', icon: 'group_add', to: '/equipas?criar=equipa', needs: 'teams' },
  { label: 'Convite', icon: 'person_add', to: '/equipas?criar=convite', needs: 'teams' },
]

// Páginas que um produto novo ainda não tem
const emptySections = {
  pedidos: { icon: 'inbox', title: 'Ainda não há pedidos', text: 'Partilha o link do produto com os clientes para receberes os primeiros pedidos.', cta: 'Ver o link', to: '/definicoes' },
  requisitos: { icon: 'description', title: 'Ainda não há User Stories', text: 'As User Stories são criadas a partir das funcionalidades do backlog.' },
  metricas: { icon: 'monitoring', title: 'Ainda não existem dados para apresentar', text: 'As métricas aparecem quando houver pedidos e sprints.', cta: 'Ver o roadmap', to: '/roadmap' },
}

function ContextAvatar({ name, color = 'stream', personal }) {
  return (
    <Avatar radius="md" size={34} color={personal ? 'gray' : color} variant={personal ? 'light' : 'filled'}>
      {personal ? <Icon name="person" size={20} /> : name.slice(0, 2).toUpperCase()}
    </Avatar>
  )
}

function CreateProductModal({ opened, onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [run, loading] = useAction()

  function create() {
    if (!form.name.trim()) return notifyError('Dá um nome ao produto.', 'Nome em falta')
    run(`Produto "${form.name}" criado. És o Project Manager.`, () => {
      onCreate(form)
      setForm({ name: '', description: '' })
      onClose()
    })
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Criar produto">
      <Stack>
        <Text size="sm" c="dimmed">Ficas como Project Manager. A seguir convidas a equipa e partilhas o link com os clientes.</Text>
        <TextInput label="Nome do produto" withAsterisk placeholder="Ex.: Atlas CRM" value={form.name} data-autofocus
          onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} />
        <Textarea label="Descrição" autosize minRows={2} placeholder="Para quem é e o que resolve" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.currentTarget.value })} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button loading={loading} onClick={create}>Criar produto</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function ContextSwitcher({ product, allProducts, onCreateProduct }) {
  const navigate = useNavigate()
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Menu position="bottom-start" width={268} shadow="md" offset={6}>
        <Menu.Target>
          <UnstyledButton aria-label="Mudar de área" p={8} style={{ borderRadius: 10, border: '1px solid var(--ws-border)', width: '100%' }}>
            <Group gap={10} wrap="nowrap">
              <ContextAvatar name={product?.name ?? ''} color={product?.color} personal={!product} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={600} truncate>{product ? product.name : 'Área pessoal'}</Text>
                <Text size="xs" c="dimmed" truncate>{product ? roleLabels[product.role] : 'Os meus pedidos'}</Text>
              </div>
              <Icon name="unfold_more" size={18} style={{ color: 'var(--mantine-color-dimmed)' }} />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<Icon name="person" size={18} />} onClick={() => navigate('/me')} rightSection={!product && <Icon name="check" size={16} />}>
            Área pessoal
          </Menu.Item>
          <Menu.Divider />
          <Menu.Label>Produtos</Menu.Label>
          {allProducts.map((p) => (
            <Menu.Item
              key={p.id}
              onClick={() => navigate(`/p/${p.id}`)}
              leftSection={<Avatar size={22} radius="sm" color={p.color} variant="filled">{p.name.slice(0, 1)}</Avatar>}
              rightSection={product?.id === p.id && <Icon name="check" size={16} />}
            >
              <Text size="sm">{p.name}</Text>
              <Text size="xs" c="dimmed">{roleLabels[p.role]}</Text>
            </Menu.Item>
          ))}
          <Menu.Divider />
          <Menu.Item leftSection={<Icon name="add" size={18} />} onClick={open}>Criar produto</Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <CreateProductModal opened={opened} onClose={close} onCreate={onCreateProduct} />
    </>
  )
}

function CreateMenu({ product, base, customerProducts }) {
  const navigate = useNavigate()
  const options = product
    ? createOptions.filter((o) => can(product.role, o.needs))
    : customerProducts.map((p) => ({ label: `Pedido para ${p.name}`, icon: 'add_comment', to: `/me/new/${p.id}`, absolute: true }))
  if (!options.length) return null
  return (
    <Menu position="bottom-start" width={240} offset={6}>
      <Menu.Target>
        <Button fullWidth variant="light" leftSection={<Icon name="add" size={18} />} justify="flex-start">Criar</Button>
      </Menu.Target>
      <Menu.Dropdown>
        {options.map((o) => (
          <Menu.Item key={o.label} leftSection={<Icon name={o.icon} size={18} />} onClick={() => navigate(o.absolute ? o.to : base + o.to)}>
            {o.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}

// Pesquisa global (Ctrl+K): páginas, funcionalidades, pedidos e releases
function useSpotlightActions(product, navigate) {
  const p = product ?? products[0]
  const base = `/p/${p.id}`
  const go = (to) => () => navigate(to)
  return [
    {
      group: product ? `Páginas de ${p.name}` : 'Páginas',
      actions: (product ? productNav.filter((n) => !n.needs || can(p.role, n.needs)) : []).map((n) => ({
        id: `page-${n.label}`, label: n.label, leftSection: <Icon name={n.icon} size={20} />, onClick: go(base + n.to),
      })).concat([
        { id: 'me', label: 'Os meus pedidos', leftSection: <Icon name="assignment" size={20} />, onClick: go('/me') },
        { id: 'account', label: 'Conta e preferências', leftSection: <Icon name="manage_accounts" size={20} />, onClick: go('/account') },
      ]),
    },
    {
      group: 'Funcionalidades',
      actions: backlog.map((f) => ({ id: f.id, label: f.title, description: `${f.id} · ${p.name}`, leftSection: <Icon name="task_alt" size={20} />, onClick: go(`${base}/funcionalidades/${f.id}`) })),
    },
    {
      group: 'Pedidos',
      actions: [
        ...myRequests.map((r) => ({ id: r.id, label: r.title, description: `${r.id} · o meu pedido para ${r.productName}`, leftSection: <Icon name="assignment" size={20} />, onClick: go(`/me/requests/${r.id}`) })),
        ...(can(p.role, 'triage') ? triageRequests : []).map((r) => ({ id: r.id, label: r.title, description: `${r.id} · ${r.company}`, leftSection: <Icon name="inbox" size={20} />, onClick: go(`${base}/pedidos?pedido=${r.id}&filtro=todos`) })),
      ],
    },
    {
      group: 'Releases',
      actions: releases.map((r) => ({ id: `rel-${r.id}`, label: `Release ${r.name}`, description: r.objective, leftSection: <Icon name="rocket_launch" size={20} />, onClick: go(`${base}/roadmap`) })),
    },
  ]
}

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [opened, { toggle, close }] = useDisclosure(false)
  const { setColorScheme } = useMantineColorScheme()
  const scheme = useComputedColorScheme('light')
  const isMobile = useMediaQuery('(max-width: 48em)')
  // Produtos criados nesta sessão (ainda sem backend)
  const [created, setCreated] = useState([])
  // Utilizador e produtos reais, vindos da API
  const me = useApi('/auth/me')
  const myProducts = me.data?.products ?? []
  const customerProducts = myProducts.filter((p) => p.role === 'customer')
  const teamProducts = myProducts.filter((p) => p.role !== 'customer')
  // Aceita a resposta como { ...utilizador, products } ou { user, products }
  const user = me.data?.user ?? me.data ?? {}
  const initials = (user.name ?? '').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  // Notificacoes, o contador volta a ser calculado quando alguma é marcada como lida
  const notifications = useApi('/me/notifications')
  const [, setReadVersion] = useState(0)
  useEffect(() => {
    const refresh = () => setReadVersion((v) => v + 1)
    window.addEventListener('ws-notifications-read', refresh)
    return () => window.removeEventListener('ws-notifications-read', refresh)
  }, [])

  const match = matchPath('/p/:productId/*', location.pathname)
  const allProducts = [...teamProducts, ...created]
  const product = allProducts.find((p) => String(p.id) === match?.params.productId)
  const spotlightActions = useSpotlightActions(product, navigate)

  if (!isLoggedIn()) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  }

  const readIds = getReadIds()
  const unread = (notifications.data ?? []).filter((n) => !readIds.has(String(n.id))).length
  const base = product ? `/p/${product.id}` : ''
  const section = match?.params['*']?.split('/')[0] ?? ''
  const emptySection = product?.isNew && emptySections[section]

  function isActive(path) {
    return path === base ? location.pathname === base : location.pathname.startsWith(path)
  }

  function createProduct(form) {
    const id = form.name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'produto'
    setCreated([...created, { id, name: form.name, description: form.description, role: 'project_manager', color: 'orange', linkToken: `${id.slice(0, 3)}-N3W8QX`, members: 1, isNew: true }])
    navigate(`/p/${id}`)
  }

  return (
    <AppShell navbar={{ width: 272, breakpoint: 'sm', collapsed: { mobile: !opened } }} header={{ height: 56, collapsed: !isMobile }} padding={0}>
      <AppShell.Header px="md">
        <Group h="100%" justify="space-between">
          <Logo size={26} />
          <Burger opened={opened} onClick={toggle} size="sm" aria-label="Abrir menu" />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm" onClick={(e) => e.target.closest('a') && close()}>
        <AppShell.Section>
          <ContextSwitcher product={product} allProducts={allProducts} onCreateProduct={createProduct} />
          <Group gap="xs" mt="sm" wrap="nowrap">
            <div style={{ flex: 1 }}><CreateMenu product={product} base={base} customerProducts={customerProducts} /></div>
            <Tooltip label="Pesquisar (Ctrl K)">
              <ActionIcon variant="default" size={36} aria-label="Pesquisar" onClick={spotlight.open}><Icon name="search" size={20} /></ActionIcon>
            </Tooltip>
          </Group>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea} mt="md">
          {product ? (
            productNav.filter((item) => !item.needs || can(product.role, item.needs)).map((item) => (
              <NavLink
                key={item.label}
                component={Link}
                to={base + item.to}
                label={item.label}
                leftSection={<Icon name={item.icon} size={20} />}
                active={isActive(base + item.to)}
                rightSection={item.count && !product.isNew ? <Badge size="sm" variant="light" circle>{item.count}</Badge> : null}
                style={{ borderRadius: 8 }}
              />
            ))
          ) : (
            <>
              <NavLink component={Link} to="/me" label="Os meus pedidos" leftSection={<Icon name="assignment" size={20} />}
                active={location.pathname === '/me' || location.pathname.startsWith('/me/requests')} style={{ borderRadius: 8 }} />
              <Text size="xs" fw={500} c="dimmed" px="sm" mt="lg" mb={4}>Produtos que acompanho</Text>
              {customerProducts.map((p) => (
                <NavLink key={p.id} label={p.name} leftSection={<Icon name="apps" size={20} />} style={{ borderRadius: 8 }}
                  defaultOpened={location.pathname.endsWith(`/${p.id}`)} childrenOffset={28}>
                  <NavLink component={Link} to={`/me/products/${p.id}`} label="Pedidos públicos" style={{ borderRadius: 8 }}
                    active={location.pathname === `/me/products/${p.id}`} />
                  <NavLink component={Link} to={`/me/roadmap/${p.id}`} label="Roadmap" style={{ borderRadius: 8 }}
                    active={location.pathname === `/me/roadmap/${p.id}`} />
                </NavLink>
              ))}
            </>
          )}
        </AppShell.Section>

        <AppShell.Section>
          <Divider mb="sm" />
          <NavLink
            component={Link}
            to="/notifications"
            label="Notificações"
            leftSection={
              <Indicator disabled={!unread} size={8} offset={2} color="red">
                <Icon name="notifications" size={20} />
              </Indicator>
            }
            rightSection={unread ? <Badge size="sm" color="red" variant="light" circle>{unread}</Badge> : null}
            active={location.pathname === '/notifications'}
            style={{ borderRadius: 8 }}
          />
          <Group justify="space-between" mt="xs" wrap="nowrap">
            <Menu position="top-start" width={220}>
              <Menu.Target>
                <UnstyledButton p={6} style={{ borderRadius: 8, flex: 1, minWidth: 0 }} aria-label="Menu da conta">
                  <Group gap={10} wrap="nowrap">
                    <Avatar size={30} radius="xl" color="teal">{initials}</Avatar>
                    <div style={{ minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>{user.name}</Text>
                      <Text size="xs" c="dimmed" truncate>{user.email}</Text>
                    </div>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<Icon name="manage_accounts" size={18} />} component={Link} to="/account">Conta e preferências</Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<Icon name="logout" size={18} />} onClick={() => { logout(); navigate('/') }}>
                  Terminar sessão
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Tooltip label={scheme === 'dark' ? 'Modo claro' : 'Modo escuro'}>
              <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Alternar modo escuro"
                onClick={() => setColorScheme(scheme === 'dark' ? 'light' : 'dark')}>
                <Icon name={scheme === 'dark' ? 'light_mode' : 'dark_mode'} size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <div key={location.pathname} className="page" style={{ padding: 'clamp(16px, 3vw, 40px)', maxWidth: 1360, margin: '0 auto' }}>
          {match && !product ? (
            <Center mih={420}>
              <Empty icon="search_off" title="Produto não encontrado"
                description="Pode ter sido arquivado, ou deixaste de ser membro. Os produtos criados nesta sessão desaparecem ao recarregar a página (ainda sem backend).">
                <Button component={Link} to="/me" variant="light">Ir para a área pessoal</Button>
              </Empty>
            </Center>
          ) : emptySection ? (
            <Center mih={420}>
              <Empty icon={emptySection.icon} title={emptySection.title} description={emptySection.text}>
                {emptySection.to && <Button component={Link} to={base + emptySection.to} variant="light">{emptySection.cta}</Button>}
              </Empty>
            </Center>
          ) : (
            <ErrorBoundary key={location.pathname}>
              <Outlet context={{ allProducts }} />
            </ErrorBoundary>
          )}
        </div>
      </AppShell.Main>

      <Spotlight
        actions={spotlightActions}
        nothingFound="Nada encontrado"
        highlightQuery
        limit={12}
        scrollable
        maxHeight={420}
        searchProps={{ leftSection: <Icon name="search" size={20} />, placeholder: 'Pesquisar funcionalidades, pedidos, páginas…' }}
      />
    </AppShell>
  )
}
