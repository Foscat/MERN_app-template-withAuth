/**
 * @module main
 * @description Client application entrypoint that mounts the React app tree.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "rsuite/dist/rsuite.min.css";
import "./index.css";

import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { CustomProvider } from "rsuite";

function ThemedApp() {
  const { theme } = useTheme();
  return (
    <CustomProvider theme={theme}>
      <App />
    </CustomProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <UserProvider>
        <ThemedApp />
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>
);
