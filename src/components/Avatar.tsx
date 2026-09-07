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
  color: ${({ theme }) => theme.colors.textInverse};
  width: 51px;
  height: 51px;
  border-radius: 50%;
  font-size: ${({ theme }) => theme.sizes.x2l};
`;

interface AvatarProps {
  uri?: string;
  symbol: string;
  fallbackColor?: string;
}

const Avatar = ({ uri, symbol, fallbackColor }: AvatarProps) =>
  uri ? (
    <Logo src={uri} alt={symbol} />
  ) : (
    <LetterWrap style={{ backgroundColor: fallbackColor }}>
      {symbol[0].toUpperCase()}
    </LetterWrap>
  );

export default Avatar;
