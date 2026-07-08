import { GraduationCap, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { useAuth } from "@/context/auth";
import { useNavigate } from "react-router-dom";

export function AppHeader({ subtitle }: { subtitle?: string }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            Cổng tra cứu điểm học phần
          </p>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {session?.name && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.name}
            </span>
          )}
          <ModeToggle />
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
