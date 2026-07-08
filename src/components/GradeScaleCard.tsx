import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { LETTER_SCALE } from "@/lib/grades";

/** Bảng quy đổi GPA (hệ 10) → điểm chữ → điểm hệ 4. */
export function GradeScaleCard({
  highlightLetter,
}: {
  highlightLetter?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Thang quy đổi điểm chữ</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Điểm hệ 10</TableHead>
              <TableHead>Điểm chữ</TableHead>
              <TableHead className="text-right">Hệ 4</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LETTER_SCALE.map((b, i) => {
              const next = LETTER_SCALE[i - 1];
              const upper = next ? next.min : 10;
              const range =
                b.min === 0
                  ? "< 4.0"
                  : `${b.min.toFixed(1)} – ${
                      i === 0 ? "10" : (upper - 0.1).toFixed(1)
                    }`;
              const active = highlightLetter === b.letter;
              return (
                <TableRow
                  key={b.letter}
                  className={cn(active && "bg-accent/60")}
                >
                  <TableCell className="tabular">{range}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "font-semibold",
                        b.fail && "text-destructive",
                        active && "text-accent-foreground"
                      )}
                    >
                      {b.letter}
                    </span>
                  </TableCell>
                  <TableCell className="tabular text-right">
                    {b.gpa4.toFixed(1)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
