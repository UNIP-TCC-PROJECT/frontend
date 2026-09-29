import { useMemo, useState } from "react";
import { Toggle } from "../../../components/Toggle/index";
import { DonorRegisterForm } from "./DonorRegisterForm";
import { NgoRegisterForm } from "./NgoRegisterForm";

type RegisterMode = "ngo" | "donor";

interface RegisterFormProps {
  onBackToLogin: () => void;
}

export function RegisterForm({ onBackToLogin }: RegisterFormProps) {
  const [registerMode, setRegisterMode] = useState<RegisterMode>("ngo");

  const registerItems = useMemo(
    () => [
      { id: "ngo", label: "ONG" },
      { id: "donor", label: "Doador" },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="font-semibold text-brand-primary hover:text-brand-primaryDark text-sm transition"
        >
          Voltar para o login
        </button>
        <h2 className="font-serif text-brand-text text-2xl">Criar conta</h2>
        <p className="text-brand-text/60 text-sm">
          Escolha o tipo de cadastro para continuar.
        </p>
      </header>

      <Toggle
        items={registerItems}
        activeId={registerMode}
        onChange={(id) => setRegisterMode(id as RegisterMode)}
        ariaLabel="Registration type"
      />

      <div
        id={`register-panel-${registerMode}`}
        role="region"
        aria-live="polite"
        className="space-y-6 fade-in"
      >
        {registerMode === "ngo" ? <NgoRegisterForm /> : <DonorRegisterForm />}
      </div>
    </div>
  );
}
