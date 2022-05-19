import { useState, useEffect, useCallback } from 'react';
import {
    SearchBar,
    Selector
} from 'components';
import { ShoppingList } from '../components/shopping/ShoppingList';
import { SORT_OPTIONS, PUBS } from 'utils';
import PubSub from 'pubsub-js';
import { traitOptionsQuery } from 'graphql/query';
import { useQuery } from '@apollo/client';
import { Grid, Button, Drawer, Theme } from '@material-ui/core';
import {
    Close as CloseIcon,
    FilterList as FilterListIcon,
    Print as PrintIcon,
    Restore as RestoreIcon
} from '@material-ui/icons';
import { printAvailability } from 'utils';
import { makeStyles } from '@material-ui/styles';
import { traitOptions } from 'graphql/generated/traitOptions';

const useStyles = makeStyles((theme: Theme) => ({
    drawerPaper: {
        background: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
        borderRight: `2px solid ${theme.palette.text.primary}`,
        padding: theme.spacing(1),
    },
    formControl: {
        display: 'flex',
        justifyContent: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    padBottom: {
        marginBottom: theme.spacing(2),
    },
}));

interface Props {
    onSessionUpdate: () => any;
    business: any;
    cart: any;
}

export const ShoppingPage = ({
    onSessionUpdate,
    business,
    cart,
}: Props) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const { data: traitOptionsData } = useQuery<traitOptions>(traitOptionsQuery);
    const [traitOptions, setTraitOptions] = useState({});
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
    const [searchString, setSearchString] = useState('');

    useEffect(() => {
        let openSub = PubSub.subscribe(PUBS.ArrowMenuOpen, (_, b) => {
            setOpen(open => b === 'toggle' ? !open : b);
        });
        return () => { PubSub.unsubscribe(openSub) };
    }, [])

    useEffect(() => {
        let traitOptions = {};
        for (const option of traitOptionsData?.traitOptions ?? []) {
            traitOptions[option.name] = option.values;
        }
        setTraitOptions(traitOptions);
    }, [traitOptionsData])

    const handleFiltersChange = useCallback((name, value) => {
        let modified_filters = { ...filters };
        modified_filters[name] = value;
        setFilters(modified_filters)
    }, [filters])

    const traitOptionsToSelector = useCallback((field, title) => {
        if (!traitOptions) return;
        let options = traitOptions[field];
        if (!options || !Array.isArray(options) || options.length <= 0) return null;
        let selected = filters ? filters[field] : '';
        return (
            <Selector
                className={classes.padBottom}
                fullWidth
                options={options}
                selected={selected || ''}
                handleChange={(e) => handleFiltersChange(field, e.target.value)}
                inputAriaLabel={`${field}-selector-label`}
                label={title} />
        )
    }, [classes.padBottom, traitOptions, filters, handleFiltersChange])

    const resetSearchConstraints = () => {
        setSortBy(SORT_OPTIONS[0].value)
        setSearchString('')
        setFilters({});
    }

    let optionsContainer = (
        <Grid className={classes.padBottom} container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Button
                    fullWidth
                    color="secondary"
                    startIcon={<RestoreIcon />}
                    onClick={resetSearchConstraints}
                >Reset</Button>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Button
                    fullWidth
                    color="secondary"
                    startIcon={<CloseIcon />}
                    onClick={() => PubSub.publish(PUBS.ArrowMenuOpen, false)}
                >Close</Button>
            </Grid>
        </Grid>
    );

    const traitList = [
        ['hasWarpDrive', 'Has Warp Drive?'],
        ['note', 'Note'],
        ['topSpeed', 'Top Speed'],
    ]

    const closeFilter = useCallback(() => PubSub.publish(PUBS.ArrowMenuOpen, false), []);
    const toggleFilterOpen = useCallback(() => PubSub.publish(PUBS.ArrowMenuOpen, 'toggle'), []);

    const onSortChange = useCallback((e) => setSortBy(e.target.value), []);
    const onSearchChange = useCallback((newString) => setSearchString(newString), []);
    const availabilityPrint = useCallback(() => printAvailability(true, business?.BUSINESS_NAME?.Long), [business?.BUSINESS_NAME?.Long]);

    return (
        <div id='page'>
            <Drawer classes={{ paper: classes.drawerPaper }} anchor="left" open={open} onClose={closeFilter}>
                {optionsContainer}
                <Selector
                    fullWidth
                    options={SORT_OPTIONS}
                    selected={sortBy}
                    handleChange={onSortChange}
                    inputAriaLabel='sort-selector-label'
                    label="Sort" />
                <h2>Search</h2>
                <SearchBar className={classes.padBottom} fullWidth debounce={300} value={searchString} onChange={onSearchChange} />
                <h2>Filters</h2>
                {traitList.map(d => traitOptionsToSelector(d[0], d[1]))}
                {optionsContainer}
            </Drawer>
            <div className={classes.formControl}>
                <Button
                    color="secondary"
                    startIcon={<FilterListIcon />}
                    onClick={toggleFilterOpen}
                >Filter</Button>
                <Button
                    color="secondary"
                    startIcon={<PrintIcon />}
                    onClick={availabilityPrint}
                >Print</Button>
            </div>
            <ShoppingList
                onSessionUpdate={onSessionUpdate}
                cart={cart}
                sortBy={sortBy}
                filters={filters}
                searchString={searchString}
            />
        </div>
    );
}