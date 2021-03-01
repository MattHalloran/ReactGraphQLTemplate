import React from "react";
import PropTypes from 'prop-types';
import Button from 'components/Button/Button';
import { Link } from 'react-router-dom';
import { StyledHero } from './Hero.styled';
import Slider from './Slider.js'
import Hero1 from 'assets/img/hero-chicks.jpg';
import Hero2 from 'assets/img/hero-rainbow.jpg';
import Hero3 from 'assets/img/hero-plants.jpg';
import Hero4 from 'assets/img/hero-butterfly.jpg';

console.log(Hero1)

const images = [
    Hero1,
    Hero2,
    Hero3,
    Hero4,
]

function Hero({
    text,
    subtext,
}) {
    return (
        <StyledHero>
            <Slider images={images} autoPlay={true} />
            <div className="content-wrapper">
                <h1 className="title">{text}</h1>
                <h2 className="subtitle">
                    {subtext}
                </h2>
                <Link to="/shopping">
                    <Button className="primary">Order now</Button>
                </Link>
            </div>
        </StyledHero>
    );
};

Hero.propTypes = {
    text: PropTypes.string.isRequired,
    subtext: PropTypes.string.isRequired,
}

export default Hero;
