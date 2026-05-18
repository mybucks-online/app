import styled from "styled-components";

import media from "@mybucks/styles/media";

export const H1 = styled.h1`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.sizes.x3l};
  font-weight: ${({ theme }) => theme.weights.bold};
  line-height: 150%;
`;

export const H3 = styled.h3`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.fontSize.x2l};
  font-weight: ${({ theme }) => theme.weights.bold};
  line-height: 150%;
  margin-bottom: ${({ theme }) => theme.sizes.base};

  ${media.sm`
    font-size: ${({ theme }) => theme.fontSize.xl};
    margin-bottom: ${({ theme }) => theme.sizes.xl};
  `}
`;
