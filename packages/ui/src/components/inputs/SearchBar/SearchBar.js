import PropTypes from "prop-types";
import { TextField, InputAdornment, IconButton } from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';

function SearchBar({
    label = 'Search...',
    value,
    onChange,
    ...props
}) {

    return (
        <TextField
            label={label}
            value={value}
            onChange={onChange}
            InputProps={{
                endAdornment: (
                    <InputAdornment>
                        <IconButton>
                            <SearchIcon />
                        </IconButton>
                    </InputAdornment>
                )
            }}
            {...props}
        />
    );
}

SearchBar.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

export { SearchBar };