import styled from "styled-components";

import Skeleton from "@mybucks/components/Skeleton";

const Wrap = styled.div`
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radius.base};
  padding: ${({ theme }) => theme.sizes.base};
  background-color: ${({ theme }) => theme.colors.card};
  border: 2px solid transparent;
`;

const AvatarSkeleton = styled(Skeleton)`
  border-radius: 50%;
  flex-shrink: 0;
`;

const SymbolAndNameWrap = styled.div`
  margin-left: ${({ theme }) => theme.sizes.xs};
  flex-grow: 1;
`;

const TextLine = styled(Skeleton)`
  display: block;
`;

const SymbolLine = styled(TextLine)`
  margin-bottom: ${({ theme }) => theme.sizes.x3s};
`;

const BalanceAndValueWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.sizes.x3s};
`;

const TokenBalanceRowSkeleton = () => (
  <Wrap>
    <AvatarSkeleton $width="48px" $height="48px" />
    <SymbolAndNameWrap>
      <SymbolLine $width="4rem" $height="1rem" />
      <TextLine $width="6rem" $height="0.8rem" />
    </SymbolAndNameWrap>
    <BalanceAndValueWrap>
      <Skeleton $width="4rem" $height="1rem" />
      <Skeleton $width="3rem" $height="0.8rem" />
    </BalanceAndValueWrap>
  </Wrap>
);

export default TokenBalanceRowSkeleton;
