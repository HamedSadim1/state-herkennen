import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Last line of defense against unexpected render errors: instead of a white
 * screen, show a small fallback with a retry option. The error itself is
 * logged so it can be diagnosed.
 */
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Unhandled UI error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-16 px-4">
          <p className="text-lg font-semibold text-gray-900">
            Something went wrong.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            An unexpected error occurred while rendering the inventory.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="btn btn-primary btn-md mt-4"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
