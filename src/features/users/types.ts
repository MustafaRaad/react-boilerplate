import { type Role } from "@/core/types/auth";

export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  phone_no: string;
  approved: number;
  created_at: string | null;
  updated_at: string | null;
  role: string; // Single role name from Laravel
  roles?: Role[]; // Optional for compatibility
};

export type UsersQuery = {
  search?: string;
};
