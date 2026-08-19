import { Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth/index";
import Home from "./pages/Home";
import Ongs from "./pages/Ongs";
import OngProfile from "./pages/OngProfile";

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
              <Route path="/ongs" element={<Ongs />} />
              <Route path="/ongs/:id" element={<OngProfile />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;