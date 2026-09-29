export default function Footer() {
  return (
    <footer className="bg-brand-surface mt-auto py-6 border-brand-text/10 border-t">
      <div className="flex md:flex-row flex-col justify-between items-center gap-2 mx-auto px-4 max-w-7xl text-brand-text/60 text-sm">
        <div>
          <a href="#sobre" className="mr-4 hover:text-brand-primary transition-colors">
            Sobre
          </a>
          <a href="#termos" className="mr-4 hover:text-brand-primary transition-colors">
            Termos
          </a>
          <a href="#contato" className="hover:text-brand-primary transition-colors">
            Contato
          </a>
        </div>
        <span>
          &copy; {new Date().getFullYear()} DoaFácil. Todos os direitos
          reservados.
        </span>
      </div>
    </footer>
  );
}
