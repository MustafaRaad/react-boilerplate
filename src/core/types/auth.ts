import { type AspNetEnvelope } from './api'

export type Role = {
  id: string
  name: string
}

export type AuthUser = {
  id: string
  name: string
  email: string
  roles: Role[]
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type LoginRequestAspNet = {
  email: string
  password: string
}

export type LoginRequestLaravel = {
  email: string
  password: string
}

export type LoginResultAspNet = {
  accessToken: string
  refreshToken: string
  accessExpiresAtUtc: string
  refreshExpiresAtUtc: string
  sessionId: string
}

export type LoginResultLaravel = {
  message: string
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

export type RefreshRequestAspNet = {
  refreshToken: string
}

export type RefreshResultAspNet = LoginResultAspNet

export type RefreshRequestLaravel = {
  refreshToken: string
}

export type RefreshResultLaravel = {
  access_token: string
  token_type?: string
  expires_in?: number
  refresh_token?: string
}

export type MeResponse = AspNetEnvelope<AuthUser>
