import "@fontsource-variable/outfit";
import "@fontsource-variable/jetbrains-mono";
import "@/index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import StudentDashboard from "@/pages/StudentDashboard";
import InstructorDashboard from "@/pages/InstructorDashboard";
import NotFound from "@/pages/NotFound";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  {
    path: "/sinh-vien",
    element: (
      <ProtectedRoute role="student">
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/giang-vien",
    element: (
      <ProtectedRoute role="instructor">
        <InstructorDashboard />
      </ProtectedRoute>
    ),
  },
  { path: "*", element: <NotFound /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="rt-theme">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
