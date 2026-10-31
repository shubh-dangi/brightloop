import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export function ServerErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm border-destructive/30 bg-card text-center p-2">
        <CardHeader className="space-y-2">
          <div className="mx-auto inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-destructive/10 border border-destructive/20 font-mono text-[11px] text-destructive">
            500 // INTERNAL_SERVER_ERROR
          </div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">Service Exception</CardTitle>
          <CardDescription className="text-xs text-muted-foreground leading-relaxed">
            An unhandled backend failure occurred. Diagnostic traces have been recorded for inspection.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-1.5 h-8 text-xs border-border/80"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reconnect
          </Button>
          <Button asChild size="sm" className="gap-1.5 h-8 text-xs">
            <Link to="/dashboard">
              <Home className="h-3.5 w-3.5" /> Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
