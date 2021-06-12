// This page gives the admin the ability to:
// 1) Delete existing SKUs
// 2) Edit existing SKU data, including general plant info, availability, etc.
// 3) Create a new SKU, either from scratch or by using plant species info

import { useLayoutEffect, useState, useEffect } from 'react';
import { getInventory, getUnusedPlants, getInventoryFilters } from 'query/http_promises';
import { useGet, useMutate } from "restful-react";
import { Button } from '@material-ui/core';
import { lightTheme, PUBS, PubSub, SORT_OPTIONS } from 'utils';
import {
    AdminBreadcrumbs,
    EditPlantDialog,
    PlantCard,
    Selector,
    TabPanel
} from 'components';
import { Tabs, Tab, AppBar } from '@material-ui/core';
import { DropzoneArea } from 'material-ui-dropzone';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    toggleBar: {
        // background: theme.palette.primary.light,
        background: lightTheme.palette.primary.light,
        // color: theme.palette.primary.contrastText,
        color: lightTheme.palette.primary.contrastText,
    },
    cardFlex: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        alignItems: 'stretch',
    },
}));

let copy = SORT_OPTIONS.slice();
const PLANT_SORT_OPTIONS = copy.splice(0, 2);

function AdminInventoryPage({
}) {
    const classes = useStyles();
    const [currTab, setCurrTab] = useState(0);
    // Holds the selected availability file, if uploading one
    const [selected, setSelected] = useState(null);
    // Holds the list of plants with existing SKUs
    const [existing, setExisting] = useState([]);
    const [existingThumbnails, setExistingThumbnails] = useState([]);
    // Holds list of all plants
    const [all, setAll] = useState([]);
    const [allThumbnails, setAllThumbnails] = useState([]);
    // Selected plant data. Used for popup
    const [currPlant, setCurrPlant] = useState(null);
    const [trait_options, setTraitOptions] = useState(null);
    const [existing_sort_by, setExistingSortBy] = useState(SORT_OPTIONS[0].value);
    const [all_sort_by, setAllSortBy] = useState(PLANT_SORT_OPTIONS[0].value);
    let existing_image_keys = existing?.map(p => p.display_key);
    let all_image_keys = all?.map(p => p.display_key);

    useGet({
        path: "images",
        queryParams: { keys: existing_image_keys, size: 'm' },
        resolve: (response) => {
            if (response.ok) {
                setExistingThumbnails(response.images);
            }
            else
                PubSub.publish(PUBS.Snack, { message: response.message, severity: 'error' });
        }
    })

    useGet({
        path: "images",
        queryParams: { keys: all_image_keys, size: 'm' },
        resolve: (response) => {
            if (response.ok) {
                setAllThumbnails(response.images);
            }
            else
                PubSub.publish(PUBS.Snack, { message: response.message, severity: 'error' });
        }
    })

    const { mutate: uploadAvailability } = useMutate({
        verb: 'PUT',
        path: 'availability',
        resolve: (response) => {
            if (response.ok) {
                alert('Availability file uploaded! Please give the server up to 15 seconds to update the database, then refresh the page.');
            }
            else {
                console.error(response.message);
                PubSub.publish(PUBS.Snack, { message: response.message, severity: 'error' });
            }
        }
    });

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

    const fileSelectedHandler = (files) => {
        if (files.length > 0) {
            processFile(files[0]);
        } else {
            setSelected(null);
        }
    }

    const processFile = (file) => {
        let reader = new FileReader();
        reader.onloadend = () => {
            let fileData = reader.result;
            setSelected(fileData);
        }
        reader.readAsDataURL(file);
    }

    const sendAvailability = () => {
        if (!selected) return;
        let form = new FormData();
        form.append('data', selected)
        uploadAvailability(form);
    }

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
            <DropzoneArea
                acceptedFiles={['.xls']}
                dropzoneText={"Drag and drop availability file here or click"}
                onChange={fileSelectedHandler}
                showAlerts={false}
                filesLimit={1}
            />
            <Button onClick={sendAvailability}>Upload Availability</Button>
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
                        onClick={() => setCurrPlant(plant)}
                        thumbnail={existingThumbnails?.length >= index ? existingThumbnails[index] : null} />)}
                </div>
            </TabPanel>
            <TabPanel value={currTab} index={1}>
                <div className={classes.cardFlex}>
                    {all?.map((plant, index) => <PlantCard key={index}
                        plant={plant}
                        onClick={() => setCurrPlant(plant)}
                        thumbnail={allThumbnails?.length >= index ? allThumbnails[index] : null} />)}
                </div>
            </TabPanel>
        </div >
    );
}

AdminInventoryPage.propTypes = {
}

export { AdminInventoryPage };