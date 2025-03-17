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

    li {
      display: inline;
      margin: 0 ${({ theme }) => theme.sizes.x2s};
    }
  }

  a:hover {
    color: ${({ theme }) => theme.colors.gray400};
  }

  ${media.md`
    p {
      display: none;
    }
  `}

  ${media.sm`
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
        <h5>&copy; 2025 Mybucks.online MIT Licensed</h5>

        <p>
          Audited by{" "}
          <a href="https://app.secure3.io/5c92d55acd" target="_blank">
            <strong>Secure3</strong>
          </a>
        </p>

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
              <a
                href="https://arbiscan.io/address/0x122a3d99342bcA8F8ba3f967e8BD9AB7AE685886"
                title="Donate us here!"
                target="_blank"
              >
                <svg width="24" height="24">
                  <path
                    d="M2.50163 21.0458H3.66829C3.89746 21.0458 4.08496 20.8583 4.08496 20.6292V13.2667C4.08496 13.0333 3.89746 12.85 3.66829 12.85H2.50163C2.27246 12.85 2.08496 13.0333 2.08496 13.2667V20.6292C2.08496 20.8583 2.27246 21.0458 2.50163 21.0458ZM5.25163 20.3625L9.98496 21.3292C10.5725 21.45 11.1641 21.5083 11.7558 21.5083C13.3766 21.5083 14.9725 21.0583 16.3766 20.1875L22.0808 16.6625C22.8975 16.1542 23.16 15.0708 22.6641 14.2458C22.4141 13.8292 22.0183 13.5417 21.5433 13.4333C21.3142 13.379 21.0764 13.3717 20.8444 13.4118C20.6124 13.4519 20.3909 13.5386 20.1933 13.6667L16.2016 16.075C16.1641 16.7708 15.8516 17.1667 15.6975 17.3208C15.2683 18.0667 14.0975 18.2792 12.9183 18.2792C11.685 18.2792 10.4433 18.05 10.0308 17.9667C9.80579 17.9208 9.65996 17.7 9.7058 17.475C9.75163 17.25 9.97246 17.1042 10.1975 17.15C11.91 17.4958 14.6183 17.65 14.9891 16.8792C15.0183 16.8208 15.4725 16.4125 15.3558 15.6167C15.3141 15.3125 15.1058 15.0458 14.8141 14.95H14.81L12.5433 14.1792L10.8475 13.4917C9.29746 12.8667 7.63496 12.8292 6.16829 13.3875C5.71829 13.5583 5.34746 13.7625 5.05579 14.0042C5.01156 14.0422 4.9763 14.0896 4.95252 14.1429C4.92875 14.1962 4.91706 14.2541 4.91829 14.3125V19.9542C4.91829 20.1542 5.05996 20.325 5.25163 20.3625ZM15.7725 12.5417C18.2641 12.5417 20.2975 10.5083 20.2975 8.01667C20.2975 5.52084 18.2641 3.49167 15.7725 3.49167C13.2766 3.49167 11.2475 5.52084 11.2475 8.01667C11.2475 10.5083 13.2766 12.5417 15.7725 12.5417ZM15.7725 8.43334C15.364 8.433 14.9724 8.2706 14.6836 7.98179C14.3948 7.69298 14.2324 7.30136 14.232 6.89292C14.232 6.18875 14.7095 5.60042 15.3558 5.41709V5.19084C15.3558 5.08033 15.3997 4.97435 15.4778 4.89621C15.556 4.81807 15.662 4.77417 15.7725 4.77417C15.883 4.77417 15.9889 4.81807 16.0671 4.89621C16.1452 4.97435 16.1891 5.08033 16.1891 5.19084V5.41667C16.835 5.6 17.3129 6.18875 17.3129 6.8925C17.3129 7.00301 17.269 7.10899 17.1908 7.18713C17.1127 7.26527 17.0067 7.30917 16.8962 7.30917C16.7857 7.30917 16.6797 7.26527 16.6016 7.18713C16.5234 7.10899 16.4795 7.00301 16.4795 6.8925C16.4795 6.50292 16.1625 6.18584 15.7725 6.18584C15.3825 6.18584 15.0654 6.5025 15.0654 6.8925C15.0654 7.2825 15.3829 7.59959 15.7725 7.59959C16.1808 7.59992 16.5724 7.76226 16.8612 8.05098C17.15 8.3397 17.3124 8.73122 17.3129 9.13959C17.3129 9.84375 16.8354 10.4325 16.1891 10.6154V10.8421C16.1891 10.9526 16.1452 11.0586 16.0671 11.1367C15.9889 11.2149 15.883 11.2588 15.7725 11.2588C15.662 11.2588 15.556 11.2149 15.4778 11.1367C15.3997 11.0586 15.3558 10.9526 15.3558 10.8421V10.6154C14.71 10.4325 14.232 9.84375 14.232 9.13959C14.232 9.02908 14.2759 8.9231 14.3541 8.84496C14.4322 8.76682 14.5382 8.72292 14.6487 8.72292C14.7592 8.72292 14.8652 8.76682 14.9433 8.84496C15.0215 8.9231 15.0654 9.02908 15.0654 9.13959C15.0654 9.52959 15.3829 9.84667 15.7725 9.84667C16.162 9.84667 16.4795 9.52959 16.4795 9.13959C16.4795 8.74959 16.1625 8.43334 15.7725 8.43334Z"
                    fill="#FF5630"
                  />
                </svg>
              </a>
            </li>
          </ul>
        </nav>
      </Footer>

      <ToastContainer
        position="top-center"
        hideProgressBar={false}
        theme="light"
      />
    </AppWrapper>
  );
}

export default App;
