import { memo } from 'react'
import { StyledSlide } from './Slide.styled.js';

const Slide = ({ content, width }) => {
  return (
      <StyledSlide src={content} width={width} />
  )
}

export default memo(Slide)