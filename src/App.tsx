import { Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth/index";
import Home from "./pages/Home";
import Ongs from "./pages/Ongs";
import OngDetails from "./pages/OngDetails";
import Perfil from "./pages/Perfil";
import MinhasMetas from "./pages/MinhasMetas";

import Layout from "./components/Layout";
import { RequireAuth, RequireOng } from "./context/AuthContext";

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
              <Route path="/ongs" element={<Ongs />} />
              <Route path="/ongs/:id" element={<OngDetails />} />
              <Route
                path="/perfil"
                element={
                  <RequireAuth>
                    <Perfil />
                  </RequireAuth>
                }
              />
              <Route
                path="/minhas-metas"
                element={
                  <RequireOng>
                    <MinhasMetas />
                  </RequireOng>
                }
              />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;