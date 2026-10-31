import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ThemeSwitcher } from '../../components/layout/ThemeSwitcher';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
      <Card className="w-full max-w-sm border-amber-500/30 bg-card text-center p-2">
        <CardHeader className="space-y-2">
          <div className="mx-auto inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 font-mono text-[11px] text-amber-500">
            403 // INSUFFICIENT_PERMISSIONS
          </div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">Access Restricted</CardTitle>
          <CardDescription className="text-xs text-muted-foreground leading-relaxed">
            Your user account lacks the required RBAC policy credentials to access this workspace resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-2">
          <Button asChild size="sm" className="gap-1.5 h-8 text-xs">
            <Link to="/dashboard">
              <Home className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
