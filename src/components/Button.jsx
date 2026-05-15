import styled, { css } from "styled-components";

import media from "@mybucks/styles/media";

/**
 * $variant: primary | secondary | outline | danger
 * $size: small | normal | block
 */
const Button = styled.button`
  ${({ $size }) =>
    $size === "small"
      ? css`
          font-size: ${({ theme }) => theme.sizes.xs};
          font-weight: ${({ theme }) => theme.weights.regular};
          padding: ${({ theme }) => `${theme.sizes.x3s} ${theme.sizes.xl}`};
        `
      : $size === "block"
        ? css`
            display: block;
            width: 100%;
            font-size: ${({ theme }) => theme.fontSize.base};
            font-weight: ${({ theme }) => theme.weights.highlight};
            padding: ${({ theme }) => `${theme.sizes.base} ${theme.sizes.x2l}`};

            ${media.sm`
              font-size: ${({ theme }) => theme.fontSize.lg};
              padding: ${({ theme }) => `${theme.sizes.lg} ${theme.sizes.x2l}`};
            `}
          `
        : css`
            font-size: ${({ theme }) => theme.fontSize.base};
            font-weight: ${({ theme }) => theme.weights.highlight};
            padding: ${({ theme }) => theme.sizes.base};
          `};

  ${({ $variant }) =>
    $variant === "secondary"
      ? css`
          background-color: ${({ theme }) => theme.colors.disabled};
          color: ${({ theme }) => theme.colors.textStrong};
          border: none;
        `
      : $variant === "outline"
        ? css`
            color: ${({ theme }) => theme.colors.primary};
            background-color: ${({ theme }) => theme.colors.card};
            border: 1px solid ${({ theme }) => theme.colors.primary};
          `
        : $variant === "danger"
          ? css`
              color: ${({ theme }) => theme.colors.textInverse};
              background-color: ${({ theme }) => theme.colors.error};
              border: none;
            `
          : css`
              background: linear-gradient(
                to right,
                ${({ theme }) => theme.colors.primary},
                ${({ theme }) => theme.colors.accent}
              );
              color: ${({ theme }) => theme.colors.textInverse};
              border: none;
              transition:
                filter 0.2s ease,
                background 0.2s ease;

              &:hover:not(:disabled) {
                background: linear-gradient(
                  to right,
                  ${({ theme }) => theme.colors.primaryHoverFrom},
                  ${({ theme }) => theme.colors.primaryHoverTo}
                );
              }
            `};

  line-height: 140%;
  border-radius: ${({ theme, $size }) =>
    $size === "block" ? theme.radius.form : theme.radius.base};
  outline: none;

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    ${({ $variant }) =>
      $variant === "secondary"
        ? css`
            background-color: ${({ theme }) => theme.colors.textMuted};
            color: ${({ theme }) => theme.colors.textInverse};
          `
        : $variant === "outline"
          ? css`
              opacity: 0.92;
            `
          : $variant === "danger"
            ? css`
                filter: brightness(0.92);
              `
            : css`
                filter: brightness(0.96);
              `};
  }
`;

export default Button;
