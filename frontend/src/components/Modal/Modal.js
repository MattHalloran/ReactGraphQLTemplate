import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { StyledModal } from './Modal.styled';

const ESCAPE_KEY = 27;

export default class Modal extends Component {
    constructor(props) {
        super(props);

        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    handleClickOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
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
                ref={this.setWrapperRef}
                tag="aside"
                role="dialog"
                tabIndex="-1"
                aria-modal="true"
                className="modal-cover">
                <div className="modal-area">
                    <button
                        aria-label="Close Modal"
                        aria-labelledby="close-modal"
                        className="_modal-close"
                        onClick={this.closeModal}>
                        <span id="close-modal" className="_hide-visual">
                            Close
                        </span>
                        <svg className="_modal-close-icon" viewBox="0 0 40 40">
                            <path d="M 10,10 L 30,30 M 30,10 L 10,30" />
                        </svg>
                    </button>
                    <div className="modal-body">
                        {this.props.children}
                    </div>
                </div>
            </StyledModal>,
            document.body
        );
    }
}
