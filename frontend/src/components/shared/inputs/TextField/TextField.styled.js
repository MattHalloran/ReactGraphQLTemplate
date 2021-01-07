import styled from 'styled-components';

export const StyledTextField = styled.div`
    position: relative;
    min-height: 10vh;
    height: fit-content;
    margin-bottom: 2vh;
    transition: 0.3s background-color ease-in-out, 0.3s box-shadow ease-in-out;
    pointer-events: ${({ locked }) => locked ? 'none' : 'auto'};

    input {
        border: 4px solid ${({ has_error }) => has_error ? 'red' : 'blue'};
        border-radius: 5px;
        position: absolute;
        height: 7vh;
        width: 100%;
        box-sizing: border-box;
        padding-top: ${({ large_placeholder }) => large_placeholder ? '0vh' : '2vh'};
    }

    input:focus {
        outline: none;
    }


    .text-label {
        position: absolute;
        border: none;
        font-size: 1em;
        font-weight: 400;
        line-height: normal;
        outline: none;
        transition: 0.3s ease-in-out;
        top: ${({ large_placeholder }) => large_placeholder ? '2.5vh' : '3px'};
        left: 10px;
        transform: ${({ large_placeholder }) => large_placeholder ? 'transformY(0.5em) scale(1)' : 'scale(0.75)'};
        transform-origin: top left;
        pointer-events: none;
        color: ${({ has_error }) => has_error > 0 ? 'red' : 'blue'};
    }

    .error-label {
        position: absolute;
        border: none;
        font-size: 16px;
        font-weight: 400;
        line-height: normal;
        outline: none;
        transition: 0.3s ease-in-out;
        padding-left: 4px;
        pointer-events: none;
        top: 7vh;
        height: 3vh;
        color: ${({ has_error }) => has_error ? 'red' : 'transparent'};
    }
`;