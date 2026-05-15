import React, { useContext } from "react";
import ReactDOM from "react-dom/client";
import styled, { ThemeProvider } from "styled-components";
import { registerSW } from "virtual:pwa-register";

import StoreProvider, { StoreContext } from "@mybucks/contexts/Store";
import GlobalStyle from "@mybucks/styles/global.js";
import themes from "@mybucks/styles/themes.js";

import App from "./App.jsx";

registerSW({ immediate: true });

/** Fills `#root` flex so `App` can use `flex: 1` down to the footer. */
const RootFill = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

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
    <RootFill>
      <StoreProvider>
        <ThemedApp />
      </StoreProvider>
    </RootFill>
  </React.StrictMode>,
);
