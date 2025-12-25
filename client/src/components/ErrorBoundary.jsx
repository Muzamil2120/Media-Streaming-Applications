import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a media-related error we should ignore
    const message = error?.message || '';
    const isMediaError =
      message.includes('play() request was interrupted') ||
      message.includes('media was removed from the document') ||
      message.includes('AbortError') ||
      message.includes('NotAllowedError') ||
      message.includes('NotSupportedError');

    if (isMediaError) {
      // Silently ignore media errors and don't show error boundary
      return { hasError: false, error: null };
    }

    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const message = error?.message || '';
    const isMediaError =
      message.includes('play() request was interrupted') ||
      message.includes('media was removed from the document') ||
      message.includes('AbortError');

    if (!isMediaError) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h3>Something went wrong</h3>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
