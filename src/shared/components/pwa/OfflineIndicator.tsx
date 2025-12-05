/**
 * Offline Indicator Component
 * 
 * Shows a banner when the user is offline
 */

import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline && isOnline) {
      // Show "reconnected" message briefly
      setShowReconnected(true);
      setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top ${
        showReconnected ? 'bg-green-500' : 'bg-yellow-500'
      } px-4 py-2 text-center text-sm font-medium text-white shadow-md`}
    >
      <div className="flex items-center justify-center gap-2">
        {showReconnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Back online - Data will sync automatically</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>You're offline - Some features may be limited</span>
          </>
        )}
      </div>
    </div>
  );
}
