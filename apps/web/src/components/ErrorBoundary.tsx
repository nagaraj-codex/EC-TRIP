import React from 'react';
import { StatusBlock, Button } from './ui';
import { ApiError } from '../lib/errors';

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
      const isApiError = this.state.error instanceof ApiError;
      const reqId = isApiError ? (this.state.error as ApiError).requestId : undefined;

      return (
        <div className="flex-1 w-full h-full min-h-[50vh] flex flex-col items-center justify-center p-4">
          <StatusBlock 
            type="error"
            title="Something went off-track"
            help={this.state.error?.message || "An unexpected error occurred in the application."}
            actionLabel="Retry"
            onAction={() => window.location.reload()}
          />
          {reqId && (
            <div className="mt-4 p-3 bg-slate-900 border border-slate-700 rounded-lg flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">ID: {reqId}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(reqId)}
                className="text-xs text-brand-400 hover:text-brand-300 font-bold"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
