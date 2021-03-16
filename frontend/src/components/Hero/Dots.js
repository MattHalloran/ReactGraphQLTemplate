import { memo } from 'react';
import { getTheme } from 'utils/storage';
import { StyledDots } from './Dots.styled';

const Dot = ({ active }) => {
  return (
      <div className={`dot ${active ? 'active' : 'inactive'}`} />
  )
}

const MemoDot = memo(Dot)

const Dots = ({ 
    slides,
    activeSlide,
    theme = getTheme(),
}) => {
  return (
    <StyledDots theme={theme}>
      {slides.map((slide, i) => (
        <MemoDot key={slide} active={activeSlide === i} />
      ))}
    </StyledDots>
  )
}

export default Dots