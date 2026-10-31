import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface AuthFormContainerProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthFormContainer({
  title,
  description,
  children,
  footer,
  className = '',
}: AuthFormContainerProps) {
  return (
    <Card className={`border-border/80 shadow-xl bg-card ${className}`}>
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {children}
        {footer && <div className="pt-2">{footer}</div>}
      </CardContent>
    </Card>
  );
}
