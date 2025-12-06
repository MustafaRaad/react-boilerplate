import { CheckCircle, History, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { HeaderNotification } from "@/shared/components/layout/dashboard-header/types";
import { Badge } from "@/shared/components/ui/badge";

function NotificationCard({
  notification,
}: {
  notification: HeaderNotification;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border/40 bg-card p-4",
        "transition-all duration-300 hover:border-border hover:bg-card",
        notification.unread && "border-primary/40 ring-1 ring-primary/20"
      )}
    >
      {notification.unread ? (
        <span className="absolute ltr:right-2 rtl:left-2 top-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
        </span>
      ) : null}

      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm text-foreground">{notification.title}</h3>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-light whitespace-nowrap">
              <History className="size-3.5" aria-hidden="true" />
              {notification.timestamp}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {notification.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { t } = useTranslation("common");

  // TODO: Replace with TanStack Query hook (e.g., useNotificationsQuery())
  // For now, using localized sample data
  const items: HeaderNotification[] = [
    {
      id: "1",
      title: t("notifications.samples.newLogin.title"),
      description: t("notifications.samples.newLogin.description"),
      timestamp: t("notifications.samples.newLogin.timestamp"),
      unread: true,
    },
    {
      id: "2",
      title: t("notifications.samples.portfolioSync.title"),
      description: t("notifications.samples.portfolioSync.description"),
      timestamp: t("notifications.samples.portfolioSync.timestamp"),
      unread: true,
    },
    {
      id: "3",
      title: t("notifications.samples.kycSoon.title"),
      description: t("notifications.samples.kycSoon.description"),
      timestamp: t("notifications.samples.kycSoon.timestamp"),
    },
    {
      id: "4",
      title: t("notifications.samples.maintenance.title"),
      description: t("notifications.samples.maintenance.description"),
      timestamp: t("notifications.samples.maintenance.timestamp"),
    },
  ];

  const unreadCount = items.filter((n) => n.unread).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative text-sm transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 bg-sidebar"
          aria-label={t("notifications.button.open")}
        >
          <div className="relative">
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-secondary" />
              </span>
            )}
          </div>
          <span className="hidden md:block">
            {t("notifications.button.label")}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="rounded-full h-fit px-1.5 py-0 text-xs ms-1.5 font-medium">
                {unreadCount}
              </Badge>
            )}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full sm:max-w-md flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border/50 px-6 py-4">
          <SheetTitle className="text-start">{t("notifications.title")}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {items.length > 0 ? (
              items.map((n) => (
                <NotificationCard key={n.id} notification={n} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="size-12 text-muted-foreground/50 mb-3" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  {t("notifications.empty", { defaultValue: "No notifications" })}
                </p>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="border-t border-border/50 px-6 py-4 mt-auto">
          <Button
            className="w-full justify-center gap-2"
            aria-label={t("notifications.actions.markAllRead")}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="size-4" aria-hidden="true" />
            {t("notifications.actions.markAllRead")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
