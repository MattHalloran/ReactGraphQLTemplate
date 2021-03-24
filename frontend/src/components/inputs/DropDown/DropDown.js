import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { StyledDropDown } from './DropDown.styled';
import useOutsideClick from 'utils/useOutsideClick';
import { isString } from 'utils/typeChecking';
import makeID from 'utils/makeID';

function DropDown({ allow_custom_input = false,
    multi_select = false,
    options,
    disabled = false,
    onChange,
    onFocus,
    initial_value,
    placeholder,
    className = '',
}) {
    const [is_open, setIsOpen] = useState(false);
    const [y, setY] = useState(0);
    const clickRef = useRef();
    const menuRef = useRef();
    const dropID = useRef(makeID(8));
    let mouse_start = 0;
    let mouse_end = 0;

    const [custom, setCustom] = useState('');
    const [selected, setSelected] = useState(() => {
        if (multi_select) return initial_value ? [initial_value] : [];
        return initial_value ?? options[0];
    })

    const trackScrolling = () => setY(document.getElementById(dropID.current)?.getBoundingClientRect()?.y ?? 0);

    useEffect(() => {
        trackScrolling();
        document.addEventListener('scroll', trackScrolling);
        return () => document.removeEventListener('scroll', trackScrolling);
    },[])

    useEffect(() => {
        if (multi_select) {
            if (allow_custom_input && custom.length > 0) 
                onChange([...selected, custom]);
            else
                onChange(selected);
        } else {
            if (allow_custom_input && custom.length > 0) {
                onChange(custom);
                setSelected('');
            }
            else
                onChange(selected);
            setIsOpen(false);
        }

        if (multi_select || selected?.length <= 0) return;
        setIsOpen(false);
    }, [selected, custom, multi_select, allow_custom_input, onChange])

    // Start tracking drag variables for dropdown menu
    const handleMouseDown = (event) => {
        if (disabled || !menuRef.current.contains(event.target)) return;
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

    const findIndex = (arr, opt) => {
        if (!multi_select) return -1;
        for (let i = 0; i < arr.length; i++) {
            //Options are either a {label, value} object, or a string
            if (isString(arr[i])) {
                if (arr[i] === opt) return i;
            } else {
                if (arr[i].label === opt.label && arr[i].value === opt.value) return i;
            }
        }
        return -1;
    }

    const setValue = useCallback((option) => {
        if (was_drag()) return;
        if (multi_select) {
            let index = findIndex(selected, option);
            if (index >= 0) {
                setSelected(s => s.splice(index, 1));
            } else {
                setSelected(s => [...s, option]);
            }
        } else {
            setSelected(option);
        }
    }, [selected, findIndex, multi_select, was_drag])

    const renderOption = useCallback((option) => {
        let is_selected = false;
        if (multi_select) {
            is_selected = findIndex(selected, option) >= 0;
        } else {
            if (isString(option)) {
                is_selected = selected === option;
            } else {
                is_selected = selected.value === option.value;
            }
        }
        
        return (
            <div
                key={isString(option) ? option : option.value}
                className={'DropDown-option ' + (is_selected ? 'is-selected' : '')}
                role='option'
                onClick={() => setValue(option)}
                onTouchEnd={() => setValue(option)}
                aria-selected={is_selected}>
                {isString(option) ? option : option.label}
            </div>
        )
    }, [selected, findIndex, multi_select, setValue]);

    let control_text;
    if (allow_custom_input) {
        control_text = custom;
    } else {
        control_text = isString(selected) ? selected : selected.label;
    }

    let any_selected = (multi_select && selected.length > 0) || (!multi_select && selected.value?.length > 0);
    let control = allow_custom_input ? (
        <input type="text" className="DropDown-custom" placeholder={placeholder} value={control_text} onChange={(e) => setCustom(e.target.value)} />
    ) : (
            <div className={'DropDown-placeholder' + (any_selected ? 'is-selected' : '')}>
                {control_text}
            </div>
        );

    let menu = is_open ? (<div className='DropDown-menu' aria-expanded='true' ref={menuRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
        {options?.map((item) => renderOption(item))}
    </div>) : null

    return (
        <StyledDropDown id={dropID.current} is_open={is_open} num_options={options?.length ?? 0} className={className} ref={clickRef} size_data={[window.innerHeight, y]}>
            <div className={'DropDown-control' + (disabled ? 'DropDown-disabled' : '')} onClick={() => setIsOpen(is => !is)} aria-haspopup='listbox'>
                {control}
                <span className='DropDown-arrow' />
            </div>
            {menu}
        </StyledDropDown>
    )
}

DropDown.propTypes = {
    allow_custom_input: PropTypes.bool,
    // Allow multiple options to be selected at the same time
    multi_select: PropTypes.bool,
    // Options is an array of strings, or and array of {label, value} pairs
    options: PropTypes.array.isRequired,
    disabled: PropTypes.bool,
    arrowClosed: PropTypes.object,
    arrowOpen: PropTypes.object,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    // initial selected string or {label, value} pair.
    // If not set, defaults to first object
    initial_value: PropTypes.object,
    placeholder: PropTypes.string
}

export default DropDown;