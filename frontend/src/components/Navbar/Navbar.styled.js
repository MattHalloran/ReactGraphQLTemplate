import styled from 'styled-components';
export const StyledNavbar = styled.nav`
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 500;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    height: 12vh;
    padding: 2vh;
    padding-top: 1vh;
    padding-bottom: 1vh;
    background-color: rgba(0,0,0,0.7);
    
    .right-align {
        position: relative;
        padding-right: 20px;
    }

    .nav-list {
        display: flex;
        list-style: none;
        margin-top: 0px;
        margin-bottom: 0px;
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

    .nav-logo {
        max-height: 50px;
        margin-right: 5px;
        margin-bottom: 15px;
    }
`;