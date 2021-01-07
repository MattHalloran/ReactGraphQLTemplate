import styled from 'styled-components';
export const StyledSpinner = styled.div`
    .spinner {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 100000;
    }
    
    .spinner_component {
        position: relative;
        height: 150px;
        width: 150px;
        animation: spin-motion 3s linear infinite;
    }
    
    @keyframes spin-motion {
        0% {
        transform: rotateZ(0deg);
        }
        100% {
        transform: rotateZ(-360deg);
        }
    }
`;