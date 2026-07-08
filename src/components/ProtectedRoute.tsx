import { Navigate } from "react-router-dom";

import { useAuth } from "@/context/auth";
import type { Role } from "@/lib/types";

export function ProtectedRoute({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { session } = useAuth();

  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) {
    // Đăng nhập nhầm vai trò → chuyển về trang phù hợp.
    return (
      <Navigate
        to={session.role === "instructor" ? "/giang-vien" : "/sinh-vien"}
        replace
      />
    );
  }
  return <>{children}</>;
}
