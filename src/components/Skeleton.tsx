import styled, { keyframes } from "styled-components";

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.16; }
`;

type SkeletonProps = {
  $width?: string;
  $height?: string;
};

const Skeleton = styled.span<SkeletonProps>`
  display: inline-block;
  width: ${({ $width }) => $width || "3rem"};
  height: ${({ $height }) => $height || "1em"};
  border-radius: ${({ theme }) => theme.radius.sm};
  vertical-align: middle;
  background-color: ${({ theme }) => theme.colors.textMuted};
  animation: ${pulse} 1.4s ease-in-out infinite;
`;

export default Skeleton;
