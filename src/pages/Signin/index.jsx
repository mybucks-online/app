import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { generateHash, parseToken } from "@mybucks.online/core";
import styled from "styled-components";

import Button from "@mybucks/components/Button";
import Checkbox from "@mybucks/components/Checkbox";
import { Box } from "@mybucks/components/Containers";
import Input from "@mybucks/components/Input";
import { Label } from "@mybucks/components/Label";
import Link from "@mybucks/components/Link";
import Modal from "@mybucks/components/Modal";
import PasswordToggleIcon from "@mybucks/components/PasswordToggleIcon";
import Progress from "@mybucks/components/Progress";
import { H1 } from "@mybucks/components/Texts";
import { StoreContext } from "@mybucks/contexts/Store";
import {
  findNetworkByName,
  PASSCODE_MAX_LENGTH,
  PASSCODE_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  TEST_PASSCODE,
  TEST_PASSWORD,
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
  margin: 1rem 0;
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

const TrustpilotWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${({ theme }) => theme.sizes.x2l};
`;

const TermsCheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.sizes.xs};
  margin-bottom: ${({ theme }) => theme.sizes.xl};
  margin-top: ${({ theme }) => theme.sizes.base};
`;

const TermsCheckboxInput = styled.input.attrs({
  type: "checkbox",
})`
  margin-top: 0.25rem;
  cursor: pointer;
  flex-shrink: 0;
`;

const TermsCheckboxLabel = styled.label`
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 140%;
  color: ${({ theme }) => theme.colors.gray400};
  user-select: none;
  cursor: pointer;

  a {
    font-size: inherit;
  }
`;

const SignIn = () => {
  const { setup } = useContext(StoreContext);
  const trustpilotWidgetRef = useRef(null);

  const [password, setPassword] = useState(
    import.meta.env.DEV ? TEST_PASSWORD : ""
  );
  const [passcode, setPasscode] = useState(
    import.meta.env.DEV ? TEST_PASSCODE : ""
  );
  const [disabled, setDisabled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passcodeFocused, setPasscodeFocused] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const hasMinLengthPassword = useMemo(
    () => password.length >= PASSWORD_MIN_LENGTH,
    [password]
  );
  const hasLowercase = useMemo(() => /[a-z]/.test(password), [password]);
  const hasUppercase = useMemo(() => /[A-Z]/.test(password), [password]);
  const hasNumbers = useMemo(() => /\d/.test(password), [password]);
  const hasSymbol = useMemo(
    () => /[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password),
    [password]
  );
  const hasValidPasscodeLength = useMemo(
    () => passcode.length >= PASSCODE_MIN_LENGTH,
    [passcode]
  );

  const hasInvalidInput = useMemo(
    () =>
      disabled ||
      !password ||
      !passcode ||
      !hasMinLengthPassword ||
      !hasLowercase ||
      !hasUppercase ||
      !hasNumbers ||
      !hasSymbol ||
      !hasValidPasscodeLength ||
      !agreedToTerms,
    [password, passcode, disabled, hasMinLengthPassword, hasLowercase, hasUppercase, hasNumbers, hasSymbol, hasValidPasscodeLength, agreedToTerms]
  );

  const unknownFact = useMemo(
    () => UNKNOWN_FACTS[Math.floor(progress / 20)],
    [progress]
  );

  useEffect(() => {
    const parseTokenAndSubmit = async () => {
      // get "secret" param from URL
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const secret = params.get(WALLET_URL_PARAM);
      if (!secret) {
        return;
      }

      // parse password, passcode, network name from "secret" param
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

  useEffect(() => {
    // Re-initialize Trustpilot widget when component mounts
    const initTrustpilot = () => {
      if (window.Trustpilot && trustpilotWidgetRef.current) {
        window.Trustpilot.loadFromElement(trustpilotWidgetRef.current, true);
      }
    };

    const timeoutId = setTimeout(initTrustpilot, 200);

    return () => clearTimeout(timeoutId);
  }, []);

  const onSubmit = async () => {
    setDisabled(true);
    const hash = await generateHash(password, passcode, (p) =>
      setProgress(Math.floor(p * 100))
    );
    setup(password, passcode, hash);
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
            Log in using existing credentials, or create a new wallet with new
            credentials
          </Caption>

          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInputWrapper>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                disabled={disabled}
                value={password}
                maxLength={PASSWORD_MAX_LENGTH}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKeyDown}
                onPaste={(e) => e.preventDefault()}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <ToggleButton
                type="button"
                disabled={disabled}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <PasswordToggleIcon show={showPassword} focused={passwordFocused} />
              </ToggleButton>
            </PasswordInputWrapper>
          </div>

          <div>
            <Label htmlFor="passcode">Passcode</Label>
            <PasswordInputWrapper>
              <Input
                id="passcode"
                type={showPasscode ? "text" : "password"}
                placeholder="Passcode"
                disabled={disabled}
                value={passcode}
                maxLength={PASSCODE_MAX_LENGTH}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyDown={onKeyDown}
                onPaste={(e) => e.preventDefault()}
                autoComplete="off"
                onFocus={() => setPasscodeFocused(true)}
                onBlur={() => setPasscodeFocused(false)}
              />
              <ToggleButton
                type="button"
                disabled={disabled}
                onClick={() => setShowPasscode(!showPasscode)}
                aria-label={showPasscode ? "Hide passcode" : "Show passcode"}
              >
                <PasswordToggleIcon show={showPasscode} focused={passcodeFocused} />
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
            <Checkbox id="min-length" value={hasMinLengthPassword}>
              Password length: {PASSWORD_MIN_LENGTH}~{PASSWORD_MAX_LENGTH}
            </Checkbox>
            <Checkbox id="passcode-length" value={hasValidPasscodeLength}>
              Passcode length: {PASSCODE_MIN_LENGTH}~{PASSCODE_MAX_LENGTH}
            </Checkbox>
          </Checkboxes>

          <TermsCheckboxWrapper>
            <TermsCheckboxInput
              id="terms-checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={disabled}
            />
            <TermsCheckboxLabel htmlFor="terms-checkbox">
              I agree to the{" "}
              <Link
                href="https://docs.mybucks.online/more/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Use
              </Link>
            </TermsCheckboxLabel>
          </TermsCheckboxWrapper>

          <Button onClick={onSubmit} disabled={hasInvalidInput} $size="block">
            Open
          </Button>
        </Box>

        {/* TrustBox widget - Review Collector */}
        <TrustpilotWrapper>
          <div
            ref={trustpilotWidgetRef}
            className="trustpilot-widget"
            data-locale="en-US"
            data-template-id="56278e9abfbbba0bdcd568bc"
            data-businessunit-id="69436ea5ae5298305b4ff616"
            data-style-height="52px"
            data-style-width="100%"
            data-token="0df0687a-a683-4773-93b7-a89297053c53"
          >
            <a
              href="https://www.trustpilot.com/review/mybucks.online"
              target="_blank"
              rel="noopener"
            >
              Trustpilot
            </a>
          </div>
        </TrustpilotWrapper>
        {/* End TrustBox widget */}
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
