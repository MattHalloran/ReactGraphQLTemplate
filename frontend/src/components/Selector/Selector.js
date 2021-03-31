import PropTypes from 'prop-types';
import { FormControl, InputLabel, Select, MenuItem, Chip } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
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

    //Formats inputs into label array
    const justLabels = (data) => {
        let data_arr = _.isArray(data) ? data : [data];
        let label_arr = [];
        data_arr.forEach(o => {
            if (_.isString(o)) {
                label_arr.push(o)
            } else {
                label_arr.push(o?.label);
            }
        })
        return label_arr;
    }

    // Formats inputs into label/value object array
    const formatData = (data) => {
        let data_arr = _.isArray(data) ? data : [data];
        let formatted_arr = [];
        data_arr.forEach(o => {
            if (_.isString(o)) {
                formatted_arr.push({
                    label: o,
                    value: o,
                })
            } else {
                formatted_arr.push(o);
            }
        })
        return formatted_arr;
    }

    let options_labels = justLabels(options);
    let options_formatted = formatData(options);
    let selected_labels = justLabels(selected);
    let selected_formatted = formatData(selected);

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
            <InputLabel id={inputAriaLabel}>{label}</InputLabel>
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
                    ) : selected_labels
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
    selected: PropTypes.array.isRequired,
    handleChange: PropTypes.func.isRequired,
    fullWidth: PropTypes.bool,
    multiple: PropTypes.bool,
    inputAriaLabel: PropTypes.string,
    noneOption: PropTypes.bool,
    label: PropTypes.string,
}

export default Selector;