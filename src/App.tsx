import { lazy, Suspense, useContext } from "react";
import { useIdleTimer } from "react-idle-timer";
import { toast, ToastContainer } from "react-toastify";
import copy from "clipboard-copy";
import styled from "styled-components";

import { AppShell } from "@mybucks/components/Containers";
import Footer from "@mybucks/components/Footer";
import { StoreContext } from "@mybucks/contexts/Store";
import { IDLE_DURATION, NETWORK } from "@mybucks/lib/conf";
import { clearQueryParams } from "@mybucks/lib/utils";
import media from "@mybucks/styles/media";
import type { Account } from "@mybucks/types/account";

import "react-toastify/dist/ReactToastify.css";

// Split by network so EVM (ethers) and Tron (tronweb) code never ship to a
// session that only ever uses the other chain.
const Menu = lazy(() => import("@mybucks/pages/Menu"));
const EvmHome = lazy(() => import("@mybucks/pages/network/evm/Home"));
const EvmToken = lazy(() => import("@mybucks/pages/network/evm/Token"));
const TronHome = lazy(() => import("@mybucks/pages/network/tron/Home"));
const TronToken = lazy(() => import("@mybucks/pages/network/tron/Token"));
const SignIn = lazy(() => import("@mybucks/pages/Signin"));

const AppWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
`;

/** Full-width scrollport; scrollbar hidden (still scrollable via wheel/touch/trackpad). */
const MainScroll = styled.div`
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Main = styled.main`
  box-sizing: border-box;
  max-width: ${({ theme }) => theme.sizes.shellMax};
  margin-inline: auto;
  padding-top: ${({ theme }) => theme.sizes.x3l};
  padding-inline: ${({ theme }) => theme.sizes.x2l};
  display: flex;
  flex-direction: column;
  align-items: center;

  & > * {
    width: 100%;
  }

  ${media.lg`
    padding-top: ${({ theme }) => theme.sizes.x2l};
    padding-inline: ${({ theme }) => theme.sizes.xl};
  `}

  ${media.sm`
    padding-top: ${({ theme }) => theme.sizes.xl};
    padding-inline: ${({ theme }) => theme.sizes.base};
  `}
`;

const Warning = styled.div`
  text-align: center;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.textInverse};
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.regular};

  a {
    text-decoration: underline;
    font-weight: ${({ theme }) => theme.weights.highlight};
    font-size: inherit;
  }
`;

type ContentProps = {
  account: Account | null;
  selectedTokenAddress: string;
  inMenu: boolean;
  network: NETWORK;
};

function Content({
  account,
  selectedTokenAddress,
  inMenu,
  network,
}: ContentProps) {
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
  const {
    account,
    selectedTokenAddress,
    inMenu,
    network,
    connectivity,
    hash,
    loading,
    reset,
    theme,
  } = useContext(StoreContext);

  useIdleTimer({
    onIdle: () => {
      if (hash) {
        reset();
        clearQueryParams();
        copy("");
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
          <a
            href="https://developers.tron.network/docs/account#account-activation"
            target="_blank"
          >
            Learn More
          </a>
        </Warning>
      ) : (
        ""
      )}

      <AppShell>
        <MainScroll>
          <Main>
            <Suspense fallback={null}>
              <Content
                account={account}
                selectedTokenAddress={selectedTokenAddress}
                inMenu={inMenu}
                network={network}
              />
            </Suspense>
          </Main>
        </MainScroll>

        <Footer />
      </AppShell>

      <ToastContainer
        position="top-right"
        hideProgressBar={false}
        theme={theme}
      />
    </AppWrapper>
  );
}

export default App;
