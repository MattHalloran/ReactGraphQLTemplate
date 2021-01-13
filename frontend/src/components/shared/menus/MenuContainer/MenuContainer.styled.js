import styled from 'styled-components';
// transform: ${({ open }) => open ? 'translateX(-100%)' : 'translateX(0%)' };
// padding: 1rem 0.5rem 0.5rem 1rem;
export const StyledMenuContainer = styled.nav`
  transform: ${({ open }) => open ? 'translateX(0%)' : 'translateX(100%)' };
  display: grid;
  flex-direction: column;
  justify-content: center;
  background: ${({ theme }) => theme.bodySecondary};
  height: 100vh;
  padding-top: 12vh;
  text-align: center;
  overflow: scroll;
  width: 400px;
  position: fixed;
  top: 0;
  right: 0;
  transition: transform 0.3s ease-in-out;

  @media (max-width: ${({ theme }) => theme.mobile}) {
    width: -webkit-fill-available;
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
    padding: 0.5rem;
    margin-bottom: 15px;
    font-weight: bold;
    letter-spacing: 0.1rem;
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