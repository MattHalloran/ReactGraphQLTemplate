// This page gives the admin the ability to:
// 1) Delete existing SKUs
// 2) Edit existing SKU data, including general plant info, availability, etc.
// 3) Create a new SKU, either from scratch or by using plant species info

import React, { useState } from 'react';
import { uploadAvailabilityMutation } from 'graphql/mutation';
import { plantsQuery, traitOptionsQuery } from 'graphql/query';
import { useQuery, useMutation } from '@apollo/client';
import { PUBS, PubSub, SORT_OPTIONS } from 'utils';
import {
    AdminBreadcrumbs,
    EditPlantDialog,
    Dropzone,
    PlantCard,
    Selector,
    SearchBar
} from 'components';
import {
    FormControlLabel,
    Grid,
    Switch,
    Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { mutationWrapper } from 'graphql/utils/wrappers';
import { useTheme } from '@emotion/react';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    },
    cardFlex: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        alignItems: 'stretch',
    },
    plantSelector: {
        marginBottom: '1em',
    },
}));

function AdminInventoryPage() {
    const classes = useStyles();
    const theme = useTheme();
    const [showActive, setShowActive] = useState(true);
    const [searchString, setSearchString] = useState('');
    // Selected plant data. Used for popup. { plant, selectedSku }
    const [selected, setSelected] = useState(null);

    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
    const { data: traitOptions } = useQuery(traitOptionsQuery);
    const { data: plantData } = useQuery(plantsQuery, { variables: { sortBy, searchString, active: showActive }, pollInterval: 5000 });
    const [uploadAvailability, { loading }] = useMutation(uploadAvailabilityMutation);

    const availabilityUpload = (acceptedFiles) => {
        mutationWrapper({
            mutation: uploadAvailability,
            data: { variables: { file: acceptedFiles[0] } },
            onSuccess: () => PubSub.publish(PUBS.AlertDialog, {
                message: 'Availability uploaded. This process can take up to 30 seconds. The page will update automatically. Please be patient💚',
                firstButtonText: 'OK',
            }),
        })
    }

    return (
        <div id="page">
            <EditPlantDialog
                plant={selected?.plant}
                selectedSku={selected?.selectedSku}
                trait_options={traitOptions?.traitOptions}
                open={selected !== null}
                onClose={() => setSelected(null)} />
            <AdminBreadcrumbs textColor={theme.palette.secondary.dark} />
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Manage Inventory</Typography>
            </div>
            <h3>This page has the following features:</h3>
            <p>👉 Upload availability from a spreadsheet</p>
            <p>👉 Edit/Delete an existing plant</p>
            <p>👉 Add/Edit/Delete SKUs</p>
            <div>
                {/* <Button onClick={() => editSku({})}>Create new plant</Button> */}
            </div>
            <Dropzone
                dropzoneText={'Drag \'n\' drop availability file here or click'}
                maxFiles={1}
                acceptedFileTypes={['.csv', '.xls', '.xlsx', 'text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/x-csv', 'application/x-csv', 'text/comma-separated-values', 'text/x-comma-separated-values']}
                onUpload={availabilityUpload}
                uploadText='Upload Availability'
                disabled={loading}
            />
            <h2>Filter</h2>
            <Grid className={classes.padBottom} container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <Selector
                        className={classes.plantSelector}
                        fullWidth
                        options={SORT_OPTIONS}
                        selected={sortBy}
                        handleChange={(e) => setSortBy(e.target.value)}
                        inputAriaLabel='sort-plants-selector-label'
                        label="Sort" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showActive}
                                onChange={(_, value) => setShowActive(value)}
                                color="secondary"
                            />
                        }
                        label={showActive ? "Active plants" : "Inactive plants"}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <SearchBar fullWidth onChange={(e) => setSearchString(e.target.value)} />
                </Grid>
            </Grid>
            <div className={classes.cardFlex}>
                {plantData?.plants?.map((plant, index) => <PlantCard key={index}
                    plant={plant}
                    onClick={setSelected} />)}
            </div>
        </div >
    );
}

AdminInventoryPage.propTypes = {
}

export { AdminInventoryPage };