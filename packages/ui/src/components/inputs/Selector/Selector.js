import PropTypes from 'prop-types';
import { FormControl, InputLabel, Select, MenuItem, Chip } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/styles';
import _ from 'underscore';

const useStyles = makeStyles((theme) => ({
    root: {
    },
    fullWidth: {
        width: '-webkit-fill-available',
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
}));

function Selector({
    options,
    selected,
    handleChange,
    fullWidth = false,
    multiple = false,
    inputAriaLabel = 'select-label',
    noneOption = false,
    label = 'Select',
    ...props
}) {
    const classes = useStyles();
    const theme = useTheme();

    // Formats selected into label/value object array.
    // Needs formatted options to get missing labels
    const formatSelected = (selected, options) => {
        let select_arr = _.isArray(selected) ? selected : [selected];
        let formatted_select = [];
        for (let i = 0; i < select_arr.length; i++) {
            let curr_select = select_arr[i];
            let curr_select_val = (_.isString(curr_select) || _.isNumber(curr_select)) ? curr_select : curr_select?.value;
            for(let j = 0; j < options.length; j++) {
                let curr_option = options[j];
                if (curr_option.value === curr_select_val) {
                    formatted_select.push({
                        label: curr_option.label,
                        value: curr_select_val,
                    });
                }
            }
        }
        return formatted_select;
    }

    let options_formatted = options.map(o => (
        (_.isString(o) || _.isNumber(o)) ?
                {
                    label: o,
                    value: o
                } : o
    ));
    let options_labels = options_formatted.map(o => o.label);
    let selected_formatted = formatSelected(selected, options_formatted);
    let selected_labels = selected_formatted.map(s => s.label);

    function getOptionStyle(label) {
        return {
            fontWeight:
                options_labels.indexOf(label) === -1
                    ? theme.typography.fontWeightRegular
                    : theme.typography.fontWeightMedium,
        };
    }

    return (
        <FormControl variant="outlined" className={`${classes.root} ${fullWidth ? classes.fullWidth : ''}`}>
            <InputLabel id={inputAriaLabel} shrink={selected_labels.length > 0}>{label}</InputLabel>
            <Select
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
                    ) : selected_labels[0]
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

Selector.propTypes = {
    options: PropTypes.array.isRequired,
    selected: PropTypes.any.isRequired,
    handleChange: PropTypes.func.isRequired,
    fullWidth: PropTypes.bool,
    multiple: PropTypes.bool,
    inputAriaLabel: PropTypes.string,
    noneOption: PropTypes.bool,
    label: PropTypes.string,
}

export { Selector };