import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md border-border/80 shadow-lg text-center">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <WifiOff className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">You are currently offline</CardTitle>
          <CardDescription>
            Please verify your network connection. Your local changes will sync automatically once reconnected.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Try Reconnecting
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
