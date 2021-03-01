import styled from 'styled-components';

export const StyledHero = styled.div`
    position: relative;
    overflow: hidden;
    pointer-events: none;
    * {
    pointer-events: auto;
    }

    .content-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-flow: column;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        pointer-events: none;
        background-color: rgba(0, 0, 0, 0.1);
    }

    .title,
    .subtitle {
        padding: 0;
        text-align: center;
        text-shadow:
            -1px -1px 0 #000,  
            1px -1px 0 #000,
            -1px 1px 0 #000,
            1px 1px 0 #000;
    }

    .title {
        margin: 0 auto;
        width: 90%;
        font-size: 3.5rem;
    }

    .subtitle {
        margin: 24px auto 0;
        width: 80%;
        font-size: 1.75rem;
    }
`;