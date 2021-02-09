import { useState } from 'react';
import PropTypes from 'prop-types';
import { StyledCollapsible } from './Collapsible.styled';
import { getTheme } from 'utils/storage';

function Collapsible({
    theme = getTheme(),
    title,
    children,
}) {

    let [open, setOpen] = useState(false);

    const togglePanel = () => {
        setOpen(open => !open);
    }
    return (<StyledCollapsible theme={theme}>
        <div onClick={() => togglePanel()} className="header">
            {title}
            <div className="arrow-wrapper">
                <span className='arrow' />
            </div>
        </div>
        {open ? (
            <div className="content">
                {children}
            </div>
        ) : null}
    </StyledCollapsible>);
}

Collapsible.propTypes = {
    theme: PropTypes.object,
    title: PropTypes.string.isRequired,
    children: PropTypes.any,
}

export default Collapsible;