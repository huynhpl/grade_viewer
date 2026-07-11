import type { Handler } from "@netlify/functions";

import { bearer, verifyToken } from "./_lib/auth";
import { methodNotAllowed, ok, serverError, unauthorized } from "./_lib/http";
import { findStudent, initBlobs, readDataset } from "./_lib/store";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") return methodNotAllowed();
  initBlobs(event);

  const payload = verifyToken(bearer(event.headers), Date.now());
  if (!payload || payload.role !== "student" || !payload.studentId) {
    return unauthorized();
  }

  try {
    const data = await readDataset();
    const student = findStudent(data, payload.studentId);
    if (!student) {
      return unauthorized("Không tìm thấy dữ liệu điểm cho tài khoản này");
    }
    return ok({ student });
  } catch (err) {
    console.error("me error", err);
    return serverError();
  }
};
