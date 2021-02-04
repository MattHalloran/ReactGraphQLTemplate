import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledDropDown } from './DropDown.styled';
import useOutsideClick from 'utils/useOutsideClick';
import { getTheme } from 'storage';

function DropDown(props) {
    const theme = props.theme ?? getTheme();
    const [is_open, setIsOpen] = useState(false);
    const clickRef = useRef();
    const menuRef = useRef();
    let mouse_start = 0;
    let mouse_end = 0;

    const [selected, setSelected] = useState(props.initial_value ?? props.options[0])

    useEffect(() => {
        if (selected?.length <= 0) return;
        setIsOpen(false);
        props.onChange(selected);
    }, [selected])

    // Start tracking drag variables for dropdown menu
    const handleMouseDown = (event) => {
        if (props.disabled || !menuRef.current.contains(event.target)) return;
        mouse_start = [event.pageX, event.pageY];
        mouse_end = mouse_start;
    }

    const handleMouseMove = (event) => {
        mouse_end = [event.pageX, event.pageY];
    }

    const was_drag = () => {
        let min_drag_delta = 10;
        let distance_scrolled = ((((mouse_end[0] - mouse_start[0]) ** 2) + ((mouse_end[1] - mouse_start[1]) ** 2)) ** 0.5);
        return distance_scrolled > min_drag_delta;
    }

    useOutsideClick(clickRef, () => {
        setIsOpen(false)
    });

    const setValue = (value, label) => {
        if (was_drag()) return;
        setSelected({ value, label });
    }

    const renderOption = (option) => {
        let value = option.value ?? option.label ?? option;
        let label = option.label ?? option.value ?? option;
        return (
            <div
                key={value}
                className={'DropDown-option ' + (selected.value === value ? 'is-selected' : '')}
                role='option'
                onClick={() => setValue(value, label)}
                onTouchEnd={() => setValue(value, label)}
                aria-selected={selected.value === value ? 'true' : 'false'}>
                {label}
            </div>
        )
    }

    const { arrowClosed, arrowOpen } = props

    let control_text = typeof selected === 'string' ? selected : selected.label;
    let control = props.allow_custom_input ? (
        <input type="text" className="DropDown-custom" value={control_text} onChange={(e) => setValue(e.target.value, e.target.value)} />
    ) : (
            <div className={'DropDown-placeholder' + (selected.value?.length > 0 ? 'is-selected' : '')}>
                {control_text}
            </div>
        );

    let menu = is_open ? (<div className='DropDown-menu' aria-expanded='true' ref={menuRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
        {props.options?.map((item) => renderOption(item))}
    </div>) : null

    return (
        <StyledDropDown theme={theme} className={(is_open ? 'is-open' : null)} ref={clickRef}>
            <div className={'DropDown-control' + (props.disabled ? 'DropDown-disabled' : '')} onClick={() => setIsOpen(is => !is)} aria-haspopup='listbox'>
                {control}
                <div className='DropDown-arrow-wrapper'>
                    {arrowOpen && arrowClosed
                        ? is_open ? arrowOpen : arrowClosed
                        : <span className='DropDown-arrow' />}
                </div>
            </div>
            {menu}
        </StyledDropDown>
    )
}

DropDown.propTypes = {
    allow_custom_input: PropTypes.bool,
    // Options is an array of {label, value} pairs
    options: PropTypes.array.isRequired,
    disabled: PropTypes.bool,
    arrowClosed: PropTypes.object,
    arrowOpen: PropTypes.object,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    // initial selected {label, value} pair.
    // If not set, defaults to first object
    initial_value: PropTypes.object,
    placeholder: PropTypes.string,
    theme: PropTypes.object,
}

export default DropDown;