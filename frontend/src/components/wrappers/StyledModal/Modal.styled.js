import styled from 'styled-components';

export const StyledModal = styled.aside`

    ._modal-close:hover {
        background: #F64740
    }
    
    ._modal-close-icon {
    width: 25px;
    height: 25px;
    fill: transparent;
    stroke: ${({ theme }) => theme.headerText};
    stroke-linecap: round;
    stroke-width: 3;
    }

    @media (max-width: ${({ theme }) => theme.mobile}) {
        .modal-body {
            padding: 0px;
            width: 100%;
            width: -moz-available;
            width: -webkit-fill-available;
            height: 100%;
            height: -moz-available;
            height: -webkit-fill-available;
        }
    }

    ._hide-visual {
    border: 0 !important;
    clip: rect(0 0 0 0) !important;
    height: 1px !important;
    margin: -1px !important;
    overflow: hidden !important;
    padding: 0 !important;
    position: absolute !important;
    width: 1px !important;
    white-space: nowrap !important;
    }
    
    .scroll-lock {
    overflow: hidden;
    margin-right: 17px;
    }
`;