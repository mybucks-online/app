import styled from "styled-components";

import media from "@mybucks/styles/media";

export const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.weights.highlight};
  line-height: 140%;
  margin-bottom: ${({ theme }) => theme.sizes.x3s};
  color: ${({ theme }) => theme.colors.textStrong};

  ${media.sm`
    font-size: ${({ theme }) => theme.fontSize.base};
  `}
`;
