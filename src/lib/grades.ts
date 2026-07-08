import type { StudentRecord } from "@/lib/types";

/**
 * Trọng số các đầu điểm thành phần (tổng = 100%).
 * GPA đã được tính sẵn trong file nên KHÔNG tính lại — các trọng số này chỉ
 * dùng để hiển thị/giải thích cấu trúc điểm cho người dùng.
 */
export const GRADE_WEIGHTS = [
  { key: "diemTN", label: "Điểm TN", weight: 0.25 },
  { key: "diemSQL", label: "Điểm SQL", weight: 0.25 },
  { key: "chuyenCan", label: "Chuyên cần", weight: 0.1 },
  { key: "trungBinhKiemTra", label: "TBKT", weight: 0.2 },
  { key: "btThaoLuan", label: "BTTL", weight: 0.2 },
] as const satisfies ReadonlyArray<{
  key: keyof StudentRecord;
  label: string;
  weight: number;
}>;

export interface LetterGrade {
  letter: string;
  gpa4: number;
  /** true nếu là điểm trượt (F) */
  fail: boolean;
}

/**
 * Thang quy đổi GPA hệ 10 → điểm chữ (thang PTIT chuẩn).
 * Sắp xếp giảm dần theo ngưỡng `min` (bao gồm cận dưới).
 */
export const LETTER_SCALE: ReadonlyArray<LetterGrade & { min: number }> = [
  { min: 9.0, letter: "A+", gpa4: 4.0, fail: false },
  { min: 8.5, letter: "A", gpa4: 3.7, fail: false },
  { min: 8.0, letter: "B+", gpa4: 3.5, fail: false },
  { min: 7.0, letter: "B", gpa4: 3.0, fail: false },
  { min: 6.5, letter: "C+", gpa4: 2.5, fail: false },
  { min: 5.5, letter: "C", gpa4: 2.0, fail: false },
  { min: 5.0, letter: "D+", gpa4: 1.5, fail: false },
  { min: 4.0, letter: "D", gpa4: 1.0, fail: false },
  { min: 0.0, letter: "F", gpa4: 0.0, fail: true },
];

/** Quy đổi một GPA hệ 10 sang điểm chữ + điểm hệ 4. */
export function toLetterGrade(gpa10: number | null | undefined): LetterGrade | null {
  if (gpa10 == null || Number.isNaN(gpa10)) return null;
  const clamped = Math.max(0, Math.min(10, gpa10));
  const band = LETTER_SCALE.find((b) => clamped >= b.min) ?? LETTER_SCALE.at(-1)!;
  return { letter: band.letter, gpa4: band.gpa4, fail: band.fail };
}

/** Định dạng điểm số gọn gàng (bỏ số 0 thừa, tối đa 2 chữ số thập phân). */
export function fmtScore(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  return Number(v.toFixed(2)).toString();
}

/** Định dạng ngày sinh YYYYMMDD → DD/MM/YYYY. */
export function fmtDob(dob: string | null | undefined): string {
  if (!dob || dob.length !== 8) return "—";
  return `${dob.slice(6, 8)}/${dob.slice(4, 6)}/${dob.slice(0, 4)}`;
}
