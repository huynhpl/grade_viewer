import { LETTER_SCALE, toLetterGrade } from "@/lib/grades";
import type { StudentRecord } from "@/lib/types";

export interface Stats {
  total: number;
  graded: number;
  avgGpa: number | null;
  passCount: number;
  failCount: number;
  gpaDistribution: { range: string; count: number }[];
  letterDistribution: { letter: string; count: number; fail: boolean }[];
}

const GPA_BANDS: [number, number, string][] = [
  [0, 2, "0–2"],
  [2, 4, "2–4"],
  [4, 5.5, "4–5.5"],
  [5.5, 7, "5.5–7"],
  [7, 8.5, "7–8.5"],
  [8.5, 10.01, "8.5–10"],
];

export function computeStats(students: StudentRecord[]): Stats {
  const gpas = students
    .map((s) => s.gpa)
    .filter((g): g is number => g != null && !Number.isNaN(g));

  const avgGpa =
    gpas.length > 0 ? gpas.reduce((a, b) => a + b, 0) / gpas.length : null;

  const gpaDistribution = GPA_BANDS.map(([lo, hi, range]) => ({
    range,
    count: gpas.filter((g) => g >= lo && g < hi).length,
  }));

  const letterCounts = new Map<string, number>();
  for (const g of gpas) {
    const l = toLetterGrade(g);
    if (l) letterCounts.set(l.letter, (letterCounts.get(l.letter) ?? 0) + 1);
  }
  // Giữ thứ tự A+ … F.
  const letterDistribution = [...LETTER_SCALE]
    .reverse()
    .map((b) => ({
      letter: b.letter,
      count: letterCounts.get(b.letter) ?? 0,
      fail: b.fail,
    }));

  const passCount = students.filter((s) =>
    s.trangThaiThi?.toLowerCase().includes("đủ điều kiện")
  ).length;

  return {
    total: students.length,
    graded: gpas.length,
    avgGpa,
    passCount,
    failCount: students.length - passCount,
    gpaDistribution,
    letterDistribution,
  };
}
