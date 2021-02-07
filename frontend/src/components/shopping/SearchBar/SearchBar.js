import React, { useState } from 'react'
import PropTypes from 'prop-types';
import { StyledSearchBar } from './SearchBar.styled';
import InputText from 'components/shared/inputs/InputText/InputText';
import SearchIcon from 'assets/img/SearchIcon';
import { getTheme } from 'storage';


function SearchBar({
    theme = getTheme(),
}) {
    const [input, setInput] = useState("");

    return (
        <StyledSearchBar theme={theme}>
             <InputText
                label="Search"
                type="text"
                icon={SearchIcon}
                value={input}
                valueFunc={setInput}
            />
        </StyledSearchBar >
    );
}

SearchBar.propTypes = {
    theme: PropTypes.object,
}

export default SearchBar;