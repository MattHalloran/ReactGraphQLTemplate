import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { StyledModal } from './Modal.styled';

// const ESCAPE_KEY = 27;

class Modal extends Component {
    constructor(props) {
        super(props);

        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside(event) {
        console.log('HANDLE CLICK OUTSIDE', event);
        if (event.target.id  === "modal-aside") {
            console.log('CLOSING MODAL');
            this.closeModal();
        }
    }

    closeModal() {
        this.props.history.goBack();
    }

    // A portal is a way to render children into a DOM node that exists
    // outside the DOM hierarchy of the parent component
    render() {
        return ReactDOM.createPortal(
            <StyledModal
                id="modal-aside"
                tag="aside"
                role="dialog"
                tabIndex="-1"
                aria-modal="true">
                <div className="modal-body">
                    <button
                        aria-label="Close Modal"
                        aria-labelledby="close-modal"
                        className="x-button"
                        onClick={this.closeModal}>
                        <span id="close-modal" className="_hide-visual">
                            Close
                        </span>
                        <svg className="_modal-close-icon" viewBox="0 0 40 40">
                            <path d="M 10,10 L 30,30 M 30,10 L 10,30" />
                        </svg>
                    </button>
                    {this.props.children}
                </div>
            </StyledModal>,
            document.body
        );
    }
}

Modal.propTypes = {
    history: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
}

export default Modal;