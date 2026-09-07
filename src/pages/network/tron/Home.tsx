import { useContext } from "react";
import { toast } from "react-toastify";
import copy from "clipboard-copy";
import styled from "styled-components";
import toFlexible from "toflexible";

import {
  CopyIcon,
  HideIcon,
  LockIcon,
  QrcodeIcon,
  RefreshIcon2,
  ShowIcon,
} from "@mybucks/assets/icons";
import BaseButton from "@mybucks/components/Button";
import { Container } from "@mybucks/components/Containers";
import { Label } from "@mybucks/components/Label";
import Link from "@mybucks/components/Link";
import NetworkSelector from "@mybucks/components/NetworkSelector";
import Skeleton from "@mybucks/components/Skeleton";
import { StoreContext } from "@mybucks/contexts/Store";
import type TronAccount from "@mybucks/lib/account/tron";
import { clearQueryParams, truncate } from "@mybucks/lib/utils";
import TokenBalanceRow from "@mybucks/pages/network/common/TokenBalanceRow";
import TokenBalanceRowSkeleton from "@mybucks/pages/network/common/TokenBalanceRowSkeleton";
import { blurWhenHidden } from "@mybucks/styles/effects";
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
  margin-bottom: ${({ theme }) => theme.sizes.xl};
  color: ${({ theme }) => theme.colors.textStrong};

  ${media.sm`
    font-size: ${({ theme }) => theme.sizes.xl};
  `}
`;

const BalanceValue = styled.span<{ $hidden?: boolean }>`
  ${blurWhenHidden}
`;

const BandwidthAndEnergy = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.base};
  padding-top: ${({ theme }) => theme.sizes.xs};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  ${media.sm`
    flex-direction: column;
    gap: ${({ theme }) => theme.sizes.x3s};
  `}
`;

const Bandwidth = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.sizes.x2l};
  flex: 1;
`;

const BandwidthLabel = styled(Label)`
  display: inline;
  margin-bottom: 0;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const BandwidthValue = styled(BandwidthLabel)`
  color: ${({ theme }) => theme.colors.textStrong};
`;

const TokensList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.sizes.xs};
`;

const TronHome = () => {
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
    nativeToken,
    tokenBalances,
    getTokenQuote,
    fetchBalances,
    selectToken,
  } = useContext(StoreContext);
  // Only rendered on the Tron network — account is always a TronAccount here.
  const account = rawAccount as TronAccount;

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

        <BandwidthAndEnergy>
          <Bandwidth>
            <BandwidthLabel>Bandwidth:</BandwidthLabel>
            <BandwidthValue>
              {loading ? (
                <Skeleton $width="2.5rem" $height="1em" />
              ) : (
                account.freeBandwidth.toLocaleString()
              )}{" "}
              /{" "}
              {loading ? (
                <Skeleton $width="2.5rem" $height="1em" />
              ) : (
                account.stakedBandwidth.toLocaleString()
              )}
            </BandwidthValue>
          </Bandwidth>

          <Bandwidth>
            <BandwidthLabel>Energy:</BandwidthLabel>
            <BandwidthValue>
              {loading ? (
                <Skeleton $width="2.5rem" $height="1em" />
              ) : (
                account.energyBalance.toLocaleString()
              )}
            </BandwidthValue>
          </Bandwidth>
        </BandwidthAndEnergy>
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

export default TronHome;
