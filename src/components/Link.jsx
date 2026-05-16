import styled from "styled-components";

const Link = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  font-size: inherit;
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 120%;
  text-decoration: underline;
`;

export default Link;
