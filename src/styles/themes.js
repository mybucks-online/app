/** Typography scale (rem) — use for `font-size` only */
const fontSize = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  x2l: "1.5rem",
  x3l: "1.875rem",
  x4l: "2.5rem",
};

/** Layout scale (rem) — padding, margin, gap, max-width */
const sizes = {
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
  shellMax: "72rem",
  cardMaxWidth: "40rem",
  cardMinHeight: "36rem",
  cardMinHeightLg: "32rem",
  viewportShort: "720px",
  viewportShorter: "560px",
};

const radius = {
  sm: "0.5rem",
  base: "0.625rem",
  form: "0.75rem",
  lg: "1.25rem",
  xl: "1.875rem",
  card: "1.5rem",
};

const weights = {
  base: 400,
  regular: 500,
  highlight: 600,
  bold: 700,
  extra: 800,
};

const fonts = {
  sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  inter: "Inter",
};

const lightColors = {
  // brand
  primary: "#2563eb",
  accent: "#7c3aed",
  primaryHoverFrom: "#1d4ed8",
  primaryHoverTo: "#7e22ce",

  // status
  success: "#22c55e",
  error: "#b91c1c",
  warning: "#fbbf24",
  disabled: "#E9E9EA",

  // AppShell (body fallback + gradient in Containers.jsx)
  shellBg: "#F4F4F4",
  shellGradientFrom: "#f8fafc",
  shellGradientTo: "#eff6ff",

  // elevated card / panel (Container, Input, Modal content)
  card: "#ffffff",
  cardShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",

  // typography
  textStrong: "#0f172a",
  textMuted: "#475569",
  textInverse: "#FFFFFF",

  // borders (inputs, footer rule, dividers)
  border: "#e2e8f0",
  borderHover: "#94a3b8",
  borderFocus: "#2563eb",

  modalBackdrop: "rgba(0, 0, 0, 0.7)",
};

const darkColorOverrides = {
  primary: "#3B9EFF",
  disabled: "#2C2C2E",
  shellBg: "#1F1F21",
  shellGradientFrom: "#0f172a",
  shellGradientTo: "#1e293b",
  card: "#1e293b",
  cardShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
  textStrong: "#F4F4F4",
  textMuted: "#98989D",
  border: "#334155",
  borderHover: "#64748b",
  borderFocus: "#3B9EFF",
  modalBackdrop: "rgba(0, 0, 0, 0.8)",
};

const shared = { fontSize, sizes, radius, weights, fonts };

const light = {
  mode: "light",
  colors: lightColors,
  ...shared,
};

const dark = {
  mode: "dark",
  colors: { ...lightColors, ...darkColorOverrides },
  ...shared,
};

const themes = { light, dark };

export default themes;
