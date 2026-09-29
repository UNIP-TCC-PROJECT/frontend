import { useState } from "react";
import { Link } from "react-router-dom";
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
          <h1 className="mt-4 font-serif text-3xl">DoaFácil</h1>
          <p className="mt-2 text-brand-text/60 text-sm">
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
