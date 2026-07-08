import type { Dataset, Role, Session, StudentRecord } from "@/lib/types";

const TOKEN_KEY = "rt-session";

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Session) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(s));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = loadSession();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (session?.token) headers.set("Authorization", `Bearer ${session.token}`);

  const res = await fetch(`/api/${path}`, { ...init, headers });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? `Lỗi ${res.status}`);
  }
  return body as T;
}

export async function login(
  role: Role,
  username: string,
  password: string
): Promise<Session> {
  return request<Session>("login", {
    method: "POST",
    body: JSON.stringify({ role, username, password }),
  });
}

/** Sinh viên: lấy bản ghi điểm của chính mình. */
export async function fetchMe(): Promise<{ student: StudentRecord }> {
  return request("me");
}

/** Giảng viên: lấy toàn bộ dữ liệu. */
export async function fetchDataset(): Promise<Dataset> {
  return request("data");
}

/** Giảng viên: upload file Excel (base64) để cập nhật điểm. */
export async function uploadExcel(
  fileBase64: string,
  filename: string
): Promise<{ count: number; updatedAt: string }> {
  return request("upload", {
    method: "POST",
    body: JSON.stringify({ fileBase64, filename }),
  });
}

export { ApiError };
