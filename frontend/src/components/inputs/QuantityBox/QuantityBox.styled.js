import styled from 'styled-components';

export const StyledQuantityBox = styled.div`
    position: relative;
    height: 40px;
    display: flex;

    .minus,
    .plus {
        position: relative;
        display: inline-block;
        width: 20%;
        height: 100%;
        margin: 0;
        font-weight: bold;
        padding: 1px;
    }

    .minus {
        border-radius: 5px 0 0 5px;
    }

    .plus {
        border-radius: 0 5px 5px 0;
    }

    .quantity-field {
        position: relative;
        display: inline-block;
        width: 60%;
        text-align: center;
        border-style: unset;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }

    input[type="number"] {
        -moz-appearance: textfield;
    }
`;