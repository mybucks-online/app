import { useContext } from "react";
import styled from "styled-components";
import { toast, ToastContainer } from "react-toastify";
import { useIdleTimer } from "react-idle-timer";

import { IDLE_DURATION, NETWORK } from "@mybucks/lib/conf";
import { StoreContext } from "@mybucks/contexts/Store";

import SignIn from "@mybucks/pages/Signin";
import Menu from "@mybucks/pages/Menu";
import EvmHome from "@mybucks/pages/network/evm/Home";
import EvmToken from "@mybucks/pages/network/evm/Token";
import TronHome from "@mybucks/pages/network/tron/Home";
import TronToken from "@mybucks/pages/network/tron/Token";

import "react-toastify/dist/ReactToastify.css";

const AppWrapper = styled.div`
  position: relative;
`;

const Warning = styled.div`
  text-align: center;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.gray25};
  font-size: ${({ theme }) => theme.sizes.base};
  font-weight: ${({ theme }) => theme.weights.regular};
`;

const WarningLink = styled.a`
  text-decoration: underline;
  font-weight: ${({ theme }) => theme.weights.highlight};
`;

function Content() {
  const { account, selectedTokenAddress, inMenu, network } =
    useContext(StoreContext);

  if (!account) {
    return <SignIn />;
  }
  if (inMenu) {
    return <Menu />;
  }
  if (network === NETWORK.EVM) {
    if (selectedTokenAddress) {
      return <EvmToken />;
    }
    return <EvmHome />;
  } else if (network === NETWORK.TRON) {
    if (selectedTokenAddress) {
      return <TronToken />;
    }
    return <TronHome />;
  }
}

function App() {
  const { account, connectivity, hash, loading, reset } =
    useContext(StoreContext);

  useIdleTimer({
    onIdle: () => {
      if (hash) {
        reset();
        toast("Account locked after 15 minutes idle!");
      }
    },
    timeout: IDLE_DURATION,
    throttle: 500,
  });

  return (
    <AppWrapper>
      {!connectivity ? (
        <Warning>Please check your internet connection!</Warning>
      ) : !loading && !!account && !account.activated ? (
        <Warning>
          Please activate your account!{"  "}
          <WarningLink
            href="https://developers.tron.network/docs/account#account-activation"
            target="_blank"
          >
            Learn More
          </WarningLink>
        </Warning>
      ) : (
        ""
      )}
      <Content />
      <ToastContainer
        position="top-center"
        hideProgressBar={false}
        theme="light"
      />
    </AppWrapper>
  );
}

export default App;
