import { useState } from 'react';
import PropTypes from 'prop-types';
import { StyledCollapsible } from './Collapsible.styled';

function Collapsible({
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
    return (<StyledCollapsible is_open={open}>
        <div onClick={() => togglePanel()} className={headerClassName}>
            {title}
                <span className='collapse-arrow' />
        </div>
        {open ? (
            <div className={contentClassName}>
                {children}
            </div>
        ) : null}
    </StyledCollapsible>);
}

Collapsible.propTypes = {
    title: PropTypes.string.isRequired,
    initial_open: PropTypes.bool,
    headerClassName: PropTypes.string,
    contentClassName: PropTypes.string,
    children: PropTypes.any,
}

export default Collapsible;