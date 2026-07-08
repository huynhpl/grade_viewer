import { CheckCircle2, GraduationCap, Sigma, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { fmtScore, toLetterGrade } from "@/lib/grades";
import type { Stats } from "@/lib/stats";

export function StatTiles({ stats }: { stats: Stats }) {
  const avgLetter = toLetterGrade(stats.avgGpa)?.letter ?? "—";
  const tiles = [
    {
      label: "Tổng sinh viên",
      value: stats.total.toString(),
      icon: <Users className="size-5" />,
    },
    {
      label: "GPA trung bình",
      value: fmtScore(stats.avgGpa),
      icon: <Sigma className="size-5" />,
    },
    {
      label: "Điểm chữ TB",
      value: avgLetter,
      icon: <GraduationCap className="size-5" />,
    },
    {
      label: "Đủ điều kiện",
      value: `${stats.passCount}/${stats.total}`,
      icon: <CheckCircle2 className="size-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((t) => (
        <Card key={t.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
              {t.icon}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{t.label}</p>
              <p className="tabular text-xl font-bold">{t.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
