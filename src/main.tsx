import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// @ts-ignore
import './index.css'

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.log("[v0] React render error:", error.message, info.componentStack?.split('\n').slice(0,5).join(' '))
  }
  render() {
    if (this.state.error) {
      const e = this.state.error as Error
      return (
        <div style={{padding: '2rem', fontFamily: 'monospace', background: '#fee', color: '#900', whiteSpace: 'pre-wrap'}}>
          <h2>Render Error</h2>
          <strong>{e.message}</strong>
          <br />
          {e.stack}
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
