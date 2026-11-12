interface MyAccountModalProps {
  setOpen: (open: boolean) => void;
  navigate: (path: string) => void;
  logout: () => void;
  isOng?: boolean;
  isDonor?: boolean;
  isParticipant?: boolean;
}

const itemClass =
  "hover:bg-brand-champagne px-4 py-2 rounded w-full font-medium text-brand-text text-left";

// Só o essencial: o resto fica na navegação lateral da própria área da conta (AccountLayout).
function MyAccountModal({ setOpen, navigate, logout, isOng, isDonor, isParticipant }: MyAccountModalProps) {
  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="right-0 z-30 absolute flex flex-col gap-1 bg-brand-surface shadow-lg mt-2 p-2 border border-brand-border rounded-lg w-52 fade-in">
      <button className={itemClass} onClick={() => go("/perfil")}>
        Minha conta
      </button>
      {isDonor && (
        <button className={itemClass} onClick={() => go("/minhas-doacoes")}>
          Minhas doações
        </button>
      )}
      {isOng && (
        <button className={itemClass} onClick={() => go("/minhas-campanhas")}>
          Campanhas e arrecadação
        </button>
      )}
      {isParticipant && (
        <button className={itemClass} onClick={() => go("/conversas")}>
          Mensagens
        </button>
      )}
      {isParticipant && (
        <button className={itemClass} onClick={() => go("/sac")}>
          Atendimento SAC
        </button>
      )}
      <button
        className="hover:bg-red-50 mt-1 px-4 py-2 border-brand-border border-t rounded w-full font-medium text-red-600 text-left"
        onClick={() => {
          setOpen(false);
          logout();
        }}
      >
        Sair
      </button>
    </div>
  );
}

export default MyAccountModal;
