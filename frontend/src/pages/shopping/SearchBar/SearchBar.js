import { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import { StyledSearchBar } from './SearchBar.styled';
import InputText from 'components/inputs/InputText/InputText';
import SearchIcon from 'assets/img/SearchIcon';

function SearchBar({
    onChange
}) {
    const [input, setInput] = useState("");

    useEffect(() => {
        onChange(input);
    }, [input])

    return (
        <StyledSearchBar>
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
    onChange: PropTypes.func.isRequired,
}

export default SearchBar;