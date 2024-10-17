import React, { useContext, useMemo, useState } from "react";
import { StoreContext } from "@mybucks/contexts/Store";
import styled from "styled-components";

import { Container, Box } from "@mybucks/components/Containers";
import BaseButton from "@mybucks/components/Button";
import { H3 } from "@mybucks/components/Texts";
import Link from "@mybucks/components/Link";
import media from "@mybucks/styles/media";
import {
  TRON_TXN_POLLING_INTERVAL,
  TRON_BANDWIDTH_PRICE,
  TRON_ENERGY_PRICE,
} from "@mybucks/lib/conf";

import BackIcon from "@mybucks/assets/icons/back.svg";
import InfoRedIcon from "@mybucks/assets/icons/info-red.svg";

const NavsWrapper = styled.div`
  width: 100%;
  display: flex;
  margin-bottom: ${({ theme }) => theme.sizes.xl};
`;

const TransactionDetails = styled.div`
  word-break: break-all;
  margin-bottom: ${({ theme }) => theme.sizes.xs};
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.base};
  line-height: 140%;
  color: ${({ theme }) => theme.colors.gray200};
`;

const TransactionItem = styled.span`
  font-weight: ${({ theme }) => theme.weights.highlight};
  color: ${({ theme }) => theme.colors.gray400};
`;

const ResourcesWarning = styled.div`
  word-break: break-word;
  border-radius: ${({ theme }) => theme.sizes.x3s};
  margin-bottom: ${({ theme }) => theme.sizes.x2l};
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.base};
  line-height: 160%;
  color: ${({ theme }) => theme.colors.gray200};
`;

const InvalidTransfer = styled.div`
  padding: 0.25rem 0.625rem;
  border-radius: ${({ theme }) => theme.sizes.x3s};
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid ${({ theme }) => theme.colors.error};
  margin-bottom: ${({ theme }) => theme.sizes.base};
  font-weight: ${({ theme }) => theme.weights.base};
  font-size: ${({ theme }) => theme.sizes.xs};
  line-height: 180%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.x2s};

  ${media.sm`
    margin-bottom: ${({ theme }) => theme.sizes.xl};
  `}
`;

const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.xl};

  ${media.sm`
    flex-direction: column;
    gap: ${({ theme }) => theme.sizes.xs};
  `}
`;

const Button = styled(BaseButton)`
  width: 17rem;

  ${media.sm`
    width: 100%;
  `}
`;

const LearnMoreLink = styled(Link)`
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.base};
  line-height: 140%;
`;

const ErrorRefLink = styled.a`
  text-decoration: underline;
`;

const ConfirmTransaction = ({
  token,
  recipient,
  amount,
  recipientActivated,
  transaction,
  bandwidth,
  energy,
  onSuccess,
  onReject,
}) => {
  const { account, nativeTokenBalance, fetchBalances } =
    useContext(StoreContext);
  const [hasError, setHasError] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [pending, setPending] = useState(false);

  const trxBurntEstimation = useMemo(
    () =>
      account.tronweb.fromSun(
        bandwidth * TRON_BANDWIDTH_PRICE + energy * TRON_ENERGY_PRICE
      ),
    [bandwidth, energy]
  );

  const confirmTransactionResult = async (txid) => {
    const maxAttempts = 3;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const { receipt } = await account.getTransactionInfo(txid);
      if (receipt && receipt.result === "SUCCESS") {
        return true;
      }

      attempts++;
      await new Promise((resolve) =>
        setTimeout(resolve, TRON_TXN_POLLING_INTERVAL)
      );
    }
    return false;
  };

  const confirm = async () => {
    setPending(true);
    setHasError(false);
    setErrorCode("");

    try {
      const { result, code, txid } = await account.execute(transaction);
      console.log("txn: ", result, code, txid);
      if (!result) {
        setErrorCode(code);
        throw new Error("");
      }

      const confirmed = await confirmTransactionResult(txid);
      if (confirmed) {
        fetchBalances();
        onSuccess(txid);
      } else {
        throw new Error("");
      }
    } catch (e) {
      setHasError(true);
    }

    setPending(false);
  };

  return (
    <Container>
      <NavsWrapper>
        <button onClick={onReject} disabled={pending}>
          <img src={BackIcon} />
        </button>
      </NavsWrapper>

      <Box>
        <H3>Confirm transaction</H3>
        <TransactionDetails>
          <p>
            <TransactionItem>To:</TransactionItem> {recipient}
          </p>

          <p>
            <TransactionItem>Value:</TransactionItem> {amount}{" "}
            {token.contractTickerSymbol}
          </p>
        </TransactionDetails>
        <TransactionDetails>
          <p>
            <TransactionItem>Consumption:</TransactionItem> {bandwidth}{" "}
            Bandwidth + {energy} Energy, ≈ {trxBurntEstimation} TRX
          </p>
        </TransactionDetails>
        <ResourcesWarning>
          - If your bandwidth or energy is insufficient, the remaining fee
          should be paid in TRX.&nbsp;
          <LearnMoreLink
            href="https://developers.tron.network/docs/resource-model"
            target="_blank"
          >
            Learn More.
          </LearnMoreLink>
          <br />- Staking TRX will provide you with free bandwidth and
          energy.&nbsp;
          <LearnMoreLink
            href="https://developers.tron.network/docs/staking-on-tron-network"
            target="_blank"
          >
            Learn More.
          </LearnMoreLink>
        </ResourcesWarning>

        {!recipientActivated && (
          <InvalidTransfer>
            <img src={InfoRedIcon} />
            <span>
              Recipient is not activated. You will be charged account creation
              fee.{" "}
              <ErrorRefLink
                href="https://developers.tron.network/docs/account#account-activation"
                target="_blank"
              >
                Learn More.
              </ErrorRefLink>
            </span>
          </InvalidTransfer>
        )}
        {!hasError &&
          Number(trxBurntEstimation) > Number(nativeTokenBalance) && (
            <InvalidTransfer>
              <img src={InfoRedIcon} />
              <span>
                The transaction may fail due to insufficient TRX balance.
              </span>
            </InvalidTransfer>
          )}
        {hasError ? (
          <InvalidTransfer>
            <img src={InfoRedIcon} />
            <span>
              Failed to execute! {errorCode && <strong>{errorCode}</strong>}
            </span>
          </InvalidTransfer>
        ) : (
          ""
        )}
        <ButtonsWrapper>
          <Button onClick={confirm} disabled={pending | hasError}>
            Confirm
          </Button>
          <Button onClick={onReject} disabled={pending} $variant="secondary">
            Reject
          </Button>
        </ButtonsWrapper>
      </Box>
    </Container>
  );
};

export default ConfirmTransaction;
