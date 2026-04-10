import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { fallback, onReset } = this.props;
    if (fallback) return fallback;

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0c0a07', color: '#e8c850', fontFamily: 'Cinzel, serif',
        padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🙏</div>
        <h2 style={{ margin: '0 0 12px', fontSize: 22 }}>A disturbance in the cosmic order</h2>
        <p style={{ color: '#b8a060', fontSize: 14, maxWidth: 400, marginBottom: 24 }}>
          Something unexpected happened. The path to Moksha has been disrupted.
        </p>
        <button
          onClick={() => {
            this.setState({ hasError: false, error: null });
            if (onReset) onReset();
            else window.location.reload();
          }}
          style={{
            background: 'transparent', border: '1px solid #e8c850', color: '#e8c850',
            padding: '10px 28px', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'Cinzel, serif', fontSize: 14,
          }}
        >
          Return to the Path
        </button>
      </div>
    );
  }
}
