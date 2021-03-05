import styled from 'styled-components';
import { hexToRGB } from 'utils/opacityHex';

export const StyledNavbar = styled.nav`
    position: fixed;
    background-color: ${({ theme }) => hexToRGB(theme.darkPrimaryColor, 0.9)};
    color: ${({ theme }) => theme.headerText};
    top: 0;
    right: 0;
    left: 0;
    z-index: 15;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    min-height: 50px;
    height: 12vh;
    padding: 2vh;
    padding-top: 1vh;
    padding-bottom: 1vh;
    transform: ${({ visible }) => visible ? 'translateY(0%)' : 'translateY(-100%)'};
    transition: transform 0.3s ease-in-out;
    //disable text highlighting
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select:none;
    user-select:none;
    -o-user-select:none;
    
    .right-align {
        position: relative;
        padding-right: 20px;
    }

    .nav-list {
        display: flex;
        list-style: none;
        margin-top: 0px;
        margin-bottom: 0px;
        right: 0px;
        position: fixed;
        padding-right: 10px;
    }

    .nav-item {
        position: relative;
        padding: 5px;
        align-self: center
    }

    .nav-link {
        text-decoration: none;
    }

    .nav-brand {
        white-space: nowrap;
        position: absolute;
    }

    .nav-logo-container {
        display: inline-block;
        background: ${({ theme }) => theme.isLight ? '#0c3a0b' : '#757565'};
        border-radius: 500px;
        height: 12vh;
        width: 12vh;
        margin-top: -5px;
    }

    .nav-logo {
        -webkit-filter: drop-shadow(0.5px 0.5px 0 ${({ theme }) => hexToRGB(theme.darkPrimaryColor, 0.9)})
                        drop-shadow(-0.5px -0.5px 0 ${({ theme }) => hexToRGB(theme.darkPrimaryColor, 0.9)});
        filter: drop-shadow(0.5px 0.5px 0 ${({ theme }) => hexToRGB(theme.darkPrimaryColor, 0.9)}) 
                drop-shadow(-0.5px -0.5px 0 ${({ theme }) => hexToRGB(theme.darkPrimaryColor, 0.9)});
        vertical-align: middle;
        fill: black;
        margin-top: 5px;
        margin-bottom: 7px;
        min-height: 50px;
        max-height: 12vh;
        transform: rotate(20deg);
        margin-left: -15%;
        //filter: invert(1);
    }
    
    .nav-name {
        font-size: 2em;
        margin-left: -25px;
        font-family: 'Kite One', sans-serif;
        color: ${({ theme }) => theme.headerText};
    }

    @media (max-width: 450px) {
        .nav-name {
            font-size: 1.5em;
        }
    }

    @media (max-width: 350px) {
        .nav-name {
            display: none;
        }
    }

    .address-container {
        display: flex;
        align-items: center;
        cursor: pointer;
    }

    .iconic {
        stroke: none;
        margin-top: 5px;
        fill: ${({ theme }) => theme.headerText};
    }

    .bottom {
        display: flex;
        bottom: 0;
        justify-content: space-around;
        width: -moz-available;
        width: -webkit-fill-available;
        background: ${({ theme }) => theme.lightPrimaryColor};

        > * {
            margin: 10px 0;
        }
    }
`;