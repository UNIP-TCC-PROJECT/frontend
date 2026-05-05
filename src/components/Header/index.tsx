import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  return (
    <header className="top-0 left-0 z-20 fixed bg-white shadow w-full">
      <div className="flex justify-between items-center mx-auto px-6 py-4 max-w-7xl">
        <Link to="/" className="font-bold text-blue-700 text-2xl">
          DoaFácil
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/ongs"
            className={`font-medium hover:text-blue-700 ${location.pathname.startsWith("/ongs") ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1" : ""}`}
          >
            ONGs
          </Link>
          <a href="#sobre" className="font-medium hover:text-blue-700">
            Sobre
          </a>
          <Link to="/perfil" className="font-medium hover:text-blue-700">
            Perfil
          </Link>
        </nav>
      </div>
    </header>
  );
}
