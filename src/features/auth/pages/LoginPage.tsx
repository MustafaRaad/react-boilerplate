import { LoginForm } from "@/features/auth/components/LoginForm";
import { ThemeToggle } from "@/features/auth/components/ThemeToggle";
import { OptimizedImage } from "@/shared/components/ui/optimized-image";
import { useTranslation } from "react-i18next";

export function LoginPage() {
  const { t } = useTranslation("common");
  
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/5 px-4 py-8 dark:from-primary/15 dark:via-background dark:to-secondary/10">
      <ThemeToggle className="absolute left-4 top-4 z-10" />
      
      {/* Logo and Company Title in Top Right */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 p-3 ring-2 ring-primary/20 dark:bg-primary/20 dark:ring-primary/30 shadow-sm">
          <OptimizedImage
            src="/logo.svg"
            width={56}
            height={56}
            alt={t("app.title")}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
            {t("app.title")}
          </h1>
          <p className="text-xs text-muted-foreground leading-tight mt-0.5">
            {t("app.description")}
          </p>
        </div>
      </div>
      
      {/* Enhanced animated background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/20 dark:bg-primary/15 absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full blur-3xl transition-opacity duration-1000" />
        <div className="bg-secondary/20 dark:bg-secondary/15 absolute -right-24 top-1/4 h-80 w-80 animate-pulse rounded-full blur-3xl transition-opacity duration-1000 delay-300" />
        <div className="bg-primary/15 dark:bg-primary/10 absolute bottom-0 left-1/3 h-72 w-72 animate-pulse rounded-full blur-3xl transition-opacity duration-1000 delay-700" />
        <div className="bg-accent/10 dark:bg-accent/5 absolute top-1/2 right-1/4 h-64 w-64 animate-pulse rounded-full blur-3xl transition-opacity duration-1000 delay-500" />
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <LoginForm className="relative z-10 w-full max-w-md" />
    </div>
  );
}
