import { Link, Navigate, useParams } from 'react-router-dom'
import { Button, Center } from '@mantine/core'
import { Empty } from '../../components/ui.jsx'
import { customerProducts, products } from '../../data/mockData.js'
import { isLoggedIn } from '../../lib/auth.js'

// /r/:token — link que a equipa partilha com os clientes.
// Com sessao: abre o fluxo de submissao. Sem sessao: pede login e volta ao fluxo.
export default function ProductLink() {
  const { token } = useParams()
  const product = [...products, ...customerProducts].find((p) => p.linkToken === token)

  if (!product) {
    return (
      <Center mih="100vh">
        <Empty icon="link_off" title="Este link já não é válido"
          description="Pede à equipa do produto um link atualizado para enviares o teu pedido.">
          <Button component={Link} to="/" variant="light">Ir para o Workstream</Button>
        </Empty>
      </Center>
    )
  }

  const target = `/me/new/${product.id}`
  return isLoggedIn()
    ? <Navigate to={target} replace />
    : <Navigate to={`/login?next=${encodeURIComponent(target)}`} replace />
}
