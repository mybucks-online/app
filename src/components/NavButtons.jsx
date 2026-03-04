import styled from "styled-components";

import { BackIcon, RefreshIcon } from "@mybucks/assets/icons";

import Button from "./Button";

const StyledBackButton = styled(Button).attrs({ $size: "small" })`
  display: flex;
  padding: 0.375rem 0.5rem;
`;

const StyledRefreshButton = styled(Button).attrs({ $size: "small" })`
  display: flex;
  padding: 0.625rem 0.75rem;

  img {
    width: 1rem;
    height: 1rem;
  }
`;

export function BackButton(props) {
  return (
    <StyledBackButton aria-label="Back" {...props}>
      <img src={BackIcon} alt="" />
    </StyledBackButton>
  );
}

export function RefreshButton(props) {
  return (
    <StyledRefreshButton aria-label="Refresh" {...props}>
      <img src={RefreshIcon} alt="" />
    </StyledRefreshButton>
  );
}
