import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { generateToken } from "@mybucks.online/core";
import copy from "clipboard-copy";
import { QRCodeSVG } from "qrcode.react";
import styled from "styled-components";

import BaseButton from "@mybucks/components/Button";
import ConfirmPinModal from "@mybucks/components/ConfirmPinModal";
import { Box as BaseBox, Container } from "@mybucks/components/Containers";
import Link from "@mybucks/components/Link";
import { BackButton } from "@mybucks/components/NavButtons";
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
  overflow-wrap: anywhere;
`;

const Button = styled(BaseButton)`
  min-width: 12rem;
  margin-bottom: ${({ theme }) => theme.sizes.x2l};
`;

const QRCodeWrapper = styled.div`
  background-color: white;
  padding: ${({ theme }) => theme.sizes.x3s};
  border-radius: ${({ theme }) => theme.radius.sm};
  display: block;

  & > svg {
    display: block;
  }
`;

const GiftingLinkWarning = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.sizes.xs};
  font-weight: ${({ theme }) => theme.weights.regular};
  color: ${({ theme }) => theme.colors.gray200};
  line-height: 140%;
  margin: 0 0 ${({ theme }) => theme.sizes.x2l};

  a {
    font-size: inherit;
  }
`;

const LegacyBadge = styled.span`
  display: inline-block;
  font-size: ${({ theme }) => theme.sizes.xs};
  font-weight: ${({ theme }) => theme.weights.regular};
  color: ${({ theme }) => theme.colors.warning};
  margin-bottom: ${({ theme }) => theme.sizes.sm};
`;

const BACKUP_CREDENTIALS = 1;
const BACKUP_PRIVATE_KEY = 2;
const BACKUP_TRANSFER_LINK = 3;

const Menu = () => {
  const [confirmPin, setConfirmPin] = useState(false);
  const [nextStep, setNextStep] = useState(0);
  const { openMenu, account, passphrase, pin, network, chainId, legacy } =
    useContext(StoreContext);

  const backupAddress = () => {
    copy(account.address);
    toast("Address copied into clipboard.");
  };

  const onClickCredentials = () => {
    setNextStep(BACKUP_CREDENTIALS);
    setConfirmPin(true);
  };

  const onClickPrivateKey = () => {
    setNextStep(BACKUP_PRIVATE_KEY);
    setConfirmPin(true);
  };

  const onClickGenerateLink = () => {
    setNextStep(BACKUP_TRANSFER_LINK);
    setConfirmPin(true);
  };

  const onConfirmedPin = () => {
    setConfirmPin(false);
    if (nextStep === BACKUP_CREDENTIALS) {
      copy(`${passphrase} : ${pin}`);
      toast("Credentials copied into clipboard.");
    } else if (nextStep === BACKUP_PRIVATE_KEY) {
      copy(account.signer);
      toast("Private key copied into clipboard.");
    } else if (nextStep === BACKUP_TRANSFER_LINK) {
      const networkName = findNetworkNameByChainId(network, chainId);
      const link = generateToken(passphrase, pin, networkName, legacy);
      copy(
        window.location.origin + window.location.pathname + "#wallet=" + link,
      );
      toast("Wallet link copied into clipboard.");
    }
  };

  return (
    <>
      <Container>
        <NavsWrapper>
          <BackButton onClick={() => openMenu(false)} />
        </NavsWrapper>

        <Box>
          <Title>Account Details</Title>
          {legacy && <LegacyBadge>Legacy wallet</LegacyBadge>}
          <QRCodeWrapper>
            <QRCodeSVG value={network + ":" + account.address} />
          </QRCodeWrapper>
          <Address>{account.address}</Address>

          <Button onClick={backupAddress}>Address</Button>

          <Button onClick={onClickCredentials} $variant="danger">
            Credentials
          </Button>
          <Button onClick={onClickPrivateKey} $variant="danger">
            Private Key
          </Button>
          <Button onClick={onClickGenerateLink} $variant="danger">
            Gifting Link
          </Button>
          <GiftingLinkWarning>
            ⚠️ Anyone with your credentials, private-key or <br/>gifting-link has full access to your funds!{" "}
            <Link
              href="https://docs.mybucks.online/user-guide/security-notice"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </Link>
          </GiftingLinkWarning>
        </Box>
      </Container>

      <ConfirmPinModal
        show={confirmPin}
        onFailed={() => setConfirmPin(false)}
        onSuccess={onConfirmedPin}
      />
    </>
  );
};

export default Menu;
