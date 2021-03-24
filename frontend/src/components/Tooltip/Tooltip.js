import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { StyledTooltip } from './Tooltip.styled';

function Tooltip({
    delay = 400,
    direction = 'top',
    content,
    children,
}) {
    let timeout;
    const [active, setActive] = useState(false);

    const showTip = (d=delay) => {
        timeout = setTimeout(() => {
            setActive(true);
        }, d);
    };

    const hideTip = () => {
        clearInterval(timeout);
        setActive(false);
    };

    const toggleTip = useCallback(() => {
        if (active) {
            hideTip();
        } else {
            showTip(0);
        }
    }, [active, hideTip, showTip])

    return (
        <StyledTooltip
            onMouseEnter={() => showTip()}
            onMouseLeave={() => hideTip()}
            onClick={() => toggleTip()}>
            {children}
            {active && (
                <div className={`Tooltip-Tip ${direction}`}>
                    {/* Content */}
                    {content}
                </div>
            )}
        </StyledTooltip>
    );
}

Tooltip.propTypes = {
    delay: PropTypes.number,
    direction: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
    content: PropTypes.any,
    children: PropTypes.any,
}

export default Tooltip;
