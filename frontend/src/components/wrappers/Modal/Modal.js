import PropTypes from 'prop-types';
import { StyledModal } from './Modal.styled';
import ClickOutside from '../ClickOutside/ClickOutside';
import Button from 'components/Button/Button';

// const ESCAPE_KEY = 27;

function Modal({
    onClose,
    children,
}) {
    return (
        <StyledModal
            role="dialog"
            tabIndex="-1"
            aria-modal="true">
            <ClickOutside className="modal-body" on_click_outside={onClose}>
                <Button
                    aria-label="Close Modal"
                    aria-labelledby="close-modal"
                    className="x-button"
                    onClick={onClose}>
                    <span id="close-modal" className="_hide-visual">
                        Close
                        </span>
                    <svg className="_modal-close-icon" viewBox="0 0 40 40">
                        <path d="M 10,10 L 30,30 M 30,10 L 10,30" />
                    </svg>
                </Button>
                <div className="body-children">
                    {children}
                </div>
            </ClickOutside>
        </StyledModal>);
}

Modal.propTypes = {
    children: PropTypes.any.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default Modal;