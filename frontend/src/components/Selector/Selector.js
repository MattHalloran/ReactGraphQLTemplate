import PropTypes from 'prop-types';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import _ from 'underscore';

const useStyles = makeStyles((theme) => ({
    root: {
    },
    fullWidth: {
        width: '-webkit-fill-available',
    },
}));

function Selector({
    options,
    selected,
    handleChange,
    fullWidth = false,
    inputAriaLabel = 'select-label',
    noneOption = false,
    label = 'Select',
    ...props
}) {
    const classes = useStyles();
    const theme = useTheme();

    // Apply consistent formatting to data
    let item_data = [];
    options.forEach(o => {
        if (_.isString(o)) {
            item_data.push({
                label: o,
                value: o,
            })
        } else {
            item_data.push(o);
        }
    })

    //Makes checking if item is selected easier
    let selected_array = selected;
    if (!_.isArray(selected)) {
        selected_array = [selected];
    }
    let selected_values = [];
    selected_array.forEach(o => {
        if (_.isString(o)) {
            selected_values.push(o)
        } else {
            selected_values.push(o.value);
        }
    })

    function getOptionStyle(value) {
        return {
            fontWeight:
                selected_values.indexOf(value) === -1
                    ? theme.typography.fontWeightRegular
                    : theme.typography.fontWeightMedium,
        };
    }

    return (
        <FormControl variant="outlined" className={`${classes.root} ${fullWidth ? classes.fullWidth : ''}`}>
            <InputLabel id={inputAriaLabel}>{label}</InputLabel>
            <Select
                labelId={inputAriaLabel}
                value={selected}
                onChange={handleChange}
                label={label}
                {...props}
            >
                {noneOption ? <MenuItem value="">
                    <em>None</em>
                </MenuItem> : null}
                {item_data.map((o) => (
                    <MenuItem key={o.label} value={o.value} style={getOptionStyle(o.value)}>
                        {o.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

Selector.propTypes = {
    options: PropTypes.array.isRequired,
    selected: PropTypes.array.isRequired,
    handleChange: PropTypes.func.isRequired,
    inputAriaLabel: PropTypes.string,
    noneOption: PropTypes.bool,
    label: PropTypes.string,
}

export default Selector;