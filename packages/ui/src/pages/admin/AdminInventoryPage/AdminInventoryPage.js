// This page gives the admin the ability to:
// 1) Delete existing SKUs
// 2) Edit existing SKU data, including general plant info, availability, etc.
// 3) Create a new SKU, either from scratch or by using plant species info

import React, { useLayoutEffect, useState, useEffect } from 'react';
import { getInventory, getUnusedPlants, getInventoryFilters } from 'query/http_promises';
import { uploadAvailabilityMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { PUBS, PubSub, SORT_OPTIONS } from 'utils';
import {
    AdminBreadcrumbs,
    EditPlantDialog,
    Dropzone,
    PlantCard,
    Selector,
    TabPanel
} from 'components';
import { Tabs, Tab, AppBar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    toggleBar: {
        background: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
    },
    cardFlex: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        alignItems: 'stretch',
    },
}));

let copy = SORT_OPTIONS.slice();
const PLANT_SORT_OPTIONS = copy.splice(0, 2);

function AdminInventoryPage() {
    const classes = useStyles();
    const [currTab, setCurrTab] = useState(0);
    // Holds the list of plants with existing SKUs
    const [existing, setExisting] = useState([]);
    // Holds list of all plants
    const [all, setAll] = useState([]);
    // Selected plant data. Used for popup
    const [currPlant, setCurrPlant] = useState(null);
    const [trait_options, setTraitOptions] = useState(null);
    const [existing_sort_by, setExistingSortBy] = useState(SORT_OPTIONS[0].value);
    const [all_sort_by, setAllSortBy] = useState(PLANT_SORT_OPTIONS[0].value);
    const [uploadAvailability, { loading }] = useMutation(uploadAvailabilityMutation);

    const availabilityUpload = (acceptedFiles) => {
        uploadAvailability({
            variables: {
                files: acceptedFiles[0]
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

    useEffect(() => {
        getInventory(existing_sort_by, 0, true)
            .then((response) => {
                setExisting(response.page_results);
                console.log('SET all plantsssssssssss', response.page_results)
            })
            .catch((error) => {
                console.error("Failed to load inventory", error);
                alert(error.error);
            });
    }, [existing_sort_by])

    useEffect(() => {
        getUnusedPlants(all_sort_by)
            .then((response) => {
                setAll(response.plants);
            })
            .catch((error) => {
                console.error("Failed to load plants", error);
            });
    }, [all_sort_by])

    useLayoutEffect(() => {
        let mounted = true;
        getInventoryFilters()
            .then((response) => {
                if (!mounted) return;
                console.log('GOT TRAIT OPTIONS', response);
                setTraitOptions(response);
            })
            .catch((error) => {
                console.error("Failed to load filters", error);
            });

        return () => mounted = false;
    }, [])

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

    const handleSort = (value) => {
        if (currTab === 0) {
            setExistingSortBy(value);
        } else {
            setAllSortBy(value);
        }
    }

    return (
        <div id="page">
            <EditPlantDialog
                plant={currPlant}
                trait_options={trait_options}
                open={currPlant !== null}
                onClose={() => setCurrPlant(null)} />
            <AdminBreadcrumbs />
            <h1>Welcome to the inventory manager!</h1>
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
                fullWidth
                options={currTab === 0 ? SORT_OPTIONS : PLANT_SORT_OPTIONS}
                selected={currTab === 0 ? existing_sort_by : all_sort_by}
                handleChange={(e) => handleSort(e.target.value)}
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
                    {existing?.map((plant, index) => <PlantCard key={index}
                        plant={plant}
                        onClick={() => setCurrPlant(plant)} />)}
                </div>
            </TabPanel>
            <TabPanel value={currTab} index={1}>
                <div className={classes.cardFlex}>
                    {all?.map((plant, index) => <PlantCard key={index}
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