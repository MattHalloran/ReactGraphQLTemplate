import styled from 'styled-components';

export const StyledModal = styled.aside`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    background-color: rgba(0,0,0,.8);

    .modal-body {
        display: flex;
        background-color: ${({ theme }) => theme.bodySecondary};
        color: ${({ theme }) => theme.textSecondary};
        box-shadow: 0 0 10px 3px rgba(0, 0, 0, 0.1);
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        max-width: calc(100% - 100px);
        max-height: calc(100% - 50px);
        width: fit-content;
        height: fit-content;
        border: 3px solid ${({ theme }) => theme.textPrimary};
        border-radius: 10px;
    }

    .body-children {
        overflow-y: auto;
        overflow-x: hidden;
        border-radius: 10px;
        width: -moz-available;
        width: -webkit-fill-available;
    }
    
    .x-button {
        position: fixed;
        right: -20px;
        top: -20px;
        border-radius: 100%;
        padding: 0.5em;
        line-height: 1;
        background: #A3333D;
        border: 0;
        box-shadow: 0;
        cursor: pointer;
        z-index: 2;
    }

    ._modal-close:hover {
        background: #F64740
    }
    
    ._modal-close-icon {
    width: 25px;
    height: 25px;
    fill: transparent;
    stroke: ${({ theme }) => theme.textPrimary};
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