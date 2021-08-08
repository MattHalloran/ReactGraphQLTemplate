// This page gives the admin the ability to:
// 1) Delete existing SKUs
// 2) Edit existing SKU data, including general plant info, availability, etc.
// 3) Create a new SKU, either from scratch or by using plant species info

import React, { useState } from 'react';
import { uploadAvailabilityMutation } from 'graphql/mutation';
import { activePlantsQuery, inactivePlantsQuery, traitOptionsQuery } from 'graphql/query';
import { useQuery, useMutation } from '@apollo/client';
import { PUBS, PubSub, SORT_OPTIONS } from 'utils';
import {
    AdminBreadcrumbs,
    EditPlantDialog,
    Dropzone,
    PlantCard,
    Selector,
    TabPanel
} from 'components';
import { 
    AppBar, 
    Tab, 
    Tabs, 
    Typography 
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    },
    toggleBar: {
        background: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
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

let copy = SORT_OPTIONS.slice();
const SKU_SORT_OPTIONS = copy.splice(0, 2);

function AdminInventoryPage() {
    const classes = useStyles();
    const [currTab, setCurrTab] = useState(0);
    // Selected plant data. Used for popup
    const [currPlant, setCurrPlant] = useState(null);

    const [sortBy, setSortBy] = useState(SKU_SORT_OPTIONS[0].value);
    const { data: traitOptions } = useQuery(traitOptionsQuery);
    const { data: activePlants } = useQuery(activePlantsQuery, { variables: { sortBy: sortBy } });
    const { data: inactivePlants } = useQuery(inactivePlantsQuery, { variables: { sortBy: sortBy } });
    const [uploadAvailability, { loading }] = useMutation(uploadAvailabilityMutation);

    const availabilityUpload = (acceptedFiles) => {
        uploadAvailability({
            variables: {
                file: acceptedFiles[0]
            }
        })
            .then((response) => {
                PubSub.publish(PUBS.AlertDialog, {
                    message: 'Availability uploaded. This process can take up to 30 seconds. Please manually refresh the page to see results',
                    firstButtonText: 'OK',
                });
                PubSub.publish(PUBS.Loading, false);
            })
            .catch((response) => {
                console.error(response);
                PubSub.publish(PUBS.Loading, false);
                PubSub.publish(PUBS.Snack, { message: response.message ?? 'Unknown error occurred', severity: 'error' });
            })
    }

    // const deleteSku = (sku) => {
    //     if (!window.confirm('SKUs can be hidden from the shopping page. Are you sure you want to permanently delete this SKU?')) return;
    //     modifySku(sku.sku, 'DELETE', {})
    //         .then((response) => {
    //             //TODO update list to reflect status chagne
    //             console.log('TODOOO')
    //         })
    //         .catch((error) => {
    //             console.error(error);
    //             alert("Failed to delte sku");
    //         });
    // }

    // const editSku = (sku_data) => {
    //     setCurrPlant(sku_data);
    // }

    // const hideSku = (sku) => {
    //     let operation = sku.status === 'ACTIVE' ? 'HIDE' : 'UNHIDE';
    //     modifySku(sku.sku, operation, {})
    //         .then((response) => {
    //             //TODO update list to reflect status chagne
    //             console.log('TODOOO')
    //         })
    //         .catch((error) => {
    //             console.error("Failed to modify sku", error);
    //         });
    // }

    return (
        <div id="page">
            <EditPlantDialog
                plant={currPlant}
                trait_options={traitOptions?.traitOptions}
                open={currPlant !== null}
                onClose={() => setCurrPlant(null)} />
            <AdminBreadcrumbs />
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Manage Inventory</Typography>
            </div>
            <h3>This page has the following features:</h3>
            <ul>
                <li>Upload availability from a spreadsheet</li>
                <li>Create a new SKU, either from scratch or with a plant template</li>
                <li>Edit an existing SKU</li>
                <li>Delete a SKU</li>
            </ul>
            <div>
                {/* <Button onClick={() => editSku({})}>Create new plant</Button> */}
            </div>
            <Dropzone
                dropzoneText={'Drag \'n\' drop upload availability file here or click'}
                maxFiles={1}
                acceptedFileTypes={['application/vnd.ms-excel']}
                onUpload={availabilityUpload}
                uploadText='Upload Availability'
                cancelText='Cancel Upload'
                disabled={loading}
            />
            <h2>Sort</h2>
            <Selector
                className={classes.plantSelector}
                fullWidth
                options={currTab === 0 ? SORT_OPTIONS : SKU_SORT_OPTIONS}
                selected={sortBy}
                handleChange={(e) => setSortBy(e.target.value)}
                inputAriaLabel='sort-plants-selector-label'
                label="Sort" />
            <AppBar className={classes.toggleBar} position="static">
                <Tabs value={currTab} onChange={(_, value) => setCurrTab(value)} aria-label="simple tabs example">
                    <Tab label="Plants with active SKUs" id='plants-with-active-skus-tab' aria-controls='plants-tabpanel-1' />
                    <Tab label="Plants without active SKUs" id='plants-without-active-skus-tab' aria-controls='plants-tabpanel-2' />
                </Tabs>
            </AppBar>
            <TabPanel value={currTab} index={0}>
                <div className={classes.cardFlex}>
                    {inactivePlants?.inactivePlants?.map((plant, index) => <PlantCard key={index}
                        plant={plant}
                        onClick={() => setCurrPlant(plant)} />)}
                </div>
            </TabPanel>
            <TabPanel value={currTab} index={1}>
                <div className={classes.cardFlex}>
                    {activePlants?.activePlants?.map((plant, index) => <PlantCard key={index}
                        plant={plant}
                        onClick={() => setCurrPlant(plant)} />)}
                </div>
            </TabPanel>
        </div >
    );
}

AdminInventoryPage.propTypes = {
}

export { AdminInventoryPage };