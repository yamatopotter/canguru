import type { PropsWithChildren } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mascot } from './Mascot';
import { APP_VERSION } from '@/lib/version';

interface AuthCardProps {
  title: string;
}

export function AuthCard({ title, children }: PropsWithChildren<AuthCardProps>) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-3 text-center">
          <Mascot size={48} />
          <span className="font-semibold text-foreground">Canguru</span>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>

      <span className="text-xs text-muted-foreground">v{APP_VERSION}</span>
    </main>
  );
}
