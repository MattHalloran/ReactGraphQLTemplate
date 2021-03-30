import PropTypes from "prop-types";
import { InputBase, Paper } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

function SearchBar({
    value,
    onChange,
}) {

    return (
        <Paper component="form">
            <InputBase
                placeholder="Search..."
                inputProps={{ 'aria-label': 'search inventory' }}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
            <SearchIcon />
        </Paper>
    );
}

SearchBar.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default SearchBar;