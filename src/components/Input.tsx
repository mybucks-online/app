import styled from "styled-components";

import media from "@mybucks/styles/media";

const Input = styled.input`
  @keyframes input-autofill-text {
    to {
      color: ${({ theme }) => theme.colors.textStrong};
      -webkit-text-fill-color: ${({ theme }) => theme.colors.textStrong};
    }
  }

  display: block;
  width: 100%;
  padding: ${({ theme }) => `${theme.sizes.base} ${theme.sizes.base}`};
  outline: none;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.form};
  overflow: hidden;
  color-scheme: ${({ theme }) => theme.mode};
  background-color: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.textStrong};
  caret-color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 130%;
  margin-bottom: ${({ theme }) => theme.sizes.xs};
  transition:
    border-color 0.2s ease,
    color 0.2s ease;

  ${media.sm`
    padding: ${({ theme }) => `${theme.sizes.sm} ${theme.sizes.base}`};
  `}

  &:hover:not(:disabled):not(:focus) {
    border-color: ${({ theme }) => theme.colors.borderHover};
  }

  &:active,
  &:focus {
    color: ${({ theme }) => theme.colors.textStrong};
    border-color: ${({ theme }) => theme.colors.borderFocus};
  }

  &:disabled {
    border-color: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    border-radius: ${({ theme }) => theme.radius.form};
    -webkit-box-shadow: 0 0 0 1000px ${({ theme }) => theme.colors.card} inset !important;
    color: ${({ theme }) => theme.colors.textStrong} !important;
    -webkit-text-fill-color: ${({ theme }) =>
      theme.colors.textStrong} !important;
    caret-color: ${({ theme }) => theme.colors.textStrong};
    border-color: ${({ theme }) => theme.colors.border};
    animation: input-autofill-text 0s forwards;
    transition:
      border-color 0.2s ease,
      background-color 99999s ease-out 0s;
  }

  &:-webkit-autofill:focus {
    border-color: ${({ theme }) => theme.colors.borderFocus};
  }
`;

export default Input;
