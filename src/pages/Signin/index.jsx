import { useContext, useEffect, useMemo, useState } from "react";
import { generateHash, parseToken } from "@mybucks.online/core";
import styled from "styled-components";

import Button from "@mybucks/components/Button";
import Checkbox from "@mybucks/components/Checkbox";
import { Box } from "@mybucks/components/Containers";
import Input from "@mybucks/components/Input";
import { Label } from "@mybucks/components/Label";
import Modal from "@mybucks/components/Modal";
import PasswordToggleIcon from "@mybucks/components/PasswordToggleIcon";
import Progress from "@mybucks/components/Progress";
import { H1 } from "@mybucks/components/Texts";
import { StoreContext } from "@mybucks/contexts/Store";
import {
  findNetworkByName,
  PIN_MAX_LENGTH,
  PIN_MIN_LENGTH,
  PASSPHRASE_MAX_LENGTH,
  PASSPHRASE_MIN_LENGTH,
  TEST_PIN,
  TEST_PASSPHRASE,
  UNKNOWN_FACTS,
  WALLET_URL_PARAM,
} from "@mybucks/lib/conf";
import { clearQueryParams } from "@mybucks/lib/utils";
import media from "@mybucks/styles/media";

import Logo from "./logo.png";

const Container = styled.div`
  max-width: 40.5rem;
  margin: 0 auto;
  margin-block: ${({ theme }) => `${theme.sizes.x2l} ${theme.sizes.x4l}`};

  @media (max-width: 696px) {
    margin: 0 ${({ theme }) => theme.sizes.xl};
    margin-block: ${({ theme }) => theme.sizes.x2l};
  }
`;

const LogoWrapper = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.base};
  margin-bottom: ${({ theme }) => theme.sizes.xl};

  img {
    width: 3rem;
    height: 3rem;
  }

  ${media.sm`
    img {
      width: 2.5rem;
      height: 2.5rem;
    }
  `}
`;

const LogoTitle = styled.h3`
  font-size: ${({ theme }) => theme.sizes.xl};
  font-weight: ${({ theme }) => theme.weights.highlight};
  color: ${({ theme }) => theme.colors.gray400};
  line-height: 150%;

  ${media.sm`
    font-size: ${({ theme }) => theme.sizes.xl};
  `}
`;

const Title = styled(H1)`
  text-align: center;
  margin-bottom: 4px;

  ${media.sm`
    font-size: 1.75rem;
    `}
`;

const Caption = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.sizes.base};
  font-weight: ${({ theme }) => theme.weights.base};
  line-height: 140%;
  margin-bottom: ${({ theme }) => theme.sizes.x2l};

  ${media.sm`
    font-size: ${({ theme }) => theme.sizes.sm};
    margin-bottom: ${({ theme }) => theme.sizes.xl};
  `}
`;

const Checkboxes = styled.div`
  margin-block: ${({ theme }) => `${theme.sizes.base} ${theme.sizes.xl}`};
  display: flex;
  flex-wrap: wrap;
  & > div {
    min-width: 50%;
  }
  ${media.sm`
    flex-direction: column;
  `}
`;

const ProgressWrapper = styled.div`
  background: ${({ theme }) => theme.colors.gray25};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.sizes.base};
  padding: ${({ theme }) => `${theme.sizes.xl} ${theme.sizes.base}`};

  progress {
    max-width: 16rem;
  }
`;

const GreetingIcon = styled.img`
  width: 4.5rem;
  height: 4.5rem;
`;

const Notice = styled.p`
  text-align: center;
  max-width: 16rem;
  color: ${({ theme }) => theme.colors.gray200};
`;

const PasswordInputWrapper = styled.div`
  position: relative;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;


const SignIn = () => {
  const { setup } = useContext(StoreContext);

  const [passphrase, setPassphrase] = useState(
    import.meta.env.DEV ? TEST_PASSPHRASE : ""
  );
  const [pin, setPin] = useState(
    import.meta.env.DEV ? TEST_PIN : ""
  );
  const [disabled, setDisabled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [passphraseFocused, setPassphraseFocused] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);

  const hasMinLengthPassphrase = useMemo(
    () => passphrase.length >= PASSPHRASE_MIN_LENGTH,
    [passphrase]
  );
  const hasLowercase = useMemo(() => /[a-z]/.test(passphrase), [passphrase]);
  const hasUppercase = useMemo(() => /[A-Z]/.test(passphrase), [passphrase]);
  const hasNumbers = useMemo(() => /\d/.test(passphrase), [passphrase]);
  const hasSymbol = useMemo(
    () => /[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(passphrase),
    [passphrase]
  );
  const hasValidPinLength = useMemo(
    () => pin.length >= PIN_MIN_LENGTH,
    [pin]
  );

  const hasInvalidInput = useMemo(
    () =>
      disabled ||
      !passphrase ||
      !pin ||
      !hasMinLengthPassphrase ||
      !hasLowercase ||
      !hasUppercase ||
      !hasNumbers ||
      !hasSymbol ||
      !hasValidPinLength,
    [
      passphrase,
      pin,
      disabled,
      hasMinLengthPassphrase,
      hasLowercase,
      hasUppercase,
      hasNumbers,
      hasSymbol,
      hasValidPinLength,
    ]
  );

  const unknownFact = useMemo(
    () => UNKNOWN_FACTS[Math.floor(progress / 20)],
    [progress]
  );

  useEffect(() => {
    const parseTokenAndSubmit = async () => {
      // get "secret" param from URL
      // prefer hash param (#wallet=...) for security, fall back to query param (?wallet=...) for backward compatibility
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const queryParams = new URLSearchParams(window.location.search);
      const secret = hashParams.get(WALLET_URL_PARAM) || queryParams.get(WALLET_URL_PARAM);

      if (!secret) {
        return;
      }

      // parse passphrase, PIN, network name from "secret" param
      const [pwd, pc, nn] = parseToken(secret);
      if (!pwd || !pc || !nn) {
        clearQueryParams();
        return;
      }
      const [network, chainId] = findNetworkByName(nn);
      if (!chainId) {
        console.error("Invalid network name");
        clearQueryParams();
        return;
      }

      // open wallet
      setDisabled(true);
      const hash = await generateHash(pwd, pc, (p) =>
        setProgress(Math.floor(p * 100))
      );
      setup(pwd, pc, hash, network, chainId);
      setDisabled(false);
    };

    parseTokenAndSubmit();
  }, []);

  const onSubmit = async () => {
    setDisabled(true);
    const hash = await generateHash(passphrase, pin, (p) =>
      setProgress(Math.floor(p * 100))
    );
    setup(passphrase, pin, hash);
    setDisabled(false);
  };

  const onKeyDown = (e) => {
    if (hasInvalidInput) {
      return;
    }

    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <>
      <Container>
        <LogoWrapper href="https://mybucks.online">
          <img src="/logo-48x48.png" alt="mybucks.online" />
          <LogoTitle>mybucks.online</LogoTitle>
        </LogoWrapper>

        <Box>
          <Title>Unlock your wallet</Title>
          <Caption>
            Enter your credentials to open or create a wallet
          </Caption>

          <div>
            <Label htmlFor="passphrase">Passphrase</Label>
            <PasswordInputWrapper>
              <Input
                id="passphrase"
                type={showPassphrase ? "text" : "password"}
                placeholder="My-1st-car-was-a-red-Ford-2005!"
                disabled={disabled}
                value={passphrase}
                maxLength={PASSPHRASE_MAX_LENGTH}
                onChange={(e) => setPassphrase(e.target.value)}
                onKeyDown={onKeyDown}
                onPaste={(e) => e.preventDefault()}
                onFocus={() => setPassphraseFocused(true)}
                onBlur={() => setPassphraseFocused(false)}
              />
              <ToggleButton
                type="button"
                disabled={disabled}
                onClick={() => setShowPassphrase(!showPassphrase)}
                aria-label={showPassphrase ? "Hide passphrase" : "Show passphrase"}
              >
                <PasswordToggleIcon
                  show={showPassphrase}
                  focused={passphraseFocused}
                />
              </ToggleButton>
            </PasswordInputWrapper>
          </div>

          <div>
            <Label htmlFor="pin">PIN</Label>
            <PasswordInputWrapper>
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                placeholder="202875"
                disabled={disabled}
                value={pin}
                maxLength={PIN_MAX_LENGTH}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={onKeyDown}
                onPaste={(e) => e.preventDefault()}
                autoComplete="off"
                onFocus={() => setPinFocused(true)}
                onBlur={() => setPinFocused(false)}
              />
              <ToggleButton
                type="button"
                disabled={disabled}
                onClick={() => setShowPin(!showPin)}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
              >
                <PasswordToggleIcon
                  show={showPin}
                  focused={pinFocused}
                />
              </ToggleButton>
            </PasswordInputWrapper>
          </div>

          <Checkboxes>
            <Checkbox id="uppercase" value={hasUppercase}>
              Uppercase
            </Checkbox>
            <Checkbox id="lowercase" value={hasLowercase}>
              Lowercase
            </Checkbox>
            <Checkbox id="number" value={hasNumbers}>
              Number
            </Checkbox>
            <Checkbox id="special" value={hasSymbol}>
              Symbol
            </Checkbox>
            <Checkbox id="min-length" value={hasMinLengthPassphrase}>
              Passphrase length: {PASSPHRASE_MIN_LENGTH}~{PASSPHRASE_MAX_LENGTH}
            </Checkbox>
            <Checkbox id="pin-length" value={hasValidPinLength}>
              PIN length: {PIN_MIN_LENGTH}~{PIN_MAX_LENGTH}
            </Checkbox>

          </Checkboxes>

          <Button onClick={onSubmit} disabled={hasInvalidInput} $size="block">
            Open
          </Button>
        </Box>
      </Container>

      <Modal show={!!progress} width="20rem">
        <ProgressWrapper>
          <GreetingIcon src={Logo} alt="Hi" loading="lazy" />
          <Notice>{unknownFact}</Notice>
          <Progress value={progress} max="100" />
        </ProgressWrapper>
      </Modal>
    </>
  );
};

export default SignIn;
