import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ThemeSwitcher } from '../layout/ThemeSwitcher';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public handleReload = () => {
    window.location.reload();
  };

  public handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative selection:bg-primary/20 selection:text-primary"
        >
          {/* Top Right Theme Switcher */}
          <div className="absolute top-4 right-4 z-50">
            <ThemeSwitcher />
          </div>

          <Card className="w-full max-w-md border-border/80 bg-card text-center p-4 shadow-xl">
            <CardHeader className="space-y-3 pb-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="inline-flex mx-auto items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-muted text-muted-foreground border border-border">
                APPLICATION_ERROR // 500
              </div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                An unexpected interface exception occurred. Your workspace data remains securely saved. You can try recovering this view or return to the dashboard.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              {process.env.NODE_ENV === 'development' && this.state.error?.message && (
                <div className="rounded-md border border-border/80 bg-muted/40 p-2.5 text-left text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-28">
                  {this.state.error.message}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleReset}
                  className="gap-1.5 h-8 text-xs cursor-pointer border-border/80"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleReload}
                  className="gap-1.5 h-8 text-xs cursor-pointer border-border/80"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Reload Window
                </Button>
                <Button
                  size="sm"
                  onClick={this.handleGoHome}
                  className="gap-1.5 h-8 text-xs cursor-pointer"
                >
                  <Home className="h-3.5 w-3.5" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
