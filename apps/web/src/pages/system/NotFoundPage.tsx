import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm border-border/80 bg-card text-center p-2">
        <CardHeader className="space-y-2">
          <div className="mx-auto inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-muted/50 border border-border/80 font-mono text-[11px] text-muted-foreground">
            404 // RESOURCE_NOT_FOUND
          </div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">Page Not Located</CardTitle>
          <CardDescription className="text-xs text-muted-foreground leading-relaxed">
            The requested URI does not exist or has been relocated to another workspace endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5 h-8 text-xs border-border/80">
            <Link to={-1 as any}>
              <ArrowLeft className="h-3.5 w-3.5" /> Go Back
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5 h-8 text-xs">
            <Link to="/dashboard">
              <Home className="h-3.5 w-3.5" /> Workspace Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
