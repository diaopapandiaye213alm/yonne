"use client";
import { Component, type ReactNode, type ErrorInfo } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
          <h2 className="text-xl font-display font-bold text-ink-900 mb-2">
            Une erreur inattendue s&apos;est produite
          </h2>
          <p className="text-sm text-ink-500 mb-6 max-w-sm">
            {this.state.error?.message ?? "Quelque chose s'est mal passé."}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-2.5 text-sm font-display font-bold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
