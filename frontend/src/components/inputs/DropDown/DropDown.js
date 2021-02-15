import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { StyledDropDown } from './DropDown.styled';
import useOutsideClick from 'utils/useOutsideClick';
import { getTheme } from 'utils/storage';
import makeID from 'utils/makeID';

function DropDown({ allow_custom_input = false,
    multi_select = false,
    options,
    disabled = false,
    arrowClosed,
    arrowOpen,
    onChange,
    onFocus,
    initial_value,
    placeholder,
    theme=getTheme(),
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
        let value = initial_value ?? options[0];
        return multi_select ? [value] : value;
    })

    console.log('DROPDOWN OPTIONS AREEEE', options, selected);

    useEffect(() => {
        setY(document.getElementById(dropID.current)?.getBoundingClientRect()?.y ?? 0);
    },[])

    useEffect(() => {
        if (multi_select) {
            if (custom.length > 0) 
                onChange([...selected, custom]);
            else
                onChange(selected);
        } else {
            onChange(selected);
            setIsOpen(false);
        }


        onChange(selected);
        if (multi_select || selected?.length <= 0) return;
        setIsOpen(false);
    }, [selected, custom, multi_select, onChange])

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
            if (arr[i].label === opt.label && arr[i].value === opt.value) {
                console.log('GOT INDEX', i)
                return i;
            }
        }
        return -1;
    }

    const setValue = useCallback((option) => {
        if (was_drag()) return;
        if (multi_select) {
            let index = findIndex(selected, option);
            if (index >= 0) {
                let new_selection = selected.splice(index, 1);
                console.log('A NEW SELECTION IS', index, new_selection);
                setSelected(s => s.splice(index, 1));
            } else {
                console.log('B NEW SELECTINO IS', index, [...selected, option])
                setSelected(s => [...s, option]);
            }
        } else {
            setSelected(option);
        }
    }, [selected])

    const renderOption = useCallback((option) => {
        let is_selected = false;
        if (multi_select) {
            is_selected = findIndex(selected, option) >= 0;
            console.log('RENDERRERRR', option, findIndex(selected,option))
        } else if (selected.value === option.value) {
            is_selected = true;
        }
        return (
            <div
                key={option.value}
                className={'DropDown-option ' + (is_selected ? 'is-selected' : '')}
                role='option'
                onClick={() => setValue(option)}
                onTouchEnd={() => setValue(option)}
                aria-selected={is_selected}>
                {option.label}
            </div>
        )
    }, [selected]);

    let control_text;
    if (multi_select) {
        control_text = custom;
    } else {
        control_text = typeof selected === 'string' ? selected : selected.label;
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
        <StyledDropDown id={dropID.current} theme={theme} className={(is_open ? 'is-open' : null)} ref={clickRef} size_data={[window.innerHeight, y]}>
            <div className={'DropDown-control' + (disabled ? 'DropDown-disabled' : '')} onClick={() => setIsOpen(is => !is)} aria-haspopup='listbox'>
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
    // Allow multiple options to be selected at the same time
    multi_select: PropTypes.bool,
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