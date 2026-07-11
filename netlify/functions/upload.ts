import type { Handler } from "@netlify/functions";
import * as XLSX from "xlsx";

import { bearer, verifyToken } from "./_lib/auth";
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  ok,
  serverError,
  unauthorized,
} from "./_lib/http";
import { initBlobs, writeDataset, type StoredStudent } from "./_lib/store";

/** Bỏ dấu tiếng Việt + chuẩn hoá để so khớp tên cột. */
function norm(s: unknown): string {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Ánh xạ tên cột (đã chuẩn hoá) → trường dữ liệu.
const COLUMN_MAP: Record<string, keyof StoredStudent> = {
  "stt": "stt",
  "ca thi": "caThi",
  "ma sinh vien": "studentId",
  "ho va ten": "name",
  "diem tn": "diemTN",
  "diem sql": "diemSQL",
  "diem tong ket": "diemTongKet",
  "ngay sinh": "dob",
  "lop hanh chinh": "lopHanhChinh",
  "lop hoc phan": "lopHocPhan",
  "trang thai thi": "trangThaiThi",
  "chuyen can": "chuyenCan",
  "bai tap thao luan": "btThaoLuan",
  "trung binh kiem tra": "trungBinhKiemTra",
  "gpa": "gpa",
};

const NUMERIC_FIELDS: (keyof StoredStudent)[] = [
  "stt",
  "diemTN",
  "diemSQL",
  "diemTongKet",
  "chuyenCan",
  "btThaoLuan",
  "trungBinhKiemTra",
  "gpa",
];

function toNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function toDob(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
  }
  const digits = String(v).replace(/\D/g, "");
  // Hỗ trợ DD/MM/YYYY → YYYYMMDD nếu không phải sẵn dạng YYYYMMDD.
  if (digits.length === 8) {
    // Nếu 4 số đầu là năm hợp lệ thì giữ nguyên, ngược lại đảo DDMMYYYY.
    const head = Number(digits.slice(0, 4));
    if (head >= 1900 && head <= 2100) return digits;
    return `${digits.slice(4, 8)}${digits.slice(2, 4)}${digits.slice(0, 2)}`;
  }
  return digits || null;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return methodNotAllowed();
  initBlobs(event);

  const auth = verifyToken(bearer(event.headers), Date.now());
  if (!auth) return unauthorized();
  if (auth.role !== "instructor") return forbidden();

  let body: { fileBase64?: string; filename?: string };
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return badRequest("Dữ liệu không hợp lệ");
  }
  if (!body.fileBase64) return badRequest("Thiếu tệp Excel");

  try {
    const buf = Buffer.from(body.fileBase64, "base64");
    const wb = XLSX.read(buf, { type: "buffer", cellDates: true });

    // Ưu tiên sheet "Bảng điểm tổng kết", nếu không có thì lấy sheet đầu.
    const sheetName =
      wb.SheetNames.find((n) => norm(n).includes("bang diem")) ??
      wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return badRequest("Không đọc được nội dung tệp");

    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
      raw: true,
    });

    // Tìm dòng tiêu đề chứa "Mã sinh viên".
    const headerIdx = rows.findIndex((r) =>
      r.some((c) => norm(c) === "ma sinh vien")
    );
    if (headerIdx === -1) {
      return badRequest(
        "Không tìm thấy cột 'Mã sinh viên'. Vui lòng dùng đúng định dạng file điểm."
      );
    }

    const header = rows[headerIdx];
    const colToField = new Map<number, keyof StoredStudent>();
    header.forEach((cell, i) => {
      const field = COLUMN_MAP[norm(cell)];
      if (field) colToField.set(i, field);
    });
    if (!Array.from(colToField.values()).includes("studentId")) {
      return badRequest("Không xác định được cột mã sinh viên");
    }

    const students: StoredStudent[] = [];
    for (let r = headerIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      const rec: Partial<StoredStudent> = {};
      for (const [col, field] of colToField) {
        const raw = row[col];
        if (field === "dob") rec.dob = toDob(raw);
        else if (field === "studentId") rec.studentId = String(raw ?? "").trim();
        else if (NUMERIC_FIELDS.includes(field))
          (rec[field] as number | null) = toNumber(raw);
        else (rec[field] as string | null) = raw == null ? null : String(raw).trim();
      }
      if (rec.studentId) students.push(rec as StoredStudent);
    }

    if (students.length === 0) {
      return badRequest("Không tìm thấy dòng dữ liệu sinh viên nào");
    }

    const updatedAt = new Date().toISOString();
    await writeDataset({
      updatedAt,
      source: body.filename ?? "upload.xlsx",
      students,
    });

    return ok({ count: students.length, updatedAt });
  } catch (err) {
    console.error("upload error", err);
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return serverError(`Không xử lý được tệp Excel — ${detail}`);
  }
};
