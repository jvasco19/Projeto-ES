import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

// Le dados da API: devolve { loading, data, error }
export function useApi(path) {
  const [state, setState] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    let active = true
    setState({ loading: true, data: null, error: null })
    api(path)
      .then((data) => active && setState({ loading: false, data, error: null }))
      .catch((error) => active && setState({ loading: false, data: null, error }))
    return () => { active = false }
  }, [path])

  return state
}