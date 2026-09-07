import { css } from "styled-components";

interface HiddenProp {
  $hidden?: boolean;
}

/** Blurs a value in place instead of swapping it for placeholder text — apply via the `$hidden` transient prop. */
export const blurWhenHidden = css<HiddenProp>`
  filter: ${({ $hidden }) => ($hidden ? "blur(6px)" : "none")};
  user-select: ${({ $hidden }) => ($hidden ? "none" : "auto")};
  transition: filter 0.15s ease;
`;
