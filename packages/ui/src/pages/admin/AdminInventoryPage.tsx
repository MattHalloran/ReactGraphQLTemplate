// This page gives the admin the ability to:
// 1) Delete existing SKUs
// 2) Edit existing SKU data, including general product info, availability, etc.
// 3) Create a new SKU, either from scratch or by using product species info

import { useCallback, useState } from 'react';
import { uploadAvailabilityMutation } from 'graphql/mutation';
import { productsQuery } from 'graphql/query';
import { useQuery, useMutation } from '@apollo/client';
import { combineStyles, PUBS, SORT_OPTIONS } from 'utils';
import PubSub from 'pubsub-js';
import {
    AdminBreadcrumbs,
    EditProductDialog,
    Dropzone,
    ProductCard,
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
import { useTheme } from '@material-ui/core';
import { mutationWrapper } from 'graphql/utils/wrappers';
import { pageStyles } from '../styles';
import { products, productsVariables } from 'graphql/generated/products';
import { uploadAvailability } from 'graphql/generated/uploadAvailability';

const componentStyles = () => ({
    cardFlex: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        alignItems: 'stretch',
    },
    productSelector: {
        marginBottom: '1em',
    },
})

const useStyles = makeStyles(combineStyles(pageStyles, componentStyles));

export const AdminInventoryPage = () => {
    const classes = useStyles();
    const theme = useTheme();
    const [showActive, setShowActive] = useState(true);
    const [searchString, setSearchString] = useState('');
    // Selected product data. Used for popup. { product, selectedSku }
    const [selected, setSelected] = useState<any>(null);

    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
    const { data: productData } = useQuery<products, productsVariables>(productsQuery, { variables: { sortBy, searchString }, pollInterval: 5000 });
    const [uploadAvailability, { loading }] = useMutation<uploadAvailability>(uploadAvailabilityMutation);

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

    const clearSelected = useCallback(() => setSelected(null), []);
    const handleSort = useCallback((e) => setSortBy(e.target.value), []);
    const handleActiveToggle = useCallback((_, value) => setShowActive(value), []);
    const handleSearch = useCallback((newString) => setSearchString(newString), []);

    return (
        <div id="page">
            <EditProductDialog
                product={selected?.product}
                selectedSku={selected?.selectedSku}
                open={selected !== null}
                onClose={clearSelected} />
            <AdminBreadcrumbs textColor={theme.palette.secondary.dark} />
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Manage Inventory</Typography>
            </div>
            <h3>This page has the following features:</h3>
            <p>👉 Upload availability from a spreadsheet</p>
            <p>👉 Edit/Delete an existing product</p>
            <p>👉 Add/Edit/Delete SKUs</p>
            <div>
                {/* <Button onClick={() => editSku({})}>Create new product</Button> */}
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
                        className={classes.productSelector}
                        fullWidth
                        options={SORT_OPTIONS}
                        selected={sortBy}
                        handleChange={handleSort}
                        inputAriaLabel='sort-products-selector-label'
                        label="Sort" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showActive}
                                onChange={handleActiveToggle}
                                color="secondary"
                            />
                        }
                        label={showActive ? "Active products" : "Inactive products"}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <SearchBar fullWidth value={searchString} onChange={handleSearch} />
                </Grid>
            </Grid>
            <div className={classes.cardFlex}>
                {productData?.products?.map((product, index) => <ProductCard key={index}
                    product={product}
                    onClick={setSelected} />)}
            </div>
        </div >
    );
}