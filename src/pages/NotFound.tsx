import { Link } from "react-router-dom";
import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="text-center">
        <p className="tabular text-6xl font-bold text-primary">404</p>
        <h1 className="mt-2 text-xl font-semibold">Không tìm thấy trang</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trang bạn truy cập không tồn tại hoặc đã bị di chuyển.
        </p>
        <Button asChild className="mt-6">
          <Link to="/login">
            <Home className="size-4" />
            Về trang đăng nhập
          </Link>
        </Button>
      </div>
    </main>
  );
}
