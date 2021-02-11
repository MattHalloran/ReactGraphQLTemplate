import styled from 'styled-components';

const getMaxMenuHeight = (data) => {
    let window_height = data[0];
    let control_y = data[1];
    console.log('MAX MENU HEIGHTTT', data);
    return `${window_height - control_y - 50}px`;
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
        border-color: black transparent transparent;
        border-style: solid;
        border-width: 5px 5px 0;
        content: ' ';
        display: block;
        height: 0;
        margin-top: -ceil(2.5);
        position: absolute;
        right: 10px;
        top: 14px;
        width: 0
    }
    
    .is-open .DropDown-arrow {
        border-color: transparent transparent black;
        border-width: 0 5px 5px;
    }
    
    .DropDown-menu {
        border: 1px solid black;
        border-radius: 0 0 10px 10px;
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
        box-sizing: border-box;
        margin-top: -1px;
        max-height: ${({ size_data }) => getMaxMenuHeight(size_data)};
        overflow-y: auto;
        position: absolute;
        top: 100%;
        width: 100%;
        z-index: 1000;
        -webkit-overflow-scrolling: touch;
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