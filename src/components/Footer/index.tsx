import { Link } from "react-router-dom";
import { FaHandHoldingHeart, FaShieldAlt } from "react-icons/fa";
import { CATEGORIES } from "../../constants/categories";

export default function Footer() {
  return (
    <footer className="bg-brand-text mt-auto pt-16 pb-10 text-brand-background/70">
      <div className="gap-10 grid grid-cols-1 md:grid-cols-4 mx-auto px-4 max-w-7xl">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="flex justify-center items-center bg-brand-primary rounded-full w-8 h-8 text-brand-background shrink-0">
              <FaHandHoldingHeart className="w-3.5 h-3.5" />
            </div>
            <span className="font-serif text-brand-background text-xl tracking-tight">
              Doa<span className="text-brand-sage italic">Fácil</span>
            </span>
          </div>
          <p className="text-brand-background/60 text-xs leading-relaxed">
            Plataforma de intermediação entre doadores e ONGs, com foco em
            transparência e segurança para as duas pontas da doação.
          </p>
          <div className="flex items-center gap-2 pt-1 text-brand-sage text-xs font-medium">
            <FaShieldAlt className="w-3.5 h-3.5 text-brand-primary" />
            <span>Cadastro validado via Receita Federal</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-brand-background text-[11px] uppercase tracking-widest">
            Navegação
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/ongs" className="hover:text-brand-background transition-colors">
                Explorar ONGs
              </Link>
            </li>
            <li>
              <a href="/#sobre" className="hover:text-brand-background transition-colors">
                Sobre a plataforma
              </a>
            </li>
            <li>
              <Link to="/auth?modo=cadastro" className="hover:text-brand-background transition-colors">
                Cadastrar ONG ou conta
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-brand-background transition-colors">
                Entrar
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-brand-background text-[11px] uppercase tracking-widest">
            Causas atendidas
          </h4>
          <ul className="space-y-2 text-xs">
            {CATEGORIES.map((category) => (
              <li key={category.value}>
                <Link
                  to={`/ongs?categoria=${category.value}`}
                  className="hover:text-brand-background transition-colors"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-brand-background text-[11px] uppercase tracking-widest">
            Contato
          </h4>
          <p className="text-xs">
            <a
              href="mailto:contato@doafacil.com.br"
              className="hover:text-brand-background transition-colors"
            >
              contato@doafacil.com.br
            </a>
          </p>
        </div>
      </div>

      <div className="mx-auto mt-12 px-4 border-brand-background/10 border-t max-w-7xl">
        <p className="pt-6 text-brand-background/40 text-[11px] text-center">
          &copy; {new Date().getFullYear()} DoaFácil. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
