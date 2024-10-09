import React, { useContext, useState, useMemo } from "react";
import { Buffer } from "buffer";
import { scrypt } from "scrypt-js";
import styled from "styled-components";
import {
  HASH_OPTIONS,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSCODE_MIN_LENGTH,
  PASSCODE_MAX_LENGTH,
  generateSalt,
} from "@mybucks/lib/conf";
import { StoreContext } from "@mybucks/contexts/Store";
import { Box } from "@mybucks/components/Containers";
import Button from "@mybucks/components/Button";
import Input from "@mybucks/components/Input";
import Checkbox from "@mybucks/components/Checkbox";
import Progress from "@mybucks/components/Progress";
import { Label } from "@mybucks/components/Label";
import { H1 } from "@mybucks/components/Texts";
import Modal from "@mybucks/components/Modal";
import media from "@mybucks/styles/media";

/*
const TEST_PASSWORD = "randommPassword82^";
const TEST_PASSCODE = "223356";
*/

const TEST_PASSWORD = "TexamplePassword34%";
const TEST_PASSCODE = "22346b";


const Container = styled.div`
  max-width: 40.5rem;
  margin: 0 auto;
  margin-block: 3rem 6.75rem;

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

const CheckboxesWrapper = styled.div`
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
  padding: ${({ theme }) => theme.sizes.base};

  progress {
    max-width: 16rem;
  }
`;

const Notice = styled.p`
  text-align: center;
  max-width: 16rem;
  color: ${({ theme }) => theme.colors.gray200};
`;

const SignIn = () => {
  const { setup } = useContext(StoreContext);

  const [password, setPassword] = useState(
    import.meta.env.DEV ? TEST_PASSWORD : ""
  );
  const [passwordConfirm, setPasswordConfirm] = useState(
    import.meta.env.DEV ? TEST_PASSWORD : ""
  );
  const [passcode, setPasscode] = useState(
    import.meta.env.DEV ? TEST_PASSCODE : ""
  );
  const [disabled, setDisabled] = useState(false);
  const [progress, setProgress] = useState(0);

  const salt = useMemo(
    () => generateSalt(password, passcode),
    [password, passcode]
  );
  const hasMinLength = useMemo(
    () => password.length >= PASSWORD_MIN_LENGTH,
    [password]
  );
  const hasLowercase = useMemo(() => /[a-z]/.test(password), [password]);
  const hasUppercase = useMemo(() => /[A-Z]/.test(password), [password]);
  const hasNumbers = useMemo(() => /\d/.test(password), [password]);
  const hasSpecialChars = useMemo(
    () => /[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password),
    [password]
  );
  const hasMatchedPassword = useMemo(
    () => password && password === passwordConfirm,
    [password, passwordConfirm]
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
      !hasMinLength ||
      !hasLowercase ||
      !hasUppercase ||
      !hasNumbers ||
      !hasSpecialChars ||
      !hasMatchedPassword ||
      !hasValidPasscodeLength,
    [[password, passwordConfirm, passcode, disabled]]
  );

  const onSubmit = async () => {
    setDisabled(true);
    try {
      const passwordBuffer = Buffer.from(password);
      const saltBuffer = Buffer.from(salt);
      const hashBuffer = await scrypt(
        passwordBuffer,
        saltBuffer,
        HASH_OPTIONS.N,
        HASH_OPTIONS.r,
        HASH_OPTIONS.p,
        HASH_OPTIONS.keyLen,
        (p) => setProgress(Math.floor(p * 100))
      );
      const hashHex = Buffer.from(hashBuffer).toString("hex");
      setup(password, passcode, salt, hashHex);
    } catch (e) {
      console.error("Error while setting up account ...");
    } finally {
      setDisabled(false);
    }
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
          <Title>Open your account</Title>
          <Caption>Keep your password strong and secure</Caption>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              disabled={disabled}
              value={password}
              maxLength={PASSWORD_MAX_LENGTH}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onKeyDown}
              onPaste={(e) => e.preventDefault()}
            />
          </div>

          <div>
            <Label htmlFor="password-confirm">Confirm Password</Label>
            <Input
              id="password-confirm"
              type="password"
              placeholder="Confirm password"
              disabled={disabled}
              value={passwordConfirm}
              maxLength={PASSWORD_MAX_LENGTH}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              onKeyDown={onKeyDown}
              onPaste={(e) => e.preventDefault()}
            />
          </div>

          <div>
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              type="text"
              placeholder="Passcode"
              disabled={disabled}
              value={passcode}
              maxLength={PASSCODE_MAX_LENGTH}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>

          <CheckboxesWrapper>
            <Checkbox id="min-length" value={hasMinLength}>
              Password length: {PASSWORD_MIN_LENGTH}~{PASSWORD_MAX_LENGTH}
            </Checkbox>
            <Checkbox id="uppercase" value={hasUppercase}>
              Uppercase
            </Checkbox>
            <Checkbox id="lowercase" value={hasLowercase}>
              Lowercase
            </Checkbox>
            <Checkbox id="number" value={hasNumbers}>
              Number
            </Checkbox>
            <Checkbox id="special" value={hasSpecialChars}>
              Symbol
            </Checkbox>
            <Checkbox id="match-password" value={hasMatchedPassword}>
              Match password
            </Checkbox>
            <Checkbox id="passcode-length" value={hasValidPasscodeLength}>
              Passcode length: {PASSCODE_MIN_LENGTH}~{PASSCODE_MAX_LENGTH}
            </Checkbox>
          </CheckboxesWrapper>

          <Button onClick={onSubmit} disabled={hasInvalidInput} $size="block">
            Open
          </Button>
        </Box>
      </Container>

      <Modal show={!!progress} width="20rem">
        <ProgressWrapper>
          <img src="/logo-72x72.png" alt="mybucks.online" />
          <Notice>Hang on, it takes millions of years to brute force!</Notice>
          <Progress value={progress} max="100" />
        </ProgressWrapper>
      </Modal>
    </>
  );
};

export default SignIn;
