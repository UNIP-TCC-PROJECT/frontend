import { Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth/index";
import Home from "./pages/Home";
import Ongs from "./pages/Ongs";

import Layout from "./components/Layout";

import { RequireAuth } from "./context/AuthContext";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="*"
        element={
          <Layout>
            <Routes>
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Home />
                  </RequireAuth>
                }
              />
              <Route
                path="/ongs"
                element={
                  <RequireAuth>
                    <Ongs />
                  </RequireAuth>
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
