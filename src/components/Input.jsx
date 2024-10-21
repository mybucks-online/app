import styled from "styled-components";

const Input = styled.input`
  display: block;
  width: 100%;
  padding: ${({ theme }) => `${theme.sizes.base} ${theme.sizes.lg}`};
  outline: none;
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  border-radius: ${({ theme }) => theme.radius.base};
  background-color: ${({ theme }) => theme.colors.gray25};
  color: ${({ theme }) => theme.colors.gray200};
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 130%;
  margin-bottom: ${({ theme }) => theme.sizes.xs};

  &:hover {
    color: ${({ theme }) => theme.colors.gray400};
    border: 1px solid ${({ theme }) => theme.colors.gray400};
  }

  &:active,
  &:focus {
    color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    border-color: ${({ theme }) => theme.colors.gray100};
    color: ${({ theme }) => theme.colors.gray100};
  }
`;

export default Input;
