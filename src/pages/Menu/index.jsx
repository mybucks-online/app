import { useContext, useState } from "react";
import { toast } from "react-toastify";
import copy from "clipboard-copy";
import styled from "styled-components";

import BackIcon from "@mybucks/assets/icons/back.svg";
import BaseButton from "@mybucks/components/Button";
import ConfirmPasscodeModal from "@mybucks/components/ConfirmPasscodeModal";
import { Box as BaseBox, Container } from "@mybucks/components/Containers";
import { H3 } from "@mybucks/components/Texts";
import { StoreContext } from "@mybucks/contexts/Store";

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
  margin-bottom: ${({ theme }) => theme.sizes.xs};
`;

const Address = styled.p`
  width: 100%;
  text-align: center;
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 140%;
  margin-bottom: ${({ theme }) => theme.sizes.x2l};
  color: ${({ theme }) => theme.colors.gray200};
`;

const Button = styled(BaseButton)`
  min-width: 12rem;
  margin-bottom: ${({ theme }) => theme.sizes.x2l};
`;

const Menu = () => {
  const [confirmPasscode, setConfirmPasscode] = useState(false);
  const [isBackupPassword, setIsBackupPassword] = useState(false);
  const { openMenu, account, password, passcode } = useContext(StoreContext);

  const backupAddress = () => {
    copy(account.address);
    toast("Address copied into clipboard.");
  };

  const onClickPassword = () => {
    setIsBackupPassword(true);
    setConfirmPasscode(true);
  };

  const onClickPrivateKey = () => {
    setIsBackupPassword(false);
    setConfirmPasscode(true);
  };

  const onConfirmedPasscode = () => {
    setConfirmPasscode(false);
    if (isBackupPassword) {
      copy(`${password} : ${passcode}`);
      toast("Password copied into clipboard.");
    } else {
      copy(account.signer);
      toast("Private key copied into clipboard.");
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
          <Title>Backup Account</Title>
          <Address>{account.address}</Address>

          <Button onClick={backupAddress}>Address</Button>
          <Button onClick={onClickPassword}>Password</Button>
          <Button onClick={onClickPrivateKey}>Private Key</Button>
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
