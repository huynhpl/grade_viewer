import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtScore, toLetterGrade } from "@/lib/grades";
import type { StudentRecord } from "@/lib/types";

const ALL = "all";

export function StudentsTable({ students }: { students: StudentRecord[] }) {
  const [query, setQuery] = useState("");
  const [cls, setCls] = useState<string>(ALL);

  const classes = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.lopHanhChinh && set.add(s.lopHanhChinh));
    return [...set].sort();
  }, [students]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students
      .filter((s) => cls === ALL || s.lopHanhChinh === cls)
      .filter(
        (s) =>
          !q ||
          s.studentId.toLowerCase().includes(q) ||
          (s.name ?? "").toLowerCase().includes(q)
      )
      .sort((a, b) => (b.gpa ?? -1) - (a.gpa ?? -1));
  }, [students, query, cls]);

  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle className="text-base">
          Danh sách điểm sinh viên
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({rows.length})
          </span>
        </CardTitle>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Tìm theo mã SV hoặc họ tên…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Tìm kiếm sinh viên"
            />
          </div>
          <Select value={cls} onValueChange={setCls}>
            <SelectTrigger className="sm:w-56" aria-label="Lọc theo lớp">
              <SelectValue placeholder="Tất cả lớp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tất cả lớp</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Không tìm thấy sinh viên phù hợp.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã SV</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead className="hidden md:table-cell">Lớp</TableHead>
                <TableHead className="text-right">GPA</TableHead>
                <TableHead className="text-center">Điểm chữ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => {
                const g = toLetterGrade(s.gpa);
                return (
                  <TableRow key={s.studentId}>
                    <TableCell className="tabular font-medium">
                      {s.studentId}
                    </TableCell>
                    <TableCell className="max-w-[12rem] truncate">
                      {s.name}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {s.lopHanhChinh ?? "—"}
                    </TableCell>
                    <TableCell className="tabular text-right font-semibold">
                      {fmtScore(s.gpa)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={g?.fail ? "destructive" : "secondary"}>
                        {g?.letter ?? "—"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
