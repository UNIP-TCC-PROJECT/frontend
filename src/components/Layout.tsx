import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Header />
      <main className="flex-1 mx-auto px-4 pt-32 pb-12 w-full max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}
