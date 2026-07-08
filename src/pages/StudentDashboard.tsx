import { useEffect, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Users, XCircle } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { GradeScaleCard } from "@/components/GradeScaleCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { fetchMe } from "@/lib/api";
import { GRADE_WEIGHTS, fmtDob, fmtScore, toLetterGrade } from "@/lib/grades";
import { cn } from "@/lib/utils";
import type { StudentRecord } from "@/lib/types";

export default function StudentDashboard() {
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchMe()
      .then((r) => alive && setStudent(r.student))
      .catch((e) => alive && setError(e.message ?? "Không tải được dữ liệu"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-secondary/30">
      <AppHeader subtitle="Trang sinh viên" />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {loading && <StudentSkeleton />}

        {!loading && error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Không tải được dữ liệu</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && student && <StudentView student={student} />}
      </main>
    </div>
  );
}

function StudentView({ student }: { student: StudentRecord }) {
  const grade = toLetterGrade(student.gpa);
  const passed = student.trangThaiThi?.toLowerCase().includes("đủ điều kiện");

  return (
    <div className="space-y-6">
      {/* Hồ sơ */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold">{student.name}</h2>
            <p className="tabular text-sm text-muted-foreground">
              {student.studentId}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" />
                {student.lopHanhChinh ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {fmtDob(student.dob)}
              </span>
            </div>
          </div>
          <StatusBadge passed={passed} label={student.trangThaiThi} />
        </CardContent>
      </Card>

      {/* GPA + điểm chữ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kết quả học phần</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <GpaTile label="GPA (hệ 10)" value={fmtScore(student.gpa)} />
            <GpaTile
              label="Điểm chữ"
              value={grade?.letter ?? "—"}
              accent={grade?.fail ? "destructive" : "primary"}
            />
            <GpaTile
              label="Điểm hệ 4"
              value={grade ? grade.gpa4.toFixed(1) : "—"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Các đầu điểm thành phần */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Các đầu điểm thành phần</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {GRADE_WEIGHTS.map(({ key, label, weight }, i) => (
            <div key={key}>
              {i > 0 && <Separator className="my-1" />}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{label}</span>
                  <Badge variant="secondary" className="tabular">
                    {Math.round(weight * 100)}%
                  </Badge>
                </div>
                <span className="tabular text-lg font-semibold">
                  {fmtScore(student[key] as number | null)}
                </span>
              </div>
            </div>
          ))}
          <Separator className="my-1" />
          <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
            <span>Điểm tổng kết thi (TN 50% + SQL 50%)</span>
            <span className="tabular font-medium text-foreground">
              {fmtScore(student.diemTongKet)}
            </span>
          </div>
        </CardContent>
      </Card>

      <GradeScaleCard highlightLetter={grade?.letter} />
    </div>
  );
}

function GpaTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "primary" | "destructive";
}) {
  return (
    <div className="rounded-lg border bg-background p-4 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "tabular mt-1 text-3xl font-bold",
          accent === "primary" && "text-primary",
          accent === "destructive" && "text-destructive"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  passed,
  label,
}: {
  passed?: boolean;
  label: string | null;
}) {
  return (
    <Badge
      variant={passed ? "success" : "destructive"}
      className="shrink-0 gap-1.5 px-3 py-1.5 text-sm"
    >
      {passed ? (
        <CheckCircle2 className="size-4" />
      ) : (
        <XCircle className="size-4" />
      )}
      {label ?? "—"}
    </Badge>
  );
}

function StudentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
