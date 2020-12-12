import styled from 'styled-components';
export const StyledModal = styled.aside`
    background-color: ${({ theme }) => theme.bodySecondary};
    color: ${({ theme }) => theme.textSecondary}

    /* Secondary color links */
    a:link {
        color: ${({ theme }) => theme.textSecondary};
    }
    a:visited {
        color: ${({ theme }) => theme.textSecondary};
    }
    a:hover {
        color: ${({ theme }) => theme.textSecondary};
    }

    .modal-cover {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    transform: translateZ(0);
    background-color: rgba(0, 0, 0, 0.8);
    }
    
    .modal-area {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 2.5em 1.5em 1.5em 1.5em;
    background-color: ${({ theme }) => theme.bodySecondary};
    box-shadow: 0 0 10px 3px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    z-index: 100;
    }
    
    @media screen and (min-width: 500px) {
    /* Center the Modal! */
    .modal-area {
        left: 50%;
        top: 50%;
        height: auto;
        transform: translate(-50%, -50%);
        max-width: 30em;
        max-height: calc(100% - 1em);
    }
    }
    
    ._modal-close {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.5em;
    line-height: 1;
    background: #A3333D;
    border: 0;
    box-shadow: 0;
    cursor: pointer;
    }

    ._modal-close:hover {
        background: #F64740
    }
    
    ._modal-close-icon {
    width: 25px;
    height: 25px;
    fill: transparent;
    stroke: white;
    stroke-linecap: round;
    stroke-width: 3;
    }
    
    .modal-body {
    padding-top: 0.25em;
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