import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'An unexpected error occurred.' };
  }

  componentDidCatch(error: Error) {
    console.error('Application ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--brand-surface))] p-6">
          <div className="surface max-w-md p-7 text-center">
            <p className="eyebrow">Something went wrong</p>
            <h1 className="display-face mt-2 text-2xl text-[hsl(var(--brand-navy))]">
              Unable to display this view
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please reload the page or return to the homepage.
            </p>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-[hsl(var(--brand-navy))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Return home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
