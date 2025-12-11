import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { generateToken } from "@mybucks.online/core";
import copy from "clipboard-copy";
import { QRCodeSVG } from "qrcode.react";
import styled from "styled-components";

import { BackIcon } from "@mybucks/assets/icons";
import BaseButton from "@mybucks/components/Button";
import ConfirmPasscodeModal from "@mybucks/components/ConfirmPasscodeModal";
import { Box as BaseBox, Container } from "@mybucks/components/Containers";
import { H3 } from "@mybucks/components/Texts";
import { StoreContext } from "@mybucks/contexts/Store";
import { findNetworkNameByChainId } from "@mybucks/lib/conf";

const Box = styled(BaseBox)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NavsWrapper = styled.div`
  width: 100%;
  display: flex;
  margin-bottom: ${({ theme }) => theme.sizes.xl};
`;

const Title = styled(H3)`
  margin-bottom: ${({ theme }) => theme.sizes.sm};
`;

const Address = styled.p`
  width: 100%;
  text-align: center;
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 140%;
  margin-top: ${({ theme }) => theme.sizes.xs};
  margin-bottom: ${({ theme }) => theme.sizes.x2l};
  color: ${({ theme }) => theme.colors.gray200};
`;

const Button = styled(BaseButton)`
  min-width: 12rem;
  margin-bottom: ${({ theme }) => theme.sizes.x2l};
`;

const QRCodeWrapper = styled.div`
  background-color: white;
  padding: ${({ theme }) => theme.sizes.x3s};
  border-radius: ${({ theme }) => theme.radius.sm};
  display: inline-block;
`;

const BACKUP_PASSWORD = 1;
const BACKUP_PRIVATE_KEY = 2;
const BACKUP_TRANSFER_LINK = 3;

const Menu = () => {
  const [confirmPasscode, setConfirmPasscode] = useState(false);
  const [nextStep, setNextStep] = useState(0);
  const { openMenu, account, password, passcode, network, chainId } =
    useContext(StoreContext);

  const backupAddress = () => {
    copy(account.address);
    toast("Address copied into clipboard.");
  };

  const onClickPassword = () => {
    setNextStep(BACKUP_PASSWORD);
    setConfirmPasscode(true);
  };

  const onClickPrivateKey = () => {
    setNextStep(BACKUP_PRIVATE_KEY);
    setConfirmPasscode(true);
  };

  const onClickGenerateLink = () => {
    setNextStep(BACKUP_TRANSFER_LINK);
    setConfirmPasscode(true);
  };

  const onConfirmedPasscode = () => {
    setConfirmPasscode(false);
    if (nextStep === BACKUP_PASSWORD) {
      copy(`${password} : ${passcode}`);
      toast("Password copied into clipboard.");
    } else if (nextStep === BACKUP_PRIVATE_KEY) {
      copy(account.signer);
      toast("Private key copied into clipboard.");
    } else if (nextStep === BACKUP_TRANSFER_LINK) {
      const networkName = findNetworkNameByChainId(network, chainId);
      const link = generateToken(password, passcode, networkName);
      copy(
        window.location.origin + window.location.pathname + "?wallet=" + link
      );
      toast("Wallet link copied into clipboard.");
    }
  };

  return (
    <>
      <Container>
        <NavsWrapper>
          <button onClick={() => openMenu(false)}>
            <img src={BackIcon} />
          </button>
        </NavsWrapper>

        <Box>
          <Title>Account Details</Title>
          <QRCodeWrapper>
            <QRCodeSVG value={network + ":" + account.address} />
          </QRCodeWrapper>
          <Address>{account.address}</Address>

          <Button onClick={backupAddress}>Address</Button>

          <Button onClick={onClickPassword} $variant="danger">
            Password
          </Button>
          <Button onClick={onClickPrivateKey} $variant="danger">
            Private Key
          </Button>
          <Button onClick={onClickGenerateLink} $variant="danger">
            Transfer Link
          </Button>
        </Box>
      </Container>

      <ConfirmPasscodeModal
        show={confirmPasscode}
        onFailed={() => setConfirmPasscode(false)}
        onSuccess={onConfirmedPasscode}
      />
    </>
  );
};

export default Menu;
