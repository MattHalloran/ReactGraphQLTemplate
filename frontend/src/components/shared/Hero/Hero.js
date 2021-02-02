import React from "react";
import PropTypes from 'prop-types';
import Button from 'components/shared/Button/Button';
// JSX
import HeroSlider, {
  Nav,
  Slide,
} from "hero-slider";
import { Link } from 'react-router-dom';
import { ContentWrapper, OverlayContainer, Title, Subtitle } from './Hero.styled';

const images = [
  ["https://images.pexels.com/photos/2749165/pexels-photo-2749165.jpeg?cs=srgb&dl=pexels-john-lambeth-2749165.jpg&fm=jpg", "zoom"],
  ["https://images.pexels.com/photos/2408649/pexels-photo-2408649.jpeg?cs=srgb&dl=pexels-mithul-varshan-2408649.jpg&fm=jpg", "zoom"],
  ["https://images.pexels.com/photos/5529597/pexels-photo-5529597.jpeg?cs=srgb&dl=pexels-zen-chung-5529597.jpg&fm=jpg", "zoom"],
  ["https://images.pexels.com/photos/3912947/pexels-photo-3912947.jpeg?cs=srgb&dl=pexels-thisisengineering-3912947.jpg&fm=jpg", "zoom"]
]

function Hero(props) {

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
          <Title>{props.text}</Title>
          <Subtitle>
            {props.subtext}
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
