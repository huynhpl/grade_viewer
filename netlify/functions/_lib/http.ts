import type { HandlerResponse } from "@netlify/functions";

const baseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

export function json(statusCode: number, body: unknown): HandlerResponse {
  return { statusCode, headers: baseHeaders, body: JSON.stringify(body) };
}

export function ok(body: unknown) {
  return json(200, body);
}

export function badRequest(message: string) {
  return json(400, { error: message });
}

export function unauthorized(message = "Phiên đăng nhập không hợp lệ") {
  return json(401, { error: message });
}

export function forbidden(message = "Bạn không có quyền truy cập") {
  return json(403, { error: message });
}

export function methodNotAllowed() {
  return json(405, { error: "Phương thức không được hỗ trợ" });
}

export function serverError(message = "Lỗi máy chủ") {
  return json(500, { error: message });
}
