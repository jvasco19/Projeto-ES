import { useState } from 'react'
import { notifications } from '@mantine/notifications'
import { Icon } from '../components/Icon.jsx'
import { fakeRequest } from '../data/useData.js'

export function notifySuccess(message, title) {
  notifications.show({ title, message, color: 'teal', icon: <Icon name="check" size={18} /> })
}

export function notifyError(message, title = 'Não foi possível concluir') {
  notifications.show({ title, message, color: 'red', icon: <Icon name="error" size={18} /> })
}

export function notifyInfo(message, title) {
  notifications.show({ title, message, color: 'stream', icon: <Icon name="info" size={18} /> })
}

// Botões com estado de carregamento: const [run, loading] = useAction()
// run('Mensagem de sucesso', () => { alterações locais })
export function useAction() {
  const [loading, setLoading] = useState(false)

  async function run(successMessage, after) {
    setLoading(true)
    await fakeRequest()
    setLoading(false)
    after?.()
    if (successMessage) notifySuccess(successMessage)
  }

  return [run, loading]
}
