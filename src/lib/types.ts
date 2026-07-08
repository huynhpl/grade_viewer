export interface StudentRecord {
  stt: number | null;
  caThi: string | null;
  studentId: string;
  name: string | null;
  /** Điểm trắc nghiệm (0–10) — trọng số 25% */
  diemTN: number | null;
  /** Điểm SQL (0–10) — trọng số 25% */
  diemSQL: number | null;
  /** Điểm tổng kết thi (TN 50% + SQL 50%) — hiển thị tham khảo */
  diemTongKet: number | null;
  /** Ngày sinh dạng YYYYMMDD (dùng làm mật khẩu sinh viên) */
  dob: string | null;
  lopHanhChinh: string | null;
  lopHocPhan: string | null;
  trangThaiThi: string | null;
  /** Điểm chuyên cần (0–10) — trọng số 10% */
  chuyenCan: number | null;
  /** Điểm bài tập, thảo luận / BTTL (0–10) — trọng số 20% */
  btThaoLuan: number | null;
  /** Trung bình kiểm tra / TBKT (0–10) — trọng số 20% */
  trungBinhKiemTra: number | null;
  /** GPA hệ 10 — tính sẵn trong file, chỉ hiển thị */
  gpa: number | null;
}

export interface Dataset {
  updatedAt: string | null;
  source: string | null;
  students: StudentRecord[];
}

export type Role = "student" | "instructor";

export interface Session {
  token: string;
  role: Role;
  /** Chỉ có với sinh viên */
  studentId?: string;
  name?: string;
}
