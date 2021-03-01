import React, { memo } from 'react';
import { StyledDots } from './Dots.styled';

const Dot = ({ active }) => {
  return (
      <div className={`dot ${active ? 'active' : 'inactive'}`} />
  )
}

const MemoDot = memo(Dot)

const Dots = ({ slides, activeSlide }) => {
  return (
    <StyledDots>
      {slides.map((slide, i) => (
        <MemoDot key={slide} active={activeSlide === i} />
      ))}
    </StyledDots>
  )
}

export default Dots