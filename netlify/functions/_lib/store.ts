import { getStore } from "@netlify/blobs";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import seed from "../_data/seed.json";

export interface StoredStudent {
  stt: number | null;
  caThi: string | null;
  studentId: string;
  name: string | null;
  diemTN: number | null;
  diemSQL: number | null;
  diemTongKet: number | null;
  dob: string | null;
  lopHanhChinh: string | null;
  lopHocPhan: string | null;
  trangThaiThi: string | null;
  chuyenCan: number | null;
  btThaoLuan: number | null;
  trungBinhKiemTra: number | null;
  gpa: number | null;
}

export interface StoredDataset {
  updatedAt: string | null;
  source: string | null;
  students: StoredStudent[];
}

const STORE_NAME = "grades";
const KEY = "dataset";

// Fallback ghi ra file tạm khi Netlify Blobs chưa được cấu hình — dùng cho
// `netlify dev` chưa `netlify link`. Trên Netlify production, Blobs luôn sẵn
// sàng nên nhánh này không bao giờ chạy.
const FALLBACK_FILE = path.join(os.tmpdir(), "grade-viewer-dataset.json");

function store() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

/**
 * Đọc dữ liệu điểm. Thứ tự ưu tiên: Netlify Blobs → file tạm cục bộ (dev) →
 * dữ liệu seed đóng gói sẵn từ Excel gốc (app chạy ngay sau khi deploy).
 */
export async function readDataset(): Promise<StoredDataset> {
  try {
    const blob = await store().get(KEY, { type: "json" });
    if (blob) return blob as StoredDataset;
    // Blobs khả dụng nhưng trống → dùng seed.
    return seed as StoredDataset;
  } catch {
    // Blobs không khả dụng (local dev chưa link) → thử file tạm, rồi seed.
  }
  try {
    const raw = await fs.readFile(FALLBACK_FILE, "utf-8");
    return JSON.parse(raw) as StoredDataset;
  } catch {
    return seed as StoredDataset;
  }
}

export async function writeDataset(data: StoredDataset): Promise<void> {
  try {
    await store().setJSON(KEY, data);
    return;
  } catch {
    // Blobs không khả dụng → ghi file tạm để local dev vẫn cập nhật được.
  }
  await fs.writeFile(FALLBACK_FILE, JSON.stringify(data), "utf-8");
}

/** Tra cứu 1 sinh viên theo mã (không phân biệt hoa/thường). */
export function findStudent(
  data: StoredDataset,
  studentId: string
): StoredStudent | undefined {
  const id = studentId.trim().toLowerCase();
  return data.students.find((s) => s.studentId.trim().toLowerCase() === id);
}
