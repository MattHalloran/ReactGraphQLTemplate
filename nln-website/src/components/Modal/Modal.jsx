import React from 'react';
import ReactDOM from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { useHistory } from 'react-router-dom';
import './Modal.css';

const ESCAPE_KEY = 27;

function Modal(props) {
    let history = useHistory();
    const closeModal = (event) => {
        event.stopPropagation();
        history.goBack();
        toggleScrollLock();
    };
    const toggleScrollLock = () => {
        document.querySelector('html').classList.toggle('scroll-lock');
    };
    const onClick = (event) => {
        if (props.modalRef.current && props.modalRef.current.contains(event.target)) return; //If clicked outside modal
        closeModal(event);
    }
    const onKeyDown = (event) => {
        if (event.keyCode !== ESCAPE_KEY) return;
        closeModal(event);
    };
    return ReactDOM.createPortal(
        <FocusTrap>
            <aside
                tag="aside"
                role="dialog"
                tabIndex="-1"
                aria-modal="true"
                className="modal-cover"
                onMouseDown={onClick}
                onKeyDown={onKeyDown}>
                <div className="modal-area" ref={props.modalRef}>
                    <button
                        ref={props.buttonRef}
                        aria-label="Close Modal"
                        aria-labelledby="close-modal"
                        className="_modal-close"
                        onClick={closeModal}>
                        <span id="close-modal" className="_hide-visual">
                            Close
                        </span>
                        <svg className="_modal-close-icon" viewBox="0 0 40 40">
                            <path d="M 10,10 L 30,30 M 30,10 L 10,30" />
                        </svg>
                    </button>
                    <div className="modal-body">
                        {props.children}
                    </div>
                </div>
            </aside>
        </FocusTrap>,
        document.body
    );
}

export default Modal;
