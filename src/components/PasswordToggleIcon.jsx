import styled from "styled-components";

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  path {
    stroke: ${({ theme, $focused }) => $focused ? theme.colors.primary : theme.colors.gray400};
    transition: stroke 0.2s ease;
  }
`;

const PasswordToggleIcon = ({ show, focused = false, ...props }) => {
  return (
    <IconWrapper $focused={focused} {...props}>
      {show ? (
        // Hide icon (eye with slash)
        <svg 
          aria-hidden="true" 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          fill="none"
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2"
            d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" 
          />
        </svg>
      ) : (
        // Show icon (eye)
        <svg 
          aria-hidden="true" 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeWidth="2" 
            d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" 
          />
          <path 
            strokeWidth="2" 
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" 
          />
        </svg>
      )}
    </IconWrapper>
  );
};

export default PasswordToggleIcon;
