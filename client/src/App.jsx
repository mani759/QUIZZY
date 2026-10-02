import { Routes, Route } from "react-router-dom";
import HostPage from "./pages/HostPage";
import PlayerPage from "./pages/PlayerPage";
import QuizListPage from "./pages/QuizListPage";
import CreateQuizPage from "./pages/CreateQuizPage";
import LoginPage from "./pages/LoginPage";
import RequireAuth from "./auth/RequireAuth";

import "./App.css";

// window.io = io;

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/host"
        element={
          <RequireAuth>
            <QuizListPage />
          </RequireAuth>
        }
      />
      <Route
        path="/host/new"
        element={
          <RequireAuth>
            <CreateQuizPage />
          </RequireAuth>
        }
      />
      <Route
        path="/host/:quizId"
        element={
          <RequireAuth>
            <HostPage />
          </RequireAuth>
        }
      />

      <Route path="/join/:code" element={<PlayerPage />} />
    </Routes>
  );
};

export default App;
