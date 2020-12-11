import React from "react";
import PropTypes from 'prop-types';
// JSX
import HeroSlider, {
  Nav,
  Slide,
  OverlayContainer
} from "hero-slider";
import Wrapper from "./Wrapper/Wrapper";
import Title from "./Title/Title";
import Subtitle from "./Subtitle/Subtitle";
import { Link } from 'react-router-dom';

// Images
const hallstatt = "https://images.pexels.com/photos/2749165/pexels-photo-2749165.jpeg?cs=srgb&dl=pexels-john-lambeth-2749165.jpg&fm=jpg";
const hvitserkur = "https://images.pexels.com/photos/2408649/pexels-photo-2408649.jpeg?cs=srgb&dl=pexels-mithul-varshan-2408649.jpg&fm=jpg";
const jacksonville = "https://images.pexels.com/photos/5529597/pexels-photo-5529597.jpeg?cs=srgb&dl=pexels-zen-chung-5529597.jpg&fm=jpg";
const moraineLake = "https://images.pexels.com/photos/3912947/pexels-photo-3912947.jpeg?cs=srgb&dl=pexels-thisisengineering-3912947.jpg&fm=jpg";

// Text
const HERO_TEXT = "Beautiful, healthy plants";
const HERO_SUBTEXT = "At competitive prices";

class Hero extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.props.text,
      subtext: this.props.subtext,
    }
  }

  render() {
    return (
      <HeroSlider
        orientation="horizontal"
        initialSlide={1}
        onBeforeChange={(previousSlide, nextSlide) =>
          console.log("onBeforeChange", previousSlide, nextSlide)
        }
        onChange={nextSlide => console.log("onChange", nextSlide)}
        onAfterChange={nextSlide => console.log("onAfterChange", nextSlide)}
        style={{
          backgroundColor: "#000"
        }}
        settings={{
          slidingDuration: 500,
          slidingDelay: 100,
          shouldAutoplay: true,
          shouldDisplayButtons: true,
          autoplayDuration: 5000,
          height: "100vh"
        }}
      >
        <OverlayContainer>
          <Wrapper>
            <Title>{HERO_TEXT}</Title>
            <Subtitle>
              {HERO_SUBTEXT}
            </Subtitle>
            <Link to="/info">
              <button className="primary">Order now</button>
            </Link>
          </Wrapper>
        </OverlayContainer>

        <Slide
          background={{
            backgroundImage: hallstatt,
            backgroundAnimation: "zoom"
          }}
        />

        <Slide
          background={{
            backgroundImage: hvitserkur,
            backgroundAnimation: "zoom"
          }}
        />

        <Slide
          background={{
            backgroundImage: jacksonville,
            backgroundAnimation: "zoom"
          }}
        />

        <Slide
          background={{
            backgroundImage: moraineLake,
            backgroundAnimation: "zoom"
          }}
        />
        <Nav />
      </HeroSlider>
    );
  }
};

Hero.propTypes = {
  text: PropTypes.string.isRequired,
  subtext: PropTypes.string.isRequired,
}

export default Hero;
