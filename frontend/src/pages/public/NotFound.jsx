import { Link } from 'react-router-dom'
import { Button, Center } from '@mantine/core'
import { Empty } from '../../components/ui.jsx'

export default function NotFound({ inApp }) {
  return (
    <Center mih={inApp ? 400 : '100vh'}>
      <Empty icon="explore_off" title="Página não encontrada" description="O endereço pode estar errado ou a página já não existe.">
        <Button component={Link} to={inApp ? '/me' : '/'} variant="light">
          {inApp ? 'Voltar à área pessoal' : 'Voltar ao início'}
        </Button>
      </Empty>
    </Center>
  )
}
