/**
 * Offline Fallback Page
 *
 * Shown when the user is offline and tries to navigate
 */

import { WifiOff, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";

export function OfflinePage() {
  const { t } = useTranslation("common");
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <WifiOff className="h-10 w-10 text-muted-foreground" />
        </div>

        <h1 className="mb-2 text-2xl font-bold">
          {t("pwa.offline.page.title")}
        </h1>

        <p className="mb-6 text-muted-foreground">
          {t("pwa.offline.page.description")}
        </p>

        <div className="space-y-3">
          <Button onClick={handleRefresh} className="w-full" size="lg">
            <RefreshCw className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {t("pwa.offline.page.button")}
          </Button>

          <p className="text-xs text-muted-foreground">
            {t("pwa.offline.page.note")}
          </p>
        </div>
      </div>
    </div>
  );
}
