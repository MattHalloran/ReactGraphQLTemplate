import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export const Portal = ({ children, className = 'root-portal', el = 'div' }) => {
    const [container] = useState(document.createElement(el))

    container.classList.add(className)

    useEffect(() => {
        document.body.appendChild(container)
        return () => {
            document.body.removeChild(container)
        }
    }, [])

    return ReactDOM.createPortal(children, container)
}