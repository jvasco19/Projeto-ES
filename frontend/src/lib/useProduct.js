import { useOutletContext, useParams } from 'react-router-dom'
import { products } from '../data/mockData.js'

// Produto aberto e papel do utilizador nesse produto.
// Inclui os produtos criados nesta sessão (passados pelo AppLayout).
export function useProduct() {
  const { productId } = useParams()
  const context = useOutletContext()
  const list = context?.allProducts ?? products
  const product = list.find((p) => p.id === productId)
  return { product, productId, role: product?.role, base: `/p/${productId}` }
}
