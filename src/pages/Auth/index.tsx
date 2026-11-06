import { useSearchParams } from "react-router-dom";
import { Card } from "../../components/Card/index";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";

type AuthMode = "login" | "register";

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();

  // O modo vem sempre da URL: links do header (/auth e /auth?modo=cadastro) e os botões
  // internos ficam sincronizados, mesmo sem recarregar a página.
  const authMode: AuthMode = searchParams.get("modo") === "cadastro" ? "register" : "login";

  const setAuthMode = (mode: AuthMode) => {
    setSearchParams(mode === "register" ? { modo: "cadastro" } : {});
    window.scrollTo({ top: 0 });
  };

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
