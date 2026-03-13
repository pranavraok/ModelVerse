export type UserRole = "creator" | "buyer" | "node-operator"

interface ApiUser {
  id?: string
  email?: string
  name?: string
  role?: UserRole
}

interface LoginResponse {
  message: string
  user: ApiUser
  access_token?: string
  role?: UserRole
  needs_role_selection?: boolean
}

interface SignupResponse {
  message: string
  user: ApiUser
  access_token?: string
  needs_role_selection?: boolean
}

interface MeResponse {
  user: ApiUser
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data?.detail || data?.message || "Request failed"
    throw new Error(message)
  }

  return data as T
}

export function roleToDashboardPath(role: UserRole): string {
  if (role === "creator") return "/creator"
  if (role === "buyer") return "/buyer"
  return "/node-operator"
}

export async function signupWithRole(payload: {
  name: string
  email: string
  password: string
  role: UserRole
}): Promise<SignupResponse> {
  return apiRequest<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function loginWithPassword(payload: {
  email: string
  password: string
}): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function selectUserRole(payload: {
  role: UserRole
  accessToken: string
}) {
  return apiRequest<{ role: UserRole; user: ApiUser }>("/auth/select-role", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
    },
    body: JSON.stringify({ role: payload.role }),
  })
}

export async function getCurrentUser(payload: { accessToken: string }): Promise<MeResponse> {
  return apiRequest<MeResponse>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
    },
  })
}
