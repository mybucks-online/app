import { useEffect, useRef } from "react";
import FocusTrap from "focus-trap-react";
import styled from "styled-components";

import CloseIcon from "@mybucks/assets/icons/close.svg";
import useOnClickOutside from "@mybucks/hooks/useOnClickOutside";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: #eeec;
  transition: background-color ease 0.3s;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.gray25};
  border-radius: ${({ theme }) => theme.radius.lg};
  max-width: ${({ theme }) => theme.sizes.x9l};
  width: ${({ $width }) => $width || "60%"};
  max-height: 100vh;
  overflow-y: auto;
  position: relative;
  top: -10rem;
`;

export const CloseButton = styled.img`
  top: 1rem;
  right: 1rem;
  position: absolute;
`;

const Modal = ({
  children,
  className,
  show,
  close,
  showCloseIcon = false,
  focusTrap = false,
  width,
}) => {
  const modalNode = useRef(null);
  useOnClickOutside(modalNode, close);

  useEffect(() => {
    if (show) {
      document.querySelector("body")?.classList.add("scroll-lock");
    } else {
      document.querySelector("body")?.classList.remove("scroll-lock");
    }

    return () =>
      document.querySelector("body")?.classList.remove("scroll-lock");
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <FocusTrap active={focusTrap}>
      <Overlay>
        <Container $width={width} className={className} ref={modalNode}>
          {showCloseIcon && <CloseButton src={CloseIcon} alt="close" />}
          {children}
        </Container>
      </Overlay>
    </FocusTrap>
  );
};

export default Modal;
