import styled from "styled-components";

import media from "@mybucks/styles/media";

export const H1 = styled.h1`
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.sizes.x3l};
  font-weight: ${({ theme }) => theme.weights.bold};
  line-height: 150%;
`;

export const H3 = styled.h3`
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.sizes.xl};
  font-weight: ${({ theme }) => theme.weights.bold};
  line-height: 150%;
  margin-bottom: ${({ theme }) => theme.sizes.base};

  ${media.sm`
    font-size: ${({ theme }) => theme.sizes.base};
    margin-bottom: ${({ theme }) => theme.sizes.xl};
    `}
`;
