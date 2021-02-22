import styled from 'styled-components';

//Determines if the menu opens above the dropdown or below.
//Defaults to below
const getMenuStyle = (data, num_options) => {
    let window_height = data[0];
    let control_y = data[1];
    let space_below = window_height - control_y;
    if (space_below < ((num_options+1) * 35)) {
        return `
            max-height: ${control_y - 40 - 50}px;
            bottom: 100%;
            border-radius: 10px 10px 0 0;
        `
    }
    return `
        max-height: ${window_height - control_y - 50}px;
        top: 100%;
        border-radius: 0 0 10px 10px;
    `
}

export const StyledDropDown = styled.div`
    position: relative;
    background-color: rgba(255,255,255,0.3);
    border: 1px solid black;
    height: 40px;
    border-radius: 10px;
    margin-bottom: 20px;
    user-select: none;

    :hover {
        background-color: rgba(255, 255, 255, 0.45);
        box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.05);
    }
    
    .DropDown-control {
        position: relative;
        overflow: hidden;
        background-color: transparent;
        border: 1px solid #ccc;
        border-radius: 10px;
        border: none;
        box-sizing: border-box;
        color: #333;
        cursor: default;
        outline: none;
        padding: 8px 52px 8px 10px;
        transition: all 200ms ease;
    }
    
    .DropDown-control:hover {
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
    }

    .DropDown-custom {
        width: 100%;
        width: -moz-fit-content;
        width: -webkit-fill-available;
        background: transparent;
        text-align: center;
        border: 1px solid ivory;
    }
    
    .DropDown-arrow {
        width: 0;
        height: 0;
        border: 5px solid transparent;
        ${({ is_open }) => is_open? 'border-bottom: 5px solid black' : 'border-top: 5px solid black'};
        content: ' ';
        display: block;
        position: absolute;
        right: 10px;
        top: ${({ is_open }) => is_open? '14px' : '19px'};
    }
    
    .DropDown-menu {
        border: 1px solid black;
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
        box-sizing: border-box;
        overflow-y: auto;
        position: absolute;
        width: 100%;
        z-index: 1000;
        -webkit-overflow-scrolling: touch;
        margin-top: -1px;
        ${({ size_data, num_options }) => getMenuStyle(size_data, num_options)};
    }
    
    .DropDown-option {
        background-color: ${({ theme }) => theme.bodySecondary};
        border-bottom: 1px solid darkgreen;
        box-sizing: border-box;
        cursor: pointer;
        display: block;
        padding: 8px 10px;
    }
    
    .DropDown-option:last-child {
        border-bottom-right-radius: 2px;
        border-bottom-left-radius: 2px;
    }
    
    .DropDown-option:hover {
        background-color: ${({ theme }) => theme.hoverPrimary};
        color: #333;
    }
    
    .DropDown-option.is-selected {
        background-color: #f2f9fc;
        color: #333;
    }
    
    .DropDown-noresults {
        box-sizing: border-box;
        color: #ccc;
        cursor: default;
        display: block;
        padding: 8px 10px;
    }
`;