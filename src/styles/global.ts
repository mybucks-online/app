import { createGlobalStyle } from "styled-components";
import normalize from "styled-normalize";

const GlobalStyle = createGlobalStyle`
  ${normalize}
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  a {
    color: inherit;
    text-decoration: none;
    cursor: pointer;
  }
  button {
    padding: 0;
    color: inherit;
    background-color: transparent;
    border-width: 0;
    cursor: pointer;
  }
  figure {
    margin: 0;
  }
  input::-moz-focus-inner {
    margin: 0;
    padding: 0;
    border: 0;
  }
  ul,
  li,
  ol,
  dd,
  dl {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    font-weight: inherit;
    font-size: inherit;
    overflow-wrap: break-word;
  }
  p {
    margin: 0;
    overflow-wrap: break-word;
  }
  cite {
    font-style: normal;
  }
  fieldset {
    margin: 0;
    padding: 0;
    border-width: 0;
  }
  html {
    scroll-behavior: smooth;
    height: 100%;
    @media (prefers-reduced-motion: reduce) {
      scroll-behavior: auto;
    }
  }
  body {
    height: 100%;
    margin: 0;
    background-color: ${({ theme }) => theme.colors.shellBg};
    font-family: ${({ theme }) => theme.fonts.sans};
    font-size: ${({ theme }) => theme.sizes.base};
    font-weight: ${({ theme }) => theme.weights.base};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
  }
  #root {
    height: 100%;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }
  .scroll-lock {
    max-height: 100vh;
    overflow: hidden;
  }
`;

export default GlobalStyle;
