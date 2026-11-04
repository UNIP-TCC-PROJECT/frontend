import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-brand-background min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex-1 mx-auto px-3 sm:px-6 pt-32 pb-12 w-full max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}
