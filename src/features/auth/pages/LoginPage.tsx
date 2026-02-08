import { LoginForm } from "@/features/auth/components/LoginForm";
import { ThemeToggle } from "@/features/auth/components/ThemeToggle";

export function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-primary/20 via-secondary/10 to-background px-4 py-8 dark:from-primary/25 dark:via-secondary/20 dark:to-background">
      <ThemeToggle className="absolute left-4 top-4 z-10" />
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="bg-primary/30 dark:bg-primary/20 absolute -left-24 -top-24 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-secondary/25 dark:bg-secondary/20 absolute -right-16 top-32 h-56 w-56 rounded-full blur-3xl" />
        <div className="bg-primary/15 dark:bg-primary/15 absolute bottom-0 left-1/3 h-48 w-48 rounded-full blur-3xl" />
      </div>
      <LoginForm className="relative w-full max-w-4xl" />
    </div>
  );
}
