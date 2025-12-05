import { endpoints } from "@/core/api/endpoints";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { type User } from "@/features/users/types";

export const useUsers = createDataTableHook<User>("users", endpoints.users.list);
