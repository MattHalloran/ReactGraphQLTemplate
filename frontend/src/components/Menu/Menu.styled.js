import styled from 'styled-components';

export const StyledMenu = styled.nav`
  display: flex;
  flex-direction: column;
  transform: ${({ open }) => open ? 'translateX(-100%)' : 'translateX(0%)'};
  justify-content: center;
  background: ${({ theme }) => theme.bodySecondary};
  height: 100vh;
  text-align: left;
  padding: 2rem;
  position: absolute;
  top: 0;
  left: 100%;
  transition: transform 0.3s ease-in-out;
  
  @media (max-width: ${({ theme }) => theme.mobile}) {
    width: 100%;
  }

  /* Secondary link settings */
  a:link {
      color: ${({ theme }) => theme.textSecondary};
  }
  a:visited {
      color: ${({ theme }) => theme.textSecondary};
  }
  a:hover {
      color: ${({ theme }) => theme.textSecondary};
  }

  a {
    font-size: 2rem;
    text-transform: uppercase;
    padding: 2rem 0;
    font-weight: bold;
    letter-spacing: 0.5rem;
    width: max-content;
    
    @media (max-width: ${({ theme }) => theme.mobile}) {
      font-size: 1.5rem;
      text-align: center;
    }

    &:hover {
      color: ${({ theme }) => theme.hoverPrimary};
    }
  }
`;