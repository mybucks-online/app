import React, { useContext } from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "styled-components";

import StoreProvider, { StoreContext } from "@mybucks/contexts/Store";
import GlobalStyle from "@mybucks/styles/global.js";
import themes from "@mybucks/styles/themes.js";

import App from "./App.jsx";
import "@mybucks/styles/font.css";

function ThemedApp() {
  const { theme } = useContext(StoreContext);
  return (
    <ThemeProvider theme={themes[theme]}>
      <GlobalStyle />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StoreProvider>
      <ThemedApp />
    </StoreProvider>
  </React.StrictMode>
);
