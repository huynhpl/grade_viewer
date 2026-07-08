import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Loader2, LogIn, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/ModeToggle";
import { useAuth } from "@/context/auth";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const s = await login(role, username, password);
      navigate(s.role === "instructor" ? "/giang-vien" : "/sinh-vien", {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Không kết nối được máy chủ"
      );
    } finally {
      setLoading(false);
    }
  }

  const isStudent = role === "student";

  return (
    <main className="grid min-h-dvh place-items-center bg-gradient-to-b from-background to-secondary/40 px-4 py-10">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Cổng tra cứu điểm học phần
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Đăng nhập để xem điểm và GPA của bạn
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-3">
            <div
              role="tablist"
              aria-label="Chọn vai trò đăng nhập"
              className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
            >
              <RoleTab
                active={isStudent}
                icon={<GraduationCap className="size-4" />}
                label="Sinh viên"
                onClick={() => {
                  setRole("student");
                  setError(null);
                }}
              />
              <RoleTab
                active={!isStudent}
                icon={<UserCog className="size-4" />}
                label="Giảng viên"
                onClick={() => {
                  setRole("instructor");
                  setError(null);
                }}
              />
            </div>
            <div>
              <CardTitle className="text-lg">
                {isStudent ? "Đăng nhập sinh viên" : "Đăng nhập giảng viên"}
              </CardTitle>
              <CardDescription>
                {isStudent
                  ? "Mã sinh viên và ngày sinh (YYYYMMDD)"
                  : "Tài khoản quản lý điểm học phần"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  {isStudent ? "Mã sinh viên" : "Tài khoản"}
                </Label>
                <Input
                  id="username"
                  autoComplete="username"
                  autoFocus
                  placeholder={isStudent ? "VD: B25DCCC049" : "VD: VKH100880"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {isStudent ? "Ngày sinh (YYYYMMDD)" : "Mật khẩu"}
                </Label>
                <Input
                  id="password"
                  type={isStudent ? "text" : "password"}
                  inputMode={isStudent ? "numeric" : "text"}
                  autoComplete={isStudent ? "off" : "current-password"}
                  placeholder={isStudent ? "VD: 20071016" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                ) : (
                  <LogIn className="size-4" />
                )}
                Đăng nhập
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Học phần INT1313 · Trắc nghiệm 50% + SQL 50%
        </p>
      </div>
    </main>
  );
}

function RoleTab({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
