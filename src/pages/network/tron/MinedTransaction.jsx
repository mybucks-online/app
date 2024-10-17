import styled from "styled-components";

import BackIcon from "@mybucks/assets/icons/back.svg";
import SuccessIcon from "@mybucks/assets/icons/success.svg";
import { Box as BaseBox, Container } from "@mybucks/components/Containers";
import Link from "@mybucks/components/Link";
import { H3 } from "@mybucks/components/Texts";
import { truncate } from "@mybucks/lib/utils";

const NavsWrapper = styled.div`
  width: 100%;
  display: flex;
  margin-bottom: ${({ theme }) => theme.sizes.xl};
`;

const Box = styled(BaseBox)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled(H3)`
  margin-bottom: ${({ theme }) => theme.sizes.xs};
`;

const Notice = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 140%;
  color: ${({ theme }) => theme.colors.gray200};
  margin-bottom: ${({ theme }) => theme.sizes.x2l};
`;

const Hash = styled.p`
  color: ${({ theme }) => theme.colors.gray200};
  font-size: ${({ theme }) => theme.sizes.base};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 140%;
  margin: ${({ theme }) => theme.sizes.x2l} 0;
`;

const MinedTransaction = ({ txnHash, txnLink, back }) => (
  <Container>
    <NavsWrapper>
      <button onClick={back}>
        <img src={BackIcon} />
      </button>
    </NavsWrapper>

    <Box>
      <Title>Transaction mined!</Title>
      <Notice>
        It may take a few minutes to update the balance and activity.
      </Notice>
      <img src={SuccessIcon} />
      <Hash>Hash: {truncate(txnHash)}</Hash>
      <Link href={txnLink} target="_blank">
        View on explorer
      </Link>
    </Box>
  </Container>
);

export default MinedTransaction;
