import React, { useState, useEffect } from 'react'
import { StyledSearchBar } from './SearchBar.styled';
import InputText from 'components/inputs/InputText/InputText';
import SearchIcon from 'assets/img/SearchIcon';
import { PubSub } from 'utils/pubsub';
import { getTheme } from 'utils/storage';
import { PUBS } from 'utils/consts'


function SearchBar() {
    const [theme, setTheme] = useState(getTheme());
    const [input, setInput] = useState("");

    useEffect(() => {
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        return (() => {
            PubSub.unsubscribe(themeSub);
        })
    }, [])

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

}

export default SearchBar;