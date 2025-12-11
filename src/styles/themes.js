const light = {
  colors: {
    primary: "#0171E3",
    link: "#0171E3",
    success: "#29CC6A",
    error: "#FF5630",
    gray25: "#FFFFFF",
    gray50: "#F4F4F4",
    gray100: "#E9E9EA",
    gray200: "#6E6E73",
    gray400: "#18181A",
  },
  weights: {
    base: 400,
    regular: 500,
    highlight: 600,
    bold: 700,
    extra: 800,
  },
  sizes: {
    x3s: "0.5rem",
    x2s: "0.625rem",
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.25rem",
    xl: "1.5rem",
    x2l: "2rem",
    x3l: "2.25rem",
    x4l: "2.5rem",
    x5l: "3.75rem",
    x6l: "5rem",
    x9l: "52.875rem",
  },
  fonts: {
    inter: "Inter",
  },
  radius: {
    sm: "0.5rem",
    base: "0.625rem",
    lg: "1.25rem",
    xl: "1.875rem",
  },
};

const dark = {
  ...light,
  colors: {
    primary: "#3B9EFF",
    link: "#3B9EFF",
    success: "#29CC6A",
    error: "#FF5630",
    gray25: "#18181A",
    gray50: "#1F1F21",
    gray100: "#2C2C2E",
    gray200: "#98989D",
    gray400: "#F4F4F4",
  },
};

const themes = {
  light,
  dark,
};

export default themes;
