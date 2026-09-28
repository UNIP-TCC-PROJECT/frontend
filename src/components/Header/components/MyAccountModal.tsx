interface MyAccountModalProps {
  setOpen: (open: boolean) => void;
  navigate: (path: string) => void;
  logout: () => void;
  isOng?: boolean;
}

function MyAccountModal({ setOpen, navigate, logout, isOng }: MyAccountModalProps) {
  return (
    <div className="right-0 z-30 absolute flex flex-col gap-2 bg-white shadow-lg mt-2 p-2 border border-slate-200 rounded-lg w-48 animate-fade-in">
      <button
        className="hover:bg-slate-100 px-4 py-2 rounded w-full font-medium text-slate-700 text-left"
        onClick={() => {
          setOpen(false);
          navigate("/perfil");
        }}
      >
        Minha conta
      </button>
      {isOng && (
        <button
          className="hover:bg-slate-100 px-4 py-2 rounded w-full font-medium text-slate-700 text-left"
          onClick={() => {
            setOpen(false);
            navigate("/minhas-metas");
          }}
        >
          Minhas metas
        </button>
      )}
      <button
        className="hover:bg-red-50 mt-1 px-4 py-2 border-slate-100 border-t rounded w-full font-medium text-red-600 text-left"
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
