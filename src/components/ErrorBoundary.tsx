import React, { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state to render fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error details for debugging or send it to an error logging service
    console.error("Error captured:", error);
    console.error("Error info:", errorInfo);
    this.setState({ error, errorInfo });
  }

  resetErrorBoundary = (): void => {
    // Reset error state to retry rendering
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Something went wrong!</h1>
          <p>{this.state.error?.toString()}</p>
          {this.state.errorInfo && (
            <details style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>
              {this.state.errorInfo.componentStack}
            </details>
          )}
          <button onClick={this.resetErrorBoundary}>Try Again</button>
        </div>
      );
    }

    // Render children normally if no error
    return this.props.children;
  }
}

export default ErrorBoundary;
