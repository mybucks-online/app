import styled, { css } from "styled-components";

/**
 * $variant: primary | secondary | outline
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
          font-size: ${({ theme }) => theme.sizes.base};
          font-weight: ${({ theme }) => theme.weights.highlight};
          padding: ${({ theme }) => theme.sizes.base};
        `
      : css`
          font-size: ${({ theme }) => theme.sizes.base};
          font-weight: ${({ theme }) => theme.weights.highlight};
          padding: ${({ theme }) => theme.sizes.base};
        `};

  ${({ $variant }) =>
    $variant === "secondary"
      ? css`
          background-color: ${({ theme }) => theme.colors.gray100};
          color: ${({ theme }) => theme.colors.gray400};
          border: none;
        `
      : $variant === "outline"
      ? css`
          color: ${({ theme }) => theme.colors.primary};
          background-color: ${({ theme }) => theme.colors.gray25};
          border: 1px solid ${({ theme }) => theme.colors.primary};
        `
      : css`
          background-color: ${({ theme }) => theme.colors.primary};
          color: ${({ theme }) => theme.colors.gray25};
          border: none;
        `};

  line-height: 140%;
  border-radius: ${({ theme }) => theme.radius.base};
  outline: none;

  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray100};
    color: ${({ theme }) => theme.colors.gray200};
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.gray200};
    color: ${({ theme }) => theme.colors.gray25};
  }
`;

export default Button;
