import styled from "styled-components";

const Logo = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
`;

const LetterWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colors.gray25};
  width: 51px;
  height: 51px;
  border-radius: 50%;
  font-size: ${({ theme }) => theme.sizes.x2l};
`;

const Avatar = ({ uri, symbol, fallbackColor }) =>
  uri ? (
    <Logo src={uri} alt={symbol} />
  ) : (
    <LetterWrap style={{ backgroundColor: fallbackColor }}>
      {symbol[0].toUpperCase()}
    </LetterWrap>
  );

export default Avatar;
