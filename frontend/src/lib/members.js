// Componente de interface: procura membros diretamente na store (dados fixos).
import { productMembers } from '../data/mockData.js'

export function memberById(id) {
  return productMembers.find((m) => m.id === id)
}
