import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "../../components/Card/index";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";

interface LoginForm {
  email: string;
  password: string;
}

type AuthMode = "login" | "register";

export default function Auth() {
  const [searchParams] = useSearchParams();

  const [authMode, setAuthMode] = useState<AuthMode>(
    searchParams.get("modo") === "cadastro" ? "register" : "login",
  );

  return (
    <div className="flex flex-col mx-auto w-full max-w-4xl text-brand-text">
      <Card className="mt-8">
        <div className="fade-in">
          {authMode === "login" ? (
            <LoginForm onCreateAccount={() => setAuthMode("register")} />
          ) : (
            <RegisterForm onBackToLogin={() => setAuthMode("login")} />
          )}
        </div>
      </Card>
    </div>
  );
}
