import { useContext, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import styled from "styled-components";

import ArrowUpRightIcon from "@mybucks/assets/icons/arrow-up-right.svg";
import BackIcon from "@mybucks/assets/icons/back.svg";
import InfoGreenIcon from "@mybucks/assets/icons/info-green.svg";
import InfoRedIcon from "@mybucks/assets/icons/info-red.svg";
import RefreshIcon from "@mybucks/assets/icons/refresh.svg";
import Avatar from "@mybucks/components/Avatar";
import Button from "@mybucks/components/Button";
import {
  Box as BaseBox,
  Container as BaseContainer,
} from "@mybucks/components/Containers";
import Input from "@mybucks/components/Input";
import { Label } from "@mybucks/components/Label";
import { H3 } from "@mybucks/components/Texts";
import { StoreContext } from "@mybucks/contexts/Store";
import useDebounce from "@mybucks/hooks/useDebounce";
import { LOADING_PLACEHOLDER } from "@mybucks/lib/conf";
import ActivityTable from "@mybucks/pages/network/common/ActivityTable";
import media from "@mybucks/styles/media";

import ConfirmTransaction from "./ConfirmTransaction";
import MinedTransaction from "./MinedTransaction";

const Container = styled(BaseContainer)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.xl};
`;

const Box = styled(BaseBox)`
  width: 100%;
`;

const NavsWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TokenDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: ${({ theme }) => theme.sizes.x3s};
`;

const LogoAndLink = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: ${({ theme }) => theme.sizes.x3s};
`;

const ContractLink = styled.a`
  position: absolute;
  top: -2px;
  left: calc(50% + 26px);
`;

const ArrowUpRight = styled.img.attrs({ src: ArrowUpRightIcon })`
  width: 16px;
`;

const TokenBalance = styled.h5`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.base};
  font-size: ${({ theme }) => theme.sizes.xl};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 120%;
  text-align: center;
`;

const TokenValue = styled.h6`
  font-size: ${({ theme }) => theme.sizes.base};
  font-weight: ${({ theme }) => theme.weights.highlight};
  line-height: 150%;
`;

const AmountWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.x3s};
  margin-bottom: ${({ theme }) => theme.sizes.x2l};

  input {
    margin-bottom: 0;
  }

  ${media.sm`
    margin-bottom: ${({ theme }) => theme.sizes.xl};
  `}
`;

const MaxButton = styled(Button).attrs({ $variant: "outline" })`
  font-size: ${({ theme }) => theme.sizes.sm};
  line-height: 130%;
`;

const InvalidTransfer = styled.div`
  padding: 0.25rem 0.625rem;
  border-radius: ${({ theme }) => theme.sizes.x3s};
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid ${({ theme }) => theme.colors.error};
  margin-bottom: ${({ theme }) => theme.sizes.x2l};
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

const Submit = styled(Button)`
  width: 17rem;

  ${media.sm`
    width: 100%;
  `}
`;

const Token = () => {
  const [hasErrorInput, setHasErrorInput] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [txnHash, setTxnHash] = useState("");

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);
  const [invalidRecipientAddress, setInvalidRecipientAddress] = useState(false);

  const [gasEstimation, setGasEstimation] = useState(0);
  const [gasEstimationValue, setGasEstimationValue] = useState(0);
  const [history, setHistory] = useState([]);

  const {
    account,
    selectedTokenAddress,
    selectToken,
    tokenBalances,
    fetchBalances,
    nativeTokenName,
    nativeTokenPrice,
    loading,
  } = useContext(StoreContext);
  const token = useMemo(
    () => tokenBalances.find((t) => t.address === selectedTokenAddress),
    [tokenBalances, selectedTokenAddress]
  );

  const { debounce } = useDebounce();
  const estimateGas = debounce(async () => {
    setInvalidRecipientAddress(false);
    setGasEstimation(0);
    setGasEstimationValue(0);
    setTransaction(null);
    setHasErrorInput(false);

    if (!recipient || !amount) {
      return;
    }

    if (!account.isAddress(recipient)) {
      setInvalidRecipientAddress(true);
      return;
    }

    if (amount < 0 || !token) {
      setHasErrorInput(true);
      return;
    }

    try {
      const txData = await account.populateTransferToken(
        token.native ? "" : selectedTokenAddress,
        recipient,
        ethers.parseUnits(
          amount.toString(),
          token.decimals
        )
      );
      setTransaction(txData);

      const gasAmount = await account.estimateGas(txData);
      const gas = Number(ethers.formatUnits(account.gasPrice * gasAmount, 18));
      const value = gas * nativeTokenPrice;
      setGasEstimation(gas.toFixed(6));
      setGasEstimationValue(value.toFixed(6));
      setHasErrorInput(false);
    } catch (e) {
      setHasErrorInput(true);
    }
  }, 500);

  useEffect(() => {
    if (!token.native) {
      account.queryTokenHistory(selectedTokenAddress).then((result) => {
        setHistory(result || []);
      });
    }
  }, []);

  useEffect(() => {
    estimateGas();
  }, [recipient, amount, token]);

  const onSuccess = async (txn) => {
    setConfirming(false);
    setTransaction(null);
    setRecipient("");
    setAmount(0);
    setTxnHash(txn.hash);
  };

  if (confirming) {
    return (
      <ConfirmTransaction
        {...transaction}
        onReject={() => setConfirming(false)}
        onSuccess={onSuccess}
      />
    );
  }

  if (txnHash) {
    return (
      <MinedTransaction
        txnHash={txnHash}
        txnLink={account.linkOfTransaction(txnHash)}
        back={() => setTxnHash("")}
      />
    );
  }

  return (
    <Container>
      <NavsWrapper>
        <button onClick={() => selectToken("")}>
          <img src={BackIcon} />
        </button>

        <button onClick={fetchBalances}>
          <img src={RefreshIcon} />
        </button>
      </NavsWrapper>

      <TokenDetails>
        <LogoAndLink>
          {token.native ? (
            <Avatar
              uri={token.logoURI}
              symbol={token.symbol}
              fallbackColor={"#" + token.address.slice(2, 8)}
            />
          ) : (
            <a
              href={account.linkOfContract(token.address)}
              target="_blank"
            >
              <Avatar
                uri={token.logoURI}
                symbol={token.symbol}
                fallbackColor={"#" + token.address.slice(2, 8)}
              />
            </a>
          )}

          {!token.native && (
            <ContractLink
              href={account.linkOfContract(token.address)}
              target="_blank"
            >
              <ArrowUpRight />
            </ContractLink>
          )}
        </LogoAndLink>

        <TokenBalance>
          {loading ? LOADING_PLACEHOLDER : token.balance.toFixed(4)}
          &nbsp;
          {token.symbol}
        </TokenBalance>

        {!!token.quote && (
          <TokenValue>${Number(token.quote).toFixed(4)}</TokenValue>
        )}
      </TokenDetails>

      <Box>
        <H3>Send token to</H3>

        <Label htmlFor="recipient">Recipient</Label>
        <Input
          id="recipient"
          type="text"
          placeholder="Recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />

        <Label htmlFor="amount">Amount</Label>
        <AmountWrapper>
          <Input
            id="amount"
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <MaxButton onClick={() => setAmount(token.balance)}>Max</MaxButton>
        </AmountWrapper>

        {invalidRecipientAddress ? (
          <InvalidTransfer>
            <img src={InfoRedIcon} />
            <span>Invalid address</span>
          </InvalidTransfer>
        ) : hasErrorInput ? (
          <InvalidTransfer>
            <img src={InfoRedIcon} />
            <span>Invalid transfer</span>
          </InvalidTransfer>
        ) : gasEstimation > 0 ? (
          <EstimatedGasFee>
            <img src={InfoGreenIcon} />
            <span>
              Estimated gas fee: {gasEstimation}&nbsp; {nativeTokenName} / $
              {gasEstimationValue}
            </span>
          </EstimatedGasFee>
        ) : (
          <></>
        )}

        <Submit
          onClick={() => setConfirming(true)}
          disabled={hasErrorInput || gasEstimation === 0}
        >
          Submit
        </Submit>
      </Box>

      {history.length > 0 && (
        <ActivityTable account={account} history={history} />
      )}
    </Container>
  );
};

export default Token;
