import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ThemeSwitcher } from '../../components/layout/ThemeSwitcher';

export function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
      <Card className="w-full max-w-sm border-border/80 bg-card text-center p-2">
        <CardHeader className="space-y-2">
          <div className="mx-auto inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-muted/50 border border-border/80 font-mono text-[11px] text-muted-foreground">
            OFFLINE // NETWORK_DISCONNECTED
          </div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">Connection Lost</CardTitle>
          <CardDescription className="text-xs text-muted-foreground leading-relaxed">
            Network handshake failed. Local caching is active and changes will reconcile upon reconnect.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-1.5 h-8 text-xs border-border/80"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Re-check Connection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
