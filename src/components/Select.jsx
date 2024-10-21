import styled from "styled-components";

import media from "@mybucks/styles/media";

const SelectWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 8rem;

  ${media.sm`
      width: 7.5rem;
    `}

  &::before, &::after {
    --size: 0.3rem;
    position: absolute;
    pointer-events: none;
    right: ${({ theme }) => theme.sizes.base};
    content: "";
  }

  &::before {
    border-left: var(--size) solid transparent;
    border-right: var(--size) solid transparent;
    border-bottom: var(--size) solid black;
    top: 40%;
  }

  &::after {
    border-left: var(--size) solid transparent;
    border-right: var(--size) solid transparent;
    border-top: var(--size) solid black;
    top: 55%;
  }
`;

const SelectComponent = styled.select`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;

  background-color: ${({ theme }) => theme.colors.gray25};
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  outline: none;
  border-radius: ${({ theme }) => theme.radius.base};
  padding: ${({ theme }) => `${theme.sizes.x3s} ${theme.sizes.base}`};
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: ${({ theme }) => theme.weights.highlight};
  line-height: 130%;
  cursor: pointer;

  &:focus,
  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = (props) => (
  <SelectWrapper>
    <SelectComponent {...props} />
  </SelectWrapper>
);

export default Select;
