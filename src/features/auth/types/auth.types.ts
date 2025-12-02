import type { z } from "zod";
import {
  authLoginFormSchema,
  changePasswordSchema,
  laravelLoginSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas/auth.schema";

export type Role = {
  id: string;
  name: string;
};

export type AuthUser = {
  id: number;
  name: string | null;
  email: string | null;
  phoneNo: string | null;
  image?: string | null;
  role?: string | null;
};

export type AuthPos = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

export type MeResponse = {
  fees: number;
  pos: {
    pos_name: string;
    pos_lat: number;
    pos_lng: number;
    id: number;
  };
  user: {
    id: number;
    name: string | null;
    email: string | null;
    phone_no: string | null;
  };
  perm: string[];
};

export type AuthTokens = {
  accessToken: string;
  accessTokenType: string; // typically "bearer"
  accessTokenExpiresIn: number; // seconds
  accessTokenExpiresAt: number; // timestamp in ms
};

export type LoginRequestLaravel = {
  email: string;
  password: string;
  type: "web";
};

export type LoginResultLaravel = z.infer<typeof laravelLoginSchema>;

// Form-related types
export type LoginFormValues = z.infer<typeof authLoginFormSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
