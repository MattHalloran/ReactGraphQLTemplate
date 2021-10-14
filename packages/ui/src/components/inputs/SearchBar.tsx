import React from 'react';
import { TextField, InputAdornment, IconButton } from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

interface Props {
    label?: string;
    value: string;
    onChange: (updatedText: string) => any;
    debounce?: number;
}

export const SearchBar = ({
    label = 'Search...',
    value,
    onChange,
    debounce = 50,
    ...props
}: Props) => {

    const onChangeDebounced = AwesomeDebouncePromise(
        onChange,
        debounce,
    );

    return (
        <TextField
            label={label}
            value={value}
            onChange={onChangeDebounced}
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