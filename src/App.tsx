import { Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth/index";
import Home from "./pages/Home";
import Ongs from "./pages/Ongs";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/ongs" element={<Ongs />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}

export default App;
