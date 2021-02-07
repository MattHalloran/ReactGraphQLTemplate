import styled from 'styled-components';
export const StyledNavbar = styled.nav`
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 5;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    height: 12vh;
    padding: 2vh;
    padding-top: 1vh;
    padding-bottom: 1vh;
    background-color: rgba(0,0,0,0.7);
    transform: ${({ visible }) => visible ? 'translateY(0%)' : 'translateY(-100%)'};
    transition: transform 0.3s ease-in-out;
    
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
        color: white;
        text-decoration: none;
    }

    .nav-brand {
        white-space: nowrap;
        position: absolute;
    }

    .nav-logo {
        vertical-align: middle;
        fill: black;
        margin-top: 5px;
        margin-bottom: 7px;
        max-height: 12vh;
        transform: rotate(20deg);
        margin-left: -30px;
        //filter: invert(1);
    }
    
    .nav-name {
        font-size: 3vh;
        vertical-align: middle;
        margin-left: -10px;
        font-family: fantasy;
        font-style: normal;
    }
`;