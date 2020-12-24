import styled from 'styled-components';
export const StyledNavbar = styled.nav`
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1030;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: .5rem 1rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
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