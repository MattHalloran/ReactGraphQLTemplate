import { TextField } from '@material-ui/core';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

interface Props {
    label?: string;
    value: string;
    onChange: (updatedText: string) => any;
    debounce?: number;
    fullWidth?: boolean;
    className?: string;
}

export const SearchBar = ({
    label = 'Search...',
    value,
    onChange,
    debounce = 50,
    fullWidth = false,
    className,
    ...props
}: Props) => {

    return (
        <TextField
            className={className}
            label={label}
            value={value}
            onChange={() => AwesomeDebouncePromise(onChange, debounce)}
            fullWidth={fullWidth}
            InputProps={{
                // endAdornment: (
                //     <InputAdornment>
                //         <IconButton>
                //             <SearchIcon />
                //         </IconButton>
                //     </InputAdornment>
                // )
            }}
            {...props}
        />
    );
}