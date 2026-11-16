import { useEffect, useState } from 'react'
import * as store from './mockData.js'

// Único ponto de acesso aos dados. Simula o tempo de resposta de uma API
// para que os ecrãs mostrem estados de carregamento.
// Para ligar ao backend: substituir o setTimeout por um fetch('/api/...').
export function useData(select) {
  const [state, setState] = useState({ loading: true, data: null })

  useEffect(() => {
    const timer = setTimeout(() => setState({ loading: false, data: select(store) }), 450)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}

// Simula a resposta a uma ação (guardar, aprovar, votar...).
export function fakeRequest(ms = 650) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
