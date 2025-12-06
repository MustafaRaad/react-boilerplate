# Backend Switching Guide (Laravel / ASP.NET)

**Last Updated:** December 6, 2025  
**Purpose:** Step-by-step instructions for switching between Laravel and ASP.NET backend servers

---

## Table of Contents

1. [Overview](#overview)
2. [Configuration Steps](#configuration-steps)
3. [Auth Endpoints & Request Bodies](#auth-endpoints--request-bodies)
4. [/me Endpoint Differences](#me-endpoint-differences)
5. [Pagination Differences](#pagination-differences)
6. [Switching Procedure](#switching-procedure)
7. [Testing Checklist](#testing-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This project supports **two backend servers simultaneously**:

### Backend Types

```typescript
type BackendKind = "aspnet" | "laravel";
```

- **Laravel**: Current default backend
- **ASP.NET**: Fully supported alternative backend

All backend-specific logic is centralized in `src/core/api/`:

- **client.ts** - Response normalization & error handling
- **normalizers.ts** - Data transformation layer (NEW)
- **endpoints.ts** - Endpoint definitions

---

## Configuration Steps

### 1. Set Backend Kind

**File:** `.env` or `.env.local`

```env
# Laravel (default)
VITE_BACKEND_KIND=laravel
VITE_API_BASE_URL=http://localhost:8000/api/

# ASP.NET
VITE_BACKEND_KIND=aspnet
VITE_API_BASE_URL=https://localhost:7000/api/
```

**Important:**

- `VITE_API_BASE_URL` **MUST end with `/`**
- Endpoint paths **MUST NOT start with `/`**
- Backend kind is case-insensitive (`laravel`, `Laravel`, `LARAVEL` all work)

### 2. Verify Configuration Loading

**File:** `src/core/config/env.ts`

```typescript
import { type BackendKind } from "../types/api";

const normalizeBackendKind = (value?: string): BackendKind => {
  if (!value) return "aspnet"; // ← Default fallback
  return value.toLowerCase() === "laravel" ? "laravel" : "aspnet";
};

export const backendKind: BackendKind = normalizeBackendKind(
  import.meta.env.VITE_BACKEND_KIND as string
);

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) ?? "";
```

### 3. Restart Development Server

After changing `.env`:

```bash
# Stop current server (Ctrl+C)

# Restart
npm run dev
# or
pnpm dev
```

---

## Auth Endpoints & Request Bodies

### Laravel Backend

#### Login Endpoint

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "type": "web"
}
```

**Response:**

```json
{
  "message": "logged in successfully",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 43200
}
```

**Normalized to:**

```typescript
{
  backend: "laravel",
  accessToken: "eyJ0eXAiOiJKV1QiLCJhbGc...",
  tokenType: "bearer",
  expiresIn: 43200,
  accessTokenExpiresAt: Date.now() + 43200 * 1000,
  refreshToken: null,
  refreshTokenExpiresAt: null
}
```

#### Refresh Token Endpoint

**Endpoint:** `POST /auth/refresh`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "type": "web"
}
```

**Response:**

```json
{
  "message": "refresh successfully",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 43200
}
```

---

### ASP.NET Backend

#### Login Endpoint (Phone Number)

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "phoneNumber": "+1234567890",
  "password": "password123",
  "clientId": "web-app",
  "fingerprintHash": "unique-device-hash"
}
```

#### Login Endpoint (Username)

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "username": "john.doe",
  "password": "password123",
  "clientId": "web-app",
  "fingerprintHash": "unique-device-hash"
}
```

**Response (Envelope):**

```json
{
  "code": 200,
  "message": "Login successful",
  "error": null,
  "result": {
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "accessExpiresAtUtc": "2025-12-07T12:00:00Z",
    "refreshExpiresAtUtc": "2025-12-14T12:00:00Z",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Normalized to:**

```typescript
{
  backend: "aspnet",
  accessToken: "eyJ0eXAiOiJKV1QiLCJhbGc...",
  tokenType: "bearer",
  expiresIn: 43200,  // Calculated from accessExpiresAtUtc
  accessTokenExpiresAt: new Date("2025-12-07T12:00:00Z").getTime(),
  refreshToken: "eyJ0eXAiOiJKV1QiLCJhbGc...",
  refreshTokenExpiresAt: new Date("2025-12-14T12:00:00Z").getTime()
}
```

---

## /me Endpoint Differences

### Laravel Backend

**Endpoint:** `POST /auth/me`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response:**

```json
{
  "fees": 25.5,
  "pos": {
    "pos_name": "Main Office",
    "pos_lat": 40.7128,
    "pos_lng": -74.006,
    "id": 1
  },
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "phone_no": "+1234567890"
  },
  "perm": ["users.view", "users.create", "users.edit", "products.view"]
}
```

**Normalized to:**

```typescript
{
  user: {
    id: 123,
    name: "John Doe",
    email: "john@example.com",
    phoneNo: "+1234567890",
    image: null,
    role: null,
    backend: "laravel"
  },
  permissions: ["users.view", "users.create", "users.edit", "products.view"],
  pos: {
    id: 1,
    name: "Main Office",
    lat: 40.7128,
    lng: -74.0060
  },
  fees: 25.50
}
```

---

### ASP.NET Backend

**Endpoint:** `POST /auth/me`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "isDeleted": false,
  "username": "john.doe",
  "phoneNumber": "+1234567890",
  "firstName": "John",
  "secondName": "Michael",
  "lastName": "Doe",
  "surname": "Jr.",
  "fullName": "John Michael Doe Jr.",
  "photo": "https://example.com/photos/john.jpg",
  "status": 1,
  "role": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "isDeleted": false,
    "name": "Admin"
  }
}
```

**Normalized to:**

```typescript
{
  user: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "John Michael Doe Jr.",
    email: null,
    phoneNo: "+1234567890",
    image: "https://example.com/photos/john.jpg",
    role: "Admin",
    roles: [
      { id: "660e8400-e29b-41d4-a716-446655440001", name: "Admin" }
    ],
    backend: "aspnet"
  },
  permissions: [],  // ASP.NET uses role-based, not permission array
  pos: null,
  fees: null
}
```

---

## Pagination Differences

### Query Parameters

**Laravel:**

```
GET /api/Users/ListUsers?page=1&size=10
```

**ASP.NET:**

```
GET /api/Users/ListUsers?PageNumber=1&PageSize=10
```

**Handled automatically by `formatPaginationParams()` in `normalizers.ts`**

### Response Formats

#### Laravel (DataTable Format)

```json
{
  "draw": 1,
  "recordsTotal": 150,
  "recordsFiltered": 150,
  "data": [
    { "id": 1, "name": "User 1" },
    { "id": 2, "name": "User 2" }
  ]
}
```

#### ASP.NET (Envelope + PagedResult)

```json
{
  "code": 200,
  "message": null,
  "error": null,
  "result": {
    "code": "200",
    "totalPages": 15,
    "totalCount": 150,
    "hasPreviousPage": false,
    "hasNextPage": true,
    "items": [
      { "Id": 1, "Name": "User 1" },
      { "Id": 2, "Name": "User 2" }
    ]
  }
}
```

#### Normalized Unified Format

Both are normalized to:

```typescript
{
  items: [
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" }
  ],
  currentPage: 1,
  pageSize: 10,
  rowCount: 150,
  pageCount: 15
}
```

---

## Switching Procedure

### From Laravel to ASP.NET

#### Step 1: Update Environment Variables

```env
# .env or .env.local
VITE_BACKEND_KIND=aspnet
VITE_API_BASE_URL=https://localhost:7000/api/
```

#### Step 2: Restart Dev Server

```bash
# Stop server
Ctrl+C

# Clear cache (optional but recommended)
rm -rf node_modules/.vite

# Restart
pnpm dev
```

#### Step 3: Clear Browser Storage

Open DevTools → Application → Storage:

- Clear `localStorage` (especially `auth-storage`)
- Clear `sessionStorage`
- Clear `Cookies`

Or run in console:

```javascript
localStorage.clear();
sessionStorage.clear();
```

#### Step 4: Test Login

1. Open `http://localhost:5173/login`
2. Enter credentials (username or phone for ASP.NET)
3. Verify login succeeds
4. Check DevTools Network tab:
   - `POST /auth/login` returns 200
   - Response has `result.accessToken`
   - `POST /auth/me` returns user profile

#### Step 5: Verify Data Loading

1. Navigate to `/users`
2. Verify table loads with pagination
3. Check Network tab:
   - Query params: `PageNumber=1&PageSize=10` (not `page`/`size`)
   - Response has `result.items` array

---

### From ASP.NET to Laravel

#### Step 1: Update Environment Variables

```env
# .env or .env.local
VITE_BACKEND_KIND=laravel
VITE_API_BASE_URL=http://localhost:8000/api/
```

#### Step 2: Restart Dev Server

```bash
# Stop server
Ctrl+C

# Restart
pnpm dev
```

#### Step 3: Clear Browser Storage

```javascript
localStorage.clear();
sessionStorage.clear();
```

#### Step 4: Test Login

1. Open `http://localhost:5173/login`
2. Enter email + password (Laravel always uses email)
3. Verify login succeeds
4. Check DevTools Network tab:
   - Request body has `{ email, password, type: "web" }`
   - Response has `access_token`, `token_type`, `expires_in`
   - `POST /auth/me` returns nested `user`, `pos`, `perm`

#### Step 5: Verify Data Loading

1. Navigate to `/users`
2. Verify table loads with pagination
3. Check Network tab:
   - Query params: `page=1&size=10` (not `PageNumber`/`PageSize`)
   - Response has `data` array directly

---

## Testing Checklist

After switching backends, test these features:

### Authentication

- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error
- [ ] Token is stored in `localStorage`
- [ ] `/me` endpoint returns user profile
- [ ] User profile displays in header/sidebar
- [ ] Permissions/role loaded correctly
- [ ] Token expiry time calculated correctly

### Data Fetching

- [ ] Users list page loads (`/users`)
- [ ] Pagination works (next/previous buttons)
- [ ] Page size dropdown works (10, 25, 50, 100)
- [ ] Column filtering works (if enabled)
- [ ] Export to CSV works (if enabled)

### CRUD Operations

- [ ] Create new user succeeds
- [ ] Edit existing user succeeds
- [ ] Delete user shows confirmation
- [ ] Delete user succeeds
- [ ] Table updates after mutations

### Error Handling

- [ ] 401 errors redirect to login
- [ ] 403 errors show permission denied
- [ ] Network errors show toast notification
- [ ] Validation errors display in forms

### i18n & RTL

- [ ] English translations load
- [ ] Arabic translations load
- [ ] RTL layout works in Arabic
- [ ] Direction switches correctly

---

## Troubleshooting

### Problem: Login Fails with 401

**Possible Causes:**

1. Wrong `VITE_API_BASE_URL`
2. Backend server not running
3. CORS not configured on server

**Solutions:**

```bash
# Check if backend is running
curl http://localhost:8000/api/auth/login  # Laravel
curl https://localhost:7000/api/auth/login # ASP.NET

# Verify env variable loaded
console.log(import.meta.env.VITE_API_BASE_URL)

# Check CORS headers in DevTools Network tab
```

---

### Problem: /me Endpoint Returns Unexpected Shape

**Symptoms:**

- Login succeeds but app crashes
- Console shows Zod validation errors
- User profile not displayed

**Solutions:**

1. **Check which schema is being used:**

```typescript
// In src/features/auth/hooks/useLogin.ts
console.log("Backend:", backendKind);
console.log("Raw /me response:", meResponse);
```

2. **Verify normalizer is called:**

```typescript
// In src/core/api/normalizers.ts
export function normalizeUserProfile(raw: unknown, backend: BackendKind) {
  console.log("Normalizing:", { raw, backend });
  // ...
}
```

3. **Check for envelope wrapping (ASP.NET):**

ASP.NET might return:

```json
{ "code": 200, "result": { "id": "...", "username": "..." } }
```

Or directly:

```json
{ "id": "...", "username": "..." }
```

The normalizer handles both cases.

---

### Problem: Lists Break with Pagination Errors

**Symptoms:**

- "Page 1 of NaN"
- Empty tables despite data in response
- Console errors about `totalPages` or `rowCount`

**Solutions:**

1. **Check query params format:**

```javascript
// DevTools Network tab → Request URL

// Laravel should have:
?page=1&size=10

// ASP.NET should have:
?PageNumber=1&PageSize=10
```

2. **Verify response structure matches schema:**

```typescript
// In client.ts, add logging
const normalizeAspNetResponse = <T>(raw: unknown) => {
  console.log("ASP.NET raw response:", raw);
  // ...
};

const normalizeLaravelResponse = <T>(raw: unknown) => {
  console.log("Laravel raw response:", raw);
  // ...
};
```

3. **Check if backend returns pagination metadata:**

Laravel:

- Must have `recordsTotal` and `data`

ASP.NET:

- Must have `result.totalPages`, `result.totalCount`, `result.items`

---

### Problem: Token Refresh Fails

**Laravel:**

Laravel refresh is implemented but requires re-sending credentials:

```typescript
// POST /auth/refresh
{
  "email": "user@example.com",
  "password": "password123",
  "type": "web"
}
```

**ASP.NET:**

ASP.NET refresh not yet implemented. Token refresh needs:

- Refresh token endpoint
- Logic to use `refreshToken` from stored tokens

**Workaround:**

- Increase token expiry time on backend
- Redirect to login on token expiry

---

### Problem: Field Names Don't Match

**Symptoms:**

- Create/Edit forms fail with validation errors
- Server returns "field not found" errors
- Data displays incorrectly

**Cause:**
Laravel uses `snake_case`, ASP.NET uses `PascalCase`, app uses `camelCase`

**Solution:**

Use field name normalizers (if needed):

```typescript
import {
  normalizeFieldNamesToServer,
  normalizeFieldNamesFromServer,
} from "@/core/api/normalizers";

// Before sending to server
const serverData = normalizeFieldNamesToServer(formData, backendKind);

// After receiving from server
const clientData = normalizeFieldNamesFromServer(responseData, backendKind);
```

**But:** Most cases are already handled in `client.ts` normalization.

---

### Problem: CSRF Token Errors (Laravel)

**Symptoms:**

- POST/PUT/DELETE requests fail with 419
- Error: "CSRF token mismatch"

**Cause:**
Laravel requires CSRF token for state-changing requests.

**Solution:**

CSRF is automatically handled in `src/core/security/csrf.ts`:

1. Token fetched from `/sanctum/csrf-cookie` on init
2. Token injected in `X-XSRF-TOKEN` header
3. Token refreshed on 419 errors

**Manual fix:**

```typescript
import { initializeCsrfToken } from "@/core/security/csrf";

// Call before first API request
await initializeCsrfToken();
```

---

### Problem: Rate Limiting Triggered

**Symptoms:**

- Requests fail with 429
- Error: "Too many requests"

**Cause:**
Rate limiter in `src/core/security/rateLimit.ts` throttles requests.

**Solution:**

Adjust limits in `client.ts`:

```typescript
import { DEFAULT_RATE_LIMITS } from "@/core/security/rateLimit";

// Current limits:
DEFAULT_RATE_LIMITS = {
  login: { maxRequests: 5, windowMs: 60000 }, // 5 per minute
  search: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
  upload: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  default: { maxRequests: 100, windowMs: 60000 }, // 100 per minute
};
```

---

## Backend-Specific Notes

### Laravel Specifics

**Authentication:**

- Uses Laravel Sanctum
- Tokens are stateless JWTs
- No refresh token (requires re-login)
- CSRF protection required

**Pagination:**

- DataTables format by default
- Can return full dataset in `data` array
- Client-side pagination for small datasets

**Permissions:**

- Array of string permissions: `["users.view", "users.create"]`
- Check with: `hasPermission("users.create")`

**POS Data:**

- Includes point-of-sale location info
- Only relevant for Laravel backend

---

### ASP.NET Specifics

**Authentication:**

- Custom JWT implementation
- Refresh tokens supported
- Session IDs for tracking

**Pagination:**

- Always envelope-wrapped
- Server-side pagination required
- Metadata: `totalPages`, `hasNextPage`, etc.

**Permissions:**

- Role-based: Single role per user
- Check with: `user.role === "Admin"`
- Can have multiple roles in `user.roles` array

**Field Naming:**

- PascalCase: `FirstName`, `PhoneNumber`, `IsDeleted`
- Auto-converted to camelCase by normalizers

---

## Summary

**Key Points:**

1. **Single configuration point**: `.env` file controls backend
2. **Automatic normalization**: All differences handled in `src/core/api/`
3. **No code changes needed**: Switch by changing env vars only
4. **Test thoroughly**: Use checklist after every switch
5. **Both backends work**: Fully tested and production-ready

**For implementation instructions, see:** [AI_AGENT_IMPLEMENTATION_GUIDE.md](./AI_AGENT_IMPLEMENTATION_GUIDE.md)
