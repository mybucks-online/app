import { useContext } from "react";
import { useIdleTimer } from "react-idle-timer";
import { toast, ToastContainer } from "react-toastify";
import copy from "clipboard-copy";
import styled from "styled-components";

import { StoreContext } from "@mybucks/contexts/Store";
import { IDLE_DURATION, NETWORK } from "@mybucks/lib/conf";
import { clearQueryParams } from "@mybucks/lib/utils";
import Menu from "@mybucks/pages/Menu";
import EvmHome from "@mybucks/pages/network/evm/Home";
import EvmToken from "@mybucks/pages/network/evm/Token";
import TronHome from "@mybucks/pages/network/tron/Home";
import TronToken from "@mybucks/pages/network/tron/Token";
import SignIn from "@mybucks/pages/Signin";
import media from "@mybucks/styles/media";

import "react-toastify/dist/ReactToastify.css";

const AppWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
`;

const Warning = styled.div`
  text-align: center;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.gray25};
  font-size: ${({ theme }) => theme.sizes.base};
  font-weight: ${({ theme }) => theme.weights.regular};

  a {
    text-decoration: underline;
    font-weight: ${({ theme }) => theme.weights.highlight};
  }
`;

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.sizes.sm};
  padding: ${({ theme }) => theme.sizes.x3s} ${({ theme }) => theme.sizes.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.gray100};
  color: ${({ theme }) => theme.colors.gray200};

  nav ul {
    list-style-type: none;
    display: flex;
    align-items: center;
    gap: 0;
    flex-wrap: nowrap;

    li {
      display: inline-flex;
      align-items: center;
      margin: 0 ${({ theme }) => theme.sizes.x2s};
      flex-shrink: 0;
    }
  }

  a:hover {
    color: ${({ theme }) => theme.colors.gray400};
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.gray200};
    transition: color 0.2s;

    &:hover {
      color: ${({ theme }) => theme.colors.gray400};
    }

    svg {
      display: block;
    }
  }

  ${media.md`
    flex-direction: column;
    gap: ${({ theme }) => theme.sizes.xs};
  `}
`;

function Content({ account, selectedTokenAddress, inMenu, network }) {
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
    toggleTheme,
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

      <Main>
        <Content
          account={account}
          selectedTokenAddress={selectedTokenAddress}
          inMenu={inMenu}
          network={network}
        />
      </Main>

      <Footer>
        <h5>&copy; 2026 Mybucks.online MIT Licensed</h5>

        <a href="https://codesandbox.io/p/sandbox/mybucks-online-key-generation-sandbox-lt53c3" target="_blank">
          Verify Key Logic
        </a>

        <nav>
          <ul>
            <li>
              <a
                href="https://x.com/mybucks_online"
                title="Twitter"
                target="_blank"
              >
                <svg width="24" height="24">
                  <path
                    d="M3.45996 3L10.5684 13.3633L3.11426 22H4.70312L11.2725 14.3887L16.4932 22H21.5L14.0615 11.1562L21.1016 3H19.5137L13.3584 10.1309L8.4668 3H3.45996Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </li>

            <li>
              <a
                href="https://discord.gg/RTHgTePKgP"
                title="discord"
                target="_blank"
              >
                <svg width="24" height="24">
                  <path
                    d="M20.8125 5.38475C18.8223 3.78319 15.6738 3.51171 15.5391 3.50194C15.3301 3.48436 15.1309 3.60155 15.0449 3.79491C15.0371 3.80663 14.9688 3.96483 14.8926 4.21092C16.209 4.43358 17.8262 4.88085 19.2891 5.78905C19.5234 5.93358 19.5957 6.24217 19.4512 6.47655C19.3555 6.63085 19.1934 6.71483 19.0254 6.71483C18.9355 6.71483 18.8438 6.68944 18.7617 6.63866C16.2461 5.07811 13.1055 4.99999 12.5 4.99999C11.8945 4.99999 8.75195 5.07811 6.23828 6.63866C6.00391 6.78514 5.69531 6.71288 5.55078 6.4785C5.4043 6.24217 5.47656 5.93553 5.71094 5.78905C7.17383 4.8828 8.79102 4.43358 10.1074 4.21288C10.0313 3.96483 9.96289 3.80858 9.95703 3.79491C9.86914 3.60155 9.67188 3.48046 9.46094 3.50194C9.32617 3.51171 6.17774 3.78319 4.16016 5.40624C3.10742 6.38085 1 12.0762 1 17C1 17.0879 1.02344 17.1719 1.06641 17.248C2.51953 19.8027 6.48633 20.4707 7.39063 20.5C7.39453 20.5 7.40039 20.5 7.40625 20.5C7.56641 20.5 7.7168 20.4238 7.81055 20.2949L8.72461 19.0371C6.25781 18.4004 4.99805 17.3183 4.92578 17.2539C4.71875 17.0723 4.69922 16.7558 4.88281 16.5488C5.06445 16.3418 5.38086 16.3223 5.58789 16.5039C5.61719 16.5312 7.9375 18.5 12.5 18.5C17.0703 18.5 19.3906 16.5234 19.4141 16.5039C19.6211 16.3242 19.9355 16.3418 20.1191 16.5508C20.3008 16.7578 20.2813 17.0723 20.0742 17.2539C20.002 17.3183 18.7422 18.4004 16.2754 19.0371L17.1895 20.2949C17.2832 20.4238 17.4336 20.5 17.5938 20.5C17.5996 20.5 17.6055 20.5 17.6094 20.5C18.5137 20.4707 22.4805 19.8027 23.9336 17.248C23.9766 17.1719 24 17.0879 24 17C24 12.0762 21.8926 6.38085 20.8125 5.38475ZM9.25 15C8.2832 15 7.5 14.1055 7.5 13C7.5 11.8945 8.2832 11 9.25 11C10.2168 11 11 11.8945 11 13C11 14.1055 10.2168 15 9.25 15ZM15.75 15C14.7832 15 14 14.1055 14 13C14 11.8945 14.7832 11 15.75 11C16.7168 11 17.5 11.8945 17.5 13C17.5 14.1055 16.7168 15 15.75 15Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </li>

            <li>
              <a
                href="https://github.com/mybucks-online/app"
                title="Github"
                target="_blank"
              >
                <svg width="24" height="24">
                  <path
                    d="M8.8955 23.418C9.251 23.265 9.5 22.9115 9.5 22.5V19.8C9.5 19.7015 9.508 19.599 9.5205 19.495C9.5135 19.497 9.507 19.4985 9.5 19.5C9.5 19.5 8 19.5 7.7 19.5C6.95 19.5 6.3 19.2 6 18.6C5.65 17.95 5.5 16.85 4.6 16.25C4.45 16.15 4.55 16 4.85 16C5.15 16.05 5.8 16.45 6.2 17C6.65 17.55 7.1 18 7.9 18C9.1435 18 9.81 17.9375 10.211 17.7225C10.678 17.028 11.3245 16.5 12 16.5V16.4875C9.166 16.3965 7.3555 15.4545 6.5125 14C4.68 14.021 3.0845 14.2025 2.174 14.3535C2.145 14.19 2.12 14.0255 2.0985 13.86C2.997 13.712 4.52 13.5365 6.271 13.503C6.215 13.365 6.1665 13.2235 6.1255 13.0785C4.37 12.9895 2.855 13.059 2.032 13.127C2.022 12.961 2.0085 12.7955 2.0065 12.6275C2.831 12.56 4.305 12.4925 6.0155 12.572C5.976 12.322 5.9505 12.0665 5.9505 11.8005C5.9505 10.9505 6.2505 10.0505 6.8005 9.3005C6.5505 8.4505 6.2005 6.6505 6.9005 6.0005C8.2505 6.0005 9.2005 6.6505 9.6505 7.0505C10.5 6.7 11.45 6.5 12.5 6.5C13.55 6.5 14.5 6.7 15.3 7.05C15.75 6.65 16.7 6 18.05 6C18.8 6.7 18.4 8.5 18.15 9.3C18.7 10.05 19 10.9 18.95 11.8C18.95 12.042 18.9275 12.2755 18.895 12.5045C20.6445 12.4185 22.1585 12.4875 22.997 12.5555C22.996 12.724 22.9805 12.8885 22.9715 13.055C22.136 12.986 20.584 12.915 18.792 13.0105C18.7475 13.1785 18.6935 13.342 18.6295 13.5005C20.4025 13.5235 21.962 13.695 22.9035 13.845C22.882 14.011 22.857 14.1755 22.828 14.3385C21.872 14.1855 20.2425 14.0065 18.3885 13.9975C17.556 15.4365 15.7785 16.375 13 16.4845V16.5C14.3 16.5 15.5 18.45 15.5 19.8V22.5C15.5 22.9115 15.749 23.265 16.1045 23.418C20.685 21.902 24 17.582 24 12.5C24 6.159 18.8415 1 12.5 1C6.1585 1 1 6.159 1 12.5C1 17.582 4.315 21.902 8.8955 23.418Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </li>

            <li>
              <a
                href="https://docs.mybucks.online"
                title="Docs"
                target="_blank"
              >
                <svg width="24" height="24">
                  <path
                    d="M20.8535 6.89648L15.1035 1.14648C15.0098 1.05273 14.8828 1 14.75 1H5.74609C4.7832 1 4 1.78125 4 2.74023V21.9512C4 23.0801 4.92188 24 6.05664 24H18.9434C20.0781 24 21 23.0801 21 21.9512V14.6006V7.25C21 7.11719 20.9473 6.99023 20.8535 6.89648ZM13 19H8.5V18H13V19ZM16.5 17H8.5V16H16.5V17ZM16.5 15H8.5V14H16.5V15ZM16.5 13H8.5V12H16.5V13ZM15.834 7C15.373 7 15 6.62695 15 6.16602V2.45703L19.543 7H15.834Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </li>

            <li>
              <button
                onClick={toggleTheme}
                title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {theme === "light" ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 2V4M12 20V22M4.92993 4.92993L6.34314 6.34314M17.6569 17.6569L19.0711 19.0711M2 12H4M20 12H22M4.92993 19.0711L6.34314 17.6569M17.6569 6.34314L19.0711 4.92993"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </Footer>

      <ToastContainer
        position="top-center"
        hideProgressBar={false}
        theme={theme}
      />
    </AppWrapper>
  );
}

export default App;
