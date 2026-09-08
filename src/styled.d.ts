import type { Theme } from "@mybucks/contexts/store/useTheme";

import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    mode: Theme;
    colors: {
      primary: string;
      accent: string;
      primaryHoverFrom: string;
      primaryHoverTo: string;

      success: string;
      error: string;
      warning: string;
      disabled: string;

      shellBg: string;
      shellGradientFrom: string;
      shellGradientTo: string;

      card: string;
      cardShadow: string;

      textStrong: string;
      textMuted: string;
      textInverse: string;

      border: string;
      borderHover: string;
      borderFocus: string;

      modalBackdrop: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      x2l: string;
      x3l: string;
      x4l: string;
    };
    sizes: {
      x3s: string;
      x2s: string;
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      x2l: string;
      x3l: string;
      x4l: string;
      shellMax: string;
      cardMaxWidth: string;
      cardMinHeight: string;
      cardMinHeightLg: string;
      viewportShort: string;
      viewportShorter: string;
    };
    radius: {
      sm: string;
      base: string;
      form: string;
      lg: string;
      xl: string;
      card: string;
    };
    weights: {
      base: number;
      regular: number;
      highlight: number;
      bold: number;
      extra: number;
    };
    fonts: {
      sans: string;
      inter: string;
    };
  }
}
