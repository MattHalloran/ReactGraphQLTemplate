import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { StyledModal } from './Modal.styled';
import ClickOutside from '../ClickOutside/ClickOutside';

// const ESCAPE_KEY = 27;

function Modal(props) {
    // A portal is a way to render children into a DOM node that exists
    // outside the DOM hierarchy of the parent component
    return (
        <StyledModal
            role="dialog"
            tabIndex="-1"
            aria-modal="true">
            <ClickOutside className="modal-body" on_click_outside={props.onClose}>
                <button
                    aria-label="Close Modal"
                    aria-labelledby="close-modal"
                    className="x-button"
                    onClick={props.onClose}>
                    <span id="close-modal" className="_hide-visual">
                        Close
                        </span>
                    <svg className="_modal-close-icon" viewBox="0 0 40 40">
                        <path d="M 10,10 L 30,30 M 30,10 L 10,30" />
                    </svg>
                </button>
                {props.children}
            </ClickOutside>
        </StyledModal>);
}

Modal.propTypes = {
    children: PropTypes.any.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default Modal;