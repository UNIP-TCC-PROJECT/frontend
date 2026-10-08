interface MyAccountModalProps {
  setOpen: (open: boolean) => void;
  navigate: (path: string) => void;
  logout: () => void;
  isOng?: boolean;
}

function MyAccountModal({ setOpen, navigate, logout, isOng }: MyAccountModalProps) {
  return (
    <div className="right-0 z-30 absolute flex flex-col gap-2 bg-brand-surface shadow-lg mt-2 p-2 border border-brand-border rounded-lg w-48 fade-in">
      <button
        className="hover:bg-brand-champagne px-4 py-2 rounded w-full font-medium text-brand-text text-left"
        onClick={() => {
          setOpen(false);
          navigate("/perfil");
        }}
      >
        Minha conta
      </button>
      {isOng && (
        <button
          className="hover:bg-brand-champagne px-4 py-2 rounded w-full font-medium text-brand-text text-left"
          onClick={() => {
            setOpen(false);
            navigate("/minhas-metas");
          }}
        >
          Minhas metas
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
