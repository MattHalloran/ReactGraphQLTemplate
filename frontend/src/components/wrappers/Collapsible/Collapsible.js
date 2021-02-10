import { useState } from 'react';
import PropTypes from 'prop-types';
import { StyledCollapsible } from './Collapsible.styled';
import { getTheme } from 'utils/storage';

function Collapsible({
    theme = getTheme(),
    title,
    initial_open = false,
    headerClassName = 'header',
    contentClassName = 'content',
    children,
}) {

    const [open, setOpen] = useState(initial_open);

    const togglePanel = () => {
        setOpen(open => !open);
    }
    return (<StyledCollapsible theme={theme}>
        <div onClick={() => togglePanel()} className={headerClassName}>
            {title}
            <div className="arrow-wrapper">
                <span className='arrow' />
            </div>
        </div>
        {open ? (
            <div className={contentClassName}>
                {children}
            </div>
        ) : null}
    </StyledCollapsible>);
}

Collapsible.propTypes = {
    theme: PropTypes.object,
    title: PropTypes.string.isRequired,
    initial_open: PropTypes.bool,
    headerClassName: PropTypes.string,
    contentClassName: PropTypes.string,
    children: PropTypes.any,
}

export default Collapsible;