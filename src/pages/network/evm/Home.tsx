import { useContext, useMemo } from "react";
import { toast } from "react-toastify";
import copy from "clipboard-copy";
import { ethers } from "ethers";
import styled from "styled-components";
import toFlexible from "toflexible";

import {
  CopyIcon,
  GasIcon,
  HideIcon,
  LockIcon,
  QrcodeIcon,
  RefreshIcon2,
  ShowIcon,
} from "@mybucks/assets/icons";
import BaseButton from "@mybucks/components/Button";
import { Container } from "@mybucks/components/Containers";
import Link from "@mybucks/components/Link";
import NetworkSelector from "@mybucks/components/NetworkSelector";
import Skeleton from "@mybucks/components/Skeleton";
import { StoreContext } from "@mybucks/contexts/Store";
import type EvmAccount from "@mybucks/lib/account/evm";
import { clearQueryParams, truncate } from "@mybucks/lib/utils";
import TokenBalanceRow from "@mybucks/pages/network/common/TokenBalanceRow";
import TokenBalanceRowSkeleton from "@mybucks/pages/network/common/TokenBalanceRowSkeleton";
import { blurWhenHidden, type HiddenProp } from "@mybucks/styles/effects";
import media from "@mybucks/styles/media";

const NetworkAndFeatures = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
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

const GasPriceWrapper = styled.div<{ $show: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  visibility: ${({ $show }) => ($show ? "visible" : "hidden")};
  font-weight: ${({ theme }) => theme.weights.regular};
  font-size: ${({ theme }) => theme.sizes.sm};
  color: ${({ theme }) => theme.colors.textStrong};

  ${media.xs`
    img {
      display: none;
    }
  `}
`;

const MenuButton = styled(BaseButton).attrs({ $size: "small" })`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  margin-left: auto;
`;

const CloseButton = styled(BaseButton).attrs({ $size: "small" })`
  display: flex;
  padding: 6px 8px;
`;

const PrimaryBox = styled.div`
  margin-bottom: ${({ theme }) => theme.sizes.x2l};

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
  color: ${({ theme }) => theme.colors.textStrong};

  ${media.sm`
    font-size: ${({ theme }) => theme.sizes.xl};
  `}
`;

const BalanceValue = styled.span<HiddenProp>`
  ${blurWhenHidden}
`;

const TokensList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.sizes.xs};
`;

const EvmHome = () => {
  const {
    loading,
    openMenu,
    showBalances,
    setShowBalances,
    account: rawAccount,
    network,
    chainId,
    updateNetwork,
    reset,
    tokenBalances,
    nativeToken,
    getTokenQuote,
    tick,
    fetchBalances,
    selectToken,
  } = useContext(StoreContext);
  // Only rendered on the EVM network — account is always an EvmAccount here.
  const account = rawAccount as EvmAccount;

  const gasPrice = useMemo(
    () => toFlexible(parseFloat(ethers.formatUnits(account.gasPrice, 9)), 2),
    [tick, account],
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

    clearQueryParams();
  };

  return (
    <Container>
      <NetworkAndFeatures>
        <NetworkWrapper>
          <NetworkSelector
            network={network}
            chainId={chainId}
            updateNetwork={updateNetwork}
            disabled={loading}
          />
          <GasPriceWrapper $show={Number(gasPrice) > 0}>
            <img src={GasIcon} /> <span>{gasPrice} GWei</span>
          </GasPriceWrapper>
        </NetworkWrapper>

        <MenuButton onClick={() => openMenu(true)}>
          <img src={QrcodeIcon} />
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
              <img src={RefreshIcon2} />
            </button>
            <button onClick={toggleBalancesVisible}>
              <img src={showBalances ? HideIcon : ShowIcon} />
            </button>
          </RefreshAndEyeballs>
        </AddressWrapper>

        <NativeBalance>
          {loading ? (
            <Skeleton $width="6rem" $height="1.7rem" />
          ) : (
            <BalanceValue $hidden={!showBalances}>
              {nativeToken && nativeToken.balance > 0
                ? toFlexible(nativeToken.balance, 2)
                : "0"}
            </BalanceValue>
          )}
          &nbsp;
          {nativeToken?.symbol}
        </NativeBalance>
      </PrimaryBox>

      <TokensList>
        {loading && !tokenBalances.length ? (
          <>
            <TokenBalanceRowSkeleton />
            <TokenBalanceRowSkeleton />
          </>
        ) : (
          tokenBalances.map((t) => (
            <TokenBalanceRow
              key={t.address}
              token={{
                symbol: t.symbol,
                name: t.name,
                logoURI: t.logoURI,
                contract: t.address,
              }}
              balance={t.balance}
              showBalance={showBalances}
              quote={getTokenQuote(t)}
              onClick={() => selectToken(t.address)}
            />
          ))
        )}
      </TokensList>
    </Container>
  );
};

export default EvmHome;
