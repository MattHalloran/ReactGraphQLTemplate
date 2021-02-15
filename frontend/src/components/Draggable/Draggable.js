import React from "react";
import { StyledDraggable } from './Draggable.styled';

const throttle = (f) => {
    let token = null, lastArgs = null;
    const invoke = () => {
        f(...lastArgs);
        token = null;
    };
    const result = (...args) => {
        lastArgs = args;
        if (!token) {
            token = requestAnimationFrame(invoke);
        }
    };
    result.cancel = () => token && cancelAnimationFrame(token);
    return result;
};

class Draggable extends React.PureComponent {
    _relX = 0;
    _relY = 0;
    _ref = React.createRef();
    
    _onMouseDown = (event) => {
        if (event.button !== 0) {
            return;
        }
        const {scrollLeft, scrollTop, clientLeft, clientTop} = document.body;
        // Try to avoid calling `getBoundingClientRect` if you know the size
        // of the moving element from the beginning. It forces reflow and is
        // the laggiest part of the code right now. Luckily it's called only
        // once per click.
        const {left, top} = this._ref.current.getBoundingClientRect();
        this._relX = event.pageX - (left + scrollLeft - clientLeft);
        this._relY = event.pageY - (top + scrollTop - clientTop);
        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('mouseup', this._onMouseUp);
        event.preventDefault();
    };
    
    _onMouseUp = (event) => {
        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('mouseup', this._onMouseUp);
        event.preventDefault();
    };
    
    _onMouseMove = (event) => {
        console.log('ON MOVEEEEEE', event.pageX - this._relX, event.pageY - this._relY)
        this.props.onMove(
            event.pageX - this._relX,
            event.pageY - this._relY,
        );
        event.preventDefault();
    };
    
    _update = throttle(() => {
        const {x, y} = this.props;
        this._ref.current.style.transform = `translate(${x}px, ${y}px)`;
    });
    
    componentDidMount() {
        this._ref.current.addEventListener('mousedown', this._onMouseDown);
        this._update();
    }
    
    componentDidUpdate() {
        this._update();
    }
    
    componentWillUnmount() {
        this._ref.current.removeEventListener('mousedown', this._onMouseDown);
        this._update.cancel();
    }
    
    render() {
        return (
            <StyledDraggable className="draggable" ref={this._ref}>
                {this.props.children}
            </StyledDraggable>
        );
    }
}

export default Draggable;