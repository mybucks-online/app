import { useContext } from "react";
import styled from "styled-components";
import { toast, ToastContainer } from "react-toastify";
import { useIdleTimer } from "react-idle-timer";

import { IDLE_DURATION, NETWORK_EVM } from "@mybucks/lib/conf";
import { StoreContext } from "@mybucks/contexts/Store";
import SignIn from "@mybucks/pages/Signin";
import Menu from "@mybucks/pages/Menu";
import EvmHome from "@mybucks/pages/network/evm/Home";
import EvmToken from "@mybucks/pages/network/evm/Token";

import "react-toastify/dist/ReactToastify.css";

const AppWrapper = styled.div`
  position: relative;
`;

const ConnectionIssue = styled.div`
  text-align: center;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.gray200};
  color: ${({ theme }) => theme.colors.gray25};
  font-size: ${({ theme }) => theme.sizes.base};
  font-weight: ${({ theme }) => theme.weights.regular};
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
  if (network === NETWORK_EVM) {
    if (selectedTokenAddress) {
      return <EvmToken />;
    }
    return <EvmHome />;
  }
}

function App() {
  const { connectivity, hash, reset } = useContext(StoreContext);

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
      {!connectivity && (
        <ConnectionIssue>
          Please check your internet connection!
        </ConnectionIssue>
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
