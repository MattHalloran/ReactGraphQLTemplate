import styled from 'styled-components';

export const StyledInputText = styled.div`
    width: -moz-fit-content;
    width: -webkit-fill-available;
    height: 40px;
    border: 1px solid black;
    border-radius: 10px;
    position: relative;
    margin-bottom: 20px;
    background-color: rgba(255, 255, 255, 0.3);
    transition: 0.3s background-color ease-in-out, 0.3s box-shadow ease-in-out;
    ${({ locked }) => locked ? 'pointer-events: none;' : ''};

    //Diables Chrome auto-complete styling
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
        -webkit-transition: "color 9999s ease-out, background-color 9999s ease-out";
        -webkit-transition-delay: 9999s;
    }
  
  :hover {
    background-color: rgba(255, 255, 255, 0.45);
    box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.05);
  }
  
  .field.locked {
    pointer-events: none;
  }
  
  input {
    width: -moz-fit-content;
    width: -webkit-fill-available;
    height: 40px;
    position: relative;
    padding: 0px 16px;
    border: none;
    border-radius: 4px;
    font-family: "Gotham SSm A", "Gotham SSm B", sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: normal;
    background-color: transparent;
    color: #282828;
    outline: none;
    box-shadow: 0px 4px 20px 0px transparent;
    transition: 0.3s background-color ease-in-out, 0.3s box-shadow ease-in-out,
      0.1s padding ease-in-out;
    -webkit-appearance: none;
  }
  
  input::-webkit-input-placeholder {
    color: rgba(255, 255, 255, 0.8);
  }
  input::-moz-placeholder {
    color: rgba(255, 255, 255, 0.8);
  }
  input:-ms-input-placeholder {
    color: rgba(255, 255, 255, 0.8);
  }
  input:-moz-placeholder {
    color: rgba(255, 255, 255, 0.8);
  }
  
  input + label {
    position: absolute;
    top: 36px;
    left: 6px;
    font-family: "Gotham SSm A", "Gotham SSm B", sans-serif;
    font-size: 12px;
    font-weight: 600;
    line-height: 24px;
    opacity: ${({ show_label }) => show_label ? '1' : '0'};
    color: ${({ has_error, theme }) => has_error ? '#fc5c53' : theme.textPrimary};
    pointer-events: none;
    transition: 0.1s all ease-in-out;
  }

  label {
    text-shadow:
    -1px -1px 0 #000,  
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
  }
  
`;