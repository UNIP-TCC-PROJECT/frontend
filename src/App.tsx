import { Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth/index";
import Home from "./pages/Home";
import Ongs from "./pages/Ongs";
import OngDetails from "./pages/OngDetails";
import AdminOngs from "./pages/admin/AdminOngs";
import AdminOngDetails from "./pages/admin/AdminOngDetails";
import AdminCreateAdmin from "./pages/admin/AdminCreateAdmin";
import Perfil from "./pages/Perfil";
import MinhasMetas from "./pages/MinhasMetas";
import OngsFavoritas from "./pages/OngsFavoritas";
import InteressesOng from "./pages/InteressesOng";
import Conversas from "./pages/Conversas";
import Sobre from "./pages/Sobre";

import Publicacoes from "./pages/Publicacoes";

import PublicacaoDetails from "./pages/PublicacaoDetails";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import {
  RequireAuth,
  RequireDoador,
  RequireOng,
  RequireAdmin,
} from "./context/AuthContext";

function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <RequireAdmin>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminOngs />} />
                <Route path="/ongs/:id" element={<AdminOngDetails />} />
                <Route path="/admins/novo" element={<AdminCreateAdmin />} />
              </Routes>
            </AdminLayout>
          </RequireAdmin>
        }
      />

      <Route
        path="*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/esqueci-senha" element={<ForgotPassword />} />
              <Route path="/redefinir-senha" element={<ResetPassword />} />
              <Route path="/ongs" element={<Ongs />} />
              <Route
                path="/ongs-favoritas"
                element={
                  <RequireDoador>
                    <OngsFavoritas />
                  </RequireDoador>
                }
              />
              <Route
                path="/interesses"
                element={
                  <RequireOng>
                    <InteressesOng />
                  </RequireOng>
                }
              />
              <Route
                path="/conversas"
                element={
                  <RequireAuth>
                    <Conversas />
                  </RequireAuth>
                }
              />
              <Route
                path="/conversas/:id"
                element={
                  <RequireAuth>
                    <Conversas />
                  </RequireAuth>
                }
              />
              <Route path="/publicacoes" element={<Publicacoes />} />
              <Route path="/ongs/:id" element={<OngDetails />} />
              <Route path="/publicacoes/:id" element={<PublicacaoDetails />} />
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
