import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StyledCollapsible } from './Collapsible.styled';

function Collapsible(props) {

    let [open, setOpen] = useState(false);

    const togglePanel = () => {
        setOpen(open => !open);
    }
    return (<StyledCollapsible>
        <div onClick={() => togglePanel()} className="header">
            {props.title}</div>
        {open ? (
            <div className="content">
                {props.children}
            </div>
        ) : null}
    </StyledCollapsible>);
}

Collapsible.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.any,
}

export default Collapsible;