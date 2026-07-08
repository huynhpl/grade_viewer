import { useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadExcel } from "@/lib/api";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:...;base64,XXXX → chỉ lấy phần base64.
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Không đọc được tệp"));
    reader.readAsDataURL(file);
  });
}

export function UploadCard({ onUploaded }: { onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setOk(null);
    setBusy(true);
    try {
      const b64 = await fileToBase64(file);
      const res = await uploadExcel(b64, file.name);
      setOk(`Đã cập nhật ${res.count} sinh viên.`);
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải lên thất bại");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cập nhật điểm từ Excel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Tải lên tệp <span className="font-medium text-foreground">.xlsx</span>{" "}
          theo đúng định dạng bảng điểm tổng kết. Dữ liệu hiện tại sẽ được thay
          thế cho tất cả sinh viên.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={onFile}
        />
        <Button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-full sm:w-auto"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <FileUp className="size-4" />
          )}
          {busy ? "Đang xử lý…" : "Chọn tệp Excel"}
        </Button>

        {ok && (
          <Alert variant="success">
            <CheckCircle2 className="size-4" />
            <AlertDescription>{ok}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <Upload className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
