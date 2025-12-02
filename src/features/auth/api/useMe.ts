import { useMemo } from "react";
import { useAuthStore } from "@/store/auth.store";
import type { AuthUser } from "@/features/auth/types";

/**
 * Returns the current authenticated user from the persisted auth store.
 * This hook does not issue a network request; it relies on `/me` having
 * been fetched and stored during login.
 */
export function useMe(): { data: AuthUser | null } {
  const user = useAuthStore((state) => state.user);

  const data = useMemo(() => user ?? null, [user]);

  return { data };
}
