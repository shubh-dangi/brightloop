import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ThemeSwitcher } from '../../components/layout/ThemeSwitcher';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1.5 h-8 text-xs border-border/80 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Go Back
          </Button>
          <Button asChild size="sm" className="gap-1.5 h-8 text-xs cursor-pointer">
            <Link to="/dashboard">
              <Home className="h-3.5 w-3.5" /> Workspace Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
