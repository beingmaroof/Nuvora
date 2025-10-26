import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
          <div className="max-w-2xl w-full bg-card rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-destructive mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              The app encountered an error. Please refresh the page or contact support if the problem persists.
            </p>
            
            <div className="bg-muted p-4 rounded-md mb-6">
              <p className="font-mono text-sm text-foreground break-all">
                <strong>Error:</strong> {this.state.error?.toString()}
              </p>
            </div>

            {this.state.errorInfo && (
              <details className="bg-muted p-4 rounded-md mb-6">
                <summary className="cursor-pointer font-semibold text-foreground mb-2">
                  Stack trace
                </summary>
                <pre className="text-xs overflow-auto max-h-64 text-muted-foreground">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
