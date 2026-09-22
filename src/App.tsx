import { Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth/index";
import Home from "./pages/Home";
import Ongs from "./pages/Ongs";
import OngDetails from "./pages/OngDetails";
import Perfil from "./pages/Perfil";

import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route
        path="*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Lista de ONGs */}
              <Route path="/ongs" element={<Ongs />} />

              {/* Detalhes da ONG — usei "singular" para bater com o Home */}
              <Route path="/ong/:id" element={<OngDetails />} />

              {/* Perfil do usuário logado */}
              <Route path="/perfil" element={<Perfil />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;