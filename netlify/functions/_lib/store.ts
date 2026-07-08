import { getStore } from "@netlify/blobs";

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

function store() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

/**
 * Đọc dữ liệu điểm. Nếu Blob chưa có (chưa từng upload), trả về dữ liệu seed
 * được đóng gói sẵn từ file Excel gốc — app hoạt động ngay sau khi deploy.
 */
export async function readDataset(): Promise<StoredDataset> {
  try {
    const blob = await store().get(KEY, { type: "json" });
    if (blob) return blob as StoredDataset;
  } catch {
    // Blobs không khả dụng (vd. thiếu cấu hình) → dùng seed.
  }
  return seed as StoredDataset;
}

export async function writeDataset(data: StoredDataset): Promise<void> {
  await store().setJSON(KEY, data);
}

/** Tra cứu 1 sinh viên theo mã (không phân biệt hoa/thường). */
export function findStudent(
  data: StoredDataset,
  studentId: string
): StoredStudent | undefined {
  const id = studentId.trim().toLowerCase();
  return data.students.find((s) => s.studentId.trim().toLowerCase() === id);
}
