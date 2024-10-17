import styled from "styled-components";

import media from "@mybucks/styles/media";

export const Container = styled.div`
  max-width: ${({ theme }) => theme.sizes.x9l};
  margin: 0 auto;
  margin-block: 2.5rem 6.75rem;

  @media (max-width: 890px) {
    margin: 0 ${({ theme }) => theme.sizes.xl};
    margin-block: ${({ theme }) => theme.sizes.x2l};
  }
`;

/**
 * variant: default | sm | xs
 */
export const Box = styled.div`
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.gray25};
  padding: ${({ theme, $variant }) =>
    $variant === "xs"
      ? `${theme.sizes.base} ${theme.sizes.base}`
      : $variant === "sm"
      ? `${theme.sizes.xl} ${theme.sizes.xl}`
      : `${theme.sizes.x4l} ${theme.sizes.x5l}`};

  ${media.sm`
      padding: ${({ theme, $variant }) =>
        $variant === "xs"
          ? `${theme.sizes.base} ${theme.sizes.base}`
          : `${theme.sizes.xl} ${theme.sizes.lg}`};
    `}
`;
