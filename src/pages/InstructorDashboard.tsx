import { useCallback, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { UploadCard } from "@/components/UploadCard";
import { StatTiles } from "@/components/StatTiles";
import { GradeCharts } from "@/components/GradeCharts";
import { StudentsTable } from "@/components/StudentsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchDataset } from "@/lib/api";
import { computeStats } from "@/lib/stats";
import type { Dataset } from "@/lib/types";

export default function InstructorDashboard() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchDataset()
      .then(setDataset)
      .catch((e) => setError(e.message ?? "Không tải được dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = dataset ? computeStats(dataset.students) : null;

  return (
    <div className="min-h-dvh bg-secondary/30">
      <AppHeader subtitle="Trang giảng viên" />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <UploadCard onUploaded={load} />

        {dataset?.updatedAt && (
          <p className="text-xs text-muted-foreground">
            Cập nhật lần cuối: {formatUpdatedAt(dataset.updatedAt)} · Nguồn:{" "}
            {dataset.source ?? "—"}
          </p>
        )}

        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {!loading && error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Không tải được dữ liệu</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && stats && dataset && (
          <>
            <StatTiles stats={stats} />
            <GradeCharts stats={stats} />
            <StudentsTable students={dataset.students} />
          </>
        )}
      </main>
    </div>
  );
}

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(
    d.getMonth() + 1
  )}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
