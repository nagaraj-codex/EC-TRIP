import React from 'react';
import { StatusBlock, Button } from './ui';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 w-full h-full min-h-[50vh] flex items-center justify-center p-4">
          <StatusBlock 
            type="error"
            title="Something went wrong"
            help={this.state.error?.message || "An unexpected error occurred in the application."}
            actionLabel="Reload page"
            onAction={() => window.location.reload()}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
