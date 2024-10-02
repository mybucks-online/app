import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "@mybucks/contexts/Store";
import { ethers } from "ethers";
import styled from "styled-components";

import { gasMultiplier } from "@mybucks/lib/conf";
import { Container, Box } from "@mybucks/components/Containers";
import BaseButton from "@mybucks/components/Button";
import { H3 } from "@mybucks/components/Texts";
import media from "@mybucks/styles/media";

import BackIcon from "@mybucks/assets/icons/back.svg";
import InfoRedIcon from "@mybucks/assets/icons/info-red.svg";
import InfoGreenIcon from "@mybucks/assets/icons/info-green.svg";

const NavsWrapper = styled.div`
  width: 100%;
  display: flex;
  margin-bottom: ${({ theme }) => theme.sizes.xl};
`;

const TransactionDetails = styled.div`
  word-break: break-all;
  margin-bottom: ${({ theme }) => theme.sizes.xl};
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.base};
  line-height: 140%;
  color: ${({ theme }) => theme.colors.gray200};
`;

const TransactionItem = styled.span`
  font-weight: ${({ theme }) => theme.weights.highlight};
  color: ${({ theme }) => theme.colors.gray400};
`;

const OptionsWrapper = styled.fieldset`
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 130%;
  margin-bottom: ${({ theme }) => theme.sizes.xl};
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.base};
  padding: ${({ theme }) => theme.sizes.x3s};
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

const EstimatedGasFee = styled(InvalidTransfer)`
  color: ${({ theme }) => theme.colors.success};
  border: 1px solid ${({ theme }) => theme.colors.success};
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

const ConfirmTransaction = ({ to, value = 0, data, onSuccess, onReject }) => {
  const { account, fetchBalances, nativeTokenName, nativeTokenPrice } =
    useContext(StoreContext);
  const [gasOption, setGasOption] = useState("low");

  const [gasEstimation, setGasEstimation] = useState(0);
  const [gasEstimationValue, setGasEstimationValue] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const estimateGas = async () => {
      const gasAmount = await account.estimateGas({ to, data, value });
      const gas = Number(
        ethers.formatUnits(
          (account.gasPrice * gasMultiplier(gasOption) * gasAmount) / 100n,
          18
        )
      );

      const gasInUsd = gas * nativeTokenPrice;
      setGasEstimation(gas.toFixed(6));
      setGasEstimationValue(gasInUsd.toFixed(6));
    };

    estimateGas();
  }, [gasOption]);

  const confirm = async () => {
    setPending(true);
    setHasError(false);

    try {
      const txn = await account.execute({
        to,
        value,
        data,
        gasPrice: (account.gasPrice * gasMultiplier(gasOption)) / 100n,
      });

      // update balances
      fetchBalances();
      onSuccess(txn);
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
            <TransactionItem>To:</TransactionItem> {to}
          </p>
          {!!value && (
            <p>
              <TransactionItem>Value:</TransactionItem>{" "}
              {ethers.formatEther(value)}
            </p>
          )}
          {!!data && (
            <p>
              <TransactionItem>Data:</TransactionItem> {data}
            </p>
          )}
        </TransactionDetails>

        <OptionsWrapper disabled={pending}>
          <legend>Select gas price:</legend>
          <OptionItem>
            <input
              type="radio"
              name="low"
              id="low"
              value="low"
              checked={gasOption === "low"}
              onChange={() => setGasOption("low")}
            />
            <label htmlFor="low">
              Low / {ethers.formatUnits(account.gasPrice, 9)} GWei
            </label>
          </OptionItem>

          <OptionItem>
            <input
              type="radio"
              name="average"
              id="average"
              value="average"
              checked={gasOption === "average"}
              onChange={() => setGasOption("average")}
            />
            <label htmlFor="average">Average (*1.5)</label>
          </OptionItem>

          <OptionItem>
            <input
              type="radio"
              name="high"
              id="high"
              value="high"
              checked={gasOption === "high"}
              onChange={() => setGasOption("high")}
            />
            <label htmlFor="high">High (*1.75)</label>
          </OptionItem>
        </OptionsWrapper>

        {hasError ? (
          <InvalidTransfer>
            <img src={InfoRedIcon} />
            <span>Failed to execute! Please check balances.</span>
          </InvalidTransfer>
        ) : (
          <EstimatedGasFee>
            <img src={InfoGreenIcon} />
            <span>
              Estimated gas fee: {gasEstimation}&nbsp; {nativeTokenName} / $
              {gasEstimationValue}
            </span>
          </EstimatedGasFee>
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
