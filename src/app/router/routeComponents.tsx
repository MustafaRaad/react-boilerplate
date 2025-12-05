import { useEffect } from "react";
import { Outlet, useRouter } from "@tanstack/react-router";
import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import { useAuthUser, useIsInitializing } from "@/store/auth.store";

export const RootComponent = () => <Outlet />;

export const ProtectedDashboard = () => {
  useAuthGuard();
  return <DashboardLayout />;
};

export const RootIndex = () => {
  const user = useAuthUser(); // ✅ Selective subscription
  const isInitializing = useIsInitializing(); // ✅ Selective subscription
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;
    router.navigate({ to: user ? "/dashboard" : "/login", replace: true });
  }, [router, user, isInitializing]);

  return null;
};
