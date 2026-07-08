import type { Handler } from "@netlify/functions";

import { createToken } from "./_lib/auth";
import { badRequest, methodNotAllowed, ok, serverError, unauthorized } from "./_lib/http";
import { findStudent, readDataset } from "./_lib/store";

const INSTRUCTOR_USER = process.env.INSTRUCTOR_USER || "VKH100880";
const INSTRUCTOR_PASS = process.env.INSTRUCTOR_PASS || "VKH100880";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return methodNotAllowed();

  let payload: { role?: string; username?: string; password?: string };
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return badRequest("Dữ liệu không hợp lệ");
  }

  const { role, username, password } = payload;
  if (!role || !username || !password) {
    return badRequest("Vui lòng nhập đầy đủ thông tin đăng nhập");
  }

  // Netlify không cho phép Date.now trong workflow scripts, nhưng trong
  // functions runtime thì hoàn toàn hợp lệ.
  const now = Date.now();

  try {
    if (role === "instructor") {
      if (username.trim() !== INSTRUCTOR_USER || password !== INSTRUCTOR_PASS) {
        return unauthorized("Sai tài khoản hoặc mật khẩu giảng viên");
      }
      const token = createToken({ role: "instructor", name: "Giảng viên" }, now);
      return ok({ token, role: "instructor", name: "Giảng viên" });
    }

    if (role === "student") {
      const data = await readDataset();
      const student = findStudent(data, username);
      // So khớp mã SV + ngày sinh (YYYYMMDD). Trả về lỗi chung để tránh dò mã.
      if (!student || !student.dob || student.dob !== password.trim()) {
        return unauthorized("Sai mã sinh viên hoặc ngày sinh");
      }
      const token = createToken(
        { role: "student", studentId: student.studentId, name: student.name ?? undefined },
        now
      );
      return ok({
        token,
        role: "student",
        studentId: student.studentId,
        name: student.name,
      });
    }

    return badRequest("Vai trò không hợp lệ");
  } catch (err) {
    console.error("login error", err);
    return serverError();
  }
};
