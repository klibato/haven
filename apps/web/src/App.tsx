import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export function App() {
  const { isAuthenticated } = useAuthStore();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-bg-primary flex items-center justify-center">
        {authMode === "login" ? (
          <LoginForm onSwitchToRegister={() => setAuthMode("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthMode("login")} />
        )}
      </div>
    );
  }

  return <MainLayout />;
}
