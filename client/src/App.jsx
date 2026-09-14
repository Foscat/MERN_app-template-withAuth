/**
 * @module App
 * @description Top-level application routing shell.
 */
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";
import { useTheme } from "./context/ThemeContext";

/**
 * Render the application router inside the selected semantic design system.
 *
 * @returns {JSX.Element} Application shell and route content.
 */
function App() {
  const { mode } = useTheme();

  return (
    <Router>
      <div
        className="app-root ly-root"
        data-ui="bento"
        data-theme="service-blue-red"
        data-mode={mode}
        data-ly-layout="bento"
      >
        <a className="bento-visually-hidden app-skip-link" href="#main-content">
          Skip to main content
        </a>
        <NavBar />

        <div id="main-content" className="app-route-stage" tabIndex="-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
