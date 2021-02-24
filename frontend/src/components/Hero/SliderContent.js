import { StyledSliderContent } from './SliderContent.styled.js';

const SliderContent = ({
    translate,
    transition,
    width,
    children
}) => (
    <StyledSliderContent translate={translate} transition={transition} width={width}>
        {children}
    </StyledSliderContent>
)

export default SliderContent