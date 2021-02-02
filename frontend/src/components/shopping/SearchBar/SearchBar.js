import React, { useState } from 'react'
import { StyledSearchBar } from './SearchBar.styled';
import InputText from 'components/shared/inputs/InputText/InputText';
import SearchIcon from 'assets/img/SearchIcon';


function SearchBar() {
    const [input, setInput] = useState("");

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

}

export default SearchBar;