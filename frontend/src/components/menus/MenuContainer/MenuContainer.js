import PropTypes from 'prop-types';
import { StyledMenuContainer } from './MenuContainer.styled';
import { getTheme } from 'utils/storage';

function MenuContainer({
    theme=getTheme(),
    side = 'right',
    open = false,
    closeMenu,
    children,
    ...props
}) {
    const MIN_SWIPE_DELTA = 100;
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
            closeMenu();
        }
    }

    return (
        <StyledMenuContainer
            theme={theme}
            side={side}
            open={open}
            {...props}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}>
                {children}
        </StyledMenuContainer>
    );
}

MenuContainer.propTypes = {
    theme: PropTypes.object,
    side: PropTypes.string,
    open: PropTypes.bool.isRequired,
    closeMenu: PropTypes.func.isRequired,
    children: PropTypes.any,
}

export default MenuContainer;