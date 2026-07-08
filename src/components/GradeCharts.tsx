import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChartColors } from "@/hooks/useChartColors";
import type { Stats } from "@/lib/stats";

export function GradeCharts({ stats }: { stats: Stats }) {
  const c = useChartColors();

  const axis = { fontSize: 12, fill: c.muted };
  const tooltipStyle = {
    background: "hsl(var(--popover))",
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    fontSize: 13,
    color: "hsl(var(--popover-foreground))",
  } as const;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Phân bố GPA (hệ 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.gpaDistribution}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
                <XAxis dataKey="range" tick={axis} tickLine={false} axisLine={{ stroke: c.border }} />
                <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: c.muted, opacity: 0.1 }}
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [`${v} SV`, "Số lượng"]}
                />
                <Bar dataKey="count" fill={c.primary} radius={[4, 4, 0, 0]} maxBarSize={64} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Phân bố điểm chữ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.letterDistribution}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
                <XAxis dataKey="letter" tick={axis} tickLine={false} axisLine={{ stroke: c.border }} />
                <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: c.muted, opacity: 0.1 }}
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [`${v} SV`, "Số lượng"]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {stats.letterDistribution.map((d) => (
                    <Cell key={d.letter} fill={d.fail ? c.destructive : c.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
