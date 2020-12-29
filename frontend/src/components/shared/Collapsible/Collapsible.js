import React from 'react';
import PropTypes from 'prop-types';
import { StyledCollapsible } from './Collapsible.styled';

class Collapsible extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        }
        this.togglePanel = this.togglePanel.bind(this);
    }
    togglePanel(e) {
        this.setState({ open: !this.state.open })
    }
    render() {
        return (<StyledCollapsible>
            <div onClick={(e) => this.togglePanel(e)} className="header">
                {this.props.title}</div>
            {this.state.open ? (
                <div className="content">
                    {this.props.children}
                </div>
            ) : null}
        </StyledCollapsible>);
    }
}

Collapsible.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.any,
}

export default Collapsible;