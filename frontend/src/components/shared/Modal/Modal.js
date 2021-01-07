import React, { Component } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { StyledModal } from './Modal.styled';
import ClickOutside from '../wrappers/ClickOutside';

// const ESCAPE_KEY = 27;

function Modal(props) {
    let history = useHistory();

    const closeModal = () => {
        console.log('CLOSING MODALLL');
        history.goBack();
    }

    // A portal is a way to render children into a DOM node that exists
    // outside the DOM hierarchy of the parent component
    return ReactDOM.createPortal(
        <StyledModal
            tag="aside"
            role="dialog"
            tabIndex="-1"
            aria-modal="true">
            <ClickOutside className="modal-body" on_click_outside={closeModal}>
                <button
                    aria-label="Close Modal"
                    aria-labelledby="close-modal"
                    className="x-button"
                    onClick={closeModal}>
                    <span id="close-modal" className="_hide-visual">
                        Close
                        </span>
                    <svg className="_modal-close-icon" viewBox="0 0 40 40">
                        <path d="M 10,10 L 30,30 M 30,10 L 10,30" />
                    </svg>
                </button>
                {props.children}
            </ClickOutside>
        </StyledModal>,
        document.body
    );
}

Modal.propTypes = {
    children: PropTypes.any.isRequired,
}

export default Modal;