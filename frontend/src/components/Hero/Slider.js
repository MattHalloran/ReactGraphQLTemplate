import { useState, useEffect, useRef, useCallback } from 'react';
import SliderContent from './SliderContent';
import Slide from './Slide';
import Dots from './Dots';
import { StyledSlider } from './Slider.styled.js';

const DEFAULT_SLIDING_DELAY = 3000;
const DEFAULT_SLIDING_DURATION = 1000;
const getWidth = () => window.innerWidth;

const Slider = ({
    images = [],
    autoPlay = true,
    slidingDelay = DEFAULT_SLIDING_DELAY,
    slidingDuration = DEFAULT_SLIDING_DURATION,
}) => {
    const [slides] = useState(() => {
        // Make sure the first image is at both the beginning and end of the array
        let copy = [...images];
        copy.push(images[0]);
        return copy.map((s, i) => (
            <Slide width={getWidth()} key={s + i} content={s} />
        ))
    });
    const [slideIndex, setSlideIndex] = useState(0);
    const [state, setState] = useState({
        translate: 0,
        transition: 0,
    })

    const { translate, transition } = state

    const resizeRef = useRef()
    const sliderRef = useRef()
    const timeoutRef = useRef(null);

    useEffect(() => {
        resizeRef.current = handleResize
    })

    const play = useCallback((index) => {
        timeoutRef.current = setTimeout(wait, slidingDuration, index === images.length - 1 ? 0 : index + 1);
        setState({
            transition: slidingDuration,
            translate: getWidth() * (index + 1)
        })
    }, [timeoutRef, images, slidingDuration])

    const wait = useCallback((index) => {
        setSlideIndex(index);
        timeoutRef.current = setTimeout(play, slidingDelay, index);
        //setSlides(s => rotateArray(s, false));
        setState({
            transition: 0,
            translate: getWidth() * index
        })
    }, [timeoutRef, play, slidingDelay])

    useEffect(() => {
        const resize = () => {
            resizeRef.current()
        }

        const onResize = window.addEventListener('resize', resize)

        if (autoPlay) wait(0);

        return () => {
            window.removeEventListener('resize', onResize)

            if (autoPlay) {
                clearTimeout(timeoutRef.current);
            }
        }
    }, [autoPlay, wait])

    const handleResize = () => {
        setState({ ...state, translate: getWidth(), transition: 0 })
    }

    return (
        <StyledSlider ref={sliderRef}>
            <SliderContent
                translate={translate}
                transition={transition}
                width={getWidth() * slides.length}
            >
                {slides}
            </SliderContent>
            <Dots slides={images} activeSlide={slideIndex} />
        </StyledSlider>
    )
}

export default Slider