import styled from 'styled-components';
import HeroImage from '../../assets/img/hero-1.jpg';

export const StyledHero = styled.header`
    position: relative;

    h1 {
        font-size: 4.5em !important;
    }

    .hero-image {
        background-image: url(${HeroImage});
        height: 40rem;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        position: relative;
    }

    .hero-text {
        text-align: center;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        width: fit-content;
        padding: 2rem;
    }
`;