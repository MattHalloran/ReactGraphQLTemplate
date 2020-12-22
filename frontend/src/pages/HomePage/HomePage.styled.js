import styled from 'styled-components';

export const StyledHero = styled.header`
    position: relative;

    h1 {
        font-size: 4.5em !important;
    }

    .hero-gradient,
    .hero-text {
        text-align: center;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        width: fit-content;
        padding: 1rem;
    }

    .hero-gradient {
        background: linear-gradient(to bottom, transparent 0%, black 100%);
        width: 100%;
        height: 100%
    }
`;