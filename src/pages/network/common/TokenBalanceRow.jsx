import styled from "styled-components";
import toFlexible from "toflexible";

import Avatar from "@mybucks/components/Avatar";
import { BALANCE_PLACEHOLDER } from "@mybucks/lib/conf";
import { formatCurrency } from "@mybucks/lib/utils";

/*
  token: 
    symbol,
    name,
    logoURI,
    balance,
    address,
    decimals,
    chainId,
  balance:
    0
  onClick:
    (token) => void
*/

const Wrap = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radius.base};
  padding: ${({ theme }) => theme.sizes.base};
  background-color: ${({ theme }) => theme.colors.gray25};
  border: 2px solid transparent;

  &:hover {
    border: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

const SymbolAndNameWrap = styled.div`
  margin-left: ${({ theme }) => theme.sizes.xs};
  flex-grow: 1;
`;

const Symbol = styled.p`
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.sizes.base};
  font-weight: ${({ theme }) => theme.weights.highlight};
  line-height: 150%;
  margin-bottom: ${({ theme }) => theme.sizes.x3s};
`;

const Name = styled.p`
  color: ${({ theme }) => theme.colors.gray200};
  font-size: ${({ theme }) => theme.sizes.xs};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 150%;
`;

const BalanceAndValueWrap = styled.div``;

const Balance = styled.p`
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.sizes.base};
  font-weight: ${({ theme }) => theme.weights.highlight};
  line-height: 150%;
  margin-bottom: 6px;
  text-align: right;
`;

const Value = styled.p`
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 150%;
  text-align: right;
  min-height: 21px;
`;

const TokenBalanceRow = ({ token, balance, quote, onClick, showBalance }) => (
  <Wrap onClick={() => onClick(token)}>
    <Avatar
      uri={token.logoURI}
      symbol={token.symbol}
      fallbackColor={"#" + token.contract.slice(2, 8)}
    />
    <SymbolAndNameWrap>
      <Symbol>{token.symbol}</Symbol>
      <Name>{token.name}</Name>
    </SymbolAndNameWrap>

    <BalanceAndValueWrap>
      <Balance>
        {!showBalance
          ? BALANCE_PLACEHOLDER
          : balance > 0
            ? toFlexible(balance, 2)
            : "0.00"}
      </Balance>

      <Value>
        {!showBalance
          ? BALANCE_PLACEHOLDER
          : quote > 0
            ? formatCurrency(quote)
            : ""}
      </Value>
    </BalanceAndValueWrap>
  </Wrap>
);

export default TokenBalanceRow;
