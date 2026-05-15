import styled from "styled-components";

import media from "@mybucks/styles/media";

/** Full-viewport gradient column; vertical scroll on full-width MainScroll in App.jsx (scrollbar hidden in CSS). */
export const AppShell = styled.div`
  flex: 1;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  background: linear-gradient(
    to bottom right,
    ${({ theme }) => theme.colors.shellGradientFrom},
    ${({ theme }) => theme.colors.shellGradientTo}
  );
`;

export const Container = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.sizes.cardMaxWidth};
  min-height: ${({ theme }) => theme.sizes.cardMinHeight};
  margin-inline: auto;
  margin-bottom: ${({ theme }) => theme.sizes.x2l};
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radius.card};
  box-shadow: ${({ theme }) => theme.colors.cardShadow};
  padding: ${({ theme }) => theme.sizes.x2l};

  & > * + * {
    margin-top: ${({ theme }) => theme.sizes.x2l};
  }

  ${media.lg`
    min-height: ${({ theme }) => theme.sizes.cardMinHeightLg};
    padding: ${({ theme }) => theme.sizes.x4l};
  `}

  ${media.sm`
    padding: ${({ theme }) => theme.sizes.base};
    margin-bottom: ${({ theme }) => theme.sizes.x3l};
  `}

  @media (max-height: ${({ theme }) => theme.sizes.viewportShort}) {
    margin-bottom: ${({ theme }) => theme.sizes.x3l};
  }

  @media (max-height: ${({ theme }) => theme.sizes.viewportShorter}) {
    margin-bottom: ${({ theme }) => theme.sizes.x4l};
  }
`;

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
