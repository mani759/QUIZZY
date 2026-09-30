import { Routes, Route } from "react-router-dom";
import HostPage from "./pages/HostPage";
import PlayerPage from "./pages/PlayerPage";

import "./App.css";

// window.io = io;

const App = () => {
  return (
    <Routes>
      <Route path="/join/:code" element={<PlayerPage />} />
      <Route path="/host" element={<HostPage />} />
    </Routes>
  );
};

export default App;
