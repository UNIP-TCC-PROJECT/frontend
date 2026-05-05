export default function Footer() {
  return (
    <footer className="bg-white mt-auto py-6 border-gray-200 border-t">
      <div className="flex md:flex-row flex-col justify-between items-center gap-2 mx-auto px-4 max-w-7xl text-gray-500 text-sm">
        <div>
          <a href="#sobre" className="mr-4 hover:text-blue-700">
            Sobre
          </a>
          <a href="#termos" className="mr-4 hover:text-blue-700">
            Termos
          </a>
          <a href="#contato" className="hover:text-blue-700">
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
