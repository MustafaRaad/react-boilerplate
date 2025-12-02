import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <LoginForm className="w-full max-w-2xl" />
    </div>
  );
}
