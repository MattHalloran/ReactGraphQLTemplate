import React from "react";
import PropTypes from 'prop-types';
import Button from 'components/shared/Button/Button';
import Hero1 from 'assets/img/hero-chicks.jpg';
import Hero2 from 'assets/img/hero-rainbow.jpg';
import Hero3 from 'assets/img/hero-plants.jpg';
import Hero4 from 'assets/img/hero-butterfly.jpg';
// JSX
import HeroSlider, {
  Nav,
  Slide,
} from "hero-slider";
import { Link } from 'react-router-dom';
import { ContentWrapper, OverlayContainer, Title, Subtitle } from './Hero.styled';

const images = [
  [Hero1, "zoom"],
  [Hero2, "zoom"],
  [Hero3, "zoom"],
  [Hero4, "zoom"]
]

function Hero({
    text,
    subtext,
}) {

  let slides = images.map((img, index) => (
    <Slide
      key={index}
      background={{
        backgroundImage: img[0],
        backgroundAnimation: img[1]
      }}
    />
  ))

  return (
    <HeroSlider
      orientation="horizontal"
      initialSlide={1}
      style={{
        backgroundColor: "#000"
      }}
      settings={{
        slidingDuration: 500,
        shouldAutoplay: true,
        shouldDisplayButtons: true,
        autoplayDuration: 5000,
        height: "100vh"
      }}
    >
      <OverlayContainer>
        <ContentWrapper>
          <Title>{text}</Title>
          <Subtitle>
            {subtext}
          </Subtitle>
          <Link to="/shopping">
            <Button className="primary">Order now</Button>
          </Link>
        </ContentWrapper>
      </OverlayContainer>
      {slides}
      <Nav />
    </HeroSlider>
  );
};

Hero.propTypes = {
  text: PropTypes.string.isRequired,
  subtext: PropTypes.string.isRequired,
}

export default Hero;
