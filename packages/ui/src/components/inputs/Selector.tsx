import { useCallback } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Chip } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/styles';
import isArray from 'lodash/isArray';
import isEqual from 'lodash/isEqual';

const useStyles = makeStyles(() => ({
    fullWidth: {
        width: '-webkit-fill-available',
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
}));

interface Props {
    options: any[];
    selected: any;
    handleChange: () => any;
    fullWidth?: boolean;
    multiple?: boolean;
    inputAriaLabel?: string;
    noneOption?: boolean;
    label?: string;
    color?: string;
}

export const Selector = ({
    options,
    selected,
    handleChange,
    fullWidth = false,
    multiple = false,
    inputAriaLabel = 'select-label',
    noneOption = false,
    label = 'Select',
    color,
    ...props
}: Props) => {
    const classes = useStyles();
    const theme = useTheme();
    const displayColor = color ?? theme.palette.background.contrastText;

    // Formats selected into label/value object array.
    // options - Formatted options (array of label/value pairs)
    const formatSelected = useCallback((options) => {
        const select_arr = isArray(selected) ? selected : [selected];
        if (!Array.isArray(options)) return select_arr;
        let formatted_select = [];
        for (const curr_select of select_arr) {
            for (const curr_option of options) {
                if (isEqual(curr_option.value, curr_select)) {
                    formatted_select.push({
                        label: curr_option.label,
                        value: curr_select
                    })
                }
            }
        }
        return formatted_select;
    }, [selected])

    let options_formatted = options?.map(o => (
        (o && o.label) ? o :
            {
                label: o,
                value: o
            }
    )) || [];
    let selected_formatted = formatSelected(options_formatted);

    function getOptionStyle(label) {
        return {
            fontWeight:
                options_formatted.find(o => o.label === label)
                    ? theme.typography.fontWeightRegular
                    : theme.typography.fontWeightMedium,
        };
    }

    return (
        <FormControl 
            variant="outlined" 
            className={`${fullWidth ? classes.fullWidth : ''}`}
        >
            <InputLabel id={inputAriaLabel} shrink={selected_formatted?.length > 0} style={{color: displayColor}}>{label}</InputLabel>
            <Select
                style={{color: displayColor}}
                labelId={inputAriaLabel}
                value={selected}
                onChange={handleChange}
                label={label}
                renderValue={() => {
                    return multiple ? (
                        <div className={classes.chips}>
                            {selected_formatted.map((o) => (
                                <Chip label={o.label} key={o.value} className={classes.chip} />
                            ))}
                        </div>
                    ) : selected_formatted ? selected_formatted[0].label : ''
                }}
                {...props}
            >
                {noneOption ? <MenuItem value="">
                    <em>None</em>
                </MenuItem> : null}
                {options_formatted.map((o) => (
                    <MenuItem key={o.label} value={o.value} style={getOptionStyle(o.label)}>
                        {o.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}