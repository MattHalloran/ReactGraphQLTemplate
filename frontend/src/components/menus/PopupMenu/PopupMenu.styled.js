import styled from 'styled-components';

export const StyledPopupMenu = styled.div`
   .popup-menu-container {
        position: absolute;
        display: grid;
        border: 2px solid ${({ theme }) => theme.textPrimary};
        background-color: ${({ theme }) => theme.bodySecondary};
        border-radius: 0 0 5px 5px;
        padding: 2px;
   }

   li:hover {
        box-shadow: inset 0 0 100px 100px rgba(255, 255, 255, 0.1);
   }
`;