import PropTypes from 'prop-types';
import { StyledMenuContainer } from './MenuContainer.styled';
import { getTheme } from 'storage';

function MenuContainer(props) {
    const MIN_SWIPE_DELTA = 100;
    const theme = props.theme ?? getTheme();
    let side = props.side ?? 'right';
    let touchStart = 0;
    let touchEnd = 0;

    const handleTouchStart = (event) => {
        touchStart = event.targetTouches[0].clientX;
        touchEnd = touchStart;
    }

    const handleTouchMove = (event) => touchEnd = event.targetTouches[0].clientX;

    const handleTouchEnd = () => {
        if ((side === 'right' && touchEnd - touchStart > MIN_SWIPE_DELTA) ||
            (side === 'left' && touchStart - touchEnd > MIN_SWIPE_DELTA)) {
            props.closeMenu();
        }
    }

    return (
        <StyledMenuContainer
            theme={theme}
            open={props.open}
            side={side}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}>
            {props.children}
        </StyledMenuContainer>
    );
}

MenuContainer.propTypes = {
    theme: PropTypes.object,
    side: PropTypes.string,
    open: PropTypes.bool.isRequired,
    closeMenu: PropTypes.func.isRequired,
}

export default MenuContainer;