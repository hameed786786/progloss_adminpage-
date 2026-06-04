import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Props = {
  isLoading: boolean;
  error: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
};

export function AsyncState({ isLoading, error, isEmpty, emptyMessage = 'No data yet.', children }: Props) {
  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span className="text-[13px] font-medium">Loading…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-[13px] font-bold text-destructive">Failed to load data</p>
        <p className="text-[12px] text-muted-foreground">{error.message}</p>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="flex min-h-[200px] items-center justify-center px-4 text-center text-[13px] text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return <>{children}</>;
}
