import { Link } from 'react-router-dom'
import { Anchor, Badge, Divider, Group, NumberInput, Select, Stack, Text } from '@mantine/core'
import { teams } from '../data/mockData.js'
import { notifyError, notifyInfo, notifySuccess } from '../lib/feedback.jsx'
import { can, featureFlow, featureStatus, fibonacci } from '../lib/labels.js'
import { MemberPicker } from './MemberPicker.jsx'

function Row({ label, children }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md" mih={36}>
      <Text size="sm" c="dimmed" w={110} style={{ flexShrink: 0 }}>{label}</Text>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>{children}</div>
    </Group>
  )
}

// Painel de propriedades de uma funcionalidade (página de detalhe e vista rápida do board).
// Cada campo só é editável pelo papel responsável por ele.
export function FeatureProperties({ feature, role, base, onChange, onStatusChange }) {
  function set(changes, message) {
    onChange({ ...feature, ...changes })
    notifySuccess(message)
  }

  const statusIndex = featureFlow.indexOf(feature.status)
  const allowed = feature.allowedStatuses ?? featureFlow.filter((s, i) => Math.abs(i - statusIndex) === 1)
  const statusOptions = featureFlow.map((s) => ({
    value: s,
    label: featureStatus[s].label,
    disabled: s !== feature.status && !allowed.includes(s),
  }))

  const canChangeStatus = Boolean(onStatusChange) && (feature.canChangeStatus ?? can(role, 'status'))

  return (
    <Stack gap={4}>
      <Row label="Estado">
        {canChangeStatus ? (
          <Select size="xs" w={160} data={statusOptions} value={feature.status} allowDeselect={false} aria-label="Estado"
            onChange={(v) => v && v !== feature.status && onStatusChange(v)} />
        ) : (
          <Badge color={featureStatus[feature.status]?.color ?? 'gray'}>{featureStatus[feature.status]?.label ?? feature.status}</Badge>
        )}
      </Row>
      <Row label="Responsável">
        <div style={{ width: 180 }}>
          <MemberPicker
            variant="field"
            value={feature.assignee}
            team={feature.team}
            canAssignOthers={can(role, 'assign')}
            canSelfAssign={can(role, 'selfAssign')}
            onChange={(id) => set({ assignee: id }, id ? 'Responsável atualizado.' : 'Funcionalidade sem responsável.')}
          />
        </div>
      </Row>
      <Row label="Equipa">
        <Select size="xs" w={160} placeholder="Por atribuir" disabled={!can(role, 'assignTeam')} aria-label="Equipa"
          data={teams.map((t) => ({ value: t.name, label: `${t.name} · ${t.load}/${t.capacity} pts` }))}
          value={feature.team}
          onChange={(v) => {
            const team = teams.find((t) => t.name === v)
            if (team && team.load >= team.capacity) notifyInfo(`A equipa ${v} já está no limite da capacidade.`, 'Atenção')
            set({ team: v, assignee: null }, feature.team ? `Equipa mudou de ${feature.team} para ${v}. Registado no histórico.` : `Atribuída à equipa ${v}.`)
          }} />
      </Row>
      <Divider my={6} />
      <Row label="Sprint">
        <Select size="xs" w={160} placeholder="Sem sprint" clearable disabled={!can(role, 'sprintPlan')} aria-label="Sprint"
          data={['Sprint 14', 'Sprint 15']} value={feature.sprint}
          onChange={(v) => set({ sprint: v }, v ? `Adicionada ao ${v}.` : 'Retirada do sprint.')} />
      </Row>
      <Row label="Release">
        <Select size="xs" w={160} placeholder="Sem release" clearable disabled={!can(role, 'releases')} aria-label="Release"
          data={['v3.0', 'v3.1', 'v3.2']} value={feature.release}
          onChange={(v) => set({ release: v }, v ? `Planeada para a release ${v}.` : 'Retirada da release.')} />
      </Row>
      <Row label="Story points">
        <Select size="xs" w={160} placeholder="Por estimar" disabled={!can(role, 'estimate')} aria-label="Story points"
          data={fibonacci} value={feature.storyPoints ? String(feature.storyPoints) : null}
          onChange={(v) => set({ storyPoints: Number(v) }, 'Estimativa guardada.')} />
      </Row>
      <Row label="Impacto · Esforço">
        <Group gap={6} wrap="nowrap">
          {['impact', 'effort'].map((key) => (
            <NumberInput key={key} size="xs" w={64} min={1} max={10} allowDecimal={false} clampBehavior="none" hideControls
              disabled={!can(role, 'priority')} defaultValue={feature[key]} aria-label={key === 'impact' ? 'Impacto' : 'Esforço'}
              onBlur={(e) => {
                const v = Number(e.currentTarget.value)
                if (v === feature[key]) return
                if (!Number.isInteger(v) || v < 1 || v > 10) {
                  e.currentTarget.value = feature[key]
                  return notifyError('Usa um número inteiro de 1 a 10. A prioridade manteve-se.', 'Valor inválido')
                }
                set({ [key]: v }, 'Prioridade atualizada.')
              }} />
          ))}
        </Group>
      </Row>
      <Divider my={6} />
      <Row label="Pedido de origem">
        {feature.request ? (
          <Anchor component={Link} to={`${base}/requests?pedido=${feature.request.requestId}&filtro=todos`} size="sm">
            {feature.request.id}
          </Anchor>
        ) : <Text size="sm" c="dimmed">Criada pela equipa</Text>}
      </Row>
      {feature.createdAt && <Row label="Criada em"><Text size="sm">{feature.createdAt}</Text></Row>}
    </Stack>
  )
}