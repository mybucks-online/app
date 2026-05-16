import styled from "styled-components";

import { SuccessIcon } from "@mybucks/assets/icons";
import { Container, Stack } from "@mybucks/components/Containers";
import Link from "@mybucks/components/Link";
import { BackButton } from "@mybucks/components/NavButtons";
import { H3 } from "@mybucks/components/Texts";
import { truncate } from "@mybucks/lib/utils";

const NavsWrapper = styled.div`
  width: 100%;
  display: flex;
  margin-bottom: ${({ theme }) => theme.sizes.xl};
`;

const Title = styled(H3)`
  margin-bottom: ${({ theme }) => theme.sizes.xs};
`;

const Notice = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 140%;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: ${({ theme }) => theme.sizes.x2l};
`;

const Hash = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.sizes.base};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 140%;
  margin: ${({ theme }) => theme.sizes.x2l} 0;
`;

const MinedTransaction = ({ txnHash, txnLink, back }) => (
  <Container>
    <NavsWrapper>
      <BackButton onClick={back} />
    </NavsWrapper>

    <Stack>
      <Title>Transaction mined!</Title>
      <Notice>
        It may take a few minutes to update the balance and activity.
      </Notice>
      <img src={SuccessIcon} />
      <Hash>Hash: {truncate(txnHash)}</Hash>
      <Link href={txnLink} target="_blank">
        View on explorer
      </Link>
    </Stack>
  </Container>
);

export default MinedTransaction;
