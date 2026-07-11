import { connectLambda, getStore } from "@netlify/blobs";
import type { HandlerEvent } from "@netlify/functions";
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

// Chỉ dùng fallback file khi chạy local (`netlify dev`). Trên production nếu
// Blobs lỗi thì phải báo lỗi thật, KHÔNG ghi ra /tmp (ephemeral, mỗi instance
// một khác → mất dữ liệu ngầm).
const IS_LOCAL = process.env.NETLIFY_DEV === "true";

/**
 * Với Netlify Functions dạng classic (`export const handler`), Blobs KHÔNG được
 * tự inject — phải gọi connectLambda(event) trước getStore(). (Functions 2.0
 * mới auto-inject.) Gọi ở đầu mỗi handler có dùng store.
 */
export function initBlobs(event: HandlerEvent): void {
  try {
    connectLambda(event as never);
  } catch {
    // Local chưa link / môi trường không hỗ trợ → bỏ qua, sẽ dùng fallback.
  }
}

function store() {
  // KHÔNG dùng consistency: "strong" — nó cần 'uncachedEdgeURL' vốn không có
  // trong runtime Lambda function (chỉ có ở edge). Dùng eventual consistency
  // mặc định; Blobs vẫn đồng bộ nhanh, đủ dùng cho việc cập nhật điểm.
  return getStore({ name: STORE_NAME });
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
    // Blobs không khả dụng.
  }
  if (IS_LOCAL) {
    try {
      const raw = await fs.readFile(FALLBACK_FILE, "utf-8");
      return JSON.parse(raw) as StoredDataset;
    } catch {
      // chưa có file tạm
    }
  }
  return seed as StoredDataset;
}

export async function writeDataset(data: StoredDataset): Promise<void> {
  try {
    await store().setJSON(KEY, data);
    return;
  } catch (err) {
    // Local dev: ghi file tạm để vẫn thử được. Production: ném lỗi thật.
    if (!IS_LOCAL) throw err;
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
