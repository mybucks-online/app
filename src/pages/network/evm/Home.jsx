import { useContext, useMemo } from "react";
import { toast } from "react-toastify";
import copy from "clipboard-copy";
import { ethers } from "ethers";
import styled from "styled-components";
import toFlexible from "toflexible";

import ArrowUpIcon from "@mybucks/assets/icons/arrow-up.svg";
import CopyIcon from "@mybucks/assets/icons/copy.svg";
import GasIcon from "@mybucks/assets/icons/gas.svg";
import HideIcon from "@mybucks/assets/icons/hide.svg";
import LockIcon from "@mybucks/assets/icons/lock.svg";
import RefreshIcon from "@mybucks/assets/icons/refresh.svg";
import ShowIcon from "@mybucks/assets/icons/show.svg";
import BaseButton from "@mybucks/components/Button";
import { Box, Container } from "@mybucks/components/Containers";
import Link from "@mybucks/components/Link";
import NetworkSelector from "@mybucks/components/NetworkSelector";
import { StoreContext } from "@mybucks/contexts/Store";
import { BALANCE_PLACEHOLDER, LOADING_PLACEHOLDER } from "@mybucks/lib/conf";
import { truncate } from "@mybucks/lib/utils";
import TokenBalanceRow from "@mybucks/pages/network/common/TokenBalanceRow";
import media from "@mybucks/styles/media";

const NetworkAndFeatures = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.sizes.x4l};

  ${media.md`
    margin-bottom: ${({ theme }) => theme.sizes.xl};
  `}
`;

const NetworkWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.x2l};

  ${media.md`
    gap: ${({ theme }) => theme.sizes.base};
  `}
`;

const GasPriceWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 6rem;
  visibility: ${({ $show }) => ($show ? "visible" : "hidden")};
  font-weight: ${({ theme }) => theme.weights.regular};
  font-size: ${({ theme }) => theme.sizes.sm};
`;

const MenuButton = styled(BaseButton).attrs({ $size: "small" })`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;

  ${media.sm`
    span {
      display: none;
    }
  `}
`;

const CloseButton = styled(BaseButton).attrs({ $size: "small" })`
  display: flex;
  padding: 6px 8px;
`;

const PrimaryBox = styled(Box).attrs({ $variant: "sm" })`
  margin-bottom: ${({ theme }) => theme.sizes.x4l};

  ${media.md`
    margin-bottom: ${({ theme }) => theme.sizes.xl};
  `}
`;

const AddressWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: ${({ theme }) => theme.sizes.xl};

  ${media.sm`
    justify-content: space-between;
  `}
`;

const AddressAndCopy = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.xl};
`;

const AddressLink = styled(Link)`
  font-size: ${({ theme }) => theme.sizes.lg};
`;

const AddressLong = styled.span`
  display: inherit;
  ${media.sm`
    display: none;
  `}
`;

const AddressShort = styled.span`
  display: none;
  ${media.sm`
    display: inherit;
  `}
`;

const RefreshAndEyeballs = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.xl};

  ${media.sm`
    position: relative;
  `}
`;

const NativeBalance = styled.h3`
  text-align: center;
  font-weight: ${({ theme }) => theme.weights.highlight};
  font-size: ${({ theme }) => theme.sizes.x2l};

  ${media.sm`
    font-size: ${({ theme }) => theme.sizes.xl};
  `}
`;

const TokensList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.sizes.lg};
`;

const EvmHome = () => {
  const {
    loading,
    openMenu,
    showBalances,
    setShowBalances,
    account,
    network,
    chainId,
    updateNetwork,
    reset,
    nativeTokenName,
    nativeTokenBalance,
    tokenBalances,
    tick,
    fetchBalances,
    selectToken,
  } = useContext(StoreContext);
  const gasPrice = useMemo(
    () => toFlexible(parseFloat(ethers.formatUnits(account.gasPrice, 9)), 2),
    [tick, account]
  );

  const copyAddress = () => {
    copy(account.address);
    toast("Address copied into clipboard.");
  };
  const toggleBalancesVisible = () => {
    setShowBalances(!showBalances);
  };
  const close = () => {
    reset();
    copy("");
  };

  return (
    <Container>
      <NetworkAndFeatures>
        <NetworkWrapper>
          <NetworkSelector
            network={network}
            chainId={chainId}
            updateNetwork={updateNetwork}
          />
          <GasPriceWrapper $show={gasPrice > 0}>
            <img src={GasIcon} /> <span>{gasPrice} GWei</span>
          </GasPriceWrapper>
        </NetworkWrapper>

        <MenuButton onClick={() => openMenu(true)}>
          <img src={ArrowUpIcon} /> <span>Backup</span>
        </MenuButton>

        <CloseButton onClick={close}>
          <img src={LockIcon} />
        </CloseButton>
      </NetworkAndFeatures>

      <PrimaryBox>
        <AddressWrapper>
          <AddressAndCopy>
            <AddressLink
              href={account.linkOfAddress(account.address)}
              target="_blank"
            >
              <AddressLong>{truncate(account.address)}</AddressLong>
              <AddressShort>{truncate(account.address, 6)}</AddressShort>
            </AddressLink>

            <button onClick={copyAddress}>
              <img src={CopyIcon} />
            </button>
          </AddressAndCopy>

          <RefreshAndEyeballs>
            <button onClick={fetchBalances}>
              <img src={RefreshIcon} />
            </button>
            <button onClick={toggleBalancesVisible}>
              <img src={showBalances ? HideIcon : ShowIcon} />
            </button>
          </RefreshAndEyeballs>
        </AddressWrapper>

        <NativeBalance>
          {loading
            ? LOADING_PLACEHOLDER
            : !showBalances
            ? BALANCE_PLACEHOLDER
            : nativeTokenBalance > 0
            ? toFlexible(nativeTokenBalance, 2)
            : "0"}
          &nbsp;
          {nativeTokenName}
        </NativeBalance>
      </PrimaryBox>

      <TokensList>
        {tokenBalances
          .filter((t) => !!t.nativeToken)
          .concat(tokenBalances.filter((t) => !t.nativeToken))
          .map((t) => (
            <TokenBalanceRow
              key={t.contractAddress}
              token={{
                symbol: t.contractTickerSymbol,
                name: t.contractName,
                logoURI: t.logoURI,
                contract: t.contractAddress,
              }}
              balance={ethers.formatUnits(t.balance, t.contractDecimals)}
              showBalance={showBalances}
              quote={t.quote}
              onClick={() => selectToken(t.contractAddress)}
            />
          ))}
      </TokensList>
    </Container>
  );
};

export default EvmHome;
