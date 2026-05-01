import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-center text-red-600">Something went wrong. Please refresh the page.</div>
    }
    return this.props.children
  }
}

export default ErrorBoundary
