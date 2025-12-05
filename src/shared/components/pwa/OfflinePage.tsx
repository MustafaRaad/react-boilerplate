/**
 * Offline Fallback Page
 * 
 * Shown when the user is offline and tries to navigate
 */

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <WifiOff className="h-10 w-10 text-muted-foreground" />
        </div>
        
        <h1 className="mb-2 text-2xl font-bold">You're Offline</h1>
        
        <p className="mb-6 text-muted-foreground">
          It looks like you've lost your internet connection. 
          Some features may not be available until you're back online.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleRefresh}
            className="w-full"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <p className="text-xs text-muted-foreground">
            This app works offline with limited functionality. 
            Your changes will sync when you're back online.
          </p>
        </div>
      </div>
    </div>
  );
}
