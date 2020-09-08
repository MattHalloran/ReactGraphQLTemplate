// Acts as a wrapper class for text that opens a modal
import React from 'react';
import Modal from './Modal';
import Trigger from './Trigger';
import './Modal.css';

const ESCAPE_KEY = 27;

class Container extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isShown: false,
            signUp: this.props.signUp,
        }
    }

    showModal = () => {
        this.setState({ isShown: true }, () => {
            this.closeButton.focus();
        });
        this.toggleScrollLock();
    };
    closeModal = () => {
        this.setState({ isShown: false });
        this.toggleScrollLock();
    };
    onKeyDown = (event) => {
        if (event.keyCode === ESCAPE_KEY) {
            this.closeModal();
        }
    };
    onClickOutside = (event) => {
        if (this.modal && this.modal.contains(event.target)) return;
        this.closeModal();
    };

    toggleScrollLock = () => {
        document.querySelector('html').classList.toggle('scroll-lock');
    };
    render() {
        return (
            <React.Fragment>
                <Trigger
                    showModal={this.showModal}
                    buttonRef={(n) => (this.Trigger = n)}
                    triggerText={this.props.triggerText}
                />
                {this.state.isShown ? (
                    <Modal
                        signUp={this.state.signUp}
                        onSubmit={this.props.onSubmit}
                        modalRef={(n) => (this.modal = n)}
                        buttonRef={(n) => (this.closeButton = n)}
                        closeModal={this.closeModal}
                        onKeyDown={this.onKeyDown}
                        onClickOutside={this.onClickOutside}
                    />
                ) : null}
            </React.Fragment>
        );
    }
}

export default Container;
