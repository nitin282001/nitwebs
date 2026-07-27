import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center p-6 text-center font-sans relative z-[999999]">
          <div className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-left">
            <h1 className="text-xl font-bold text-red-400 mb-2">Frontend Error Encountered</h1>
            <p className="text-xs text-neutral-400 mb-4">
              An unhandled exception occurred in a component render cycle:
            </p>
            <pre className="text-xs font-mono bg-black/60 p-4 rounded-xl border border-neutral-800 text-red-300 overflow-auto max-h-60 whitespace-pre-wrap">
              {this.state.error?.toString()}
              {"\n"}
              {this.state.error?.stack}
            </pre>
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  sessionStorage.clear();
                  window.location.href = "/";
                }}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Reset Session & Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
