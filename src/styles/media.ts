import { css, type RuleSet } from "styled-components";

export const sizes = {
  xl: 1200,
  lg: 992,
  md: 768,
  sm: 576,
  xs: 375,
} as const;

type SizeKey = keyof typeof sizes;
type MediaFn = (...args: Parameters<typeof css>) => RuleSet<object>;

const media = (Object.keys(sizes) as SizeKey[]).reduce(
  (acc, label) => {
    acc[label] = (...args) => css`
      @media (max-width: ${sizes[label]}px) {
        ${css(...args)}
      }
    `;
    return acc;
  },
  {} as Record<SizeKey, MediaFn>,
);

export default media;
