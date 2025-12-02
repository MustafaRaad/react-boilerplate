import { useEffect } from "react";
import { Outlet, useRouter } from "@tanstack/react-router";
import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import { useAuthStore } from "@/store/auth.store";

export const RootComponent = () => <Outlet />;

export const ProtectedDashboard = () => {
  useAuthGuard();
  return <DashboardLayout />;
};

export const RootIndex = () => {
  const { user, isInitializing } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;
    router.navigate({ to: user ? "/dashboard" : "/login", replace: true });
  }, [router, user, isInitializing]);

  return null;
};
