import { useState } from "react";
import { Card } from "../../components/Card/index";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";

interface LoginForm {
  email: string;
  password: string;
}

type AuthMode = "login" | "register";

export default function Auth() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  return (
    <div className="bg-brand-background min-h-screen text-brand-text">
      <div className="flex flex-col mx-auto px-4 py-12 w-full max-w-4xl">
        <header className="text-center">
          <div className="flex justify-center items-center bg-blue-50 mx-auto rounded-2xl w-12 h-12 font-semibold text-brand-primary text-lg">
            AC
          </div>
          <h1 className="mt-4 font-semibold text-2xl">Awen Connect</h1>
          <p className="mt-2 text-slate-500 text-sm">
            Plataforma segura para ONGs e doadores.
          </p>
        </header>

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
    </div>
  );
}
