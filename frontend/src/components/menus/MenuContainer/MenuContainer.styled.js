import styled from 'styled-components';

const getTranslate = (open, side) => {
  if (open) {
    return 'translateX(0%)';
  } else {
    return side === 'right' ? 'translateX(100%)' : 'translateX(-100%)';
  }
} 

const getSideStyle = (side) => {
  if (side === 'right') {
    return `
      right: 0;
      border-left: 2px solid black;
    `
  } else {
    return `
      left: 0;
      border-right: 2px solid black;
    `
  }
}

// transform: ${({ open }) => open ? 'translateX(-100%)' : 'translateX(0%)' };
// padding: 1rem 0.5rem 0.5rem 1rem;
export const StyledMenuContainer = styled.nav`
  transform: ${({ open, side }) => getTranslate(open, side)};
  display: block;
  flex-direction: column;
  justify-content: center;
  background: ${({ theme }) => theme.primaryColor};
  color: ${({ theme }) => theme.headerText};
  height: 100vh;
  text-align: center;
  overflow: scroll;
  overflow-x: hidden;
  width: 400px;
  position: fixed;
  top: 0;
  ${({ side }) => getSideStyle(side)};
  z-index: 100 !important;
  transition: transform 0.3s ease-in-out;

  @media (max-width: ${({ theme }) => theme.mobile}) {
    width: 100%;
    width: -webkit-fill-available;
  }

  a {
    padding: 0.5rem;
    margin-bottom: 15px;
    letter-spacing: 0.1rem;
    width: max-content;
    
    @media (max-width: ${({ theme }) => theme.mobile}) {
      font-size: 1.5rem;
      text-align: center;
    }

    &:hover {
      color: ${({ theme }) => theme.secondaryText};
    }
  }
`;