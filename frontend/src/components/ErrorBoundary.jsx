import { Component } from 'react'
import { Button, Center } from '@mantine/core'
import { Empty } from './ui.jsx'

// Se uma página falhar, mostra uma mensagem em vez de apagar a aplicação inteira.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <Center mih={420}>
        <Empty icon="error" title="Não foi possível mostrar esta página" description="Tenta novamente. Se o problema continuar, volta à área pessoal.">
          <Button variant="light" onClick={() => { window.location.href = '/me' }}>Ir para a área pessoal</Button>
        </Empty>
      </Center>
    )
  }
}
