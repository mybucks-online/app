import { useContext, useEffect, useMemo, useState } from "react";
import {
  generateHash,
  parseToken,
  PASSPHRASE_MAX_LENGTH,
  PASSPHRASE_MIN_LENGTH,
  PASSPHRASE_MIN_ZXCVBN_SCORE,
  PIN_MAX_LENGTH,
  PIN_MIN_LENGTH,
  PIN_MIN_ZXCVBN_SCORE,
} from "@mybucks.online/core";
import styled from "styled-components";
import zxcvbn from "zxcvbn";

import Button from "@mybucks/components/Button";
import { Box } from "@mybucks/components/Containers";
import Input from "@mybucks/components/Input";
import { Label } from "@mybucks/components/Label";
import Link from "@mybucks/components/Link";
import Modal from "@mybucks/components/Modal";
import PasswordToggleIcon from "@mybucks/components/PasswordToggleIcon";
import Progress from "@mybucks/components/Progress";
import StrengthMeter from "@mybucks/components/StrengthMeter";
import { StoreContext } from "@mybucks/contexts/Store";
import {
  findNetworkByName,
  TEST_PASSPHRASE,
  TEST_PIN,
  UNKNOWN_FACTS,
  WALLET_URL_PARAM,
} from "@mybucks/lib/conf";
import { clearQueryParams } from "@mybucks/lib/utils";
import media from "@mybucks/styles/media";

import Logo from "./logo.png";

const Container = styled.div`
  max-width: 40.5rem;
  margin: 0 auto;
  margin-block: ${({ theme }) => `${theme.sizes.x5l} ${theme.sizes.x2l}`};

  @media (max-width: 696px) {
    margin: 0 ${({ theme }) => theme.sizes.xl};
    margin-block: ${({ theme }) => `${theme.sizes.x5l} ${theme.sizes.x2l}`};
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

const CompactInput = styled(Input)`
  margin-bottom: ${({ theme }) => theme.sizes.x3s};
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

const LegacyWalletCheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.xs};
  margin-bottom: ${({ theme }) => theme.sizes.base};

  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    accent-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }

  label {
    font-size: ${({ theme }) => theme.sizes.xs};
    font-weight: ${({ theme }) => theme.weights.regular};
    color: ${({ theme }) => theme.colors.gray200};
    cursor: pointer;
    user-select: none;
  }

  a {
    font-size: inherit;
  }
`;

const TermsNotice = styled.p`
  text-align: left;
  font-size: ${({ theme }) => theme.sizes.xs};
  font-weight: ${({ theme }) => theme.weights.regular};
  color: ${({ theme }) => theme.colors.gray200};
  margin-bottom: ${({ theme }) => theme.sizes.xl};

  a {
    font-size: inherit;
  }
`;

const CommitHash = styled.span`
  display: none;
`;

const SecurityHint = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.sizes.xs};
  font-weight: ${({ theme }) => theme.weights.regular};
  color: ${({ theme }) => theme.colors.gray200};
  margin-top: ${({ theme }) => theme.sizes.xl};

  a {
    font-size: inherit;
  }
`;

const SignIn = () => {
  const { setup } = useContext(StoreContext);

  const [passphrase, setPassphrase] = useState(
    import.meta.env.DEV ? TEST_PASSPHRASE : "",
  );
  const [pin, setPin] = useState(import.meta.env.DEV ? TEST_PIN : "");
  const [disabled, setDisabled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [passphraseFocused, setPassphraseFocused] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);
  const [legacySelected, setLegacySelected] = useState(false);

  const passphraseStrength = useMemo(() => {
    if (!passphrase) return 0;
    const { score } = zxcvbn(passphrase);
    if (passphrase.length < PASSPHRASE_MIN_LENGTH) {
      return Math.min(score, PASSPHRASE_MIN_ZXCVBN_SCORE - 1);
    }
    return score;
  }, [passphrase]);

  const pinStrength = useMemo(() => {
    if (!pin || pin.length < PIN_MIN_LENGTH) return 0;
    const { score } = zxcvbn(pin);
    return score < 2 ? score : 2;
  }, [pin]);

  const hasInvalidInput = useMemo(
    () =>
      disabled ||
      !passphrase ||
      !pin ||
      passphraseStrength < PASSPHRASE_MIN_ZXCVBN_SCORE ||
      pinStrength < PIN_MIN_ZXCVBN_SCORE,
    [passphrase, pin, disabled, passphraseStrength, pinStrength],
  );

  const unknownFact = useMemo(
    () => UNKNOWN_FACTS[Math.floor(progress / 20)],
    [progress],
  );

  useEffect(() => {
    const parseTokenAndSubmit = async () => {
      // get "secret" param from URL hash (#wallet=...)
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const secret = hashParams.get(WALLET_URL_PARAM);
      if (!secret) {
        return;
      }

      // parse passphrase, PIN, network name from "secret" param
      const [pphrase, pn, nn, lgcy] = parseToken(secret);
      // clear URL params immediately so the secret is not left in the address bar
      clearQueryParams();

      if (!pphrase || !pn || !nn) {
        return;
      }
      const [network, chainId] = findNetworkByName(nn);
      if (!chainId) {
        console.error("Invalid network name");
        return;
      }

      // open wallet
      setDisabled(true);
      setLegacySelected(lgcy);
      const hash = await generateHash(
        pphrase,
        pn,
        (p) => setProgress(Math.floor(p * 100)),
        lgcy,
      );
      setup(pphrase, pn, lgcy, hash, network, chainId);
      setDisabled(false);
    };

    parseTokenAndSubmit();
  }, []);

  const onSubmit = async () => {
    setDisabled(true);
    const hash = await generateHash(
      passphrase,
      pin,
      (p) => setProgress(Math.floor(p * 100)),
      legacySelected,
    );
    setup(passphrase, pin, legacySelected, hash);
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
        <Box>
          <LogoWrapper href="https://mybucks.online">
            <img src="/logo-48x48.png" alt="mybucks.online" />
            <LogoTitle>mybucks.online</LogoTitle>
          </LogoWrapper>

          <div>
            <Label htmlFor="passphrase">Passphrase</Label>
            <PasswordInputWrapper>
              <CompactInput
                id="passphrase"
                type={showPassphrase ? "text" : "password"}
                placeholder="e.g. My-1st-car-was-a-red-Ford-2005!"
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
                aria-label={
                  showPassphrase ? "Hide passphrase" : "Show passphrase"
                }
              >
                <PasswordToggleIcon
                  show={showPassphrase}
                  focused={passphraseFocused}
                />
              </ToggleButton>
            </PasswordInputWrapper>
            <StrengthMeter level={passphraseStrength} maxLevel={4} />
          </div>

          <div>
            <Label htmlFor="pin">PIN</Label>
            <PasswordInputWrapper>
              <CompactInput
                id="pin"
                type={showPin ? "text" : "password"}
                placeholder="e.g. 202w875"
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
                <PasswordToggleIcon show={showPin} focused={pinFocused} />
              </ToggleButton>
            </PasswordInputWrapper>
            <StrengthMeter level={pinStrength} maxLevel={2} />
          </div>

          <LegacyWalletCheckboxWrapper>
            <input
              type="checkbox"
              id="legacy-wallet"
              checked={legacySelected}
              onChange={(e) => setLegacySelected(e.target.checked)}
              disabled={disabled}
            />
            <label htmlFor="legacy-wallet">
              This wallet was created before March 2026.{" "}
              <Link
                href="https://docs.mybucks.online/concept/march-2026-security-update"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Learn more
              </Link>
            </label>
          </LegacyWalletCheckboxWrapper>

          <TermsNotice>
            By clicking Open, you agree to our{" "}
            <Link
              href="https://docs.mybucks.online/more/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Use
            </Link>
            .
          </TermsNotice>

          <Button onClick={onSubmit} disabled={hasInvalidInput} $size="block">
            Open
          </Button>

          <SecurityHint>
            To stay safe, review our{" "}
            <Link
              href="https://docs.mybucks.online/user-guide/security-notice"
              target="_blank"
              rel="noopener noreferrer"
            >
              security notice
            </Link>
            .
          </SecurityHint>
        </Box>
      </Container>

      {import.meta.env.VITE_COMMIT_HASH && (
        <CommitHash data-commit={import.meta.env.VITE_COMMIT_HASH} />
      )}

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
