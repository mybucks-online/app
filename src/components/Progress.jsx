import styled from "styled-components";

const Progress = styled.progress`
  display: block;
  width: 100%;
  border: none;
  height: 5px;
  border-radius: 2.5px;

  &::-webkit-progress-bar {
    border: none;
    height: 6px;
    border-radius: 3px;
    background-color: ${({ theme }) => theme.colors.gray100};
  }
  &::-webkit-progress-value {
    border: none;
    height: 6px;
    border-radius: 3px;
    background-color: ${({ theme }) => theme.colors.gray400};
  }
`;

export default Progress;
