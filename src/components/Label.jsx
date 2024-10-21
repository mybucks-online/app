import styled from "styled-components";

export const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 140%;
  margin-bottom: ${({ theme }) => theme.sizes.x3s};
  color: ${({ theme }) => theme.colors.gray400};
`;
