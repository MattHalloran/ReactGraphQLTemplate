import React from 'react';
import { StyledArrowMenu } from './ArrowMenu.styled';
import { MenuContainer } from '../../Menu';
import { FiArrowRight } from 'react-icons/fi';

class ArrowMenu extends React.Component {
    constructor(props) {
        this.toggleOpen = this.toggleOpen.bind(this);
    }

    render() {
        return (
            <StyledArrowMenu>
                <Arrow onClick={this.toggleOpen} open={this.state.open} />
                <MenuContainer open={this.state.open} closeMenu={this.closeMenu}>
                    {this.props.children}
                </MenuContainer>
            </StyledArrowMenu>
        );
    }
}

ArrowMenu.propTypes = {
    toggleOpen: PropTypes.function.isRequired,
    open: PropTypes.string.isRequired,
}

export default ArrowMenu;

class Arrow extends React.Component {
    render() {
        return (
            <div className="arrow-container">
                <FiArrowRight />
            </div>
        );
    }
}

Arrow.propTypes = {
    open: PropTypes.string.isRequired,
}